import { Shield, Lock, Server, UploadCloud, EyeOff, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button.jsx";

export const Security = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans">
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-white"></div>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
              How Cryptweb secures your transfers
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              We believe privacy is a fundamental right. Cryptweb creates a secure peer-to-peer data tunnel, ensuring your files never rest on our servers.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-indigo-600 font-bold tracking-wide uppercase text-sm mb-4">
                <Server size={20} />
                Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                We store metadata. Not your files.
              </h2>
              <p className="text-lg text-gray-600 font-medium mb-6 leading-relaxed">
                To provide you with a fast, reliable service, Cryptweb utilizes lightweight signaling servers to help devices "find" each other. Think of us as the operator connecting the call.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "No persistent file storage anywhere on our infrastructure.",
                  "Signal metadata is discarded immediately after the handshake.",
                  "Relay servers (TURN) strictly proxy encrypted packets without inspection."
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-gray-700">
                    <CheckCircle className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-200 relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                    <UploadCloud size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-600">Sender</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center px-4 w-full sm:w-auto relative">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-indigo-200 -z-10" />
                  <div className="w-16 h-16 bg-white border-2 border-indigo-500 rounded-xl flex items-center justify-center text-indigo-600 shadow-md">
                    <Lock size={24} />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 mt-3 whitespace-nowrap bg-white px-2">AES-GCM Tunnel</span>
                </div>

                <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                    <Shield size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-600">Receiver</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white to-transparent opacity-50 rounded-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 border-t-8 border-indigo-600 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Zero-Knowledge Verification
            </h2>
            <p className="text-lg text-gray-400 font-medium">
              Every connection establishes a unique cryptographic handshake. If data is modified in transit, the transfer instantly terminates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
              <EyeOff size={32} className="text-indigo-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Content Logging</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Your transfer data is logically invisible to our systems. We track bandwidth metrics purely for platform stability.
              </p>
            </div>
             <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
              <Shield size={32} className="text-indigo-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">In-Browser Cryptography</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Files are broken into chunks and encrypted locally within your browser using WebCrypto API before transmission.
              </p>
            </div>
             <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
              <Server size={32} className="text-indigo-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Direct Connections</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                If the receiver is globally reachable, your transfer occurs directly through WebRTC, maximizing isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-indigo-50 border-t border-indigo-100 flex-grow px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Ready for a secure transfer?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/">
               <Button variant="primary" className="px-8 py-4 text-lg w-full sm:w-auto font-bold">Start Sharing</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
