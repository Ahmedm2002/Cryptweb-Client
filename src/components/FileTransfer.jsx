import { UploadCloud, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { useFileTransfer } from "../hooks/useFileTransfer.js";
import { FileTransferIncoming } from "./file-transfer/FileTransferIncoming";
import { FileTransferProgress } from "./file-transfer/FileTransferProgress";
import { FileTransferDropzone } from "./file-transfer/FileTransferDropzone";

const FileTransfer = ({ friendEmail, status }) => {
  const { user } = useAuth();
  const {
    selectedFile,
    setSelectedFile,
    transferProgress,
    isTransferring,
    transferSpeed,
    incomingFile,
    totalReceivedSize,
    sendSecuredFile,
    downloadFile,
    clearFile,
    transferComplete,
  } = useFileTransfer(friendEmail, user);

  if (!friendEmail) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-2xl flex flex-col items-center justify-center min-h-[400px] text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
          <UploadCloud className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">
          File Transfer
        </h3>
        <p className="text-gray-500">
          Connect to a friend to start secure sharing.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-4 sm:p-8 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Zap className="w-32 h-32 text-indigo-600" />
        </div>

        <FileTransferIncoming
          incomingFile={incomingFile}
          transferComplete={transferComplete}
          downloadFile={downloadFile}
        />

        {isTransferring ? (
          <div className="flex-1 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-[2rem] flex flex-col items-center justify-center p-8 sm:p-16 min-h-[350px]">
            <FileTransferProgress
              transferProgress={transferProgress}
              transferSpeed={transferSpeed}
              incomingFile={incomingFile}
              selectedFile={selectedFile}
            />
          </div>
        ) : (
          <FileTransferDropzone
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            clearFile={clearFile}
            isTransferring={isTransferring}
          />
        )}

        {!isTransferring && (
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={sendSecuredFile}
              disabled={!selectedFile}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[1.25rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              Send Secured File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTransfer;
