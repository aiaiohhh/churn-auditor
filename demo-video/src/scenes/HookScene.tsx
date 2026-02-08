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
 * Scene 1: Dramatic hook — alert notification, urgent text reveal.
 * "A customer just cancelled..."
 */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Red alert pulse (background)
  const alertPulse =
    0.03 + 0.02 * Math.sin((frame / fps) * Math.PI * 2);

  // Alert icon entrance
  const iconScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  // Glitch/shake on alert
  const shakeX =
    frame < 0.3 * fps
      ? 3 * Math.sin(frame * 2.5) * (1 - frame / (0.3 * fps))
      : 0;

  // Title lines stagger
  const line1Opacity = interpolate(frame, [0.2 * fps, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [0.2 * fps, 0.5 * fps], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const line2Opacity = interpolate(frame, [0.6 * fps, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [0.6 * fps, 0.9 * fps], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const line3Opacity = interpolate(frame, [1.2 * fps, 1.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Countdown timer
  const timerOpacity = interpolate(frame, [1.8 * fps, 2.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const countdown = Math.max(
    0,
    60 - Math.floor(Math.max(0, frame - 2.2 * fps) / fps)
  );

  // Urgency bar at bottom
  const barWidth = interpolate(
    frame,
    [2.2 * fps, 8 * fps],
    [100, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
      {/* Alert icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          background: "rgba(239, 68, 68, 0.15)",
          border: "2px solid rgba(239, 68, 68, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${iconScale}) translateX(${shakeX}px)`,
          marginBottom: 40,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          style={{ width: 40, height: 40 }}
          stroke="#ef4444"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      {/* Line 1 */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: -2,
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          textAlign: "center",
        }}
      >
        A customer just cancelled.
      </div>

      {/* Line 2 */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          marginTop: 16,
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          textAlign: "center",
        }}
      >
        You have{" "}
        <span style={{ color: "#ef4444", fontWeight: 700 }}>60 seconds</span>
        {" "}before they're gone.
      </div>

      {/* Line 3 — the hook */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "#60a5fa",
          fontFamily: "Inter, system-ui, sans-serif",
          marginTop: 32,
          opacity: line3Opacity,
          textAlign: "center",
        }}
      >
        What if you could launch recovery — automatically?
      </div>

      {/* Timer */}
      {timerOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: timerOpacity,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: "#ef4444",
              opacity: 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 3),
            }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: "#f87171",
            }}
          >
            :{String(countdown).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Urgency bar */}
      {barWidth < 100 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "rgba(239, 68, 68, 0.1)",
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              background: "linear-gradient(90deg, #ef4444, #f97316)",
              transition: "none",
            }}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
