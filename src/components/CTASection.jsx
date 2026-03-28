export default function CTASection() {
  return (
    <section aria-labelledby="cta-title" className="py-12 md:py-24 relative">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12">
        <div className="bg-surface-bright rounded-[3rem] p-12 md:p-20 text-center border border-outline-variant shadow-floating relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary-container via-primary-container to-tertiary-container opacity-80" />
          <div className="absolute -inset-1 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <h2
            id="cta-title"
            className="text-3xl md:text-5xl font-black text-surface-on-surface mb-8 relative z-10"
          >
            Ready to exit the cloud?
          </h2>

          <p className="text-lg text-surface-variant font-medium max-w-2xl mx-auto mb-12 relative z-10 leading-relaxed">
            Cryptweb uses peer-to-peer technology to move data directly between
            devices. Your files never touch a cloud server, ensuring absolute
            privacy and blistering speeds.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 relative z-10">
            <button
              aria-label="Start your free account"
              className="bg-gradient-to-br from-primary to-primary-container text-primary-on-primary shadow-button hover:shadow-button-hover font-black px-12 py-5 rounded-2xl active:scale-95 transition-all duration-300 text-lg cursor-pointer"
            >
              Get Started Free
            </button>
            <button
              aria-label="Read Cryptweb Documentation"
              className="bg-surface-low border-2 border-outline-variant text-surface-on-surface font-bold px-12 py-5 rounded-2xl hover:bg-surface-container hover:border-outline transition-all duration-300 text-lg cursor-pointer"
            >
              Read Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
