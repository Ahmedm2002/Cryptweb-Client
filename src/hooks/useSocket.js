import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";
import {
  rtcConnection,
  createOffer,
  createAnswer,
  setRemoteDescription,
  createDataChannel,
} from "../components/configs/webrtc.config";

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
  const [isInitiator, setIsInitiator] = useState(false);
  const timeoutRef = useRef(null);

  const clearRequestTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const onConnect = () => {
    setIsConnected(true);
    console.log("Socket id for: ", user.email, "is: ", socket.id, new Date());
    socket.emit("user:register", {
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

          // Start 10s timeout for the peer to respond
          clearRequestTimeout();
          timeoutRef.current = setTimeout(() => {
            setRequestStatus("timeout");
            setTimeout(() => setRequestStatus("idle"), 3000);
          }, 15000);
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

    const handleConnectionResult = async (data) => {
      console.log("handleConnectionResult data: ", data);
      clearRequestTimeout();
      if (data.accepted) {
        setRequestStatus("accepted");
        setIsInitiator(true);
        console.log("RTC Connection status: Initiator");

        if (data.name) {
          setFriendStatus((prev) => ({
            ...prev,
            name: data.name,
            isOnline: true,
          }));
        }

        // --- WebRTC Step 1: Initiator creates data channel and offer ---
        try {
          createDataChannel();
          const offer = await createOffer();
          const peer = pendingEmail || data.from;
          console.log("Sending WebRTC Offer to:", peer);
          socket.emit("offer", {
            offer,
            to: peer,
            from: user.email,
          });
        } catch (error) {
          console.error("Error creating WebRTC offer:", error);
        }
      } else {
        setRequestStatus("declined");
        setTimeout(() => setRequestStatus("idle"), 3000);
      }
    };

    const handleOffer = async (data) => {
      console.log("Received WebRTC Offer from:", data.from);
      if (rtcConnection.signalingState !== "stable") {
        console.warn("Ignoring overlapping offer - WebRTC config is not stable:", rtcConnection.signalingState);
        return;
      }
      try {
        await setRemoteDescription(data.offer);
        const answer = await createAnswer();
        console.log("Sending WebRTC Answer to:", data.from);
        socket.emit("answer", {
          answer,
          to: data.from,
          from: user.email,
        });
        setPendingEmail(data.from); // Keep track of the peer
      } catch (error) {
        console.error("Error handling WebRTC offer:", error);
      }
    };

    const handleAnswer = async (data) => {
      console.log("Received WebRTC Answer from:", data.from);
      try {
        await setRemoteDescription(data.answer);
      } catch (error) {
        console.error("Error handling WebRTC answer:", error);
      }
    };

    const handleIceCandidate = async (data) => {
      if (data.candidate) {
        console.log("Received ICE candidate from:", data.from);
        try {
          await rtcConnection.addIceCandidate(data.candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    // Set up ICE candidate generation listener
    rtcConnection.onCandidateGenerated = (candidate) => {
      const peerEmail =
        pendingEmail || (incomingRequest && incomingRequest.from);
      if (peerEmail) {
        console.log("Emitting ICE candidate to:", peerEmail);
        socket.emit("ice-candidate", {
          candidate,
          to: peerEmail,
          from: user.email,
        });
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("status-update", onStatusUpdate);
    socket.on("user-status", handleUserStatus);
    socket.on("connection:incoming", handleIncomingRequest);
    socket.on("connection:result", handleConnectionResult);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("status-update", onStatusUpdate);
      socket.off("user-status", handleUserStatus);
      socket.off("connection:incoming", handleIncomingRequest);
      socket.off("connection:result", handleConnectionResult);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      rtcConnection.onCandidateGenerated = null;
      clearRequestTimeout();
    };
  }, [user, requestStatus, pendingEmail]);

  const sendConnectionRequest = (email) => {
    if (!email) return;
    setPendingEmail(email);
    setRequestStatus("checking");
    socket.emit("connection:request", { from: user.email, to: email });
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
      setPendingEmail(fromEmail);
      setFriendStatus({
        name: fromName || fromEmail,
        isOnline: true,
      });
    }
  };

  const checkFriendStatus = (email) => {
    if (!email) return;
    socket.emit(" ", { email });
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
