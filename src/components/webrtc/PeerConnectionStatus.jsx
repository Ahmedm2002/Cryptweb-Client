import React from "react";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export function PeerConnectionStatus({ isConnected }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      isConnected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
    }`}>
      {isConnected ? (
        <>
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Secure P2P Connection Active</span>
        </>
      ) : (
        <>
          <ShieldAlert className="w-4 h-4 text-gray-400" />
          <span>Waiting for Peer</span>
        </>
      )}
    </div>
  );
}
