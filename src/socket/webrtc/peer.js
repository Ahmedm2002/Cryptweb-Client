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
  constructor(socket, localEmail, remotePeerEmail, onConnect) {
    this._socket = socket;
    this._localEmail = localEmail;
    this._remotePeerEmail = remotePeerEmail;
    this._onConnect = onConnect;
    this._onDataChannelMessage = null;
    this._rtcConnection = new RTCPeerConnection(ICE_SERVERS);

    // Listen for ICE candidates and send them to the peer
    this._rtcConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[WebRTCPeer] Generated ICE candidate, sending to peer...");
        emitIceCandidate(
          this._localEmail,
          this._remotePeerEmail,
          event.candidate,
        );
      }
    };

    // Log connection state changes
    this._rtcConnection.onconnectionstatechange = () => {
      console.log(
        "[WebRTCPeer] Connection State Change:",
        this._rtcConnection.connectionState,
      );
      if (this._rtcConnection.connectionState === "connected") {
        if (this._onConnect) this._onConnect();
      }
    };

    // Handle incoming data channel (for the receiver)
    this._rtcConnection.ondatachannel = (event) => {
      console.log("[WebRTCPeer] Received Data Channel!");
      this._dataChannel = event.channel;
      this._setupDataChannel();
    };
  }

  _setupDataChannel() {
    this._dataChannel.onopen = () => {
      console.log("[WebRTCPeer] Data Channel Opened!");
    };

    this._dataChannel.onmessage = (event) => {
      // If we have a listener registered, pass the data up
      if (this._onDataChannelMessage) {
        this._onDataChannelMessage(event.data);
      } else {
        console.log(`[WebRTCPeer] MESSAGE RECEIVED via Data Channel (No Listener):`, event.data);
      }
    };

    this._dataChannel.onerror = (error) => {
      console.error("[WebRTCPeer] Data Channel Error:", error);
    };

    this._dataChannel.onclose = () => {
      console.log("[WebRTCPeer] Data Channel Closed");
    };
  }

  sendData(data) {
    if (this._dataChannel && this._dataChannel.readyState === "open") {
      this._dataChannel.send(data);
      return true;
    }
    console.error("[WebRTCPeer] Cannot send data: Data channel is not open");
    return false;
  }

  async createOffer() {
    // IMPORTANT: Create data channel BEFORE creating the offer,
    // so the SDP includes the data channel negotiation.
    this._dataChannel = this._rtcConnection.createDataChannel(
      "channel:file-transfer",
      { ordered: true },
    );
    this._setupDataChannel();

    const offer = await this._rtcConnection.createOffer();
    await this._rtcConnection.setLocalDescription(offer);

    console.log("[WebRTCPeer] Emitting WebRTC Offer");
    emitWebRTCOffer(this._localEmail, this._remotePeerEmail, offer);
  }

  async handleOffer(offer) {
    if (this._rtcConnection.signalingState !== "stable") {
      console.warn(
        "Ignoring offer, state is not stable:",
        this._rtcConnection.signalingState,
      );
      return;
    }

    console.log("[WebRTCPeer] Handling incoming offer...");
    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(offer),
    );

    const answer = await this._rtcConnection.createAnswer();
    await this._rtcConnection.setLocalDescription(answer);
    console.log("[WebRTCPeer] Emitting WebRTC Answer");
    emitWebRTCAnswer(this._localEmail, this._remotePeerEmail, answer);
  }

  async handleAnswer(answer) {
    console.log(
      "[WebRTCPeer] Handling answer. Current Ice Connection State:",
      this._rtcConnection.iceConnectionState,
    );
    await this._rtcConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  }

  handleIceCandidate(candidate) {
    console.log("[WebRTCPeer] handleIceCandidate received from remote peer");
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
      console.log(
        "[WebRTCPeer] Queuing ICE candidate (remote description not set yet)",
      );
      // Note: Ideally, you'd queue this if remoteDescription isn't set,
      // but for simplicity we rely on the state here.
    }
  }
}

export { RTCPeer };
