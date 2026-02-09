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
 * V6 Scene 1: Fast, dramatic hook — simplified from V5.
 * 180 frames (6s). Two text reveals, no GONE stamp.
 */
export const V6HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Red alert pulse
  const alertPulse = 0.03 + 0.02 * Math.sin((frame / fps) * Math.PI * 2);

  // Line 1: "A customer just cancelled." — slams in fast
  const line1Scale = spring({
    frame,
    fps,
    delay: Math.round(0.1 * fps),
    config: { damping: 10, stiffness: 250 },
  });
  const line1Opacity = interpolate(frame, [0.1 * fps, 0.25 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2: "What happens next?" — fade up after pause
  const line2Opacity = interpolate(frame, [2.5 * fps, 3.0 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [2.5 * fps, 3.0 * fps], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, rgba(239, 68, 68, ${alertPulse}) 0%, #030712 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Line 1 — slams in */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: -3,
          opacity: line1Opacity,
          transform: `scale(${line1Scale})`,
          textAlign: "center",
        }}
      >
        A customer just cancelled.
      </div>

      {/* Line 2 — fade up */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 500,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          marginTop: 24,
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          textAlign: "center",
        }}
      >
        What happens next?
      </div>
    </AbsoluteFill>
  );
};
