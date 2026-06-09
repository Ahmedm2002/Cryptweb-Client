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
    console.log(`[WebRTC] Creating RTCPeerConnection: local=${localEmail} remote=${remotePeerEmail}`);
    this._rtcConnection = new RTCPeerConnection(ICE_SERVERS);

    this._rtcConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC] ICE candidate generated for ${this._remotePeerEmail}`);
        emitIceCandidate(
          this._localEmail,
          this._remotePeerEmail,
          event.candidate,
        );
      } else {
        console.log(`[WebRTC] All ICE candidates sent for ${this._remotePeerEmail}`);
      }
    };

    this._rtcConnection.onconnectionstatechange = () => {
      const state = this._rtcConnection.connectionState;
      console.log(`[WebRTC] Connection state change: ${state} (local=${this._localEmail}, remote=${this._remotePeerEmail})`);
      if (state === "connected") {
        console.log(`[WebRTC] Connection established with ${this._remotePeerEmail}`);
        if (this._onConnect) this._onConnect();
      } else if (state === "failed") {
        console.log(`[WebRTC] Connection FAILED with ${this._remotePeerEmail}`);
        if (this._onConnectionFailure) this._onConnectionFailure("Connection failed. Please try again.");
      } else if (state === "disconnected") {
        console.log(`[WebRTC] Connection DISCONNECTED from ${this._remotePeerEmail}`);
        if (this._onConnectionFailure) this._onConnectionFailure("Connection lost. The peer may have disconnected.");
      }
    };

    this._rtcConnection.ondatachannel = (event) => {
      console.log(`[WebRTC] Incoming data channel received: ${event.channel.label}`);
      this._dataChannel = event.channel;
      this._setupDataChannel();
    };

    this._rtcConnection.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE connection state: ${this._rtcConnection.iceConnectionState} (remote=${this._remotePeerEmail})`);
    };

    this._rtcConnection.onsignalingstatechange = () => {
      console.log(`[WebRTC] Signaling state: ${this._rtcConnection.signalingState} (remote=${this._remotePeerEmail})`);
    };
  }

  _setupDataChannel() {
    this._dataChannel.onopen = () => {
      console.log(`[WebRTC] Data channel opened: ${this._dataChannel.label} (remote=${this._remotePeerEmail})`);
    };

    this._dataChannel.onmessage = (event) => {
      console.log(`[WebRTC] Data channel message received (${event.data.length} chars)`);
      if (this._onDataChannelMessage) {
        this._onDataChannelMessage(event.data);
      }
    };

    this._dataChannel.onerror = (err) => {
      console.log(`[WebRTC] Data channel error:`, err);
    };

    this._dataChannel.onclose = () => {
      console.log(`[WebRTC] Data channel closed: ${this._dataChannel.label} (remote=${this._remotePeerEmail})`);
    };
  }

  sendData(data) {
    if (this._dataChannel && this._dataChannel.readyState === "open") {
      console.log(`[WebRTC] Sending data (${typeof data === 'string' ? data.length + ' chars' : 'non-string'}) to ${this._remotePeerEmail}`);
      this._dataChannel.send(data);
      return true;
    }
    console.log(`[WebRTC] Cannot send data — data channel not open. State: ${this._dataChannel?.readyState}`);
    return false;
  }

  async createOffer() {
    console.log(`[WebRTC] Creating data channel & offer for ${this._remotePeerEmail}`);
    this._dataChannel = this._rtcConnection.createDataChannel(
      "channel:file-transfer",
      { ordered: true },
    );
    this._setupDataChannel();

    const offer = await this._rtcConnection.createOffer();
    console.log(`[WebRTC] Offer created, setting local description`);
    await this._rtcConnection.setLocalDescription(offer);
    console.log(`[WebRTC] Emitting offer to ${this._remotePeerEmail}`);
    emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
  }

  async handleOffer(offer) {
    console.log(`[WebRTC] Handling offer from ${this._remotePeerEmail}, signalingState=${this._rtcConnection.signalingState}`);
    if (this._rtcConnection.signalingState !== "stable") {
      console.log(`[WebRTC] Ignoring offer — not in stable state`);
      return;
    }

    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );
    console.log(`[WebRTC] Remote description set, creating answer`);

    const answer = await this._rtcConnection.createAnswer();
    await this._rtcConnection.setLocalDescription(answer);
    console.log(`[WebRTC] Emitting answer to ${this._remotePeerEmail}`);
    emitWebRTCAnswer(this._localEmail, this._remotePeerEmail, answer);
  }

  async handleAnswer(answer) {
    console.log(`[WebRTC] Handling answer from ${this._remotePeerEmail}`);
    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
    console.log(`[WebRTC] Remote description set from answer`);
  }

  handleIceCandidate(candidate) {
    if (
      this._rtcConnection.remoteDescription &&
      this._rtcConnection.remoteDescription.type
    ) {
      console.log(`[WebRTC] Adding ICE candidate from ${this._remotePeerEmail}`);
      this._rtcConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .then(() => console.log(`[WebRTC] ICE candidate added successfully`))
        .catch((err) => console.log(`[WebRTC] Failed to add ICE candidate:`, err));
    } else {
      console.log(`[WebRTC] Cannot add ICE candidate — no remote description yet`);
    }
  }

  close() {
    console.log(`[WebRTC] Closing peer connection with ${this._remotePeerEmail}`);
    if (this._dataChannel) {
      this._dataChannel.close();
    }
    if (this._rtcConnection) {
      this._rtcConnection.close();
    }
  }
}

export { RTCPeer };
