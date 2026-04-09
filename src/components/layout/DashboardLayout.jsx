import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Modal } from "../ui/Modal";
import { Button } from "../Button";
import { useUser } from "../../hooks/useUser";

export const DashboardLayout = ({ children }) => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans antialiased overflow-hidden">
      <Header
        onLogoutConfirm={() => setLogoutModalOpen(true)}
        onMenuClick={() => setMobileOpen(true)}
      />
      <div className="flex flex-1 relative h-[calc(100vh-4rem)]">
        <Sidebar
          isMobileOpen={isMobileOpen}
          setMobileOpen={setMobileOpen}
          onLogoutConfirm={() => setLogoutModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-2 lg:p-4 w-full h-[calc(100vh-4rem)]">
          <div className="max-w-5xl mx-auto pb-10">{children}</div>
        </main>
      </div>

      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Logout"
      >
        <p className="text-gray-600 mb-6 font-medium">
          Are you sure you want to log out of your account?
        </p>
        <div className="flex gap-4 justify-end">
          <Button variant="secondary" onClick={() => setLogoutModalOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 hover:shadow-md text-white border-transparent"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Modal>
    </div>
  );
};
