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
import { HookScene } from "./scenes/HookScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { DemoScene } from "./scenes/DemoScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { CloseScene } from "./scenes/CloseScene";
import { PresenterOverlay } from "./scenes/PresenterOverlay";

/* ─── NARRATION FILES ─── */
const NARRATION_FILES = Array.from(
  { length: 8 },
  (_, i) => `audio/v3-narration-${String(i + 1).padStart(2, "0")}.mp3`
);

/* ─── TIMING ─── */
const TRANSITION_FRAMES = 15;

// Narration durations in frames (from afinfo)
const NARRATION_FRAMES = [293, 414, 398, 344, 580, 541, 518, 482];

// Segment durations = narration + transition overlap + visual buffer
// Buffer gives time for entrance animations before narration starts
const VISUAL_BUFFER = 30; // 1s buffer for animations
const SEGMENT_DURATIONS = NARRATION_FRAMES.map((nf, i) => {
  const base = nf + VISUAL_BUFFER;
  // Last segment doesn't need transition padding
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

// Narration starts after visual buffer within each segment
const NARRATION_DELAY = 15; // Start narration 0.5s into each segment

/* ─── SCENE IMAGE MAPPING ─── */
const DEMO_SCENES: Record<number, {
  image: string;
  caption: string;
  subtitle: string;
  callouts?: Array<{ x: number; y: number; label: string; delay: number }>;
}> = {
  3: {
    image: "journey/journey-01-dashboard.png",
    caption: "Your Command Center",
    subtitle: "Every churn event tracked, analyzed, and scored in real time",
  },
  4: {
    image: "journey/journey-04-analyzing.png",
    caption: "AI Pipeline in Action",
    subtitle: "Gemini Flash triages, then Pro runs deep analysis",
    callouts: [
      { x: 50, y: 40, label: "Analyzing...", delay: 2 },
      { x: 75, y: 25, label: "Gemini Flash → Pro", delay: 4 },
    ],
  },
  5: {
    image: "journey/journey-06-dossier.png",
    caption: "AI Churn Dossier",
    subtitle: "Root cause, evidence, and automated recovery actions",
    callouts: [
      { x: 30, y: 20, label: "Root Cause", delay: 1.5 },
      { x: 70, y: 60, label: "Recovery Actions", delay: 4 },
    ],
  },
};

/* ─── MAIN COMPOSITION ─── */
export const ChurnAuditorDemoV3: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate narration start times (segment offset + delay)
  const narrationStarts = Array.from({ length: 8 }, (_, i) =>
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
          const fadeIn = interpolate(f, [0, 2 * fps], [0, 0.10], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - 4 * fps, durationInFrames],
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

          // Transition (except first segment)
          if (i > 0) {
            elements.push(
              <TransitionSeries.Transition
                key={`transition-${i}`}
                presentation={i % 2 === 0 ? fade() : slide({ direction: "from-right" })}
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
      {/* Appears from segment 3 (dashboard demo) onwards */}
      <Sequence from={getSegmentOffset(3)} layout="none">
        <PresenterOverlay isSpeaking={isSpeaking} enterDelay={15} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ─── SEGMENT ROUTER ─── */
const SegmentContent: React.FC<{ index: number }> = ({ index }) => {
  switch (index) {
    case 0:
      return <HookScene />;
    case 1:
      return <ProblemScene />;
    case 2:
      return <SolutionScene />;
    case 6:
      return <ArchitectureScene />;
    case 7:
      return <CloseScene />;
    default: {
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
export const V3_TRANSITION_FRAMES = TRANSITION_FRAMES;
export const V3_SEGMENT_DURATIONS = SEGMENT_DURATIONS;
export const V3_TOTAL =
  SEGMENT_DURATIONS.reduce((a, b) => a + b, 0) -
  (SEGMENT_DURATIONS.length - 1) * TRANSITION_FRAMES;
