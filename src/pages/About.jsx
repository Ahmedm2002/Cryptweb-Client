import { ArrowRight } from "phosphor-react";
import { Link } from "react-router-dom";
import { Button } from "../components/commons/Button.jsx";

export const About = () => {
  return (
    <div className="relative min-h-screen bg-[#FAFBFD] flex flex-col text-gray-900">
      <main className="relative z-10 flex-1">
        {/* Header */}
        <section className="bg-section-octagon overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
              About
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              The problem with file sharing today.
            </h1>
            <p className="text-gray-500 leading-relaxed">
              Sharing files online shouldn't mean giving up control of your data.
              But that's exactly what most services ask you to do.
            </p>
          </div>
        </section>

        {/* The problem */}
        <section className="bg-section-white py-20 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-6">
                Here's what typically happens when you share a file online:
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed">
                <p>
                  You upload a file to a cloud service. It sits on their servers —
                  sometimes for days, sometimes forever. The company can access it,
                  scan it, or in worst cases, lose it in a breach.
                </p>
                <p>
                  You send a link to the recipient. They download it. Now there
                  are three copies: yours, theirs, and the one on the server.
                  You have to remember to delete the original. Most people don't.
                </p>
                <p>
                  Meanwhile, you've trusted a company you've never met with your
                  most personal or sensitive files. Terms of service change.
                  Companies shut down. Data gets repurposed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The solution */}
        <section className="bg-section-octagon py-20 sm:py-24 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-6">
                What if files never left your device?
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed">
                <p>
                  Cryptweb takes a different approach. Instead of uploading files
                  to a server, we connect your device directly to the
                  recipient's device. The file travels from point A to point B,
                  encrypted the entire way. Nothing sits on our servers.
                </p>
                <p>
                  Think of it like a phone call — both people need to be on the
                  line for the conversation to happen. When the call ends, there's
                  no recording, no transcript, no data stored. The conversation
                  happened, and that's it.
                </p>
                <p>
                  That's how file sharing should work. Private, direct, and
                  temporary. Your files, your device, your control.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-section-white py-20 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
                What we believe
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                Simple principles.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  Privacy is the default
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We don't ask you to trust us. The technology makes it
                  impossible for us to access your files, even if we wanted to.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  Honesty over hype
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  No misleading claims, no hidden data collection, no bait-and-switch
                  pricing. What you see is what we do.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  For everyone
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Basic file sharing should be free. No account required. We
                  offer paid features for people who need more, but the core
                  experience is available to anyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-section-octagon py-20 sm:py-24 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Try it yourself.
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Send a file directly to someone. No account needed for basic use.
            </p>
            <Link to="/signup">
              <Button
                variant="primary"
                className="px-6 py-2.5 text-sm gap-2 group inline-flex items-center justify-center whitespace-nowrap"
              >
                Get Started
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" weight="bold" />
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
        </div>
      </footer>
    </div>
  );
};
