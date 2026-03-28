const navLinks = ["Features", "Security", "Pricing", "Network"];

export default function Navbar() {
  return (
    <nav aria-label="Main Navigation" className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-2xl shadow-glass transition-all">
      <div className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <a href="/" aria-label="Cryptweb Home" className="text-xl font-black tracking-tighter text-surface-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">hub</span>
          Cryptweb
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center font-headline tracking-tight font-medium">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-surface-variant hover:text-surface-on-surface transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button aria-label="Connect Wallet" className="hidden md:flex p-2 text-surface-variant hover:bg-surface-high/50 rounded-lg transition-all duration-300 cursor-pointer">
            <span className="material-symbols-outlined" aria-hidden="true">
              account_balance_wallet
            </span>
          </button>
          <button aria-label="Get Started with Cryptweb" className="bg-gradient-to-br from-primary to-primary-container text-primary-on-primary shadow-button hover:shadow-button-hover font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
