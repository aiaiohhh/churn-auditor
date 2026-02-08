import React from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Intro } from "./Intro";
import { ScreenScene } from "./ScreenScene";
import { Outro } from "./Outro";

const SCENES = [
  {
    image: "journey/journey-01-dashboard.png",
    caption: "The ChurnAuditor Dashboard",
    subtitle: "Real-time visibility into customer churn",
  },
  {
    image: "journey/journey-02-hover-simulate.png",
    caption: "One-Click Simulation",
    subtitle: "Generate realistic churn events instantly",
  },
  {
    image: "journey/journey-03-simulating.png",
    caption: "Event Triggered",
    subtitle: "AI pipeline activated in milliseconds",
  },
  {
    image: "journey/journey-04-analyzing.png",
    caption: "AI Analyzing...",
    subtitle: "Gemini Flash triages, then Pro diagnoses",
  },
  {
    image: "journey/journey-05-complete.png",
    caption: "Analysis Complete",
    subtitle: "Full diagnosis in under 60 seconds",
  },
  {
    image: "journey/journey-06-dossier.png",
    caption: "AI Dossier Generated",
    subtitle: "Root cause, confidence scores, and evidence",
  },
  {
    image: "journey/journey-07-evidence.png",
    caption: "Evidence & Insights",
    subtitle: "Support tickets, usage data, exit surveys",
  },
  {
    image: "journey/journey-08-actions-rec.png",
    caption: "Recovery Actions",
    subtitle: "AI recommends targeted interventions",
  },
  {
    image: "journey/journey-09-actions-tab.png",
    caption: "Actions Executed",
    subtitle: "Automated email, Slack, and ticket creation",
  },
  {
    image: "journey/journey-10-metrics.png",
    caption: "Metrics Dashboard",
    subtitle: "Track churn patterns and save rates",
  },
];

const NARRATION_FILES = [
  "audio/narration-01.mp3", // Intro
  "audio/narration-02.mp3", // Scene 1
  "audio/narration-03.mp3", // Scene 2
  "audio/narration-04.mp3", // Scene 3
  "audio/narration-05.mp3", // Scene 4
  "audio/narration-06.mp3", // Scene 5
  "audio/narration-07.mp3", // Scene 6
  "audio/narration-08.mp3", // Scene 7
  "audio/narration-09.mp3", // Scenes 8-9
  "audio/narration-10.mp3", // Scene 10 + Outro
];

const TRANSITION_FRAMES = 15;
const INTRO_DURATION = 282; // 9.4s - fits narr-01 (9.2s)
const OUTRO_DURATION = 127; // 4.2s

// Per-scene durations (frames) - sized to fit each narration + transition overlap + buffer
// Calculated from actual audio durations to prevent any overlap
const SCENE_DURATIONS = [
  247, // Scene 1:  narr-02 (7.5s)  → 8.2s
  255, // Scene 2:  narr-03 (7.8s)  → 8.5s
  165, // Scene 3:  narr-04 (4.8s)  → 5.5s
  271, // Scene 4:  narr-05 (8.3s)  → 9.0s
  156, // Scene 5:  narr-06 (4.5s)  → 5.2s
  193, // Scene 6:  narr-07 (5.7s)  → 6.4s
  177, // Scene 7:  narr-08 (5.2s)  → 5.9s
  163, // Scene 8:  narr-09 (9.6s spans 8-9) → 5.4s
  163, // Scene 9:  narr-09 continued        → 5.4s
  96,  // Scene 10: narr-10 (6.2s spans into outro) → 3.2s
];

/** Get the start offset of scene `index` within the TransitionSeries */
function getSceneOffset(index: number): number {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += SCENE_DURATIONS[i] - TRANSITION_FRAMES;
  }
  return offset;
}

export const ChurnAuditorDemo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  const scenesDuration =
    SCENE_DURATIONS.reduce((a, b) => a + b, 0) -
    (SCENES.length - 1) * TRANSITION_FRAMES;

  // Narration start times (absolute frames from video start)
  // Each narration starts exactly when its scene appears
  const narrationStarts = [
    0,                                          // narr-01: Intro
    INTRO_DURATION + getSceneOffset(0),         // narr-02: Scene 1
    INTRO_DURATION + getSceneOffset(1),         // narr-03: Scene 2
    INTRO_DURATION + getSceneOffset(2),         // narr-04: Scene 3
    INTRO_DURATION + getSceneOffset(3),         // narr-05: Scene 4
    INTRO_DURATION + getSceneOffset(4),         // narr-06: Scene 5
    INTRO_DURATION + getSceneOffset(5),         // narr-07: Scene 6
    INTRO_DURATION + getSceneOffset(6),         // narr-08: Scene 7
    INTRO_DURATION + getSceneOffset(7),         // narr-09: Scenes 8-9
    INTRO_DURATION + getSceneOffset(9),         // narr-10: Scene 10 + Outro
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#030712" }}>
      {/* === AUDIO TRACKS === */}

      {/* Background music - plays throughout at low volume with fade in/out */}
      <Audio
        src={staticFile("audio/background-music.wav")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, 2 * fps], [0, 0.15], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - 3 * fps, durationInFrames],
            [0.15, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return Math.min(fadeIn, fadeOut);
        }}
      />

      {/* Narration segments - each timed to its scene */}
      {NARRATION_FILES.map((file, i) => (
        <Sequence
          key={`narration-${i}`}
          from={narrationStarts[i]!}
          layout="none"
          premountFor={fps}
        >
          <Audio src={staticFile(file)} volume={0.9} />
        </Sequence>
      ))}

      {/* === VISUAL TRACKS === */}

      {/* Intro */}
      <Sequence durationInFrames={INTRO_DURATION} premountFor={fps}>
        <Intro />
      </Sequence>

      {/* Scenes with transitions - per-scene durations matched to narration */}
      <Sequence from={INTRO_DURATION} durationInFrames={scenesDuration} premountFor={fps}>
        <TransitionSeries>
          {SCENES.map((scene, i) => {
            const isFirst = i === 0;
            const elements: React.ReactNode[] = [];

            if (!isFirst) {
              elements.push(
                <TransitionSeries.Transition
                  key={`transition-${i}`}
                  presentation={
                    i % 2 === 0
                      ? fade()
                      : slide({ direction: "from-right" })
                  }
                  timing={linearTiming({
                    durationInFrames: TRANSITION_FRAMES,
                  })}
                />
              );
            }

            elements.push(
              <TransitionSeries.Sequence
                key={`scene-${i}`}
                durationInFrames={SCENE_DURATIONS[i]}
              >
                <ScreenScene
                  image={scene.image}
                  caption={scene.caption}
                  subtitle={scene.subtitle}
                  index={i}
                />
              </TransitionSeries.Sequence>
            );

            return elements;
          })}
        </TransitionSeries>
      </Sequence>

      {/* Outro */}
      <Sequence
        from={INTRO_DURATION + scenesDuration}
        durationInFrames={OUTRO_DURATION}
        premountFor={fps}
      >
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
