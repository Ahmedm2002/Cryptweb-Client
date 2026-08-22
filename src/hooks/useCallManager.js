import { useState, useCallback } from "react";
import { emitCallRequest, emitCallResponse, emitCallEnded } from "../socket/socket.handlers.js";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("Call");

/**
 * Owns all call state (incoming ringing, active call, streams) and the
 * actions to start / answer / reject / end calls over the shared peer
 * connection.
 *
 * @param {object} deps
 * @param {React.MutableRefObject} deps.peerRef          active RTCPeer instance ref
 * @param {React.MutableRefObject} deps.pendingOfferRef  queued renegotiation offer ref
 * @param {() => string}  deps.getUserEmail              current user's email
 * @param {() => string}  deps.getPeerEmail              connected peer's email
 * @param {(msg: string) => void} deps.setConnectionError
 */
export function useCallManager({
  peerRef,
  pendingOfferRef,
  getUserEmail,
  getPeerEmail,
  setConnectionError,
}) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  /** Full teardown: stops mic/cam tracks and clears pending offer. */
  const cleanupCall = useCallback(() => {
    peerRef.current?.stopMedia();
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setCallStatus(null);
    setIncomingCall(null);
    pendingOfferRef.current = null;
  }, [peerRef, pendingOfferRef]);

  /**
   * Light reset used when the whole session is already being torn down
   * (peer ended/disconnected) — no media stop needed, peer.close() did it.
   */
  const resetCallState = useCallback(() => {
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setCallStatus(null);
    setIncomingCall(null);
    pendingOfferRef.current = null;
  }, [pendingOfferRef]);

  const handleRemoteStream = useCallback((stream) => {
    setRemoteStream(stream);
    setCallStatus("active");
  }, []);

  const startCall = useCallback(
    async (type) => {
      if (!peerRef.current?.isConnected()) return;
      try {
        const stream = await peerRef.current.startMedia(type);
        setLocalStream(stream);
        setActiveCall({ type });
        setCallStatus("outgoing");
        emitCallRequest(getUserEmail(), getPeerEmail(), type);
        await peerRef.current.renegotiate();
      } catch (err) {
        log.error("Failed to start call:", err);
        cleanupCall();
        setConnectionError(
          err.name === "NotAllowedError"
            ? "Camera/microphone access was denied."
            : "Could not start the call.",
        );
      }
    },
    [peerRef, getUserEmail, getPeerEmail, setConnectionError, cleanupCall],
  );

  const answerCall = useCallback(async () => {
    const call = incomingCall;
    if (!call) return;
    emitCallResponse(getUserEmail(), call.from, true);
    setIncomingCall(null);
    try {
      const stream = await peerRef.current.startMedia(call.type);
      setLocalStream(stream);
      setActiveCall({ type: call.type });
      setCallStatus("connecting");
      const offer = pendingOfferRef.current;
      pendingOfferRef.current = null;
      if (offer) {
        await peerRef.current.handleOffer(offer);
      }
    } catch (err) {
      log.error("Failed to answer call:", err);
      emitCallResponse(getUserEmail(), call.from, false);
      cleanupCall();
    }
  }, [
    incomingCall,
    getUserEmail,
    peerRef,
    pendingOfferRef,
    cleanupCall,
  ]);

  const rejectCall = useCallback(() => {
    const call = incomingCall;
    if (!call) return;
    emitCallResponse(getUserEmail(), call.from, false);
    setIncomingCall(null);
  }, [incomingCall, getUserEmail]);

  const endCall = useCallback(() => {
    emitCallEnded(getUserEmail(), getPeerEmail());
    cleanupCall();
  }, [getUserEmail, getPeerEmail, cleanupCall]);

  const onIncomingCall = useCallback(
    (data) => {
      if (activeCall || incomingCall) {
        log.warn(`Rejecting call from ${data.from} — busy with another call`);
        emitCallResponse(getUserEmail(), data.from, false);
        return;
      }
      log.log(`Incoming ${data.type} call from ${data.name || data.from}`);
      setIncomingCall({ from: data.from, name: data.name, type: data.type });
    },
    [activeCall, incomingCall, getUserEmail],
  );

  const onCallResponse = useCallback(
    (data) => {
      log.log(`Call response from ${data.from}: ${data.accepted ? "accepted" : "rejected"}`);
      if (!data.accepted) {
        cleanupCall();
      }
    },
    [cleanupCall],
  );

  const onCallEnded = useCallback(() => {
    log.log("Call ended by peer");
    cleanupCall();
  }, [cleanupCall]);

  const toggleLocalAudio = useCallback(
    (enabled) => peerRef.current?.toggleAudio(enabled),
    [peerRef],
  );

  const toggleLocalVideo = useCallback(
    (enabled) => peerRef.current?.toggleVideo(enabled),
    [peerRef],
  );

  return {
    incomingCall,
    activeCall,
    callStatus,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    onIncomingCall,
    onCallResponse,
    onCallEnded,
    toggleLocalAudio,
    toggleLocalVideo,
    cleanupCall,
    resetCallState,
    handleRemoteStream,
  };
}
