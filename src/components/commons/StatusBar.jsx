const StatusBar = ({ isUserOnline, friendStatus, friendEmail }) => {
  console.log("Friend Status in Status bar: ", friendStatus);
  console.log("Friend eamil in Status bar: ", friendEmail);
  return (
    <div
      id="status-bar"
      className="flex items-center gap-3 text-sm bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-indigo-50 shadow-sm shadow-indigo-50/50"
    >
      <div
        className={`w-2 h-2 rounded-full ${friendStatus?.isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" : "bg-gray-300"}`}
      />
      <p className="text-gray-600 font-medium">
        {friendStatus?.isOnline ? (
          <>
            Connected with{" "}
            <span className="text-indigo-600 font-bold">
              {friendStatus?.name || friendEmail || "Friend"}
            </span>
          </>
        ) : (
          "Friend is offline"
        )}
      </p>
    </div>
  );
};

export default StatusBar;
