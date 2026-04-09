import { useEffect, useState } from "react";
import { useSocket, socket } from "../hooks/useSocket";
import EmailInput from "../components/EmailInput";
import StatusBar from "../components/StatusBar";
import FileTransfer from "../components/FileTransfer";
import AudioCall from "../components/AudioCall";
import VideoCall from "../components/VideoCall";

export const Home = () => {
  const { isConnected, friendStatus, checkFriendStatus, onConnect } =
    useSocket();
  const [friendEmail, setFriendEmail] = useState("");
  const [showCards, setShowCards] = useState(false);

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
    let timer;
    if (friendStatus?.isOnline) {
      timer = setTimeout(() => setShowCards(true), 500);
    } else {
      timer = setTimeout(() => setShowCards(false), 0);
    }
    return () => clearTimeout(timer);
  }, [friendStatus?.isOnline]);

  const handleConnect = (email) => {
    setFriendEmail(email);
    checkFriendStatus(email);
  };

  const handleCancel = () => {
    setShowCards(false);
    setFriendEmail("");
  };

  return (
    <div className="w-full flex flex-col gap-8 sm:mt-8 mt-4 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 text-center tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500 text-center max-w-md mx-auto">
          Secure, peer-to-peer sharing directly from your browser.
        </p>
      </div>

      {!showCards ? (
        <div className="animate-in fade-in zoom-in duration-300">
          <EmailInput
            onConnect={handleConnect}
            disabled={!isConnected || friendStatus?.isOnline}
          />
          {friendEmail && (
            <div className="mt-8">
              <StatusBar
                isUserOnline={isConnected}
                friendStatus={friendStatus}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-8 fade-in duration-500 w-full max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <StatusBar isUserOnline={isConnected} friendStatus={friendStatus} />
            <button
              onClick={handleCancel}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel / Change Friend
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
            <div className="order-2 lg:order-1 flex">
              <AudioCall />
            </div>
            <div className="order-1 lg:order-2 flex lg:-mt-4 lg:-mb-4 z-10 lg:shadow-xl lg:rounded-3xl">
              <FileTransfer friendEmail={friendEmail} status={friendStatus} />
            </div>
            <div className="order-3 flex">
              <VideoCall />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
