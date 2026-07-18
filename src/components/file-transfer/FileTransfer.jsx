import { useAuth } from "../../hooks/useAuth.js";
import { useFileTransfer } from "../../hooks/useFileTransfer.js";
import { useSocket } from "../../socket/useSocket";
import { FileTransferIncoming } from "../file-transfer/FileTransferIncoming";
import { FileTransferProgress } from "../file-transfer/FileTransferProgress";
import { FileTransferDropzone } from "../file-transfer/FileTransferDropzone";
import { ArrowUp, RefreshCw, X, CheckCircle2 } from "lucide-react";

const FileTransfer = ({ friendEmail, status }) => {
  const { user } = useAuth();
  const { peerDisconnected } = useSocket();
  const {
    selectedFile,
    setSelectedFile,
    transferProgress,
    isTransferring,
    incomingFile,
    transferComplete,
    transferFailed,
    transferSpeed,
    sendSecuredFile,
    cancelTransfer,
    retryTransfer,
    downloadFile,
    clearFile,
  } = useFileTransfer(friendEmail, user, peerDisconnected);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <FileTransferIncoming
        incomingFile={incomingFile}
        transferComplete={transferComplete}
        downloadFile={downloadFile}
      />

      {transferFailed ? (
        <div className="border-2 border-dashed border-red-200 bg-red-50 rounded-xl flex flex-col items-center justify-center p-8 min-h-[280px]">
          <p className="text-sm font-semibold text-red-700 mb-2">
            Transfer Failed
          </p>
          <p className="text-xs text-red-500 mb-6">
            Could not send the file. The connection may have been lost.
          </p>
          <div className="flex gap-3">
            <button
              onClick={clearFile}
              className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={retryTransfer}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Retry Transfer
            </button>
          </div>
        </div>
      ) : isTransferring ? (
        <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl flex flex-col items-center justify-center p-8 min-h-[280px]">
          <FileTransferProgress
            transferProgress={transferProgress}
            transferSpeed={transferSpeed}
            incomingFile={incomingFile}
            selectedFile={selectedFile}
          />
          <button
            onClick={cancelTransfer}
            className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      ) : transferComplete && !incomingFile ? (
        <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-xl flex flex-col items-center justify-center p-8 min-h-[280px]">
          <CheckCircle2 size={40} className="text-green-500 mb-3" />
          <p className="text-sm font-semibold text-green-700 mb-2">
            File Sent Successfully
          </p>
          <button
            onClick={clearFile}
            className="mt-4 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Send Another File
          </button>
        </div>
      ) : (
        <>
          <FileTransferDropzone
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            clearFile={clearFile}
            isTransferring={isTransferring}
          />

          {!isTransferring && selectedFile && (
            <div className="mt-4">
              <button
                onClick={sendSecuredFile}
                disabled={!selectedFile}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUp size={16} />
                Send File
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileTransfer;
