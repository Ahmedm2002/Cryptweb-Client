import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const GuestOnlyRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/home" replace />;
};

export const UnverifiedOnlyRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated && user?.user?.is_verified) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
