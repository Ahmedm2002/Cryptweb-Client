import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { trackRequest } = useApi();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const { promise } = api.post("/auth/login", { email, password });
      const data = await trackRequest({ promise, abort: () => {} });

      login(data.data.user, data.data.accessToken);
      navigate("/home");
    } catch (err) {
      if (err.isCanceled) return;
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6 bg-background text-on-surface overflow-hidden">
      {/* Background visual artifacts */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[5%] -right-[5%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="flex flex-row items-baseline mb-4 text-center mx-auto justify-center">
          <div className="w-10 h-10 mb-4 bg-primary text-white rounded-xl flex items-center justify-center shadow-user">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black mx-1 tracking-tighter text-on-surface font-headline">
            CryptWeb
          </h1>
        </div>
        <div className="bg-surface/80 backdrop-blur-2xl border border-outline-variant rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-error-container text-error rounded-md text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest text-surface-variant mb-2 ml-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-variant" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="name@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-surface-variant"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-tighter"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-variant" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3.5 rounded-lg text-sm shadow-button hover:shadow-button-hover active:scale-[0.98] transition-all flex justify-center items-center text-white"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Sign In to CryptWeb"
                )}
              </button>
            </div>
          </form>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-surface-variant font-bold">
              OR EMAIL
            </span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>
          <button className="w-full flex items-center justify-center gap-3 bg-surface-container hover:bg-surface-container-high transition-colors py-3 px-4 rounded-lg text-sm font-medium border border-outline-variant mb-6 group text-on-surface">
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

          <p className="mt-8 text-center text-surface-variant text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
