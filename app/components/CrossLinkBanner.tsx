export default function CrossLinkBanner() {
  return (
    <section className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-14 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-sm tracking-[0.3em] text-gold">
            PART OF THE GORILLA ECOSYSTEM
          </p>
          <h3 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
            Train hard. <span className="text-gold">Fuel harder.</span>
          </h3>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Gorilla Fuel handles what goes in your body — Gorilla Sports handles
            everything you do with it. Gear, programs, and community at
            gorillasports.ca.
          </p>
        </div>
        <a
          href="https://gorillasports.ca"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-sm bg-gold px-7 py-4 font-display text-lg tracking-widest text-background transition-transform hover:scale-105"
        >
          Visit Gorilla Sports ↗
        </a>
      </div>
    </section>
  );
}
