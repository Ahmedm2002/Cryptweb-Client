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
  }, [sessionLoading]);

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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
