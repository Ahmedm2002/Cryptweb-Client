import { useState, useCallback } from "react";
import { emitNetworkUsers } from "../socket/socket.handlers.js";

/**
 * Tracks online network users and exposes handlers for the
 * NETWORK_USERS / NETWORK_USER_JOINED / NETWORK_USER_LEFT events.
 */
export function useNetworkUsers() {
  const [networkUsers, setNetworkUsers] = useState([]);

  const onNetworkUsers = useCallback(
    (users) => setNetworkUsers(users || []),
    [],
  );

  const onNetworkUserJoined = useCallback(
    (data) => setNetworkUsers(data?.onlineUsers || []),
    [],
  );

  const onNetworkUserLeft = useCallback(
    (data) => setNetworkUsers(data?.onlineUsers || []),
    [],
  );

  const requestNetworkUsers = useCallback(() => emitNetworkUsers(), []);

  return {
    networkUsers,
    onNetworkUsers,
    onNetworkUserJoined,
    onNetworkUserLeft,
    requestNetworkUsers,
  };
}
