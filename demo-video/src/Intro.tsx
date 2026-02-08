import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const titleOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(
    frame,
    [0.8 * fps, 1.3 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const subtitleY = interpolate(frame, [0.8 * fps, 1.3 * fps], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const badgeOpacity = interpolate(
    frame,
    [1.5 * fps, 2 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 0.5 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animated gradient line
  const gradientX = interpolate(frame, [0, 2 * fps], [-100, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Logo pulse ring */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          style={{ width: 40, height: 40 }}
          stroke="#f87171"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: -2,
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
        }}
      >
        ChurnAuditor
      </div>

      {/* Gradient line */}
      <div
        style={{
          width: 300,
          height: 2,
          marginTop: 16,
          marginBottom: 24,
          background: `linear-gradient(90deg, transparent ${50 - gradientX / 2}%, #ef4444 50%, transparent ${50 + gradientX / 2}%)`,
          opacity: titleOpacity,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontSize: 28,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        AI-Powered Churn Recovery in 60 Seconds
      </div>

    </AbsoluteFill>
  );
};
