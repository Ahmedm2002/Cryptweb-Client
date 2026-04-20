import { File, Download } from "lucide-react";

export const FileTransferIncoming = ({ incomingFile, transferComplete, downloadFile }) => {
  if (!incomingFile || !transferComplete) return null;

  return (
    <div className="mb-6 p-6 bg-green-50 rounded-3xl border border-green-100 flex items-center justify-between animate-in slide-in-from-top-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
          <File className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-green-900">
            {incomingFile.name} received!
          </p>
          <p className="text-sm text-green-700">
            {(incomingFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      <button
        onClick={downloadFile}
        className="px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> Download
      </button>
    </div>
  );
};
