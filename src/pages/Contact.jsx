import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <div className="absolute inset-0 z-0 bg-octagon-grid pointer-events-none" />
      <main className="relative z-10 flex-1">
        <section className="overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-32 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-center mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-5">
                Get in Touch
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Have a question, suggestion, or issue? We'd love to hear from
                you.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <div className="w-12 h-12 bg-[#f5f0fb] text-[#6c5ce7] rounded-2xl flex items-center justify-center mb-4">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Email
                  </h3>
                  <p className="text-gray-600 font-medium">
                    hello@cryptweb.dev
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-[#f5f0fb] text-[#6c5ce7] rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Response Time
                  </h3>
                  <p className="text-gray-600 font-medium">
                    We typically respond within 24 hours.
                  </p>
                </div>
              </div>

              <div>
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-600 font-medium text-sm">
                      We'll get back to you as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                    <textarea
                      placeholder="Your message"
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
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
