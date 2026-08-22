import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("WebRTC");

/**
 * Inspects the selected candidate pair and SCTP limits of an established
 * connection. Updates maxMessageSize on the peer instance and reports
 * stats through onConnectionStats.
 */
export async function diagnoseConnection(peerConnection, callbacks) {
  const { onStats } = callbacks;

  try {
    const stats = await peerConnection.getStats();
    let transport = null;
    stats.forEach((report) => {
      if (report.type === "transport") transport = report;
    });

    let localType = "unknown";
    let remoteType = "unknown";

    if (transport?.selectedCandidatePairId) {
      const pair = stats.get(transport.selectedCandidatePairId);
      if (pair) {
        const local = stats.get(pair.localCandidateId);
        const remote = stats.get(pair.remoteCandidateId);
        localType = local?.candidateType || "unknown";
        remoteType = remote?.candidateType || "unknown";
      }
    }

    const maxMessageSize = peerConnection?.sctp?.maxMessageSize || 65536;
    const relayed = localType === "relay" || remoteType === "relay";

    log.log(
      `[ICE] Connection path: ${localType}↔${remoteType}${relayed ? " — TURN in use" : ""}`,
    );
    log.log(`[ICE] SCTP maxMessageSize: ${maxMessageSize}`);

    if (relayed) {
      log.warn(
        "[ICE] relay↔relay detected — TURN in use. On same-LAN this explains slow transfers.",
      );
    }

    onStats?.({
      localCandidateType: localType,
      remoteCandidateType: remoteType,
      candidateType: `${localType}↔${remoteType}`,
      relayed,
      maxMessageSize,
    });

    return maxMessageSize;
  } catch (err) {
    log.error("Failed to get connection stats:", err);
    return 65536;
  }
}
