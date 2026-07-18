import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../socket/useSocket";
import { api } from "../services/api.js";

const MAX_SEND_RETRIES = 5;
const CHUNK_SIZE = 65536;
const TRANSFER_TIMEOUT_MS = 60000;

function useFileTransfer(friendEmail, user, peerDisconnected) {
  const { subscribeToDataChannel, sendDataViaWebRTC, isDataChannelOpen } =
    useSocket();

  const [selectedFile, setSelectedFile] = useState(null);
  const [incomingFile, setIncomingFile] = useState(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const [transferFailed, setTransferFailed] = useState(false);
  const [receivedBlob, setReceivedBlob] = useState(null);
  const [transferSpeed, setTransferSpeed] = useState(0);

  const receivedChunksRef = useRef([]);
  const incomingFileRef = useRef(null);
  const startTimeRef = useRef(null);
  const sendRetryCount = useRef(0);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastProgressTimeRef = useRef(null);

  const clearTransferTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const resetTransferTimeout = () => {
    clearTransferTimeout();
    lastProgressTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, TRANSFER_TIMEOUT_MS);
  };

  const cleanup = useCallback(() => {
    clearTransferTimeout();
    abortControllerRef.current = null;
    sendRetryCount.current = 0;
  }, []);

  const recordTransfer = useCallback(
    ({ fileName, fileSize, fileType, transferType }) => {
      if (!user?.email || !friendEmail || !startTimeRef.current) return;

      const timeElapsed = (Date.now() - startTimeRef.current) / 1000;

      api
        .post("/v1/file-transfers/complete", {
          senderEmail: transferType === "send" ? user.email : friendEmail,
          receiverEmail: transferType === "send" ? friendEmail : user.email,
          fileName,
          fileSize,
          fileType,
          timeElapsed,
          transferType,
        })
        .catch(() => {});
    },
    [user, friendEmail],
  );

  const onMessage = useCallback(
    (data) => {
      try {
        if (typeof data === "string") {
          const msg = JSON.parse(data);

          if (msg.type === "metadata") {
            receivedChunksRef.current = [];
            incomingFileRef.current = {
              name: msg.fileName,
              size: msg.fileSize,
              type: msg.fileType,
              totalChunks: msg.totalChunks,
            };
            setIncomingFile({ ...incomingFileRef.current });
            setTransferProgress(0);
            setIsTransferring(true);
            setTransferComplete(false);
            setTransferFailed(false);
            setTransferSpeed(0);
            startTimeRef.current = Date.now();
          } else if (msg.type === "complete") {
            clearTransferTimeout();
            setIsTransferring(false);
            setTransferComplete(true);
            setTransferSpeed(0);

            const totalExpected = msg.totalChunks;
            const totalReceived = receivedChunksRef.current.length;

            if (totalReceived !== totalExpected) {
              console.error(
                `Chunk count mismatch: expected ${totalExpected}, got ${totalReceived}`,
              );
              setTransferFailed(true);
              setTransferComplete(false);
              return;
            }

            const blob = new Blob(receivedChunksRef.current, {
              type: incomingFileRef.current?.type || "application/octet-stream",
            });

            if (msg.fileSize && blob.size !== msg.fileSize) {
              console.error(
                `File size mismatch: expected ${msg.fileSize}, got ${blob.size}`,
              );
              setTransferFailed(true);
              setTransferComplete(false);
              return;
            }

            setReceivedBlob(blob);

            const fInfo = incomingFileRef.current;
            if (fInfo) {
              recordTransfer({
                fileName: fInfo.name,
                fileSize: fInfo.size,
                fileType: fInfo.type,
                transferType: "receive",
              });
            }
          }
        } else if (data instanceof ArrayBuffer) {
          if (data.byteLength < 9) return;

          const view = new DataView(data);
          const marker = view.getUint8(0);

          if (marker !== 0x01) return;

          const chunkIndex = view.getUint32(1, false);
          const totalChunks = view.getUint32(5, false);
          const raw_data = data.slice(9);

          if (
            incomingFileRef.current &&
            totalChunks !== incomingFileRef.current.totalChunks
          ) {
            console.error(
              `Total chunks mismatch in chunk ${chunkIndex}: expected ${incomingFileRef.current.totalChunks}, got ${totalChunks}`,
            );
          }

          receivedChunksRef.current.push(raw_data);

          const currentProgress = Math.round(
            ((chunkIndex + 1) / totalChunks) * 100,
          );
          setTransferProgress(currentProgress);
          resetTransferTimeout();

          if (startTimeRef.current && incomingFileRef.current?.size) {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            if (elapsed > 0.5) {
              const bytesSoFar =
                (currentProgress / 100) * incomingFileRef.current.size;
              setTransferSpeed(bytesSoFar / elapsed);
            }
          }
        }
      } catch (err) {
        console.error("Error processing data channel message", err);
      }
    },
    [],
  );

  useEffect(() => {
    subscribeToDataChannel(onMessage);
  }, [subscribeToDataChannel, onMessage]);

  useEffect(() => {
    if (peerDisconnected && isTransferring) {
      clearTransferTimeout();
      abortControllerRef.current?.abort();
      setTransferFailed(true);
      setIsTransferring(false);
      setTransferSpeed(0);
    }
  }, [peerDisconnected, isTransferring]);

  useEffect(() => {
    return () => {
      clearTransferTimeout();
    };
  }, []);

  const sendNextChunk = async (
    file,
    totalChunks,
    controller,
  ) => {
    const abortSignal = controller.signal;
    let chunkId = 0;
    let offset = 0;

    const sendChunk = async () => {
      if (abortSignal.aborted) return;
      if (!isDataChannelOpen()) {
        setTransferFailed(true);
        setIsTransferring(false);
        setTransferSpeed(0);
        cleanup();
        return;
      }

      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const arrayBuffer = await slice.arrayBuffer();

      const header = new ArrayBuffer(9);
      const headerView = new DataView(header);
      headerView.setUint8(0, 0x01);
      headerView.setUint32(1, chunkId, false);
      headerView.setUint32(5, totalChunks, false);

      const combined = new Uint8Array(9 + arrayBuffer.byteLength);
      combined.set(new Uint8Array(header), 0);
      combined.set(new Uint8Array(arrayBuffer), 9);

      try {
        await sendDataViaWebRTC(combined.buffer, {
          signal: abortSignal,
          timeoutMs: TRANSFER_TIMEOUT_MS,
        });

        sendRetryCount.current = 0;
        chunkId++;
        offset += CHUNK_SIZE;
        const progress = Math.round((chunkId / totalChunks) * 100);
        setTransferProgress(progress);
        resetTransferTimeout();

        if (startTimeRef.current) {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          if (elapsed > 0.5) {
            setTransferSpeed(offset / elapsed);
          }
        }

        if (offset < file.size && !abortSignal.aborted) {
          setTimeout(sendChunk, 0);
        } else if (!abortSignal.aborted) {
          try {
            await sendDataViaWebRTC(
              JSON.stringify({
                type: "complete",
                totalChunks,
                fileSize: file.size,
              }),
              { signal: abortSignal, timeoutMs: TRANSFER_TIMEOUT_MS },
            );
          } catch {
            if (!abortSignal.aborted) {
              console.error("Failed to send completion signal");
            }
          }

          clearTransferTimeout();
          setIsTransferring(false);
          setTransferComplete(true);
          setTransferSpeed(0);
          cleanup();

          recordTransfer({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            transferType: "send",
          });
        }
      } catch (err) {
        if (abortSignal.aborted) return;

        if (
          err.message?.includes("Data channel") ||
          err.message?.includes("Transfer aborted")
        ) {
          setTransferFailed(true);
          setIsTransferring(false);
          setTransferSpeed(0);
          cleanup();
          return;
        }

        sendRetryCount.current++;
        if (
          sendRetryCount.current >= MAX_SEND_RETRIES ||
          abortSignal.aborted
        ) {
          setTransferFailed(true);
          setIsTransferring(false);
          setTransferSpeed(0);
          cleanup();
          return;
        }
        setTimeout(sendChunk, 200 * sendRetryCount.current);
      }
    };

    await sendChunk();
  };

  const sendSecuredFile = async () => {
    if (!selectedFile) return;

    if (!isDataChannelOpen()) {
      setTransferFailed(true);
      return;
    }

    cleanup();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    sendRetryCount.current = 0;
    setIsTransferring(true);
    setTransferProgress(0);
    setTransferComplete(false);
    setTransferFailed(false);
    startTimeRef.current = Date.now();
    setTransferSpeed(0);
    resetTransferTimeout();

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
        { signal: controller.signal, timeoutMs: TRANSFER_TIMEOUT_MS },
      );
    } catch {
      if (!controller.signal.aborted) {
        setTransferFailed(true);
        setIsTransferring(false);
        setTransferSpeed(0);
        cleanup();
      }
      return;
    }

    await sendNextChunk(selectedFile, totalChunks, controller);
  };

  const cancelTransfer = useCallback(() => {
    abortControllerRef.current?.abort();
    clearTransferTimeout();
    setIsTransferring(false);
    setTransferProgress(0);
    setTransferSpeed(0);
    setTransferFailed(false);
    setTransferComplete(false);
    cleanup();
  }, [cleanup]);

  const retryTransfer = useCallback(() => {
    setTransferFailed(false);
    setTransferProgress(0);
    setTransferComplete(false);
    setTransferSpeed(0);
    sendRetryCount.current = 0;
    setTimeout(() => sendSecuredFile(), 100);
  }, []);

  const clearFile = useCallback(() => {
    abortControllerRef.current?.abort();
    clearTransferTimeout();
    setSelectedFile(null);
    setIncomingFile(null);
    incomingFileRef.current = null;
    setTransferProgress(0);
    setIsTransferring(false);
    setTransferComplete(false);
    setTransferFailed(false);
    setReceivedBlob(null);
    setTransferSpeed(0);
    receivedChunksRef.current = [];
    startTimeRef.current = null;
    sendRetryCount.current = 0;
  }, []);

  const downloadFile = useCallback(() => {
    if (receivedBlob && incomingFile) {
      const url = URL.createObjectURL(receivedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = incomingFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      clearFile();
    }
  }, [receivedBlob, incomingFile, clearFile]);

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
    cancelTransfer,
    retryTransfer,
    downloadFile,
    clearFile,
  };
}

export { useFileTransfer };
