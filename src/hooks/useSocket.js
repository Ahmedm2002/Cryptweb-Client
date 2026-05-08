import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

function useSocket() {
  const { user } = useAuth();
  const [isConnectedWithServer, setIsConnectedWithServer] = useState(
    socket.connected,
  );
  const [friendStatus, setFriendStatus] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [isConnectedWithFriend, setIsConnectedWithFriend] = useState(false);

  function connectWithServer() {
    setIsConnectedWithServer(true);
    socket.emit("user:register", {
      email: user.email,
      name: user.name || user.email,
    });
  }

  function updateFriendsStatus(data) {
    setIsInitiator(true);
    setFriendStatus(data);
    if (friendStatus?.data?.isOnline) {
      console.log("Friend is online send him offer to connect");
    }
  }
  function onIncomingRequest(data) {
    setIsInitiator(false);
    setIncomingRequest(data);
  }
  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      connectWithServer();
    }

    const onDisconnect = () => {
      setIsConnectedWithServer(false);
    };


  }, []);

  return {
    isConnectedWithServer,
    isConnectedWithFriend,
    connectWithServer,
    updateFriendsStatus,
    friendStatus,
    setIsInitiator,
  };
}

export { useSocket, socket };
