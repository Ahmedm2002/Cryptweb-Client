export const FileTransferProgress = ({
  transferProgress,
  transferSpeed,
  incomingFile,
  selectedFile
}) => {
  return (
    <div className="flex flex-col items-center text-center w-full max-w-xs">
      <div className="relative w-24 h-24 mb-6">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none" stroke="#E5E7EB" strokeWidth="6"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none" stroke="#374151" strokeWidth="6"
            strokeDasharray={`${transferProgress * 2.827} 282.7`}
            strokeLinecap="round"
            className="transition-all duration-300 transform -rotate-90 origin-center"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">
            {transferProgress}%
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700">
        {incomingFile ? "Receiving..." : "Sending..."}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {transferSpeed ? transferSpeed.toFixed(2) : 0} MB/s
        {incomingFile ? ` • ${incomingFile.name}` : selectedFile?.name ? ` • ${selectedFile.name}` : ''}
      </p>
    </div>
  );
};
