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
 * Scene 3: Introducing ChurnAuditor — logo, tagline, Gemini badge.
 */
export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });
  const logoOpacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title
  const titleOpacity = interpolate(frame, [0.3 * fps, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gradient line
  const lineWidth = interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Tagline
  const taglineOpacity = interpolate(
    frame,
    [0.8 * fps, 1.2 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const taglineY = interpolate(frame, [0.8 * fps, 1.2 * fps], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Features
  const features = [
    { icon: "⚡", text: "Intercepts in real time", delay: 1.5 },
    { icon: "🧠", text: "Dual-model AI diagnosis", delay: 1.9 },
    { icon: "🎯", text: "Automated recovery", delay: 2.3 },
  ];

  // Gemini badge
  const badgeOpacity = interpolate(frame, [3 * fps, 3.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeScale = spring({
    frame,
    fps,
    delay: Math.round(3 * fps),
    config: { damping: 15, stiffness: 200 },
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
          height: 2,
          background: "linear-gradient(90deg, transparent, #ef4444, transparent)",
          marginTop: 12,
          marginBottom: 20,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          marginBottom: 48,
        }}
      >
        AI-Powered Churn Recovery in Under 60 Seconds
      </div>

      {/* Feature pills */}
      <div style={{ display: "flex", gap: 24 }}>
        {features.map((f, i) => {
          const fOpacity = interpolate(
            frame,
            [f.delay * fps, (f.delay + 0.3) * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const fScale = spring({
            frame,
            fps,
            delay: Math.round(f.delay * fps),
            config: { damping: 15, stiffness: 200 },
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(148, 163, 184, 0.06)",
                border: "1px solid rgba(148, 163, 184, 0.12)",
                opacity: fOpacity,
                transform: `scale(${fScale})`,
              }}
            >
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#cbd5e1",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              >
                {f.text}
              </span>
            </div>
          );
        })}
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
          Built on Google Gemini
        </span>
      </div>
    </AbsoluteFill>
  );
};
