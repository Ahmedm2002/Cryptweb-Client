import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

export const useSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [friendStatus, setFriendStatus] = useState(null);

  const onConnect = () => {
    setIsConnected(true);
    socket.emit("register", {
      email: user.email,
      name: user.name || user.email,
    });
  };
  useEffect(() => {
    if (!user) return;

    // If the socket connected flawlessly before the hook mounted completely, force registration manually
    if (socket.connected) {
      onConnect();
    }

    const onDisconnect = () => setIsConnected(false);
    const onStatusUpdate = (statusData) => {
      console.log("statusData", statusData);
      setFriendStatus(statusData);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("status-update", onStatusUpdate);
    socket.on("user-status", onStatusUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("status-update", onStatusUpdate);
      socket.off("user-status", onStatusUpdate);
    };
  }, [user]);

  const checkFriendStatus = (email) => {
    if (!email) return;
    socket.emit("check-status", { email });
  };

  return { isConnected, friendStatus, checkFriendStatus, onConnect };
};
