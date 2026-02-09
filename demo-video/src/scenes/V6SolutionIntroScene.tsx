import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/**
 * V6 Scene 2: Solution intro — logo, title, gradient line, Gemini badge.
 * 180 frames (6s).
 */
export const V6SolutionIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance — spring
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 200 },
  });
  const logoOpacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title fade
  const titleOpacity = interpolate(frame, [0.5 * fps, 1.0 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gradient line
  const lineWidth = interpolate(frame, [1.0 * fps, 1.5 * fps], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle
  const subtitleOpacity = interpolate(frame, [1.5 * fps, 2.0 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gemini badge
  const badgeOpacity = interpolate(frame, [2.5 * fps, 3.0 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeScale = spring({
    frame,
    fps,
    delay: Math.round(2.5 * fps),
    config: { damping: 12, stiffness: 180 },
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
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background:
            "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.1))",
          border: "2px solid rgba(239, 68, 68, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 24,
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
          opacity: titleOpacity,
        }}
      >
        ChurnAuditor
      </div>

      {/* Gradient line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: "linear-gradient(90deg, #ef4444, #f97316, #ef4444)",
          borderRadius: 2,
          marginTop: 16,
          marginBottom: 16,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          opacity: subtitleOpacity,
          textAlign: "center",
        }}
      >
        AI-powered recovery in under 60 seconds
      </div>

      {/* Gemini badge */}
      <div
        style={{
          marginTop: 40,
          padding: "10px 28px",
          borderRadius: 20,
          background: "rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>✨</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#60a5fa",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: 1,
          }}
        >
          Built on Google Gemini 3
        </span>
      </div>
    </AbsoluteFill>
  );
};
