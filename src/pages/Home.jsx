import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EmailInput from "../components/EmailInput";
import { useSocket } from "../socket/useSocket";
import { useFileTransfer } from "../hooks/useFileTransfer";
import { FileDropzone } from "../components/webrtc/FileDropzone";
import { TransferList } from "../components/webrtc/TransferList";
import { PeerConnectionStatus } from "../components/webrtc/PeerConnectionStatus";
import IncomingRequest from "../components/dashboard/ConnectionStatus/IncomingRequest";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isConnectedWithServer,
    connectWithServer,
    isConnectedWithFriend,
    friendStatus,
    incomingRequest,
    respondToRequest,
  } = useSocket();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && !isConnectedWithServer) {
      connectWithServer();
    }
  }, [user, isConnectedWithServer, connectWithServer]);

  // The offer will be automatically created when connection:result is received from the backend

  return (
    <div className="w-full h-full flex flex-col items-center gap-6 animate-in fade-in duration-300 relative py-10 px-4">
      {/* <PeerConnectionStatus isConnected={isConnectedWithFriend} /> */}

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
        <div className="w-full max-w-md flex flex-col gap-4">
          <FileDropzone
            onFileSelect={sendFile}
            disabled={!isConnectedWithFriend}
          />
          <TransferList
            transfers={transfers}
            onCancel={cancelTransfer}
            onClearCompleted={clearCompleted}
          />
        </div>
      )}
    </div>
  );
}

export default Home;
