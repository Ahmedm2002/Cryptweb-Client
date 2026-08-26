import { SOCKET_EVENTS } from "./socket.events.js";
import { socket } from "../socket/socket.js";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("Socket");

function emitRegisterUser(user) {
  if (!user || !socket) return;
  log.log(`Emitting ${SOCKET_EVENTS.USER_REGISTER} for ${user.email}`);
  socket.emit(SOCKET_EVENTS.USER_REGISTER, {
    email: user.email,
    name: user.name || user.email,
  });
}

function emitConnectionRequest(fromEmail, toEmail) {
  if (!socket) return;
  log.log(`Emitting ${SOCKET_EVENTS.CONNECTION_REQUEST}: ${fromEmail} → ${toEmail}`);
  socket.emit(SOCKET_EVENTS.CONNECTION_REQUEST, {
    from: fromEmail,
    to: toEmail,
  });
}

function emitConnectionResponse(fromEmail, toEmail, accepted) {
  if (!socket) return;
  log.log(
    `Emitting ${SOCKET_EVENTS.CONNECTION_RESPONSE} to ${toEmail}: ${accepted ? "accepted" : "rejected"}`,
  );
  socket.emit(SOCKET_EVENTS.CONNECTION_RESPONSE, {
    from: fromEmail,
    to: toEmail,
    accepted,
  });
}

function emitWebRTCOffer(fromEmail, toEmail, offer) {
  if (!socket) return;
  log.log(`Emitting ${SOCKET_EVENTS.OFFER}: ${fromEmail} → ${toEmail}`);
  socket.emit(SOCKET_EVENTS.OFFER, {
    from: fromEmail,
    to: toEmail,
    offer,
  });
}

function emitWebRTCAnswer(fromEmail, toEmail, answer) {
  if (!socket) return;
  log.log(`Emitting ${SOCKET_EVENTS.ANSWER}: ${fromEmail} → ${toEmail}`);
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

function emitUsersConnected(initiator, receiver) {
  if (!socket) return;
  log.log(
    `Emitting ${SOCKET_EVENTS.USERS_CONNECTED}: initiator=${initiator}, receiver=${receiver}`,
  );
  socket.emit(SOCKET_EVENTS.USERS_CONNECTED, { initiator, receiver });
}

function emitNetworkUsers() {
  if (!socket) return;
  log.log(`Emitting ${SOCKET_EVENTS.NETWORK_USERS} request`);
  socket.emit(SOCKET_EVENTS.NETWORK_USERS);
}

function emitDisconnectIntentional(email) {
  if (!socket) return;
  log.log(`Emitting intentional disconnect for ${email}`);
  socket.emit(SOCKET_EVENTS.PEER_DISCONNECT_INTENTIONAL, { email });
}

function emitCallRequest(fromEmail, toEmail, type) {
  if (!socket) return;
  log.log(`Emitting ${SOCKET_EVENTS.CALL_REQUEST} (${type}): ${fromEmail} → ${toEmail}`);
  socket.emit(SOCKET_EVENTS.CALL_REQUEST, { from: fromEmail, to: toEmail, type });
}

function emitCallResponse(fromEmail, toEmail, accepted) {
  if (!socket) return;
  log.log(
    `Emitting ${SOCKET_EVENTS.CALL_RESPONSE} to ${toEmail}: ${accepted ? "accepted" : "rejected"}`,
  );
  socket.emit(SOCKET_EVENTS.CALL_RESPONSE, { from: fromEmail, to: toEmail, accepted });
}

function emitCallEnded(fromEmail, toEmail) {
  if (!socket) return;
  log.log(`Emitting ${SOCKET_EVENTS.CALL_ENDED}: ${fromEmail} → ${toEmail}`);
  socket.emit(SOCKET_EVENTS.CALL_ENDED, { from: fromEmail, to: toEmail });
}

export {
  emitConnectionResponse,
  emitIceCandidate,
  emitRegisterUser,
  emitWebRTCAnswer,
  emitWebRTCOffer,
  emitConnectionRequest,
  emitUsersConnected,
  emitNetworkUsers,
  emitDisconnectIntentional,
  emitCallRequest,
  emitCallResponse,
  emitCallEnded,
};
