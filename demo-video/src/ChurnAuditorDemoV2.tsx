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
import { ProblemSlide } from "./ProblemSlide";
import { ScreenScene } from "./ScreenScene";
import { ArchitectureSlide } from "./ArchitectureSlide";
import { Outro } from "./Outro";
import { WebcamOverlay } from "./WebcamOverlay";

/* ─── NARRATION FILES ─── */
const NARRATION_FILES = Array.from(
  { length: 12 },
  (_, i) => `audio/v2-narration-${String(i + 1).padStart(2, "0")}.mp3`
);

/* ─── TIMING CONSTANTS ─── */
const TRANSITION_FRAMES = 15;

// Per-segment durations (frames) - calculated from actual audio durations
// Each segment = narr_frames + TRANSITION_FRAMES + 6 buffer (except last = narr_frames + 6)
const SEGMENT_DURATIONS = [
  365, // Seg 1:  Hook (11.4s narr → 12.2s)
  376, // Seg 2:  Stats (11.8s narr → 12.5s)
  407, // Seg 3:  Solution (12.8s narr → 13.6s)
  366, // Seg 4:  Dashboard (11.5s narr → 12.2s)
  335, // Seg 5:  Trigger (10.5s narr → 11.2s)
  518, // Seg 6:  AI Pipeline (16.5s narr → 17.3s)
  543, // Seg 7:  Dossier (17.4s narr → 18.1s)
  336, // Seg 8:  Evidence (10.5s narr → 11.2s)
  366, // Seg 9:  Actions (11.5s narr → 12.2s)
  271, // Seg 10: Metrics (8.3s narr → 9.0s)
  572, // Seg 11: Architecture (18.4s narr → 19.1s)
  366, // Seg 12: Closing (12.0s narr → 12.2s)
];

/** Get the start offset of segment `index` within the TransitionSeries */
function getSegmentOffset(index: number): number {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += SEGMENT_DURATIONS[i] - TRANSITION_FRAMES;
  }
  return offset;
}

const TOTAL_SCENES =
  SEGMENT_DURATIONS.reduce((a, b) => a + b, 0) -
  (SEGMENT_DURATIONS.length - 1) * TRANSITION_FRAMES;

/* ─── SCENE IMAGE MAPPING ─── */
// Segments 4-10 use journey screenshots
const SCENE_IMAGES: Record<number, { image: string; caption: string; subtitle: string }> = {
  3: {
    image: "journey/journey-01-dashboard.png",
    caption: "Your Command Center",
    subtitle: "Every churn event tracked, analyzed, and scored in real time",
  },
  4: {
    image: "journey/journey-02-hover-simulate.png",
    caption: "Trigger a Churn Event",
    subtitle: "One click simulates a customer cancellation",
  },
  5: {
    image: "journey/journey-04-analyzing.png",
    caption: "Gemini AI Pipeline",
    subtitle: "Flash triages, then Pro runs deep analysis",
  },
  6: {
    image: "journey/journey-06-dossier.png",
    caption: "AI Dossier Generated",
    subtitle: "Root cause, confidence scores, and save probability",
  },
  7: {
    image: "journey/journey-07-evidence.png",
    caption: "Evidence & Insights",
    subtitle: "Every conclusion backed by real customer signals",
  },
  8: {
    image: "journey/journey-08-actions-rec.png",
    caption: "Automated Recovery",
    subtitle: "Function calling executes personalized actions",
  },
  9: {
    image: "journey/journey-10-metrics.png",
    caption: "Churn Analytics",
    subtitle: "Patterns, save rates, and confidence trends",
  },
};

/* ─── MAIN COMPOSITION ─── */
export const ChurnAuditorDemoV2: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Narration start times (all segments in one TransitionSeries)
  const narrationStarts = Array.from({ length: 12 }, (_, i) =>
    getSegmentOffset(i)
  );

  // Determine if narration is currently playing (for webcam overlay)
  const narrationDurations = [344, 355, 386, 345, 314, 497, 522, 315, 345, 250, 551, 360];
  const isSpeaking = narrationStarts.some((start, i) => {
    return frame >= start && frame < start + narrationDurations[i];
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712" }}>
      {/* ════════ AUDIO TRACKS ════════ */}

      {/* Background music - low volume with fade in/out */}
      <Audio
        src={staticFile("audio/v2-background-music.wav")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, 2 * fps], [0, 0.12], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - 4 * fps, durationInFrames],
            [0.12, 0],
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
          <Audio src={staticFile(file)} volume={0.9} />
        </Sequence>
      ))}

      {/* ════════ VISUAL TRACKS ════════ */}

      <TransitionSeries>
        {SEGMENT_DURATIONS.map((duration, i) => {
          const elements: React.ReactNode[] = [];

          // Transition before each segment (except first)
          if (i > 0) {
            elements.push(
              <TransitionSeries.Transition
                key={`transition-${i}`}
                presentation={i % 2 === 0 ? fade() : slide({ direction: "from-right" })}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            );
          }

          // Segment content
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

      {/* ════════ WEBCAM OVERLAY ════════ */}
      {/* Appears after the solution intro (segment 3, ~37s in) */}
      <Sequence from={getSegmentOffset(3)} layout="none">
        <WebcamOverlay isSpeaking={isSpeaking} enterDelay={15} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ─── SEGMENT CONTENT ROUTER ─── */
const SegmentContent: React.FC<{ index: number }> = ({ index }) => {
  switch (index) {
    case 0:
      return <ProblemSlide variant="hook" />;
    case 1:
      return <ProblemSlide variant="stats" />;
    case 2:
      return <ProblemSlide variant="solution" />;
    case 11:
      return <Outro />;
    case 10:
      return <ArchitectureSlide />;
    default: {
      const scene = SCENE_IMAGES[index];
      if (!scene) return <AbsoluteFill style={{ background: "#030712" }} />;
      return (
        <ScreenScene
          image={scene.image}
          caption={scene.caption}
          subtitle={scene.subtitle}
          index={index - 3}
        />
      );
    }
  }
};
