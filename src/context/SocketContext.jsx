/* eslint-disable react-refresh/only-export-components -- context + provider belong together */
import {
  createContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { RTCPeer } from "../webrtc/peer.js";
import { SOCKET_EVENTS } from "../socket/socket.events.js";
import { socket } from "../socket/socket.js";
import createLogger from "../utils/logger/devLogger.js";
import { useConnectionManager } from "../hooks/useConnectionManager.js";
import { useNetworkUsers } from "../hooks/useNetworkUsers.js";
import { useChatMessages } from "../hooks/useChatMessages.js";
import { useCallManager } from "../hooks/useCallManager.js";
import { useDataChannelApi } from "../webrtc/dataChannelApi.js";

const log = createLogger("Socket");

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isTransferring, setIsTransferring] = useState(false);

  const peerRef = useRef(null);
  const dataChannelCallbackRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const connectedFriendRef = useRef(null);

  const getUserEmail = useCallback(() => user?.email, [user]);
  const getPeerEmail = useCallback(
    () => connectedFriendRef.current?.email,
    [connectedFriendRef],
  );

  // --- data channel routing & api --------------------------------------
  const incomingChatHandlerRef = useRef(null);

  const routeIncomingData = useCallback((data) => {
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (parsed?.type === "chat") {
          incomingChatHandlerRef.current?.(parsed);
          return;
        }
      } catch {
        // not JSON — file transfer pipeline
      }
    }
    dataChannelCallbackRef.current?.(data);
  }, []);

  const channelApi = useDataChannelApi(
    peerRef,
    dataChannelCallbackRef,
    routeIncomingData,
  );

  const {
    messages,
    sendChatMessage,
    handleIncomingChat,
    clearMessages,
    unreadCount,
  } = useChatMessages(
    channelApi.sendDataViaWebRTC,
    channelApi.isDataChannelOpen,
  );
  useEffect(() => {
    incomingChatHandlerRef.current = handleIncomingChat;
  }, [handleIncomingChat]);

  // --- calls & network ---------------------------------------------------
  const network = useNetworkUsers();
  const call = useCallManager({
    peerRef,
    pendingOfferRef,
    getUserEmail,
    getPeerEmail,
    setConnectionError: (msg) => conn.setConnectionError(msg),
  });

  // --- WebRTC signaling ---------------------------------------------------
  function onConnectionStats(stats) {
    log.log("ICE candidate pair:", stats.candidateType, "| relayed:", stats.relayed);
    log.log("SCTP maxMessageSize:", stats.maxMessageSize);
  }

  function createPeer(remoteEmail) {
    const peer = new RTCPeer(
      socket,
      user.email,
      remoteEmail,
      conn.onPeerConnected,
      conn.onPeerError,
      onConnectionStats,
    );
    peer._onDataChannelMessage = routeIncomingData;
    peer.onRemoteStream = call.handleRemoteStream;
    return peer;
  }

  function startNegotiation(fromEmail) {
    log.log(`Starting WebRTC negotiation with ${fromEmail} (initiator)`);
    peerRef.current = null;
    peerRef.current = createPeer(fromEmail);
    peerRef.current.init();
    peerRef.current.createOffer();
  }

  function onOffer(data) {
    if (peerRef.current?.isConnected()) {
      // Offer from a third party while in a session — never hijack it
      if (data.from !== getPeerEmail()) {
        log.warn(
          `Ignoring offer from ${data.from} — already connected to ${getPeerEmail()}`,
        );
        return;
      }
      log.log(`Renegotiation offer received from ${data.from}`);
      if (!peerRef.current.hasLocalMedia()) {
        pendingOfferRef.current = data.offer;
        return;
      }
      peerRef.current.handleOffer(data.offer);
      return;
    }
    if (peerRef.current) {
      peerRef.current.close();
    }
    peerRef.current = null;
    log.log(`Offer received from ${data.from}, creating answer (receiver)`);
    peerRef.current = createPeer(data.from);
    peerRef.current.init();
    peerRef.current.handleOffer(data.offer);
  }

  function teardownSession() {
    closePeer();
    call.resetCallState();
    clearMessages();
  }

  function closePeer() {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
  }

  const conn = useConnectionManager({
    user,
    peerRef,
    getIsTransferring: () => isTransferring,
    teardownSession,
    startNegotiation,
    extraHandlers: {
      [SOCKET_EVENTS.OFFER]: onOffer,
      [SOCKET_EVENTS.ANSWER]: (data) => {
        log.log(`Answer received from ${data.from}`);
        peerRef.current?.handleAnswer(data.answer);
      },
      [SOCKET_EVENTS.ICE_CANDIDATE]: (data) =>
        peerRef.current?.handleIceCandidate(data.candidate),
      [SOCKET_EVENTS.CALL_INCOMING]: call.onIncomingCall,
      [SOCKET_EVENTS.CALL_RESPONSE]: call.onCallResponse,
      [SOCKET_EVENTS.CALL_ENDED]: call.onCallEnded,
      [SOCKET_EVENTS.NETWORK_USERS]: network.onNetworkUsers,
      [SOCKET_EVENTS.NETWORK_USER_JOINED]: network.onNetworkUserJoined,
      [SOCKET_EVENTS.NETWORK_USER_LEFT]: network.onNetworkUserLeft,
    },
  });

  useEffect(() => {
    connectedFriendRef.current = conn.connectedFriend;
  }, [conn.connectedFriend]);

  return (
    <SocketContext.Provider
      value={{
        ...conn,
        networkUsers: network.networkUsers,
        requestNetworkUsers: network.requestNetworkUsers,
        isTransferring,
        setIsTransferring,
        subscribeToDataChannel: channelApi.subscribeToDataChannel,
        sendDataViaWebRTC: channelApi.sendDataViaWebRTC,
        isDataChannelOpen: channelApi.isDataChannelOpen,
        getDataChannel: channelApi.getDataChannel,
        getMaxMessageSize: channelApi.getMaxMessageSize,
        incomingCall: call.incomingCall,
        activeCall: call.activeCall,
        callStatus: call.callStatus,
        localStream: call.localStream,
        remoteStream: call.remoteStream,
        startCall: call.startCall,
        answerCall: call.answerCall,
        rejectCall: call.rejectCall,
        endCall: call.endCall,
        toggleLocalAudio: call.toggleLocalAudio,
        toggleLocalVideo: call.toggleLocalVideo,
        messages,
        sendChatMessage,
        unreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
