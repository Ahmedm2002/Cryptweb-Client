import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("FileTransfer");

export const DEFAULT_CHUNK_SIZE = 65536;
export const MAX_CHUNK_SIZE = 262144;
export const BUFFER_LOW_THRESHOLD = 262144;
export const DRAIN_POLL_MS = 100;
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
  const pipelineStartedAt = performance.now();
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
    log.log("Metadata delivered");
  } catch (err) {
    log.error(`Metadata send failed: ${err.message}`);
    return abortSignal.aborted ? "aborted" : "failed";
  }

  // Small files are preloaded into memory; larger ones stream from disk.
  let fileBuffer = null;
  const preloadThreshold = getPreloadThreshold();
  if (file.size <= preloadThreshold) {
    log.log(
      `Preloading ${(file.size / 1048576).toFixed(1)}MB into memory (threshold ${(preloadThreshold / 1048576).toFixed(0)}MB)`,
    );
    const t0 = performance.now();
    fileBuffer = await file.arrayBuffer();
    log.log(`Preloaded in ${((performance.now() - t0) / 1000).toFixed(2)}s`);
  } else {
    log.log(
      `File exceeds preload threshold — streaming from disk (${(preloadThreshold / 1048576).toFixed(0)}MB limit)`,
    );
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
    const secs = (performance.now() - pipelineStartedAt) / 1000;
    log.log(
      `Completion signal delivered — total ${secs.toFixed(1)}s (${((file.size / 1048576) / Math.max(secs, 0.01)).toFixed(2)}MB/s avg)`,
    );
  } catch (err) {
    if (!abortSignal.aborted) {
      log.error(`Failed to send completion signal: ${err.message}`);
    }
  }

  return "complete";
}

/**
 * Streams a file over the data channel, paced by bufferedamountlow events.
 * Fully self-driving: pauses internally when the send buffer fills and
 * resumes automatically once it drains below the low-water mark.
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
  let lastRenderTime = 0;
  let lastLoggedChunk = 0;
  const logStride = Math.max(1, Math.floor(totalChunks / 20)); // ~5% steps
  const startedAt = performance.now();

  dc.bufferedAmountLowThreshold = BUFFER_LOW_THRESHOLD;

  /** Resolves when bufferedAmount drops to the low-water mark. */
  const waitForDrain = () =>
    new Promise((resolve, reject) => {
      if (dc.readyState !== "open")
        return reject(new Error("Data channel closed"));
      if (abortSignal.aborted) return reject(new Error("Transfer aborted"));
      // The event may have fired before we attached — check first.
      if (dc.bufferedAmount <= BUFFER_LOW_THRESHOLD) return resolve();

      let pollTimer = null;
      const cleanup = () => {
        dc.removeEventListener("bufferedamountlow", onLow);
        clearInterval(pollTimer);
        pollTimer = null;
      };
      const finish = (fn, value) => {
        cleanup();
        fn(value);
      };
      const onLow = () => {
        if (dc.bufferedAmount > BUFFER_LOW_THRESHOLD) return; // spurious
        finish(resolve);
      };
      dc.addEventListener("bufferedamountlow", onLow);
      // Backstop: covers missed events plus close/abort while waiting.
      pollTimer = setInterval(() => {
        if (!dc || dc.readyState !== "open") {
          return finish(reject, new Error("Data channel closed"));
        }
        if (abortSignal.aborted) {
          return finish(reject, new Error("Transfer aborted"));
        }
        if (dc.bufferedAmount <= BUFFER_LOW_THRESHOLD) finish(resolve);
      }, DRAIN_POLL_MS);
    });

  try {
    while (offset < file.size) {
      if (abortSignal.aborted) return "aborted";
      if (dc.readyState !== "open") {
        log.error("Pump aborted: data channel closed mid-transfer");
        return "failed";
      }

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
        return "failed";
      }

      chunkId++;
      offset += chunkSize;
      onChunkSent?.();

      if (chunkId - lastLoggedChunk >= logStride || chunkId === totalChunks) {
        lastLoggedChunk = chunkId;
        const secs = (performance.now() - startedAt) / 1000;
        const mbps = (offset / 1048576) / Math.max(secs, 0.01);
        log.log(
          `Chunk ${chunkId}/${totalChunks} (${Math.round((chunkId / totalChunks) * 100)}%) · buffer=${(dc.bufferedAmount / 1024).toFixed(0)}KB · ${secs.toFixed(1)}s · ${mbps.toFixed(2)}MB/s`,
        );
      }

      const now = Date.now();
      if (
        now - lastRenderTime >= PROGRESS_THROTTLE_MS ||
        chunkId === totalChunks
      ) {
        lastRenderTime = now;
        onProgress?.(Math.round((chunkId / totalChunks) * 100));
      }

      // Buffer full — wait for it to drain, then keep pumping in this call.
      if (offset < file.size && dc.bufferedAmount > BUFFER_LOW_THRESHOLD) {
        await waitForDrain();
      }
    }
  } catch (err) {
    if (!abortSignal.aborted) {
      log.error(`Pump failed: ${err.message}`);
      onSendError?.();
    }
    return abortSignal.aborted ? "aborted" : "failed";
  }

  onProgress?.(100);
  log.log(
    `Pump finished: all ${totalChunks}/${totalChunks} chunks handed to dc.send() (bufferedAmount=${(dc.bufferedAmount / 1024).toFixed(0)}KB)`,
  );
  return "complete";
}
