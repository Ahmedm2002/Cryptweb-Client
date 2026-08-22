import { Phone, VideoCamera, Check, X } from "phosphor-react";
import { useSocket } from "../../socket/useSocket";

const IncomingCall = () => {
  const { incomingCall, answerCall, rejectCall } = useSocket();

  if (!incomingCall) return null;

  const isVideo = incomingCall.type === "video";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="flex flex-col items-center px-6 pt-8 pb-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse ${
              isVideo ? "bg-blue-50" : "bg-green-50"
            }`}
          >
            {isVideo ? (
              <VideoCamera size={28} className="text-blue-600" />
            ) : (
              <Phone size={28} className="text-green-600" />
            )}
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {incomingCall.name}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Incoming {incomingCall.type} call
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
          <button
            onClick={rejectCall}
            className="flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <X size={16} weight="bold" />
            Decline
          </button>
          <button
            onClick={answerCall}
            className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Check size={16} weight="bold" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
