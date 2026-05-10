import React from "react";
import { TransferItem } from "./TransferItem";

export function TransferList({ transfers, onCancel, onClearCompleted }) {
  if (!transfers || transfers.length === 0) return null;

  return (
    <div className="mt-6 w-full max-w-md bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">File Transfers</h3>
        <button 
          onClick={onClearCompleted}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Clear Completed
        </button>
      </div>
      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {transfers.map(transfer => (
          <TransferItem 
            key={transfer.fileId} 
            transfer={transfer} 
            onCancel={() => onCancel(transfer.fileId)} 
          />
        ))}
      </div>
    </div>
  );
}
