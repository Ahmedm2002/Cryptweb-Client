import { useState, useEffect } from "react";
import { api } from "../services/api";

export const useSession = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(true);

  async function fetchSessions() {
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const res = await api.get("/user-session/all", { signal });
      if (isMounted) {
        if (res && res.success) {
          setSessions(res.data || []);
        } else {
          setError(res?.message || "Failed to load sessions");
        }
      }
    } catch (err) {
      if (isMounted) {
        setError(err?.message || "Error loading sessions");
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();

    return () => {
      setIsMounted(false);
      controller.abort();
    };
  }, []);

  return { sessions, loading, error };
};
