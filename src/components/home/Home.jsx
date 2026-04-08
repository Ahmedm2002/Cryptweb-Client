import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Tabs } from "../ui/Tabs";
import { UserSearch } from "./UserSearch";
import { UserStatusCard } from "./UserStatusCard";

export const Home = () => {
  const { user } = useAuth();
  const [searchResult, setSearchResult] = useState(null);

  const tabs = [
    {
      id: "search",
      label: "Search User",
      content: (
        <div className="p-2 sm:p-6">
          <UserSearch onSearchComplete={(res) => setSearchResult(res)} />
        </div>
      ),
    },
    {
      id: "result",
      label: "Status Result",
      content: (
        <div className="p-2 sm:p-6">
          <UserStatusCard result={searchResult} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="mt-2 text-lg text-gray-500 font-medium">
          Connect with your friends
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Tabs tabs={tabs} defaultTab="search" />
      </div>
    </div>
  );
};
