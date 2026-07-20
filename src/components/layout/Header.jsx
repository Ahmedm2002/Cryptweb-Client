import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, SignOut } from "phosphor-react";
import { useAuth } from "../../hooks/useAuth";

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

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <span className="text-lg font-bold tracking-tight text-gray-900">
        Cryptweb
      </span>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.name || "User"}
          </span>
          <div className="w-8 h-8 rounded-full bg-[#1c1c28] text-white flex items-center justify-center font-semibold text-xs">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => {
                setDropdownOpen(false);
                navigate("/transfers");
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Clock size={16} className="text-gray-400" />
              Recent Transfers
            </button>
            <div className="border-t border-gray-100 my-1" />
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
    </header>
  );
};
