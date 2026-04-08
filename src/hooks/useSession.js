import { useState, useEffect } from "react";
import { api } from "../services/api";

export const useSession = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSessions = async () => {
      try {
        const res = await api.get("/user-session/all");
        console.log("User session res: ", res);
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
    };

    fetchSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  return { sessions, loading, error };
};
