import { Composition } from "remotion";
import { GorillaReel } from "./GorillaReel";
import { reelSchema } from "./schema";
import { pickReel } from "./catalog";

const FPS = 30;
const DURATION_SECONDS = 9;

// defaultProps = the reel this ~3-day slot selects (seasonally weighted). Rendering
// with no --props renders the current pick; override --props to render a specific one.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="GorillaReel"
      component={GorillaReel}
      durationInFrames={FPS * DURATION_SECONDS}
      fps={FPS}
      width={1080}
      height={1920}
      schema={reelSchema}
      defaultProps={pickReel().props}
    />
  );
};
