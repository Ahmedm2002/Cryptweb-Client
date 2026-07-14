import { Shield, Zap, Lock, Share2, Globe, Monitor } from "lucide-react";

export const Features = () => {
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <div className="absolute inset-0 z-0 bg-octagon-grid pointer-events-none" />
      <main className="relative z-10 flex-1">
        <section className="overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-32 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-center mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-5">
                Everything Cryptweb Offers
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Built for speed, security, and simplicity. No cloud uploads, no
                file size caps, no compromises.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield size={28} />,
                  title: "End-to-End Encryption",
                  desc: "Every byte transferred is encrypted using AES-256-GCM. Keys are generated in your browser and never touch our servers.",
                },
                {
                  icon: <Zap size={28} />,
                  title: "Lightning Fast",
                  desc: "Peer-to-peer WebRTC connections mean data takes the shortest path between you and the recipient with no intermediary slowdown.",
                },
                {
                  icon: <Lock size={28} />,
                  title: "Complete Privacy",
                  desc: "We don't store your files, view your content, or log your transfers. Signaling metadata is discarded after connection.",
                },
                {
                  icon: <Share2 size={28} />,
                  title: "No File Size Limits",
                  desc: "Whether it's a 10 MB document or a 100 GB video, send it without restrictions. Only your device's memory matters.",
                },
                {
                  icon: <Globe size={28} />,
                  title: "Global Reach",
                  desc: "Connect with anyone worldwide. WebRTC with TURN fallback ensures connectivity even behind restrictive firewalls.",
                },
                {
                  icon: <Monitor size={28} />,
                  title: "In-Browser Only",
                  desc: "No apps to install. No accounts required for basic use. Works entirely in your browser with no background processes.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-[#f5f0fb] text-[#6c5ce7] rounded-2xl flex items-center justify-center mb-6">
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

        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              No hidden limits. No subscriptions.
            </h2>
            <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
              Guest users can send up to 1 file. Create a free account to send
              up to 5 files in a session with additional perks.
            </p>
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
