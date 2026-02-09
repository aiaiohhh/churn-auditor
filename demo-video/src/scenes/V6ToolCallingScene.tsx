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
 * V6 Scene 9: Tool Calling — ActionExecutor showcase with code overlay.
 * 540 frames (18s). CLIMAX SCENE.
 * Phase 1 (0-6s): actions-executing screenshot
 * Phase 2 (6-12s): actions-complete screenshot
 * Phase 3 (12-18s): action-expanded screenshot + code overlay
 */

const PHASES = [
  {
    image: "v6-screens/v6-actions-executing.png",
    callouts: [
      { x: 65, y: 20, label: "ACTION ERA ⚡", delay: 1.0 },
      { x: 65, y: 40, label: "create_linear_ticket()", delay: 2.5 },
    ],
  },
  {
    image: "v6-screens/v6-actions-complete.png",
    callouts: [
      { x: 65, y: 60, label: "All Actions Executed", delay: 1.0 },
      { x: 65, y: 75, label: "< 2 Seconds Total", delay: 2.5 },
    ],
  },
  {
    image: "v6-screens/v6-action-expanded.png",
    callouts: [
      { x: 65, y: 45, label: "Typed Parameters", delay: 1.0 },
    ],
  },
];

const CODE_LINES = [
  { text: "// Gemini Function Calling", color: "#64748b" },
  { text: "const tools = [", color: "#f1f5f9" },
  { text: '  create_linear_ticket({', color: "#a78bfa" },
  { text: '    title: "Churn: pricing",', color: "#22c55e" },
  { text: '    priority: "high"', color: "#22c55e" },
  { text: "  }),", color: "#a78bfa" },
  { text: '  send_winback_email({', color: "#60a5fa" },
  { text: '    template: "personalized"', color: "#22c55e" },
  { text: "  }),", color: "#60a5fa" },
  { text: '  post_slack_alert({', color: "#22c55e" },
  { text: '    channel: "#churn-alerts"', color: "#22c55e" },
  { text: "  }),", color: "#22c55e" },
  { text: "];", color: "#f1f5f9" },
];

export const V6ToolCallingScene: React.FC = () => {
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

  // Code overlay (appears in phase 3)
  const codeStart = 2 * phaseDuration + 2 * fps;
  const codeOpacity = interpolate(
    frame,
    [codeStart, codeStart + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const currentPhaseIndex = Math.min(
    Math.floor(frame / phaseDuration),
    PHASES.length - 1
  );

  const phaseLabels = [
    "Executing Recovery Actions",
    "All Functions Returned Successfully",
    "Gemini Function Calling Signatures",
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
      }}
    >
      {/* Screenshot container */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 60,
          right: codeOpacity > 0 ? 480 : 60,
          bottom: 120,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 0 60px rgba(0, 0, 0, 0.5), 0 0 120px rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(148, 163, 184, 0.12)",
          opacity: entranceOpacity,
          transition: "right 0.5s ease-out",
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

        {/* Images with crossfade */}
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

            const fadeIn =
              i === 0
                ? 1
                : interpolate(
                    frame,
                    [phaseStart - crossfadeDuration, phaseStart],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );

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

                {/* Callouts */}
                {phase.callouts.map((callout, j) => {
                  const calloutStart = phaseStart + callout.delay * fps;
                  const calloutOpacity = interpolate(
                    frame,
                    [calloutStart, calloutStart + 10],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
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

      {/* Code overlay (right side, phase 3) */}
      {codeOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 60,
            width: 380,
            bottom: 140,
            borderRadius: 12,
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            padding: 24,
            opacity: codeOpacity,
            boxShadow: "0 0 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Code header */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            agent.ts
          </div>

          {/* Code lines with stagger */}
          {CODE_LINES.map((line, i) => {
            const lineStart = codeStart + i * 4;
            const lineOpacity = interpolate(
              frame,
              [lineStart, lineStart + 8],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  color: line.color,
                  lineHeight: 1.8,
                  opacity: lineOpacity,
                  whiteSpace: "pre",
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      )}

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
          Autonomous Tool Calling
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
          {phaseLabels[currentPhaseIndex]}
        </div>
      </div>
    </AbsoluteFill>
  );
};
