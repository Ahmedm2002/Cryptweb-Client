import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../socket/useSocket";

const MAX_SEND_RETRIES = 5;

function useFileTransfer(friendEmail, user, peerDisconnected) {
  const { subscribeToDataChannel, sendDataViaWebRTC } = useSocket();

  const [selectedFile, setSelectedFile] = useState(null);
  const [incomingFile, setIncomingFile] = useState(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const [transferFailed, setTransferFailed] = useState(false);
  const [receivedBlob, setReceivedBlob] = useState(null);
  const [transferSpeed, setTransferSpeed] = useState(0);

  const incomingChunks = useRef([]);
  const startTime = useRef(null);
  const sendRetryCount = useRef(0);
  const cancelledRef = useRef(false);

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
        setTransferProgress(0);
        setIsTransferring(true);
        setTransferComplete(false);
        setTransferFailed(false);
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

  useEffect(() => {
    if (peerDisconnected && isTransferring) {
      cancelledRef.current = true;
      setTransferFailed(true);
      setIsTransferring(false);
      setTransferSpeed(0);
    }
  }, [peerDisconnected]);

  const sendSecuredFile = async () => {
    if (!selectedFile) return;

    cancelledRef.current = false;
    sendRetryCount.current = 0;
    setIsTransferring(true);
    setTransferProgress(0);
    setTransferComplete(false);
    setTransferFailed(false);
    startTime.current = Date.now();
    setTransferSpeed(0);

    const CHUNK_SIZE = 16384;
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);

    try {
      await sendDataViaWebRTC(
        JSON.stringify({
          type: "metadata",
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          totalChunks,
        }),
      );
    } catch {
      setTransferFailed(true);
      setIsTransferring(false);
      return;
    }

    let chunkId = 0;
    let offset = 0;

    const sendNextChunk = async () => {
      if (cancelledRef.current) return;

      const slice = selectedFile.slice(offset, offset + CHUNK_SIZE);
      const arrayBuffer = await slice.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      const isCompleted = chunkId === totalChunks - 1;

      try {
        await sendDataViaWebRTC(
          JSON.stringify({
            chunkId: chunkId + 1,
            totalChunks,
            data: base64Data,
            isCompleted,
          }),
        );

        sendRetryCount.current = 0;
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
          setTimeout(() => sendNextChunk(), 5);
        } else {
          setIsTransferring(false);
          setTransferComplete(true);
        }
      } catch {
        sendRetryCount.current++;
        if (sendRetryCount.current >= MAX_SEND_RETRIES || cancelledRef.current) {
          setTransferFailed(true);
          setIsTransferring(false);
          return;
        }
        setTimeout(() => sendNextChunk(), 200);
      }
    };

    sendNextChunk();
  };

  const retryTransfer = () => {
    setTransferFailed(false);
    setTransferProgress(0);
    sendRetryCount.current = 0;
    cancelledRef.current = false;
    setTimeout(() => sendSecuredFile(), 100);
  };

  const clearFile = () => {
    cancelledRef.current = true;
    setSelectedFile(null);
    setIncomingFile(null);
    setTransferProgress(0);
    setIsTransferring(false);
    setTransferComplete(false);
    setTransferFailed(false);
    setReceivedBlob(null);
    incomingChunks.current = [];
    startTime.current = null;
    setTransferSpeed(0);
    sendRetryCount.current = 0;
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
    transferFailed,
    transferSpeed,
    sendSecuredFile,
    retryTransfer,
    downloadFile,
    clearFile,
  };
}

export { useFileTransfer };
