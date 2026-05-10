import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Home from "./Home";
import { useAuth } from "../hooks/useAuth";
import { useSocket, socket } from "../socket/useSocket";
function Dashboard() {
  const { user } = useAuth();
  const { isConnectedWithServer, connectWithServer } = useSocket();
  const location = useLocation();
  const [activeView, setActiveView] = useState("home");

  useEffect(() => {
    if (!isConnectedWithServer) {
      socket.connect(() => {
        connectWithServer();
      });
    }
    return () => {
      socket.disconnect();
    };
  }, [location.pathname]);

  return (
    <>
      <DashboardLayout>
        <Home />
      </DashboardLayout>
    </>
  );
}

export default Dashboard;
