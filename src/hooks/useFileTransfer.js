import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../socket/useSocket";
import createLogger from "../utils/logger/devLogger.js";
import { recordCompletedTransfer } from "../services/transferHistory.js";
import { sendFilePipeline } from "../webrtc/filePump.js";
import { IncomingFileAssembler } from "../webrtc/fileReceiver.js";
import { downloadBlob } from "../utils/download.js";

const log = createLogger("FileTransfer");

const TRANSFER_TIMEOUT_MS = 60000;
const PROGRESS_THROTTLE_MS = 80;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Manages chat file transfers as a list of UI records.
 * One outbound OR inbound transfer may be active at a time.
 */
function useFileTransfer(friendEmail, user, peerDisconnected, peerEnded) {
  const {
    subscribeToDataChannel,
    sendDataViaWebRTC,
    isDataChannelOpen,
    getDataChannel,
    getMaxMessageSize,
    setIsTransferring: setContextTransferring,
  } = useSocket();

  const [transfers, setTransfers] = useState([]);

  const activeIdRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastProgressRenderRef = useRef(0);
  const assemblerRef = useRef(new IncomingFileAssembler());

  const ctxRef = useRef({});
  useEffect(() => {
    ctxRef.current = { friendEmail, user };
  }, [friendEmail, user]);

  const transfersRef = useRef([]);
  useEffect(() => {
    transfersRef.current = transfers;
  }, [transfers]);

  // Sync active-transfer flag to context (blocks disconnect, etc.)
  useEffect(() => {
    setContextTransferring(transfers.some((t) => t.status === "active"));
  }, [transfers, setContextTransferring]);

  const addTransfer = useCallback((t) => {
    setTransfers((prev) => [...prev, t]);
  }, []);

  const updateTransfer = useCallback((id, patch) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }, []);

  const clearTransferTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const failActiveTransfers = useCallback(() => {
    clearTransferTimeout();
    if (activeIdRef.current)
      updateTransfer(activeIdRef.current, { status: "failed" });
    if (assemblerRef.current.id)
      updateTransfer(assemblerRef.current.id, { status: "failed" });
    activeIdRef.current = null;
    assemblerRef.current.reset();
  }, [updateTransfer]);

  const resetTransferTimeout = useCallback(() => {
    clearTransferTimeout();
    timeoutRef.current = setTimeout(() => {
      log.error("Transfer timed out");
      failActiveTransfers();
    }, TRANSFER_TIMEOUT_MS);
  }, [failActiveTransfers]);

  const record = useCallback((fileName, fileSize, fileType, transferType) => {
    recordCompletedTransfer({
      userEmail: ctxRef.current.user?.email,
      friendEmail: ctxRef.current.friendEmail,
      startedAt: startTimeRef.current,
      fileName,
      fileSize,
      fileType,
      transferType,
    });
  }, []);

  // --- receive ----------------------------------------------------------
  const handleMetadata = useCallback(
    (msg) => {
      if (assemblerRef.current.active) return; // protocol: one at a time
      const id = makeId();
      const desc = assemblerRef.current.begin(id, msg);
      startTimeRef.current = Date.now();
      lastProgressRenderRef.current = 0;
      addTransfer({
        ...desc,
        direction: "in",
        progress: 0,
        status: "active",
        blob: null,
        ts: Date.now(),
      });
      resetTransferTimeout();
    },
    [addTransfer, resetTransferTimeout],
  );

  const handleComplete = useCallback(
    (msg) => {
      const assembler = assemblerRef.current;
      log.log(
        `handleComplete ENTER | id=${assembler.id || "none"} | active=${assembler.active} | chunks=${assembler.chunks.length}/${assembler.meta?.totalChunks ?? "?"} | msg: ${JSON.stringify(msg).slice(0, 200)}`,
      );
      clearTransferTimeout();
      const id = assembler.id;
      const result = id ? assembler.finalize(msg) : { ok: false };

      if (result.ok) {
        updateTransfer(id, {
          status: "done",
          progress: 100,
          blob: result.blob,
        });
        record(
          assembler.meta.name,
          assembler.meta.size,
          assembler.meta.type,
          "receive",
        );
        log.log(`Receive complete: ${assembler.meta.name}`);
      } else if (id) {
        updateTransfer(id, { status: "failed" });
        log.error(`Receive failed verification for transfer ${id}`);
      }
      assembler.reset();
    },
    [updateTransfer, record],
  );

  /** Peer cancelled their side of the transfer. */
  const handleCancelNotice = useCallback(() => {
    if (assemblerRef.current.active) {
      const id = assemblerRef.current.id;
      const name = assemblerRef.current.meta?.name;
      log.log(`Peer cancelled the incoming transfer "${name}"`);
      assemblerRef.current.reset();
      clearTransferTimeout();
      if (id) updateTransfer(id, { status: "cancelled" });
    }
    if (activeIdRef.current && abortControllerRef.current) {
      log.log("Peer cancelled our outgoing transfer");
      abortControllerRef.current.abort(new Error("Cancelled by peer"));
    }
  }, [updateTransfer]);

  /** Processes a binary chunk packet (ArrayBuffer). */
  const processBinary = useCallback(
    (buffer) => {
      if (!(buffer instanceof ArrayBuffer)) return;
      if (buffer.byteLength <= 9 || new DataView(buffer).getUint8(0) !== 0x01)
        return;
      if (!assemblerRef.current.id) return; // no active inbound transfer

      const { chunkIndex, totalChunks } =
        assemblerRef.current.pushChunk(buffer);
      resetTransferTimeout();

      // ~5%-stride console progress for large transfers
      if (
        chunkIndex % Math.max(1, Math.floor(totalChunks / 20)) === 0 ||
        chunkIndex + 1 === totalChunks
      ) {
        log.log(
          `Receive chunk ${chunkIndex + 1}/${totalChunks} (${Math.round(((chunkIndex + 1) / totalChunks) * 100)}%)`,
        );
      }

      const now = Date.now();
      const isLast = chunkIndex + 1 === totalChunks;
      if (
        now - lastProgressRenderRef.current >= PROGRESS_THROTTLE_MS ||
        isLast
      ) {
        lastProgressRenderRef.current = now;
        updateTransfer(assemblerRef.current.id, {
          progress: Math.round(((chunkIndex + 1) / totalChunks) * 100),
        });
      }
    },
    [resetTransferTimeout, updateTransfer],
  );

  const onMessage = useCallback(
    (data) => {
      try {
        if (typeof data === "string") {
          let msg = null;
          try {
            msg = JSON.parse(data);
          } catch {
            log.error(
              `onMessage: non-JSON text (${data.length}B): ${data.slice(0, 120)}`,
            );
            return;
          }
          log.log(`onMessage → control msg type="${msg.type}"`);
          if (msg.type === "metadata") handleMetadata(msg);
          else if (msg.type === "complete") handleComplete(msg);
          else if (msg.type === "cancel") handleCancelNotice();
          else log.log(`onMessage → unhandled control type "${msg.type}"`);
          return;
        }

        // Some browsers deliver binary as Blob even with binaryType set —
        // normalize to ArrayBuffer before processing.
        if (typeof Blob !== "undefined" && data instanceof Blob) {
          log.log(
            `onMessage → BLOB ${data.size}B (normalizing to ArrayBuffer)`,
          );
          data
            .arrayBuffer()
            .then(processBinary)
            .catch(() => {});
          return;
        }

        processBinary(data);
      } catch (err) {
        log.error("Error processing data channel message", err);
      }
    },
    [handleMetadata, handleComplete, handleCancelNotice, processBinary],
  );

  useEffect(() => {
    subscribeToDataChannel(onMessage);
  }, [subscribeToDataChannel, onMessage]);

  useEffect(() => {
    if (
      (peerDisconnected || peerEnded) &&
      (activeIdRef.current || assemblerRef.current.active)
    ) {
      failActiveTransfers();
    }
  }, [peerDisconnected, peerEnded, failActiveTransfers]);

  useEffect(() => {
    return () => clearTransferTimeout();
  }, []);

  // --- send ---------------------------------------------------------------
  const sendFile = useCallback(
    async (file) => {
      if (!file || activeIdRef.current || assemblerRef.current.active)
        return false;
      const dc = getDataChannel();
      log.log(
        `sendFile ENTER "${file.name}" (${(file.size / 1048576).toFixed(2)}MB) | dc=${dc ? `open=${dc.readyState} bufferedAmount=${dc.bufferedAmount}` : "null"} | maxMsgSize=${getMaxMessageSize?.() ?? "?"}`,
      );
      if (!isDataChannelOpen()) {
        log.error("Data channel not open, cannot send");
        return false;
      }

      const id = makeId();
      activeIdRef.current = id;
      const controller = new AbortController();
      abortControllerRef.current = controller;
      startTimeRef.current = Date.now();

      addTransfer({
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        direction: "out",
        progress: 0,
        status: "active",
        blob: null,
        ts: Date.now(),
      });
      resetTransferTimeout();

      const result = await sendFilePipeline({
        file,
        controller,
        dc,
        maxMsgSize: getMaxMessageSize?.(),
        send: sendDataViaWebRTC,
        onProgress: (pct) => updateTransfer(id, { progress: pct }),
        onChunkSent: resetTransferTimeout,
      });

      log.log(`sendFile pipeline returned: ${result}`);

      clearTransferTimeout();
      activeIdRef.current = null;
      abortControllerRef.current = null;

      if (result === "complete") {
        updateTransfer(id, { status: "done", progress: 100 });
        record(file.name, file.size, file.type, "send");
        log.log(
          `Send complete: ${file.name} in ${((Date.now() - startTimeRef.current) / 1000).toFixed(1)}s`,
        );
      } else if (result === "aborted") {
        updateTransfer(id, { status: "cancelled" });
        log.log(`Send cancelled: ${file.name}`);
      } else if (result === "failed") {
        updateTransfer(id, { status: "failed" });
        log.error(`Send failed: ${file.name}`);
      }
      return true;
    },
    [
      addTransfer,
      updateTransfer,
      resetTransferTimeout,
      sendDataViaWebRTC,
      isDataChannelOpen,
      getDataChannel,
      getMaxMessageSize,
      record,
    ],
  );

  /**
   * Cancels an active transfer (before or while it is in progress) and
   * notifies the peer so their side stops too.
   */
  const cancelTransfer = useCallback(
    (id) => {
      // Outbound: notify peer, then abort the send pipeline
      if (activeIdRef.current === id && abortControllerRef.current) {
        log.log("Cancelling outgoing transfer");
        sendDataViaWebRTC(JSON.stringify({ type: "cancel" })).catch(() => {});
        clearTransferTimeout();
        updateTransfer(id, { status: "cancelled" });
        abortControllerRef.current.abort(new Error("Cancelled by user"));
        return;
      }
      // Inbound: stop assembling, notify peer so they stop pumping chunks
      if (assemblerRef.current.id === id) {
        log.log(
          `Cancelling incoming transfer "${assemblerRef.current.meta?.name}"`,
        );
        sendDataViaWebRTC(JSON.stringify({ type: "cancel" })).catch(() => {});
        assemblerRef.current.reset();
        clearTransferTimeout();
        updateTransfer(id, { status: "cancelled" });
      }
    },
    [sendDataViaWebRTC, updateTransfer],
  );

  const downloadFile = useCallback((id) => {
    const t = transfersRef.current.find((x) => x.id === id);
    if (t?.blob) downloadBlob(t.blob, t.name);
  }, []);

  return {
    transfers,
    sendFile,
    downloadFile,
    cancelTransfer,
  };
}

export { useFileTransfer };
