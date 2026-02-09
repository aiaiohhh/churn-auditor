import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

/**
 * V6 Scene 8: Dossier Deep-Dive — 4-phase screenshot crossfade showcasing
 * ConfidenceGauge, LiveTimer, Evidence, ReasoningTrace, RecommendedActions.
 * 600 frames (20s). HERO SCENE.
 */

interface Phase {
  image: string;
  callouts: Array<{ x: number; y: number; label: string; delay: number }>;
}

const PHASES: Phase[] = [
  {
    // Phase 1 (0-5s): Dossier top — ConfidenceGauge + LiveTimer
    image: "v6-screens/v6-dossier-top.png",
    callouts: [
      { x: 72, y: 25, label: "ConfidenceGauge", delay: 1.0 },
      { x: 72, y: 12, label: "LiveTimer", delay: 2.5 },
    ],
  },
  {
    // Phase 2 (5-10s): Evidence cards
    image: "v6-screens/v6-dossier-evidence.png",
    callouts: [
      { x: 65, y: 35, label: "Evidence Cards", delay: 1.0 },
      { x: 65, y: 55, label: "Customer Quotes", delay: 2.5 },
    ],
  },
  {
    // Phase 3 (10-15s): Reasoning trace
    image: "v6-screens/v6-dossier-reasoning.png",
    callouts: [
      { x: 65, y: 40, label: "AI Reasoning Chain", delay: 1.0 },
      { x: 65, y: 55, label: "Step-by-Step Logic", delay: 2.5 },
    ],
  },
  {
    // Phase 4 (15-20s): Recommended actions
    image: "v6-screens/v6-dossier-actions-rec.png",
    callouts: [
      { x: 65, y: 40, label: "Recommended Actions", delay: 1.0 },
      { x: 65, y: 60, label: "Auto-Execute Ready", delay: 2.5 },
    ],
  },
];

export const V6DossierDeepDive: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const phaseDuration = durationInFrames / PHASES.length;
  const crossfadeDuration = 0.5 * fps;

  // Initial entrance
  const entranceScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const entranceOpacity = interpolate(entranceScale, [0, 1], [0, 1]);

  // Caption labels per phase
  const phaseLabels = [
    "AI Confidence Assessment",
    "Evidence-Backed Analysis",
    "Transparent AI Reasoning",
    "Actionable Recommendations",
  ];

  const currentPhaseIndex = Math.min(
    Math.floor(frame / phaseDuration),
    PHASES.length - 1
  );

  // Caption fade
  const captionOpacity = interpolate(
    frame,
    [0.3 * fps, 0.6 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
      }}
    >
      {/* Screenshot container with browser chrome */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 60,
          right: 60,
          bottom: 120,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 0 60px rgba(0, 0, 0, 0.5), 0 0 120px rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(148, 163, 184, 0.12)",
          opacity: entranceOpacity,
        }}
      >
        {/* Browser bar */}
        <div
          style={{
            height: 36,
            background: "#1e293b",
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            gap: 8,
          }}
        >
          {["#ef4444", "#eab308", "#22c55e"].map((color, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: color,
              }}
            />
          ))}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "#0f172a",
                borderRadius: 6,
                padding: "4px 40px",
                fontSize: 11,
                color: "#64748b",
                fontFamily: "system-ui",
              }}
            >
              localhost:3000/dashboard
            </div>
          </div>
        </div>

        {/* Screenshot images with crossfade */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "calc(100% - 36px)",
          }}
        >
          {PHASES.map((phase, i) => {
            const phaseStart = i * phaseDuration;
            const phaseEnd = (i + 1) * phaseDuration;

            // Fade in
            const fadeIn =
              i === 0
                ? 1
                : interpolate(
                    frame,
                    [phaseStart - crossfadeDuration, phaseStart],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );

            // Fade out
            const fadeOut =
              i === PHASES.length - 1
                ? 1
                : interpolate(
                    frame,
                    [phaseEnd - crossfadeDuration, phaseEnd],
                    [1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );

            const opacity = Math.min(fadeIn, fadeOut);

            // Ken Burns
            const kenBurns = interpolate(
              frame,
              [phaseStart, phaseEnd],
              [1, 1.03],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity,
                }}
              >
                <Img
                  src={staticFile(phase.image)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top",
                    transform: `scale(${kenBurns})`,
                  }}
                />

                {/* Callouts for this phase */}
                {phase.callouts.map((callout, j) => {
                  const calloutStart = phaseStart + callout.delay * fps;
                  const calloutOpacity = interpolate(
                    frame,
                    [calloutStart, calloutStart + 10],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
                  // Fade out with phase
                  const calloutFadeOut =
                    i === PHASES.length - 1
                      ? 1
                      : interpolate(
                          frame,
                          [phaseEnd - crossfadeDuration * 2, phaseEnd - crossfadeDuration],
                          [1, 0],
                          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        );
                  const calloutScale = spring({
                    frame,
                    fps,
                    delay: Math.round(calloutStart),
                    config: { damping: 12, stiffness: 200 },
                  });

                  return (
                    <div
                      key={j}
                      style={{
                        position: "absolute",
                        left: `${callout.x}%`,
                        top: `${callout.y}%`,
                        transform: `translate(-50%, -50%) scale(${calloutScale})`,
                        opacity: Math.min(calloutOpacity, calloutFadeOut),
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    >
                      {/* Pulse ring */}
                      <div
                        style={{
                          position: "absolute",
                          inset: -12,
                          borderRadius: 20,
                          border: "2px solid rgba(239, 68, 68, 0.4)",
                          opacity:
                            0.4 +
                            0.3 *
                              Math.sin(
                                ((frame - calloutStart) / fps) * Math.PI * 3
                              ),
                        }}
                      />
                      <div
                        style={{
                          padding: "5px 14px",
                          borderRadius: 8,
                          background: "rgba(239, 68, 68, 0.9)",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#fff",
                          fontFamily: "Inter, system-ui, sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {callout.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption bar */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: captionOpacity,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#f1f5f9",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          AI Churn Dossier
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#64748b",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {phaseLabels[currentPhaseIndex]}
        </div>
      </div>
    </AbsoluteFill>
  );
};
