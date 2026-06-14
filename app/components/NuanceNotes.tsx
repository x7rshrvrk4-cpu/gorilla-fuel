import type { NuanceNote } from "../scan/lib/nuanceNotes";

/**
 * Understated "honest asterisk" display for nuance notes — deliberately quiet,
 * styled like the existing caveat patterns (FLAGS list / audienceTag pill), not
 * alarming. Renders nothing when there are no notes. Pure presentational, no
 * hooks, so it works in both server (ProductResultCard) and client trees
 * (EnergyProductCard).
 */
export default function NuanceNotes({
  notes,
  className = "",
}: {
  notes: NuanceNote[];
  className?: string;
}) {
  if (notes.length === 0) return null;
  return (
    <div className={`space-y-1.5 ${className}`}>
      {notes.map((note) => (
        <p
          key={note.id}
          className="flex gap-2 rounded-sm border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-[11px] leading-relaxed text-slate-400"
        >
          <span className="mt-px shrink-0 text-slate-500" aria-hidden>
            ⓘ
          </span>
          <span>
            <span className="font-display uppercase tracking-[0.12em] text-slate-300">Nuance — </span>
            {note.text}
          </span>
        </p>
      ))}
    </div>
  );
}
