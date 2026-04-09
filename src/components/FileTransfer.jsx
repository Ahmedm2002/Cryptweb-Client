import { useState, useRef } from "react";
import { UploadCloud, File } from "lucide-react";

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
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[320px] text-center">
        <UploadCloud className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">File Transfer</h3>
        <p className="text-gray-500">Connect to a friend to send files</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">File Transfer</h3>
        {status?.isOnline && (
          <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
            Ready
          </span>
        )}
      </div>

      <div
        className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-colors ${
          isDragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
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
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
              <File className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="mt-4 text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded-full"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center cursor-pointer">
            <UploadCloud className="w-10 h-10 text-indigo-500 mb-4" />
            <p className="text-sm font-medium text-gray-900">
              Drag & drop a file here
            </p>
            <p className="text-xs text-gray-500 mt-2">
              or click to browse from device
            </p>
          </div>
        )}
      </div>

      <button
        disabled={!selectedFile || !status?.isOnline}
        className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Send File
      </button>
    </div>
  );
};

export default FileTransfer;
