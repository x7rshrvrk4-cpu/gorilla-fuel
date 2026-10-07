import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadBarlow } from "@remotion/google-fonts/Barlow";

const { fontFamily: DISPLAY } = loadArchivo("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: BODY } = loadBarlow("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const INK = "#0b0b0c";
const PANEL2 = "#1f1f23";
const LINE = "#2d2d31";
const TEXT = "#f4f2ec";
const MUTED = "#908d86";
const GOLD = "#e8b23a";
const GOOD = "#64cf86";
const BAD = "#e0644f";

type Row = { score: number; color: string; name: string; why: string };

const CLEAN: Row[] = [
  { score: 100, color: GOOD, name: "Badger Mineral 40 Sport", why: "Zinc oxide, sunflower oil, beeswax. Nothing flagged." },
  { score: 92, color: GOOD, name: "Blue Lizard Sensitive", why: "Mineral formula. Only minor: a PEG compound." },
  { score: 82, color: GOLD, name: "CeraVe Mineral SPF 50", why: "Mineral. Minor: PEG & phenoxyethanol." },
];
const FLAGGED: Row[] = [
  { score: 56, color: BAD, name: "Banana Boat Sport Ultra 30", why: "Fragrance, PEG, triethanolamine." },
  { score: 40, color: BAD, name: "Hawaiian Tropic Sheer Touch", why: "Parfum, methylparaben, octocrylene." },
];

export const BeautyCompare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const rise = (delay: number, dist = 26) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120, mass: 0.85 } });
    return { opacity: Math.max(0, Math.min(1, s)), transform: `translateY(${interpolate(s, [0, 1], [dist, 0])}px)` };
  };
  const pop = (delay: number) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 170, mass: 0.6 } });
    return { opacity: Math.max(0, Math.min(1, s)), transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})` };
  };

  const bgScale = interpolate(frame, [0, durationInFrames], [1.05, 1.16]);

  const rowCard = (r: Row, delay: number) => (
    <div
      key={r.name}
      style={{
        display: "flex", alignItems: "center", gap: 22, background: PANEL2,
        border: `1px solid ${LINE}`, borderRadius: 22, padding: "20px 28px", marginBottom: 16, ...pop(delay),
      }}
    >
      <div
        style={{
          width: 84, height: 84, flex: "none", borderRadius: 16, border: `3px solid ${r.color}`,
          color: r.color, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40, fontWeight: 700, fontVariantNumeric: "tabular-nums",
        }}
      >
        {r.score}
      </div>
      <div>
        <div style={{ fontSize: 37, fontWeight: 700, lineHeight: 1.1, color: TEXT }}>{r.name}</div>
        <div style={{ fontSize: 23, color: MUTED, marginTop: 6, lineHeight: 1.25 }}>{r.why}</div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: INK, fontFamily: BODY }}>
      <AbsoluteFill
        style={{ transform: `scale(${bgScale})`, background: `radial-gradient(120% 55% at 50% 0%, ${GOLD}22 0%, ${GOLD}08 28%, transparent 60%)` }}
      />
      <AbsoluteFill style={{ padding: "110px 86px", display: "flex", flexDirection: "column" }}>
        {/* brand bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, ...rise(0) }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>🦍</div>
          <div style={{ fontWeight: 700, letterSpacing: 10, fontSize: 36, color: GOLD }}>GORILLA FUEL</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "flex-end", height: 48, opacity: 0.5 }}>
            {[60, 100, 42, 85, 55, 100, 38, 72, 90, 50].map((h, i) => (
              <div key={i} style={{ width: 6, height: `${h}%`, background: TEXT }} />
            ))}
          </div>
        </div>

        {/* eyebrow + headline */}
        <div style={{ marginTop: 48, fontWeight: 700, letterSpacing: 7, textTransform: "uppercase", fontSize: 28, color: MUTED, ...rise(6) }}>
          Beauty · Sunscreen cheat sheet
        </div>
        <div style={{ marginTop: 14, fontFamily: DISPLAY, fontSize: 104, lineHeight: 0.96, letterSpacing: -1, ...rise(12, 34) }}>
          <span style={{ color: TEXT }}>CLEAN </span>
          <span style={{ color: MUTED, fontSize: 62 }}>vs.</span>
          <br />
          <span style={{ color: GOLD }}>FLAGGED</span>
        </div>

        {/* CLEAN section */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, ...rise(28) }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: `${GOOD}22`, border: `2px solid ${GOOD}66`, color: GOOD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700 }}>✓</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 44, color: GOOD }}>CLEAN</div>
            <div style={{ marginLeft: "auto", fontSize: 23, color: MUTED, fontWeight: 600 }}>mineral · nothing concerning</div>
          </div>
          {CLEAN.map((r, i) => rowCard(r, 40 + i * 10))}
        </div>

        {/* FLAGGED section */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, ...rise(74) }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: `${BAD}22`, border: `2px solid ${BAD}66`, color: BAD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700 }}>⚠</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 44, color: BAD }}>FLAGGED</div>
            <div style={{ marginLeft: "auto", fontSize: 23, color: MUTED, fontWeight: 600 }}>check the label first</div>
          </div>
          {FLAGGED.map((r, i) => rowCard(r, 86 + i * 10))}
        </div>

        <div style={{ flex: 1, minHeight: 20 }} />

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, background: GOLD, borderRadius: 22, padding: "30px 40px", ...rise(110) }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 38, color: INK, lineHeight: 1.05 }}>See your sunscreen&apos;s score</div>
          <div style={{ marginLeft: "auto", fontSize: 34, fontWeight: 700, color: INK }}>gorillafuel.ca/beauty</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
