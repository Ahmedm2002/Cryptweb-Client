import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";

export const VerifyEmail = () => {
  const { user, verifyEmail, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email] = useState(user?.email || location.state?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [otpSent, setOtpSent] = useState(location.state?.otpSent ?? false);
  const [sendingCode, setSendingCode] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    } else if (user?.verified_at != null) {
      navigate("/home");
    }
  }, [email, navigate]);

  const handleSendOtp = async () => {
    setSendingCode(true);
    setError(null);
    try {
      const res = await resendVerificationEmail(email);
      if (res && res.success !== false) {
        setOtpSent(true);
      } else {
        setError(res?.message || "Failed to send verification code.");
      }
    } catch (err) {
      setError("An unexpected error occurred while sending code.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      return setError("Please enter the 6-digit code");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await verifyEmail(email, code);
      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login", { state: { email } }), 3000);
      } else {
        setError(
          res?.message ||
            "Verification failed. The code may be incorrect or expired.",
        );
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex-col">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
        {success ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Email Verified!
            </h2>
            <p className="text-gray-500">
              Your email has been verified successfully.
            </p>
            <p className="text-sm text-gray-400 italic">
              Redirecting to login...
            </p>
          </div>
        ) : !otpSent ? (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Verify your email
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              A 6-digit verification code will be sent to{" "}
              <span className="font-semibold text-gray-800">{email}</span>.
              Click the button below to send it.
            </p>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-4 rounded-xl text-left">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full py-4 text-lg"
              disabled={sendingCode}
              onClick={handleSendOtp}
            >
              {sendingCode ? "Sending..." : "Send OTP & Verify"}
            </Button>
            <div className="mt-6">
              <Link
                to="/home"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Enter OTP
            </h2>
            <p className="text-gray-500 text-sm">
              We sent a 6-digit verification code to{" "}
              <span className="font-semibold text-gray-800">{email}</span>
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-4 rounded-xl text-left">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="text-left">
                  <label
                    htmlFor="code"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all sm:text-lg tracking-widest text-center"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full flex justify-center py-3 text-[15px]"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>

            <div className="text-sm text-center mt-8 space-y-4">
              <div>
                <span className="text-gray-500">Didn't receive a code? </span>
                <button
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors bg-transparent border-none cursor-pointer p-0"
                  disabled={sendingCode}
                  onClick={handleSendOtp}
                >
                  {sendingCode ? "Sending..." : "Resend"}
                </button>
              </div>
              <div>
                <Link
                  to="/home"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
