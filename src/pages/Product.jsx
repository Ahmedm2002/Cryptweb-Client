import { Link } from "react-router-dom";
import { Button } from "../components/commons/Button.jsx";
import {
  Shield,
  Lightning,
  Lock,
  Globe,
  HardDrives,
  ArrowRight,
  ArrowDown,
  Check,
  Upload,
  LinkSimple,
  Download,
} from "phosphor-react";

export const Product = () => {
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900 font-sans">
      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="bg-section-octagon min-h-[calc(100vh-56px)] flex items-center justify-center border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-5">
                Share files directly
                <br />
                <span className="text-[#059669]">without the cloud.</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md mx-auto">
                Send files from your device straight to the recipient's. No
                uploads, no storage, no middlemen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/signup" className="sm:w-auto w-full">
                  <Button
                    variant="primary"
                    className="px-6 py-2.5 text-sm gap-2 group w-full inline-flex items-center justify-center whitespace-nowrap"
                  >
                    Start Sharing
                    <ArrowRight
                      className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform"
                      weight="bold"
                    />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="secondary" className="px-6 py-2.5 text-sm">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-section-white py-20 sm:py-24 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Three steps. That's it.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: <LinkSimple size={20} />,
                  title: "Connect with the recipient",
                  desc: "Share a secure connection link or enter their email.",
                },
                {
                  step: "02",
                  icon: <Upload size={20} weight="bold" />,
                  title: "Choose your files",
                  desc: "Select the files you want to send from your device.",
                },
                {
                  step: "03",
                  icon: <Download size={20} weight="bold" />,
                  title: "Files are transferred",
                  desc: "The recipient receives files directly from your device. Done.",
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="text-[11px] font-bold text-gray-200 mb-3">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="bg-section-octagon py-20 sm:py-24 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
                Why different
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Skip the cloud entirely.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div className="rounded-xl border border-gray-200 p-6 bg-white">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Traditional cloud upload
                </p>
                <div className="space-y-3">
                  {[
                    "Upload to server",
                    "Wait for processing",
                    "Stored on someone else's computer",
                    "Recipient downloads",
                    "You delete it later",
                  ].map((step, i) => (
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

              <div className="rounded-xl border-2 border-[#059669]/20 bg-[#ecfdf5]/30 p-6">
                <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-4">
                  Direct secure transfer
                </p>
                <div className="space-y-3">
                  {[
                    "Select your files",
                    "Connect with recipient",
                    "Files transfer directly",
                    "Done",
                  ].map((step, i) => (
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
            </div>
          </div>
        </section>

        {/* Security Highlight */}
        <section className="bg-section-octagon py-20 sm:py-24 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                Your files stay under your control.
              </h2>
              <p className="text-gray-500 leading-relaxed">
                We built Cryptweb so you never have to trust us with your data.
                Your files are encrypted, transferred directly, and never
                stored.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
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
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center mx-auto mb-3">
                    <Check size={18} weight="bold" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
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
              {[
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
              ].map((benefit, i) => (
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

        {/* CTA */}
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

        {/* Footer */}
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
      </main>
    </div>
  );
};
