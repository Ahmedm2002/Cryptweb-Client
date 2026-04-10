import React from "react";
import { ShieldCheck } from "lucide-react";

const IncomingRequest = ({ request, onRespond }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-gray-100">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Connection Request
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              <span className="font-semibold text-indigo-600">
                {request.fromName || request.from}
              </span>{" "}
              wants to connect with you.
            </p>
          </div>
          <div className="flex w-full gap-3 mt-4">
            <button
              onClick={() => onRespond(request.from, false)}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => onRespond(request.from, true)}
              className="flex-1 py-3 px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingRequest;
