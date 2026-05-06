import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Home from "./Home";
import { Profile } from "../components/profile/Profile";
import Settings from "../components/settings/Settings";
import { useAuth } from "../hooks/useAuth";
import { useSocket, socket } from "../hooks/useSocket";
function Dashboard() {
  const { user } = useAuth();
  const { isConnectedWithServer, connectWithServer } = useSocket();
  const location = useLocation();
  const [activeView, setActiveView] = useState("home");

  useEffect(() => {
    if (!isConnectedWithServer) {
      socket.connect(() => {
        connectWithServer()
      })
    }
    return () => {
      socket.disconnect();
    };
  }, [location.pathname]);

  return (
    <DashboardLayout>
      {activeView === "home" && <Home />}
      {/* {activeView === "profile" && <Profile />}
      {activeView === "settings" && <Settings />} */}
    </DashboardLayout>
  );
};

export default Dashboard