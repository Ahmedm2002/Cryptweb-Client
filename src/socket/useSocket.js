import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { WebRTCPeer } from "./webrtc/peer.js";
import { SOCKET_EVENTS } from "./socket.events.js";
import { emitRegisterUser, emitConnectionRequest, emitConnectionResponse } from "./socket.handlers.js";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

export function useSocket() {
  const { user } = useAuth();
  const [isConnectedWithServer, setIsConnectedWithServer] = useState(socket.connected);
  const [friendStatus, setFriendStatus] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [isConnectedWithFriend, setIsConnectedWithFriend] = useState(false);

  const peerRef = useRef(null);
  const [dataChannelManager, setDataChannelManager] = useState(null);

  const initWebRTC = useCallback((friendEmail) => {
    if (!user) return;
    if (peerRef.current) {
      peerRef.current.cleanup();
    }

    const peer = new WebRTCPeer(
      socket,
      () => {
        setIsConnectedWithFriend(false);
        setDataChannelManager(null);
      },
      () => {
        console.log("Data channel received via WebRTC");
      }
    );

    peer.setEndpoints(user.email, friendEmail);
    peerRef.current = peer;
    setDataChannelManager(peer.getDataChannelManager());
  }, [user]);

  const connectWithServer = useCallback(() => {
    setIsConnectedWithServer(true);
    emitRegisterUser(socket, user);
  }, [user]);

  const updateFriendsStatus = useCallback((data) => {
    setIsInitiator(true);
    setFriendStatus(data);
    if (data?.data?.isOnline || data?.isOnline) {
      console.log("Friend is online send him offer to connect");
      const friendEmail = data.email || data.data?.email;
      initWebRTC(friendEmail);
      emitConnectionRequest(socket, user.email, friendEmail);
    }
  }, [initWebRTC, user]);

  const onIncomingRequest = useCallback((data) => {
    console.log("[useSocket] onIncomingRequest received:", data);
    setIsInitiator(false);
    setIncomingRequest(data);
    initWebRTC(data.from);
  }, [initWebRTC]);

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log("[useSocket] Socket connected, emitting USER_REGISTER");
      setIsConnectedWithServer(true);
      emitRegisterUser(socket, user);
    };
    const onDisconnect = () => setIsConnectedWithServer(false);

    const onConnectionResult = (data) => {
      console.log("[useSocket] onConnectionResult received:", data);
      if (data.accepted) {
        setIsConnectedWithFriend(true);
        if (peerRef.current) {
          console.log("[useSocket] Request accepted. Creating offer...");
          peerRef.current.createOffer();
        } else {
          console.log("[useSocket] WARNING: peerRef.current is null in onConnectionResult!");
        }
      }
    };

    const onOffer = async (data) => {
      console.log("[useSocket] onOffer received:", data);
      if (!peerRef.current) initWebRTC(data.from);
      setIsConnectedWithFriend(true);
      await peerRef.current.handleOffer(data.offer);
    };

    const onAnswer = async (data) => {
      console.log("[useSocket] onAnswer received:", data);
      if (peerRef.current) {
        setIsConnectedWithFriend(true);
        await peerRef.current.handleAnswer(data.answer);
      }
    };

    const onIceCandidate = (data) => {
      console.log("[useSocket] onIceCandidate received");
      if (peerRef.current) {
        peerRef.current.handleIceCandidate(data.candidate);
      }
    };

    socket.on(SOCKET_EVENTS.CONNECT, onConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);
    socket.on(SOCKET_EVENTS.CONNECTION_INCOMING, onIncomingRequest);
    socket.on(SOCKET_EVENTS.CONNECTION_RESULT, onConnectionResult);
    socket.on(SOCKET_EVENTS.OFFER, onOffer);
    socket.on(SOCKET_EVENTS.ANSWER, onAnswer);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, onConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect);
      socket.off(SOCKET_EVENTS.CONNECTION_INCOMING, onIncomingRequest);
      socket.off(SOCKET_EVENTS.CONNECTION_RESULT, onConnectionResult);
      socket.off(SOCKET_EVENTS.OFFER, onOffer);
      socket.off(SOCKET_EVENTS.ANSWER, onAnswer);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);
    };
  }, [user, initWebRTC, isInitiator, connectWithServer, onIncomingRequest]);

  const respondToRequest = useCallback((fromEmail, accepted) => {
    console.log("[useSocket] respondToRequest called", { fromEmail, accepted });
    emitConnectionResponse(socket, user.email, fromEmail, accepted);
    setIncomingRequest(null);
    if (!accepted && peerRef.current) {
      console.log("[useSocket] Request declined, cleaning up peerRef");
      peerRef.current.cleanup();
      peerRef.current = null;
    }
  }, [user]);

  const initiateConnection = useCallback(async () => {
    console.log("[useSocket] initiateConnection called. isInitiator:", isInitiator);
    if (peerRef.current && isInitiator) {
      await peerRef.current.createOffer();
    }
  }, [isInitiator]);

  return {
    isConnectedWithServer,
    isConnectedWithFriend,
    connectWithServer,
    updateFriendsStatus,
    friendStatus,
    setIsInitiator,
    initiateConnection,
    dataChannelManager,
    incomingRequest,
    respondToRequest
  };
}

export { socket };
