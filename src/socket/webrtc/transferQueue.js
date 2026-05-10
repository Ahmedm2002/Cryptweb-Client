export class TransferQueue {
  constructor() {
    this.transfers = new Map();
  }

  add(fileId, fileInfo) {
    this.transfers.set(fileId, {
      ...fileInfo,
      progress: 0,
      status: "pending", // pending, transferring, paused, completed, cancelled, error
      chunks: [], // For receiver
      receivedSize: 0,
      startTime: null,
      speed: 0
    });
  }

  updateProgress(fileId, progress, speed, status = "transferring") {
    const transfer = this.transfers.get(fileId);
    if (transfer) {
      transfer.progress = progress;
      transfer.speed = speed;
      transfer.status = status;
    }
  }

  addChunk(fileId, chunk) {
    const transfer = this.transfers.get(fileId);
    if (transfer) {
      transfer.chunks.push(chunk);
      transfer.receivedSize += chunk.byteLength;
    }
  }

  complete(fileId) {
    const transfer = this.transfers.get(fileId);
    if (transfer) {
      transfer.progress = 100;
      transfer.status = "completed";
    }
  }

  cancel(fileId) {
    const transfer = this.transfers.get(fileId);
    if (transfer) {
      transfer.status = "cancelled";
      transfer.chunks = []; // free memory
    }
  }

  get(fileId) {
    return this.transfers.get(fileId);
  }

  getAll() {
    return Array.from(this.transfers.values());
  }

  remove(fileId) {
    this.transfers.delete(fileId);
  }

  clear() {
    this.transfers.clear();
  }
}
