import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/layout/Navbar.jsx";
import { Login } from "./pages/Login.jsx";
import { Signup } from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";

/* Static marketing pages are code-split so the initial bundle
   only contains the app shell + auth flow.
   NOTE: these pages use named exports, so map them to { default }. */
const Product = lazy(() =>
  import("./pages/Product.jsx").then((m) => ({ default: m.Product })),
);
const Security = lazy(() =>
  import("./pages/Security.jsx").then((m) => ({ default: m.Security })),
);
const Features = lazy(() =>
  import("./pages/Features.jsx").then((m) => ({ default: m.Features })),
);
const About = lazy(() =>
  import("./pages/About.jsx").then((m) => ({ default: m.About })),
);
const Contact = lazy(() =>
  import("./pages/Contact.jsx").then((m) => ({ default: m.Contact })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound.jsx").then((m) => ({ default: m.NotFound })),
);

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-gray-200 border-t-[#059669] rounded-full animate-spin" />
    </div>
  );
}

const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
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
        <div className="font-sans antialiased text-gray-900 bg-[#FAFBFD] min-h-screen">
        <ConditionalNavbar menuItems={menuItems} />
        <Suspense fallback={<RouteFallback />}>
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
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
