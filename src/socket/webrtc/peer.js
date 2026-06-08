import {
  emitWebRTCOffer,
  emitWebRTCAnswer,
  emitIceCandidate,
} from "../socket.handlers.js";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

class RTCPeer {
  constructor(socket, localEmail, remotePeerEmail, onConnect, onConnectionFailure) {
    this._socket = socket;
    this._localEmail = localEmail;
    this._remotePeerEmail = remotePeerEmail;
    this._onConnect = onConnect;
    this._onConnectionFailure = onConnectionFailure;
    this._onDataChannelMessage = null;
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
      if (state === "connected") {
        if (this._onConnect) this._onConnect();
      } else if (state === "failed") {
        if (this._onConnectionFailure) this._onConnectionFailure("Connection failed. Please try again.");
      } else if (state === "disconnected") {
        if (this._onConnectionFailure) this._onConnectionFailure("Connection lost. The peer may have disconnected.");
      }
    };

    this._rtcConnection.ondatachannel = (event) => {
      this._dataChannel = event.channel;
      this._setupDataChannel();
    };
  }

  _setupDataChannel() {
    this._dataChannel.onopen = () => {};

    this._dataChannel.onmessage = (event) => {
      if (this._onDataChannelMessage) {
        this._onDataChannelMessage(event.data);
      }
    };

    this._dataChannel.onerror = () => {};

    this._dataChannel.onclose = () => {};
  }

  sendData(data) {
    if (this._dataChannel && this._dataChannel.readyState === "open") {
      this._dataChannel.send(data);
      return true;
    }
    return false;
  }

  async createOffer() {
    this._dataChannel = this._rtcConnection.createDataChannel(
      "channel:file-transfer",
      { ordered: true },
    );
    this._setupDataChannel();

    const offer = await this._rtcConnection.createOffer();
    await this._rtcConnection.setLocalDescription(offer);
    emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
  }

  async handleOffer(offer) {
    if (this._rtcConnection.signalingState !== "stable") {
      return;
    }

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
      this._dataChannel.close();
    }
    if (this._rtcConnection) {
      this._rtcConnection.close();
    }
  }
}

export { RTCPeer };
