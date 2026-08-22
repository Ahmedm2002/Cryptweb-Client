import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("WebRTC");

export async function acquireMediaStream(type) {
  log.log(`Requesting ${type} media from getUserMedia`);
  const constraints =
    type === "video"
      ? { video: { width: 1280, height: 720 }, audio: true }
      : { audio: true };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    log.log(`${type} media acquired (${stream.getTracks().length} tracks)`);
    return stream;
  } catch (err) {
    log.error(`Failed to acquire ${type} media:`, err.name, err.message);
    throw err;
  }
}

export function attachStreamToConnection(peerConnection, stream) {
  const tracks = stream.getTracks();
  log.log(`Attaching ${tracks.length} local track(s) to peer connection`);
  tracks.forEach((track) => {
    peerConnection.addTrack(track, stream);
  });
}

export function stopStream(stream) {
  if (!stream) return;
  log.log(`Stopping ${stream.getTracks().length} local track(s)`);
  stream?.getTracks().forEach((track) => track.stop());
}

export function detachAllTracks(peerConnection) {
  if (!peerConnection?.getSenders) return;
  log.log("Detaching all local tracks from peer connection");
  peerConnection.getSenders().forEach((sender) => {
    if (sender.track) {
      try {
        peerConnection.removeTrack(sender);
      } catch {
        sender.track.stop();
      }
    }
  });
}

export function toggleStreamTracks(stream, kind, enabled) {
  const getter = kind === "audio" ? "getAudioTracks" : "getVideoTracks";
  const count = stream?.[getter]?.().length ?? 0;
  log.log(`Toggling ${kind} ${enabled ? "on" : "off"} (${count} track(s))`);
  stream?.[getter]?.().forEach((t) => (t.enabled = enabled));
}
