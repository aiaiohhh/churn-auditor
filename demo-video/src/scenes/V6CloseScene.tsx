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
 * V6 Scene 11: Closing — logo, tagline, Gemini 3 badge.
 * 360 frames (12s).
 */
export const V6CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 200 },
  });
  const logoOpacity = interpolate(frame, [0, 0.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title
  const titleOpacity = interpolate(frame, [0.3 * fps, 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Feature icons — rapid stagger
  const features = [
    { icon: "\u26A1", label: "60s AI Diagnosis", delay: 0.8 },
    { icon: "\uD83D\uDD04", label: "Automated Recovery", delay: 1.0 },
    { icon: "\uD83D\uDCCA", label: "Real-time Analytics", delay: 1.2 },
  ];

  // Tagline line 1
  const tagline1Opacity = interpolate(
    frame,
    [2.5 * fps, 2.8 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const tagline1Y = interpolate(frame, [2.5 * fps, 2.8 * fps], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Tagline line 2
  const tagline2Opacity = interpolate(
    frame,
    [3.5 * fps, 3.8 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const tagline2Scale = spring({
    frame,
    fps,
    delay: Math.round(3.5 * fps),
    config: { damping: 12, stiffness: 180 },
  });

  // Gemini badge
  const badgeOpacity = interpolate(frame, [5.0 * fps, 5.3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final glow
  const glowOpacity = interpolate(
    frame,
    [3.5 * fps, 6 * fps],
    [0, 0.08],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
      {/* Subtle glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, rgba(239, 68, 68, ${glowOpacity}) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

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
          marginBottom: 20,
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
          marginBottom: 32,
        }}
      >
        ChurnAuditor
      </div>

      {/* Feature icons */}
      <div style={{ display: "flex", gap: 48, marginBottom: 56 }}>
        {features.map((f, i) => {
          const fOpacity = interpolate(
            frame,
            [f.delay * fps, (f.delay + 0.15) * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const fScale = spring({
            frame,
            fps,
            delay: Math.round(f.delay * fps),
            config: { damping: 12, stiffness: 250 },
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                opacity: fOpacity,
                transform: `scale(${fScale})`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#cbd5e1",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              >
                {f.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tagline line 1 */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          opacity: tagline1Opacity,
          transform: `translateY(${tagline1Y}px)`,
          textAlign: "center",
        }}
      >
        Every cancellation tells a story.
      </div>

      {/* Tagline line 2 — emphasis */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          fontFamily: "Inter, system-ui, sans-serif",
          background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: tagline2Opacity,
          transform: `scale(${tagline2Scale})`,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        We turn it into a comeback.
      </div>

      {/* Gemini badge */}
      <div
        style={{
          marginTop: 48,
          padding: "10px 28px",
          borderRadius: 20,
          background: "rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          opacity: badgeOpacity,
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
