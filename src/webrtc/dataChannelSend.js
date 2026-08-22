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

  dataChannel.onopen = () => {
    log.log(
      `Data channel open with ${remotePeerEmail} (maxMessageSize: ${dataChannel.maxMessageSize ?? "n/a"})`,
    );
  };

  dataChannel.onmessage = (event) => {
    onMessage?.(event.data);
  };

  dataChannel.onerror = (error) => {
    log.error(`Data channel error:`, error);
  };

  dataChannel.onclose = () => {
    log.log(`Data channel closed with ${remotePeerEmail}`);
  };
}

/**
 * Sends data over the data channel, waiting for buffer drain when needed.
 * Resolves when sent; rejects on timeout, abort, or channel closure.
 */
export function sendDataReliably(dataChannel, data, { signal, timeoutMs = SEND_TIMEOUT_MS } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new Error("Transfer aborted"));
    }

    if (!dataChannel || dataChannel.readyState !== "open") {
      return reject(new Error("Data channel is not open"));
    }

    let drainHandler = null;
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
        drainHandler = () => {
          drainHandler = null;
          attempt();
        };
        dataChannel.addEventListener("bufferedamountlow", drainHandler, {
          once: true,
        });
        return;
      }

      try {
        dataChannel.send(data);
        settle(resolve);
      } catch (err) {
        settle(reject, err);
      }
    };

    attempt();
  });
}
