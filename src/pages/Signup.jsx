import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/commons/Button";

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
    if (!email || !name || !password || !confirmPassword)
      return setError("All fields are required");
    setLoading(true);
    setError(null);
    try {
      const res = await signup(name, email, password);
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
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M12 5.04c1.94 0 3.51.68 4.75 1.74l3.55-3.55C18.1 1.21 15.24 0 12 0 7.31 0 3.25 2.67 1.15 6.61l4.13 3.2C6.22 7.02 8.87 5.04 12 5.04z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.27c0-.8-.07-1.56-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.74-2.4 3.58l3.74 2.91c2.18-2.02 3.48-5 3.48-8.73z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.28 14.19c-.24-.72-.37-1.49-.37-2.19 0-.71.13-1.47.37-2.19L1.15 6.61C.42 8.23 0 10.06 0 12s.42 3.77 1.15 5.39l4.13-3.2z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.74-2.91c-1.1.74-2.51 1.18-4.22 1.18-3.13 0-5.78-2.08-6.73-4.88l-4.13 3.2C3.25 21.33 7.31 24 12 24z"
                    fill="#34A853"
                  />
                </svg>
                Continue with Google
              </button>
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
