import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/EmailInput";
import { useSocket } from "../hooks/useSocket";
function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isConnectedWithServer,
    connectWithServer,
    isConnectedWithFriend,
    friendStatus,
  } = useSocket();

  if (friendStatus?.data?.isOnline) {
    console.log(
      "Friends is online attempt to connect with the friends via webrtc ",
    );
  }

  if (!user) {
    navigate("/login");
  }

  if (!isConnectedWithServer) {
    connectWithServer();
  }
  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-300 relative">
      {!isConnectedWithFriend && <EmailInput />}

      {friendStatus && friendStatus?.data?.isOnline && (
        <div className="mt-4 w-full max-w-md p-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <p className="text-green-500 font-medium">
            Waiting for response from
          </p>
        </div>
      )}
    </div>
  );
}
export default Home;
