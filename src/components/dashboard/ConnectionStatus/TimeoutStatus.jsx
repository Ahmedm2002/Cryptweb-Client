import React from "react";
import { Clock } from "lucide-react";

const TimeoutStatus = ({ friendName, friendEmail }) => (
  <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4">
    <div className="flex items-center gap-3 bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 shadow-xl shadow-amber-50">
      <Clock className="w-5 h-5 text-amber-600" />
      <span className="text-sm font-semibold text-amber-600">
        Request to {friendName || friendEmail} timed out
      </span>
    </div>
    <p className="text-xs text-gray-400">Please try again in a moment</p>
  </div>
);

export default TimeoutStatus;
