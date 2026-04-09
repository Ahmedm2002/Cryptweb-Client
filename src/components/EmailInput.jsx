import { useState } from "react";

const EmailInput = ({ onConnect, disabled }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      onConnect(email.trim());
    }
  };

  return (
    <div className="w-full flex flex-col items-center mt-2">
      <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-green-50 rounded-full w-max shadow-sm border border-green-100">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-sm font-bold text-green-700 tracking-wide">
          Your Status: Active
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto flex flex-col sm:flex-row gap-3"
      >
        <input
          type="email"
          placeholder="Enter friend's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={email.trim() === "" || disabled}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-2xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-indigo-600"
        >
          Connect
        </button>
      </form>
    </div>
  );
};

export default EmailInput;
