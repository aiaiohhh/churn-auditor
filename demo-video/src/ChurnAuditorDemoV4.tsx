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
import { HookScene } from "./scenes/HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { PainPointScene } from "./scenes/PainPointScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { DemoScene } from "./scenes/DemoScene";
import { PromiseScene } from "./scenes/PromiseScene";
import { AnalyzingScene } from "./scenes/AnalyzingScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { ResultsScene } from "./scenes/ResultsScene";
import { CloseScene } from "./scenes/CloseScene";
import { PresenterOverlay } from "./scenes/PresenterOverlay";

/* ─── NARRATION FILES ─── */
const NARRATION_FILES = Array.from(
  { length: 16 },
  (_, i) => `audio/v4-narration-${String(i + 1).padStart(2, "0")}.mp3`
);

/* ─── TIMING ─── */
const TRANSITION_FRAMES = 15;
const VISUAL_BUFFER = 20; // 0.67s for entrance animations
const NARRATION_DELAY = 10; // Start narration 0.33s into segment

// Narration durations in frames (from afinfo)
const NARRATION_FRAMES = [
  458,  // 01: Hook
  562,  // 02: Problem Stats
  348,  // 03: Pain Points
  231,  // 04: Solution Intro
  502,  // 05: Landing Page
  238,  // 06: Promise
  268,  // 07: Signup
  275,  // 08: Dashboard Intro
  605,  // 09: Dashboard Tour
  406,  // 10: Simulation
  482,  // 11: Analyzing
  473,  // 12: Dossier
  566,  // 13: Actions
  638,  // 14: Architecture
  350,  // 15: Results
  452,  // 16: Closing
];

// Segment durations = narration + visual buffer + transition overlap
const SEGMENT_DURATIONS = NARRATION_FRAMES.map((nf, i) => {
  const base = nf + VISUAL_BUFFER;
  return i < NARRATION_FRAMES.length - 1 ? base + TRANSITION_FRAMES : base;
});

/** Get the start offset of segment `index` within the TransitionSeries */
function getSegmentOffset(index: number): number {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += SEGMENT_DURATIONS[i] - TRANSITION_FRAMES;
  }
  return offset;
}

/* ─── SCENE CONFIG ─── */
const DEMO_SCENES: Record<
  number,
  {
    image: string;
    caption: string;
    subtitle: string;
    callouts?: Array<{ x: number; y: number; label: string; delay: number }>;
  }
> = {
  // Scene 5: Landing Page
  4: {
    image: "v4-screens/v4-landing-hero.png",
    caption: "ChurnAuditor",
    subtitle: "AI-powered churn recovery — designed from the ground up",
  },
  // Scene 7: Signup
  6: {
    image: "v4-screens/v4-landing-hero.png",
    caption: "Get Started in 30 Seconds",
    subtitle: "No credit card required. No complex setup.",
    callouts: [
      { x: 28, y: 50, label: "Try Live Demo", delay: 1.5 },
    ],
  },
  // Scene 8: Dashboard Intro
  7: {
    image: "v4-screens/v4-dashboard-empty.png",
    caption: "Your Command Center",
    subtitle: "Every churn event tracked, analyzed, and scored in real-time",
  },
  // Scene 9: Dashboard Tour
  8: {
    image: "v4-screens/v4-dashboard-overview.png",
    caption: "AI-Scored Churn Events",
    subtitle: "Save probability calculated from support, usage, and behavioral signals",
    callouts: [
      { x: 35, y: 25, label: "52% Save", delay: 2.0 },
      { x: 35, y: 40, label: "65% Save", delay: 3.5 },
    ],
  },
  // Scene 10: Simulation
  9: {
    image: "v4-screens/v4-simulate-click.png",
    caption: "Live Simulation",
    subtitle: "Triggering a real-time Stripe cancellation event",
    callouts: [
      { x: 50, y: 15, label: "Simulate Cancellation", delay: 1.0 },
    ],
  },
  // Scene 12: Dossier
  11: {
    image: "v4-screens/v4-dossier-overview.png",
    caption: "AI Churn Dossier",
    subtitle: "Root cause analysis with evidence-backed conclusions",
    callouts: [
      { x: 55, y: 30, label: "Root Cause", delay: 1.5 },
      { x: 55, y: 50, label: "Save Probability", delay: 3.0 },
    ],
  },
  // Scene 13: Actions
  12: {
    image: "journey/journey-08-actions-rec.png",
    caption: "Automated Recovery Actions",
    subtitle: "Personalized emails, Slack alerts, and ticket creation — all automatic",
    callouts: [
      { x: 60, y: 30, label: "Email Sent", delay: 1.5 },
      { x: 60, y: 45, label: "Slack Alert", delay: 2.5 },
      { x: 60, y: 60, label: "Ticket Logged", delay: 3.5 },
    ],
  },
};

/* ─── MAIN COMPOSITION ─── */
export const ChurnAuditorDemoV4: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate narration start times
  const narrationStarts = Array.from({ length: 16 }, (_, i) =>
    getSegmentOffset(i) + NARRATION_DELAY
  );

  // Check if narration is currently playing
  const isSpeaking = narrationStarts.some((start, i) => {
    return frame >= start && frame < start + NARRATION_FRAMES[i];
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712" }}>
      {/* ════════ AUDIO ════════ */}

      {/* Background music */}
      <Audio
        src={staticFile("audio/v2-background-music.wav")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, 2 * fps], [0, 0.08], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - 4 * fps, durationInFrames],
            [0.08, 0],
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
            // Alternate transitions for variety
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

      {/* ════════ PRESENTER OVERLAY ════════ */}
      {/* Appears from segment 7 (dashboard intro) onwards */}
      <Sequence from={getSegmentOffset(7)} layout="none">
        <PresenterOverlay isSpeaking={isSpeaking} enterDelay={15} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ─── SEGMENT ROUTER ─── */
const SegmentContent: React.FC<{ index: number }> = ({ index }) => {
  switch (index) {
    // ACT 1: THE PROBLEM
    case 0:
      return <HookScene />;
    case 1:
      return <ProblemScene />;
    case 2:
      return <PainPointScene />;

    // ACT 2: THE SOLUTION
    case 3:
      return <SolutionScene />;
    case 5:
      return <PromiseScene />;

    // ACT 3: THE JOURNEY (screen recording scenes handled by DEMO_SCENES)
    case 10:
      return <AnalyzingScene />;

    // ACT 4: THE PAYOFF
    case 13:
      return <ArchitectureScene />;
    case 14:
      return <ResultsScene />;
    case 15:
      return <CloseScene />;

    default: {
      // Screen recording scenes
      const scene = DEMO_SCENES[index];
      if (!scene) return <AbsoluteFill style={{ background: "#030712" }} />;
      return (
        <DemoScene
          image={scene.image}
          caption={scene.caption}
          subtitle={scene.subtitle}
          callouts={scene.callouts}
        />
      );
    }
  }
};

/* ─── EXPORTS FOR ROOT ─── */
export const V4_SEGMENT_DURATIONS = SEGMENT_DURATIONS;
export const V4_TOTAL =
  SEGMENT_DURATIONS.reduce((a, b) => a + b, 0) -
  (SEGMENT_DURATIONS.length - 1) * TRANSITION_FRAMES;
