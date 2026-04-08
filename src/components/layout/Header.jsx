import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const Header = ({ onLogoutConfirm, onMenuClick }) => {
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

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <Link
          to="/home"
          className="text-2xl font-black tracking-tight text-gray-900 focus:outline-none rounded"
        >
          CRYPTWEB
        </Link>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-3 focus:outline-none hover:bg-gray-50 px-2 py-1.5 rounded-xl transition-colors"
        >
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">
            {user?.name || "User"}
          </span>
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        </button>

        <div
          className={`absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 overflow-hidden text-left origin-top-right transition-all duration-200 ease-out ${
            dropdownOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <Link
            to="/home"
            onClick={() => setDropdownOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Settings
          </Link>
          <button
            onClick={() => {
              setDropdownOpen(false);
              onLogoutConfirm();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
