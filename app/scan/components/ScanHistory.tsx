import Image from "next/image";
import { GRADE_COLORS, type Grade } from "../lib/scoring";

export type HistoryEntry = {
  barcode: string;
  name: string;
  brand: string;
  image: string | null;
  score: number;
  grade: Grade;
  scannedAt: number;
};

type Props = {
  entries: HistoryEntry[];
  onSelect: (barcode: string) => void;
};

export default function ScanHistory({ entries, onSelect }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="font-display text-xl tracking-wide text-foreground">
        Recent Scans
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {entries.map((entry) => {
          const color = GRADE_COLORS[entry.grade];
          return (
            <button
              key={`${entry.barcode}-${entry.scannedAt}`}
              type="button"
              onClick={() => onSelect(entry.barcode)}
              className="gorilla-card flex flex-col items-center gap-2 rounded-sm p-3 text-center transition-transform hover:scale-[1.03]"
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-sm border border-line bg-background">
                {entry.image ? (
                  <Image src={entry.image} alt={entry.name} width={56} height={56} unoptimized className="h-full w-full object-contain" />
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
    </div>
  );
}
