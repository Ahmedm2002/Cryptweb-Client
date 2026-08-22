import { useMemo, useState } from "react";
import { useSocket } from "../../socket/useSocket";
import { useFileTransfer } from "../../hooks/useFileTransfer.js";
import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";
import ChatHeader from "./ChatHeader";
import SessionBanner from "./SessionBanner";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatWindow = ({ friendEmail, status, onDisconnect }) => {
  const {
    connectedFriend,
    messages,
    sendChatMessage,
    startCall,
    isDataChannelOpen,
    peerDisconnected,
    peerEnded,
    unreadCount,
  } = useSocket();
  const { transfers, sendFile, downloadFile, cancelTransfer } = useFileTransfer(
    friendEmail,
    status?.user || null,
    peerDisconnected,
    peerEnded,
  );

  const [draft, setDraft] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  const peerName = connectedFriend?.name || friendEmail || "Peer";
  const channelOpen = isDataChannelOpen();
  const hasActiveTransfer = transfers.some((t) => t.status === "active");

  // Tab title: unread badge while hidden, otherwise show who we're connected with
  useDocumentTitle(
    unreadCount > 0
      ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
      : `Connected with ${peerName}`,
  );

  // Merged timeline of text messages + file transfers, ordered by time
  const items = useMemo(
    () =>
      [
        ...messages.map((m) => ({
          kind: "text",
          key: m.id,
          ts: m.timestamp,
          m,
        })),
        ...transfers.map((t) => ({ kind: "file", key: t.id, ts: t.ts, t })),
      ].sort((a, b) => a.ts - b.ts),
    [messages, transfers],
  );

  const handleSend = async () => {
    if (!draft.trim()) return;
    const ok = await sendChatMessage(draft);
    if (ok) setDraft("");
  };

  return (
    <div className="w-full h-[calc(100dvh-3.5rem)] flex flex-col bg-white border border-gray-200 overflow-hidden">
      <ChatHeader
        peerName={peerName}
        onAudioCall={() => startCall("audio")}
        onVideoCall={() => startCall("video")}
        onDisconnect={onDisconnect}
      />
      {showBanner && <SessionBanner onClose={() => setShowBanner(false)} />}
      <MessageList items={items} onDownload={downloadFile} onCancel={cancelTransfer} />
      <ChatInput
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onFileSelected={sendFile}
        channelOpen={channelOpen}
        hasActiveTransfer={hasActiveTransfer}
      />
    </div>
  );
};

export default ChatWindow;
