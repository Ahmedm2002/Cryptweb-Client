import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../socket/useSocket";

function useFileTransfer(friendEmail, user) {
  const { subscribeToDataChannel, sendDataViaWebRTC } = useSocket();

  const [selectedFile, setSelectedFile] = useState(null);
  const [incomingFile, setIncomingFile] = useState(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const [receivedBlob, setReceivedBlob] = useState(null);
  const [transferSpeed, setTransferSpeed] = useState(0);

  const incomingChunks = useRef([]);
  const startTime = useRef(null);

  const assembleBlob = (base64Chunks) => {
    const byteArrays = [];
    for (let chunk of base64Chunks) {
      const byteCharacters = atob(chunk);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays);
  };

  const onMessage = useCallback((msgStr) => {
    try {
      const msg = JSON.parse(msgStr);

      if (msg.type === "metadata") {
        setIncomingFile({
          name: msg.fileName,
          size: msg.fileSize,
          type: msg.fileType,
          totalChunks: msg.totalChunks,
        });
    incomingChunks.current = [];
    startTime.current = null;
    setTransferSpeed(0);
        setTransferProgress(0);
        setIsTransferring(true);
        setTransferComplete(false);
        startTime.current = Date.now();
        setTransferSpeed(0);
      } else if (msg.type === "chunk" || msg.data) {
        incomingChunks.current.push(msg.data);

        const currentProgress = Math.round(
          (msg.chunkId / msg.totalChunks) * 100,
        );
        setTransferProgress(currentProgress);

        if (startTime.current && incomingFile?.size) {
          const elapsed = (Date.now() - startTime.current) / 1000;
          if (elapsed > 0) {
            const bytesSoFar = (currentProgress / 100) * incomingFile.size;
            setTransferSpeed(bytesSoFar / elapsed);
          }
        }

        if (msg.isCompleted) {
          setIsTransferring(false);
          setTransferComplete(true);
          const blob = assembleBlob(incomingChunks.current);
          setReceivedBlob(blob);
        }
      }
    } catch (err) {
      console.error("Error processing data channel message", err);
    }
  }, []);

  useEffect(() => {
    if (subscribeToDataChannel) {
      subscribeToDataChannel(onMessage);
    }
  }, [subscribeToDataChannel, onMessage]);

  const sendSecuredFile = () => {
    if (!selectedFile) return;

    setIsTransferring(true);
    setTransferProgress(0);
    setTransferComplete(false);
    startTime.current = Date.now();
    setTransferSpeed(0);

    const CHUNK_SIZE = 16384;
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);

    sendDataViaWebRTC(
      JSON.stringify({
        type: "metadata",
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        totalChunks,
      }),
    );

    let chunkId = 0;
    let offset = 0;

    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      const isCompleted = chunkId === totalChunks - 1;

      sendDataViaWebRTC(
        JSON.stringify({
          chunkId: chunkId + 1,
          totalChunks,
          data: base64Data,
          isCompleted,
        }),
      );

      chunkId++;
      offset += CHUNK_SIZE;
      const progress = Math.round((chunkId / totalChunks) * 100);
      setTransferProgress(progress);

      if (startTime.current) {
        const elapsed = (Date.now() - startTime.current) / 1000;
        if (elapsed > 0) {
          setTransferSpeed(offset / elapsed);
        }
      }

      if (offset < selectedFile.size) {
        setTimeout(readNextChunk, 5);
      } else {
        setIsTransferring(false);
        setTransferComplete(true);
      }
    };

    const readNextChunk = () => {
      const slice = selectedFile.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    readNextChunk();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setIncomingFile(null);
    setTransferProgress(0);
    setIsTransferring(false);
    setTransferComplete(false);
    setReceivedBlob(null);
    incomingChunks.current = [];
  };

  const downloadFile = () => {
    if (receivedBlob && incomingFile) {
      const url = URL.createObjectURL(receivedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = incomingFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      clearFile();
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    transferProgress,
    isTransferring,
    incomingFile,
    transferComplete,
    transferSpeed,
    sendSecuredFile,
    downloadFile,
    clearFile,
  };
}

export { useFileTransfer };
