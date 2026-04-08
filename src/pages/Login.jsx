import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center sm:py-6 sm:px-6 lg:px-8 sm:bg-gray-50 bg-white flex-col">
      <div className="sm:max-w-md w-full space-y-8 bg-white p-6 sm:p-10 sm:rounded-3xl sm:shadow-sm sm:border sm:border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Please enter your details to sign in.
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
          </div>

          <div className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full flex justify-center py-3 text-[15px]"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <button className="w-full flex items-center justify-center gap-3 bg-surface-container hover:bg-surface-container-high transition-colors py-3 px-4 rounded-lg text-sm font-medium border border-outline-variant mb-6 group text-on-surface outline-none">
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 5.04c1.94 0 3.51.68 4.75 1.74l3.55-3.55C18.1 1.21 15.24 0 12 0 7.31 0 3.25 2.67 1.15 6.61l4.13 3.2C6.22 7.02 8.87 5.04 12 5.04z"
                  fill="#EA4335"
                ></path>
                <path
                  d="M23.49 12.27c0-.8-.07-1.56-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.74-2.4 3.58l3.74 2.91c2.18-2.02 3.48-5 3.48-8.73z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M5.28 14.19c-.24-.72-.37-1.49-.37-2.19 0-.71.13-1.47.37-2.19L1.15 6.61C.42 8.23 0 10.06 0 12s.42 3.77 1.15 5.39l4.13-3.2z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.74-2.91c-1.1.74-2.51 1.18-4.22 1.18-3.13 0-5.78-2.08-6.73-4.88l-4.13 3.2C3.25 21.33 7.31 24 12 24z"
                  fill="#34A853"
                ></path>
              </svg>
              Continue with Google
            </button>
          </div>
        </form>
        <div className="text-sm text-center mt-8">
          <span className="text-gray-500">Don't have an account? </span>
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
