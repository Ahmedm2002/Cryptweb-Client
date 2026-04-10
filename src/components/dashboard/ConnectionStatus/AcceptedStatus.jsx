import React from "react";
import { ArrowLeft } from "lucide-react";
import StatusBar from "../../StatusBar";
import ServicesPicker from "../../ServicesPicker";
import FileTransfer from "../../FileTransfer";
import AudioCall from "../../AudioCall";
import VideoCall from "../../VideoCall";

const AcceptedStatus = ({
  isConnected,
  friendStatus,
  friendEmail,
  user,
  activeService,
  setActiveService,
  onDisconnect,
}) => {
  const renderService = () => {
    switch (activeService) {
      case "file":
        return (
          <div className="flex justify-center items-center w-full py-8">
            <FileTransfer
              friendEmail={friendEmail}
              status={friendStatus}
              onBack={() => setActiveService(null)}
            />
          </div>
        );
      case "audio":
        return <AudioCall onBack={() => setActiveService(null)} />;
      case "video":
        return <VideoCall onBack={() => setActiveService(null)} />;
      default:
        return (
          <div className="flex justify-center items-center w-full">
            <ServicesPicker onSelectService={setActiveService} />
          </div>
        );
    }
  };

  return (
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
          onClick={onDisconnect}
          className="text-sm font-medium text-gray-400 hover:text-red-500 px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
        >
          Disconnect Session
        </button>
      </div>

      <div className="flex-1 w-full flex justify-center items-start">
        {renderService()}
      </div>
    </div>
  );
};

export default AcceptedStatus;
