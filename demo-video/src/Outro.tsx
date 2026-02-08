import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const feature1Opacity = interpolate(
    frame,
    [0.5 * fps, 1 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const feature1Y = interpolate(
    frame,
    [0.5 * fps, 1 * fps],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const feature2Opacity = interpolate(
    frame,
    [0.8 * fps, 1.3 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const feature2Y = interpolate(
    frame,
    [0.8 * fps, 1.3 * fps],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const feature3Opacity = interpolate(
    frame,
    [1.1 * fps, 1.6 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const feature3Y = interpolate(
    frame,
    [1.1 * fps, 1.6 * fps],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const ctaOpacity = interpolate(
    frame,
    [2 * fps, 2.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const ctaScale = spring({
    frame,
    fps,
    delay: Math.round(2 * fps),
    config: { damping: 15, stiffness: 200 },
  });

  const features = [
    {
      icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
      label: "AI Diagnosis in < 60s",
      opacity: feature1Opacity,
      y: feature1Y,
    },
    {
      icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
      label: "Automated Recovery Actions",
      opacity: feature2Opacity,
      y: feature2Y,
    },
    {
      icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941",
      label: "Real-time Churn Analytics",
      opacity: feature3Opacity,
      y: feature3Y,
    },
  ];

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
      {/* Title */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: -2,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          marginBottom: 48,
        }}
      >
        ChurnAuditor
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          gap: 60,
          marginBottom: 60,
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              opacity: f.opacity,
              transform: `translateY(${f.y}px)`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: 28, height: 28 }}
                stroke="#f87171"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={f.icon} />
              </svg>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#cbd5e1",
                fontFamily: "Inter, system-ui, sans-serif",
                textAlign: "center",
              }}
            >
              {f.label}
            </div>
          </div>
        ))}
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
          boxShadow: "0 0 30px rgba(239, 68, 68, 0.4)",
        }}
      >
        Every cancellation tells a story. We turn it into a comeback.
      </div>
    </AbsoluteFill>
  );
};
