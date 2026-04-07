import { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const checkSession = async () => {
    try {
      const res = await api.get("/user-session/1");
      if (typeof res !== "string" && res && res.success) {
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

  const logout = async () => {
    const res = await api.post("/logout");
    if (res && res.success && typeof res !== "string") {
      setUser(null);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isInitializing,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
