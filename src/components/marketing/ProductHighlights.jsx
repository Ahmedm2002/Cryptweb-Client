import { Link } from "react-router-dom";
import { Button } from "../commons/Button.jsx";
import {
  Shield,
  Lightning,
  Lock,
  Globe,
  HardDrives,
  ArrowRight,
  Check,
  Upload,
} from "phosphor-react";

const CONTROL_POINTS = [
  {
    title: "Encrypted in transit",
    desc: "Files are encrypted before they leave your device.",
  },
  {
    title: "No cloud storage",
    desc: "Nothing is saved on our servers after the transfer.",
  },
  {
    title: "Both must be online",
    desc: "Transfers only happen when sender and receiver are connected.",
  },
  {
    title: "You're in control",
    desc: "Cancel anytime. Close the tab, and the transfer stops.",
  },
];

export function SecurityHighlight() {
  return (
    <section className="bg-section-white py-20 sm:py-24 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Your files stay under your control.
          </h2>
          <p className="text-gray-500 leading-relaxed">
            We built Cryptweb so you never have to trust us with your data.
            Your files are encrypted, transferred directly, and never stored.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {CONTROL_POINTS.map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#fdf8f0] text-[#c78b4a] flex items-center justify-center mx-auto mb-3">
                <Check size={18} weight="bold" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const BENEFITS = [
  {
    icon: <Lightning size={20} weight="bold" />,
    desc: "Lightning-fast transfers with optimized peer-to-peer technology.",
  },
  {
    icon: <Lock size={20} weight="bold" />,
    desc: "End-to-end encryption from sender to receiver.",
  },
  {
    icon: <HardDrives size={20} weight="bold" />,
    desc: "No file size limits — share files of any size.",
  },
  {
    icon: <Globe size={20} />,
    desc: "Cross-platform support for Windows, macOS, Linux, Android, and iOS.",
  },
  {
    icon: <Upload size={20} weight="bold" />,
    desc: "Direct device-to-device transfers, no central servers.",
  },
  {
    icon: <Shield size={20} weight="bold" />,
    desc: "Reliable transfers with integrity verification and recovery.",
  },
];

export function Benefits() {
  return (
    <section className="bg-section-white py-20 sm:py-24 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
            Benefits
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Everything you need for secure file sharing.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((benefit, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl border border-gray-200 p-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                {benefit.icon}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed pt-1.5">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/features">
            <Button
              variant="secondary"
              className="px-5 py-2 text-sm gap-1.5 group inline-flex items-center justify-center whitespace-nowrap"
            >
              View all features
              <ArrowRight
                className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform"
                weight="bold"
              />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ProductCta() {
  return (
    <section className="bg-section-octagon py-20 sm:py-24 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
          Ready to share files securely?
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Create a free account and start transferring files directly. No
          credit card required.
        </p>
        <Link to="/signup">
          <Button
            variant="primary"
            className="px-6 py-2.5 text-sm gap-2 group inline-flex items-center justify-center whitespace-nowrap"
          >
            Start Sharing
            <ArrowRight
              className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform"
              weight="bold"
            />
          </Button>
        </Link>
      </div>
    </section>
  );
}
