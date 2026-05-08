import { useState } from "react";
import { Button } from "./commons/Button";
import { api } from "../services/api";
import { useSocket } from "../hooks/useSocket";

function EmailInput() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { updateFriendsStatus } = useSocket();

  async function checkFriendsStatus() {
    if (email.trim() === "") return;

    try {
      // Remove the older status of the friends and get the new status of other friend
      updateFriendsStatus(null);
      setLoading(true);
      const res = await api.post("/user-session/get-friend-status", { email });
      updateFriendsStatus({ ...res, email });
      setStatus(res);
    } catch (error) {
      console.log("Error occured: ", error);
      setStatus({
        success: false,
        message: error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center mt-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          checkFriendsStatus();
        }}
        className="w-full max-w-md mx-auto flex flex-col sm:flex-row gap-3"
      >
        <input
          type="email"
          placeholder="Enter friend's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
        />

        <Button
          type="submit"
          disabled={!email || email.trim() === "" || loading}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl"
        >
          {loading ? "Checking..." : "Connect"}
        </Button>
      </form>

      {status && !status?.data?.isOnline && (
        <div className="mt-4 w-full max-w-md p-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <p className="text-red-500 font-medium">{status.message}</p>
        </div>
      )}
    </div>
  );
}

export default EmailInput;
