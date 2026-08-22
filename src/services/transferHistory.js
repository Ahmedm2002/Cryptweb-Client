import { api } from "./api.js";

/**
 * Persists a completed transfer to the backend history API.
 * Fire-and-forget: errors are swallowed.
 */
export function recordCompletedTransfer({
  userEmail,
  friendEmail,
  startedAt,
  fileName,
  fileSize,
  fileType,
  transferType,
}) {
  if (!userEmail || !friendEmail || !startedAt) return;

  const timeElapsed = (Date.now() - startedAt) / 1000;

  api
    .post("/file-transfers/complete", {
      senderEmail: transferType === "send" ? userEmail : friendEmail,
      receiverEmail: transferType === "send" ? friendEmail : userEmail,
      fileName,
      fileSize,
      fileType,
      timeElapsed,
      transferType,
    })
    .catch(() => {});
}
