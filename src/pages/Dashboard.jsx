import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Home } from "../components/home/Home";
import { Profile } from "../components/profile/Profile";

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
      {activeView === "settings" && (
        <div className="p-8 sm:p-12 bg-white border border-gray-100 shadow-sm rounded-2xl animate-in fade-in duration-500">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Settings
          </h2>
          <p className="text-lg text-gray-500 mt-2 font-medium">
            Settings functionality coming soon.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};
