import { Shield, Users, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/commons/Button.jsx";

export const About = () => {
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <div className="absolute inset-0 z-0 bg-octagon-grid pointer-events-none" />
      <main className="relative z-10 flex-1">
        <section className="overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-32 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-center mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-5">
                About Cryptweb
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                We believe secure file transfer should be simple, private, and
                accessible to everyone — no strings attached.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-600 font-medium leading-relaxed text-lg">
                  Cryptweb was built to solve a simple problem: transferring
                  files between devices should be as private as handing them
                  over in person. Most cloud services store your data on their
                  servers, creating risk and trust dependencies. We eliminate
                  the server from the data path entirely.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                  <Shield size={28} className="text-[#6c5ce7] mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Privacy First
                  </h3>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">
                    Zero-knowledge architecture means we literally cannot access
                    your files even if we wanted to.
                  </p>
                </div>
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                  <Heart size={28} className="text-[#6c5ce7] mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Open & Honest
                  </h3>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">
                    No hidden data collection, no tracking scripts, no selling
                    of user data. What you see is what we do.
                  </p>
                </div>
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                  <Users size={28} className="text-[#6c5ce7] mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    For Everyone
                  </h3>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">
                    Free to use for guests, with affordable upgrades for power
                    users who need more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Start transferring securely
            </h2>
            <Link to="/signup">
              <Button
                variant="primary"
                className="px-10 py-5 text-xl font-bold rounded-full shadow-md hover:shadow-lg inline-flex items-center gap-2 group"
              >
                Get Started{" "}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tight text-gray-900">
            CRYPTWEB<span className="text-[#6c5ce7]">.</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} Cryptweb. Secure file sharing.
          </p>
        </div>
      </footer>
    </div>
  );
};
