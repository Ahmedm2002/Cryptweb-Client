export class ConnectionLifecycle {
  constructor(peerConnection, onDisconnect) {
    this.peerConnection = peerConnection;
    this.onDisconnect = onDisconnect;
    this.setupListeners();
  }

  setupListeners() {
    this.peerConnection.onconnectionstatechange = () => {
      console.log("Connection State:", this.peerConnection.connectionState);
      if (
        this.peerConnection.connectionState === "failed" ||
        this.peerConnection.connectionState === "disconnected" ||
        this.peerConnection.connectionState === "closed"
      ) {
        if (this.onDisconnect) this.onDisconnect();
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", this.peerConnection.iceConnectionState);
      if (
        this.peerConnection.iceConnectionState === "failed" ||
        this.peerConnection.iceConnectionState === "disconnected" ||
        this.peerConnection.iceConnectionState === "closed"
      ) {
        if (this.onDisconnect) this.onDisconnect();
      }
    };
  }

  cleanup() {
    if (this.peerConnection) {
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.close();
    }
  }
}
