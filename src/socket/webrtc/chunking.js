export const CHUNK_SIZE = 16384; // 16KB

export function createChunks(file, onChunkRead) {
  let offset = 0;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let chunkNo = 0;

  const readNext = () => {
    if (offset >= file.size) return;
    const slice = file.slice(offset, offset + CHUNK_SIZE);
    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target.result;
      offset += slice.size;
      onChunkRead(buffer, chunkNo, totalChunks, offset, readNext);
      chunkNo++;
    };

    reader.readAsArrayBuffer(slice);
  };

  return { start: readNext };
}

export function reconstructFile(buffers, mimeType, fileName) {
  const blob = new Blob(buffers, { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
