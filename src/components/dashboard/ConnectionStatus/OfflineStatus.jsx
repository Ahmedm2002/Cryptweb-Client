import React from "react";

const OfflineStatus = ({ friendName, friendEmail }) => (
  <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4">
    <div className="flex items-center gap-3 bg-red-50 px-6 py-3 rounded-2xl border border-red-100 shadow-xl shadow-red-50">
      <div className="w-2 h-2 bg-red-600 rounded-full" />
      <span className="text-sm font-semibold text-red-600">
        {friendName || friendEmail} is offline
      </span>
    </div>
  </div>
);

export default OfflineStatus;
