import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/EmailInput";
import { useSocket } from "../socket/useSocket";
import ChatWindow from "../components/chat/ChatWindow";
import ActiveCall from "../components/calls/ActiveCall";
import IncomingCall from "../components/calls/IncomingCall";
import NetworkUsers from "../components/dashboard/NetworkUsers";
import IncomingRequest from "../components/dashboard/ConnectionStatus/IncomingRequest";
import {
  SignOut,
  WarningCircle,
  X,
  WifiSlash,
  ArrowClockwise,
} from "phosphor-react";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toastHiddenFor, setToastHiddenFor] = useState(null);
  const {
    isConnectedWithFriend,
    friendStatus,
    incomingRequest,
    respondToRequest,
    connectionError,
    disconnectFromFriend,
    connectedFriend,
    peerDisconnected,
    clearPeerDisconnected,
    peerEnded,
    clearPeerEnded,
    connectionPhase,
    connectingTo,
    reconnectToServer,
    activeCall,
  } = useSocket();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const showToast =
    isConnectedWithFriend &&
    !!connectedFriend &&
    toastHiddenFor !== connectedFriend.email;

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(
      () => setToastHiddenFor(connectedFriend?.email),
      7000,
    );
    return () => clearTimeout(timer);
  }, [showToast, connectedFriend?.email]);

  return (
    <div className="relative w-full flex flex-col items-center gap-4">
      <div className="relative z-10 w-full flex flex-col items-center gap-4">
        {connectionError && (
          <div className="w-full max-w-md p-3 bg-white border border-gray-300 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <p className="text-sm text-gray-700 flex-1">{connectionError}</p>
              <button
                onClick={reconnectToServer}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <ArrowClockwise size={12} />
                Reconnect
              </button>
            </div>
          </div>
        )}

        {showToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md p-3 bg-amber-50 border border-amber-200 rounded-lg shadow-lg flex items-start gap-2">
            <WarningCircle
              size={14}
              className="text-amber-600 mt-0.5 shrink-0"
            />
            <p className="text-xs text-amber-700 flex-1">
              Refreshing the tab will close the connection with{" "}
              <span className="font-semibold">{connectedFriend.name}</span>. Any
              ongoing transfers will be lost.
            </p>
            <button
              onClick={() => setToastHiddenFor(connectedFriend.email)}
              className="shrink-0 w-5 h-5 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <X size={12} className="text-amber-600" weight="bold" />
            </button>
          </div>
        )}

        {!isConnectedWithFriend && (
          <>
            <div className="text-center mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                Secure File Transfer
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Enter your recipient's email to start
              </p>
            </div>

            <div className="w-full max-w-md mx-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 space-y-1.5">
              <p>
                <span className="font-medium text-gray-700">1.</span> Enter your
                recipient's email and click{" "}
                <span className="font-medium text-gray-700">Connect</span>
              </p>
              <p>
                <span className="font-medium text-gray-700">2.</span> Wait for
                them to accept your connection request
              </p>
              <p>
                <span className="font-medium text-gray-700">3.</span> Once
                connected, drag a file or click to browse and send it securely
              </p>
              <p className="text-xs text-gray-400 pt-1">
                Files are transferred directly and never stored on any server.
              </p>
            </div>

            <EmailInput initialEmail="" />

            <div className="w-full max-w-md mt-2">
              <NetworkUsers />
            </div>
          </>
        )}

        <IncomingRequest
          request={incomingRequest}
          onRespond={respondToRequest}
        />

        {connectionPhase && !isConnectedWithFriend && (
          <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
            </div>
            <p className="text-gray-600 text-sm">
              {connectionPhase === "requesting" &&
                `Looking for ${connectingTo || "your friend"}...`}
              {connectionPhase === "negotiating" &&
                `Establishing secure connection with ${connectingTo || "your friend"}...`}
            </p>
          </div>
        )}

        {isConnectedWithFriend && (
          <ChatWindow
            friendEmail={
              connectedFriend?.email ||
              friendStatus?.email ||
              friendStatus?.data?.email ||
              incomingRequest?.from
            }
            status={friendStatus}
            onDisconnect={disconnectFromFriend}
          />
        )}
      </div>

      <IncomingCall />
      {activeCall && (
        <ActiveCall
          peerName={connectedFriend?.name || connectedFriend?.email}
        />
      )}

      {peerEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="flex flex-col items-center px-6 pt-8 pb-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <SignOut size={24} className="text-gray-600" />
              </div>
              <p className="text-center text-sm text-gray-700 leading-relaxed">
                {peerEnded.message}
              </p>
            </div>
            <div className="px-6 pt-4 pb-6 flex justify-center">
              <button
                onClick={clearPeerEnded}
                className="px-6 py-2.5 bg-[#1c1c28] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a3a] transition-colors flex items-center gap-2"
              >
                <X size={14} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {peerDisconnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="flex flex-col items-center px-6 pt-8 pb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <WifiSlash size={24} className="text-red-600" />
              </div>
              <p className="text-center text-sm text-gray-700 leading-relaxed">
                {peerDisconnected.message}
              </p>
            </div>
            <div className="px-6 pt-4 pb-6 flex justify-center">
              <button
                onClick={clearPeerDisconnected}
                className="px-6 py-2.5 bg-[#1c1c28] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a3a] transition-colors flex items-center gap-2"
              >
                <X size={14} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
