import { SOCKET_EVENTS } from "./socket.events.js";

export function emitRegisterUser(socket, user) {
  if (!user || !socket) return;
  console.log("[socket.handlers] Emitting USER_REGISTER", user.email);
  socket.emit(SOCKET_EVENTS.USER_REGISTER, {
    email: user.email,
    name: user.name || user.email,
  });
}

export function emitConnectionRequest(socket, fromEmail, toEmail) {
  if (!socket) return;
  console.log("[socket.handlers] Emitting CONNECTION_REQUEST", { fromEmail, toEmail });
  socket.emit(SOCKET_EVENTS.CONNECTION_REQUEST, {
    from: fromEmail,
    to: toEmail
  });
}

export function emitConnectionResponse(socket, fromEmail, toEmail, accepted) {
  if (!socket) return;
  console.log("[socket.handlers] Emitting CONNECTION_RESPONSE", { fromEmail, toEmail, accepted });
  socket.emit(SOCKET_EVENTS.CONNECTION_RESPONSE, {
    from: fromEmail,
    to: toEmail,
    accepted
  });
}

export function emitWebRTCOffer(socket, fromEmail, toEmail, offer) {
  if (!socket) return;
  console.log("[socket.handlers] Emitting OFFER", { fromEmail, toEmail });
  socket.emit(SOCKET_EVENTS.OFFER, {
    from: fromEmail,
    to: toEmail,
    offer
  });
}

export function emitWebRTCAnswer(socket, fromEmail, toEmail, answer) {
  if (!socket) return;
  console.log("[socket.handlers] Emitting ANSWER", { fromEmail, toEmail });
  socket.emit(SOCKET_EVENTS.ANSWER, {
    from: fromEmail,
    to: toEmail,
    answer
  });
}

export function emitIceCandidate(socket, fromEmail, toEmail, candidate) {
  if (!socket) return;
  console.log("[socket.handlers] Emitting ICE_CANDIDATE", { fromEmail, toEmail });
  socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
    from: fromEmail,
    to: toEmail,
    candidate
  });
}
