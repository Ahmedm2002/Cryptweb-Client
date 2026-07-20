import {
  Shield,
  Lightning,
  Lock,
  Globe,
  Upload,
  HardDrives,
} from "phosphor-react";

const FeaturePlaceholder = ({ variant = "default" }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
      <div className="w-2 h-2 rounded-full bg-gray-200" />
      <div className="w-2 h-2 rounded-full bg-gray-200" />
      <div className="w-2 h-2 rounded-full bg-gray-200" />
    </div>
    <div className="space-y-3">
      {variant === "upload" ? (
        <>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <Upload
              size={24}
              className="mx-auto text-gray-300 mb-2"
              weight="bold"
            />
            <p className="text-xs text-gray-400">Drop files here</p>
          </div>
        </>
      ) : variant === "progress" ? (
        <>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Transferring...</span>
            <span>78%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#059669] rounded-full"
              style={{ width: "78%" }}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock size={10} className="text-[#c78b4a]" weight="bold" />
            <span>Encrypted</span>
          </div>
        </>
      ) : variant === "complete" ? (
        <>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Shield size={16} weight="bold" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">
                Transfer complete
              </p>
              <p className="text-[11px] text-gray-400">
                design-v3.pdf delivered
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-8 bg-[#059669]/10 rounded-lg mt-4" />
        </>
      )}
    </div>
  </div>
);

export const Features = () => {
  const features = [
    {
      icon: <Lightning size={20} />,
      title: "Lightning-fast transfers",
      desc: "Without intermediary servers slowing things down, your files move as fast as your connection allows. Small files transfer in seconds. Large files complete in minutes.",
      placeholder: "progress",
    },
    {
      icon: <Shield size={20} weight="bold" />,
      title: "No permanent cloud storage",
      desc: "Your files never rest on someone else's server. They travel from your device to the recipient's, and that's it. No copies are stored anywhere else.",
      placeholder: "upload",
    },
    {
      icon: <Lock size={20} weight="bold" />,
      title: "Encrypted from start to finish",
      desc: "Every file is encrypted before it leaves your device and can only be decrypted by the intended recipient. Even we can't see what's being transferred.",
      placeholder: "default",
    },
    {
      icon: <Globe size={20} />,
      title: "Works across any device",
      desc: "No app to install. No software to update. Open your browser, and you're ready to send or receive files from any modern device with an internet connection.",
      placeholder: "complete",
    },
    {
      icon: <HardDrives size={20} />,
      title: "Supports large files",
      desc: "Send files of any size. Whether it's a 10 MB document or a 10 GB video, there are no artificial limits. The only constraint is your device's available memory.",
      placeholder: "progress",
    },
    {
      icon: <Upload size={20} weight="bold" />,
      title: "Simple to use",
      desc: "No complicated setup. No account required for basic use. Choose your files, connect with the recipient, and you're done. It really is that simple.",
      placeholder: "upload",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <main className="relative z-10 flex-1">
        {/* Header */}
        <section className="bg-section-octagon pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
              Features
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Everything Cryptweb offers.
            </h1>
            <p className="text-gray-500 leading-relaxed">
              Built for speed, security, and simplicity. No cloud uploads, no
              file size caps, no compromises.
            </p>
          </div>
        </section>
        <section className="bg-section-white py-20 sm:py-24 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-14">
              <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
                Why Cryptweb
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Built for speed, security, and simplicity.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Lightning size={22} weight="bold" />,
                  title: "Lightning-Fast Transfers",
                  desc: "Say goodbye to waiting. Files move directly between devices at the full speed of your connection — no intermediary servers to slow things down. Small files transfer in a blink, and even large files complete in minutes, not hours.",
                },
                {
                  icon: <Lock size={22} weight="bold" />,
                  title: "End-to-End Encryption",
                  desc: "Every file is encrypted on your device before transmission and can only be decrypted by the intended recipient. Your data stays completely private throughout the entire transfer — even we can't access it.",
                },
                {
                  icon: <HardDrives size={22} weight="bold" />,
                  title: "No File Size Limits",
                  desc: "Forget arbitrary caps and compression. Whether you're sharing a 10 MB document or a 10 GB video file, there are no restrictions. The only practical limit is your device's available memory.",
                },
                {
                  icon: <Globe size={22} />,
                  title: "Cross-Platform Support",
                  desc: "No app to install, no software to update. Cryptweb works entirely in your browser on any device — Windows, macOS, Linux, Android, or iOS. Share files seamlessly across platforms without compatibility issues.",
                },
                {
                  icon: <Upload size={22} weight="bold" />,
                  title: "Direct Device-to-Device",
                  desc: "Your files travel straight from your device to the recipient's — no detours through cloud servers. This means no copies are stored elsewhere, no third parties have access, and your data stays exactly where you want it.",
                },
                {
                  icon: <Shield size={22} weight="bold" />,
                  title: "Reliable & Secure",
                  desc: "Built-in integrity verification ensures every byte arrives intact. If a transfer is interrupted, automatic recovery kicks in to resume where it left off. Your files arrive safe, complete, and uncompromised.",
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-3xl border border-gray-200 p-7 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA */}
        <section className="bg-section-octagon py-20 sm:py-24 border-gray-100 border-t">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
              No hidden limits.
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Guest users can send up to 1 file. Create a free account to send
              up to 5 files per session with additional features.
            </p>
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
