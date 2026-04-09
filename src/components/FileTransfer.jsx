import { useState, useRef } from "react";
import { UploadCloud, File, ShieldCheck, Zap } from "lucide-react";

const FileTransfer = ({ friendEmail, status }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 shadow-2xl flex flex-col h-full overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Zap className="w-32 h-32 text-indigo-600" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold text-gray-900 font-display">
              Send Documents
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              End-to-end encrypted direct transfer
            </p>
          </div>
          {status?.isOnline && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-emerald-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Connection Active
            </div>
          )}
        </div>

        <div
          className={`flex-1 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-8 sm:p-16 transition-all duration-500 min-h-[350px] cursor-pointer group ${
            isDragging
              ? "border-indigo-400 bg-indigo-50/50 scale-[0.99] shadow-inner"
              : "border-gray-200 bg-gray-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xl"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
                <File className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 truncate max-w-[300px] mb-1">
                {selectedFile.name}
              </p>
              <p className="text-sm font-medium text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to
                send
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="mt-8 text-sm text-red-500 hover:text-white font-bold px-6 py-2 border border-red-100 hover:bg-red-500 rounded-full transition-all duration-300"
              >
                Cancel Selection
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <UploadCloud className="w-10 h-10 text-indigo-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Drag & drop files here
              </h4>
              <p className="text-gray-500 max-w-xs leading-relaxed">
                Securely send any file directly from your browser to your
                contact.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="h-px w-8 bg-gray-200" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  or
                </span>
                <div className="h-px w-8 bg-gray-200" />
              </div>
              <button className="mt-6 px-8 py-3 bg-white border border-gray-200 text-indigo-600 rounded-2xl font-bold text-sm hover:border-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm">
                Browse Files
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
          <button
            disabled={!selectedFile || !status?.isOnline}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[1.25rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:grayscale disabled:hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            Send Secured File
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileTransfer;
