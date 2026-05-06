import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";
import { api } from "../services/api";

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
    console.log("Event fired for connecting with socket server: ", user);
    socket.emit("user:register", {
      email: user.email,
      name: user.name || user.email,
    });
  }

  async function checkFriendsStatus(email) {
    try {
      const friendsStatus = await api.post("/user-session/get-friend-status", {
        email,
      });
      console.log("Friend's Status response: ", friendStatus);
      return friendsStatus.data;
    } catch (error) {
      console.log("Error occured");
    }
  }

  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      console.log("User not conencted: attempting to connect to socket server");
      connectWithServer();
    }

    const onDisconnect = () => {
      setIsConnectedWithServer(false);
    };
  }, []);

  return {
    checkFriendsStatus,
    isConnectedWithServer,
    isConnectedWithFriend,
    connectWithServer,
  };
}

export { useSocket, socket };
