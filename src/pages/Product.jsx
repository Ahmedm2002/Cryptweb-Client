import { Link } from "react-router-dom";
import { Button } from "../components/Button.jsx";
import { Shield, Zap, Lock, Share2, UploadCloud, Users } from "lucide-react";

export const Product = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col text-gray-900 font-sans">
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pb-48 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white"></div>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
            Secure P2P File Sharing, <br className="hidden sm:block" />
            <span className="text-indigo-600">Zero Compromise.</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transfer files of any size directly between devices. No central
            servers, no arbitrary limits, and complete end-to-end encryption.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="px-8 py-4 text-lg w-full rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Start Sharing Free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="px-8 py-4 text-lg w-full rounded-full"
              >
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-lg text-gray-600">
              Built for speed, security, and simplicity. Cryptweb is the
              ultimate tool for transferring sensitive data across the wire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: <Shield size={28} />,
                title: "End-to-End Encryption",
                desc: "Every byte transferred is encrypted using industry-leading protocols. Keys never touch our servers.",
              },
              {
                icon: <Zap size={28} />,
                title: "Lightning Fast",
                desc: "Peer-to-peer transfers mean data takes the shortest path between you and the recipient.",
              },
              {
                icon: <Lock size={28} />,
                title: "Complete Privacy",
                desc: "We don't store your files, view your content, or log your transfers. It's direct node-to-node transfer.",
              },
              {
                icon: <Share2 size={28} />,
                title: "No Size Limits",
                desc: "Whether it's a 10MB document or a 100GB video directory, send it without restrictions.",
              },
              {
                icon: <Users size={28} />,
                title: "No Registration Required",
                desc: "Jump right in to send one-off files instantly. Build an account later for transfer history.",
              },
              {
                icon: <UploadCloud size={28} />,
                title: "Pause & Resume",
                desc: "Fluctuating connections won't break your transfer. Pause and resume natively.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow border border-gray-100 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                How simple is it?
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Select your files",
                    desc: "Drag and drop anything securely into your browser.",
                  },
                  {
                    step: "2",
                    title: "Share the link",
                    desc: "We generate a secure, one-time transfer link for your recipient.",
                  },
                  {
                    step: "3",
                    title: "Keep tab open",
                    desc: "Stay connected while your peers download the files directly from your machine.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 bg-indigo-50/50 rounded-[2.5rem] aspect-square sm:aspect-video lg:aspect-square flex flex-col items-center justify-center border border-indigo-100 shadow-inner p-8">
              <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center text-indigo-500 mb-6 border border-gray-50">
                <Shield size={40} />
              </div>
              <div className="text-indigo-400 font-black tracking-widest uppercase text-sm">
                Transfer Subsystem
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-gray-900 text-white px-4 sm:px-6 lg:px-8 border-t-[8px] border-indigo-600">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">
            Unmatched Privacy & Performance
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed">
            Unlike traditional cloud storage, your files are never retained in a
            centralized server. Cryptweb utilizes WebRTC data channels to form a
            localized sub-network directly between devices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left max-w-4xl mx-auto border-t border-gray-800 pt-16">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Zero-Knowledge Fabric
              </h3>
              <p className="text-gray-400 leading-relaxed">
                By enforcing strict AES-256-GCM encryption on the client-side
                prior to transit, not even our signaling servers can decrypt
                your handshake metadata.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Maximized Bandwidth
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Experience full LAN or WAN speeds un-throttled by intermediary
                relays. If you're on the same local network, transfers happen
                near-instantaneously.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Ready to take back control?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of users transferring files securely every day.
          </p>
          <Link to="/signup">
            <Button
              variant="primary"
              className="px-10 py-5 text-xl rounded-full shadow-lg hover:shadow-xl"
            >
              Start Sharing Securely
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-black text-gray-900 tracking-tighter">
            Cryptweb<span className="text-indigo-600">.</span>
          </div>
          <p className="text-gray-500 text-sm">
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
