import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { api } from "../services/api";

const SignupPage = () => {
  const navigate = useNavigate();
  const { trackRequest } = useApi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { promise } = api.post("/auth/signup", { name, email, password });
      await trackRequest({ promise, abort: () => {} });

      // On success, redirect to login page.
      // We can use navigate state to show a success message on the login screen,
      // though typically users just see the login screen.
      navigate("/login", {
        state: { message: "Account created successfully. Please login." },
      });
    } catch (err) {
      if (err.isCanceled) return;
      setError(err.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 w-full min-h-screen flex items-center justify-center p-6 bg-background text-on-surface overflow-hidden">
      {/* Background visual artifacts */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]"></div>
      </div>
      <div className="fixed inset-0 z-[-1] opacity-5">
        <img
          src="/assets/signup_screen.png"
          alt="Abstract background"
          className="w-full h-full object-cover mix-blend-overlay grayscale transform -scale-x-100" // Flipped horizontally for visual variance
        />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Branding header */}
        <div className="flex flex-row items-center mb-10 text-center">
          <div className="w-12 h-12 mb-4 bg-primary text-white rounded-xl flex items-center justify-center shadow-user">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface font-headline">
            Join CryptWeb
          </h1>
          <p className="text-surface-variant text-sm mt-2 tracking-wide font-medium uppercase">
            Create Your Account
          </p>
        </div>

        {/* Auth Card using light theme */}
        <div className="bg-surface/80 backdrop-blur-2xl border border-outline-variant rounded-2xl p-8 shadow-card">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-on-surface mb-1">
              Get Started
            </h2>
            <p className="text-surface-variant text-sm">
              Enter your details to create an account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-error-container text-error rounded-md text-sm flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest text-surface-variant mb-2 ml-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-variant" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest text-surface-variant mb-2 ml-1"
                htmlFor="password"
              >
                Password
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
                  disabled={loading}
                />
              </div>
              <p className="text-[10px] text-surface-variant mt-2 ml-1">
                Must be at least 6 characters.
              </p>
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
                  "Sign Up for CryptWeb"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-surface-variant text-sm">
            Already have an account?{" "}
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

export default SignupPage;
