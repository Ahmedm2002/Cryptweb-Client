const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

const TURN_SERVERS = [
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "c2d8d546607a6f858bbc5aad",
    credential: "j3+fryelPOgu3rUx",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "c2d8d546607a6f858bbc5aad",
    credential: "j3+fryelPOgu3rUx",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "c2d8d546607a6f858bbc5aad",
    credential: "j3+fryelPOgu3rUx",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "c2d8d546607a6f858bbc5aad",
    credential: "j3+fryelPOgu3rUx",
  },
];

export const STUN_ONLY = { iceServers: STUN_SERVERS };
export const STUN_AND_TURN = { iceServers: [...STUN_SERVERS, ...TURN_SERVERS] };
