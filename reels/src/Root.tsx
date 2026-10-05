import { Composition } from "remotion";
import { GorillaReel } from "./GorillaReel";
import { reelSchema } from "./schema";
import { MEAL_FINDER_REEL } from "./content";

const FPS = 30;
const DURATION_SECONDS = 9;

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
      defaultProps={MEAL_FINDER_REEL}
    />
  );
};
