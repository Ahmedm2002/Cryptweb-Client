/* eslint-disable react-refresh/only-export-components -- context + provider belong together */
import {
  createContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { socket } from "../socket/socket.js";
import { SOCKET_EVENTS } from "../socket/socket.events.js";
import {
  sendFriendRequest as apiSendFriendRequest,
  listFriendRequests as apiListFriendRequests,
  acceptFriendRequest as apiAcceptFriendRequest,
  declineFriendRequest as apiDeclineFriendRequest,
  cancelFriendRequest as apiCancelFriendRequest,
  listFriends as apiListFriends,
  unfriend as apiUnfriend,
} from "../services/friends.js";
import {
  listConversations as apiListConversations,
  getMessages as apiGetMessages,
  setConversationPreference as apiSetConversationPreference,
} from "../services/conversations.js";
import {
  listNotifications as apiListNotifications,
  markNotificationRead as apiMarkNotificationRead,
  markAllNotificationsRead as apiMarkAllNotificationsRead,
} from "../services/notifications.js";
import { searchUsers as apiSearchUsers, updateSettings as apiUpdateSettings } from "../services/users.js";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("ChatContext");

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  // --- User search ---
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // --- Friends ---
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  // --- Conversations ---
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  // --- Notifications ---
  const [notifications, setNotifications] = useState([]);
  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  // --- Socket connected ---
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  // --- Active chat ref for socket handlers ---
  const activeChatRef = useRef(null);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // --- User ref for socket handlers ---
  const userRef = useRef(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // =================================================================
  // User Search
  // =================================================================
  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await apiSearchUsers(query, true);
      if (res.success) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearchResults = useCallback(() => setSearchResults([]), []);

  // =================================================================
  // Friends
  // =================================================================
  const fetchFriends = useCallback(async () => {
    try {
      const res = await apiListFriends();
      if (res.success) setFriends(res.data);
    } catch {
      // silent
    }
  }, []);

  const fetchFriendRequests = useCallback(async () => {
    try {
      const [inc, out] = await Promise.all([
        apiListFriendRequests("incoming", "pending"),
        apiListFriendRequests("outgoing", "pending"),
      ]);
      if (inc.success) setIncomingRequests(inc.data);
      if (out.success) setOutgoingRequests(out.data);
    } catch {
      // silent
    }
  }, []);

  // =================================================================
  // Conversations (must be defined before friends callbacks that reference it)
  // =================================================================
  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiListConversations();
      if (res.success) setConversations(res.data);
    } catch {
      // silent
    }
  }, []);

  const sendFriendRequest = useCallback(async (receiverUsername) => {
    const res = await apiSendFriendRequest(receiverUsername);
    if (res.success) {
      await fetchFriendRequests();
    }
    return res;
  }, [fetchFriendRequests]);

  const acceptRequest = useCallback(async (requestId) => {
    const res = await apiAcceptFriendRequest(requestId);
    if (res.success) {
      await Promise.all([fetchFriends(), fetchFriendRequests(), fetchConversations()]);
    }
    return res;
  }, [fetchFriends, fetchFriendRequests, fetchConversations]);

  const declineRequest = useCallback(async (requestId) => {
    const res = await apiDeclineFriendRequest(requestId);
    if (res.success) {
      await fetchFriendRequests();
    }
    return res;
  }, [fetchFriendRequests]);

  const cancelRequest = useCallback(async (requestId) => {
    const res = await apiCancelFriendRequest(requestId);
    if (res.success) {
      await fetchFriendRequests();
    }
    return res;
  }, [fetchFriendRequests]);

  const removeFriend = useCallback(async (friendshipId) => {
    const res = await apiUnfriend(friendshipId);
    if (res.success) {
      await fetchFriends();
    }
    return res;
  }, [fetchFriends]);

  const loadMessages = useCallback(async (conversationId, before) => {
    try {
      const res = await apiGetMessages(conversationId, 50, before);
      return res;
    } catch {
      return { success: false, data: [] };
    }
  }, []);

  const openChat = useCallback((conversation) => {
    setActiveChat({
      conversationId: conversation.id,
      otherUserId: conversation.other_user_id,
      otherUserName: conversation.other_user_name,
      otherUserUsername: conversation.other_user_username,
      otherUserProfilePicture: conversation.other_user_profile_picture,
      messages: [],
      hasMore: true,
      loading: false,
    });
  }, []);

  const closeChat = useCallback(() => {
    setActiveChat(null);
  }, []);

  const addMessageToActiveChat = useCallback((message) => {
    setActiveChat((prev) => {
      if (!prev) return null;
      if (prev.conversationId !== message.conversationId) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message],
      };
    });
  }, []);

  const prependMessages = useCallback((newMessages) => {
    setActiveChat((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...newMessages, ...prev.messages],
        hasMore: newMessages.length === 50,
        loading: false,
      };
    });
  }, []);

  const updateConversationLastMessage = useCallback((conversationId, content, createdAt) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, last_message: content, last_message_at: createdAt }
          : c
      )
    );
  }, []);

  // =================================================================
  // Notifications
  // =================================================================
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiListNotifications();
      if (res.success) setNotifications(res.data);
    } catch {
      // silent
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    await apiMarkNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    await apiMarkAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  // =================================================================
  // Settings
  // =================================================================
  const updateUserSettings = useCallback(async (saveMessagesDefault, applyToAll = false) => {
    return apiUpdateSettings(saveMessagesDefault, applyToAll);
  }, []);

  const updateConversationPref = useCallback(async (conversationId, saveMessages) => {
    return apiSetConversationPreference(conversationId, saveMessages);
  }, []);

  // =================================================================
  // Socket: Send message
  // =================================================================
  const sendMessage = useCallback((conversationId, receiverUserId, content) => {
    if (!socket.connected) {
      log.warn("Cannot send message — socket not connected");
      return;
    }
    socket.emit(SOCKET_EVENTS.MESSAGE_SEND, {
      conversationId,
      to: receiverUserId,
      content,
    });
  }, []);

  // =================================================================
  // Socket event handlers
  // =================================================================
  const handleMessageReceive = useCallback((data) => {
    const active = activeChatRef.current;
    const message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      conversationId: data.conversationId,
      sender_id: data.from,
      content: data.content,
      created_at: data.createdAt,
    };

    if (active && active.conversationId === data.conversationId) {
      addMessageToActiveChat(message);
    } else {
      // Different conversation — increment unread (handled by UI)
      log.log(`Message for non-active conversation: ${data.conversationId}`);
    }
    updateConversationLastMessage(data.conversationId, data.content, data.createdAt);
  }, [addMessageToActiveChat, updateConversationLastMessage]);

  const handleMessageSendAck = useCallback((data) => {
    if (!data.delivered) {
      log.log(`Message not delivered (receiver offline): ${data.messageId}`);
    }
  }, []);

  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    log.log(`New notification: ${notification.type}`);
  }, []);

  // =================================================================
  // Socket lifecycle for chat features
  // =================================================================
  useEffect(() => {
    if (!user) return;

    function onConnect() {
      setSocketConnected(true);
      log.log("Chat socket connected");
    }

    function onDisconnect() {
      setSocketConnected(false);
      log.warn("Chat socket disconnected");
    }

    function onRegistrationError(data) {
      log.error("Socket registration failed:", data.message);
    }

    // Register trampolines
    const trampolines = {
      [SOCKET_EVENTS.CONNECT]: onConnect,
      [SOCKET_EVENTS.DISCONNECT]: onDisconnect,
      [SOCKET_EVENTS.REGISTRATION_ERROR]: onRegistrationError,
      [SOCKET_EVENTS.MESSAGE_RECEIVE]: handleMessageReceive,
      [SOCKET_EVENTS.MESSAGE_SEND_ACK]: handleMessageSendAck,
      [SOCKET_EVENTS.NOTIFICATION_NEW]: handleNewNotification,
    };

    Object.entries(trampolines).forEach(([evt, fn]) => socket.on(evt, fn));

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Initial data fetch
    fetchFriends();
    fetchFriendRequests();
    fetchConversations();
    fetchNotifications();

    return () => {
      Object.entries(trampolines).forEach(([evt, fn]) => socket.off(evt, fn));
    };
  }, [
    user,
    handleMessageReceive,
    handleMessageSendAck,
    handleNewNotification,
    fetchFriends,
    fetchFriendRequests,
    fetchConversations,
    fetchNotifications,
  ]);

  return (
    <ChatContext.Provider
      value={{
        // Search
        searchResults,
        searchLoading,
        searchUsers,
        clearSearchResults,
        // Friends
        friends,
        incomingRequests,
        outgoingRequests,
        fetchFriends,
        fetchFriendRequests,
        sendFriendRequest,
        acceptRequest,
        declineRequest,
        cancelRequest,
        removeFriend,
        // Conversations
        conversations,
        activeChat,
        fetchConversations,
        loadMessages,
        openChat,
        closeChat,
        addMessageToActiveChat,
        prependMessages,
        sendMessage,
        // Notifications
        notifications,
        unreadNotificationCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        // Settings
        updateUserSettings,
        updateConversationPref,
        // Socket status
        socketConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
