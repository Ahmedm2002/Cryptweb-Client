import { useState, useRef } from "react";
import { UploadCloud, File as FileIcon, X, Shield, Lock } from "lucide-react";

export const FileTransferDropzone = ({
  selectedFile,
  setSelectedFile,
  clearFile,
  isTransferring
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isTransferring) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isTransferring && e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getFileType = (type) => {
    if (!type || type === "") return "Unknown";
    return type;
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 sm:p-12 transition-all min-h-[260px] cursor-pointer ${
        isDragging
          ? "border-gray-400 bg-gray-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isTransferring && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center text-center w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <FileIcon className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-base font-semibold text-gray-900 truncate max-w-[280px] mb-1">
            {selectedFile.name}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
            <span>{formatSize(selectedFile.size)}</span>
            <span className="text-gray-300">|</span>
            <span>{getFileType(selectedFile.type)}</span>
            {selectedFile.lastModified && (
              <>
                <span className="text-gray-300">|</span>
                <span>Modified {new Date(selectedFile.lastModified).toLocaleDateString()}</span>
              </>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearFile();
            }}
            className="mt-4 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
          >
            <X size={14} />
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <UploadCloud className="w-7 h-7 text-gray-500" />
          </div>
          <p className="text-base font-semibold text-gray-800 mb-1">
            Drop a file here
          </p>
          <p className="text-xs text-gray-500 mb-4">
            or click to browse
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Lock size={12} />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} />
              <span>Direct transfer</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Files never touch any server
          </p>
        </div>
      )}
    </div>
  );
};
