import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../socket/useSocket";
import { api } from "../services/api.js";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("FileTransfer");

const DEFAULT_CHUNK_SIZE = 65536;
const MAX_CHUNK_SIZE = 262144;
const BUFFER_LOW_THRESHOLD = 262144;
const TRANSFER_TIMEOUT_MS = 60000;
const PROGRESS_THROTTLE_MS = 80;

function getPreloadThreshold() {
  const mem = navigator.deviceMemory;
  if (mem >= 8) return 100 * 1024 * 1024;
  if (mem >= 4) return 75 * 1024 * 1024;
  if (mem >= 2) return 50 * 1024 * 1024;
  if (mem) return 25 * 1024 * 1024;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  return isMobile ? 25 * 1024 * 1024 : 75 * 1024 * 1024;
}

function useFileTransfer(friendEmail, user, peerDisconnected) {
  const {
    subscribeToDataChannel,
    sendDataViaWebRTC,
    isDataChannelOpen,
    getDataChannel,
    getMaxMessageSize,
  } = useSocket();

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
  const lastRenderTimeRef = useRef(0);

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
        .post("/file-transfers/complete", {
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

  const onMessage = useCallback((data) => {
    try {
      if (typeof data === "string") {
        const msg = JSON.parse(data);

        if (msg.type === "metadata") {
          log.log("Incoming file:", msg.fileName, `${(msg.fileSize / 1024 / 1024).toFixed(1)}MB`, `${msg.totalChunks} chunks`);
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
          log.log("Transfer complete signal received");
          clearTransferTimeout();
          setIsTransferring(false);
          setTransferComplete(true);
          setTransferSpeed(0);

          const totalExpected = msg.totalChunks;
          const totalReceived = receivedChunksRef.current.length;

          if (totalReceived !== totalExpected) {
            log.error(`Chunk count mismatch: expected ${totalExpected}, got ${totalReceived}`);
            setTransferFailed(true);
            setTransferComplete(false);
            return;
          }

          const blob = new Blob(receivedChunksRef.current, {
            type: incomingFileRef.current?.type || "application/octet-stream",
          });

          if (msg.fileSize && blob.size !== msg.fileSize) {
            log.error(`File size mismatch: expected ${msg.fileSize}, got ${blob.size}`);
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

          const elapsed =
            (Date.now() - startTimeRef.current) / 1000;
          const throughput =
            blob.size / elapsed / 1024 / 1024;
          log.log(
            `Transfer timing: ${(blob.size / 1024 / 1024).toFixed(2)}MB in ${elapsed.toFixed(1)}s @ ${throughput.toFixed(2)} MB/s`,
          );
        }
      } else if (data instanceof ArrayBuffer) {
        if (data.byteLength < 9) return;

        const view = new DataView(data);
        const marker = view.getUint8(0);

        if (marker !== 0x01) return;

        const chunkIndex = view.getUint32(1, false);
        const totalChunks = view.getUint32(5, false);
        // STEP 5 — Zero-copy: view into the incoming ArrayBuffer instead of slicing a new one.
        // Known follow-up: for very large transfers, switch from Blob to ReadableStream
        // to avoid buffering all chunks in memory simultaneously.
        const raw_data = new Uint8Array(data, 9);

        if (
          incomingFileRef.current &&
          totalChunks !== incomingFileRef.current.totalChunks
        ) {
          log.error(
            `Total chunks mismatch in chunk ${chunkIndex}: expected ${incomingFileRef.current.totalChunks}, got ${totalChunks}`,
          );
        }

        receivedChunksRef.current.push(raw_data);

        const currentProgress = Math.round(
          ((chunkIndex + 1) / totalChunks) * 100,
        );
        resetTransferTimeout();

        const now = Date.now();
        if (now - lastRenderTimeRef.current >= PROGRESS_THROTTLE_MS) {
          lastRenderTimeRef.current = now;
          setTransferProgress(currentProgress);

          if (startTimeRef.current && incomingFileRef.current?.size) {
            const elapsed = (now - startTimeRef.current) / 1000;
            if (elapsed > 0.3) {
              const bytesSoFar =
                (currentProgress / 100) * incomingFileRef.current.size;
              setTransferSpeed(bytesSoFar / elapsed);
            }
          }
        }
      }
    } catch (err) {
      log.error("Error processing data channel message", err);
    }
  }, []);

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

  const pumpChunks = async (file, totalChunks, chunkSize, controller, fileBuffer) => {
    const abortSignal = controller.signal;
    const dc = getDataChannel();

    if (!dc || dc.readyState !== "open") {
      setTransferFailed(true);
      setIsTransferring(false);
      cleanup();
      return;
    }

    // STEP 4 — Pre-allocate a single packet buffer (header 9B + chunkSize) once.
    // Reused every iteration: dc.send() copies internally, subarray() is zero-copy.
    const packetView = new Uint8Array(9 + chunkSize);
    const packetHeader = new DataView(packetView.buffer);

    let chunkId = 0;
    let offset = 0;
    let pumping = false;
    let chunksThisSec = 0;
    let bytesThisSec = 0;
    let lastLogTime = Date.now();

    dc.bufferedAmountLowThreshold = BUFFER_LOW_THRESHOLD;

    const onDrain = () => {
      if (!pumping && !abortSignal.aborted) {
        pump();
      }
    };
    dc.addEventListener("bufferedamountlow", onDrain);

    // STEP 6 — Synchronous while loop driven by a single bufferedamountlow listener.
    // No await inside the preload hot path; fallback path has one await per chunk (disk slice).
    const pump = async () => {
      if (pumping || abortSignal.aborted) return;
      pumping = true;

      try {
        while (
          offset < file.size &&
          dc.bufferedAmount <= BUFFER_LOW_THRESHOLD
        ) {
          if (abortSignal.aborted) break;

          let len;
          if (fileBuffer) {
            len = Math.min(chunkSize, fileBuffer.byteLength - offset);
            packetView.set(new Uint8Array(fileBuffer, offset, len), 9);
          } else {
            const slice = file.slice(offset, offset + chunkSize);
            const ab = await slice.arrayBuffer();
            len = ab.byteLength;
            packetView.set(new Uint8Array(ab), 9);
          }

          packetHeader.setUint8(0, 0x01);
          packetHeader.setUint32(1, chunkId, false);
          packetHeader.setUint32(5, totalChunks, false);

          try {
            dc.send(packetView.subarray(0, 9 + len));
          } catch (sendErr) {
            if (!abortSignal.aborted) {
              log.error("Pump send error:", sendErr.message);
              setTransferFailed(true);
              setIsTransferring(false);
              setTransferSpeed(0);
            }
            dc.removeEventListener("bufferedamountlow", onDrain);
            clearTransferTimeout();
            cleanup();
            return;
          }

          chunkId++;
          offset += chunkSize;
          resetTransferTimeout();

          const now = Date.now();
          if (
            now - lastRenderTimeRef.current >= PROGRESS_THROTTLE_MS
          ) {
            lastRenderTimeRef.current = now;
            const progress = Math.round(
              (chunkId / totalChunks) * 100,
            );
            setTransferProgress(progress);

            if (startTimeRef.current) {
              const elapsed = (now - startTimeRef.current) / 1000;
              if (elapsed > 0.3) {
                setTransferSpeed(offset / elapsed);
              }
            }
          }

          chunksThisSec++;
          bytesThisSec += 9 + len;
          if (now - lastLogTime >= 1000) {
            const secElapsed = (now - lastLogTime) / 1000;
            log.log(
              `[PUMP] ${chunksThisSec} chunks/s | ${(bytesThisSec / secElapsed / 1024).toFixed(1)} KB/s | buffer: ${dc.bufferedAmount} bytes`,
            );
            chunksThisSec = 0;
            bytesThisSec = 0;
            lastLogTime = now;
          }
        }

        if (offset >= file.size && !abortSignal.aborted) {
          dc.removeEventListener("bufferedamountlow", onDrain);
          setTransferProgress(100);

          try {
            await sendDataViaWebRTC(
              JSON.stringify({
                type: "complete",
                totalChunks,
                fileSize: file.size,
              }),
              {
                signal: abortSignal,
                timeoutMs: TRANSFER_TIMEOUT_MS,
              },
            );
          } catch {
            if (!abortSignal.aborted) {
              log.error("Failed to send completion signal");
            }
          }

          clearTransferTimeout();
          setIsTransferring(false);
          setTransferComplete(true);
          setTransferSpeed(0);
          cleanup();

          const elapsed =
            (Date.now() - startTimeRef.current) / 1000;
          const throughput =
            file.size / elapsed / 1024 / 1024;
          log.log(`Send complete: ${file.name}`);
          log.log(
            `Transfer timing: ${(file.size / 1024 / 1024).toFixed(2)}MB in ${elapsed.toFixed(1)}s @ ${throughput.toFixed(2)} MB/s`,
          );

          recordTransfer({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            transferType: "send",
          });
        }
      } finally {
        pumping = false;
      }
    };

    await pump();
  };

  const sendSecuredFile = async () => {
    if (!selectedFile) return;

    if (!isDataChannelOpen()) {
      log.error("Data channel not open, cannot send");
      setTransferFailed(true);
      return;
    }

    log.log(
      "Starting send:",
      selectedFile.name,
      `${(selectedFile.size / 1024 / 1024).toFixed(1)}MB`,
    );
    cleanup();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsTransferring(true);
    setTransferProgress(0);
    setTransferComplete(false);
    setTransferFailed(false);
    startTimeRef.current = Date.now();
    setTransferSpeed(0);
    resetTransferTimeout();

    const maxMsgSize = getMaxMessageSize?.() || DEFAULT_CHUNK_SIZE;
    const chunkSize =
      maxMsgSize > 9
        ? Math.min(maxMsgSize - 9, MAX_CHUNK_SIZE)
        : DEFAULT_CHUNK_SIZE;
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    log.log(`Chunk config: size=${chunkSize}B, total=${totalChunks}, maxMsgSize=${maxMsgSize}`);

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

    const threshold = getPreloadThreshold();
    let fileBuffer = null;
    if (selectedFile.size <= threshold) {
      log.log(
        `[PRELOAD] ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB) <= ${(threshold / 1024 / 1024).toFixed(0)}MB threshold — preloading into memory`,
      );
      fileBuffer = await selectedFile.arrayBuffer();
    } else {
      log.log(
        `[PRELOAD] ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB) > ${(threshold / 1024 / 1024).toFixed(0)}MB threshold — streaming from disk`,
      );
    }

    await pumpChunks(selectedFile, totalChunks, chunkSize, controller, fileBuffer);
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
