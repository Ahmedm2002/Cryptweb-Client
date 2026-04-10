import React from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VerificationBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-500">
      <AlertCircle className="w-5 h-5 text-amber-600" />
      <p className="text-sm font-medium text-amber-800">
        Your email is not verified.{" "}
        <button
          onClick={() => navigate("/verify-email")}
          className="underline hover:text-amber-900 font-bold"
        >
          Verify Now
        </button>
      </p>
    </div>
  );
};

export default VerificationBanner;
