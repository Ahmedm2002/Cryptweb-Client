const StatusBar = ({ isUserOnline, friendStatus }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row justify-around items-center gap-4">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-sm font-medium">You:</span>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isUserOnline ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <div className={`w-2 h-2 rounded-full ${isUserOnline ? "bg-green-500" : "bg-red-500"}`} />
          {isUserOnline ? "Online" : "Offline"}
        </div>
      </div>
      
      <div className="hidden sm:block w-px h-6 bg-gray-200" />
      
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-sm font-medium">Friend:</span>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${friendStatus?.isOnline ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          <div className={`w-2 h-2 rounded-full ${friendStatus?.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
          {friendStatus?.isOnline ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
