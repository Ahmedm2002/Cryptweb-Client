import heroVisual from "../assets/hero-visual.png";

const stats = [
  { title: "No server uploads.", description: "Direct pipe transfer." },
  { title: "No storage.", description: "Ephemeral sessions." },
  { title: "No limits.", description: "Any size, anywhere." },
];

export default function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="max-w-7xl mx-auto w-full px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[819px]">
      <div className="lg:col-span-7 space-y-8 z-10 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-high border border-outline-variant shadow-sm" role="status" aria-live="polite">
          <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]" aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-widest text-surface-variant font-semibold">
            Network Status: Live
          </span>
        </div>

        <h1 id="hero-title" className="text-6xl md:text-8xl font-black tracking-tighter text-surface-on-surface leading-[1.05]">
          Secure, instant <br />
          <span className="text-gradient">file sharing.</span>
        </h1>

        <div className="grid grid-cols-3 gap-4 border-l-2 border-primary-container pl-6">
          {stats.map((stat, i) => (
            <div
              key={stat.title}
              className={`space-y-1 ${i > 0 ? "border-l border-outline-variant pl-4" : ""}`}
            >
              <p className="text-surface-on-surface font-bold text-xl">
                {stat.title}
              </p>
              <p className="text-surface-variant text-sm font-medium">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xl text-surface-variant max-w-xl leading-relaxed font-medium">
          Cryptweb uses peer-to-peer technology to move data directly between
          devices. Your files never touch a cloud server, ensuring absolute
          privacy and blistering speeds.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <button aria-label="Start your first secure transfer now" className="bg-gradient-to-br from-primary to-primary-container text-primary-on-primary shadow-button hover:shadow-button-hover font-extrabold px-8 py-4 rounded-xl flex items-center gap-2 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            Start Transfer Now
            <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </button>
          <button aria-label="Log in to your Curator portal" className="bg-surface border-2 border-outline-variant text-surface-on-surface font-bold px-8 py-4 rounded-xl hover:bg-surface-low hover:border-outline shadow-sm transition-all duration-300 cursor-pointer">
            Login to Curator
          </button>
        </div>
      </div>

      <div className="lg:col-span-5 relative mt-16 lg:mt-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[80px] -z-10" />

        <div className="relative bg-white/40 backdrop-blur-3xl rounded-3xl p-2 border border-white/60 shadow-glass">
          <div className="rounded-2xl overflow-hidden border border-outline-variant/50 shadow-inner bg-surface-low">
            <img
              src={heroVisual}
              alt="Digital visualization of peer-to-peer data nodes securely linking together"
              className="w-full aspect-square object-cover opacity-95 scale-105"
            />
          </div>

          <div aria-hidden="true" className="absolute -bottom-8 -left-8 bg-surface-bright p-5 rounded-2xl border border-outline-variant shadow-floating animate-bounce-slow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary-on-container shadow-inner">
                <span className="material-symbols-outlined text-[28px]">
                  speed
                </span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-surface-variant font-bold mb-1">
                  Transfer Speed
                </p>
                <p className="text-xl font-mono text-surface-on-surface font-bold">
                  842 MB/s
                </p>
              </div>
            </div>
          </div>

          <div aria-hidden="true" className="absolute top-8 -right-8 bg-surface-bright p-5 rounded-2xl border border-outline-variant shadow-floating">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary-on-container shadow-inner">
                <span className="material-symbols-outlined text-[28px]">
                  lock
                </span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-surface-variant font-bold mb-1">
                  Encryption
                </p>
                <p className="text-xl font-mono text-surface-on-surface font-bold">
                  AES-256
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
