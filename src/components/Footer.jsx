const footerLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Security Audit",
  "GitHub",
];

const socialIcons = ["terminal", "language"];

export default function Footer() {
  return (
    <footer role="contentinfo" className="bg-surface-low w-full py-12 border-t border-outline-variant/60 mt-12 md:mt-0">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto w-full px-6 md:px-12 gap-8">
        {/* Logo & Copyright */}
        <div className="space-y-4 text-center md:text-left">
          <div className="text-surface-on-surface font-black text-xl flex items-center justify-center md:justify-start gap-2 tracking-tighter">
            <span className="material-symbols-outlined text-primary">hub</span>
            Cryptweb
          </div>
          <p className="font-headline text-xs uppercase tracking-widest text-surface-on-variant font-bold">
            © 2026 Relay P2P. The Digital Curator.
          </p>
        </div>

        {/* Links */}
        <nav aria-label="Footer Navigation" className="flex flex-wrap justify-center gap-8 font-headline text-xs uppercase tracking-widest font-bold">
          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-surface-variant hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="flex gap-4" aria-label="Social connections">
          {socialIcons.map((icon) => (
            <a
              key={icon}
              href="#"
              aria-label={`Visit our ${icon === "terminal" ? "API Docs" : "Global Site"}`}
              className="w-10 h-10 rounded-full border border-outline-variant bg-surface flex items-center justify-center text-surface-variant hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">{icon}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
