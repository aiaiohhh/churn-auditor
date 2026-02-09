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
 * V6 Scene 3: Landing page — 3 screenshots with crossfade + Ken Burns + callouts.
 * 480 frames (16s).
 */

const PHASES = [
  {
    image: "v6-screens/v6-landing-hero.png",
    callout: { x: 50, y: 40, label: "60 Seconds", delay: 1.5 },
  },
  {
    image: "v6-screens/v6-landing-problem.png",
    callout: { x: 50, y: 35, label: "$1.6T Lost to Churn", delay: 1.5 },
  },
  {
    image: "v6-screens/v6-landing-solution.png",
    callout: { x: 50, y: 40, label: "Detect → Diagnose → Recover", delay: 1.5 },
  },
];

export const V6LandingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const phaseDuration = durationInFrames / PHASES.length;
  const crossfadeDuration = 0.5 * fps; // 15 frames

  // Initial entrance
  const entranceScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const entranceOpacity = interpolate(entranceScale, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
      }}
    >
      {/* Browser chrome container */}
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
              churnauditor.vercel.app
            </div>
          </div>
        </div>

        {/* Images with crossfade */}
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 36px)" }}>
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

            // Ken Burns zoom per phase
            const kenBurns = interpolate(
              frame,
              [phaseStart, phaseEnd],
              [1, 1.04],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            // Callout
            const calloutStart = phaseStart + phase.callout.delay * fps;
            const calloutOpacity = interpolate(
              frame,
              [calloutStart, calloutStart + 10],
              [0, 1],
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

                {/* Callout */}
                {calloutOpacity > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${phase.callout.x}%`,
                      top: `${phase.callout.y}%`,
                      transform: `translate(-50%, -50%) scale(${calloutScale})`,
                      opacity: calloutOpacity,
                      pointerEvents: "none",
                    }}
                  >
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
                        padding: "6px 16px",
                        borderRadius: 8,
                        background: "rgba(239, 68, 68, 0.9)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#fff",
                        fontFamily: "Inter, system-ui, sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {phase.callout.label}
                    </div>
                  </div>
                )}
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
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#f1f5f9",
            fontFamily: "Inter, system-ui, sans-serif",
            opacity: interpolate(frame, [0.3 * fps, 0.6 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          The Product
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#64748b",
            fontFamily: "Inter, system-ui, sans-serif",
            opacity: interpolate(frame, [0.5 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Diagnose churn in 60 seconds — detect, diagnose, recover
        </div>
      </div>
    </AbsoluteFill>
  );
};
