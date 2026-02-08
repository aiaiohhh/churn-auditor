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
 * Scene 2: The churn problem — animated $1.6T stat, scattered data visualization.
 */
export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Big stat counter animation
  const statProgress = interpolate(frame, [0.3 * fps, 1.5 * fps], [0, 1.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const statOpacity = interpolate(frame, [0.2 * fps, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const statScale = spring({
    frame,
    fps,
    delay: Math.round(0.2 * fps),
    config: { damping: 15, stiffness: 120 },
  });

  // "Lost to churn every year" label
  const labelOpacity = interpolate(frame, [1 * fps, 1.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Data scatter icons (appear one by one)
  const icons = [
    { label: "Stripe", emoji: "💳", delay: 2.0 },
    { label: "CRM", emoji: "📊", delay: 2.4 },
    { label: "Support", emoji: "🎫", delay: 2.8 },
    { label: "Analytics", emoji: "📈", delay: 3.2 },
  ];

  // "By the time someone reacts..." text
  const bottomOpacity = interpolate(
    frame,
    [4 * fps, 4.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scattered lines between icons
  const scatterOpacity = interpolate(
    frame,
    [3.5 * fps, 4 * fps],
    [0, 0.3],
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
      {/* Big stat */}
      <div
        style={{
          opacity: statOpacity,
          transform: `scale(${statScale})`,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: -4,
            background:
              "linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ${statProgress.toFixed(1)}T
        </span>
      </div>

      <div
        style={{
          fontSize: 24,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 500,
          opacity: labelOpacity,
          marginBottom: 60,
        }}
      >
        lost to customer churn every year
      </div>

      {/* Scattered data sources */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginBottom: 48,
          position: "relative",
        }}
      >
        {/* Dashed lines between icons */}
        <svg
          style={{
            position: "absolute",
            top: 30,
            left: 40,
            width: "calc(100% - 80px)",
            height: 4,
            opacity: scatterOpacity,
          }}
        >
          <line
            x1="0"
            y1="2"
            x2="100%"
            y2="2"
            stroke="#475569"
            strokeWidth={1}
            strokeDasharray="6 8"
          />
        </svg>

        {icons.map((icon, i) => {
          const iconOpacity = interpolate(
            frame,
            [icon.delay * fps, (icon.delay + 0.3) * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const iconY = interpolate(
            frame,
            [icon.delay * fps, (icon.delay + 0.3) * fps],
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
                gap: 8,
                opacity: iconOpacity,
                transform: `translateY(${iconY}px)`,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  background: "rgba(148, 163, 184, 0.08)",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                {icon.emoji}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "#64748b",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 500,
                }}
              >
                {icon.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom text */}
      <div
        style={{
          fontSize: 24,
          color: "#f87171",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 600,
          opacity: bottomOpacity,
          textAlign: "center",
        }}
      >
        By the time someone reacts, the customer is already gone.
      </div>
    </AbsoluteFill>
  );
};
