import { useState, useRef, useEffect } from "react";
import { SignOut, DotsThreeVertical } from "phosphor-react";
import { useAuth } from "../../hooks/useAuth";

const GOOGLE_COLORS = [
  "#1a73e8",
  "#e8710a",
  "#188038",
  "#a142f4",
  "#e5143c",
  "#f9ab00",
  "#12a4af",
  "#e8710a",
  "#1a73e8",
  "#188038",
  "#a142f4",
  "#e5143c",
  "#f9ab00",
  "#12a4af",
  "#1a73e8",
  "#e8710a",
  "#188038",
  "#a142f4",
  "#e5143c",
  "#f9ab00",
  "#12a4af",
  "#1a73e8",
  "#e8710a",
  "#188038",
  "#a142f4",
  "#e5143c",
];

function getGoogleColor(name) {
  const letter = (name || "U").charAt(0).toUpperCase();
  const index = letter.charCodeAt(0) - 65;
  if (index < 0 || index > 25) return GOOGLE_COLORS[0];
  return GOOGLE_COLORS[index];
}

export const Header = ({ onLogoutConfirm }) => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const initial = (user?.name || "U").charAt(0).toUpperCase();
  const bgColor = getGoogleColor(user?.name);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <span className="text-lg font-bold tracking-tight text-gray-900">
        Cryptweb
      </span>

      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-xs select-none"
          style={{ backgroundColor: bgColor }}
        >
          {initial}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <DotsThreeVertical
              size={18}
              className="text-gray-600"
              weight="bold"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogoutConfirm();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <SignOut size={16} className="text-gray-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
