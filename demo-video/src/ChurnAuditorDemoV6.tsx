import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

// Scenes
import { V6HookScene } from "./scenes/V6HookScene";
import { V6SolutionIntroScene } from "./scenes/V6SolutionIntroScene";
import { V6LandingScene } from "./scenes/V6LandingScene";
import { DemoScene } from "./scenes/DemoScene";
import { V6EventDetailScene } from "./scenes/V6EventDetailScene";
import { V6AnalyzingScene } from "./scenes/V6AnalyzingScene";
import { V6DossierDeepDive } from "./scenes/V6DossierDeepDive";
import { V6ToolCallingScene } from "./scenes/V6ToolCallingScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { V6CloseScene } from "./scenes/V6CloseScene";

/* ─── NARRATION FILES ─── */
const NARRATION_FILES = Array.from(
  { length: 11 },
  (_, i) => `audio/v6-narration-${String(i + 1).padStart(2, "0")}.mp3`
);

/* ─── TIMING ─── */
const FPS = 30;
const TRANSITION_FRAMES = 10; // Fast cuts (0.33s)
const NARRATION_DELAY = 5; // Start narration 0.17s into segment

// Scene durations (frames) — adjusted to fit measured narration
// These are the VISIBLE durations (what the viewer sees)
const SCENE_DURATIONS = [
  180,  // Scene 1:  Hook (6.0s) — narration 130 frames (4.3s)
  260,  // Scene 2:  Solution Intro (8.7s) — narration 237 frames (7.9s)
  620,  // Scene 3:  Landing Page (20.7s) — narration 588 frames (19.6s)
  350,  // Scene 4:  Dashboard Intro (11.7s) — narration 236 frames (7.9s)
  400,  // Scene 5:  Dashboard Tour (13.3s) — narration 317 frames (10.5s)
  360,  // Scene 6:  Event Detail (12.0s) — narration 247 frames (8.2s)
  360,  // Scene 7:  AI Analysis (12.0s) — narration 314 frames (10.4s)
  560,  // Scene 8:  Dossier Deep-Dive (18.7s) — narration 443 frames (14.8s)
  540,  // Scene 9:  Tool Calling (18.0s) — narration 528 frames (17.6s)
  510,  // Scene 10: Architecture (17.0s) — narration 498 frames (16.6s)
  360,  // Scene 11: Closing (12.0s) — narration 286 frames (9.5s)
];
// Total visible: 4500 frames = 150s = 2:30 ✓

// TransitionSeries segment durations (add overlap for non-last segments)
const SEGMENT_DURATIONS = SCENE_DURATIONS.map((dur, i) =>
  i < SCENE_DURATIONS.length - 1 ? dur + TRANSITION_FRAMES : dur
);

/** Get the start offset of segment `index` within the TransitionSeries */
function getSegmentOffset(index: number): number {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += SEGMENT_DURATIONS[i]! - TRANSITION_FRAMES;
  }
  return offset;
}

/* ─── NARRATION DURATIONS (frames at 30fps, from afinfo) ─── */
const NARRATION_FRAMES = [
  130,  // 01: Hook (4.3s)
  237,  // 02: Solution (7.9s)
  588,  // 03: Landing (19.6s)
  236,  // 04: Dashboard Intro (7.9s)
  317,  // 05: Dashboard Tour (10.5s)
  247,  // 06: Event Detail (8.2s)
  314,  // 07: AI Analysis (10.4s)
  443,  // 08: Dossier (14.8s)
  528,  // 09: Tool Calling (17.6s)
  498,  // 10: Architecture (16.6s)
  286,  // 11: Closing (9.5s)
];

/* ─── DEMO SCENE CONFIGS (screenshot-based scenes) ─── */
const DEMO_CONFIGS: Record<
  number,
  {
    image: string;
    caption: string;
    subtitle: string;
    callouts?: Array<{ x: number; y: number; label: string; delay: number }>;
  }
> = {
  // Scene 4: Dashboard Intro
  3: {
    image: "v6-screens/v6-dashboard-overview.png",
    caption: "Command Center",
    subtitle: "Every churn event — tracked, analyzed, and scored in real-time",
    callouts: [
      { x: 50, y: 35, label: "AI Risk Scores", delay: 3.0 },
    ],
  },
  // Scene 5: Dashboard Tour
  4: {
    image: "v6-screens/v6-dashboard-overview.png",
    caption: "AI-Scored Events",
    subtitle: "Root cause visible at a glance — pricing, bugs, features",
    callouts: [
      { x: 35, y: 30, label: "Save Probability", delay: 2.5 },
      { x: 35, y: 48, label: "Root Cause", delay: 5.0 },
    ],
  },
};

/* ─── MAIN COMPOSITION ─── */
export const ChurnAuditorDemoV6: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate narration start times
  const narrationStarts = Array.from({ length: 11 }, (_, i) =>
    getSegmentOffset(i) + NARRATION_DELAY
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712" }}>
      {/* ════════ AUDIO ════════ */}

      {/* Background music — soft under narration */}
      <Audio
        src={staticFile("audio/v2-background-music.wav")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, 1.5 * fps], [0, 0.10], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - 3 * fps, durationInFrames],
            [0.10, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />

      {/* Narration segments */}
      {NARRATION_FILES.map((file, i) => (
        <Sequence
          key={`narration-${i}`}
          from={narrationStarts[i]!}
          layout="none"
          premountFor={fps}
        >
          <Audio src={staticFile(file)} volume={0.92} />
        </Sequence>
      ))}

      {/* ════════ VISUALS ════════ */}

      <TransitionSeries>
        {SEGMENT_DURATIONS.map((duration, i) => {
          const elements: React.ReactNode[] = [];

          if (i > 0) {
            // Fast, punchy transitions — alternate for variety
            const transType = i % 3;
            elements.push(
              <TransitionSeries.Transition
                key={`transition-${i}`}
                presentation={
                  transType === 0
                    ? fade()
                    : transType === 1
                    ? slide({ direction: "from-right" })
                    : slide({ direction: "from-bottom" })
                }
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            );
          }

          elements.push(
            <TransitionSeries.Sequence
              key={`segment-${i}`}
              durationInFrames={duration}
            >
              <SegmentContent index={i} />
            </TransitionSeries.Sequence>
          );

          return elements;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

/* ─── SEGMENT ROUTER ─── */
const SegmentContent: React.FC<{ index: number }> = ({ index }) => {
  switch (index) {
    // Scene 1: Hook
    case 0:
      return <V6HookScene />;
    // Scene 2: Solution Intro
    case 1:
      return <V6SolutionIntroScene />;
    // Scene 3: Landing Page
    case 2:
      return <V6LandingScene />;
    // Scene 6: Event Detail (simulation + LiveTimer)
    case 5:
      return <V6EventDetailScene />;
    // Scene 7: AI Analysis
    case 6:
      return <V6AnalyzingScene />;
    // Scene 8: Dossier Deep-Dive
    case 7:
      return <V6DossierDeepDive />;
    // Scene 9: Tool Calling
    case 8:
      return <V6ToolCallingScene />;
    // Scene 10: Architecture
    case 9:
      return <ArchitectureScene />;
    // Scene 11: Closing
    case 10:
      return <V6CloseScene />;
    default: {
      // Screenshot-based scenes (Dashboard Intro, Dashboard Tour)
      const config = DEMO_CONFIGS[index];
      if (!config) return <AbsoluteFill style={{ background: "#030712" }} />;
      return (
        <DemoScene
          image={config.image}
          caption={config.caption}
          subtitle={config.subtitle}
          callouts={config.callouts}
        />
      );
    }
  }
};

/* ─── EXPORTS FOR ROOT ─── */
export const V6_SEGMENT_DURATIONS = SEGMENT_DURATIONS;
export const V6_TOTAL =
  SEGMENT_DURATIONS.reduce((a, b) => a + b, 0) -
  (SEGMENT_DURATIONS.length - 1) * TRANSITION_FRAMES;
