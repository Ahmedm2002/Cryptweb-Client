import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Download,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function formatFileSize(mb) {
  const size = Number(mb);
  if (isNaN(size) || size < 0.01) return "< 0.01 MB";
  return `${size.toFixed(2)} MB`;
}

function formatTime(seconds) {
  if (seconds < 1) return "< 1s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

export default function RecentTransfers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransfers() {
      try {
        const res = await api.get("/file-transfers/recent?limit=20");
        setTransfers(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load recent transfers");
      } finally {
        setLoading(false);
      }
    }
    fetchTransfers();
  }, []);

  return (
    <div>
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        Recent Transfers
      </h1>
      <p className="text-sm text-gray-500 mb-6">Your last 20 file transfers</p>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      )}

      {!loading && !error && transfers.length === 0 && (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No transfers yet</p>
        </div>
      )}

      {!loading && !error && transfers.length > 0 && (
        <div className="space-y-2">
          {transfers.map((t) => {
            const isSent = t.senderEmail === user?.email;
            const peerName = isSent ? t.receiverName : t.senderName;
            const peerEmail = isSent ? t.receiverEmail : t.senderEmail;

            return (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isSent
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {isSent ? <Send size={16} /> : <Download size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                        isSent
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isSent ? "Sent" : "Received"}
                    </span>
                    <span className="text-sm text-gray-900 truncate">
                      {t.fileType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {isSent ? "to" : "from"} {peerName} ({peerEmail})
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatFileSize(t.fileSize)}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Clock size={11} className="text-gray-400" />
                    <span className="text-[11px] text-gray-500">
                      {formatTime(t.timeElapsed)}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-gray-400 shrink-0 hidden sm:block">
                  {timeAgo(t.completedAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
