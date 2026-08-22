import { useEffect, useRef, useState } from "react";
import { SOCKET_EVENTS } from "../socket/socket.events.js";
import { socket } from "../socket/socket.js";
import { useSocketLifecycle } from "../socket/socketLifecycle.js";
import {
  emitRegisterUser,
  emitConnectionRequest,
  emitConnectionResponse,
  emitUsersConnected,
  emitDisconnectIntentional,
} from "../socket/socket.handlers.js";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("Socket");

/**
 * Owns connection & friend-request state and the entire socket lifecycle
 * (register, reconnect grace period, teardown). WebRTC signaling handlers
 * (offer/answer/ICE) and domain events (calls, network users) are injected
 * via extraHandlers so they stay fresh without re-subscribing.
 */
export function useConnectionManager({
  user,
  peerRef,
  getIsTransferring,
  teardownSession,
  startNegotiation,
  extraHandlers,
}) {
  const [isConnectedWithServer, setIsConnectedWithServer] = useState(
    socket.connected,
  );
  const [friendStatus, setFriendStatus] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [, setIsInitiator] = useState(false);
  const [isConnectedWithFriend, setIsConnectedWithFriend] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [connectedFriend, setConnectedFriend] = useState(null);
  const [peerDisconnected, setPeerDisconnected] = useState(null);
  const [peerEnded, setPeerEnded] = useState(null);
  const [connectionPhase, setConnectionPhase] = useState(null);
  const [connectingTo, setConnectingTo] = useState(null);

  const pendingFriendInfo = useRef(null);
  const isInitiatorRef = useRef(false);
  const socketDisconnectTimerRef = useRef(null);

  function markInitiator(value) {
    setIsInitiator(value);
    isInitiatorRef.current = value;
  }

  function resetConnectionState() {
    setConnectedFriend(null);
    setIsConnectedWithFriend(false);
    setConnectionPhase(null);
    setConnectingTo(null);
  }

  function onIncomingRequest(data) {
    // Busy: already connected or mid-negotiation — politely refuse
    if (isConnectedWithFriend || connectionPhase === "negotiating") {
      log.log(
        `Auto-rejecting request from ${data.from} — busy with another session`,
      );
      emitConnectionResponse(user.email, data.from, false);
      return;
    }
    // Another request is already pending — refuse the newcomer
    if (incomingRequest) {
      log.log(
        `Auto-rejecting request from ${data.from} — another request pending`,
      );
      emitConnectionResponse(user.email, data.from, false);
      return;
    }
    markInitiator(false);
    setIncomingRequest(data);
    pendingFriendInfo.current = {
      email: data.from,
      name: data.fromName || data.from,
    };
  }

  function updateFriendsStatus(data) {
    // Block new connect attempts while already connected or negotiating
    if (isConnectedWithFriend || connectionPhase === "negotiating") {
      log.warn("Connect attempt blocked — busy with another session");
      setConnectionError(
        isConnectedWithFriend
          ? `Already connected with ${connectedFriend?.name || connectedFriend?.email}. Disconnect first to start a new session.`
          : `Still connecting to ${connectingTo || "someone"}. Wait for it to finish.`,
      );
      return;
    }
    markInitiator(true);
    if (!data) {
      setFriendStatus(null);
      return;
    }
    pendingFriendInfo.current = {
      email: data.email || data.data?.email,
      name: data.data?.name || data.email || data.data?.email,
    };
    if (data?.data?.isOnline || data?.isOnline) {
      setFriendStatus(data);
      setConnectionError(null);
      setConnectionPhase("requesting");
      setConnectingTo(data.data?.name || data.email || data.data?.email);
      emitConnectionRequest(user.email, data.email || data.data?.email);
    } else {
      setFriendStatus(null);
    }
  }

  function respondToRequest(fromEmail, accepted) {
    // Safety: refuse instead of accepting if we somehow became busy
    if (accepted && (isConnectedWithFriend || connectionPhase === "negotiating")) {
      log.warn(`Cannot accept request from ${fromEmail} — busy with another session`);
      emitConnectionResponse(user.email, fromEmail, false);
      setIncomingRequest(null);
      return;
    }
    emitConnectionResponse(user.email, fromEmail, accepted);
    setIncomingRequest(null);
    if (accepted) {
      setConnectionError(null);
      setConnectionPhase("negotiating");
      setConnectingTo(pendingFriendInfo.current?.name || fromEmail);
    }
  }

  function onPeerConnected() {
    log.log(`Peer connected: ${pendingFriendInfo.current?.email || "unknown"}`);
    setIsConnectedWithFriend(true);
    setConnectionPhase(null);
    setConnectingTo(null);
    if (pendingFriendInfo.current) {
      setConnectedFriend({ ...pendingFriendInfo.current });
    }
    const myEmail = user?.email;
    const friendEmail = pendingFriendInfo.current?.email;
    if (myEmail && friendEmail) {
      const initiator = isInitiatorRef.current ? myEmail : friendEmail;
      const receiver = isInitiatorRef.current ? friendEmail : myEmail;
      emitUsersConnected(initiator, receiver);
    }
  }

  function onPeerError(msg) {
    setConnectionError(msg);
    setIsConnectedWithFriend(false);
    setConnectedFriend(null);
    setConnectionPhase(null);
    setConnectingTo(null);
  }

  function onPeerEnded(data) {
    log.log(`${data.name} (${data.email}) intentionally ended the connection`);
    teardownSession();
    resetConnectionState();
    setPeerEnded(data);
  }

  function onPeerDisconnected(data) {
    log.log(`${data.name} (${data.email}) disconnected unexpectedly`);
    teardownSession();
    resetConnectionState();
    setPeerDisconnected(data);
  }

  function onConnectionResponse(data) {
    markInitiator(true);
    if (data?.accepted) {
      setConnectionError(null);
      setConnectionPhase("negotiating");
      startNegotiation(data.from);
    } else {
      log.log(`Connection rejected by ${data?.from}`);
      setFriendStatus(null);
      markInitiator(false);
      setConnectionPhase(null);
      setConnectingTo(null);
      setConnectionError(
        `Connection request was rejected by ${data?.from || "the recipient"}.`,
      );
    }
  }

  function disconnectFromFriend() {
    if (getIsTransferring()) {
      setConnectionError(
        "Cannot disconnect while a file transfer is in progress.",
      );
      return;
    }
    log.log(`Disconnecting from friend`);
    emitDisconnectIntentional(user?.email);
    teardownSession();
    setFriendStatus(null);
    markInitiator(false);
    setConnectionError(null);
  }

  function reconnectToServer() {
    if (socketDisconnectTimerRef.current) {
      clearTimeout(socketDisconnectTimerRef.current);
      socketDisconnectTimerRef.current = null;
    }
    setConnectionError(null);
    socket.disconnect();
    socket.connect();
  }

  // --- socket lifecycle -------------------------------------------------
  function handleConnect() {
    log.log("Socket connected to server");
    if (socketDisconnectTimerRef.current) {
      clearTimeout(socketDisconnectTimerRef.current);
      socketDisconnectTimerRef.current = null;
      setConnectionError(null);
    }
    setIsConnectedWithServer(true);
    emitRegisterUser(user);
  }

  function handleDisconnect() {
    log.warn("Socket disconnected from server");
    setIsConnectedWithServer(false);
    setConnectionError("Disconnected from server. Reconnecting...");

    socketDisconnectTimerRef.current = setTimeout(() => {
      socketDisconnectTimerRef.current = null;
      setFriendStatus(null);
      setIncomingRequest(null);
      setIsConnectedWithFriend(false);
      markInitiator(false);
      setConnectedFriend(null);
      setConnectionPhase(null);
      setConnectingTo(null);
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      setConnectionError("Connection lost. Please refresh the page.");
    }, 30000);
  }

  const handlers = {
    [SOCKET_EVENTS.CONNECT]: handleConnect,
    [SOCKET_EVENTS.DISCONNECT]: handleDisconnect,
    [SOCKET_EVENTS.CONNECTION_INCOMING]: onIncomingRequest,
    [SOCKET_EVENTS.CONNECTION_RESPONSE]: onConnectionResponse,
    [SOCKET_EVENTS.PEER_DISCONNECTED]: onPeerDisconnected,
    [SOCKET_EVENTS.PEER_ENDED]: onPeerEnded,
    ...extraHandlers,
  };

  // Trampolines keep registered listeners stable while handlers stay fresh
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useSocketLifecycle({ user, peerRef, timerRef: socketDisconnectTimerRef, handlersRef });

  return {
    isConnectedWithServer,
    isConnectedWithFriend,
    friendStatus,
    setFriendStatus,
    incomingRequest,
    respondToRequest,
    updateFriendsStatus,
    setIsInitiator,
    connectionError,
    setConnectionError,
    connectedFriend,
    peerDisconnected,
    clearPeerDisconnected: () => setPeerDisconnected(null),
    peerEnded,
    clearPeerEnded: () => setPeerEnded(null),
    connectionPhase,
    connectingTo,
    disconnectFromFriend,
    reconnectToServer,
    onPeerConnected,
    onPeerError,
  };
}
