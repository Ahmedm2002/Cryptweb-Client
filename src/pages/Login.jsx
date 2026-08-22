import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { Button } from "../components/commons/Button";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle("Sign In");

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.password) setPassword(location.state.password);
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill all fields");

    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (typeof res === "string") {
        setError(res);
      } else if (res && res.success !== false) {
        navigate("/home");
      } else {
        setError(res?.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-[#FAFBFD] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign in to your account to continue sharing.
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-1 space-y-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="text-sm text-center mt-6">
            <span className="text-gray-500">Don't have an account? </span>
            <Link
              to="/signup"
              className="font-medium text-[#059669] hover:text-[#047857] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
