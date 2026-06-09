import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/EmailInput";
import { useSocket } from "../socket/useSocket";
import FileTransfer from "../components/FileTransfer";
import IncomingRequest from "../components/dashboard/ConnectionStatus/IncomingRequest";
import { LogOut, AlertTriangle } from "lucide-react";

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

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="w-full flex flex-col items-center gap-4">

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
        <>
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
          <div className="w-full max-w-2xl mx-auto p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              Refreshing the tab will close the connection with <span className="font-semibold">{connectedFriend.name}</span>. Any ongoing transfers will be lost.
            </p>
          </div>
        </>
      )}

      {!isConnectedWithFriend && (
        <>
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Secure File Transfer</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your recipient's email to start</p>
          </div>

          <div className="w-full max-w-md mx-auto p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 space-y-2">
            <p><span className="font-medium text-gray-800">1.</span> Enter your recipient's email and click <span className="font-medium text-gray-800">Connect</span></p>
            <p><span className="font-medium text-gray-800">2.</span> Wait for them to accept your connection request</p>
            <p><span className="font-medium text-gray-800">3.</span> Once connected, drag a file or click to browse and send it securely</p>
            <p className="text-xs text-gray-400 mt-2">Files are transferred directly and never stored on any server.</p>
          </div>

          <EmailInput initialEmail="" />
        </>
      )}

      <IncomingRequest request={incomingRequest} onRespond={respondToRequest} />

      {friendStatus && !isConnectedWithFriend && (
        <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
          <p className="text-gray-600 text-sm">
            Establishing direct connection with {friendStatus.data?.name || friendStatus.data?.email}...
          </p>
        </div>
      )}

      {isConnectedWithFriend && (
        <FileTransfer
          friendEmail={connectedFriend?.email || friendStatus?.email || friendStatus?.data?.email || incomingRequest?.from}
          status={friendStatus}
        />
      )}
    </div>
  );
}

export default Home;
