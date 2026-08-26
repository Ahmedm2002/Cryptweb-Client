import { Shield, Lock, Check } from "phosphor-react";

export function SecurityHero() {
  return (
    <section className="bg-section-octagon overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
          Your data stays under your control.
        </h1>
        <p className="text-gray-500 leading-relaxed">
          We built Cryptweb so you never have to trust us with your data. Your
          files, messages, and calls are encrypted end-to-end, transferred
          directly between devices, and never stored.
        </p>
      </div>
    </section>
  );
}

const PRIVACY_POINTS = [
  "Files are encrypted before they leave your device",
  "Messages and call streams never touch a server",
  "Only the recipient can decrypt and view the files",
  "Nothing is stored on our servers after the session ends",
  "If either party goes offline, the session stops — no copies remain",
];

function TunnelDiagram() {
  return (
    <div className="bg-white p-8 sm:p-10 rounded-xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center">
          <div className="w-9 h-9 bg-[#ecfdf5] rounded-full flex items-center justify-center text-[#059669] mb-1.5">
            <Shield size={18} weight="bold" />
          </div>
          <span className="text-[11px] font-medium text-gray-600">Sender</span>
        </div>

        <div className="flex-1 flex flex-col items-center px-4 w-full sm:w-auto relative">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200" />
          <div className="w-12 h-12 bg-white border-2 border-[#c78b4a] rounded-lg flex items-center justify-center text-[#c78b4a] shadow-sm">
            <Lock size={18} weight="bold" />
          </div>
          <span className="text-[11px] font-medium text-[#c78b4a] mt-2 whitespace-nowrap bg-white px-1.5">
            Encrypted tunnel
          </span>
        </div>

        <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center">
          <div className="w-9 h-9 bg-[#fdf8f0] rounded-full flex items-center justify-center text-[#c78b4a] mb-1.5">
            <Shield size={18} weight="bold" />
          </div>
          <span className="text-[11px] font-medium text-[#c78b4a]">
            Receiver
          </span>
        </div>
      </div>
    </div>
  );
}

export function HowFilesStayPrivate() {
  return (
    <section className="bg-section-white py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#c78b4a] uppercase tracking-wider mb-2">
            How files stay private
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Direct transfers. No middlemen.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-gray-500 leading-relaxed mb-6">
              When you share through Cryptweb — files, messages, or a call —
              everything travels directly from your device to the recipient's.
              We never see, store, or have access to your data at any point.
            </p>
            <ul className="space-y-3">
              {PRIVACY_POINTS.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <Check
                    className="text-[#c78b4a] shrink-0 mt-0.5"
                    size={16}
                    weight="bold"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <TunnelDiagram />
        </div>
      </div>
    </section>
  );
}

const NO_STORAGE_POINTS = [
  {
    title: "No server copies",
    desc: "Files never rest on our infrastructure. They move directly between devices.",
  },
  {
    title: "No data collection",
    desc: "We don't scan, index, or analyze your files. We don't know what you're sharing.",
  },
  {
    title: "No third-party access",
    desc: "Since we don't have your files, no one can request them from us — including governments.",
  },
];

export function NoStorage() {
  return (
    <section className="bg-section-octagon py-20 sm:py-24 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold text-[#c78b4a] uppercase tracking-wider mb-2">
            No storage
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Why we don't store your files.
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Most file sharing services upload your files to their servers and
            store them there. That creates risk — servers get breached,
            companies shut down, data gets sold.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {NO_STORAGE_POINTS.map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[#fdf8f0] text-[#c78b4a] flex items-center justify-center mx-auto mb-3">
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
  );
}
