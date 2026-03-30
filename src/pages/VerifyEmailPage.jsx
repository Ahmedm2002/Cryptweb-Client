import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, KeyRound, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackRequest } = useApi();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we passed email from signup via state, populate it
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !code) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const { promise } = api.post("/verify/email", { email, code });
      await trackRequest({ promise, abort: () => {} });

      setSuccess("Email successfully verified. You can now login.");
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Email verified successfully." },
        });
      }, 2000);
    } catch (err) {
      if (err.isCanceled) return;
      setError(err.message || "An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email to resend code.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const { promise } = api.post("/verify/resend", { email });
      await trackRequest({ promise, abort: () => {} });
      setSuccess("Verification code sent to your email.");
    } catch (err) {
      if (err.isCanceled) return;
      setError(err.message || "An error occurred resending the code.");
    }
  };

  return (
    <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6 bg-background text-on-surface overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="flex flex-row items-baseline mb-4 text-center mx-auto justify-center">
          <div className="w-10 h-10 mb-4 bg-primary text-white rounded-xl flex items-center justify-center shadow-user">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black mx-1 tracking-tighter text-on-surface font-headline">
            Verify Email
          </h1>
        </div>

        <div className="bg-surface/80 backdrop-blur-2xl border border-outline-variant rounded-2xl p-8 shadow-card">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-on-surface mb-1">
              Check Your Inbox
            </h2>
            <p className="text-surface-variant text-sm">
              Enter the verification code sent to your email.
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
                <span>{success}</span>
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
              <label
                className="block text-xs font-bold uppercase tracking-widest text-surface-variant mb-2 ml-1"
                htmlFor="code"
              >
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-variant" />
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Enter token"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3.5 rounded-lg text-sm shadow-button hover:shadow-button-hover active:scale-[0.98] transition-all flex justify-center items-center text-white"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify Account"
                )}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="w-full bg-transparent hover:bg-surface-container text-primary font-bold py-3.5 rounded-lg text-sm border border-outline-variant transition-all flex justify-center items-center"
              >
                Resend Code
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

export default VerifyEmailPage;
