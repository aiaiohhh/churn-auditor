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
 * Scene 15: Results showcase — 23% churn reduction stat, revenue visualization.
 */
export const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main stat counter
  const statProgress = interpolate(
    frame,
    [0.3 * fps, 1.5 * fps],
    [0, 23],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const statScale = spring({
    frame,
    fps,
    delay: Math.round(0.2 * fps),
    config: { damping: 12, stiffness: 150 },
  });

  // Subtitle
  const subOpacity = interpolate(frame, [1.2 * fps, 1.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Secondary stat
  const secStatOpacity = interpolate(
    frame,
    [2.0 * fps, 2.4 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const secStatY = interpolate(frame, [2.0 * fps, 2.4 * fps], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Revenue text
  const revOpacity = interpolate(frame, [3.0 * fps, 3.4 * fps], [0, 1], {
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
      {/* Decorative ring */}
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: 140,
          border: "3px solid rgba(34, 197, 94, 0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${statScale})`,
          marginBottom: 32,
        }}
      >
        {/* Percentage */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: -4,
            background:
              "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}
        >
          {Math.round(statProgress)}%
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          opacity: subOpacity,
          marginBottom: 8,
        }}
      >
        Churn Reduction
      </div>

      {/* Time frame */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: secStatOpacity,
          transform: `translateY(${secStatY}px)`,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            fontSize: 16,
            fontWeight: 600,
            color: "#22c55e",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Within 90 Days
        </div>
      </div>

      {/* Revenue line */}
      <div
        style={{
          fontSize: 20,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 500,
          opacity: revOpacity,
          textAlign: "center",
        }}
      >
        Real revenue saved. Real customers retained.
      </div>
    </AbsoluteFill>
  );
};
