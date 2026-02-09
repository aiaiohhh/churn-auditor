import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

/**
 * V6 Scene 7: AI Analysis — split screen (screenshot + AI brain visualization).
 * 360 frames (12s). Based on AnalyzingScene pattern.
 */
export const V6AnalyzingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Data stream animations
  const streams = [
    { label: "Support Tickets", color: "#f87171", delay: 0.5 },
    { label: "Usage Data", color: "#60a5fa", delay: 1.2 },
    { label: "Behavioral Signals", color: "#a78bfa", delay: 1.9 },
  ];

  // Processing spinner
  const spinAngle = (frame / fps) * 360;

  // Status text
  const statusTexts = ["Synthesizing...", "Correlating...", "Diagnosing..."];
  const statusIndex = Math.min(
    Math.floor(frame / (2 * fps)),
    statusTexts.length - 1
  );

  // Complete flash
  const completeOpacity = interpolate(
    frame,
    [8 * fps, 8.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Two-model callout
  const flashCallout = interpolate(
    frame,
    [3 * fps, 3.3 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const proCallout = interpolate(
    frame,
    [5 * fps, 5.3 * fps],
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
      {/* Left side: Dashboard screenshot */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 900,
          bottom: 40,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(148, 163, 184, 0.1)",
          opacity: 0.8,
        }}
      >
        <Img
          src={staticFile("v6-screens/v6-analyzing.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
      </div>

      {/* Right side: AI Processing visualization */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          width: 900,
          bottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        {/* AI Brain icon with spinner */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 50,
              border: "3px solid transparent",
              borderTopColor: "#60a5fa",
              borderRightColor: "#a78bfa",
              transform: `rotate(${spinAngle}deg)`,
            }}
          />
          <span style={{ fontSize: 40 }}>🧠</span>
        </div>

        {/* Gemini label */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#60a5fa",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Gemini AI Pipeline
        </div>

        {/* Two-model indicators */}
        <div style={{ display: "flex", gap: 16 }}>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              fontSize: 12,
              fontWeight: 700,
              color: "#22c55e",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              opacity: flashCallout,
            }}
          >
            Flash → Triage (2s)
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              background: "rgba(168, 85, 247, 0.08)",
              border: "1px solid rgba(168, 85, 247, 0.2)",
              fontSize: 12,
              fontWeight: 700,
              color: "#a855f7",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              opacity: proCallout,
            }}
          >
            Pro → Diagnosis (15s)
          </div>
        </div>

        {/* Data streams */}
        {streams.map((stream, i) => {
          const streamOpacity = interpolate(
            frame,
            [stream.delay * fps, (stream.delay + 0.4) * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const streamX = interpolate(
            frame,
            [stream.delay * fps, (stream.delay + 0.6) * fps],
            [-50, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            }
          );

          const dotPhase = ((frame - stream.delay * fps) / fps) * 8;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: streamOpacity,
                transform: `translateX(${streamX}px)`,
              }}
            >
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2, 3, 4].map((d) => (
                  <div
                    key={d}
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      background: stream.color,
                      opacity:
                        0.3 +
                        0.7 * Math.max(0, Math.sin(dotPhase - d * 0.5)),
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: `rgba(${hexToRgb(stream.color)}, 0.08)`,
                  border: `1px solid rgba(${hexToRgb(stream.color)}, 0.2)`,
                  fontSize: 14,
                  fontWeight: 600,
                  color: stream.color,
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              >
                {stream.label}
              </div>
              <span style={{ color: stream.color, fontSize: 16 }}>→</span>
            </div>
          );
        })}

        {/* Status text */}
        <div
          style={{
            marginTop: 12,
            fontSize: 18,
            fontWeight: 600,
            color: "#94a3b8",
            fontFamily: "'SF Mono', 'Fira Code', monospace",
          }}
        >
          {completeOpacity > 0 ? (
            <span style={{ color: "#22c55e" }}>✓ Analysis Complete</span>
          ) : (
            statusTexts[statusIndex]
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255, 255, 255";
  return `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}`;
}
