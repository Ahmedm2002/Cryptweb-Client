import { ICE_SERVERS } from "./iceServers";
import {
  emitIceCandidate,
  emitWebRTCAnswer,
  emitWebRTCOffer,
} from "../socket/socket.handlers";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("RTCPeer");

const BUFFER_LOW_THRESHOLD = 262144;
const SEND_TIMEOUT_MS = 30000;

class RTCPeer {
  _maxRetryCount = 5;

  constructor(
    socket,
    localEmail,
    remotePeerEmail,
    onConnect,
    onConnectionFailure,
    onConnectionStats,
  ) {
    this._socket = socket;
    this._retryCount = 0;
    this._localEmail = localEmail;
    this._remotePeerEmail = remotePeerEmail;
    this._onConnect = onConnect;
    this._onConnectionFailure = onConnectionFailure;
    this._onConnectionStats = onConnectionStats;
    this._onDataChannelMessage = null;
    this._isInitiator = false;
    this._rtcConnection = null;
    this._dataChannel = null;
    this._maxMessageSize = 65536;
  }

  init() {
    this._rtcConnection = new RTCPeerConnection(ICE_SERVERS);

    this._rtcConnection.onicecandidate = (event) => {
      if (event.candidate) {
        emitIceCandidate(
          this._localEmail,
          this._remotePeerEmail,
          event.candidate,
        );
      }
    };

    this._rtcConnection.onconnectionstatechange = () => {
      const state = this._rtcConnection.connectionState;
      log.log(`Connection state: ${state} (with ${this._remotePeerEmail})`);

      if (state === "connected") {
        this.diagnoseConnection();
        this._onConnect?.();
      } else if (state === "failed") {
        this.handleConnectionFailure();
      }
    };

    this._rtcConnection.ondatachannel = (event) => {
      this._dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  async diagnoseConnection() {
    try {
      const stats = await this._rtcConnection.getStats();
      let transport = null;
      stats.forEach((report) => {
        if (report.type === "transport") transport = report;
      });

      let localType = "unknown";
      let remoteType = "unknown";

      if (transport?.selectedCandidatePairId) {
        const pair = stats.get(transport.selectedCandidatePairId);
        if (pair) {
          const local = stats.get(pair.localCandidateId);
          const remote = stats.get(pair.remoteCandidateId);
          localType = local?.candidateType || "unknown";
          remoteType = remote?.candidateType || "unknown";
        }
      }

      this._maxMessageSize =
        this._rtcConnection?.sctp?.maxMessageSize || 65536;
      const relayed =
        localType === "relay" || remoteType === "relay";

      log.log(
        `Connection using: ${localType}↔${remoteType}${relayed ? " ⚠️ RELAYING THROUGH TURN" : ""}`,
      );
      log.log(`SCTP maxMessageSize: ${this._maxMessageSize}`);

      if (relayed) {
        log.warn(
          "⚠️  ICE candidate pair is RELAY (TURN). On same-LAN, this explains slow transfers.",
        );
      }

      this._onConnectionStats?.({
        localCandidateType: localType,
        remoteCandidateType: remoteType,
        candidateType: `${localType}↔${remoteType}`,
        relayed,
        maxMessageSize: this._maxMessageSize,
      });
    } catch (err) {
      log.error("Failed to get connection stats:", err);
    }
  }

  async handleConnectionFailure() {
    this._retryCount++;

    if (!this._isInitiator || this._retryCount >= this._maxRetryCount) {
      this._onConnectionFailure?.(this.unableToConnect());
      return;
    }
    this.retryConnection();
  }

  async retryConnection() {
    if (this._dataChannel) {
      this._dataChannel.close();
      this._dataChannel = null;
    }

    if (this._rtcConnection) {
      this._rtcConnection.close();
      this._rtcConnection = null;
    }

    try {
      this.init();
      this._dataChannel = this._rtcConnection.createDataChannel(
        "channel:file-transfer",
        { ordered: true },
      );
      this.setupDataChannel();
      const offer = await this._rtcConnection.createOffer();
      await this._rtcConnection.setLocalDescription(offer);
      emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
    } catch {
      this._onConnectionFailure?.(this.unableToConnect());
    }
  }

  setupDataChannel() {
    this._dataChannel.bufferedAmountLowThreshold = BUFFER_LOW_THRESHOLD;

    this._dataChannel.onopen = () => {
      log.log(`Data channel open with ${this._remotePeerEmail}`);
    };

    this._dataChannel.onmessage = (event) => {
      this._onDataChannelMessage?.(event.data);
    };

    this._dataChannel.onerror = (error) => {
      log.error(`Data channel error:`, error);
    };

    this._dataChannel.onclose = () => {
      log.log(`Data channel closed with ${this._remotePeerEmail}`);
    };
  }

  isDataChannelOpen() {
    return this._dataChannel?.readyState === "open";
  }

  getDataChannel() {
    return this._dataChannel;
  }

  getMaxMessageSize() {
    return this._maxMessageSize;
  }

  sendData(data, { signal, timeoutMs = SEND_TIMEOUT_MS } = {}) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        return reject(new Error("Transfer aborted"));
      }

      if (!this._dataChannel || this._dataChannel.readyState !== "open") {
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
        if (drainHandler && this._dataChannel) {
          this._dataChannel.removeEventListener(
            "bufferedamountlow",
            drainHandler,
          );
          drainHandler = null;
        }
      };

      const attempt = () => {
        if (settled) return;

        if (signal?.aborted) {
          settled = true;
          cleanup();
          return reject(new Error("Transfer aborted"));
        }

        if (!this._dataChannel || this._dataChannel.readyState !== "open") {
          settled = true;
          cleanup();
          return reject(new Error("Data channel closed during transfer"));
        }

        if (
          this._dataChannel.bufferedAmount >
          this._dataChannel.bufferedAmountLowThreshold
        ) {
          drainHandler = () => {
            drainHandler = null;
            attempt();
          };
          this._dataChannel.addEventListener(
            "bufferedamountlow",
            drainHandler,
            { once: true },
          );
          return;
        }

        try {
          this._dataChannel.send(data);
          settled = true;
          cleanup();
          resolve();
        } catch (err) {
          settled = true;
          cleanup();
          reject(err);
        }
      };

      attempt();
    });
  }

  async createOffer() {
    this._isInitiator = true;

    this._dataChannel = this._rtcConnection.createDataChannel(
      "channel:file-transfer",
      { ordered: true },
    );

    this.setupDataChannel();

    const offer = await this._rtcConnection.createOffer();
    await this._rtcConnection.setLocalDescription(offer);

    emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
  }

  async handleOffer(offer) {
    if (this._rtcConnection.signalingState !== "stable") return;

    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );

    const answer = await this._rtcConnection.createAnswer();
    await this._rtcConnection.setLocalDescription(answer);

    emitWebRTCAnswer(this._localEmail, this._remotePeerEmail, answer);
  }

  async handleAnswer(answer) {
    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  }

  handleIceCandidate(candidate) {
    if (
      this._rtcConnection.remoteDescription &&
      this._rtcConnection.remoteDescription.type
    ) {
      this._rtcConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(() => {});
    }
  }

  close() {
    if (this._dataChannel) {
      try { this._dataChannel.close(); } catch { /* already closed */ }
      this._dataChannel = null;
    }
    if (this._rtcConnection) {
      try { this._rtcConnection.close(); } catch { /* already closed */ }
      this._rtcConnection = null;
    }
  }

  unableToConnect() {
    return this._remotePeerEmail
      ? `Unable to connect directly to ${this._remotePeerEmail}.`
      : "Unable to connect directly";
  }
}

export { RTCPeer };
