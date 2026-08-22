/* eslint-disable react-refresh/only-export-components -- context + provider belong together */
import { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await api.get("/session/1");
        if (!cancelled && res && res.success) {
          setUser(res.data?.user || res.data);
        }
      } catch {
        // no session — stay null
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []);

  async function signup(name, email, password) {
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { name, email, password });
      if (res && res.success) {
        setUser(res.data?.user || res.data);
      }
      return res;
    } catch (error) {
      setUser(null);
      return error;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res && res.success) {
        setUser(res.data?.user || res.data);
      }
      return res;
    } catch (error) {
      setUser(null);
      return error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const res = await api.post("/session/logout");
    if (res && res.success && typeof res !== "string") {
      setUser(null);
    }
    return res;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        login,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
