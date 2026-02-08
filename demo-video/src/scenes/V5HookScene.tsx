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
 * V5 Scene 1: Fast, dramatic hook — text slams, "GONE" stamp.
 * 240 frames (8s). No countdown timer.
 */
export const V5HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Red alert pulse
  const alertPulse = 0.03 + 0.02 * Math.sin((frame / fps) * Math.PI * 2);

  // Line 1: "A customer just cancelled." — slams in fast
  const line1Scale = spring({
    frame,
    fps,
    delay: Math.round(0.1 * fps),
    config: { damping: 10, stiffness: 250 },
  });
  const line1Opacity = interpolate(frame, [0.1 * fps, 0.25 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2: "Most companies? They find out days later."
  const line2Opacity = interpolate(frame, [2.5 * fps, 2.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [2.5 * fps, 2.8 * fps], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Line 3: "By then —" (brief pause)
  const line3Opacity = interpolate(frame, [4.5 * fps, 4.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "GONE" stamp — slams in with rotation
  const goneDelay = Math.round(5.5 * fps);
  const goneScale = spring({
    frame,
    fps,
    delay: goneDelay,
    config: { damping: 8, stiffness: 300 },
  });
  const goneOpacity = interpolate(
    frame,
    [goneDelay, goneDelay + 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const goneRotation = interpolate(
    goneScale,
    [0, 1],
    [-15, -8],
    { extrapolateRight: "clamp" }
  );

  // Screen shake on GONE stamp
  const shakeX =
    frame >= goneDelay && frame < goneDelay + 8
      ? 4 * Math.sin((frame - goneDelay) * 3) * (1 - (frame - goneDelay) / 8)
      : 0;
  const shakeY =
    frame >= goneDelay && frame < goneDelay + 8
      ? 2 * Math.cos((frame - goneDelay) * 4) * (1 - (frame - goneDelay) / 8)
      : 0;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, rgba(239, 68, 68, ${alertPulse}) 0%, #030712 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Line 1 — slams in */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: "#f1f5f9",
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: -3,
          opacity: line1Opacity,
          transform: `scale(${line1Scale})`,
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
          marginTop: 24,
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          textAlign: "center",
        }}
      >
        Most companies? They find out days later.
      </div>

      {/* Line 3 */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: "#94a3b8",
          fontFamily: "Inter, system-ui, sans-serif",
          marginTop: 20,
          opacity: line3Opacity,
          textAlign: "center",
        }}
      >
        By then —
      </div>

      {/* GONE stamp */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${goneScale}) rotate(${goneRotation}deg)`,
          opacity: goneOpacity,
          fontSize: 180,
          fontWeight: 900,
          fontFamily: "Inter, system-ui, sans-serif",
          color: "transparent",
          WebkitTextStroke: "4px #ef4444",
          letterSpacing: 20,
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        GONE
      </div>

      {/* Red flash on stamp */}
      {frame >= goneDelay && frame < goneDelay + 6 && (
        <AbsoluteFill
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
