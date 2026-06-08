const DB_NAME = 'cryptweb';
const DB_VERSION = 1;
const CHUNKS_STORE = 'file-chunks';
const METADATA_STORE = 'file-metadata';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
        const store = db.createObjectStore(CHUNKS_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('transferId', 'transferId', { unique: false });
      }
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        const store = db.createObjectStore(METADATA_STORE, { keyPath: 'transferId' });
        store.createIndex('status', 'status', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveChunk(transferId, chunkId, data, totalChunks) {
  const db = await openDB();
  const tx = db.transaction(CHUNKS_STORE, 'readwrite');
  tx.objectStore(CHUNKS_STORE).add({ transferId, chunkId, data, totalChunks });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getChunks(transferId) {
  const db = await openDB();
  const tx = db.transaction(CHUNKS_STORE, 'readonly');
  const store = tx.objectStore(CHUNKS_STORE);
  const index = store.index('transferId');
  const request = index.getAll(transferId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function saveMetadata(transferId, metadata) {
  const db = await openDB();
  const tx = db.transaction(METADATA_STORE, 'readwrite');
  tx.objectStore(METADATA_STORE).put({ transferId, ...metadata });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getMetadata(transferId) {
  const db = await openDB();
  const tx = db.transaction(METADATA_STORE, 'readonly');
  const store = tx.objectStore(METADATA_STORE);
  const request = store.get(transferId);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function getPendingDownloads() {
  const db = await openDB();
  const tx = db.transaction(METADATA_STORE, 'readonly');
  const store = tx.objectStore(METADATA_STORE);
  const index = store.index('status');
  const request = index.getAll('completed');
  return new Promise((resolve, reject) => {
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function getIncompleteTransfers() {
  const db = await openDB();
  const tx = db.transaction(METADATA_STORE, 'readonly');
  const store = tx.objectStore(METADATA_STORE);
  const index = store.index('status');
  const request = index.getAll('downloading');
  return new Promise((resolve, reject) => {
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function updateMetadataStatus(transferId, status) {
  const db = await openDB();
  const tx = db.transaction(METADATA_STORE, 'readwrite');
  const store = tx.objectStore(METADATA_STORE);
  const data = await new Promise((resolve, reject) => {
    const req = store.get(transferId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (data) {
    data.status = status;
    store.put(data);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function clearTransfer(transferId) {
  const db = await openDB();
  const tx = db.transaction([CHUNKS_STORE, METADATA_STORE], 'readwrite');
  const chunkStore = tx.objectStore(CHUNKS_STORE);
  const index = chunkStore.index('transferId');
  const keys = await new Promise((resolve, reject) => {
    const req = index.getAllKeys(transferId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  for (const key of keys) {
    chunkStore.delete(key);
  }
  tx.objectStore(METADATA_STORE).delete(transferId);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function assembleFileFromChunks(transferId) {
  const chunks = await getChunks(transferId);
  const sorted = chunks.sort((a, b) => a.chunkId - b.chunkId);
  const metadata = await getMetadata(transferId);
  const byteArrays = [];
  for (const chunk of sorted) {
    const byteCharacters = atob(chunk.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  const blob = new Blob(byteArrays, { type: metadata?.fileType || '' });
  return { blob, metadata };
}

async function getAllTransfers() {
  const db = await openDB();
  const tx = db.transaction(METADATA_STORE, 'readonly');
  const store = tx.objectStore(METADATA_STORE);
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function getLastChunkId(transferId) {
  const chunks = await getChunks(transferId);
  if (chunks.length === 0) return 0;
  return Math.max(...chunks.map(c => c.chunkId));
}

export {
  saveChunk,
  getChunks,
  saveMetadata,
  getMetadata,
  getPendingDownloads,
  getIncompleteTransfers,
  updateMetadataStatus,
  clearTransfer,
  assembleFileFromChunks,
  getAllTransfers,
  getLastChunkId,
};
