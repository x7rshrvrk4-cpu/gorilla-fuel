import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Series } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadBarlow } from "@remotion/google-fonts/Barlow";

const { fontFamily: DISPLAY } = loadArchivo("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: BODY } = loadBarlow("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const GOLD = "#e8b23a";
const GOOD = "#64cf86";
const TEXT = "#f4f2ec";
const SCENE = 120; // 4s at 30fps

const Shot: React.FC<{ src: string; dir?: 1 | -1; children: React.ReactNode }> = ({ src, dir = 1, children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, SCENE], dir === 1 ? [1.0, 1.14] : [1.14, 1.0]);
  const x = interpolate(frame, [0, SCENE], [0, dir * -28]);
  const fade = interpolate(frame, [0, 8, SCENE - 8, SCENE], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fade, background: "#0b0b0c" }}>
      <AbsoluteFill style={{ transform: `translateX(${x}px) scale(${scale})` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.78) 100%)" }} />
      {children}
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => (
  <div style={{ position: "absolute", top: 70, left: 70, display: "flex", alignItems: "center", gap: 18 }}>
    <Img src={staticFile("gorilla-logo.jpg")} style={{ width: 76, height: 76, borderRadius: 16 }} />
    <span style={{ fontFamily: BODY, fontWeight: 700, letterSpacing: 8, color: GOLD, fontSize: 34 }}>GORILLA FUEL</span>
  </div>
);

const Rise: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 120, mass: 0.8 } });
  return <div style={{ opacity: Math.max(0, Math.min(1, s)), transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`, ...style }}>{children}</div>;
};

const Pill: React.FC<{ score: number; name: string; delay: number }> = ({ score, name, delay }) => (
  <Rise delay={delay}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(20,20,22,0.88)", border: "2px solid #2d2d31", borderRadius: 60, padding: "14px 30px 14px 16px", fontFamily: BODY }}>
      <span style={{ fontWeight: 700, fontSize: 40, color: score >= 80 ? GOOD : GOLD, border: `3px solid ${score >= 80 ? GOOD : GOLD}`, borderRadius: 14, padding: "2px 14px" }}>{score}</span>
      <span style={{ fontWeight: 700, fontSize: 44, color: TEXT }}>{name}</span>
    </div>
  </Rise>
);

const headline: React.CSSProperties = { fontFamily: DISPLAY, color: TEXT, fontSize: 112, lineHeight: 1.0, letterSpacing: -2 };

export const StillReel: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={SCENE}>
      <Shot src="scene-scan.jpg">
        <Logo />
        <div style={{ position: "absolute", left: 70, right: 70, bottom: 190 }}>
          <Rise delay={6}><div style={headline}>STANDING IN</div></Rise>
          <Rise delay={14}><div style={headline}>THE AISLE?</div></Rise>
          <Rise delay={30}><div style={{ ...headline, color: GOLD, marginTop: 14 }}>SCAN IT.</div></Rise>
        </div>
      </Shot>
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENE}>
      <Shot src="scene-cook.jpg" dir={-1}>
        <Logo />
        <div style={{ position: "absolute", left: 70, right: 70, bottom: 170, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
          <Rise delay={4}><div style={{ ...headline, fontSize: 84 }}>THEN COOK</div></Rise>
          <Rise delay={12}><div style={{ ...headline, fontSize: 84, color: GOLD, marginBottom: 14 }}>WHAT SCORES.</div></Rise>
          <Pill score={88} name="Chicken Breast" delay={26} />
          <Pill score={95} name="Broccoli" delay={34} />
          <Pill score={82} name="Brown Rice" delay={42} />
        </div>
      </Shot>
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENE}>
      <AbsoluteFill style={{ background: "#0b0b0c", justifyContent: "center", padding: 80 }}>
        <Logo />
        <Rise delay={4}><div style={{ ...headline, fontSize: 100 }}>FIND YOUR</div></Rise>
        <Rise delay={12}><div style={{ ...headline, fontSize: 100, color: GOLD }}>MEAL.</div></Rise>
        <Rise delay={26}>
          <p style={{ fontFamily: BODY, color: "#908d86", fontSize: 44, lineHeight: 1.35, marginTop: 36, maxWidth: 880 }}>
            Tell us what&apos;s in your fridge. Mix clean and not-so-clean ingredients and see where your meal lands. Free, no account.
          </p>
        </Rise>
        <Rise delay={44}>
          <div style={{ marginTop: 40, background: GOLD, color: "#0b0b0c", fontFamily: BODY, fontWeight: 700, fontSize: 44, padding: "26px 40px", borderRadius: 14, display: "inline-block" }}>
            gorillafuel.ca/fitness/recipe-scorer
          </div>
        </Rise>
      </AbsoluteFill>
    </Series.Sequence>
  </Series>
);
