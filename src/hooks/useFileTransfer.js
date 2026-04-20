import { useState, useRef, useEffect, useCallback } from "react";
import { rtcConnection } from "../components/configs/webrtc.config";
import { api } from "../services/api";

const CHUNK_SIZE = 16384; // 16KB

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export const useFileTransfer = (friendEmail, user) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSpeed, setTransferSpeed] = useState(0);
  const [incomingFile, setIncomingFile] = useState(null);
  const [totalReceivedSize, setTotalReceivedSize] = useState(0);

  const incomingFileRef = useRef(null);
  const receivedChunksRef = useRef([]);
  const dataChannelRef = useRef(null);
  const startTimeRef = useRef(null);
  const receivedSizeRef = useRef(0);
  const [transferComplete, setTransferComplete] = useState(false);

  const setupChannel = useCallback((channel) => {
    console.log("Setting up data channel:", channel.label);
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = 65536; // 64KB target buffer
    dataChannelRef.current = channel;

    const onOpen = () => console.log("Data channel is OPEN");
    const onClose = () => {
      console.log("Data channel is CLOSED");
      setIsTransferring(false);
    };

    const onMessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === "metadata") {
            console.log("Received file metadata:", payload);
            setIncomingFile(payload);
            incomingFileRef.current = payload;
            receivedChunksRef.current = [];
            setTotalReceivedSize(0);
            setTransferProgress(0);
            setIsTransferring(true);
            setTransferComplete(false);
            receivedSizeRef.current = 0;
            startTimeRef.current = Date.now();
          } else if (payload.type === "chunk") {
            const buffer = base64ToArrayBuffer(payload.data);
            receivedChunksRef.current.push(buffer);
            
            receivedSizeRef.current += buffer.byteLength;
            setTotalReceivedSize(receivedSizeRef.current);

            const currentMetadata = incomingFileRef.current;
            if (currentMetadata) {
              const progress = Math.round((receivedSizeRef.current / currentMetadata.size) * 100);
              setTransferProgress(progress);

              const elapsed = (Date.now() - startTimeRef.current) / 1000;
              if (elapsed > 0) {
                setTransferSpeed(receivedSizeRef.current / elapsed / 1024 / 1024);
              }

              if (payload.chunkNo + 1 >= payload.totalChunks) {
                console.log("Transfer complete on receiver side");
                setIsTransferring(false);
                setTransferComplete(true);
                saveTransferRecord(friendEmail, user, currentMetadata, startTimeRef.current);
              }
            }
          }
        } catch (e) {
          console.error("Error parsing message:", e);
        }
      }
    };

    channel.addEventListener("open", onOpen);
    channel.addEventListener("close", onClose);
    channel.addEventListener("message", onMessage);

    return () => {
      channel.removeEventListener("open", onOpen);
      channel.removeEventListener("close", onClose);
      channel.removeEventListener("message", onMessage);
    };
  }, [friendEmail, user]);

  useEffect(() => {
    let cleanup = null;
    const handleDataChannel = (event) => {
      cleanup = setupChannel(event.channel);
    };

    rtcConnection.addEventListener("datachannel", handleDataChannel);
    return () => {
      rtcConnection.removeEventListener("datachannel", handleDataChannel);
      if (cleanup) cleanup();
    };
  }, [setupChannel]);

  const sendSecuredFile = async () => {
    if (!selectedFile || !friendEmail) return;

    if (!dataChannelRef.current) {
      const channel = rtcConnection.createDataChannel("channel:file-transfer");
      setupChannel(channel);
    }

    const channel = dataChannelRef.current;
    if (channel.readyState !== "open") {
      channel.onopen = () => startTransfer(channel);
      return;
    }
    startTransfer(channel);
  };

  const startTransfer = async (channel) => {
    setIsTransferring(true);
    setTransferProgress(0);
    startTimeRef.current = Date.now();

    const metadata = {
      type: "metadata",
      name: selectedFile.name,
      size: selectedFile.size,
      mimeType: selectedFile.type,
      senderEmail: user.email,
    };
    channel.send(JSON.stringify(metadata));

    const CHUNK_SIZE = 8192; // 8KB slices to strictly avoid 16KB WebRTC string limit
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    let chunkNo = 0;
    let offset = 0;

    const readSlice = (o) => {
      const slice = selectedFile.slice(o, o + CHUNK_SIZE);
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target.result;
        // Output from readAsDataURL: "data:application/octet-stream;base64,......."
        const base64Data = dataUrl.split(",")[1];
        
        try {
          channel.send(JSON.stringify({ 
            type: "chunk",
            chunkNo, 
            totalChunks, 
            data: base64Data 
          }));
        } catch (err) {
          console.error("Failed to send chunk JSON via WebRTC:", err);
          return;
        }

        offset += slice.size;
        chunkNo++;

        const progress = Math.round((offset / selectedFile.size) * 100);
        setTransferProgress(progress);

        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed > 0) {
          setTransferSpeed(offset / elapsed / 1024 / 1024);
        }

        if (offset < selectedFile.size) {
          if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
            channel.onbufferedamountlow = () => {
              channel.onbufferedamountlow = null;
              readSlice(offset);
            };
          } else {
            // Read immediately to keep throughput high
            readSlice(offset);
          }
        } else {
          console.log("Finished sending all chunks via WebRTC.");
          setIsTransferring(false);
        }
      };

      reader.readAsDataURL(slice);
    };

    readSlice(0);
  };

  const downloadFile = () => {
    if (!incomingFile || receivedChunksRef.current.length === 0) return;
    const blob = new Blob(receivedChunksRef.current, {
      type: incomingFile.mimeType,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = incomingFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIncomingFile(null);
    incomingFileRef.current = null;
    receivedChunksRef.current = [];
    receivedSizeRef.current = 0;
    setTotalReceivedSize(0);
    setTransferProgress(0);
    setTransferComplete(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setTransferProgress(0);
    setIsTransferring(false);
    setTransferComplete(false);
  };

  return {
    selectedFile,
    setSelectedFile,
    transferProgress,
    isTransferring,
    transferSpeed,
    incomingFile,
    totalReceivedSize,
    transferComplete,
    sendSecuredFile,
    downloadFile,
    clearFile
  };
};

async function saveTransferRecord(friendEmail, user, fileMetadata, startTime) {
    try {
      const timeElapsed = (Date.now() - startTime) / 1000;
      await api.post("/file-transfers/complete", {
        senderEmail: fileMetadata.senderEmail,
        receiverEmail: user.email,
        fileName: fileMetadata.name,
        fileSize: fileMetadata.size,
        fileType: fileMetadata.mimeType || "application/octet-stream",
        timeElapsed: Math.round(timeElapsed),
        transferType: "P2P",
      });
      console.log("Transfer record saved to DB on receiver side");
    } catch (error) {
      console.error("Failed to save transfer record on receiver:", error);
    }
}
