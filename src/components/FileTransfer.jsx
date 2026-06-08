import { useAuth } from "../hooks/useAuth.js";
import { useFileTransfer } from "../hooks/useFileTransfer.js";
import { FileTransferIncoming } from "./file-transfer/FileTransferIncoming";
import { FileTransferProgress } from "./file-transfer/FileTransferProgress";
import { FileTransferDropzone } from "./file-transfer/FileTransferDropzone";
import { ArrowUp, RefreshCw } from "lucide-react";

const FileTransfer = ({ friendEmail, status, resumeTarget, onResumeComplete }) => {
  const { user } = useAuth();
  const {
    selectedFile,
    setSelectedFile,
    transferProgress,
    isTransferring,
    incomingFile,
    transferComplete,
    sendSecuredFile,
    downloadFile,
    clearFile,
    resumeRequest,
    rejectResumeRequest,
    isResuming,
  } = useFileTransfer(friendEmail, user, resumeTarget);

  return (
    <div className="w-full max-w-2xl mx-auto">

      {isResuming && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-700">
            Requesting resume for <span className="font-semibold">{resumeTarget?.fileName}</span>...
          </p>
        </div>
      )}

      {resumeRequest && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-800 mb-3">
            <span className="font-semibold">{friendEmail}</span> wants to resume receiving <span className="font-semibold">{resumeRequest.fileName}</span>. Select the file to continue sending.
          </p>
          <div className="flex gap-2">
            <input
              type="file"
              id="resume-file-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                  rejectResumeRequest();
                  setTimeout(() => {
                    sendSecuredFile({
                      resume: true,
                      startFromChunk: resumeRequest.lastChunkId + 1,
                    });
                  }, 100);
                }
              }}
            />
            <button
              onClick={() => document.getElementById("resume-file-input")?.click()}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Select File to Resume
            </button>
            <button
              onClick={rejectResumeRequest}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      <FileTransferIncoming
        incomingFile={incomingFile}
        transferComplete={transferComplete}
        downloadFile={downloadFile}
      />

      {isTransferring ? (
        <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl flex flex-col items-center justify-center p-8 min-h-[280px]">
          <FileTransferProgress
            transferProgress={transferProgress}
            incomingFile={incomingFile}
            selectedFile={selectedFile}
          />
        </div>
      ) : (
        <>
          <FileTransferDropzone
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            clearFile={clearFile}
            isTransferring={isTransferring}
          />

          {!isTransferring && selectedFile && !resumeRequest && (
            <div className="mt-4">
              <button
                onClick={() => sendSecuredFile()}
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
