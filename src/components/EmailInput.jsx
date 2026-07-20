import { useState, useEffect } from "react";
import { Button } from "./commons/Button";
import { api } from "../services/api";
import { useSocket } from "../socket/useSocket";
import { useAuth } from "../hooks/useAuth";

function EmailInput({ initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateFriendsStatus } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  async function checkFriendsStatus() {
    if (email.trim() === "") return;

    try {
      updateFriendsStatus(null);
      setLoading(true);
      const res = await api.post("/session/get-friend-status", { email });
      updateFriendsStatus({ ...res, email });
      setStatus(res);
    } catch (error) {
      setStatus({
        success: false,
        message: error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          checkFriendsStatus();
        }}
        className="w-full max-w-md mx-auto flex flex-col sm:flex-row gap-2"
      >
        <input
          type="email"
          id="friends-email"
          placeholder="Friend's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors disabled:opacity-50"
        />

        <Button
          type="submit"
          disabled={
            !email || email.trim() === "" || loading || user?.email === email
          }
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm"
        >
          {loading ? "Checking..." : "Connect"}
        </Button>
      </form>

      {user.email === email && (
        <div className="mt-3 w-full max-w-md p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            You cannot connect to yourself
          </p>
        </div>
      )}

      {status && !status?.data?.isOnline && (
        <div className="mt-3 w-full max-w-md p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">{status.message}</p>
        </div>
      )}
    </div>
  );
}

export default EmailInput;
