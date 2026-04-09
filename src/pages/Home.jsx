import { useEffect, useState } from "react";
import { useSocket, socket } from "../hooks/useSocket";
import EmailInput from "../components/EmailInput";
import StatusBar from "../components/StatusBar";
import FileTransfer from "../components/FileTransfer";
import AudioCall from "../components/AudioCall";
import VideoCall from "../components/VideoCall";
import ServicesPicker from "../components/ServicesPicker";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const Home = () => {
  const { user } = useAuth();
  const {
    isConnected,
    friendStatus,
    incomingRequest,
    requestStatus,
    checkFriendStatus,
    sendConnectionRequest,
    respondToRequest,
    onConnect,
  } = useSocket();
  const [friendEmail, setFriendEmail] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect(() => {
        onConnect();
      });
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (requestStatus === "accepted") {
      setShowCards(true);
    } else if (requestStatus === "declined") {
      setShowCards(false);
    }
  }, [requestStatus]);

  const handleConnect = (email) => {
    setFriendEmail(email);
    sendConnectionRequest(email);
  };

  const handleCancel = () => {
    setShowCards(false);
    setFriendEmail("");
    setActiveService(null);
  };

  const renderService = () => {
    switch (activeService) {
      case "file":
        return (
          <FileTransfer
            friendEmail={friendEmail}
            status={friendStatus}
            onBack={() => setActiveService(null)}
          />
        );
      case "audio":
        return <AudioCall onBack={() => setActiveService(null)} />;
      case "video":
        return <VideoCall onBack={() => setActiveService(null)} />;
      default:
        return <ServicesPicker onSelectService={setActiveService} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 sm:mt-8 mt-4 animate-in fade-in duration-300 relative">
      {/* Incoming Connection Request Popup */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-gray-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Connection Request
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  <span className="font-semibold text-indigo-600">
                    {incomingRequest.fromName || incomingRequest.from}
                  </span>{" "}
                  wants to connect with you.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-4">
                <button
                  onClick={() => respondToRequest(incomingRequest.from, false)}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => respondToRequest(incomingRequest.from, true)}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showCards ? (
        <div className="animate-in fade-in zoom-in duration-300">
          <EmailInput
            onConnect={handleConnect}
            disabled={!isConnected || requestStatus === "pending"}
          />

          {requestStatus === "pending" && (
            <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-50">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                <span className="text-sm font-semibold text-gray-600">
                  Waiting for {friendStatus?.name || friendEmail} to accept...
                </span>
              </div>
            </div>
          )}

          {requestStatus === "declined" && (
            <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-top-4">
              <span className="text-sm font-semibold text-red-500 bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
                Connection declined by {friendStatus?.name || friendEmail}
              </span>
            </div>
          )}

          {(friendEmail || friendStatus) && requestStatus === "idle" && (
            <div className="mt-8">
              <StatusBar
                isUserOnline={isConnected}
                friendStatus={friendStatus}
                friendEmail={friendEmail}
                userName={user?.name}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 fade-in duration-500 w-full max-w-6xl mx-auto flex-1">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-4">
              {activeService && (
                <button
                  onClick={() => setActiveService(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                  title="Back to Services"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
                </button>
              )}
              <StatusBar
                isUserOnline={isConnected}
                friendStatus={friendStatus}
                friendEmail={friendEmail}
                userName={user?.name}
              />
            </div>
            <button
              onClick={handleCancel}
              className="text-sm font-medium text-gray-400 hover:text-red-500 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
            >
              Disconnect Session
            </button>
          </div>

          <div className="flex-1 w-full">{renderService()}</div>
        </div>
      )}
    </div>
  );
};
