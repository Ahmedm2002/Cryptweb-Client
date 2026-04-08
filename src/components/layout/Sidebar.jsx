import { Link, useLocation } from "react-router-dom";
import { Home, User, Settings, LogOut, X } from "lucide-react";

const navItems = [
  { name: "Home", path: "/home", icon: Home },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const Sidebar = ({ isMobileOpen, setMobileOpen, onLogoutConfirm }) => {
  const location = useLocation();

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-0 left-0 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-100">
          <span className="text-xl font-black text-gray-900">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {Icon && (
                    <Icon
                      size={20}
                      className={isActive ? "text-indigo-600" : "text-gray-400"}
                    />
                  )}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              setMobileOpen(false);
              onLogoutConfirm();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 w-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <LogOut size={20} className="text-red-500" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
