import React, { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export function FileDropzone({ onFileSelect, disabled }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
        disabled
          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
          : isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-white"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <UploadCloud
        className={`w-10 h-10 mb-3 ${disabled ? "text-gray-400" : "text-gray-500"}`}
      />
      <p className="text-sm font-medium text-gray-700">
        {disabled
          ? "Waiting for peer connection..."
          : "Click or drag file to this area"}
      </p>
      <p className="text-xs text-gray-500 mt-1">Single file upload</p>
    </div>
  );
}
