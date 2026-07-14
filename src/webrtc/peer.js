import { ICE_SERVERS } from "./iceServers";
import {
  emitIceCandidate,
  emitWebRTCAnswer,
  emitWebRTCOffer,
} from "../socket/socket.handlers";
/**
 * WebRTC peer connection handler for direct P2P communication using DataChannel.
 */
class RTCPeer {
  _maxRetryCount = 5;

  /**
   * Creates a WebRTC peer manager instance.
   * @param {Object} socket - Socket instance for signaling exchange.
   * @param {string} localEmail - Identifier for local peer.
   * @param {string} remotePeerEmail - Identifier for remote peer.
   * @param {Function} onConnect - Callback fired when connection is established.
   * @param {Function} onConnectionFailure - Callback fired when connection fails permanently.
   */
  constructor(
    socket,
    localEmail,
    remotePeerEmail,
    onConnect,
    onConnectionFailure,
  ) {
    this._socket = socket;
    this._retryCount = 0;
    this._localEmail = localEmail;
    this._remotePeerEmail = remotePeerEmail;
    this._onConnect = onConnect;
    this._onConnectionFailure = onConnectionFailure;
    this._onDataChannelMessage = null;
    this._isInitiator = false;
    this._rtcConnection = null;
    this._dataChannel = null;
    this._bufferedAmountLowThreshold = 262144;
    this._pendingSends = [];
  }

  /**
   * Initializes RTCPeerConnection and sets ICE + event handlers.
   */
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
      console.log(`Connection state: ${state} (with ${this._remotePeerEmail})`);

      if (state === "connected") {
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

  /**
   * Handles connection failure and triggers retry or final failure callback.
   */
  async handleConnectionFailure() {
    this._retryCount++;
    console.log("Retrying : ", this._retryCount);

    if (!this._isInitiator || this._retryCount >= this._maxRetryCount) {
      this._onConnectionFailure?.(this.unableToConnect());
      console.log("Max retry calls reached");
      return;
    }
    this.retryConnection();
  }

  /**
   * Recreates WebRTC connection and retries offer negotiation.
   */
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
    } catch (err) {
      console.log("Err :", err);
      this._onConnectionFailure?.(this.unableToConnect());
    }
  }

  /**
   * Configures data channel event listeners.
   */
  setupDataChannel() {
    this._dataChannel.bufferedAmountLowThreshold =
      this._bufferedAmountLowThreshold;

    this._dataChannel.onopen = () => {
      this._flushPendingSends();
    };

    this._dataChannel.onmessage = (event) => {
      this._onDataChannelMessage?.(event.data);
    };

    this._dataChannel.onerror = (error) => {
      console.log(`Data channel error: ${error})`);
    };

    this._dataChannel.onclose = () => {
      console.log(`Data channel closed ${this._remotePeerEmail}`);
    };

    this._dataChannel.onbufferedamountlow = () => {
      this._flushPendingSends();
    };
  }

  /**
   * Drains queued sends when buffer space is available.
   */
  _flushPendingSends() {
    while (this._pendingSends.length > 0) {
      if (
        this._dataChannel.readyState !== "open" ||
        this._dataChannel.bufferedAmount >= this._bufferedAmountLowThreshold
      ) {
        break;
      }
      const entry = this._pendingSends.shift();
      try {
        this._dataChannel.send(entry.data);
        entry.resolve(true);
      } catch (err) {
        entry.reject(err);
      }
    }
  }

  /**
   * Sends data through WebRTC data channel with backpressure handling.
   * Returns a promise that resolves when the data is buffered or rejected on failure.
   * @param {any} data - Serializable payload to send.
   * @returns {Promise<boolean>}
   */
  sendData(data) {
    return new Promise((resolve, reject) => {
      if (!this._dataChannel || this._dataChannel.readyState !== "open") {
        reject(new Error("Data channel is not open"));
        return;
      }

      if (
        this._dataChannel.bufferedAmount >= this._bufferedAmountLowThreshold
      ) {
        this._pendingSends.push({ data, resolve, reject });
        return;
      }

      try {
        this._dataChannel.send(data);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Creates WebRTC offer (initiator flow).
   */
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

  /**
   * Handles incoming WebRTC offer from remote peer.
   * @param {RTCSessionDescriptionInit} offer - Remote SDP offer.
   */
  async handleOffer(offer) {
    if (this._rtcConnection.signalingState !== "stable") return;

    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );

    const answer = await this._rtcConnection.createAnswer();
    await this._rtcConnection.setLocalDescription(answer);

    emitWebRTCAnswer(this._localEmail, this._remotePeerEmail, answer);
  }

  /**
   * Handles SDP answer from remote peer.
   * @param {RTCSessionDescriptionInit} answer - Remote SDP answer.
   */
  async handleAnswer(answer) {
    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  }

  /**
   * Adds ICE candidate received from remote peer.
   * @param {RTCIceCandidateInit} candidate - ICE candidate object.
   */
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

  /**
   * Closes peer connection and data channel.
   */
  close() {
    this._dataChannel?.close();
    this._rtcConnection?.close();
  }

  /**
   * Generates user-friendly connection failure message.
   * @returns {string} failure message
   */
  unableToConnect() {
    return this._remotePeerEmail
      ? `Unable to connect directly to ${this._remotePeerEmail}.`
      : "Unalbe to connect directly";
  }
}

export { RTCPeer };
