import { Link } from "react-router-dom";

export function MarketingFooter() {
  return (
    <footer className="bg-section-white border-t border-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-lg font-bold tracking-tight text-gray-900">
          Cryptweb
        </div>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Cryptweb. All rights reserved.
        </p>
        <div className="flex gap-5">
          <Link
            to="#"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Privacy
          </Link>
          <Link
            to="#"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
