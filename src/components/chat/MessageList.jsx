import { useEffect, useRef } from "react";
import FileBubble from "./FileBubble";
import { formatTime } from "../../utils/format.js";

function TextBubble({ m }) {
  return (
    <div className={`flex ${m.outgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl ${
          m.outgoing
            ? "bg-gray-900 text-white rounded-br-sm"
            : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{m.text}</p>
        <p className="text-[10px] mt-1 text-gray-400">
          {formatTime(m.timestamp)}
        </p>
      </div>
    </div>
  );
}

function MessageList({ items, onDownload, onCancel }) {
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [items]);

  return (
    <div
      ref={listRef}
      className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50"
    >
      {items.length === 0 && (
        <p className="text-center text-xs text-gray-400 pt-8">
          No messages yet. Say hello!
        </p>
      )}
      {items.map((item) =>
        item.kind === "text" ? (
          <TextBubble key={item.key} m={item.m} />
        ) : (
          <div
            key={item.key}
            className={`flex ${
              item.t.direction === "out" ? "justify-end" : "justify-start"
            }`}
          >
            <FileBubble t={item.t} onDownload={onDownload} onCancel={onCancel} />
          </div>
        ),
      )}
    </div>
  );
}

export default MessageList;
