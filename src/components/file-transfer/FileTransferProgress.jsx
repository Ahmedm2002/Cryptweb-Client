export const FileTransferProgress = ({
  transferProgress,
  transferSpeed,
  incomingFile,
  selectedFile,
}) => {
  const totalBytes = selectedFile?.size || incomingFile?.size || 0;
  const transferredBytes = Math.round((transferProgress / 100) * totalBytes);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (
      (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + " " + units[i]
    );
  };

  const formatSpeed = (bytesPerSec) => {
    if (bytesPerSec === 0) return "";
    return formatBytes(bytesPerSec) + "/s";
  };

  const isComplete = transferProgress >= 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {incomingFile ? "Receiving" : "Sending"}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {isComplete ? "Done" : `${transferProgress}%`}
        </span>
      </div>

      <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#059669] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${transferProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>
          {formatBytes(transferredBytes)} / {formatBytes(totalBytes)}
        </span>
        {transferSpeed > 0 && <span>{formatSpeed(transferSpeed)}</span>}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center truncate">
        {selectedFile?.name || incomingFile?.name || ""}
      </p>
    </div>
  );
};
