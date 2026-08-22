import {
  WarningCircle,
  File as FileIcon,
  FileArrowDown,
  Check,
  X,
} from "phosphor-react";
import { formatTime, formatFileSize } from "../../utils/format.js";

function ProgressRing({ progress, className }) {
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 28 28" className={className}>
      <circle
        cx="14"
        cy="14"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <circle
        cx="14"
        cy="14"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * progress) / 100}
        transform="rotate(-90 14 14)"
      />
      <text
        x="14"
        y="16.5"
        textAnchor="middle"
        fontSize="7"
        fontWeight="600"
        fill="currentColor"
      >
        {progress}%
      </text>
    </svg>
  );
}

function IconCircle({ outgoing, children }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
        outgoing ? "bg-white/15" : "bg-gray-100"
      }`}
    >
      {children}
    </div>
  );
}

function statusText(t) {
  if (t.status === "failed") return "Failed";
  if (t.status === "cancelled") return "Cancelled";
  if (t.status === "active") {
    return t.direction === "out" ? "Sending…" : "Receiving…";
  }
  return t.direction === "out" ? "Sent" : "Received";
}

function FileBubble({ t, onDownload, onCancel }) {
  const outgoing = t.direction === "out";
  const active = t.status === "active";
  const failed = t.status === "failed";
  const cancelled = t.status === "cancelled";
  const done = t.status === "done";
  const canDownload = done && !outgoing && t.blob;

  let icon;
  if (active) {
    icon = (
      <div className="relative shrink-0">
        <ProgressRing
          progress={t.progress}
          className={`w-9 h-9 ${outgoing ? "text-white" : "text-gray-900"}`}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel?.(t.id);
          }}
          title="Cancel transfer"
          className={`absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-colors ${
            outgoing
              ? "bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-500"
              : "bg-white text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-500 shadow-sm"
          }`}
        >
          <X size={10} weight="bold" />
        </button>
      </div>
    );
  } else if (canDownload) {
    icon = (
      <IconCircle outgoing={outgoing}>
        <FileArrowDown
          size={18}
          weight="fill"
          className={outgoing ? "text-white" : "text-gray-900"}
        />
      </IconCircle>
    );
  } else if (failed || cancelled) {
    icon = (
      <IconCircle outgoing={outgoing}>
        <WarningCircle
          size={18}
          className={
            cancelled
              ? "text-gray-400"
              : outgoing
                ? "text-white"
                : "text-red-500"
          }
        />
      </IconCircle>
    );
  } else {
    icon = (
      <div className="relative">
        <IconCircle outgoing={outgoing}>
          <FileIcon
            size={18}
            weight="fill"
            className={outgoing ? "text-white" : "text-gray-900"}
          />
        </IconCircle>
        {outgoing && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gray-900 border border-white/30 flex items-center justify-center">
            <Check size={9} weight="bold" className="text-white" />
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={canDownload ? () => onDownload(t.id) : undefined}
      title={canDownload ? `Download ${t.name}` : undefined}
      className={`max-w-[75%] px-3 py-2.5 rounded-2xl ${
        canDownload ? "cursor-pointer" : ""
      } ${
        outgoing
          ? "bg-gray-900 text-white rounded-br-sm"
          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <div className="min-w-0">
          <p
            className={`text-sm font-medium truncate max-w-[180px] ${
              outgoing ? "text-white" : "text-gray-900"
            }`}
          >
            {t.name}
          </p>
          <p
            className={`text-[11px] mt-0.5 ${
              failed
                ? "text-red-400"
                : cancelled
                  ? "text-gray-400 italic"
                  : outgoing
                    ? "text-gray-300"
                    : "text-gray-500"
            }`}
          >
            {formatFileSize(t.size)} · {statusText(t)}
            {canDownload && " · Click to download"}
          </p>
        </div>
      </div>
      <p className="text-[10px] mt-1 text-gray-400">{formatTime(t.ts)}</p>
    </div>
  );
}

export default FileBubble;
