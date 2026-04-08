import { useSession } from "../../hooks/useSession";
import { Loader } from "../Loader";

export const SessionList = () => {
  const { sessions, loading, error } = useSession();
  if (loading)
    return (
      <div className="py-16 flex justify-center">
        <Loader />
      </div>
    );

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium">
        {error}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="font-medium">No active sessions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {sessions.map((session, index) => (
        <div
          key={session.id || index}
          className="p-5 sm:p-6 border border-gray-100 rounded-xl shadow-sm bg-white hover:border-gray-200 transition-colors"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">
                {session.device_type.os + " - " + session.device_type.browser ||
                  "Unknown Device"}
              </h4>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Session ID: <span className="font-mono">{session.id}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-6 text-xs text-gray-400 font-medium">
            <span>
              Started:{" "}
              {new Date(session.created_at || Date.now()).toLocaleDateString()}
            </span>
            {session.ip_address && <span>IP: {session.ip_address}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
