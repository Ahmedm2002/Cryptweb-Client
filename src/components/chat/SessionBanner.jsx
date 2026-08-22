import { WarningCircle, X } from "phosphor-react";

function SessionBanner({ onClose }) {
  return (
    <div className="shrink-0 flex items-start gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
      <WarningCircle size={13} className="text-amber-600 mt-0.5 shrink-0" />
      <p className="text-[11px] text-amber-700 flex-1">
        Messages and files are end-to-end encrypted. This chat will no longer
        exist after the session ends.
      </p>
      <button
        onClick={onClose}
        className="shrink-0 w-5 h-5 rounded-full hover:bg-amber-100 flex items-center justify-center transition-colors"
      >
        <X size={12} className="text-amber-600" weight="bold" />
      </button>
    </div>
  );
}

export default SessionBanner;
