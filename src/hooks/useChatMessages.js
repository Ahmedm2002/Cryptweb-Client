import { useState, useCallback, useEffect } from "react";
import createLogger from "../utils/logger/devLogger.js";

const log = createLogger("Chat");

/**
 * Owns the chat message timeline. Sending goes through the WebRTC data
 * channel via the provided callbacks. Tracks unread incoming messages
 * received while the tab is hidden.
 *
 * @param {(data: string, options?: object) => Promise<void>} sendData
 * @param {() => boolean} isChannelOpen
 */
export function useChatMessages(sendData, isChannelOpen) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Clear unread count as soon as the tab becomes visible again
  useEffect(() => {
    const clearUnread = () => {
      if (!document.hidden) setUnreadCount(0);
    };
    document.addEventListener("visibilitychange", clearUnread);
    window.addEventListener("focus", clearUnread);
    return () => {
      document.removeEventListener("visibilitychange", clearUnread);
      window.removeEventListener("focus", clearUnread);
    };
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setUnreadCount(0);
  }, []);

  const handleIncomingChat = useCallback((msg) => {
    if (!msg.text) return;
    log.log(`Message received: "${msg.text.slice(0, 40)}${msg.text.length > 40 ? "…" : ""}"`);
    if (document.hidden) {
      setUnreadCount((c) => c + 1);
    }
    setMessages((prev) => [
      ...prev,
      {
        id: msg.id || `${Date.now()}`,
        text: msg.text,
        timestamp: msg.ts || Date.now(),
        outgoing: false,
      },
    ]);
  }, []);

  const sendChatMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || !isChannelOpen()) return false;

      const msg = {
        type: "chat",
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: trimmed,
        ts: Date.now(),
      };

      try {
        log.log(`Message sent: "${trimmed.slice(0, 40)}${trimmed.length > 40 ? "…" : ""}"`);
        await sendData(JSON.stringify(msg));
        setMessages((prev) => [
          ...prev,
          { id: msg.id, text: trimmed, timestamp: msg.ts, outgoing: true },
        ]);
        return true;
      } catch (err) {
        log.error("Failed to send chat message:", err);
        return false;
      }
    },
    [sendData, isChannelOpen],
  );

  return {
    messages,
    sendChatMessage,
    handleIncomingChat,
    clearMessages,
    unreadCount,
  };
}
