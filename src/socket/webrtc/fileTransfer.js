import { createChunks, reconstructFile, CHUNK_SIZE } from "./chunking.js";

export class FileTransferManager {
  constructor(dataChannelManager, transferQueue, onProgress) {
    this.dataChannelManager = dataChannelManager;
    this.transferQueue = transferQueue;
    this.onProgress = onProgress;
    this.currentTransferId = null;

    this.dataChannelManager.onMessage((event) => this.handleMessage(event));
  }

  handleMessage(event) {
    if (typeof event.data === "string") {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "file-meta") {
          console.log("Receiving file meta:", payload);
          this.transferQueue.add(payload.fileId, payload);
          if (this.onProgress) this.onProgress();
        } else if (payload.type === "file-complete") {
          console.log("Transfer complete received for:", payload.fileId);
          const transfer = this.transferQueue.get(payload.fileId);
          if (transfer) {
            reconstructFile(transfer.chunks, transfer.mimeType, transfer.fileName);
            this.transferQueue.complete(payload.fileId);
            if (this.onProgress) this.onProgress();
          }
        } else if (payload.type === "file-cancel") {
          this.transferQueue.cancel(payload.fileId);
          if (this.onProgress) this.onProgress();
        }
      } catch (err) {
        console.error("Failed to parse string message", err);
      }
    } else if (event.data instanceof ArrayBuffer) {
      // It's a chunk
      // We assume chunks arrive ordered and we apply to the pending transfer
      const activeTransfers = this.transferQueue.getAll().filter(t => t.status === "transferring" || t.status === "pending");
      const activeTransfer = activeTransfers.length > 0 ? activeTransfers[0] : null;

      if (activeTransfer) {
        if (activeTransfer.status === "pending") {
          activeTransfer.status = "transferring";
          activeTransfer.startTime = Date.now();
        }
        
        this.transferQueue.addChunk(activeTransfer.fileId, event.data);
        
        const progress = Math.round((activeTransfer.receivedSize / activeTransfer.fileSize) * 100);
        const elapsed = (Date.now() - activeTransfer.startTime) / 1000;
        const speed = elapsed > 0 ? (activeTransfer.receivedSize / elapsed / 1024 / 1024) : 0;
        
        this.transferQueue.updateProgress(activeTransfer.fileId, progress, speed);
        
        if (this.onProgress) this.onProgress();
      }
    }
  }

  sendFile(file) {
    const fileId = crypto.randomUUID();
    const meta = {
      type: "file-meta",
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE)
    };

    this.transferQueue.add(fileId, meta);
    this.transferQueue.get(fileId).startTime = Date.now();
    this.dataChannelManager.send(JSON.stringify(meta));
    
    if (this.onProgress) this.onProgress();

    const channel = this.dataChannelManager.getChannel();

    const chunkReader = createChunks(file, (buffer, chunkNo, totalChunks, offset, readNext) => {
      // Check if cancelled
      const transfer = this.transferQueue.get(fileId);
      if (!transfer || transfer.status === "cancelled") {
        return;
      }

      try {
        this.dataChannelManager.send(buffer);
      } catch (err) {
        console.error("Error sending buffer:", err);
        this.transferQueue.updateProgress(fileId, transfer.progress, 0, "error");
        if (this.onProgress) this.onProgress();
        return;
      }

      const progress = Math.round((offset / file.size) * 100);
      const elapsed = (Date.now() - transfer.startTime) / 1000;
      const speed = elapsed > 0 ? (offset / elapsed / 1024 / 1024) : 0;
      
      this.transferQueue.updateProgress(fileId, progress, speed);
      if (this.onProgress) this.onProgress();

      if (offset < file.size) {
        if (channel.bufferedAmount > channel.bufferedAmountLowThreshold) {
          channel.onbufferedamountlow = () => {
            channel.onbufferedamountlow = null;
            readNext();
          };
        } else {
          readNext();
        }
      } else {
        // Complete
        this.dataChannelManager.send(JSON.stringify({ type: "file-complete", fileId }));
        this.transferQueue.complete(fileId);
        if (this.onProgress) this.onProgress();
      }
    });

    chunkReader.start();
  }

  cancelTransfer(fileId) {
    this.dataChannelManager.send(JSON.stringify({ type: "file-cancel", fileId }));
    this.transferQueue.cancel(fileId);
    if (this.onProgress) this.onProgress();
  }
}
