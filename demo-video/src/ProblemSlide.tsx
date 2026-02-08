import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

interface ProblemSlideProps {
  /** "hook" | "stats" | "solution" */
  variant: "hook" | "stats" | "solution";
}

export const ProblemSlide: React.FC<ProblemSlideProps> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (variant === "hook") return <HookSlide frame={frame} fps={fps} />;
  if (variant === "stats") return <StatsSlide frame={frame} fps={fps} />;
  return <SolutionSlide frame={frame} fps={fps} />;
};

/* ─── HOOK: "A customer just cancelled..." ─── */
const HookSlide: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const line1Opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line2Opacity = interpolate(
    frame,
    [1.5 * fps, 2 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const line3Opacity = interpolate(
    frame,
    [3 * fps, 3.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Red pulse behind first line
  const pulseScale = interpolate(
    frame,
    [0, 0.3 * fps, 0.6 * fps],
    [0, 1.2, 1],
    { extrapolateRight: "clamp" }
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
        gap: 20,
      }}
    >
      {/* Alert icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          background: "rgba(239, 68, 68, 0.15)",
          border: "2px solid rgba(239, 68, 68, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          transform: `scale(${pulseScale})`,
          opacity: line1Opacity,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          style={{ width: 32, height: 32 }}
          stroke="#f87171"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          textAlign: "center",
          maxWidth: 900,
          lineHeight: 1.3,
          opacity: line1Opacity,
        }}
      >
        A customer just cancelled.
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.5,
          opacity: line2Opacity,
        }}
      >
        In most companies, this triggers{" "}
        <span style={{ color: "#ef4444", fontWeight: 700 }}>nothing.</span>
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: "#64748b",
          fontFamily: "Inter, system-ui, sans-serif",
          textAlign: "center",
          maxWidth: 700,
          opacity: line3Opacity,
        }}
      >
        Days pass. By the time someone notices, it's too late.
      </div>
    </AbsoluteFill>
  );
};

/* ─── STATS: "$1.6 Trillion" ─── */
const StatsSlide: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const numberScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const numberOpacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtextOpacity = interpolate(
    frame,
    [0.8 * fps, 1.3 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const subtextY = interpolate(
    frame,
    [0.8 * fps, 1.3 * fps],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const line2Opacity = interpolate(
    frame,
    [2 * fps, 2.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animated counter for the number
  const countValue = interpolate(frame, [0, 1 * fps], [0, 1.6], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
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
        gap: 16,
      }}
    >
      {/* Big number */}
      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: -4,
          opacity: numberOpacity,
          transform: `scale(${numberScale})`,
          background:
            "linear-gradient(135deg, #ef4444 0%, #f97316 50%, #ef4444 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ${countValue.toFixed(1)}T
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "#cbd5e1",
          fontFamily: "Inter, system-ui, sans-serif",
          opacity: subtextOpacity,
          transform: `translateY(${subtextY}px)`,
        }}
      >
        Lost to customer churn every year
      </div>

      {/* Divider */}
      <div
        style={{
          width: 60,
          height: 2,
          background: "rgba(239, 68, 68, 0.3)",
          marginTop: 20,
          marginBottom: 20,
          opacity: line2Opacity,
        }}
      />

      <div
        style={{
          fontSize: 24,
          fontWeight: 400,
          color: "#64748b",
          fontFamily: "Inter, system-ui, sans-serif",
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.6,
          opacity: line2Opacity,
        }}
      >
        The problem isn't detection.{" "}
        <span style={{ color: "#94a3b8", fontWeight: 600 }}>
          It's response time.
        </span>
      </div>
    </AbsoluteFill>
  );
};

/* ─── SOLUTION: "Meet ChurnAuditor" ─── */
const SolutionSlide: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const logoOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(
    frame,
    [0.3 * fps, 0.8 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const subtitleOpacity = interpolate(
    frame,
    [1 * fps, 1.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const subtitleY = interpolate(
    frame,
    [1 * fps, 1.5 * fps],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const badgeOpacity = interpolate(
    frame,
    [1.8 * fps, 2.3 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
      }}
    >
      {/* Logo icon */}
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
          marginBottom: 24,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
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
          fontSize: 24,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 400,
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.5,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        AI-Powered Churn Recovery in 60 Seconds
      </div>

      {/* Gemini badge */}
      <div
        style={{
          marginTop: 32,
          padding: "8px 20px",
          borderRadius: 20,
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          fontSize: 14,
          fontWeight: 600,
          color: "#60a5fa",
          fontFamily: "Inter, system-ui, sans-serif",
          opacity: badgeOpacity,
        }}
      >
        Built on Google Gemini 3
      </div>
    </AbsoluteFill>
  );
};
