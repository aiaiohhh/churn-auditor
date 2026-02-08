import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

/**
 * Scene 6: The 60-second promise — big countdown, challenge text.
 */
export const PromiseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "60" slam animation
  const numScale = spring({
    frame,
    fps,
    delay: Math.round(0.2 * fps),
    config: { damping: 10, stiffness: 250 },
  });
  const numOpacity = interpolate(frame, [0.2 * fps, 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "SECONDS" label
  const labelOpacity = interpolate(frame, [0.5 * fps, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle
  const subOpacity = interpolate(frame, [1.0 * fps, 1.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [1.0 * fps, 1.4 * fps], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Challenge text
  const challengeOpacity = interpolate(
    frame,
    [2.0 * fps, 2.4 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Arrow
  const arrowX = interpolate(
    frame,
    [2.5 * fps, 4 * fps],
    [0, 10],
    { extrapolateRight: "clamp" }
  );
  const arrowBounce = Math.sin((frame / fps) * Math.PI * 2) * 3;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Big 60 */}
      <div
        style={{
          fontSize: 200,
          fontWeight: 900,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: -8,
          background:
            "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: numOpacity,
          transform: `scale(${numScale})`,
          lineHeight: 1,
        }}
      >
        60
      </div>

      {/* SECONDS label */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: 12,
          textTransform: "uppercase",
          opacity: labelOpacity,
          marginTop: -10,
        }}
      >
        Seconds
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 24,
          color: "#cbd5e1",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 500,
          marginTop: 32,
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        From cancellation to recovery plan
      </div>

      {/* Challenge */}
      <div
        style={{
          marginTop: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: challengeOpacity,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#60a5fa",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Let me prove it
        </span>
        <span
          style={{
            fontSize: 22,
            color: "#60a5fa",
            transform: `translateX(${arrowX + arrowBounce}px)`,
          }}
        >
          →
        </span>
      </div>
    </AbsoluteFill>
  );
};
