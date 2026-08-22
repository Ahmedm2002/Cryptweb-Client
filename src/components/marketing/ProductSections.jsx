import { Link } from "react-router-dom";
import { Button } from "../commons/Button.jsx";
import Reveal from "./Reveal.jsx";
import {
  ArrowRight,
  ArrowDown,
  Check,
  Upload,
  Download,
  FileArrowUp,
  ChatText,
  PhoneCall,
  VideoCamera,
  Lock,
} from "phosphor-react";

/* Animated hero chips — pure CSS float, no libraries */
const HERO_CHIPS = [
  { icon: <FileArrowUp size={18} weight="bold" />, label: "Files", pos: "left-[4%] top-[16%]", anim: "cw-float" },
  { icon: <ChatText size={18} weight="bold" />, label: "Chat", pos: "right-[6%] top-[10%]", anim: "cw-float-slow" },
  { icon: <PhoneCall size={18} weight="bold" />, label: "Audio", pos: "left-[8%] bottom-[14%]", anim: "cw-float-slow" },
  { icon: <VideoCamera size={18} weight="bold" />, label: "Video", pos: "right-[4%] bottom-[18%]", anim: "cw-float" },
];

export function ProductHero() {
  return (
    <section className="bg-section-octagon relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-gray-100">
      {/* Floating feature chips (hidden on small screens) */}
      {HERO_CHIPS.map((chip) => (
        <div
          key={chip.label}
          aria-hidden="true"
          className={`hidden md:flex absolute ${chip.pos} ${chip.anim} items-center gap-2 bg-white border border-gray-200 rounded-full pl-2 pr-3.5 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]`}
        >
          <span className="w-7 h-7 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
            {chip.icon}
          </span>
          <span className="text-xs font-semibold text-gray-700">{chip.label}</span>
        </div>
      ))}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] cw-pulse-ring" />
            <span className="text-[11px] font-medium text-gray-600">
              Peer-to-peer · End-to-end encrypted
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-5">
            Files, messages & calls.
            <br />
            <span className="text-[#059669]">Device to device.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md mx-auto">
            Transfer files, chat in real time, and make audio or video calls —
            all directly between devices. No uploads, no cloud storage, no
            middlemen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="sm:w-auto w-full">
              <Button
                variant="primary"
                className="px-6 py-2.5 text-sm gap-2 group w-full inline-flex items-center justify-center whitespace-nowrap"
              >
                Start Free
                <ArrowRight
                  className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform"
                  weight="bold"
                />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="secondary" className="px-6 py-2.5 text-sm">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Stats band */}
          <dl className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-12">
            {[
              ["E2E", "Encrypted"],
              ["∞", "File size"],
              ["P2P", "No servers"],
            ].map(([value, label]) => (
              <Reveal key={label} delay={150} as="div">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block text-xl sm:text-2xl font-bold text-gray-900">
                    {value}
                  </span>
                  <span className="block text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider">
                    {label}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    icon: <Upload size={22} weight="bold" />,
    title: "Encrypted File Transfer",
    desc: "Send files of any size straight to your recipient's device with live progress, integrity checks, and one-click cancel.",
    points: ["No size limits", "Live progress & cancel", "Nothing stored"],
  },
  {
    icon: <ChatText size={22} weight="bold" />,
    title: "Real-time Messaging",
    desc: "A private chat channel opens with every connection. Messages travel over the same encrypted tunnel and vanish when the session ends.",
    points: ["Instant delivery", "Session-scoped history", "Unread badges"],
  },
  {
    icon: <PhoneCall size={22} weight="bold" />,
    title: "Audio Calls",
    desc: "Crystal-clear voice calls routed directly between browsers. Your conversation never touches a server.",
    points: ["Low latency", "Mute controls", "One-tap accept/decline"],
  },
  {
    icon: <VideoCamera size={22} weight="bold" />,
    title: "Video Calls",
    desc: "Switch to face-to-face in a tap. Video streams peer-to-peer at up to 720p while the file transfer keeps running.",
    points: ["HD 720p streams", "Camera toggle", "Works during transfers"],
  },
];

export function FeaturePillars() {
  return (
    <section className="bg-section-white py-20 sm:py-24 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
            One connection, four tools
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            More than file sharing.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 80}>
              <div className="group h-full bg-white rounded-2xl border border-gray-200 p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  {pillar.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  {pillar.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {pillar.desc}
                </p>
                <ul className="space-y-1.5">
                  {pillar.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <Check size={12} className="text-[#059669] shrink-0" weight="bold" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    step: "01",
    icon: <LinkSimpleIcon />,
    title: "Connect securely",
    desc: "Enter your recipient's email. They accept, and an encrypted peer-to-peer tunnel opens between you.",
  },
  {
    step: "02",
    icon: <Upload size={20} weight="bold" />,
    title: "Send anything",
    desc: "Drop files into the chat, type messages, or start an audio/video call — all over the same tunnel.",
  },
  {
    step: "03",
    icon: <Download size={20} weight="bold" />,
    title: "Done, nothing left",
    desc: "Files land directly on their device. Close the tab and everything is gone — no copies anywhere.",
  },
];

function LinkSimpleIcon() {
  return <Lock size={20} weight="bold" />;
}

export function HowItWorks() {
  return (
    <section className="bg-section-octagon py-20 sm:py-24 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Three steps. That's it.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((item, i) => (
            <Reveal key={item.step} delay={i * 100} className="relative">
              <div className="text-[11px] font-bold text-gray-200 mb-3">
                {item.step}
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const CLOUD_STEPS = [
  "Upload to server",
  "Wait for processing",
  "Stored on someone else's computer",
  "Recipient downloads",
  "You delete it later",
];

const DIRECT_STEPS = [
  "Connect with recipient",
  "Send files, messages & calls directly",
  "Everything stays end-to-end encrypted",
  "Close tab — nothing remains",
];

export function Comparison() {
  return (
    <section className="bg-section-white py-20 sm:py-24 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
            Why different
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Skip the cloud entirely.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <Reveal>
            <div className="rounded-xl border border-gray-200 p-6 bg-white h-full">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Traditional cloud upload
              </p>
              <div className="space-y-3">
                {CLOUD_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-500"
                  >
                    <ArrowDown size={14} className="text-gray-300 shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-xl border-2 border-[#059669]/20 bg-[#ecfdf5]/30 p-6 h-full">
              <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-4">
                Direct secure transfer
              </p>
              <div className="space-y-3">
                {DIRECT_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-700 font-medium"
                  >
                    <Check size={14} className="text-[#059669] shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
