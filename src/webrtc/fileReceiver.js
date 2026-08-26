import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("FileTransfer");

/**
 * Assembles one incoming file from data-channel messages/chunks.
 * Handles a single active incoming transfer at a time (protocol limit).
 */
export class IncomingFileAssembler {
  constructor() {
    this.reset();
  }

  reset() {
    this.id = null;
    this.meta = null;
    this.chunks = [];
  }

  get active() {
    return !!this.id;
  }

  /**
   * Registers a new incoming transfer from its metadata message.
   * @returns transfer descriptor for UI state
   */
  begin(id, msg) {
    this.id = id;
    this.meta = {
      name: msg.fileName,
      size: msg.fileSize,
      type: msg.fileType,
      totalChunks: msg.totalChunks,
    };
    this.chunks = [];
    log.log(
      `Receive started: "${msg.fileName}" (${(msg.fileSize / 1048576).toFixed(2)}MB), chunks=${msg.totalChunks}`,
    );
    return { id, ...this.meta };
  }

  /**
   * Buffers a raw chunk packet (9-byte header + payload).
   * @returns {chunkIndex, totalChunks}
   */
  pushChunk(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const chunkIndex = view.getUint32(1, false);
    const totalChunks = view.getUint32(5, false);
    this.chunks.push(new Uint8Array(arrayBuffer, 9));
    return { chunkIndex, totalChunks };
  }

  /**
   * Verifies counts/size and assembles the final blob on completion signal.
   * @returns {{ ok: boolean, blob?: Blob }}
   */
  finalize(msg) {
    if (!this.meta) {
      log.error("Complete signal received but no active transfer — ignoring");
      return { ok: false };
    }
    if (this.chunks.length !== msg.totalChunks) {
      log.error(
        `Chunk count mismatch for "${this.meta.name}": received ${this.chunks.length}, expected ${msg.totalChunks}`,
      );
      return { ok: false };
    }
    const blob = new Blob(this.chunks, {
      type: this.meta.type || "application/octet-stream",
    });
    if (msg.fileSize && blob.size !== msg.fileSize) {
      log.error(
        `Size mismatch for "${this.meta.name}": expected ${msg.fileSize}B, got ${blob.size}B (Δ${blob.size - msg.fileSize})`,
      );
      return { ok: false };
    }
    log.log(
      `Assembled "${this.meta.name}" ✓ (${this.chunks.length}/${msg.totalChunks} chunks, ${(blob.size / 1048576).toFixed(2)}MB)`,
    );
    return { ok: true, blob };
  }
}
