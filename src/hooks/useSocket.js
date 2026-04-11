import { useEffect, useState, useRef } from "react";
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
  // 'idle' | 'checking' | 'pending' | 'accepted' | 'declined' | 'offline' | 'timeout'
  const [requestStatus, setRequestStatus] = useState("idle");
  const [pendingEmail, setPendingEmail] = useState(null);
  const timeoutRef = useRef(null);

  const clearRequestTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const onConnect = () => {
    setIsConnected(true);
    console.log("Firing socket connection event");
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

    const onDisconnect = () => {
      setIsConnected(false);
      clearRequestTimeout();
    };

    const onStatusUpdate = (statusData) => {
      setFriendStatus(statusData);

      if (requestStatus === "checking") {
        if (statusData.isOnline) {
          setRequestStatus("pending");
          socket.emit("connection:request", {
            from: user.email,
            to: pendingEmail,
          });

          // Start 5s timeout
          clearRequestTimeout();
          timeoutRef.current = setTimeout(() => {
            setRequestStatus("timeout");
            setTimeout(() => setRequestStatus("idle"), 3000);
          }, 5000);
        } else {
          setRequestStatus("offline");
          setTimeout(() => setRequestStatus("idle"), 3000);
        }
      }
    };

    const handleIncomingRequest = (data) => {
      setIncomingRequest(data);
    };

    const handleUserStatus = (data) => {
      if (data.isOnline === false) {
        setRequestStatus("idle");
        setFriendStatus(null);
        clearRequestTimeout();
      }
    };

    const handleConnectionResult = (data) => {
      console.log("handleConnectionResult data: ", data);
      clearRequestTimeout();
      if (data.accepted) {
        setRequestStatus("accepted");
        if (data.name) {
          setFriendStatus((prev) => ({
            ...prev,
            name: data.name,
            isOnline: true,
          }));
        }
      } else {
        setRequestStatus("declined");
        setTimeout(() => setRequestStatus("idle"), 3000);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("status-update", onStatusUpdate);
    socket.on("user-status", handleUserStatus);
    socket.on("connection:incoming", handleIncomingRequest);
    socket.on("connection:result", handleConnectionResult);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("status-update", onStatusUpdate);
      socket.off("user-status", handleUserStatus);
      socket.off("connection:incoming", handleIncomingRequest);
      socket.off("connection:result", handleConnectionResult);
      clearRequestTimeout();
    };
  }, [user, requestStatus, pendingEmail]);

  const sendConnectionRequest = (email) => {
    if (!email) return;
    setPendingEmail(email);
    setRequestStatus("checking");
    socket.emit("check-status", { email });
  };

  const respondToRequest = (fromEmail, accepted, fromName) => {
    socket.emit("connection:response", {
      from: user.email,
      to: fromEmail,
      accepted,
    });
    setIncomingRequest(null);
    if (accepted) {
      setRequestStatus("accepted");
      setFriendStatus({
        name: fromName || fromEmail,
        isOnline: true,
      });
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
