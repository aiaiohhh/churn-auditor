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
 * Scene 8: Closing — logo, tagline, CTA, Gemini competition badge.
 */
export const CloseScene: React.FC = () => {
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

  // Features
  const features = [
    { icon: "🔬", label: "AI Diagnosis in < 60s", delay: 1.0 },
    { icon: "⚡", label: "Automated Recovery Actions", delay: 1.3 },
    { icon: "📊", label: "Real-time Churn Analytics", delay: 1.6 },
  ];

  // CTA tagline
  const ctaOpacity = interpolate(frame, [2.2 * fps, 2.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaScale = spring({
    frame,
    fps,
    delay: Math.round(2.2 * fps),
    config: { damping: 15, stiffness: 180 },
  });

  // Competition badge
  const badgeOpacity = interpolate(frame, [3 * fps, 3.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final tagline
  const finalOpacity = interpolate(frame, [3.8 * fps, 4.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
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
          fontSize: 64,
          fontWeight: 800,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: -2,
          opacity: titleOpacity,
          marginBottom: 40,
        }}
      >
        ChurnAuditor
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: "flex",
          gap: 48,
          marginBottom: 48,
        }}
      >
        {features.map((f, i) => {
          const fOpacity = interpolate(
            frame,
            [f.delay * fps, (f.delay + 0.3) * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const fY = interpolate(
            frame,
            [f.delay * fps, (f.delay + 0.3) * fps],
            [20, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            }
          );

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: fOpacity,
                transform: `translateY(${fY}px)`,
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
                  textAlign: "center",
                }}
              >
                {f.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          padding: "16px 48px",
          borderRadius: 12,
          background:
            "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          fontSize: 20,
          fontWeight: 700,
          color: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          boxShadow: "0 0 40px rgba(239, 68, 68, 0.35)",
          marginBottom: 32,
        }}
      >
        Every cancellation tells a story. We turn it into a comeback.
      </div>

      {/* Competition badge */}
      <div
        style={{
          padding: "8px 24px",
          borderRadius: 16,
          background: "rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          opacity: badgeOpacity,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 14 }}>✨</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#60a5fa",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: 0.5,
          }}
        >
          Google Gemini API Developer Competition
        </span>
      </div>

      {/* Final line */}
      <div
        style={{
          fontSize: 18,
          color: "#64748b",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          opacity: finalOpacity,
        }}
      >
        Stop losing customers. Start recovering them.
      </div>
    </AbsoluteFill>
  );
};
