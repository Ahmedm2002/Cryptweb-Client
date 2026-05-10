import { CandidateQueue } from "./candidateQueue.js";
import { ConnectionLifecycle } from "./connectionLifecycle.js";
import { DataChannelManager } from "./dataChannel.js";
import { emitWebRTCOffer, emitWebRTCAnswer, emitIceCandidate } from "../socket.handlers.js";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" }
  ],
};

export class WebRTCPeer {
  constructor(socket, onDisconnect, onChannelCreated) {
    this.socket = socket;
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
    this.candidateQueue = new CandidateQueue();
    this.dataChannelManager = new DataChannelManager(this.peerConnection);
    
    this.lifecycle = new ConnectionLifecycle(this.peerConnection, () => {
      this.cleanup();
      if (onDisconnect) onDisconnect();
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        emitIceCandidate(this.socket, this.localEmail, this.remotePeerEmail, event.candidate);
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      const channel = this.dataChannelManager.handleIncomingChannel(event);
      if (onChannelCreated) onChannelCreated(channel);
    };
  }

  setEndpoints(localEmail, remotePeerEmail) {
    this.localEmail = localEmail;
    this.remotePeerEmail = remotePeerEmail;
  }

  async createOffer() {
    console.log("[WebRTCPeer] createOffer started");
    this.dataChannelManager.createChannel();
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    console.log("[WebRTCPeer] Emitting WebRTC offer", offer);
    emitWebRTCOffer(this.socket, this.localEmail, this.remotePeerEmail, offer);
  }

  async handleOffer(offer) {
    console.log("[WebRTCPeer] handleOffer started. Current state:", this.peerConnection.signalingState);
    if (this.peerConnection.signalingState !== "stable") {
      console.warn("[WebRTCPeer] Ignoring offer, state is not stable:", this.peerConnection.signalingState);
      return;
    }
    
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("[WebRTCPeer] Remote description set successfully");
    this.candidateQueue.flush(this.peerConnection);
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    console.log("[WebRTCPeer] Emitting WebRTC answer");
    emitWebRTCAnswer(this.socket, this.localEmail, this.remotePeerEmail, answer);
  }

  async handleAnswer(answer) {
    console.log("[WebRTCPeer] handleAnswer started. Current state:", this.peerConnection.signalingState);
    if (this.peerConnection.signalingState === "have-local-offer") {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("[WebRTCPeer] Answer set successfully as remote description");
      this.candidateQueue.flush(this.peerConnection);
    } else {
      console.warn("[WebRTCPeer] Ignored answer because state is", this.peerConnection.signalingState);
    }
  }

  handleIceCandidate(candidate) {
    console.log("[WebRTCPeer] handleIceCandidate received");
    if (this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {
        console.log("[WebRTCPeer] ICE candidate added successfully");
      }).catch(err => {
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
