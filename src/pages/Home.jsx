import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/EmailInput";
import { useSocket } from "../hooks/useSocket";
function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConnectedWithServer, checkFriendsStatus, connectWithServer } =
    useSocket();

  if (!user) {
    navigate("/login");
  }

  if (!isConnectedWithServer) {
    connectWithServer();
  }
  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-300 relative">
      <EmailInput
        isConnectedWithServer={isConnectedWithServer}
        checkFriendsStatus={checkFriendsStatus}
      />
    </div>
  );
}
export default Home;
