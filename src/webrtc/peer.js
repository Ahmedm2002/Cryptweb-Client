import { ICE_SERVERS } from "./iceServers";
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

    if (!this._isInitiator || this._retryCount >= this._maxRetryCount) {
      this._onConnectionFailure?.(this.unableToConnect());
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
      this.createConnection();

      this._dataChannel = this._rtcConnection.createDataChannel(
        "channel:file-transfer",
        { ordered: true },
      );

      this._setupDataChannel();

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
    this._dataChannel.onopen = () => {};

    this._dataChannel.onmessage = (event) => {
      this._onDataChannelMessage?.(event.data);
    };

    this._dataChannel.onerror = (error) => {
      console.log(`Data channel error: ${error})`);
    };

    this._dataChannel.onclose = () => {
      console.log(`Data channel closed ${this._remotePeerEmail}`);
    };
  }

  /**
   * Sends data through WebRTC data channel.
   * @param {any} data - Serializable payload to send.
   * @returns {boolean} true if sent, false if channel is not open.
   */
  sendData(data) {
    if (this._dataChannel && this._dataChannel.readyState === "open") {
      this._dataChannel.send(data);
      return true;
    }
    return false;
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
