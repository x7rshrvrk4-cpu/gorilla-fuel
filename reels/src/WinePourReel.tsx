import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Series } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadBarlow } from "@remotion/google-fonts/Barlow";

const { fontFamily: DISPLAY } = loadArchivo("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: BODY } = loadBarlow("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const GOLD = "#e8b23a";
const GOOD = "#64cf86";
const TEXT = "#f4f2ec";
const SCENE = 90;

const Shot: React.FC<{ src: string; dir?: 1 | -1; children: React.ReactNode }> = ({ src, dir = 1, children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, SCENE], dir === 1 ? [1.0, 1.06] : [1.06, 1.0]);
  const fade = interpolate(frame, [0, 8, SCENE - 8, SCENE], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ opacity: fade, background: "#0b0b0c" }}>
      <AbsoluteFill>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(38px) brightness(0.55)", transform: "scale(1.2)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 280, height: 820, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)" }} />
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

const Pill: React.FC<{ score: number | string; name: string; delay: number }> = ({ score, name, delay }) => (
  <Rise delay={delay}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(20,20,22,0.88)", border: "2px solid #2d2d31", borderRadius: 60, padding: "12px 28px 12px 14px", fontFamily: BODY }}>
      <span style={{ fontWeight: 700, fontSize: 38, color: GOLD, border: `3px solid ${GOLD}`, borderRadius: 14, padding: "2px 14px" }}>{score}</span>
      <span style={{ fontWeight: 700, fontSize: 42, color: TEXT }}>{name}</span>
    </div>
  </Rise>
);

const headline: React.CSSProperties = { fontFamily: DISPLAY, color: TEXT, fontSize: 104, lineHeight: 1.0, letterSpacing: -2 };

const PhoneScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 8, SCENE - 8, SCENE], [0, 1, 1, 0]);
  const lift = interpolate(frame, [0, 20], [60, 0], { extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, SCENE], [1.0, 1.04]);
  return (
    <AbsoluteFill style={{ opacity: fade, background: "#0b0b0c" }}>
      <AbsoluteFill>
        <Img src={staticFile("scene-wine-hook.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.4)", transform: "scale(1.2)" }} />
      </AbsoluteFill>
      <Logo />
      <div style={{ position: "absolute", left: 290, top: 190 + lift, width: 500, height: 1082, borderRadius: 58, border: "10px solid #1c1c1f", background: "#000", overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.7)" }}>
        <Img src={staticFile("screen-wine-search.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transform: `scale(${zoom})`, transformOrigin: "top center" }} />
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1330, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
        <Rise delay={6}><div style={{ ...headline, fontSize: 80 }}>SEARCH</div></Rise>
        <Rise delay={12}><div style={{ ...headline, fontSize: 80, color: GOLD, marginBottom: 4 }}>LCBO WINES.</div></Rise>
        <Pill score="Type" name="any wine name" delay={20} />
      </div>
    </AbsoluteFill>
  );
};

const PourScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 6, SCENE - 8, SCENE], [0, 1, 1, 0]);
  const zoom = interpolate(frame, [0, SCENE], [1.0, 1.12]);
  const shift = interpolate(frame, [0, SCENE], [0, -40]);
  return (
    <AbsoluteFill style={{ opacity: fade, background: "#0b0b0c" }}>
      <AbsoluteFill style={{ transform: `translateY(${shift}px) scale(${zoom})` }}>
        <Img src={staticFile("scene-wine-pour.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)" }} />
      <Logo />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 190 }}>
        <Rise delay={6}><div style={{ ...headline, fontSize: 112 }}>14,000+</div></Rise>
        <Rise delay={14}><div style={{ ...headline, fontSize: 104, color: GOLD }}>LCBO WINES.</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

const CardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 8, SCENE - 8, SCENE], [0, 1, 1, 0]);
  const lift = interpolate(frame, [0, 18], [50, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fade, background: "#0b0b0c" }}>
      <AbsoluteFill>
        <Img src={staticFile("scene-wine-pour.png")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.35)", transform: "scale(1.2)" }} />
      </AbsoluteFill>
      <Logo />
      <div style={{ position: "absolute", left: 120, top: 230 + lift, width: 840, borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.7)", border: "2px solid #2d2d31" }}>
        <Img src={staticFile("screen-wine-card.png")} style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1270 }}>
        <Rise delay={8}><div style={{ ...headline, fontSize: 84 }}>CALORIES. SUGAR.</div></Rise>
        <Rise delay={16}><div style={{ ...headline, fontSize: 84, color: GOLD }}>A SCORE.</div></Rise>
        <Rise delay={30}><div style={{ fontFamily: BODY, color: "#cfc9b8", fontSize: 40, marginTop: 20 }}>For every bottle, per 5 oz pour.</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

export const WinePourReel: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={SCENE}>
      <PourScene />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENE}>
      <Shot src="scene-wine-hook.jpg">
        <Logo />
        <div style={{ position: "absolute", left: 70, right: 70, top: 1190 }}>
          <Rise delay={4}><div style={{ ...headline, fontSize: 96 }}>FIND YOUR</div></Rise>
          <Rise delay={12}><div style={{ ...headline, fontSize: 96, color: GOLD }}>BOTTLE.</div></Rise>
        </div>
      </Shot>
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENE}>
      <PhoneScene />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENE}>
      <CardScene />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENE}>
      <AbsoluteFill style={{ background: "#0b0b0c", justifyContent: "center", padding: 80 }}>
        <Logo />
        <Rise delay={4}><div style={{ ...headline, fontSize: 96 }}>FIND YOUR</div></Rise>
        <Rise delay={12}><div style={{ ...headline, fontSize: 96, color: GOLD }}>WINE.</div></Rise>
        <Rise delay={26}>
          <p style={{ fontFamily: BODY, color: "#cfc9b8", fontSize: 42, lineHeight: 1.35, marginTop: 36, maxWidth: 880 }}>
            Look up wines sold at the LCBO. Free, no account.
          </p>
        </Rise>
        <Rise delay={44}>
          <div style={{ marginTop: 40, background: GOLD, color: "#0b0b0c", fontFamily: BODY, fontWeight: 700, fontSize: 44, padding: "26px 40px", borderRadius: 14, display: "inline-block" }}>
            gorillafuel.ca/alcohol
          </div>
        </Rise>
      </AbsoluteFill>
    </Series.Sequence>
  </Series>
);
