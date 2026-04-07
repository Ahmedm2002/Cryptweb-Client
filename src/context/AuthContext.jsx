import { createContext, useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [sessionData, sessionLoading, sessionError] = useApi("/user-session/1");
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!sessionLoading) {
      if (sessionData) {
        setUser(sessionData);
      }
      setIsInitializing(false);
    }
  }, [sessionData, sessionLoading]);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    if (res.data.success) {
      setUser(res.data.data);
    }
    return res;
  };

  const signup = async (email, password) => {
    return await api.post("/signup", { email, password });
  };

  const logout = async () => {
    const res = await api.post("/logout");
    if (res.data.success) {
      setUser(null);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isInitializing,
        error: sessionError,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
