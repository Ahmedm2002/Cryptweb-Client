import { Link } from "react-router-dom";
import { Envelope } from "phosphor-react";
import { Seo } from "../components/commons/Seo.jsx";

export const Contact = () => {
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <Seo title="Contact" description="Get in touch with the Cryptweb team. Have a question, suggestion, or issue? We'd love to hear from you." />
      <main className="relative z-10 flex-1">
        {/* Header */}
        <section className="bg-section-octagon overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
              Contact
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Get in touch.
            </h1>
            <p className="text-gray-500 leading-relaxed">
              Have a question, suggestion, or issue? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact info */}
        <section className="bg-section-white py-20 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 p-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#ecfdf5] text-[#059669] rounded-lg flex items-center justify-center shrink-0">
                    <Envelope size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      Email us
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      For general questions, feedback, or support:
                    </p>
                    <a
                      href="mailto:hello@cryptweb.dev"
                      className="text-sm font-medium text-[#059669] hover:text-[#047857] transition-colors"
                    >
                      hello@cryptweb.dev
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                    Expected response time
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We typically respond within 24 hours. For urgent issues
                    related to active transfers, please include "URGENT" in your
                    subject line.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                    Bug reports
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    If you've encountered a bug, please include:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-500">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-300 mt-1">-</span>
                      What you were trying to do
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-300 mt-1">-</span>
                      What happened instead
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-300 mt-1">-</span>
                      Your browser and device (e.g., Chrome on macOS)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                    Feature requests
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Have an idea for how we can improve? We're always listening.
                    Drop us an email with your suggestion — we read every one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-section-octagon py-20 sm:py-24 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Common questions
              </h2>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {[
                {
                  q: "Is Cryptweb free?",
                  a: "Yes. Basic file sharing is free and doesn't require an account. We offer paid plans for users who need more features like larger transfer limits.",
                },
                {
                  q: "Do I need to install anything?",
                  a: "No. Cryptweb works entirely in your web browser. No downloads, no plugins, no extensions required.",
                },
                {
                  q: "What's the maximum file size?",
                  a: "There's no artificial limit from our side. The only constraints are your device's memory and your internet connection speed.",
                },
                {
                  q: "Can I use Cryptweb on my phone?",
                  a: "Yes. Cryptweb works on any modern mobile browser. No app needed.",
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
