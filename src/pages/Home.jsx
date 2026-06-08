import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/EmailInput";
import { useSocket } from "../socket/useSocket";
import FileTransfer from "../components/FileTransfer";
import IncomingRequest from "../components/dashboard/ConnectionStatus/IncomingRequest";
import { useFileTransfer } from "../hooks/useFileTransfer";
import { LogOut } from "lucide-react";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isConnectedWithFriend,
    friendStatus,
    incomingRequest,
    respondToRequest,
    connectionError,
    setConnectionError,
    disconnectFromFriend,
    connectedFriend,
  } = useSocket();

  const {
    pendingDownload,
    pendingMessage,
    downloadPendingFile,
    dismissPending,
  } = useFileTransfer(null, user);

  const [resumeTarget, setResumeTarget] = useState(null);
  const [resumeEmail, setResumeEmail] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleResume = () => {
    if (!pendingMessage) return;
    const email = pendingMessage.friendEmail;
    setResumeEmail(email);
    setResumeTarget({
      transferId: pendingMessage.transferId,
      fileName: pendingMessage.fileName,
      fileSize: pendingMessage.fileSize,
      lastChunkId: pendingMessage.lastChunkId,
      totalChunks: pendingMessage.totalChunks,
      friendEmail: email,
    });
    dismissPending();
  };

  const handleResumeComplete = () => {
    setResumeTarget(null);
    setResumeEmail("");
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">

      {pendingDownload && (
        <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-900 mb-2">
            File ready: <span className="font-semibold">{pendingDownload.fileName}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={downloadPendingFile}
              className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Download
            </button>
            <button
              onClick={dismissPending}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {pendingMessage && pendingMessage.type === 'incomplete' && !resumeTarget && (
        <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-sm text-gray-700 mb-3">
            Incomplete transfer: <span className="font-semibold">{pendingMessage.fileName}</span> ({pendingMessage.progress})
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleResume}
              className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Resume
            </button>
            <button
              onClick={dismissPending}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {connectionError && (
        <div className="w-full max-w-md p-3 bg-white border border-gray-300 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <p className="text-sm text-gray-700 flex-1">{connectionError}</p>
            <button
              onClick={() => setConnectionError(null)}
              className="text-gray-400 hover:text-gray-600 text-xs font-medium whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {isConnectedWithFriend && connectedFriend && (
        <div className="w-full max-w-2xl mx-auto p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-700">
              Connected to <span className="font-semibold">{connectedFriend.name}</span>
            </span>
          </div>
          <button
            onClick={disconnectFromFriend}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <LogOut size={12} />
            Disconnect
          </button>
        </div>
      )}

      {!isConnectedWithFriend && (
        <>
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              {resumeTarget ? "Connect to Resume Transfer" : "Secure File Transfer"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {resumeTarget
                ? `Enter the email of the friend for ${resumeTarget.fileName}`
                : "Enter your recipient's email to start"
              }
            </p>
          </div>

          <div className="w-full max-w-md mx-auto p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 space-y-2">
            <p><span className="font-medium text-gray-800">1.</span> Enter your recipient's email and click <span className="font-medium text-gray-800">Connect</span></p>
            <p><span className="font-medium text-gray-800">2.</span> Wait for them to accept your connection request</p>
            <p><span className="font-medium text-gray-800">3.</span> Once connected, drag a file or click to browse and send it securely</p>
            <p className="text-xs text-gray-400 mt-2">Files are transferred peer-to-peer and never stored on any server.</p>
          </div>

          <EmailInput initialEmail={resumeEmail} key={resumeEmail || "default"} />
        </>
      )}

      <IncomingRequest request={incomingRequest} onRespond={respondToRequest} />

      {friendStatus && !isConnectedWithFriend && (
        <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
          <p className="text-gray-600 text-sm">
            Establishing secure connection with {friendStatus.data?.name || friendStatus.data?.email}...
          </p>
        </div>
      )}

      {isConnectedWithFriend && (
        <FileTransfer
          friendEmail={connectedFriend?.email || friendStatus?.email || friendStatus?.data?.email || incomingRequest?.from}
          status={friendStatus}
          resumeTarget={resumeTarget}
          onResumeComplete={handleResumeComplete}
        />
      )}
    </div>
  );
}

export default Home;
