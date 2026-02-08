import { Composition } from "remotion";
import { ChurnAuditorDemo } from "./ChurnAuditorDemo";
import { ChurnAuditorDemoV2 } from "./ChurnAuditorDemoV2";
import { ChurnAuditorDemoV3, V3_TOTAL } from "./ChurnAuditorDemoV3";
import { ChurnAuditorDemoV4, V4_TOTAL } from "./ChurnAuditorDemoV4";
import { ChurnAuditorDemoV5, V5_TOTAL } from "./ChurnAuditorDemoV5";

const FPS = 30;

/* ─── V1 (short version, 72s) ─── */
const V1_TRANSITION_FRAMES = 15;
const V1_INTRO_DURATION = 282;
const V1_OUTRO_DURATION = 127;
const V1_SCENE_DURATIONS = [247, 255, 165, 271, 156, 193, 177, 163, 163, 96];
const V1_SCENES_TOTAL =
  V1_SCENE_DURATIONS.reduce((a, b) => a + b, 0) -
  (V1_SCENE_DURATIONS.length - 1) * V1_TRANSITION_FRAMES;
const V1_TOTAL = V1_INTRO_DURATION + V1_SCENES_TOTAL + V1_OUTRO_DURATION;

/* ─── V2 (full hackathon version, ~155s) ─── */
const V2_SEGMENT_DURATIONS = [365, 376, 407, 366, 335, 518, 543, 336, 366, 271, 572, 366];
const V2_TRANSITION_FRAMES = 15;
const V2_TOTAL =
  V2_SEGMENT_DURATIONS.reduce((a, b) => a + b, 0) -
  (V2_SEGMENT_DURATIONS.length - 1) * V2_TRANSITION_FRAMES;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ChurnAuditorDemo"
        component={ChurnAuditorDemo}
        durationInFrames={V1_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ChurnAuditorDemoV2"
        component={ChurnAuditorDemoV2}
        durationInFrames={V2_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ChurnAuditorDemoV3"
        component={ChurnAuditorDemoV3}
        durationInFrames={V3_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ChurnAuditorDemoV4"
        component={ChurnAuditorDemoV4}
        durationInFrames={V4_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ChurnAuditorDemoV5"
        component={ChurnAuditorDemoV5}
        durationInFrames={V5_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
