import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("DataChannel");

export const SEND_TIMEOUT_MS = 30000;
export const BUFFER_LOW_THRESHOLD = 262144;
export const DATA_CHANNEL_NAME = "channel:file-transfer";

export function openDataChannel(peerConnection) {
  log.log(`Opening local data channel "${DATA_CHANNEL_NAME}"`);
  return peerConnection.createDataChannel(DATA_CHANNEL_NAME, {
    ordered: true,
  });
}

export function wireDataChannel(dataChannel, remotePeerEmail, onMessage) {
  dataChannel.bufferedAmountLowThreshold = BUFFER_LOW_THRESHOLD;
  // Binary chunks must arrive as ArrayBuffer for the file protocol
  dataChannel.binaryType = "arraybuffer";
  let wireBinaryCount = 0;

  dataChannel.onopen = () => {
    log.log(
      `[wire] OPEN with ${remotePeerEmail} | binaryType=${dataChannel.binaryType} | maxMessageSize=${dataChannel.maxMessageSize ?? "n/a"} | bufferedAmountLowThreshold=${dataChannel.bufferedAmountLowThreshold}`,
    );
  };

  dataChannel.onmessage = (event) => {
    if (typeof event.data === "string") {
      log.log(`[wire] ← TEXT ${event.data.length}B: ${event.data.slice(0, 120)}`);
    } else {
      const size = event.data?.byteLength ?? event.data?.size ?? "?";
      wireBinaryCount += 1;
      if (wireBinaryCount === 1 || wireBinaryCount % 25 === 0) {
        log.log(`[wire] ← BINARY #${wireBinaryCount} ${size}B (${typeof event.data})`);
      }
    }
    onMessage?.(event.data);
  };

  dataChannel.onerror = (error) => {
    log.error(`Data channel error:`, error);
  };

  dataChannel.onclose = () => {
    log.log(`Data channel closed with ${remotePeerEmail} (received ${wireBinaryCount} binary msgs total)`);
  };
}

/**
 * Sends data over the data channel, waiting for buffer drain when needed.
 * Resolves when sent; rejects on timeout, abort, or channel closure.
 */
export function sendDataReliably(dataChannel, data, { signal, timeoutMs = SEND_TIMEOUT_MS } = {}) {
  const isText = typeof data === "string";
  const preview = isText ? data.slice(0, 120) : `${data.byteLength}B binary`;
  if (isText) log.log(`sendDataReliably → TEXT ${preview}`);
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new Error("Transfer aborted"));
    }

    if (!dataChannel || dataChannel.readyState !== "open") {
      return reject(new Error("Data channel is not open"));
    }

    let drainHandler = null;
    let pollTimer = null;
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        log.error("Send timeout: buffer not draining");
        reject(new Error("Send timeout: buffer not draining"));
      }
    }, timeoutMs);

    const onAbort = () => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error("Transfer aborted"));
      }
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    const cleanup = () => {
      clearTimeout(timer);
      if (pollTimer != null) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      signal?.removeEventListener("abort", onAbort);
      if (drainHandler && dataChannel) {
        dataChannel.removeEventListener("bufferedamountlow", drainHandler);
        drainHandler = null;
      }
    };

    const settle = (fn, value) => {
      settled = true;
      cleanup();
      fn(value);
    };

    const attempt = () => {
      if (settled) return;

      if (signal?.aborted) {
        return settle(reject, new Error("Transfer aborted"));
      }

      if (!dataChannel || dataChannel.readyState !== "open") {
        return settle(reject, new Error("Data channel closed during transfer"));
      }

      if (
        dataChannel.bufferedAmount >
        dataChannel.bufferedAmountLowThreshold
      ) {
        // Buffer still draining. The bufferedamountlow event may have
        // already fired before we attached (fast drain race), so back
        // it up with a short poll instead of trusting one event.
        if (isText) {
          log.log(
            `sendDataReliably → waiting for drain: bufferedAmount=${dataChannel.bufferedAmount} > threshold=${dataChannel.bufferedAmountLowThreshold}`,
          );
        }
        if (!drainHandler) {
          drainHandler = () => {
            drainHandler = null;
            attempt();
          };
          dataChannel.addEventListener("bufferedamountlow", drainHandler, {
            once: true,
          });
        }
        if (pollTimer == null) {
          pollTimer = setInterval(() => {
            if (settled) return;
            if (
              !dataChannel ||
              dataChannel.readyState !== "open" ||
              dataChannel.bufferedAmount <=
                dataChannel.bufferedAmountLowThreshold
            ) {
              if (pollTimer != null) {
                clearInterval(pollTimer);
                pollTimer = null;
              }
              attempt();
            }
          }, 100);
        }
        return;
      }

      try {
        if (isText) log.log(`sendDataReliably → dc.send() TEXT now (bufferedAmount=${dataChannel.bufferedAmount})`);
        dataChannel.send(data);
        settle(resolve);
        if (isText) log.log(`sendDataReliably → TEXT sent ✓`);
      } catch (err) {
        settle(reject, err);
        if (isText) log.error(`sendDataReliably → TEXT send FAILED:`, err);
      }
    };

    attempt();
  });
}
