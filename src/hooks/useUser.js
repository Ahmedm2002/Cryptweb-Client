import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./useAuth";

export const useUser = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkStatus = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/user/check-status", { email });
      if (res && res.success) {
        return res.data;
      }
      throw new Error(res?.message || "Failed to check status");
    } catch (err) {
      setError(err?.message || "An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    logout,
    checkStatus,
    loading,
    error,
  };
};
