import { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  async function checkSession() {
    try {
      const res = await api.get("/session/1");
      if (res && res.success) {
        setUser(res.data?.user || res.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }
  useEffect(() => {
    checkSession();
  }, []);

  async function signup(name, email, password) {
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
      setIsInitializing(false);
    }
  }

  async function login(email, password) {
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
      setIsInitializing(false);
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
        loading: isInitializing,
        logout,
        login,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
