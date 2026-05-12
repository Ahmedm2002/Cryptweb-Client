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
  constructor(socket, localEmail, remotePeerEmail) {
    this._socket = socket;
    this._localEmail = localEmail;
    this._remotePeerEmail = remotePeerEmail;
    this._rtcConnection = new RTCPeerConnection(ICE_SERVERS);

    this._rtcConnection.onicecandidate = (event) => {
      console.log("[Webrtc Event] On ice candidate");
      if (event.candidate) {
        emitIceCandidate(
          this._localEmail,
          this._remotePeerEmail,
          event.candidate,
        );
      }
    };
  }

  async createOffer() {
    console.log("[WebRTCPeer] createOffer started");
    const offer = await this._rtcConnection.createOffer();
    await this._rtcConnection.setLocalDescription(offer);

    console.log("[WebRTCPeer] Emitting WebRTC offer", offer);
    emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
  }

  async handleOffer(offer) {
    console.log(
      "handleOffer Current state:",
      this._rtcConnection.signalingState,
    );
    if (this._rtcConnection.signalingState !== "stable") {
      console.warn(
        "Ignoring offer, state is not stable:",
        this._rtcConnection.signalingState,
      );
      return;
    }

    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );
    console.log("[WebRTCPeer] Remote description set successfully");
    this.candidateQueue.flush(this._rtcConnection);

    const answer = await this._rtcConnection.createAnswer();
    await this._rtcConnection.setLocalDescription(answer);

    console.log("[WebRTCPeer] Emitting WebRTC answer");
    emitWebRTCAnswer(this._localEmail, this._remotePeerEmail, answer);
  }

  async handleAnswer(answer) {
    console.log(
      "[WebRTCPeer] handleAnswer started. Current state:",
      this._rtcConnection.signalingState,
    );
    if (this._rtcConnection.signalingState === "have-local-offer") {
      await this._rtcConnection.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      console.log("[WebRTCPeer] Answer set successfully as remote description");
      this.candidateQueue.flush(this._rtcConnection);
    } else {
      console.warn(
        "[WebRTCPeer] Ignored answer because state is",
        this._rtcConnection.signalingState,
      );
    }
  }

  handleIceCandidate(candidate) {
    console.log("[WebRTCPeer] handleIceCandidate received");
    if (
      this._rtcConnection.remoteDescription &&
      this._rtcConnection.remoteDescription.type
    ) {
      this._rtcConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .then(() => {
          console.log("[WebRTCPeer] ICE candidate added successfully");
        })
        .catch((err) => {
          console.error("[WebRTCPeer] Error adding ICE candidate:", err);
        });
    } else {
      console.log("[WebRTCPeer] Queuing ICE candidate");
      this.candidateQueue.add(candidate);
    }
  }

  cleanup() {
    this.candidateQueue.clear();
    this.dataChannelManager.cleanup();
    this.lifecycle.cleanup();
  }

  getDataChannelManager() {
    return this.dataChannelManager;
  }
}

export { RTCPeer };
