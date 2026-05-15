import { SOCKET_EVENTS } from "./socket.events.js";
import { socket } from "../socket/socket.js";

// console.log("Socket: ", socket);

function emitRegisterUser(user) {
  if (!user || !socket) return;
  socket.emit(SOCKET_EVENTS.USER_REGISTER, {
    email: user.email,
    name: user.name || user.email,
  });
}

function emitConnectionRequest(fromEmail, toEmail) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.CONNECTION_REQUEST, {
    from: fromEmail,
    to: toEmail,
  });
}

function emitConnectionResponse(fromEmail, toEmail, accepted) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.CONNECTION_RESPONSE, {
    from: fromEmail,
    to: toEmail,
    accepted,
  });
}

function emitWebRTCOffer(fromEmail, toEmail, offer) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.OFFER, {
    from: fromEmail,
    to: toEmail,
    offer,
  });
}

function emitWebRTCAnswer(fromEmail, toEmail, answer) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.ANSWER, {
    from: fromEmail,
    to: toEmail,
    answer,
  });
}

function emitIceCandidate(fromEmail, toEmail, candidate) {
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.ICE_CANDIDATE, {
    from: fromEmail,
    to: toEmail,
    candidate,
  });
}

export {
  emitConnectionResponse,
  emitIceCandidate,
  emitRegisterUser,
  emitWebRTCAnswer,
  emitWebRTCOffer,
  emitConnectionRequest,
};
