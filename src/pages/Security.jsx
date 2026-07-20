import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { Shield, Lock, Check } from "phosphor-react";
import { Link } from "react-router-dom";
import { Button } from "../components/commons/Button.jsx";

export const Security = () => {
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <useDocumentTitle title="Security" />
      <main className="relative z-10 flex-1">
        {/* Header */}
        <section className="bg-section-octagon overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Your files stay under your control.
            </h1>
            <p className="text-gray-500 leading-relaxed">
              We built Cryptweb so you never have to trust us with your data.
              Your files are encrypted, transferred directly, and never stored.
            </p>
          </div>
        </section>

        {/* How it works */}
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
                  When you send a file through Cryptweb, it travels directly
                  from your device to the recipient's device. We never see,
                  store, or have access to your files at any point during the
                  transfer.
                </p>
                <ul className="space-y-3">
                  {[
                    "Files are encrypted before they leave your device",
                    "Only the recipient can decrypt and view the files",
                    "Nothing is stored on our servers after the transfer ends",
                    "If either party goes offline, the transfer stops — no copies remain",
                  ].map((item, i) => (
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

              <div className="bg-white p-8 sm:p-10 rounded-xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center">
                    <div className="w-9 h-9 bg-[#ecfdf5] rounded-full flex items-center justify-center text-[#059669] mb-1.5">
                      <Shield size={18} weight="bold" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-600">
                      Sender
                    </span>
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
            </div>
          </div>
        </section>

        {/* Why we don't store files */}
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
                Most file sharing services upload your files to their servers
                and store them there. That creates risk — servers get breached,
                companies shut down, data gets sold.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
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
              ].map((item, i) => (
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

        {/* What happens after transfer */}
        <section className="bg-section-white py-20 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold text-[#c78b4a] uppercase tracking-wider mb-2">
                After transfer
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                What happens when the transfer ends?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Both users go offline
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The connection closes. No files are stored anywhere. If the
                  transfer was incomplete, you'd need to start again.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  You close the browser tab
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The connection closes immediately. Any in-progress transfer
                  stops. Nothing is cached or saved on our end.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Transfer completes successfully
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The recipient has the file on their device. We have nothing.
                  The file exists only where the recipient saved it.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Network interruption
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The transfer pauses. If the connection returns, it resumes. If
                  not, nothing is stored — you start fresh when ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-section-octagon py-20 sm:py-24 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Frequently asked questions
              </h2>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {[
                {
                  q: "Can you see my files?",
                  a: "No. Your files are encrypted on your device before they're sent. We never have access to the decryption keys, so even if we wanted to, we couldn't read your files.",
                },
                {
                  q: "What if I lose my connection during a transfer?",
                  a: "The transfer pauses. If the connection comes back, it resumes. If not, nothing is stored — you start a new transfer when you're ready.",
                },
                {
                  q: "Are my files stored anywhere after the transfer?",
                  a: "No. Once the transfer is complete, we have nothing. The files exist only on the recipient's device.",
                },
                {
                  q: "Do you log what files are transferred?",
                  a: "We keep minimal transfer metadata (who sent to whom, when, file size) for your transfer history. We don't log file names, contents, or types.",
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                    {faq.q}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-section-white py-20 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Ready to transfer securely?
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start sending files directly — no account required for basic use.
            </p>
            <Link to="/">
              <Button variant="primary" className="px-6 py-2.5 text-sm">
                Start Sharing
              </Button>
            </Link>
          </div>
        </section>
      </main>

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
    </div>
  );
};
