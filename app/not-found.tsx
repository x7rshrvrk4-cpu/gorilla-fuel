import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-24 text-center">
      <p className="font-display text-7xl text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
        This page wandered off the trail.
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist — but the scanner,
        the rankings, and 50,000+ scored products are all still here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-sm bg-gold px-7 py-3 font-display text-lg tracking-widest text-background transition-transform hover:scale-105"
        >
          Back to Home
        </Link>
        <Link
          href="/scan"
          className="rounded-sm border border-gold px-7 py-3 font-display text-lg tracking-widest text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Open the Scanner
        </Link>
      </div>
    </div>
  );
}
