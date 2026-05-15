import { useContext } from "react";
import { SocketContext } from "../context/SocketContext.jsx";
import { socket } from "./socket.js";

function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export { socket, useSocket };
