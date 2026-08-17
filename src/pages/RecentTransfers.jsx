import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Spinner,
  PaperPlaneTilt,
  DownloadSimple,
  CaretLeft,
  CaretRight,
} from "phosphor-react";
import { useAuth } from "../hooks/useAuth";
import { useRecentTransfers } from "../hooks/useRecentTransfers";

function formatFileSize(mb) {
  const size = Number(mb);
  if (isNaN(size) || size < 0.01) return "< 0.01 MB";
  return `${size.toFixed(2)} MB`;
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
  const [activeTab, setActiveTab] = useState("sent");

  const {
    transfers,
    pageNo,
    totalPages,
    loading,
    error,
    setPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
  } = useRecentTransfers(10);

  const sent = transfers.filter((t) => t.transfer_type === "send");
  const received = transfers.filter((t) => t.transfer_type === "receive");
  const activeTransfers = activeTab === "sent" ? sent : received;

  return (
    <div className="min-h-screen flex flex-col items-center px-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-xl font-semibold text-gray-900 mb-1 text-center">
          Recent Transfers
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {totalPages > 0 && `Page ${pageNo} of ${totalPages}`}
        </p>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Spinner
              size={24}
              className="animate-spin text-gray-400"
              weight="bold"
            />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && transfers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">No transfers yet</p>
          </div>
        )}

        {!loading && !error && transfers.length > 0 && (
          <>
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab("sent")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "sent"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <PaperPlaneTilt size={16} weight="bold" />
                Sent
              </button>
              <button
                onClick={() => setActiveTab("received")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "received"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <DownloadSimple size={16} weight="bold" />
                Received
              </button>
            </div>

            {activeTransfers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">
                  No {activeTab} transfers on this page
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeTransfers.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gray-100">
                      {activeTab === "sent" ? (
                        <PaperPlaneTilt
                          size={16}
                          className="text-gray-700"
                          weight="bold"
                        />
                      ) : (
                        <DownloadSimple
                          size={16}
                          className="text-gray-700"
                          weight="bold"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {t.file_type}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        {formatFileSize(t.file_size)}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {timeAgo(t.completed_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <CaretLeft size={14} />
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  {pageNo} / {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <CaretRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
