import { Download } from "phosphor-react";

export const FileTransferIncoming = ({ incomingFile, transferComplete, downloadFile }) => {
  if (!incomingFile || !transferComplete) return null;

  return (
    <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <p className="font-medium text-gray-900">
            {incomingFile.name}
          </p>
          <p className="text-xs text-gray-500">
            {(incomingFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      <button
        onClick={downloadFile}
        className="px-4 py-2 bg-[#1c1c28] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a3a] transition-colors flex items-center gap-2"
      >
        <Download size={14} weight="bold" /> Download
      </button>
    </div>
  );
};
