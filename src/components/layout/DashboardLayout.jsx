import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { useAuth } from "../../hooks/useAuth";

function DashboardLayout({ children }) {
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setLogoutConfirm(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans antialiased">
      <Header onLogoutConfirm={() => setLogoutConfirm(true)} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {logoutConfirm && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Logout</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
