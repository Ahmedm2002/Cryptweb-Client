import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "../socket/useSocket";
import {
  saveChunk, saveMetadata, getMetadata,
  getPendingDownloads, getIncompleteTransfers,
  clearTransfer, updateMetadataStatus, assembleFileFromChunks,
  getChunks,
} from "../services/indexedDB";

function useFileTransfer(friendEmail, user, resumeTarget = null) {
  const { subscribeToDataChannel, sendDataViaWebRTC } = useSocket();

  const [selectedFile, setSelectedFile] = useState(null);
  const [incomingFile, setIncomingFile] = useState(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const [receivedBlob, setReceivedBlob] = useState(null);

  const [pendingDownload, setPendingDownload] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [resumeRequest, setResumeRequest] = useState(null);
  const [isResuming, setIsResuming] = useState(false);

  const currentTransferId = useRef(null);
  const incomingChunks = useRef([]);
  const resumeRequestSent = useRef(false);
  const chunksLoaded = useRef(false);

  useEffect(() => {
    checkPendingDownloads();
  }, []);

  async function checkPendingDownloads() {
    const completed = await getPendingDownloads();
    const incomplete = await getIncompleteTransfers();
    if (completed.length > 0) {
      setPendingDownload(completed[0]);
    } else if (incomplete.length > 0) {
      setPendingMessage({
        type: 'incomplete',
        fileName: incomplete[0].fileName,
        fileSize: incomplete[0].fileSize,
        friendEmail: incomplete[0].friendEmail,
        progress: `${Math.round((incomplete[0].receivedChunks / incomplete[0].totalChunks) * 100)}%`,
        lastChunkId: incomplete[0].receivedChunks,
        totalChunks: incomplete[0].totalChunks,
        transferId: incomplete[0].transferId,
      });
    }
  }

  const assembleBlob = (base64Chunks) => {
    const byteArrays = [];
    for (let chunk of base64Chunks) {
      const byteCharacters = atob(chunk);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays);
  };

  const onMessage = useCallback((msgStr) => {
    try {
      const msg = JSON.parse(msgStr);

      if (msg.type === "resume-request") {
        if (!resumeTarget) {
          setResumeRequest({
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            lastChunkId: msg.lastChunkId,
          });
        }
        return;
      }

      if (msg.type === "metadata") {
        let transferId;
        if (msg.resume && currentTransferId.current) {
          transferId = currentTransferId.current;
        } else {
          transferId = `${friendEmail}-${msg.fileName}-${Date.now()}`;
          currentTransferId.current = transferId;
          incomingChunks.current = [];
        }

        setIncomingFile({
          name: msg.fileName,
          size: msg.fileSize,
          type: msg.fileType,
          totalChunks: msg.totalChunks,
        });

        const existingCount = incomingChunks.current.length;
        const startProgress = Math.round((existingCount / msg.totalChunks) * 100);
        setTransferProgress(startProgress || 0);
        setIsTransferring(true);
        setTransferComplete(false);

        if (!msg.resume) {
          saveMetadata(transferId, {
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            fileType: msg.fileType,
            totalChunks: msg.totalChunks,
            receivedChunks: 0,
            status: 'downloading',
            friendEmail,
            createdAt: Date.now(),
          });
        }
      } else if (msg.type === "chunk" || msg.data) {
        incomingChunks.current.push(msg.data);

        const currentProgress = Math.round(
          ((msg.chunkId) / msg.totalChunks) * 100
        );
        setTransferProgress(currentProgress);

        if (currentTransferId.current) {
          saveChunk(currentTransferId.current, msg.chunkId, msg.data, msg.totalChunks);
          getMetadata(currentTransferId.current).then(meta => {
            if (meta) {
              saveMetadata(currentTransferId.current, {
                ...meta,
                receivedChunks: msg.chunkId,
              });
            }
          });
        }

        if (msg.isCompleted) {
          setIsTransferring(false);
          setTransferComplete(true);
          if (currentTransferId.current) {
            updateMetadataStatus(currentTransferId.current, 'completed');
          }
          const blob = assembleBlob(incomingChunks.current);
          setReceivedBlob(blob);
        }
      }
    } catch (err) {
      console.error("Error processing data channel message", err);
    }
  }, [friendEmail, resumeTarget]);

  useEffect(() => {
    if (!subscribeToDataChannel) return;

    subscribeToDataChannel(onMessage);

    if (resumeTarget && !resumeRequestSent.current) {
      resumeRequestSent.current = true;
      currentTransferId.current = resumeTarget.transferId;
      setIsResuming(true);
      chunksLoaded.current = false;
      getChunks(resumeTarget.transferId).then(chunks => {
        incomingChunks.current = chunks
          .sort((a, b) => a.chunkId - b.chunkId)
          .map(c => c.data);
        chunksLoaded.current = true;
      });
      sendDataViaWebRTC(JSON.stringify({
        type: "resume-request",
        fileName: resumeTarget.fileName,
        fileSize: resumeTarget.fileSize,
        lastChunkId: resumeTarget.lastChunkId,
      }));
    }
  }, [subscribeToDataChannel, onMessage, resumeTarget, sendDataViaWebRTC]);

  const sendSecuredFile = (opts = {}) => {
    if (!selectedFile) return;

    const startFromChunk = opts.startFromChunk || 0;
    const isResume = opts.resume || false;

    setIsTransferring(true);
    setTransferProgress(Math.round((startFromChunk / Math.ceil(selectedFile.size / 16384)) * 100));
    setTransferComplete(false);

    const CHUNK_SIZE = 16384;
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    const startOffset = startFromChunk * CHUNK_SIZE;

    sendDataViaWebRTC(
      JSON.stringify({
        type: "metadata",
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        totalChunks,
        resume: isResume,
        lastChunkId: isResume ? startFromChunk - 1 : 0,
      })
    );

    let chunkId = startFromChunk;
    let offset = startOffset;

    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      const isCompleted = chunkId === totalChunks - 1;

      sendDataViaWebRTC(
        JSON.stringify({
          chunkId: chunkId + 1,
          totalChunks,
          data: base64Data,
          isCompleted,
        })
      );

      chunkId++;
      offset += CHUNK_SIZE;
      setTransferProgress(Math.round((chunkId / totalChunks) * 100));

      if (offset < selectedFile.size) {
        setTimeout(readNextChunk, 5);
      } else {
        setIsTransferring(false);
        setTransferComplete(true);
      }
    };

    const readNextChunk = () => {
      const slice = selectedFile.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    readNextChunk();
  };

  const clearFile = async () => {
    setSelectedFile(null);
    setIncomingFile(null);
    setTransferProgress(0);
    setIsTransferring(false);
    setTransferComplete(false);
    setReceivedBlob(null);
    setIsResuming(false);
    incomingChunks.current = [];
    resumeRequestSent.current = false;
    chunksLoaded.current = false;
    if (currentTransferId.current) {
      await clearTransfer(currentTransferId.current);
      currentTransferId.current = null;
    }
  };

  const downloadFile = async () => {
    if (receivedBlob && incomingFile) {
      const url = URL.createObjectURL(receivedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = incomingFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (currentTransferId.current) {
        await clearTransfer(currentTransferId.current);
        currentTransferId.current = null;
      }
      clearFile();
    }
  };

  const downloadPendingFile = async () => {
    if (pendingDownload) {
      const { blob, metadata } = await assembleFileFromChunks(pendingDownload.transferId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = metadata.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      await clearTransfer(pendingDownload.transferId);
      setPendingDownload(null);
    }
  };

  const dismissPending = () => {
    setPendingDownload(null);
    setPendingMessage(null);
    setResumeRequest(null);
  };

  const rejectResumeRequest = () => {
    setResumeRequest(null);
  };

  return {
    selectedFile,
    setSelectedFile,
    transferProgress,
    isTransferring,
    incomingFile,
    transferComplete,
    sendSecuredFile,
    downloadFile,
    clearFile,
    pendingDownload,
    pendingMessage,
    downloadPendingFile,
    dismissPending,
    resumeRequest,
    rejectResumeRequest,
    isResuming,
  };
}

export { useFileTransfer };
