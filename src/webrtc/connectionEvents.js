import { STUN_AND_TURN } from "./iceServers";
import { emitIceCandidate } from "../socket/socket.handlers";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("WebRTC");

const TURN_FALLBACK_DELAY_MS = 5000;

/**
 * Wires ICE, connection-state, data-channel and remote-track events onto an
 * RTCPeerConnection. `peer` is the owning RTCPeer instance.
 */
export function bindConnectionEvents(peerConnection, peer) {
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      log.log(
        `ICE candidate [${event.candidate.type || "unknown"}] → ${peer._remotePeerEmail}`,
      );
      emitIceCandidate(peer._localEmail, peer._remotePeerEmail, event.candidate);
    }
  };

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState;
    log.log(`Connection state: ${state} (with ${peer._remotePeerEmail})`);

    if (state === "connected") {
      peer.clearTurnFallback();
      peer.diagnoseConnection();
      peer.onConnected?.();
    } else if (state === "failed") {
      peer.handleConnectionFailure();
    }
  };

  peerConnection.ondatachannel = (event) => {
    log.log(`Remote data channel received: "${event.channel.label}"`);
    peer.attachIncomingDataChannel(event.channel);
  };

  peerConnection.ontrack = (event) => {
    log.log(
      `Remote ${event.track.kind} track received from ${peer._remotePeerEmail}`,
    );
    peer.addRemoteTrack(event.track);
  };
}

/** Starts the 5s STUN-only window before falling back to TURN. */
export function startTurnFallbackTimer(peerConnection, onFallback) {
  return setTimeout(() => {
    if (peerConnection && peerConnection.connectionState !== "connected") {
      log.warn("[TURN-FALLBACK] No direct connection after 5s — adding TURN servers");
      peerConnection.setConfiguration(STUN_AND_TURN);
      peerConnection.restartIce();
      onFallback?.();
    }
  }, TURN_FALLBACK_DELAY_MS);
}
