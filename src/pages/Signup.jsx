import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { checkUsername } from "../services/users.js";
import { Button } from "../components/commons/Button";
import { Check, X, Spinner } from "phosphor-react";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | available | taken | invalid
  const [usernameMsg, setUsernameMsg] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle("Create an Account");

  const debouncedUsername = useDebounce(username, 400);
  const lastCheckedRef = useRef("");

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      if (debouncedUsername.length > 0 && debouncedUsername.length < 3) {
        setUsernameStatus("invalid");
        setUsernameMsg("Must be at least 3 characters");
      } else {
        setUsernameStatus("idle");
        setUsernameMsg("");
      }
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(debouncedUsername)) {
      setUsernameStatus("invalid");
      setUsernameMsg("Only letters, numbers, and underscores");
      return;
    }

    if (debouncedUsername === lastCheckedRef.current) return;

    let cancelled = false;
    setUsernameStatus("checking");
    setUsernameMsg("");

    (async () => {
      try {
        const res = await checkUsername(debouncedUsername);
        if (cancelled) return;
        lastCheckedRef.current = debouncedUsername;
        if (res.success && res.data?.available) {
          setUsernameStatus("available");
          setUsernameMsg("Username is available");
        } else {
          setUsernameStatus("taken");
          setUsernameMsg(res.message || "Username is already taken");
        }
      } catch {
        if (!cancelled) {
          setUsernameStatus("idle");
          setUsernameMsg("");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [debouncedUsername]);

  const usernameInputClasses = {
    idle: "border-gray-200 focus:ring-[#059669]/40 focus:border-[#059669]",
    checking: "border-gray-200 focus:ring-[#059669]/40 focus:border-[#059669]",
    available: "border-green-400 focus:ring-green-400/40 focus:border-green-400",
    taken: "border-red-400 focus:ring-red-400/40 focus:border-red-400",
    invalid: "border-red-400 focus:ring-red-400/40 focus:border-red-400",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (!email || !name || !username || !password || !confirmPassword)
      return setError("All fields are required");
    if (usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "checking")
      return setError("Please choose a valid, available username");
    setLoading(true);
    setError(null);
    try {
      const res = await signup(name, email, username, password);
      if (res && res.success) {
        navigate("/home");
      } else {
        setError(res?.message || "Registration failed");
      }
    } catch (err) {
      setError(err?.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-[#FAFBFD] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create an account
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Join Cryptweb to send files securely and track your transfers.
          </p>
        </div>

        <div className="bg-transparent md:bg-white p-0 md:p-8 rounded-none md:rounded-xl border-0 md:border md:border-gray-200 shadow-none md:shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/40 focus:border-[#059669] transition-colors placeholder:text-gray-400"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="username"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    required
                    className={`block w-full px-3.5 py-2.5 pr-10 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-400 ${usernameInputClasses[usernameStatus]}`}
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.replace(/\s/g, ""));
                      lastCheckedRef.current = "";
                    }}
                    autoComplete="username"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && (
                      <Spinner size={16} className="text-gray-400 animate-spin" />
                    )}
                    {usernameStatus === "available" && (
                      <Check size={16} className="text-green-500" weight="bold" />
                    )}
                    {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                      <X size={16} className="text-red-500" weight="bold" />
                    )}
                  </span>
                </div>
                {usernameMsg && (
                  <p className={`text-xs mt-1 ${
                    usernameStatus === "available"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    {usernameMsg}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/40 focus:border-[#059669] transition-colors placeholder:text-gray-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/40 focus:border-[#059669] transition-colors placeholder:text-gray-400"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/40 focus:border-[#059669] transition-colors placeholder:text-gray-400"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-1 space-y-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                disabled={loading || usernameStatus === "checking"}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>

          <div className="text-sm text-center mt-6">
            <span className="text-gray-500">Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-[#059669] hover:text-[#047857] transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
