import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { RTCPeer } from "../socket/webrtc/peer.js";
import { SOCKET_EVENTS } from "../socket/socket.events.js";
import { socket } from "../socket/socket.js";
import {
  emitRegisterUser,
  emitConnectionRequest,
  emitConnectionResponse,
} from "../socket/socket.handlers.js";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnectedWithServer, setIsConnectedWithServer] = useState(
    socket.connected,
  );
  const [friendStatus, setFriendStatus] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [isConnectedWithFriend, setIsConnectedWithFriend] = useState(false);
  const [connectionOfferStatus, setConnectionOfferStatus] = useState(null);
  let peerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    function handleConnect() {
      console.log("[SocketContext] Connected to server");
      setIsConnectedWithServer(true);
      emitRegisterUser(user);
    }

    function handleDisconnect() {
      console.log("[SocketContext] Disconnected from server");
      setIsConnectedWithServer(false);
      setFriendStatus(null);
      setIncomingRequest(null);
      setIsConnectedWithFriend(false);
      setIsInitiator(false);
    }

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
    socket.on(SOCKET_EVENTS.CONNECTION_INCOMING, onIncomingRequest);
    socket.on(SOCKET_EVENTS.CONNECTION_RESPONSE, onConnectionResponse);
    socket.on(SOCKET_EVENTS.OFFER, onOffer);
    socket.on(SOCKET_EVENTS.ANSWER, onAnswer);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
      socket.off(SOCKET_EVENTS.CONNECTION_INCOMING, onIncomingRequest);
      socket.off(SOCKET_EVENTS.CONNECTION_RESPONSE, onConnectionResponse);
      socket.off(SOCKET_EVENTS.OFFER, onOffer);
      socket.off(SOCKET_EVENTS.ANSWER, onAnswer);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);
    };
  }, [user]);

  // Socket Event Handler functions
  function onIncomingRequest(data) {
    setIsInitiator(false);
    setIncomingRequest(data);
  }

  function updateFriendsStatus(data) {
    setIsInitiator(true);
    setFriendStatus(data);
    if (data?.data?.isOnline || data?.isOnline) {
      const friendEmail = data.email || data.data?.email;
      emitConnectionRequest(user.email, friendEmail);
    }
  }

  function respondToRequest(fromEmail, accepted) {
    emitConnectionResponse(user.email, fromEmail, accepted);
    setIncomingRequest(null);
  }

  // webrtc related socket events

  async function onConnectionResponse(data) {
    setIsInitiator(true);
    setConnectionOfferStatus(data);
    console.log("Function invoked on connection response: ", data);
    if (data?.accepted) {
      peerRef.current = null;
      peerRef.current = new RTCPeer(socket, user.email, data.from, () => {
        setIsConnectedWithFriend(true);
      });
      await peerRef.current.createOffer();
    }
  }

  async function onOffer(data) {
    peerRef.current = null;
    peerRef.current = new RTCPeer(socket, user.email, data.from, () => {
      setIsConnectedWithFriend(true);
    });
    await peerRef.current.handleOffer(data.offer);
  }

  async function onAnswer(data) {
    if (peerRef.current) {
      peerRef.current.handleAnswer(data.answer);
    }
  }

  async function onIceCandidate(data) {
    if (peerRef.current) {
      peerRef.current.handleIceCandidate(data.candidate);
    }
  }

  function subscribeToDataChannel(callback) {
    if (peerRef.current) {
      peerRef.current._onDataChannelMessage = callback;
    }
  }

  function sendDataViaWebRTC(data) {
    if (peerRef.current) {
      return peerRef.current.sendData(data);
    }
    return false;
  }

  return (
    <SocketContext.Provider
      value={{
        isConnectedWithServer,
        isConnectedWithFriend,
        updateFriendsStatus,
        friendStatus,
        setIsInitiator,
        incomingRequest,
        respondToRequest,
        subscribeToDataChannel,
        sendDataViaWebRTC,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
