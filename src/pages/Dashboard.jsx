import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Home } from "./Home";
import { Profile } from "../components/profile/Profile";
import Settings from "../components/settings/Settings";
import { useAuth } from "../hooks/useAuth";
import { socket, useSocket } from "../hooks/useSocket";
export const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected, onConnect } = useSocket();
  const location = useLocation();
  const [activeView, setActiveView] = useState("home");

  useEffect(() => {
    console.log("socket status: ", isConnected);
    if (!isConnected) {
      socket.connect(() => {
        onConnect();
      });
    }

    if (location.pathname.startsWith("/profile")) {
      setActiveView("profile");
    } else if (location.pathname.startsWith("/settings")) {
      setActiveView("settings");
    } else {
      setActiveView("home");
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
