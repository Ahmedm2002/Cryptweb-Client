import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const checkSession = async () => {
    const token = document.cookie.split("=")[1];
    if (!token) {
      setIsInitializing(false);
      setUser(null);
      return;
    }

    try {
      const res = await api.get("/user-session/1");
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
  };
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

  const logout = async () => {
    const res = await api.post("/logout");
    if (res && res.success && typeof res !== "string") {
      setUser(null);
    }
    return res;
  };

  async function verifyEmail(email, code) {
    try {
      const res = await api.post(`/verify/email`, { email, code });
      if (res && res.success) {
        if (res.data) setUser(res.data?.user || res.data);
      }
      return res;
    } catch (error) {
      return error;
    }
  }

  async function resendVerificationEmail(email) {
    try {
      const res = await api.post(`/verify/resend-code`, { email });
      return res;
    } catch (error) {
      return error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isInitializing,
        logout,
        login,
        signup,
        verifyEmail,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
