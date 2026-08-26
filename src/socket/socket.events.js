const SOCKET_EVENTS = {
  USER_REGISTER: "user:register",
  REGISTRATION_ERROR: "registration-error",
  CONNECTION_REQUEST: "connection:request",
  CONNECTION_INCOMING: "connection:incoming",
  ANSWER: "answer",
  CONNECTION_RESPONSE: "connection:response",
  ICE_CANDIDATE: "ice-candidate",
  DISCONNECT: "disconnect",
  CONNECT: "connect",
  OFFER: "offer",
  PEER_DISCONNECT_INTENTIONAL: "peer:disconnect-intentional",
  PEER_ENDED: "peer:ended",
  PEER_DISCONNECTED: "peer:disconnected",
  USERS_CONNECTED: "users:connected",
  CALL_REQUEST: "call:request",
  CALL_INCOMING: "call:incoming",
  CALL_RESPONSE: "call:response",
  CALL_ENDED: "call:ended",
  NETWORK_USERS: "network:users",
  NETWORK_USER_JOINED: "network:user-joined",
  NETWORK_USER_LEFT: "network:user-left",
  STATUS_UPDATE: "status-update",
  // Messaging system
  MESSAGE_SEND: "message:send",
  MESSAGE_RECEIVE: "message:receive",
  MESSAGE_SEND_ACK: "message:send-ack",
  // Notifications
  NOTIFICATION_NEW: "notification:new",
};

export { SOCKET_EVENTS };
