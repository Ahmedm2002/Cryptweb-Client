import React from "react";

const PendingStatus = ({ friendName, friendEmail }) => (
  <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4">
    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-50">
      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
      <span className="text-sm font-semibold text-gray-600">
        Waiting for {friendName || friendEmail} to accept...
      </span>
    </div>
  </div>
);

export default PendingStatus;
