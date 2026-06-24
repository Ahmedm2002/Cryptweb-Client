import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/layout/Navbar.jsx";
import { Loader } from "./components/commons/Loader.jsx";
import { Product } from "./pages/Product.jsx";
import { Login } from "./pages/Login.jsx";
import { Signup } from "./pages/Signup.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Security } from "./pages/Security.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import Dashboard from "./pages/Dashboard.jsx";

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to="/home" replace />;
  return children;
};

const ConditionalNavbar = ({ menuItems }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/home", "/profile", "/settings"];
  const shouldHide = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path),
  );

  if (shouldHide) return null;
  return <Navbar menuItems={menuItems} />;
};

const AppContent = () => {
  const menuItems = [{ title: "Home", link: "/home" }];

  return (
    <Router>
      <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen">
        <ConditionalNavbar menuItems={menuItems} />
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <Product />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path="/home"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route path="/security" element={<Security />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
