export default function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="max-w-7xl mx-auto w-full px-6 md:px-8 py-8"
    >
      {/* Section Header */}
      <div className="mb-16">
        <h2
          id="features-title"
          className="text-4xl lg:text-5xl font-black text-surface-on-surface mt-4 md:mt-0 tracking-tighter mb-4"
        >
          Engineered for the Digital Curator.
        </h2>
        <p className="text-surface-variant max-w-2xl text-lg font-medium">
          We stripped away the server. What&apos;s left is pure, unadulterated
          speed and privacy for your most sensitive data assets.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Privacy-first DNA – Large */}
        <div className="md:col-span-8 bg-surface-bright rounded-[2rem] p-10 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-500 overflow-hidden relative shadow-card hover:shadow-card-hover border border-outline-variant/50">
          <div className="z-10">
            <span
              className="material-symbols-outlined text-4xl text-secondary mb-6 block drop-shadow-sm"
              aria-hidden="true"
            >
              shield_lock
            </span>
            <h3 className="text-3xl font-bold text-surface-on-surface mb-4">
              Privacy-first DNA
            </h3>
            <p className="text-surface-variant max-w-md text-lg leading-relaxed font-medium">
              Cryptweb never sees your files. Metadata is encrypted and
              discarded the moment the transfer completes. You hold the keys; we
              just provide the corridor.
            </p>
          </div>
          <div
            aria-hidden="true"
            className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 text-secondary"
          >
            <span className="material-symbols-outlined text-[280px]">
              security
            </span>
          </div>
        </div>

        {/* Real-time sync – Small */}
        <div className="md:col-span-4 bg-surface-bright rounded-[2rem] p-10 group hover:-translate-y-1 transition-all duration-500 shadow-card hover:shadow-card-hover border border-outline-variant/50">
          <span
            className="material-symbols-outlined text-4xl text-primary mb-6 block drop-shadow-sm"
            aria-hidden="true"
          >
            bolt
          </span>
          <h3 className="text-2xl font-bold text-surface-on-surface mb-4">
            Real-time sync
          </h3>
          <p className="text-surface-variant font-medium">
            Watch progress in real-time with pixel-perfect accuracy and zero
            latency overhead.
          </p>
        </div>

        {/* Future: A/V Calling – Small */}
        <div className="md:col-span-4 bg-surface-bright rounded-[2rem] p-10 group hover:-translate-y-1 transition-all duration-500 shadow-card hover:shadow-card-hover border border-outline-variant/50">
          <span
            className="material-symbols-outlined text-4xl text-tertiary mb-6 block drop-shadow-sm"
            aria-hidden="true"
          >
            videocam
          </span>
          <h3 className="text-2xl font-bold text-surface-on-surface mb-3">
            Future: A/V Calling
          </h3>
          <div className="inline-block px-2.5 py-1 rounded-md bg-tertiary-container text-tertiary-on-container text-[11px] font-bold uppercase mb-4 tracking-wider shadow-sm">
            In Development
          </div>
          <p className="text-surface-variant font-medium">
            Encrypted voice and video communication built on the same P2P
            architecture.
          </p>
        </div>

        {/* No Server Footprint – Medium with Terminal */}
        <div className="md:col-span-8 bg-surface-bright rounded-[2rem] p-10 flex flex-col md:flex-row gap-10 items-center group hover:-translate-y-1 transition-all duration-500 shadow-card hover:shadow-card-hover border border-outline-variant/50 overflow-hidden">
          <div className="flex-1">
            <span
              className="material-symbols-outlined text-4xl text-surface-on-surface mb-6 block"
              aria-hidden="true"
            >
              terminal
            </span>
            <h3 className="text-2xl font-bold text-surface-on-surface mb-4">
              No Server Footprint
            </h3>
            <p className="text-surface-variant font-medium">
              Cryptweb never sees your files. Metadata is encrypted and
              discarded the moment the transfer completes. You hold the keys; we
              just provide the corridor.
            </p>
          </div>

          {/* Terminal Snippet */}
          <div className="flex-1 bg-surface-on-surface p-6 rounded-2xl shadow-inner font-mono text-sm text-secondary-container w-full">
            <div className="flex gap-2.5 items-center mb-4 border-b border-surface-variant/30 pb-3">
              <span className="w-3 h-3 rounded-full bg-error shadow-sm hover:brightness-110 cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-tertiary shadow-sm hover:brightness-110 cursor-pointer" />
              <span className="w-3 h-3 rounded-full bg-secondary shadow-sm hover:brightness-110 cursor-pointer" />
            </div>
            <p className="mb-2 flex items-center gap-2">
              <span className="text-primary-container">$</span>
              <span className="text-surface-bright">
                relay create-pipe --peer-id=77x2
              </span>
            </p>
            <p className="mb-3 text-surface-variant text-xs leading-relaxed">
              Cryptweb never sees your files. Metadata is encrypted and
              discarded the moment the transfer completes. You hold the keys; we
              just provide the corridor.
            </p>
            <p className="text-secondary font-bold flex items-center gap-2">
              <span>&gt;</span> [OK] Secure Tunnel Ready
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
