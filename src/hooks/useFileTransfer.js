import { useState, useRef, useEffect, useCallback } from "react";
import { FileTransferManager, TransferQueue } from "../socket/webrtc/index.js";

export const useFileTransfer = (dataChannelManager) => {
  const [transfers, setTransfers] = useState([]);
  const transferQueueRef = useRef(new TransferQueue());
  const managerRef = useRef(null);

  const forceUpdate = useCallback(() => {
    setTransfers([...transferQueueRef.current.getAll()]);
  }, []);

  useEffect(() => {
    if (dataChannelManager) {
      managerRef.current = new FileTransferManager(
        dataChannelManager,
        transferQueueRef.current,
        forceUpdate
      );
    }

    return () => {
      // Cleanup on unmount
      managerRef.current = null;
    };
  }, [dataChannelManager, forceUpdate]);

  const sendFile = (file) => {
    if (managerRef.current) {
      managerRef.current.sendFile(file);
    }
  };

  const cancelTransfer = (fileId) => {
    if (managerRef.current) {
      managerRef.current.cancelTransfer(fileId);
    }
  };

  const clearCompleted = () => {
    const queue = transferQueueRef.current;
    queue.getAll().forEach(t => {
      if (t.status === "completed" || t.status === "cancelled") {
        queue.remove(t.fileId);
      }
    });
    forceUpdate();
  };

  return {
    transfers,
    sendFile,
    cancelTransfer,
    clearCompleted
  };
};
