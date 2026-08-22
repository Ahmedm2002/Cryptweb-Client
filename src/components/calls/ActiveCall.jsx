import { useEffect, useRef, useState } from "react";
import {
  VideoCamera,
  Microphone,
  MicrophoneSlash,
  VideoCameraSlash,
  PhoneDisconnect,
} from "phosphor-react";
import { useSocket } from "../../socket/useSocket";

const ActiveCall = ({ peerName }) => {
  const {
    callStatus,
    activeCall,
    localStream,
    remoteStream,
    endCall,
    toggleLocalAudio,
    toggleLocalVideo,
  } = useSocket();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream || null;
    }
  }, [remoteStream]);

  if (!activeCall) return null;

  const isVideo = activeCall.type === "video";
  const connecting = callStatus !== "active";

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-32 sm:w-48 aspect-video object-cover rounded-lg border border-white/20 shadow-lg"
            />
          </>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
        )}

        {!isVideo && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-3xl font-semibold text-white select-none">
              {(peerName || "U").charAt(0).toUpperCase()}
            </div>
            <audio ref={remoteAudioRef} autoPlay />
          </div>
        )}

        {connecting && (
          <div className={`absolute ${isVideo ? "top-6" : "bottom-40"} left-0 right-0 flex flex-col items-center gap-2`}>
            <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-pulse" />
            <p className="text-white/80 text-sm">
              {callStatus === "outgoing" ? "Ringing..." : "Connecting..."}
            </p>
          </div>
        )}

        <p className="absolute top-6 left-6 text-white font-medium">
          {peerName}
        </p>
      </div>

      <div className="h-24 flex items-center justify-center gap-4 bg-gray-900/80">
        <button
          onClick={() => {
            const next = !micOn;
            setMicOn(next);
            toggleLocalAudio(next);
          }}
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
        >
          {micOn ? (
            <Microphone size={20} className="text-white" />
          ) : (
            <MicrophoneSlash size={20} className="text-red-400" />
          )}
        </button>

        {isVideo && (
          <button
            onClick={() => {
              const next = !camOn;
              setCamOn(next);
              toggleLocalVideo(next);
            }}
            className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            {camOn ? (
              <VideoCamera size={20} className="text-white" />
            ) : (
              <VideoCameraSlash size={20} className="text-red-400" />
            )}
          </button>
        )}

        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
        >
          <PhoneDisconnect size={22} className="text-white" weight="fill" />
        </button>
      </div>
    </div>
  );
};

export default ActiveCall;
