import { useAuth } from "../hooks/useAuth.js";
import { useFileTransfer } from "../hooks/useFileTransfer.js";
import { FileTransferIncoming } from "./file-transfer/FileTransferIncoming";
import { FileTransferProgress } from "./file-transfer/FileTransferProgress";
import { FileTransferDropzone } from "./file-transfer/FileTransferDropzone";
import { ArrowUp } from "lucide-react";

const FileTransfer = ({ friendEmail, status }) => {
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
  } = useFileTransfer(friendEmail, user);

  return (
    <div className="w-full max-w-2xl mx-auto">

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
