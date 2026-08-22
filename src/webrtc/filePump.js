import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("FileTransfer");

export const DEFAULT_CHUNK_SIZE = 65536;
export const MAX_CHUNK_SIZE = 262144;
export const BUFFER_LOW_THRESHOLD = 262144;
export const PROGRESS_THROTTLE_MS = 80;
export const SEND_TIMEOUT_MS = 60000;

export function getPreloadThreshold() {
  const mem = navigator.deviceMemory;
  if (mem >= 8) return 100 * 1024 * 1024;
  if (mem >= 4) return 75 * 1024 * 1024;
  if (mem >= 2) return 50 * 1024 * 1024;
  if (mem) return 25 * 1024 * 1024;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  return isMobile ? 25 * 1024 * 1024 : 75 * 1024 * 1024;
}

export function computeChunkSize(maxMsgSize) {
  return maxMsgSize > 9
    ? Math.min(maxMsgSize - 9, MAX_CHUNK_SIZE)
    : DEFAULT_CHUNK_SIZE;
}

/**
 * Full outbound pipeline: metadata → preload → chunk pump → completion signal.
 *
 * @returns {"complete" | "failed" | "aborted"}
 */
export async function sendFilePipeline({
  file,
  controller,
  dc,
  maxMsgSize,
  send,
  onProgress,
  onChunkSent,
}) {
  const abortSignal = controller.signal;
  const chunkSize = computeChunkSize(maxMsgSize ?? DEFAULT_CHUNK_SIZE);
  const totalChunks = Math.ceil(file.size / chunkSize);
  log.log(
    `Send started: "${file.name}" (${(file.size / 1048576).toFixed(2)}MB), chunk=${chunkSize}B, chunks=${totalChunks}`,
  );

  try {
    await send(
      JSON.stringify({
        type: "metadata",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChunks,
      }),
      { signal: abortSignal, timeoutMs: SEND_TIMEOUT_MS },
    );
  } catch {
    return abortSignal.aborted ? "aborted" : "failed";
  }

  // Small files are preloaded into memory; larger ones stream from disk.
  let fileBuffer = null;
  if (file.size <= getPreloadThreshold()) {
    fileBuffer = await file.arrayBuffer();
  }

  const result = await pumpChunks({
    file,
    totalChunks,
    chunkSize,
    controller,
    fileBuffer,
    dc,
    onProgress,
    onChunkSent,
  });

  if (result !== "complete") {
    log.warn(`Send pipeline ended with status: ${result}`);
    return result;
  }

  try {
    await send(
      JSON.stringify({ type: "complete", totalChunks, fileSize: file.size }),
      { signal: abortSignal, timeoutMs: SEND_TIMEOUT_MS },
    );
  } catch {
    if (!abortSignal.aborted) {
      log.error("Failed to send completion signal");
    }
  }

  return "complete";
}

/**
 * Streams a file over the data channel, paced by bufferedamountlow events.
 *
 * @returns {"complete" | "aborted" | "failed"}
 */
export async function pumpChunks({
  file,
  totalChunks,
  chunkSize,
  controller,
  fileBuffer,
  dc,
  onProgress,
  onChunkSent,
  onSendError,
}) {
  const abortSignal = controller.signal;

  if (!dc || dc.readyState !== "open") return "failed";
  if (abortSignal.aborted) return "aborted";

  // Pre-allocate a single packet buffer (header 9B + chunkSize) once.
  const packetView = new Uint8Array(9 + chunkSize);
  const packetHeader = new DataView(packetView.buffer);

  let chunkId = 0;
  let offset = 0;
  let pumping = false;
  let lastRenderTime = 0;

  dc.bufferedAmountLowThreshold = BUFFER_LOW_THRESHOLD;

  const onDrain = () => {
    if (!pumping && !abortSignal.aborted) {
      pump();
    }
  };
  dc.addEventListener("bufferedamountlow", onDrain);

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
        } catch (err) {
          if (!abortSignal.aborted) {
            log.error("Pump send error:", err.message);
            onSendError?.();
          }
          dc.removeEventListener("bufferedamountlow", onDrain);
          return "failed";
        }

        chunkId++;
        offset += chunkSize;
        onChunkSent?.();

        const now = Date.now();
        if (
          now - lastRenderTime >= PROGRESS_THROTTLE_MS ||
          chunkId === totalChunks
        ) {
          lastRenderTime = now;
          onProgress?.(Math.round((chunkId / totalChunks) * 100));
        }
      }

      if (abortSignal.aborted) {
        dc.removeEventListener("bufferedamountlow", onDrain);
        return "aborted";
      }

      if (offset >= file.size) {
        dc.removeEventListener("bufferedamountlow", onDrain);
        onProgress?.(100);
        return "complete";
      }

      // Buffer full — pause until the next bufferedamountlow event
      return "pending";
    } finally {
      pumping = false;
    }
  };

  return await pump();
}
