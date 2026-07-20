import { useEffect } from "react";
import { useSocket } from "../../socket/useSocket";
import { useAuth } from "../../hooks/useAuth";
import { Users, ArrowsClockwise } from "phosphor-react";

export default function NetworkUsers() {
  const { user } = useAuth();
  const {
    networkUsers,
    requestNetworkUsers,
    updateFriendsStatus,
    connectionPhase,
  } = useSocket();

  useEffect(() => {
    requestNetworkUsers();
  }, [requestNetworkUsers]);

  const peers = networkUsers.filter((u) => u.email !== user?.email);
  const isBusy = !!connectionPhase;

  function handleConnect(peer) {
    if (isBusy) return;
    updateFriendsStatus({
      email: peer.email,
      data: { name: peer.name, isOnline: true },
    });
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <h3 className="text-sm font-medium text-gray-700">
            On Your Network
          </h3>
          {peers.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {peers.length}
            </span>
          )}
        </div>
        <button
          onClick={requestNetworkUsers}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <ArrowsClockwise size={14} />
        </button>
      </div>

      {peers.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          No other users on your network yet
        </p>
      ) : (
        <div className="space-y-1.5">
          {peers.map((peer) => (
            <div
              key={peer.email}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-gray-500">
                  {(peer.name || peer.email)[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {peer.name || peer.email}
                </p>
                <p className="text-xs text-gray-400 truncate">{peer.email}</p>
              </div>
              <button
                onClick={() => handleConnect(peer)}
                disabled={isBusy}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
