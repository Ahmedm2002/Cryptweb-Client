import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { RTCPeer } from "./webrtc/peer.js";
import { SOCKET_EVENTS } from "./socket.events.js";
import {
  emitRegisterUser,
  emitConnectionRequest,
  emitConnectionResponse,
} from "./socket.handlers.js";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

function useSocket() {
  const { user } = useAuth();
  const [isConnectedWithServer, setIsConnectedWithServer] = useState(
    socket.connected,
  );
  const [friendStatus, setFriendStatus] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [isConnectedWithFriend, setIsConnectedWithFriend] = useState(false);
  const [connectionOfferStatus, setConnectionOfferStatus] = useState(null);
  let peer = null;
  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
      connectWithServer();
    }

    socket.on(SOCKET_EVENTS.DISCONNECT, disConnect);
    socket.on(SOCKET_EVENTS.CONNECTION_INCOMING, onIncomingRequest);
    socket.on(SOCKET_EVENTS.CONNECTION_RESULT, onConnectionResult);
    socket.on(SOCKET_EVENTS.OFFER, onOffer);
    socket.on(SOCKET_EVENTS.ANSWER, onAnswer);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);

    return () => {
      socket.off(SOCKET_EVENTS.DISCONNECT, disConnect);
      socket.off(SOCKET_EVENTS.CONNECTION_INCOMING, onIncomingRequest);
      socket.off(SOCKET_EVENTS.CONNECTION_RESULT, onConnectionResult);
      socket.off(SOCKET_EVENTS.OFFER, onOffer);
      socket.off(SOCKET_EVENTS.ANSWER, onAnswer);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);
    };
  }, [user, isInitiator, connectWithServer, onIncomingRequest]);

  // Socket Event Handler functions

  function onIncomingRequest(data) {
    console.log("[useSocket] onIncomingRequest received:", data);
    setIsInitiator(false);
    setIncomingRequest(data);
  }

  function connectWithServer() {
    setIsConnectedWithServer(true);
    emitRegisterUser(user);
  }

  function disConnect() {
    setIsConnectedWithServer(false);
    setFriendStatus(null);
    setIncomingRequest(null);
    setIsConnectedWithFriend(false);
    setIsInitiator(false);
  }

  function updateFriendsStatus(data) {
    setIsInitiator(true);
    setFriendStatus(data);
    if (data?.data?.isOnline || data?.isOnline) {
      console.log("Friend is online send him offer to connect");
      const friendEmail = data.email || data.data?.email;
      emitConnectionRequest(user.email, friendEmail);
    }
  }

  function respondToRequest(fromEmail, accepted) {
    emitConnectionResponse(user.email, fromEmail, accepted);
    setIncomingRequest(null);
  }

  // webrtc related socket events

  async function onConnectionResult(data) {
    setIsInitiator(true);
    console.log("[socket event]  connection response");
    console.log({ data }, "Data from connection result ");

    // data contains key `accepted` if its true then start initializing webrtc and show the file transfer ui else sshow that user rejected the connection offer
    setConnectionOfferStatus(data);
    if (data?.accepted) {
      peer = null;
      peer = new RTCPeer(socket, user.email, data.from);
      await peer.createOffer();
    }
  }

  async function onOffer(data) {
    console.log("[werbrc event] offer data: ", data);
    // remove old connected peer configs
    peer = null;
    // create connection with the new user
    peer = new RTCPeer(socket, user.email, data.from);
    await peer.handleOffer(data.offer);
  }

  async function onAnswer(data) {
    console.log("[werbrc event] answer: ", data);
    console.log("on answer called");
    peer = null;
    // peer = new RTCPeer(socket, user.email);
    // peer.handleAnswer(data.answer);
  }
  async function onIceCandidate(data) {
    peer.handleIceCandidate(data.candidate);
  }
  return {
    isConnectedWithServer,
    isConnectedWithFriend,
    connectWithServer,
    updateFriendsStatus,
    friendStatus,
    setIsInitiator,
    incomingRequest,
    respondToRequest,
  };
}

export { socket, useSocket };
