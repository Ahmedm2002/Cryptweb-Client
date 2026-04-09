const StatusBar = ({ isUserOnline, friendStatus, friendEmail, userName }) => {
  return (
    <div className="flex items-center flex-col sm:flex-row gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${isUserOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500"}`}
        />
        <span className="text-gray-400 font-medium">{userName || "You"}</span>
      </div>

      <div className="w-px h-3 bg-gray-200" />

      <div className="flex items-center text-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${friendStatus?.isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-gray-300"}`}
        />
        <span className="text-gray-900 font-semibold max-w-[150px]">
          {friendStatus?.name || friendEmail || "Friend"}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
