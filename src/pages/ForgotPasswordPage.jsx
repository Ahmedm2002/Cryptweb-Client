import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

const ForgotPasswordPage = () => {
  const { trackRequest } = useApi();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { promise } = api.post("/password/forgot", { email });
      await trackRequest({ promise, abort: () => {} });
      setSuccess(true);
    } catch (err) {
      if (err.isCanceled) return;
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6 bg-background text-on-surface overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="flex flex-row items-baseline mb-4 text-center mx-auto justify-center">
          <div className="w-10 h-10 mb-4 bg-primary text-white rounded-xl flex items-center justify-center shadow-user">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black mx-1 tracking-tighter text-on-surface font-headline">
            Recover
          </h1>
        </div>

        <div className="bg-surface/80 backdrop-blur-2xl border border-outline-variant rounded-2xl p-8 shadow-card">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-on-surface mb-1">
              Reset Password
            </h2>
            <p className="text-surface-variant text-sm">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-error-container text-error rounded-md text-sm flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success ? (
              <div className="p-5 bg-secondary/10 text-center rounded-xl border border-secondary/20">
                <h3 className="font-bold text-secondary mb-2">Email Sent!</h3>
                <p className="text-sm text-surface-variant">
                  We've sent a password reset link to <span className="font-medium text-on-surface">{email}</span>. Please check your inbox.
                </p>
              </div>
            ) : (
              <>
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

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3.5 rounded-lg text-sm shadow-button hover:shadow-button-hover active:scale-[0.98] transition-all flex justify-center items-center text-white"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-surface-variant text-sm">
            Remember your password?{" "}
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

export default ForgotPasswordPage;
