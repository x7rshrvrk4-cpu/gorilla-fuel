export default function CrossLinkBanner() {
  return (
    <section className="border-t border-line bg-surface">
      <a
        href="https://gorillasports.ca"
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-12 text-center transition-colors hover:bg-surface-2"
      >
        <h3 className="font-display text-3xl text-foreground sm:text-4xl">
          Train hard. <span className="text-gold">Fuel harder.</span> Bet sharper.
        </h3>
        <p className="font-display text-lg tracking-[0.3em] text-gold">
          MLB · NBA · NFL
        </p>
        <p className="text-sm text-muted">
          Plus Fantasy Football and the Gorilla Sports NFL Draft Simulator
        </p>
        <p className="font-display text-xl tracking-widest text-gold">
          gorillasports.ca 🦍
        </p>
      </a>
    </section>
  );
}
