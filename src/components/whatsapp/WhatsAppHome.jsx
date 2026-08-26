import { useState, useCallback, useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../socket/useSocket";
import { useDebounce } from "../../hooks/useDebounce.js";
import {
  MagnifyingGlass,
  ChatCircleText,
  UserPlus,
  Bell,
  GearSix,
  ArrowLeft,
  Check,
  X,
  PaperPlaneRight,
  Spinner,
  UserMinus,
  UsersThree,
} from "phosphor-react";

const GOOGLE_COLORS = [
  "#1a73e8", "#e8710a", "#188038", "#a142f4", "#e5143c",
  "#f9ab00", "#12a4af", "#e8710a", "#1a73e8", "#188038",
  "#a142f4", "#e5143c", "#f9ab00", "#12a4af",
];

function getAvatarColor(name) {
  const letter = (name || "U").charAt(0).toUpperCase();
  const idx = letter.charCodeAt(0) - 65;
  return GOOGLE_COLORS[idx % GOOGLE_COLORS.length];
}

function Avatar({ name, src, size = "md", online }) {
  const sz = size === "lg" ? "w-12 h-12" : size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const textSize = size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm";
  const initial = (name || "U").charAt(0).toUpperCase();

  return (
    <div className="relative shrink-0">
      {src ? (
        <img src={src} alt={name} className={`${sz} rounded-full object-cover`} />
      ) : (
        <div
          className={`${sz} rounded-full flex items-center justify-center text-white font-semibold ${textSize} select-none`}
          style={{ backgroundColor: getAvatarColor(name) }}
        >
          {initial}
        </div>
      )}
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-white" />
      )}
    </div>
  );
}

function formatMessageTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatNotificationTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// =================================================================
// Main WhatsApp Home Component
// =================================================================
export default function WhatsAppHome() {
  const { user } = useAuth();
  const {
    conversations,
    activeChat,
    openChat,
    closeChat,
    friends,
    incomingRequests,
    outgoingRequests,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    removeFriend,
    searchResults,
    searchLoading,
    searchUsers,
    clearSearchResults,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    fetchConversations,
    fetchFriends,
    fetchFriendRequests,
    fetchNotifications,
  } = useChat();
  const { isConnectedWithServer } = useSocket();

  const [sidebarView, setSidebarView] = useState("conversations");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden bg-white">
      {/* Sidebar */}
      <div
        className={`${
          activeChat ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-[380px] lg:w-[420px] border-r border-gray-200 bg-white`}
      >
        {showSettings ? (
          <SettingsView
            onBack={() => setShowSettings(false)}
          />
        ) : showNotifications ? (
          <NotificationsView
            notifications={notifications}
            unreadCount={unreadNotificationCount}
            onMarkRead={markNotificationAsRead}
            onMarkAllRead={markAllNotificationsAsRead}
            onBack={() => {
              setShowNotifications(false);
              fetchNotifications();
            }}
          />
        ) : sidebarView === "friends" ? (
          <FriendsView
            friends={friends}
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            onAccept={acceptRequest}
            onDecline={declineRequest}
            onCancel={cancelRequest}
            onRemoveFriend={removeFriend}
            searchResults={searchResults}
            searchLoading={searchLoading}
            onSearch={searchUsers}
            onClearSearch={clearSearchResults}
            onSendRequest={sendFriendRequest}
            onBack={() => {
              setSidebarView("conversations");
              fetchFriends();
              fetchConversations();
            }}
          />
        ) : (
          <ConversationsView
            conversations={conversations}
            onOpenChat={openChat}
            activeChatId={activeChat?.conversationId}
            onOpenFriends={() => {
              setSidebarView("friends");
              fetchFriendRequests();
            }}
            onOpenNotifications={() => {
              setShowNotifications(true);
              markAllNotificationsAsRead();
            }}
            onOpenSettings={() => setShowSettings(true)}
            unreadNotificationCount={unreadNotificationCount}
            user={user}
            socketConnected={isConnectedWithServer}
          />
        )}
      </div>

      {/* Chat Area */}
      <div
        className={`${
          activeChat ? "flex" : "hidden md:flex"
        } flex-1 flex-col min-w-0`}
      >
        {activeChat ? (
          <ChatView
            conversation={activeChat}
            onBack={closeChat}
            user={user}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// =================================================================
// Conversations Sidebar View
// =================================================================
function ConversationsView({
  conversations,
  onOpenChat,
  activeChatId,
  onOpenFriends,
  onOpenNotifications,
  onOpenSettings,
  unreadNotificationCount,
  user,
  socketConnected,
}) {
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.other_user_name?.toLowerCase().includes(query.toLowerCase()) ||
    c.other_user_username?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} size="md" />
          <div>
            <h2 className="text-base font-semibold text-gray-900 leading-tight">
              {user?.name}
            </h2>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? "bg-success" : "bg-gray-300"
                }`}
              />
              <span className="text-[11px] text-gray-400">
                {socketConnected ? "Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenFriends}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            title="Friends"
          >
            <UsersThree size={18} className="text-gray-500" />
          </button>
          <button
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors relative"
            title="Notifications"
          >
            <Bell size={18} className="text-gray-500" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            title="Settings"
          >
            <GearSix size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
          <MagnifyingGlass size={16} className="text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <ChatCircleText size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              {conversations.length === 0
                ? "No conversations yet"
                : "No matches found"}
            </p>
            <p className="text-xs text-gray-400">
              {conversations.length === 0
                ? "Add friends to start chatting"
                : "Try a different search term"}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onOpenChat(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                activeChatId === conv.id ? "bg-accent-light" : ""
              }`}
            >
              <Avatar name={conv.other_user_name} src={conv.other_user_profile_picture} />
              <div className="flex-1 min-w-0 border-b border-gray-100 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {conv.other_user_name}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                    {formatMessageTime(conv.last_message_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {conv.last_message || "No messages yet"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}

// =================================================================
// Friends View
// =================================================================
function FriendsView({
  friends,
  incomingRequests,
  outgoingRequests,
  onAccept,
  onDecline,
  onCancel,
  onRemoveFriend,
  searchResults,
  searchLoading,
  onSearch,
  onClearSearch,
  onSendRequest,
  onBack,
}) {
  const [tab, setTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingTo, setSendingTo] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const lastSearchedRef = useRef("");

  useEffect(() => {
    if (debouncedSearchQuery.length >= 2 && debouncedSearchQuery !== lastSearchedRef.current) {
      lastSearchedRef.current = debouncedSearchQuery;
      onSearch(debouncedSearchQuery);
    } else if (debouncedSearchQuery.length < 2) {
      lastSearchedRef.current = "";
      onClearSearch();
    }
  }, [debouncedSearchQuery, onSearch, onClearSearch]);

  const handleSendRequest = async (username) => {
    setSendingTo(username);
    await onSendRequest(username);
    setSendingTo(null);
  };

  return (
    <>
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">Friends</h2>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-gray-100">
        {[
          { key: "list", label: `Friends (${friends.length})` },
          { key: "incoming", label: `Incoming (${incomingRequests.length})` },
          { key: "outgoing", label: `Outgoing (${outgoingRequests.length})` },
          { key: "search", label: "Add" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "list" && (
          <div>
            {friends.length === 0 ? (
              <EmptyFriends />
            ) : (
              friends.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                >
                  <Avatar name={f.friend_name} src={f.friend_profile_picture} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {f.friend_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      @{f.friend_username}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRemovingId(f.id);
                      onRemoveFriend(f.id);
                      setRemovingId(null);
                    }}
                    disabled={removingId === f.id}
                    className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Remove friend"
                  >
                    {removingId === f.id ? (
                      <Spinner size={14} className="text-gray-400 animate-spin" />
                    ) : (
                      <UserMinus size={14} className="text-gray-400 hover:text-error" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "incoming" && (
          <div>
            {incomingRequests.length === 0 ? (
              <EmptyRequests type="incoming" />
            ) : (
              incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                >
                  <Avatar name={req.actor_name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {req.actor_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{req.actor_username}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onAccept(req.id)}
                      className="w-8 h-8 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center transition-colors"
                      title="Accept"
                    >
                      <Check size={14} className="text-white" weight="bold" />
                    </button>
                    <button
                      onClick={() => onDecline(req.id)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      title="Decline"
                    >
                      <X size={14} className="text-gray-500" weight="bold" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "outgoing" && (
          <div>
            {outgoingRequests.length === 0 ? (
              <EmptyRequests type="outgoing" />
            ) : (
              outgoingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                >
                  <Avatar name={req.actor_name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {req.actor_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{req.actor_username} &middot; Pending
                    </p>
                  </div>
                  <button
                    onClick={() => onCancel(req.id)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    title="Cancel request"
                  >
                    <X size={14} className="text-gray-500" weight="bold" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "search" && (
          <div>
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <MagnifyingGlass size={16} className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  autoFocus
                />
                {searchLoading && (
                  <Spinner size={14} className="text-gray-400 animate-spin" />
                )}
                {searchQuery && !searchLoading && (
                  <button
                    onClick={() => { setSearchQuery(""); lastSearchedRef.current = ""; onClearSearch(); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div>
              {searchResults.length > 0
                ? searchResults.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                    >
                      <Avatar name={u.name} src={u.profile_picture} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{u.username}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSendRequest(u.username)}
                        disabled={sendingTo === u.username}
                        className="h-8 px-3 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {sendingTo === u.username ? (
                          <Spinner size={12} className="animate-spin" />
                        ) : (
                          <UserPlus size={12} />
                        )}
                        Add
                      </button>
                    </div>
                  ))
                : debouncedSearchQuery.length >= 2 &&
                  !searchLoading && (
                    <p className="text-center text-xs text-gray-400 py-8">
                      No users found
                    </p>
                  )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// =================================================================
// Chat View (Right Panel)
// =================================================================
function ChatView({ conversation, onBack, user }) {
  const { loadMessages, sendMessage: sendMsg } = useChat();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const { conversationId, otherUserId, otherUserName, otherUserProfilePicture } = conversation;
  const myUserId = user?.id;

  // Load initial messages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await loadMessages(conversationId);
      if (!cancelled && res.success) {
        setMessages(res.data);
        setHasMore(res.data.length === 50);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [conversationId, loadMessages]);

  const loadOlder = useCallback(async () => {
    if (!hasMore || loading || messages.length === 0) return;
    setLoading(true);
    const oldest = messages[0]?.id;
    const res = await loadMessages(conversationId, oldest);
    if (res.success && res.data.length > 0) {
      setMessages((prev) => [...res.data, ...prev]);
      setHasMore(res.data.length === 50);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, [hasMore, loading, messages, conversationId, loadMessages]);

  const handleSend = useCallback(() => {
    if (!draft.trim() || sending) return;
    const content = draft.trim();
    setSending(true);

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversationId,
        sender_id: myUserId,
        content,
        created_at: new Date().toISOString(),
        pending: true,
      },
    ]);
    setDraft("");

    sendMsg(conversationId, otherUserId, content);
    setSending(false);
  }, [draft, sending, conversationId, otherUserId, myUserId, sendMsg]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-white">
        <button
          onClick={onBack}
          className="md:hidden w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <Avatar name={otherUserName} src={otherUserProfilePicture} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {otherUserName}
          </h3>
          <p className="text-[11px] text-gray-400">@{conversation.otherUserUsername}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-[#ECE5DD] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDE1MCwxNTAsMTUwLDAuMDcpIi8+PC9zdmc+')]">
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Spinner size={24} className="text-gray-400 animate-spin" />
          </div>
        )}

        {hasMore && messages.length > 0 && (
          <div className="text-center py-2">
            <button
              onClick={loadOlder}
              disabled={loading}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              {loading ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-3">
              <ChatCircleText size={28} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">
              Send a message to start the conversation
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === myUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-1.5 rounded-lg shadow-sm ${
                  isMe
                    ? "bg-[#DCF8C6] rounded-br-sm"
                    : "bg-white rounded-bl-sm"
                }`}
              >
                <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">
                  {msg.content}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[10px] text-gray-400">
                    {formatMessageTime(msg.created_at)}
                  </span>
                  {isMe && (
                    <span className={`text-[10px] ${msg.pending ? "text-gray-400" : "text-blue-500"}`}>
                      {msg.pending ? "..." : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="shrink-0 flex items-end gap-2 px-3 py-2.5 border-t border-gray-100 bg-white">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message..."
          className="flex-1 resize-none max-h-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-gray-50"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className="w-10 h-10 shrink-0 rounded-full bg-[#059669] hover:bg-[#047857] disabled:opacity-30 flex items-center justify-center transition-colors"
        >
          <PaperPlaneRight size={18} className="text-white" weight="fill" />
        </button>
      </div>
    </>
  );
}

// =================================================================
// Notifications View
// =================================================================
function NotificationsView({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onBack,
}) {
  const typeLabels = {
    friend_request_received: "Friend Request",
    friend_request_accepted: "Friend Request Accepted",
    friend_request_declined: "Friend Request Declined",
    connection_attempt: "Connection Attempt",
  };

  return (
    <>
      <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && onMarkRead(n.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left transition-colors ${
                n.is_read ? "bg-white" : "bg-accent-light/30"
              }`}
            >
              <Avatar name={n.actor_name || "System"} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{n.actor_name || "System"}</span>{" "}
                  <span className="text-gray-500">
                    {typeLabels[n.type] || n.type}
                  </span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatNotificationTime(n.created_at)}
                </p>
              </div>
              {!n.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </>
  );
}

// =================================================================
// Settings View
// =================================================================
function SettingsView({ onBack }) {
  const { user } = useAuth();
  const { updateUserSettings } = useChat();
  const [saveDefault, setSaveDefault] = useState(true);
  const [applyAll, setApplyAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateUserSettings(saveDefault, applyAll);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Profile */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Profile
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} size="lg" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Storage */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Message Storage
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <ToggleRow
              label="Save messages by default"
              description="New conversations will auto-save messages"
              checked={saveDefault}
              onChange={() => setSaveDefault(!saveDefault)}
            />
            {saveDefault && (
              <ToggleRow
                label="Apply to all conversations"
                description="Override per-conversation settings"
                checked={applyAll}
                onChange={() => setApplyAll(!applyAll)}
              />
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-[#1c1c28] text-white rounded-xl text-sm font-medium hover:bg-[#2a2a3a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Spinner size={14} className="animate-spin" />
          ) : saved ? (
            <Check size={14} />
          ) : null}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 ${
          checked ? "bg-[#059669]" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// =================================================================
// Empty States
// =================================================================
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5] h-full">
      <div className="w-64 h-64 mb-6 opacity-20">
        <svg viewBox="0 0 303 172" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M229.565 160.229C262.212 149.245 286.931 118.241 283.39 73.4258C279.309 22.1054 234.413 4.54062 193.94 4.01939C146.612 3.41702 110.988 29.3965 69.3628 48.4807C27.7372 67.5649 -1.61645 95.7314 0.100316 133.044C1.81708 170.357 33.1565 175.088 70.2234 169.464C107.29 163.841 196.919 171.214 229.565 160.229Z"
            fill="#D9DBDD"
          />
          <circle cx="151" cy="86" r="40" fill="white" />
          <path d="M135 76L147 88L167 68" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="text-xl font-light text-gray-500 mb-2">Cryptweb Web</h2>
      <p className="text-sm text-gray-400 text-center max-w-xs">
        Send and receive messages. Select a conversation to start chatting.
      </p>
    </div>
  );
}

function EmptyFriends() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <UsersThree size={28} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">No friends yet</p>
      <p className="text-xs text-gray-400">Add friends to start chatting</p>
    </div>
  );
}

function EmptyRequests({ type }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <Bell size={28} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">
        No {type} requests
      </p>
      <p className="text-xs text-gray-400">
        {type === "incoming"
          ? "When someone adds you, it will appear here"
          : "Sent requests will appear here"}
      </p>
    </div>
  );
}
