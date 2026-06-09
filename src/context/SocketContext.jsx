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
  const [isConnectedWithServer, setIsConnectedWithServer] = useState(socket.connected);
  const [friendStatus, setFriendStatus] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [isConnectedWithFriend, setIsConnectedWithFriend] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [connectedFriend, setConnectedFriend] = useState(null);
  const peerRef = useRef(null);
  const pendingFriendInfo = useRef(null);

  useEffect(() => {
    if (!user) return;

    function handleConnect() {
      setIsConnectedWithServer(true);
      emitRegisterUser(user);
    }

    function handleDisconnect() {
      setIsConnectedWithServer(false);
      setFriendStatus(null);
      setIncomingRequest(null);
      setIsConnectedWithFriend(false);
      setIsInitiator(false);
      setConnectionError("Disconnected from server");
      setConnectedFriend(null);
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
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
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    };
  }, [user]);

  function onIncomingRequest(data) {
    setIsInitiator(false);
    setIncomingRequest(data);
    pendingFriendInfo.current = {
      email: data.from,
      name: data.fromName || data.from,
    };
  }

  function updateFriendsStatus(data) {
    setIsInitiator(true);
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
      const friendEmail = data.email || data.data?.email;
      emitConnectionRequest(user.email, friendEmail);
    } else {
      setFriendStatus(null);
    }
  }

  function respondToRequest(fromEmail, accepted) {
    emitConnectionResponse(user.email, fromEmail, accepted);
    setIncomingRequest(null);
    if (accepted) {
      setConnectionError(null);
    }
  }

  function onPeerConnected() {
    setIsConnectedWithFriend(true);
    if (pendingFriendInfo.current) {
      setConnectedFriend({ ...pendingFriendInfo.current });
    }
  }

  function onPeerError(msg) {
    setConnectionError(msg);
    setIsConnectedWithFriend(false);
    setConnectedFriend(null);
  }

  function onConnectionResponse(data) {
    setIsInitiator(true);
    if (data?.accepted) {
      setConnectionError(null);
      peerRef.current = null;
      peerRef.current = new RTCPeer(
        socket, user.email, data.from,
        onPeerConnected,
        onPeerError,
      );
      peerRef.current.createOffer();
    } else {
      setFriendStatus(null);
      setIsInitiator(false);
      setConnectionError(`Connection request was rejected by ${data?.from || "the recipient"}.`);
    }
  }

  function onOffer(data) {
    if (peerRef.current) {
      peerRef.current.close();
    }
    peerRef.current = null;
    peerRef.current = new RTCPeer(
      socket, user.email, data.from,
      onPeerConnected,
      onPeerError,
    );
    peerRef.current.handleOffer(data.offer);
  }

  function onAnswer(data) {
    if (peerRef.current) {
      peerRef.current.handleAnswer(data.answer);
    }
  }

  function onIceCandidate(data) {
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

  function disconnectFromFriend() {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setIsConnectedWithFriend(false);
    setFriendStatus(null);
    setIsInitiator(false);
    setConnectionError(null);
    setConnectedFriend(null);
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
        connectionError,
        setConnectionError,
        disconnectFromFriend,
        connectedFriend,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
