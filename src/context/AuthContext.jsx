import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchSession = async () => {
      try {
        const response = await api.get('/user-session/1');
        if (active && response.success) {
          setUser(response.data);
          setAccessToken(Date.now().toString()); // Placeholder value since token is HTTP-only
        }
      } catch (error) {
        if (active) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchSession();
    return () => { active = false };
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
