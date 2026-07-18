const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(67, 56, 202, 0.3); }
  50% { box-shadow: 0 0 18px rgba(67, 56, 202, 0.6); }
}
@keyframes progress-stripe {
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
}
`;

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
    return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + " " + units[i];
  };

  const formatSpeed = (bytesPerSec) => {
    if (bytesPerSec === 0) return "";
    return formatBytes(bytesPerSec) + "/s";
  };

  const getProgressColor = () => {
    if (transferProgress < 30) return "from-indigo-500 to-indigo-600";
    if (transferProgress < 70) return "from-indigo-500 to-purple-500";
    return "from-purple-500 to-fuchsia-500";
  };

  const isComplete = transferProgress >= 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <style>{shimmerKeyframes}</style>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {incomingFile ? "Receiving" : "Sending"}
        </span>
        <span className="text-sm font-bold text-gray-800">
          {isComplete ? "✓ Done" : `${transferProgress}%`}
        </span>
      </div>

      <div
        className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden"
        style={!isComplete && transferProgress > 0 ? { animation: "pulse-glow 2s ease-in-out infinite" } : {}}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out relative`}
          style={{ width: `${transferProgress}%` }}
        >
          {!isComplete && transferProgress > 0 && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)",
                backgroundSize: "40px 40px",
                animation: "progress-stripe 1s linear infinite",
              }}
            />
          )}
          {!isComplete && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                animation: "shimmer 1.8s ease-in-out infinite",
              }}
            />
          )}
          {isComplete && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                animation: "shimmer 1.2s ease-in-out infinite",
              }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>
          {formatBytes(transferredBytes)} / {formatBytes(totalBytes)}
        </span>
        {transferSpeed > 0 && <span>{formatSpeed(transferSpeed)}</span>}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        {selectedFile?.name || incomingFile?.name || ""}
      </p>
    </div>
  );
};
