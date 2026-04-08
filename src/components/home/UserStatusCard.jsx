export const UserStatusCard = ({ result }) => {
  if (!result) {
    return (
      <div className="py-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="font-medium">
          No user selected. Use the <strong className="text-gray-700">Search User</strong> tab to find someone.
        </p>
      </div>
    );
  }

  const isOnline = result.status === "online" || result.is_online === true;

  return (
    <div className="p-6 border border-gray-100 rounded-xl shadow-sm bg-white flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          {result.name || result.email}
        </h3>
        <p className="text-gray-500 text-sm font-medium">{result.email}</p>
      </div>
      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <span className="font-bold text-xs text-gray-700 uppercase tracking-wider">
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
};
