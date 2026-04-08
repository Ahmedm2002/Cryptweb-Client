import { useAuth } from "../../hooks/useAuth";

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1>Dynamic Content</h1>
    </div>
  );
};
