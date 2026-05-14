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
  }

  getInstance() {
    console.log("Status: ", RTCPeer.instance);
    if (RTCPeer.instance) {
      return RTCPeer.instance;
    }
  }

  async createOffer() {
    console.log("Mn offer banara raha hn");
    const offer = await this._rtcConnection.createOffer();
    await this._rtcConnection.setLocalDescription(offer);
    console.log(
      "Mera status after creation and setting offer: ",
      this._rtcConnection,
    );
    // const channel = this._rtcConnection.createDataChannel(
    //   "channle:file-transfer",
    //   { ordered: true },
    // );

    // channel.onopen = () => console.log("Data Channel Opened");
    // channel.onerror = (e) => console.log("Error occured: ", { err });
    // channel.onclose = () => console.log("Data Channle Closed");

    console.log("Mn offer bejh raha hn");
    emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
  }

  async handleOffer(offer) {
    console.log("Offer aye ha mere pas: ", offer);
    console.log("Mera Status: ", this._rtcConnection);
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
    console.log(
      "Mera Status after setting remote description: ",
      this._rtcConnection,
    );
    // this.candidateQueue.flush(this._rtcConnection);

    const answer = await this._rtcConnection.createAnswer();
    await this._rtcConnection.setLocalDescription(answer);
    console.log(
      "anser create ker dyia or set b ker dyia: ",
      this._rtcConnection,
    );
    console.log("[WebRTCPeer] Emitting answer");
    emitWebRTCAnswer(this._localEmail, this._remotePeerEmail, answer);
  }

  async handleAnswer(answer) {
    console.log(this._rtcConnection);
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
      // this.candidateQueue.add(candidate);
    }
  }

  // cleanup() {
  //   this._rtcConnection.removeEventListener("datachannel");
  // }
}

export { RTCPeer };
