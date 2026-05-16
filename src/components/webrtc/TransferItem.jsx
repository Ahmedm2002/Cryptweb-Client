import React from "react";
import { File, XCircle, CheckCircle, AlertCircle, Clock } from "lucide-react";

export function TransferItem({ transfer, onCancel }) {
  const isCompleted = transfer.status === "completed";
  const isError = transfer.status === "error";
  const isCancelled = transfer.status === "cancelled";
  const isTransferring = transfer.status === "transferring";

  const fileSizeMb = (transfer.fileSize / 1024 / 1024).toFixed(2);
  const receivedMb = (transfer.receivedSize / 1024 / 1024).toFixed(2);

  let eta = "--";
  if (isTransferring && transfer.speed > 0) {
    const remainingSizeMb = fileSizeMb - receivedMb;
    const seconds = Math.round(remainingSizeMb / transfer.speed);
    eta = `${seconds}s`;
  }

  return (
    <div className="p-3 flex items-start gap-3">
      <div className="mt-1">
        <File className="w-6 h-6 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm font-medium text-gray-800 truncate" title={transfer.fileName}>
            {transfer.fileName}
          </p>
          {(isTransferring || transfer.status === "pending") && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-red-500 ml-2"
              title="Cancel Transfer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${isError || isCancelled ? "bg-red-500" : isCompleted ? "bg-green-500" : "bg-blue-500"
              }`}
            style={{ width: `${transfer.progress || 0}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {isCompleted ? "Completed" : isError ? "Failed" : isCancelled ? "Cancelled" : `${transfer.progress || 0}%`}
            {" • "}
            {receivedMb} / {fileSizeMb} MB
          </span>
          {isTransferring && (
            <div className="flex gap-2 items-center">
              <span>{transfer.speed.toFixed(1)} MB/s</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {eta}</span>
            </div>
          )}
          {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
          {(isError || isCancelled) && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>
      </div>
    </div>
  );
}
