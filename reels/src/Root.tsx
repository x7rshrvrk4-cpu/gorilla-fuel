import { Composition, Series } from "remotion";
import { GorillaReel } from "./GorillaReel";
import { BeautyCompare } from "./BeautyCompare";
import { reelSchema } from "./schema";
import { pickReel, CATALOG_BY_ID } from "./catalog";

const FPS = 30;
const DURATION_SECONDS = 9;
const FRAMES = FPS * DURATION_SECONDS;

const sunscreenProps = CATALOG_BY_ID["sunscreen-scored"].props;

// The combined post video: the SPF intro reel, then the Clean-vs-Flagged
// breakdown, back-to-back as one clip.
const BeautyCombo: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={FRAMES}>
      <GorillaReel {...sunscreenProps} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={FRAMES}>
      <BeautyCompare />
    </Series.Sequence>
  </Series>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GorillaReel"
        component={GorillaReel}
        durationInFrames={FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        schema={reelSchema}
        defaultProps={pickReel().props}
      />
      <Composition
        id="BeautyCompare"
        component={BeautyCompare}
        durationInFrames={FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="BeautyCombo"
        component={BeautyCombo}
        durationInFrames={FRAMES * 2}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
