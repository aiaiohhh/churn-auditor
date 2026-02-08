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
import { V5HookScene } from "./scenes/V5HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { DemoScene } from "./scenes/DemoScene";
import { V5SimulationScene } from "./scenes/V5SimulationScene";
import { AnalyzingScene } from "./scenes/AnalyzingScene";
import { V5ActionsScene } from "./scenes/V5ActionsScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { V5CloseScene } from "./scenes/V5CloseScene";

/* ─── NARRATION FILES ─── */
const NARRATION_FILES = Array.from(
  { length: 11 },
  (_, i) => `audio/v5-narration-${String(i + 1).padStart(2, "0")}.mp3`
);

/* ─── TIMING ─── */
const FPS = 30;
const TRANSITION_FRAMES = 10; // Fast cuts (0.33s)
const NARRATION_DELAY = 5; // Start narration 0.17s into segment

// Scene durations (frames) — redistributed to fit narration
// These are the VISIBLE durations (what the viewer sees)
const SCENE_DURATIONS = [
  240,  // Scene 1:  Hook (8.0s)
  290,  // Scene 2:  Problem (9.7s)
  240,  // Scene 3:  Solution (8.0s)
  440,  // Scene 4:  Landing Page (14.7s)
  450,  // Scene 5:  Dashboard (15.0s)
  450,  // Scene 6:  Simulation (15.0s)
  300,  // Scene 7:  AI Analysis (10.0s)
  600,  // Scene 8:  Dossier (20.0s)
  390,  // Scene 9:  Actions (13.0s)
  650,  // Scene 10: Architecture (21.7s)
  450,  // Scene 11: Closing (15.0s)
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
    offset += SEGMENT_DURATIONS[i] - TRANSITION_FRAMES;
  }
  return offset;
}

/* ─── NARRATION DURATIONS (frames at 30fps, from afinfo) ─── */
const NARRATION_FRAMES = [
  232,  // 01: Hook (7.7s)
  258,  // 02: Problem (8.6s)
  229,  // 03: Solution (7.6s)
  424,  // 04: Landing Page (14.1s)
  380,  // 05: Dashboard (12.7s)
  411,  // 06: Simulation (13.7s)
  288,  // 07: AI Analysis (9.6s)
  525,  // 08: Dossier (17.5s)
  376,  // 09: Actions (12.5s)
  556,  // 10: Architecture (18.5s)
  407,  // 11: Closing (13.6s)
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
  // Scene 4: Landing Page
  3: {
    image: "v5-screens/v5-landing-hero.png",
    caption: "ChurnAuditor",
    subtitle: "Every cancellation tells a story. We turn it into a comeback.",
    callouts: [
      { x: 50, y: 35, label: "AI-Powered Recovery", delay: 3.0 },
    ],
  },
  // Scene 5: Dashboard
  4: {
    image: "v5-screens/v5-dashboard-overview.png",
    caption: "Command Center",
    subtitle: "Every churn event — tracked, analyzed, and scored",
    callouts: [
      { x: 35, y: 30, label: "52% Save", delay: 3.0 },
      { x: 35, y: 45, label: "65% Save", delay: 5.0 },
    ],
  },
  // Scene 8: Dossier
  7: {
    image: "v5-screens/v5-dossier-overview.png",
    caption: "AI Churn Dossier",
    subtitle: "Root cause analysis with evidence-backed conclusions",
    callouts: [
      { x: 55, y: 25, label: "52% Save Probability", delay: 1.5 },
      { x: 55, y: 40, label: "Pricing Sensitivity", delay: 5.0 },
      { x: 55, y: 52, label: "Usage Decline", delay: 8.0 },
      { x: 55, y: 64, label: "Product Issues", delay: 11.0 },
    ],
  },
};

/* ─── MAIN COMPOSITION ─── */
export const ChurnAuditorDemoV5: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate narration start times
  const narrationStarts = Array.from({ length: 11 }, (_, i) =>
    getSegmentOffset(i) + NARRATION_DELAY
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712" }}>
      {/* ════════ AUDIO ════════ */}

      {/* Background music — slightly louder for energy */}
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
          from={narrationStarts[i]}
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

      {/* NO presenter overlay in V5 — clean screen recordings only */}
    </AbsoluteFill>
  );
};

/* ─── SEGMENT ROUTER ─── */
const SegmentContent: React.FC<{ index: number }> = ({ index }) => {
  switch (index) {
    // Scene 1: Hook
    case 0:
      return <V5HookScene />;
    // Scene 2: Problem
    case 1:
      return <ProblemScene />;
    // Scene 3: Solution
    case 2:
      return <SolutionScene />;
    // Scene 6: Simulation (with countdown timer)
    case 5:
      return (
        <V5SimulationScene
          image="v5-screens/v5-simulate-click.png"
          analyzeImage="v5-screens/v5-analyzing.png"
        />
      );
    // Scene 7: AI Analysis
    case 6:
      return <AnalyzingScene />;
    // Scene 9: Actions & Success
    case 8:
      return <V5ActionsScene image="v5-screens/v5-dossier-actions.png" />;
    // Scene 10: Architecture
    case 9:
      return <ArchitectureScene />;
    // Scene 11: Closing
    case 10:
      return <V5CloseScene />;
    default: {
      // Screenshot-based scenes (Landing, Dashboard, Dossier)
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
export const V5_SEGMENT_DURATIONS = SEGMENT_DURATIONS;
export const V5_TOTAL =
  SEGMENT_DURATIONS.reduce((a, b) => a + b, 0) -
  (SEGMENT_DURATIONS.length - 1) * TRANSITION_FRAMES;
