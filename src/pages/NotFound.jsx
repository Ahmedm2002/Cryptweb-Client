import { Link } from "react-router-dom";
import { Button } from "../components/commons/Button.jsx";
import { ArrowLeft } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="relative h-[calc(100dvh-4rem)] bg-[#FAFBFD] flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-octagon-grid pointer-events-none" />
      <main className="flex-1 flex items-center justify-center px-3 py-4">
        <div className="w-full max-w-sm mx-auto text-center">
          <div className="relative inline-block mb-2 sm:mb-3">
            <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-[#6c5ce7] leading-none select-none">
              404
            </div>
            <div className="absolute -top-2 -right-3 sm:-top-3 sm:-right-4 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-400" />
          </div>

          <div className="w-12 sm:w-16 h-0.5 bg-[#d4c4ed] mx-auto mb-3 sm:mb-4 rounded-full" />

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            Page not found
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium mb-6 sm:mb-8 leading-relaxed max-w-xs mx-auto">
            This page doesn't exist or has been moved. Let's get you back on
            track.
          </p>

          <Link to="/">
            <Button
              className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base inline-flex items-center gap-2"
              variant="primary"
            >
              <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
              Go to Home
            </Button>
          </Link>

          <div className="mt-8 sm:mt-10 flex gap-1.5 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4b4e0]" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4b4e0]" />
          </div>
        </div>
      </main>
    </div>
  );
};
