export class DataChannelManager {
  constructor(peerConnection) {
    this.peerConnection = peerConnection;
    this.channel = null;
    this.onMessageCallback = null;
    this.onOpenCallback = null;
    this.onCloseCallback = null;
  }

  createChannel(label = "channel:file-transfer") {
    this.channel = this.peerConnection.createDataChannel(label, { ordered: true });
    this._setupChannel();
    return this.channel;
  }

  handleIncomingChannel(event) {
    this.channel = event.channel;
    this._setupChannel();
    return this.channel;
  }

  _setupChannel() {
    if (!this.channel) return;
    this.channel.binaryType = "arraybuffer";
    this.channel.bufferedAmountLowThreshold = 65536; // 64KB target buffer

    this.channel.onopen = () => {
      console.log("Data channel opened");
      if (this.onOpenCallback) this.onOpenCallback();
    };

    this.channel.onclose = () => {
      console.log("Data channel closed");
      if (this.onCloseCallback) this.onCloseCallback();
    };

    this.channel.onmessage = (event) => {
      if (this.onMessageCallback) this.onMessageCallback(event);
    };

    this.channel.onerror = (err) => {
      console.error("Data channel error:", err);
    };
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  onOpen(callback) {
    this.onOpenCallback = callback;
  }

  onClose(callback) {
    this.onCloseCallback = callback;
  }

  send(data) {
    if (this.channel && this.channel.readyState === "open") {
      this.channel.send(data);
    } else {
      console.error("Cannot send data, channel not open");
    }
  }

  getChannel() {
    return this.channel;
  }

  cleanup() {
    if (this.channel) {
      this.channel.onopen = null;
      this.channel.onclose = null;
      this.channel.onmessage = null;
      this.channel.onerror = null;
      this.channel.close();
      this.channel = null;
    }
  }
}
