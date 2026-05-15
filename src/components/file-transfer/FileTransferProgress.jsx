export const FileTransferProgress = ({
  transferProgress,
  transferSpeed,
  incomingFile,
  selectedFile
}) => {
  return (
    <div className="flex flex-col items-center text-center w-full max-w-md">
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#4F46E5"
            strokeWidth="8"
            strokeDasharray={`${transferProgress * 2.827} 282.7`}
            strokeLinecap="round"
            className="transition-all duration-300 transform -rotate-90 origin-center"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-gray-900">
            {transferProgress}%
          </span>
        </div>
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-2">
        {incomingFile ? "Receiving..." : "Sending..."}
      </h4>
      <p className="text-gray-500 font-medium">
        {transferSpeed ? transferSpeed.toFixed(2) : 0} MB/s •{" "}
        {incomingFile ? incomingFile.name : selectedFile?.name}
      </p>
    </div>
  );
};
