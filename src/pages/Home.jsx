import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/EmailInput";
import { useSocket } from "../socket/useSocket";
import FileTransfer from "../components/FileTransfer";
import IncomingRequest from "../components/dashboard/ConnectionStatus/IncomingRequest";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isConnectedWithServer,
    isConnectedWithFriend,
    friendStatus,
    incomingRequest,
    respondToRequest,
  } = useSocket();

  if (!user) navigate("/login");
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="w-full h-full flex flex-col items-center gap-6 animate-in fade-in duration-300 relative py-10 px-4">

      {!isConnectedWithFriend && <EmailInput />}

      <IncomingRequest request={incomingRequest} onRespond={respondToRequest} />

      {friendStatus &&
        friendStatus?.data?.isOnline &&
        !isConnectedWithFriend && (
          <div className="w-full max-w-md p-4 rounded-xl border border-gray-200 bg-white shadow-sm mt-4 text-center">
            <p className="text-gray-600 font-medium text-sm animate-pulse">
              Establishing secure connection with {friendStatus.data.name}...
            </p>
          </div>
        )}

      {isConnectedWithFriend && (
        <FileTransfer 
          friendEmail={friendStatus?.email || friendStatus?.data?.email || incomingRequest?.from} 
          status={friendStatus} 
        />
      )}
    </div>
  );
}

export default Home;
