import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadBarlow } from "@remotion/google-fonts/Barlow";
import type { ReelProps } from "./schema";

// Limit to the weights/subset actually used so each render makes a handful of
// font requests, not 50+ (matters for the recurring unattended cadence).
const { fontFamily: DISPLAY } = loadArchivo("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: BODY } = loadBarlow("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const INK = "#0b0b0c";
const PANEL = "#17171a";
const PANEL2 = "#1f1f23";
const LINE = "#2d2d31";
const TEXT = "#f4f2ec";
const MUTED = "#908d86";
const GOOD = "#64cf86";

const scoreColor = (s: number, gold: string) => (s >= 90 ? GOOD : s >= 78 ? gold : MUTED);

export const GorillaReel: React.FC<ReelProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const rise = (delay: number, dist = 26) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120, mass: 0.85 } });
    return { opacity: Math.max(0, Math.min(1, s)), transform: `translateY(${interpolate(s, [0, 1], [dist, 0])}px)` };
  };
  const pop = (delay: number) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } });
    return { opacity: Math.max(0, Math.min(1, s)), transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})` };
  };
  const countUp = (target: number, start: number, dur = 26) =>
    Math.round(interpolate(frame, [start, start + dur], [0, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const bgScale = interpolate(frame, [0, durationInFrames], [1.05, 1.16]);
  const gold = p.accent;

  return (
    <AbsoluteFill style={{ backgroundColor: INK, fontFamily: BODY }}>
      {/* ambient glow */}
      <AbsoluteFill
        style={{
          transform: `scale(${bgScale})`,
          background: `radial-gradient(120% 60% at 50% 0%, ${gold}22 0%, ${gold}08 28%, transparent 60%)`,
        }}
      />

      <AbsoluteFill style={{ padding: "120px 96px", display: "flex", flexDirection: "column" }}>
        {/* brand bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, ...rise(0) }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>
            🦍
          </div>
          <div style={{ fontFamily: BODY, fontWeight: 700, letterSpacing: 10, fontSize: 36, color: gold }}>GORILLA FUEL</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "flex-end", height: 48, opacity: 0.5 }}>
            {[60, 100, 42, 85, 55, 100, 38, 72, 90, 50].map((h, i) => (
              <div key={i} style={{ width: 6, height: `${h}%`, background: TEXT }} />
            ))}
          </div>
        </div>

        {/* kicker */}
        <div style={{ marginTop: 70, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", fontSize: 32, color: MUTED, ...rise(6) }}>
          {p.topicTag}
        </div>

        {/* headline */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column" }}>
          {p.headline.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: DISPLAY,
                fontSize: 122,
                lineHeight: 0.96,
                letterSpacing: -2,
                color: p.goldLines?.includes(i) ? gold : TEXT,
                ...rise(12 + i * 5, 34),
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* sub */}
        <div style={{ marginTop: 34, fontSize: 42, lineHeight: 1.34, color: MUTED, maxWidth: 760, ...rise(30) }}>
          {p.sub}
        </div>

        {/* flexible push */}
        <div style={{ flex: 1, minHeight: 40 }} />

        {/* visual: pills */}
        {p.pills && p.pills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
            {p.pills.map((pill, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: PANEL2,
                  border: `1px solid ${LINE}`,
                  borderRadius: 999,
                  padding: "12px 26px 12px 12px",
                  fontSize: 36,
                  fontWeight: 600,
                  color: TEXT,
                  ...pop(52 + i * 7),
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 12,
                    border: `3px solid ${scoreColor(pill.score, gold)}`,
                    color: scoreColor(pill.score, gold),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {pill.score}
                </div>
                {pill.name}
              </div>
            ))}
          </div>
        )}

        {/* visual: reco card */}
        {p.reco && (
          <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 22, padding: "30px 32px", display: "flex", flexDirection: "column", gap: 18, ...rise(76) }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
              <div style={{ fontSize: 46, fontWeight: 700, color: TEXT }}>{p.reco.name}</div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 26,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: GOOD,
                  border: `2px solid ${GOOD}80`,
                  background: `${GOOD}1a`,
                  borderRadius: 10,
                  padding: "8px 16px",
                  whiteSpace: "nowrap",
                }}
              >
                {p.reco.tag}
              </div>
            </div>
            <div style={{ display: "flex", gap: 44, fontSize: 36, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
              <span><b style={{ color: TEXT }}>{countUp(p.reco.kcal, 82)}</b> kcal</span>
              <span><b style={{ color: TEXT }}>{countUp(p.reco.protein, 82)}g</b> protein</span>
            </div>
          </div>
        )}

        {/* visual: big stat */}
        {p.bigStat && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 10, ...rise(70) }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 220, lineHeight: 0.9, color: gold, fontVariantNumeric: "tabular-nums" }}>
              {countUp(p.bigStat.value, 70, 34)}
              {p.bigStat.suffix ?? ""}
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, color: MUTED }}>{p.bigStat.label}</div>
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            marginTop: 30,
            background: gold,
            color: "#17120a",
            borderRadius: 18,
            padding: "30px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            ...rise(98),
          }}
        >
          <div style={{ fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", fontSize: 40 }}>{p.ctaLabel} →</div>
          <div style={{ fontWeight: 700, fontSize: 34 }}>{p.ctaUrl}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
