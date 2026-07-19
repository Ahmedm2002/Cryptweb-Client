const SOCKET_EVENTS = {
  USER_REGISTER: "user:register",
  CONNECTION_REQUEST: "connection:request",
  CONNECTION_INCOMING: "connection:incoming",
  ANSWER: "answer",
  CONNECTION_RESPONSE: "connection:response",
  ICE_CANDIDATE: "ice-candidate",
  DISCONNECT: "disconnect",
  CONNECT: "connect",
  OFFER: "offer",
  PEER_DISCONNECTED: "peer:disconnected",
  USERS_CONNECTED: "users:connected",
  NETWORK_USERS: "network:users",
  NETWORK_USER_JOINED: "network:user-joined",
  NETWORK_USER_LEFT: "network:user-left",
};

export { SOCKET_EVENTS };
