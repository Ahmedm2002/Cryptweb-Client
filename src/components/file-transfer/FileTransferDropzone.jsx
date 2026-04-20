import { useState, useRef } from "react";
import { UploadCloud, File as FileIcon } from "lucide-react";

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

  return (
    <div
      className={`flex-1 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-8 sm:p-16 transition-all duration-500 min-h-[350px] cursor-pointer group ${
        isDragging
          ? "border-indigo-400 bg-indigo-50/50 scale-[0.99] shadow-inner"
          : "border-gray-200 bg-gray-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xl"
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
        <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
            <FileIcon className="w-10 h-10 text-white" />
          </div>
          <p className="text-xl font-bold text-gray-900 truncate max-w-[300px] mb-1">
            {selectedFile.name}
          </p>
          <p className="text-sm font-medium text-gray-500">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to send
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
            Securely send any file directly from your browser to your contact.
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
  );
};
