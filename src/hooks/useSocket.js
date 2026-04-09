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
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [requestStatus, setRequestStatus] = useState("idle"); // 'idle' | 'pending' | 'accepted' | 'declined'

  const onConnect = () => {
    setIsConnected(true);
    socket.emit("register", {
      email: user.email,
      name: user.name || user.email,
    });
  };

  useEffect(() => {
    if (!user) return;

    if (socket.connected) {
      onConnect();
    }

    const onDisconnect = () => setIsConnected(false);
    const onStatusUpdate = (statusData) => {
      setFriendStatus(statusData);
    };

    const handleIncomingRequest = (data) => {
      setIncomingRequest(data);
    };

    const handleConnectionResult = (data) => {
      if (data.accepted) {
        setRequestStatus("accepted");
        if (data.name) {
          setFriendStatus((prev) => ({ ...prev, name: data.name, isOnline: true }));
        }
      } else {
        setRequestStatus("declined");
        setTimeout(() => setRequestStatus("idle"), 3000);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("status-update", onStatusUpdate);
    socket.on("connection:incoming", handleIncomingRequest);
    socket.on("connection:result", handleConnectionResult);

    return () => {
      socket.off("connect", onConnect);
      socket.off("status-update", onStatusUpdate);
      socket.off("connection:incoming", handleIncomingRequest);
      socket.off("connection:result", handleConnectionResult);
    };
  }, [user]);

  const sendConnectionRequest = (email) => {
    if (!email) return;
    setRequestStatus("pending");
    socket.emit("connection:request", { from: user.email, to: email });
  };

  const respondToRequest = (fromEmail, accepted) => {
    socket.emit("connection:response", {
      from: user.email,
      to: fromEmail,
      accepted,
    });
    setIncomingRequest(null);
    if (accepted) {
      setRequestStatus("accepted");
    }
  };

  const checkFriendStatus = (email) => {
    if (!email) return;
    socket.emit("check-status", { email });
  };

  return {
    isConnected,
    friendStatus,
    incomingRequest,
    requestStatus,
    checkFriendStatus,
    sendConnectionRequest,
    respondToRequest,
    onConnect,
  };
};
