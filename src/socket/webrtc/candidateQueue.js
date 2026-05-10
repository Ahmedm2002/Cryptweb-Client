export class CandidateQueue {
  constructor() {
    this.queue = [];
  }

  add(candidate) {
    this.queue.push(candidate);
  }

  flush(peerConnection) {
    while (this.queue.length > 0) {
      const candidate = this.queue.shift();
      if (candidate) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
          console.error("Error adding queued ICE candidate:", err);
        });
      }
    }
  }

  clear() {
    this.queue = [];
  }
}
