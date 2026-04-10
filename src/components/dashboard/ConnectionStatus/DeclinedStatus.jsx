import React from "react";

const DeclinedStatus = ({ friendName, friendEmail }) => (
  <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-top-4">
    <span className="text-sm font-semibold text-red-500 bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
      Connection declined by {friendName || friendEmail}
    </span>
  </div>
);

export default DeclinedStatus;
