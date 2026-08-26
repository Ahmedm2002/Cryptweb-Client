import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import Reveal from "../components/marketing/Reveal.jsx";
import {
  Shield,
  Lightning,
  Lock,
  Globe,
  Upload,
  HardDrives,
  ChatText,
  PhoneCall,
  VideoCamera,
  XCircle,
  ArrowsIn,
  WifiHigh,
  EyeSlash,
  ClockCounterClockwise,
} from "phosphor-react";

/* ---- Animated mock widgets (pure CSS, no libraries) --------------------- */

function TransferMock() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span className="flex items-center gap-1.5">
          <Upload size={12} weight="bold" />
          project-files.zip · 842 MB
        </span>
        <span>86%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#059669] rounded-full cw-progress-bar" />
      </div>
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="flex items-center gap-1.5 text-gray-400">
          <Lock size={10} className="text-[#c78b4a]" weight="bold" />
          End-to-end encrypted
        </span>
        <span className="flex items-center gap-1 text-red-400 font-medium">
          <XCircle size={11} />
          Cancel
        </span>
      </div>
    </div>
  );
}

function ChatMock() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5 space-y-2.5">
      <div className="flex justify-start">
        <p className="max-w-[70%] text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-2xl rounded-bl-sm">
          Are you getting the files?
        </p>
      </div>
      <div className="flex justify-end">
        <p className="max-w-[70%] text-xs bg-gray-900 text-white px-3 py-1.5 rounded-2xl rounded-br-sm">
          Yes, almost done — thanks!
        </p>
      </div>
      <div className="flex items-center gap-1 pl-1 pt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 cw-typing-dot"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
        <span className="text-[10px] text-gray-400 ml-1">typing…</span>
      </div>
    </div>
  );
}

function AudioMock() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0 cw-pulse-ring">
          <PhoneCall size={16} weight="bold" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800">Sarah Chen</p>
          <p className="text-[10px] text-[#059669]">Connected · P2P</p>
        </div>
      </div>
      <div className="flex items-end justify-center gap-1 h-8 mt-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <span
            key={i}
            className="w-1 h-full bg-[#059669]/60 rounded-full cw-wave-bar"
            style={{ animationDelay: `${i * 90}ms`, animationDuration: `${900 + (i % 3) * 180}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function VideoMock() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <VideoCamera size={22} className="text-white/40" />
        <span className="absolute top-2 left-2 text-[9px] font-medium text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
          720p · P2P
        </span>
        <div className="absolute bottom-2 right-2 w-14 h-10 bg-gray-700 border border-white/20 rounded flex items-center justify-center">
          <VideoCamera size={12} className="text-white/50" />
        </div>
      </div>
    </div>
  );
}

/* ---- Content ------------------------------------------------------------ */

const CATEGORIES = [
  {
    id: "transfer",
    eyebrow: "File transfer",
    title: "Send any file, to anyone, directly.",
    desc: "Files stream in chunks straight to your recipient's device — no upload step, no storage bill, no waiting for a scan to clear.",
    mock: <TransferMock />,
    features: [
      { icon: <HardDrives size={18} />, title: "No file size limits", desc: "From a 10 KB note to a 10 GB video — the only limit is your connection." },
      { icon: <Lightning size={18} />, title: "Chunked streaming", desc: "Adaptive chunk sizes squeeze out maximum throughput on any network." },
      { icon: <XCircle size={18} />, title: "Cancel anytime", desc: "Stop an outgoing or incoming transfer mid-flight with one click — both sides halt instantly." },
      { icon: <ArrowsIn size={18} />, title: "Integrity verification", desc: "Chunk counts and byte sizes are verified before a download is offered." },
      { icon: <WifiHigh size={18} />, title: "Automatic TURN fallback", desc: "Strict NAT or firewall? Transfers relay securely so the connection still succeeds." },
    ],
  },
  {
    id: "chat",
    eyebrow: "Messaging",
    title: "A private chat line with every session.",
    desc: "Every connection opens an instant messaging channel over the same encrypted tunnel. Talk while you transfer.",
    mock: <ChatMock />,
    features: [
      { icon: <ChatText size={18} />, title: "Real-time delivery", desc: "Messages travel over the data channel — no servers queue them." },
      { icon: <EyeSlash size={18} />, title: "Session-only history", desc: "Close the tab and the conversation is gone. Nothing is persisted anywhere." },
      { icon: <ClockCounterClockwise size={18} />, title: "Unread badges", desc: "Tab title shows 'n unread messages' while you're away and resets when you return." },
      { icon: <Lightning size={18} />, title: "Zero setup", desc: "No threads, no contacts list — chat appears the moment you connect." },
    ],
  },
  {
    id: "calls",
    eyebrow: "Calls",
    title: "Talk face-to-face without a third party.",
    desc: "Audio and video streams are routed peer-to-peer via WebRTC. Ringing, accept, decline — all built in.",
    mock: <AudioMock />,
    features: [
      { icon: <PhoneCall size={18} />, title: "Audio calls", desc: "Low-latency voice with one-tap mute and instant accept/decline." },
      { icon: <VideoCamera size={18} />, title: "HD video calls", desc: "Up to 720p video with live camera on/off toggles." },
      { icon: <Upload size={18} />, title: "Transfer while calling", desc: "Renegotiation lets files keep flowing during active calls." },
      { icon: <XCircle size={18} />, title: "Busy handling", desc: "Already in a call? New callers are automatically declined — no endless ringing." },
    ],
  },
];

const PLATFORM_FEATURES = [
  {
    icon: <Shield size={20} weight="bold" />,
    title: "End-to-end encryption",
    desc: "WebRTC's mandatory DTLS-SRTP encryption protects every byte — files, messages, and call media alike.",
  },
  {
    icon: <Globe size={20} />,
    title: "Runs in your browser",
    desc: "Windows, macOS, Linux, Android, iOS — if it has a modern browser, it works. No installs, no updates.",
  },
  {
    icon: <Lock size={20} weight="bold" />,
    title: "Zero-knowledge by design",
    desc: "We broker the handshake, then step out of the way. There is nothing on our servers to hand over.",
  },
];

export const Features = () => {
  useDocumentTitle("Features");

  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <main className="relative z-10 flex-1">
        {/* Header */}
        <section className="bg-section-octagon pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
              Features
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Everything Cryptweb offers.
            </h1>
            <p className="text-gray-500 leading-relaxed">
              Encrypted file transfers, real-time messaging, and audio &amp;
              video calls — all peer-to-peer, all in your browser.
            </p>
          </div>
        </section>

        {/* Category sections */}
        {CATEGORIES.map((cat, idx) => (
          <section
            key={cat.id}
            className={`py-20 sm:py-24 border-b border-gray-100 ${
              idx % 2 === 0 ? "bg-section-white" : "bg-section-octagon"
            }`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  idx % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <Reveal>
                  <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
                    {cat.eyebrow}
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                    {cat.title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed mb-8">
                    {cat.desc}
                  </p>
                  <ul className="space-y-5">
                    {cat.features.map((feature) => (
                      <li key={feature.title} className="flex gap-3.5">
                        <div className="w-9 h-9 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed mt-0.5">
                            {feature.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal delay={140}>
                  <div className="sticky top-24">{cat.mock}</div>
                </Reveal>
              </div>
            </div>
          </section>
        ))}

        {/* Platform & security strip */}
        <section className="bg-section-octagon py-20 sm:py-24 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="max-w-2xl mx-auto text-center mb-12">
              <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
                Under the hood
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Private by architecture.
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {PLATFORM_FEATURES.map((item, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="h-full bg-white rounded-2xl border border-gray-200 p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                    <div className="w-11 h-11 rounded-xl bg-[#fdf8f0] text-[#c78b4a] flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-section-white py-20 sm:py-24 border-gray-100 border-t">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Reveal>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                No hidden limits.
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Guest users can send up to 1 file per session. Create a free
                account to unlock unlimited sessions, chat, and calls.
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-section-white border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-bold tracking-tight text-gray-900">
            Cryptweb
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Cryptweb. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
