import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Home } from "./Home";
import { Profile } from "../components/profile/Profile";
import Settings from "../components/settings/Settings";

export const Dashboard = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState("home");

  useEffect(() => {
    if (location.pathname.startsWith("/profile")) {
      setActiveView("profile");
    } else if (location.pathname.startsWith("/settings")) {
      setActiveView("settings");
    } else {
      setActiveView("home");
    }
  }, [location.pathname]);

  return (
    <DashboardLayout>
      {activeView === "home" && <Home />}
      {activeView === "profile" && <Profile />}
      {activeView === "settings" && <Settings />}
    </DashboardLayout>
  );
};
