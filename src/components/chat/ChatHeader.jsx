import { Phone, VideoCamera, SignOut } from "phosphor-react";

const GOOGLE_COLORS = [
  "#1a73e8", "#e8710a", "#188038", "#a142f4", "#e5143c",
  "#f9ab00", "#12a4af",
];

function getGoogleColor(name) {
  const letter = (name || "U").charAt(0).toUpperCase();
  const index = letter.charCodeAt(0) - 65;
  if (index < 0 || index > 25) return GOOGLE_COLORS[0];
  return GOOGLE_COLORS[index % GOOGLE_COLORS.length];
}

function ChatHeader({ peerName, onAudioCall, onVideoCall, onDisconnect }) {
  const bgColor = getGoogleColor(peerName);

  return (
    <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold text-sm shrink-0 select-none"
          style={{ backgroundColor: bgColor }}
        >
          {peerName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {peerName}
          </p>
          <p className="text-[11px] text-green-600">Connected</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onAudioCall}
          title="Audio call"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <Phone size={18} className="text-gray-700" />
        </button>
        <button
          onClick={onVideoCall}
          title="Video call"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <VideoCamera size={18} className="text-gray-700" />
        </button>
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            title="Disconnect"
            className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
          >
            <SignOut size={16} className="text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatHeader;
