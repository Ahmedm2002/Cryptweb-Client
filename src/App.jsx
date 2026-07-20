import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/layout/Navbar.jsx";
import { Loader } from "./components/commons/Loader.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";

const Product = lazy(() => import("./pages/Product.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Security = lazy(() => import("./pages/Security.jsx"));
const Features = lazy(() => import("./pages/Features.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const RecentTransfers = lazy(() => import("./pages/RecentTransfers.jsx"));

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
  const location = window.location;
  const hideNavbarRoutes = ["/home", "/profile", "/settings", "/transfers"];
  const shouldHide = hideNavbarRoutes.some((path) =>
    location.pathname.startsWith(path),
  );

  if (shouldHide) return null;
  return <Navbar menuItems={menuItems} />;
};

const PageLoader = () => (
  <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
    <Loader />
  </div>
);

const AppContent = () => {
  const menuItems = [{ title: "Home", link: "/home" }];

  return (
    <Router>
      <div className="font-sans antialiased text-gray-900 bg-[#FAFBFD] min-h-screen">
        <ConditionalNavbar menuItems={menuItems} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<GuestRoute><Product /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
            <Route path="/home" element={<AuthRoute><Dashboard /></AuthRoute>} />
            <Route path="/profile" element={<AuthRoute><Dashboard /></AuthRoute>} />
            <Route path="/settings" element={<AuthRoute><Dashboard /></AuthRoute>} />
            <Route path="/transfers" element={<AuthRoute><Dashboard><RecentTransfers /></Dashboard></AuthRoute>} />
            <Route path="/security" element={<Security />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;