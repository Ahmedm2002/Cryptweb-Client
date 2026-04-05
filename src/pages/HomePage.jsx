import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Home, User, Settings } from "lucide-react";

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const currentUser = user?.user || user;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#0E1117] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#151921] border-r border-[#2C313C] p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-8">
            Cryptweb
          </h2>
          <nav className="flex flex-col gap-4">
            <button className="flex items-center gap-3 text-blue-400 bg-blue-500/10 p-3 rounded-lg font-medium transition-colors">
              <Home size={20} /> Home
            </button>
            <button className="flex items-center gap-3 text-[#A0A5B1] hover:text-white hover:bg-[#1E232E] p-3 rounded-lg font-medium transition-colors">
              <User size={20} /> Profile
            </button>
            <button className="flex items-center gap-3 text-[#A0A5B1] hover:text-white hover:bg-[#1E232E] p-3 rounded-lg font-medium transition-colors">
              <Settings size={20} /> Settings
            </button>
          </nav>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 text-red-400 hover:text-white hover:bg-red-500/20 p-3 rounded-lg font-medium transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header / fallback if needed */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[#2C313C] bg-[#151921]">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Cryptweb
          </h2>
          <button onClick={handleLogout} className="text-red-400 p-2">
            <LogOut size={20} />
          </button>
        </header>

        <section className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser?.name || "User"}!
            </h1>
            <p className="text-[#A0A5B1] mb-8">
              Here is the latest overview for your setup.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Dummy Info Cards */}
              <div className="bg-[#151921] border border-[#2C313C] p-6 rounded-xl">
                <p className="text-sm text-[#A0A5B1] mb-2">User Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <p className="text-xl font-semibold">Active Session</p>
                </div>
              </div>

              <div className="bg-[#151921] border border-[#2C313C] p-6 rounded-xl">
                <p className="text-sm text-[#A0A5B1] mb-2">Email Address</p>
                <p
                  className="text-lg font-semibold truncate"
                  title={currentUser?.email}
                >
                  {currentUser?.email || "N/A"}
                </p>
              </div>

              <div className="bg-[#151921] border border-[#2C313C] p-6 rounded-xl md:col-span-2 lg:col-span-1">
                <p className="text-sm text-[#A0A5B1] mb-2">Account ID</p>
                <p
                  className="text-lg font-semibold font-mono text-blue-400 truncate"
                  title={currentUser?.id}
                >
                  {currentUser?.id || "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-[#151921] border border-[#2C313C] p-8 rounded-xl min-h-[300px] flex items-center justify-center">
              <p className="text-[#A0A5B1] text-lg">Dynamic content area...</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
