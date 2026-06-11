import Image from "next/image";

export type HistoryEntry = {
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  score: number;
  /** Hex colour for the score chip — pulled from whichever grade-colour map produced this entry's grade. */
  color: string;
  scannedAt: number;
};

type Props = {
  entries: HistoryEntry[];
  onSelect: (barcode: string) => void;
  onClear?: () => void;
};

export default function ScanHistory({ entries, onSelect, onClear }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="font-display text-xl tracking-wide text-foreground">
        Recent Scans
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {entries.map((entry) => {
          const color = entry.color;
          return (
            <button
              key={`${entry.barcode}-${entry.scannedAt}`}
              type="button"
              onClick={() => onSelect(entry.barcode)}
              className="gorilla-card flex flex-col items-center gap-2 rounded-sm p-3 text-center transition-transform hover:scale-[1.03]"
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-sm border border-line bg-background">
                {entry.image ? (
                  <Image src={entry.image} alt={entry.name} width={56} height={56} unoptimized loading="lazy" className="h-full w-full object-contain" />
                ) : (
                  <span className="font-display text-lg text-gold/40">G</span>
                )}
              </div>
              <p className="line-clamp-2 text-xs leading-tight text-foreground">{entry.name}</p>
              <span
                className="rounded-sm border px-2 py-0.5 font-display text-xs tracking-[0.15em]"
                style={{ borderColor: color, color }}
              >
                {entry.score}
              </span>
            </button>
          );
        })}
      </div>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-sm border border-line px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:border-red-500/60 hover:text-red-400"
        >
          Clear History
        </button>
      )}
    </div>
  );
}
