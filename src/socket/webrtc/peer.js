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
  static offerSent = false;
  constructor(socket, localEmail, remotePeerEmail) {
    this._socket = socket;
    this._localEmail = localEmail;
    this._remotePeerEmail = remotePeerEmail;
    this._rtcConnection = new RTCPeerConnection(ICE_SERVERS);
  }

  async createOffer() {
    if (RTCPeer.offerSent) return;
    console.log("Offer not send so sending it");
    const offer = await this._rtcConnection.createOffer();
    await this._rtcConnection.setLocalDescription(offer);

    // const channel = this._rtcConnection.createDataChannel(
    //   "channle:file-transfer",
    //   { ordered: true },
    // );

    // channel.onopen = () => console.log("Data Channel Opened");
    // channel.onerror = (e) => console.log("Error occured: ", { err });
    // channel.onclose = () => console.log("Data Channle Closed");

    emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
    RTCPeer.offerSent = true;
  }

  async handleOffer(offer) {
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

    const answer = await this._rtcConnection.createAnswer();
    await this._rtcConnection.setLocalDescription(answer);
    emitWebRTCAnswer(this._localEmail, this._remotePeerEmail, answer);
  }

  async handleAnswer(answer) {
    console.log(
      "Ice Connection State: ",
      this._rtcConnection.iceConnectionState,
    );
    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
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
    }
  }
}

export { RTCPeer };
