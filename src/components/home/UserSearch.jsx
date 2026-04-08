import { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../Button";
import { useUser } from "../../hooks/useUser";

export const UserSearch = ({ onSearchComplete }) => {
  const [email, setEmail] = useState("");
  const { checkStatus, loading, error } = useUser();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;
    const result = await checkStatus(email);
    if (result) {
      onSearchComplete(result);
    }
  };

  return (
    <div className="max-w-md w-full">
      <form onSubmit={handleSearch} className="space-y-4">
        <Input
          label="Search User by Email"
          id="email-search"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full text-[15px] py-3"
        >
          {loading ? "Checking..." : "Check Status"}
        </Button>
      </form>
    </div>
  );
};
