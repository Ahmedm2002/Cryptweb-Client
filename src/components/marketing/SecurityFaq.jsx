import { Link } from "react-router-dom";
import { Button } from "../commons/Button.jsx";

const AFTER_TRANSFER_CASES = [
  {
    title: "Both users go offline",
    desc: "The connection closes. No files are stored anywhere. If the transfer was incomplete, you'd need to start again.",
  },
  {
    title: "You close the browser tab",
    desc: "The connection closes immediately. Any in-progress transfer stops. Nothing is cached or saved on our end.",
  },
  {
    title: "Transfer completes successfully",
    desc: "The recipient has the file on their device. We have nothing. The file exists only where the recipient saved it.",
  },
  {
    title: "Network interruption",
    desc: "The transfer pauses. If the connection returns, it resumes. If not, nothing is stored — you start fresh when ready.",
  },
];

export function AfterTransfer() {
  return (
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
          {AFTER_TRANSFER_CASES.map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-xl border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {item.title}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
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
];

export function SecurityFaq() {
  return (
    <section className="bg-section-octagon py-20 sm:py-24 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Frequently asked questions
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                {faq.q}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SecurityCta() {
  return (
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
  );
}
