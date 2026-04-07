import { Link } from "react-router-dom";
import { Button } from "../components/Button.jsx";
import {
  Shield,
  Zap,
  Lock,
  Share2,
  ArrowRight,
  UploadCloud,
  Users,
} from "lucide-react";

export const Product = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col text-gray-900">
      <section
        id="hero"
        className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40 border-b border-gray-100"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            <div className="max-w-3xl lg:w-1/2">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                Secure P2P File Sharing, <br />
                <span className="text-indigo-600">Zero Compromise.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed font-medium">
                Transfer files of any size directly between devices. No central
                servers, no arbitrary limits, and complete end-to-end
                encryption.
              </p>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-12">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    className="px-8 py-4 text-lg w-full flex items-center justify-center gap-2 group shadow-md hover:shadow-lg"
                  >
                    Start Sharing Free{" "}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    className="px-8 py-4 text-lg w-full"
                  >
                    Login to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-xl h-[400px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/50 to-transparent rounded-[3rem] -z-10 transform rotate-3"></div>
                <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-2xl -z-10"></div>

                <div className="w-full flex items-center justify-between px-6 sm:px-12 relative z-10">
                  <div className="w-28 h-36 bg-white border border-gray-100 shadow-lg rounded-2xl flex flex-col items-center justify-center gap-3 relative transform hover:-translate-y-2 transition-transform duration-300">
                    <UploadCloud className="text-gray-400" size={32} />
                    <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
                    <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex-1 relative mx-4">
                    <div className="h-1.5 bg-indigo-100 w-full rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-1/2 animate-pulse rounded-full"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white border border-indigo-100 shadow-xl rounded-full flex items-center justify-center z-20">
                      <Lock className="text-indigo-600" size={24} />
                    </div>
                  </div>

                  <div className="w-28 h-36 bg-white border border-gray-100 shadow-lg rounded-2xl flex flex-col items-center justify-center gap-3 relative transform hover:-translate-y-2 transition-transform duration-300">
                    <Users className="text-gray-400" size={32} />
                    <div className="h-2 w-12 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-24 bg-gray-50 border-b border-gray-100 relative"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              Built for speed, security, and simplicity. Cryptweb is the
              ultimate tool for transferring sensitive data across the wire.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
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
            ].map((feature, i) => (
              <div
                key={i}
                className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)] bg-white p-8 rounded-3xl shadow-sm hover:shadow-md border border-gray-200 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="w-full lg:w-1/2 space-y-10">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                How simple is it?
              </h2>
              <div className="space-y-10">
                {[
                  {
                    title: "Create Account",
                    desc: "Sign up to start sharing files.",
                  },
                  {
                    title: "Connect",
                    desc: "Link with your friend using email.",
                  },
                  {
                    title: "Share Files",
                    desc: "Select and send files directly.",
                  },
                  {
                    title: "Stay Online",
                    desc: "Keep the tab open for transfer.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 bg-indigo-50/50 rounded-3xl aspect-square md:aspect-video lg:aspect-square flex flex-col items-center justify-center border border-indigo-100 shadow-inner p-8 text-center">
              <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center text-indigo-500 mb-6 border border-gray-50">
                <Shield size={40} />
              </div>
              <div className="text-indigo-500 font-bold tracking-widest uppercase text-sm">
                Secure Subsystem Mapping
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="privacy"
        className="py-24 bg-gray-900 text-white border-t-[8px] border-indigo-600"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Unmatched Privacy.
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed font-medium">
              Unlike traditional cloud storage, your files are never retained in
              a centralized server. Cryptweb utilizes WebRTC data channels to
              form a localized sub-network directly between devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Zero-Knowledge Fabric
              </h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                By enforcing strict AES-256-GCM encryption on the client-side
                prior to transit, not even our signaling servers can decrypt
                your handshake metadata.
              </p>
            </div>
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Maximized Bandwidth
              </h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Experience full LAN or WAN speeds un-throttled by intermediary
                relays. If you're on the same local network, transfers happen
                near-instantaneously.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="cta"
        className="py-24 bg-indigo-50 border-b border-indigo-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              Ready to take back control?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 font-medium">
              Join thousands of users transferring files securely every day.
            </p>
            <Link to="/signup">
              <Button
                variant="primary"
                className="px-10 py-5 text-xl font-bold rounded-full shadow-md hover:shadow-lg inline-flex items-center gap-2 group"
              >
                Create Free Account{" "}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer id="footer" className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tight text-gray-900">
            CRYPTWEB<span className="text-indigo-600">.</span>
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
