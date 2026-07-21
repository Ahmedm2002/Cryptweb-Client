import {
  createContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { RTCPeer } from "../webrtc/peer.js";
import { SOCKET_EVENTS } from "../socket/socket.events.js";
import { socket } from "../socket/socket.js";
import {
  emitRegisterUser,
  emitConnectionRequest,
  emitConnectionResponse,
  emitUsersConnected,
  emitNetworkUsers,
} from "../socket/socket.handlers.js";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("Socket");

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
  const [connectionError, setConnectionError] = useState(null);
  const [connectedFriend, setConnectedFriend] = useState(null);
  const [peerDisconnected, setPeerDisconnected] = useState(null);
  const [connectionPhase, setConnectionPhase] = useState(null);
  const [connectingTo, setConnectingTo] = useState(null);
  const [networkUsers, setNetworkUsers] = useState([]);
  const peerRef = useRef(null);
  const pendingFriendInfo = useRef(null);
  const isInitiatorRef = useRef(false);
  const dataChannelCallbackRef = useRef(null);
  const socketDisconnectTimerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    function handleConnect() {
      if (socketDisconnectTimerRef.current) {
        clearTimeout(socketDisconnectTimerRef.current);
        socketDisconnectTimerRef.current = null;
        setConnectionError(null);
      }
      setIsConnectedWithServer(true);
      emitRegisterUser(user);
    }

    function handleDisconnect() {
      setIsConnectedWithServer(false);
      setConnectionError("Disconnected from server. Reconnecting...");

      socketDisconnectTimerRef.current = setTimeout(() => {
        socketDisconnectTimerRef.current = null;
        setFriendStatus(null);
        setIncomingRequest(null);
        setIsConnectedWithFriend(false);
        setIsInitiator(false);
        isInitiatorRef.current = false;
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

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
    socket.on(SOCKET_EVENTS.CONNECTION_INCOMING, onIncomingRequest);
    socket.on(SOCKET_EVENTS.CONNECTION_RESPONSE, onConnectionResponse);
    socket.on(SOCKET_EVENTS.OFFER, onOffer);
    socket.on(SOCKET_EVENTS.ANSWER, onAnswer);
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);
    socket.on(SOCKET_EVENTS.PEER_DISCONNECTED, onPeerDisconnected);
    socket.on(SOCKET_EVENTS.NETWORK_USERS, onNetworkUsers);
    socket.on(SOCKET_EVENTS.NETWORK_USER_JOINED, onNetworkUserJoined);
    socket.on(SOCKET_EVENTS.NETWORK_USER_LEFT, onNetworkUserLeft);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      if (socketDisconnectTimerRef.current) {
        clearTimeout(socketDisconnectTimerRef.current);
        socketDisconnectTimerRef.current = null;
      }
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect);
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
      socket.off(SOCKET_EVENTS.CONNECTION_INCOMING, onIncomingRequest);
      socket.off(SOCKET_EVENTS.CONNECTION_RESPONSE, onConnectionResponse);
      socket.off(SOCKET_EVENTS.OFFER, onOffer);
      socket.off(SOCKET_EVENTS.ANSWER, onAnswer);
      socket.off(SOCKET_EVENTS.ICE_CANDIDATE, onIceCandidate);
      socket.off(SOCKET_EVENTS.PEER_DISCONNECTED, onPeerDisconnected);
      socket.off(SOCKET_EVENTS.NETWORK_USERS, onNetworkUsers);
      socket.off(SOCKET_EVENTS.NETWORK_USER_JOINED, onNetworkUserJoined);
      socket.off(SOCKET_EVENTS.NETWORK_USER_LEFT, onNetworkUserLeft);
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    };
  }, [user]);

  function onIncomingRequest(data) {
    setIsInitiator(false);
    isInitiatorRef.current = false;
    setIncomingRequest(data);
    pendingFriendInfo.current = {
      email: data.from,
      name: data.fromName || data.from,
    };
  }

  function updateFriendsStatus(data) {
    setIsInitiator(true);
    isInitiatorRef.current = true;
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
      setConnectionPhase("negotiating");
      setConnectingTo(pendingFriendInfo.current?.name || fromEmail);
    }
  }

  function onPeerConnected() {
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

  function onConnectionStats(stats) {
    log.log(
      "ICE candidate pair:",
      stats.candidateType,
      "| relayed:",
      stats.relayed,
    );
    log.log("SCTP maxMessageSize:", stats.maxMessageSize);
  }

  function onPeerError(msg) {
    setConnectionError(msg);
    setIsConnectedWithFriend(false);
    setConnectedFriend(null);
    setConnectionPhase(null);
    setConnectingTo(null);
  }

  function onPeerDisconnected(data) {
    setPeerDisconnected(data);
    setConnectedFriend(null);
    setIsConnectedWithFriend(false);
    setConnectionPhase(null);
    setConnectingTo(null);
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
  }

  function clearPeerDisconnected() {
    setPeerDisconnected(null);
  }

  function onNetworkUsers(users) {
    setNetworkUsers(users || []);
  }

  function onNetworkUserJoined(data) {
    setNetworkUsers(data?.onlineUsers || []);
  }

  function onNetworkUserLeft(data) {
    setNetworkUsers(data?.onlineUsers || []);
  }

  function requestNetworkUsers() {
    emitNetworkUsers();
  }

  function onConnectionResponse(data) {
    setIsInitiator(true);
    isInitiatorRef.current = true;
    if (data?.accepted) {
      setConnectionError(null);
      setConnectionPhase("negotiating");
      peerRef.current = null;
      peerRef.current = new RTCPeer(
        socket,
        user.email,
        data.from,
        onPeerConnected,
        onPeerError,
        onConnectionStats,
      );
      peerRef.current._onDataChannelMessage = dataChannelCallbackRef.current;
      peerRef.current.init();
      peerRef.current.createOffer();
    } else {
      log.log(`Connection rejected by ${data?.from}`);
      setFriendStatus(null);
      setIsInitiator(false);
      isInitiatorRef.current = false;
      setConnectionPhase(null);
      setConnectingTo(null);
      setConnectionError(
        `Connection request was rejected by ${data?.from || "the recipient"}.`,
      );
    }
  }

  function onOffer(data) {
    if (peerRef.current) {
      peerRef.current.close();
    }
    peerRef.current = null;
    peerRef.current = new RTCPeer(
      socket,
      user.email,
      data.from,
      onPeerConnected,
      onPeerError,
      onConnectionStats,
    );
    peerRef.current._onDataChannelMessage = dataChannelCallbackRef.current;
    peerRef.current.init();
    peerRef.current.handleOffer(data.offer);
  }

  function onAnswer(data) {
    log.log(`Answer received from ${data.from}`);
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
    dataChannelCallbackRef.current = callback;
    if (peerRef.current) {
      peerRef.current._onDataChannelMessage = callback;
    }
  }

  function isDataChannelOpen() {
    return peerRef.current?.isDataChannelOpen() ?? false;
  }

  function getDataChannel() {
    return peerRef.current?.getDataChannel() ?? null;
  }

  function getMaxMessageSize() {
    return peerRef.current?.getMaxMessageSize() ?? 65536;
  }

  function sendDataViaWebRTC(data, options) {
    if (peerRef.current) {
      return peerRef.current.sendData(data, options);
    }
    return Promise.reject(new Error("No peer connection"));
  }

  function disconnectFromFriend() {
    log.log(`Disconnecting from friend`);
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setIsConnectedWithFriend(false);
    setFriendStatus(null);
    setIsInitiator(false);
    isInitiatorRef.current = false;
    setConnectionError(null);
    setConnectedFriend(null);
    setConnectionPhase(null);
    setConnectingTo(null);
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
        isDataChannelOpen,
        getDataChannel,
        getMaxMessageSize,
        connectionError,
        setConnectionError,
        disconnectFromFriend,
        connectedFriend,
        peerDisconnected,
        clearPeerDisconnected,
        connectionPhase,
        connectingTo,
        networkUsers,
        requestNetworkUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};