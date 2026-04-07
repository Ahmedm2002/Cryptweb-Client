import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";

export const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    setError(null);
    try {
      const res = await signup(email, password);
      if (res.data.success) {
        navigate("/login", { state: { email, password } });
      } else {
        setError(res.data.message || "Failed to create account");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "An error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex-col">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Register
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Join Cryptweb for secure P2P sharing
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-700 text-sm bg-red-50 border border-red-100 p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1.5"
                htmlFor="name"
              >
                Name
              </label>
              <input
                id="name"
                type="name"
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all sm:text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1.5"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1.5"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1.5"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full flex justify-center py-3 text-[15px]"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center mt-8">
          <span className="text-gray-500">Already have an account? </span>
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
