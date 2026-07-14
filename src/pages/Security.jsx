import {
  Shield,
  Lock,
  Server,
  UploadCloud,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/commons/Button.jsx";

export const Security = () => {
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900 font-sans">
      <div className="absolute inset-0 z-0 bg-octagon-grid pointer-events-none" />
      <main className="relative z-10 flex-1">
        <section
          id="security-hero"
          className="overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-32 border-b border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-center mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-5">
                How Cryptweb secures your transfers
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                We believe privacy is a fundamental right. Cryptweb creates a
                secure direct data tunnel, ensuring your files never rest on our
                servers.
              </p>
            </div>
          </div>
        </section>
        <section
          id="architecture"
          className="py-20 bg-gray-50 border-b border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[#6c5ce7] font-bold tracking-wide uppercase text-sm mb-4">
                  <Server size={20} />
                  Architecture
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                  We store metadata. Not your files.
                </h2>
                <p className="text-lg text-gray-600 font-medium mb-6 leading-relaxed">
                  To provide you with a fast, reliable service, Cryptweb
                  utilizes lightweight signaling servers to help devices "find"
                  each other. Think of us as the operator connecting the call.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "No persistent file storage anywhere on our infrastructure.",
                    "Signal metadata is discarded immediately after the handshake.",
                    "Relay servers (TURN) strictly proxy encrypted packets without inspection.",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <CheckCircle
                        className="text-[#6c5ce7] shrink-0 mt-0.5"
                        size={20}
                      />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-md border border-gray-100 relative">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                    <div className="w-10 h-10 bg-[#e8dff5] rounded-full flex items-center justify-center text-[#6c5ce7] mb-2">
                      <UploadCloud size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-600">
                      Sender
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-4 w-full sm:w-auto relative">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#d4c4ed] -z-10" />
                    <div className="w-16 h-16 bg-white border-2 border-[#6c5ce7] rounded-xl flex items-center justify-center text-[#6c5ce7] shadow-md">
                      <Lock size={24} />
                    </div>
                    <span className="text-xs font-bold text-[#6c5ce7] mt-3 whitespace-nowrap bg-white px-2">
                      AES-GCM Tunnel
                    </span>
                  </div>

                  <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                    <div className="w-10 h-10 bg-[#e8dff5] rounded-full flex items-center justify-center text-[#6c5ce7] mb-2">
                      <Shield size={20} />
                    </div>
                    <span className="text-xs font-bold text-[#6c5ce7]">
                      Receiver
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#f5f0fb]/20 to-transparent opacity-50 rounded-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        <section
          id="zero-knowledge"
          className="py-24 bg-[#1c1c28] border-t-[6px] border-[#c78b4a] text-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Zero-Knowledge Verification
              </h2>
              <p className="text-lg text-gray-400 font-medium">
                Every connection establishes a unique cryptographic handshake.
                If data is modified in transit, the transfer instantly
                terminates.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                <EyeOff size={32} className="text-[#c78b4a] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Content Logging
                </h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Your transfer data is logically invisible to our systems. We
                  track bandwidth metrics purely for platform stability.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                <Shield size={32} className="text-[#c78b4a] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  In-Browser Cryptography
                </h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Files are broken into chunks and encrypted locally within your
                  browser using WebCrypto API before transmission.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                <Server size={32} className="text-[#c78b4a] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Direct Connections
                </h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  If the receiver is globally reachable, your transfer occurs
                  directly through WebRTC, maximizing isolation.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="security-cta"
          className="py-24 bg-[#f5f0fb] border-t border-[#e8dff5]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Ready for a secure transfer?
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    className="px-10 py-5 text-xl w-full font-bold rounded-full shadow-md hover:shadow-lg"
                  >
                    Start Sharing Securely
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tight text-gray-900">
            CRYPTWEB<span className="text-[#6c5ce7]">.</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} Cryptweb. Secure file sharing. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
