import { useState, useRef, useEffect } from "react";
import { SignOut, DotsThreeVertical, GearSix } from "phosphor-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
    <header className="h-14 bg-[#00A884] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.74.45 3.38 1.24 4.81L2 22l5.19-1.24C8.62 21.55 10.26 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm.03 14.2c-1.18 0-2.35-.32-3.36-.93l-.24-.14-2.49.65.66-2.42-.16-.25c-.66-1.04-1-2.26-1-3.51 0-3.58 2.91-6.49 6.49-6.49 3.58 0 6.49 2.91 6.49 6.49 0 3.58-2.91 6.5-6.49 6.5z"/>
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
          Cryptweb
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-xs select-none"
          style={{ backgroundColor: bgColor }}
        >
          {initial}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <DotsThreeVertical
              size={18}
              className="text-white"
              weight="bold"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-50 cw-fade-in">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <GearSix size={16} className="text-gray-400" />
                Settings
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogoutConfirm();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
