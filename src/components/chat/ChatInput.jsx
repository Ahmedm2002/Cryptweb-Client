import { useRef } from "react";
import { Plus, PaperPlaneRight } from "phosphor-react";

function ChatInput({
  value,
  onChange,
  onSend,
  onFileSelected,
  channelOpen,
  hasActiveTransfer,
}) {
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await onFileSelected(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFilePick}
      />
      <div className="shrink-0 flex items-end gap-2 px-3 py-2.5 border-t border-gray-100 bg-white">
        <button
          onClick={() => fileInputRef.current?.click()}
          title={
            !channelOpen
              ? "Waiting for connection..."
              : hasActiveTransfer
                ? "Wait for the current transfer to finish"
                : "Share a file"
          }
          disabled={!channelOpen || hasActiveTransfer}
          className="w-9 h-9 shrink-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors disabled:opacity-40"
        >
          <Plus size={18} weight="bold" />
        </button>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            channelOpen ? "Type a message..." : "Waiting for connection..."
          }
          disabled={!channelOpen}
          className="flex-1 resize-none max-h-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 disabled:bg-gray-50"
        />

        <button
          onClick={onSend}
          disabled={!value.trim() || !channelOpen}
          className="w-9 h-9 shrink-0 rounded-full bg-gray-900 hover:bg-gray-800 disabled:opacity-30 flex items-center justify-center transition-colors"
        >
          <PaperPlaneRight size={16} className="text-white" weight="fill" />
        </button>
      </div>
    </>
  );
}

export default ChatInput;
