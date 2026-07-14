import { ICE_SERVERS } from "./iceServers";
import {
  emitIceCandidate,
  emitWebRTCAnswer,
  emitWebRTCOffer,
} from "../socket/socket.handlers";

class RTCPeer {
  _maxRetryCount = 5;

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
    } catch (err) {
      this._onConnectionFailure?.(this.unableToConnect());
    }
  }

  setupDataChannel() {
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

  sendData(data) {
    return new Promise((resolve, reject) => {
      function trySend() {
        if (!this._dataChannel || this._dataChannel.readyState !== "open") {
          reject(new Error("Data channel is not open"));
          return;
        }
        if (
          this._dataChannel.bufferedAmount >= this._bufferedAmountLowThreshold
        ) {
          setTimeout(trySend, 200);
          return;
        }
        try {
          this._dataChannel.send(data);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      }
      trySend();
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
    this._dataChannel?.close();
    this._rtcConnection?.close();
  }

  unableToConnect() {
    return this._remotePeerEmail
      ? `Unable to connect directly to ${this._remotePeerEmail}.`
      : "Unalbe to connect directly";
  }
}

export { RTCPeer };
