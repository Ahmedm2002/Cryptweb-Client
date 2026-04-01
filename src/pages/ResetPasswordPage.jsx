import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackRequest } = useApi();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get("t");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword || !token) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const { promise } = api.post("/password/reset", {
        token,
        password,
        confirmPassword,
      });
      await trackRequest({ promise, abort: () => {} });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Password updated successfully. Please login." },
        });
      }, 3000);
    } catch (err) {
      if (err.isCanceled) return;
      setError(err.message || "An error occurred resetting your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6 bg-background text-on-surface overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="flex flex-row items-baseline mb-4 text-center mx-auto justify-center">
          <div className="w-10 h-10 mb-4 bg-primary text-white rounded-xl flex items-center justify-center shadow-user">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black mx-1 tracking-tighter text-on-surface font-headline">
            New Password
          </h1>
        </div>

        <div className="bg-surface/80 backdrop-blur-2xl border border-outline-variant rounded-2xl p-8 shadow-card">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-on-surface mb-1">
              Set New Password
            </h2>
            <p className="text-surface-variant text-sm">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-error-container text-error rounded-md text-sm flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 bg-secondary/20 text-secondary rounded-md text-sm flex items-start gap-2 mb-4 border border-secondary/30">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Password updated! Redirecting...</span>
              </div>
            )}

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest text-surface-variant mb-2 ml-1"
                htmlFor="password"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-variant" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest text-surface-variant mb-2 ml-1"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-variant" />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3.5 rounded-lg text-sm shadow-button hover:shadow-button-hover active:scale-[0.98] transition-all flex justify-center items-center text-white disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-surface-variant text-sm">
            Ready to log in?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
