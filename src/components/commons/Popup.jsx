import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export const Popup = ({ isOpen = true, children, onClose }) => {
  const overlayRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
    else {
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!shouldRender) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ease-out ${
        isOpen
          ? "bg-black/40 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-none opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full relative transition-all duration-200 ease-out transform ${
          isOpen
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-4 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 focus:outline-none"
        >
          <X size={20} />
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
