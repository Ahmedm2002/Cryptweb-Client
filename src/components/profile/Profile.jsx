import { useAuth } from "../../hooks/useAuth";
import { SessionList } from "./SessionList";

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-5xl flex-shrink-0 shadow-inner">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="text-center sm:text-left pt-2">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {user?.name}
          </h2>
          <p className="text-gray-500 font-medium text-lg mt-1">
            {user?.email}
          </p>
          <div className="mt-4">
            {user?.verified_at ? (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 uppercase tracking-wider">
                Verified Account
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 uppercase tracking-wider">
                Unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session List */}
      <div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Active Sessions
        </h3>
        <SessionList />
      </div>
    </div>
  );
};
