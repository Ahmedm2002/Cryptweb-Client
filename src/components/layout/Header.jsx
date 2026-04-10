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

      <div
        className="relative flex flow-row items-center justify-center gap-2"
        ref={dropdownRef}
      >
        <span className="text-md font-semibold text-gray-700 hidden sm:block">
          {user?.name || "User"}
        </span>
        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
