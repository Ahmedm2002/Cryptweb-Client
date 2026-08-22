import { STUN_ONLY } from "./iceServers";
import {
  emitWebRTCAnswer,
  emitWebRTCOffer,
} from "../socket/socket.handlers";
import createLogger from "../utils/logger/devLogger.js";
import { diagnoseConnection } from "./connectionDiagnostics.js";
import {
  openDataChannel,
  wireDataChannel,
  sendDataReliably,
} from "./dataChannelSend.js";
import { bindConnectionEvents, startTurnFallbackTimer } from "./connectionEvents.js";
import {
  acquireMediaStream,
  attachStreamToConnection,
  stopStream,
  detachAllTracks,
  toggleStreamTracks,
} from "./mediaControls.js";

const log = createLogger("WebRTC");

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
    this._turnFallbackTimer = null;
    this._localStream = null;
    this._remoteStream = null;
    this._onRemoteStream = null;
  }

  init() {
    log.log(`Initializing peer connection with ${this._remotePeerEmail} (STUN only)`);
    this._rtcConnection = new RTCPeerConnection(STUN_ONLY);
    bindConnectionEvents(this._rtcConnection, this);

    // Start with STUN-only; after 5s without a direct connection, fall back to TURN.
    this._turnFallbackTimer = startTurnFallbackTimer(this._rtcConnection);
  }

  /** Invoked by connectionEvents when the socket-selected channel arrives. */
  attachIncomingDataChannel(channel) {
    this._dataChannel = channel;
    this.setupDataChannel();
  }

  /** Invoked by connectionEvents for each remote audio/video track. */
  addRemoteTrack(track) {
    log.log(`Remote track received from ${this._remotePeerEmail}`);
    if (!this._remoteStream) {
      this._remoteStream = new MediaStream();
    }
    if (!this._remoteStream.getTracks().includes(track)) {
      this._remoteStream.addTrack(track);
    }
    this._onRemoteStream?.(this._remoteStream);
  }

  onConnected() {
    this._clearTurnFallback();
    this.diagnoseConnection();
    this._onConnect?.();
  }

  clearTurnFallback() {
    this._clearTurnFallback();
  }

  async diagnoseConnection() {
    const maxMessageSize = await diagnoseConnection(this._rtcConnection, {
      onStats: this._onConnectionStats,
    });
    this._maxMessageSize = maxMessageSize;
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
    log.warn(
      `Retrying connection (attempt ${this._retryCount}/${this._maxRetryCount}) with ${this._remotePeerEmail}`,
    );
    this._closeChannelAndConnection();

    try {
      this.init();
      this._dataChannel = openDataChannel(this._rtcConnection);
      this.setupDataChannel();
      await this._createAndSendOffer();
    } catch {
      this._onConnectionFailure?.(this.unableToConnect());
    }
  }

  async _createAndSendOffer() {
    const offer = await this._rtcConnection.createOffer();
    await this._rtcConnection.setLocalDescription(offer);
    log.log(`SDP offer created & sent to ${this._remotePeerEmail}`);
    emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
  }

  _closeChannelAndConnection() {
    if (this._dataChannel) {
      this._dataChannel.close();
      this._dataChannel = null;
    }
    if (this._rtcConnection) {
      this._rtcConnection.close();
      this._rtcConnection = null;
    }
  }

  setupDataChannel() {
    wireDataChannel(
      this._dataChannel,
      this._remotePeerEmail,
      (data) => this._onDataChannelMessage?.(data),
    );
  }

  isDataChannelOpen() {
    return this._dataChannel?.readyState === "open";
  }

  isConnected() {
    return this._rtcConnection?.connectionState === "connected";
  }

  hasLocalMedia() {
    return !!this._localStream;
  }

  getDataChannel() {
    return this._dataChannel;
  }

  getMaxMessageSize() {
    return this._maxMessageSize;
  }

  sendData(data, options) {
    return sendDataReliably(this._dataChannel, data, options);
  }

  async createOffer() {
    this._isInitiator = true;

    this._dataChannel = openDataChannel(this._rtcConnection);
    this.setupDataChannel();
    await this._createAndSendOffer();
  }

  async handleOffer(offer) {
    if (this._rtcConnection.signalingState !== "stable") {
      log.warn(`Ignoring offer — signaling state is ${this._rtcConnection.signalingState}`);
      return;
    }

    log.log(`SDP offer received from ${this._remotePeerEmail}, answering`);
    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );

    const answer = await this._rtcConnection.createAnswer();
    await this._rtcConnection.setLocalDescription(answer);

    emitWebRTCAnswer(this._localEmail, this._remotePeerEmail, answer);
  }

  async handleAnswer(answer) {
    log.log(`SDP answer received from ${this._remotePeerEmail}`);
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

  set onRemoteStream(callback) {
    this._onRemoteStream = callback;
  }

  async startMedia(type) {
    log.log(`Acquiring ${type} media stream`);
    const stream = await acquireMediaStream(type);
    this._localStream = stream;
    attachStreamToConnection(this._rtcConnection, stream);
    return stream;
  }

  async renegotiate() {
    await this._createAndSendOffer();
  }

  toggleAudio(enabled) {
    toggleStreamTracks(this._localStream, "audio", enabled);
  }

  toggleVideo(enabled) {
    toggleStreamTracks(this._localStream, "video", enabled);
  }

  stopMedia() {
    stopStream(this._localStream);
    this._localStream = null;
    this._remoteStream = null;
    detachAllTracks(this._rtcConnection);
    this._onRemoteStream = null;
  }

  close() {
    log.log(`Closing peer connection with ${this._remotePeerEmail}`);
    this.stopMedia();
    this._clearTurnFallback();
    this._closeChannelAndConnection();
  }

  _clearTurnFallback() {
    if (this._turnFallbackTimer) {
      clearTimeout(this._turnFallbackTimer);
      this._turnFallbackTimer = null;
    }
  }

  unableToConnect() {
    return this._remotePeerEmail
      ? `Unable to connect directly to ${this._remotePeerEmail}.`
      : "Unable to connect directly";
  }
}

export { RTCPeer };
