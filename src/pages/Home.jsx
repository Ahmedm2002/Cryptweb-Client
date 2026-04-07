import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Banner } from "../components/Banner";
import { Popup } from "../components/Popup";
import { Button } from "../components/Button";

export const Home = () => {
  const { user } = useAuth();
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  const isVerified = user?.verified !== false;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {!isVerified && (
          <Banner
            text="Your account is not verified. Please verify your email to unlock all features."
            buttonText="Verify Now"
            onClick={() => setShowVerifyPopup(true)}
          />
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Dashboard
            </h1>
            <p className="text-lg text-gray-500 mb-10">
              Welcome to your secure file sharing workspace.
            </p>

            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No active transfers
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm">
                Drop a file here or click to select one from your device to
                begin secure sharing.
              </p>
              <Button variant="primary" className="px-8 py-3 text-lg">
                Select File
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showVerifyPopup && (
        <Popup onClose={() => setShowVerifyPopup(false)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              Verify Email
            </h2>
            <p className="text-gray-600 mb-8">
              A verification link has been sent to your email address.
            </p>
            <Button
              variant="primary"
              className="w-full py-4 text-lg"
              onClick={() => setShowVerifyPopup(false)}
            >
              Got it
            </Button>
          </div>
        </Popup>
      )}
    </div>
  );
};
