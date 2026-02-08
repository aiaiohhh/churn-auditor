import React from "react";
import {
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface WebcamOverlayProps {
  /** Whether narration is currently active (show speaking indicator) */
  isSpeaking: boolean;
  /** Delay before the overlay appears (in frames) */
  enterDelay?: number;
}

/**
 * UGC-style webcam overlay in the bottom-right corner.
 * Shows a portrait with a rounded frame, green "live" indicator,
 * and a pulsing glow ring when narration is playing.
 */
export const WebcamOverlay: React.FC<WebcamOverlayProps> = ({
  isSpeaking,
  enterDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - enterDelay);

  // Entrance animation
  const enterScale = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  const enterOpacity = interpolate(
    adjustedFrame,
    [0, 0.3 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle breathing animation (scale oscillation)
  const breathe =
    1 + 0.008 * Math.sin((adjustedFrame / fps) * Math.PI * 0.8);

  // Speaking glow pulse
  const speakingPulse = isSpeaking
    ? 0.3 + 0.15 * Math.sin((adjustedFrame / fps) * Math.PI * 4)
    : 0;

  // Green indicator pulse
  const indicatorPulse = 0.7 + 0.3 * Math.sin((adjustedFrame / fps) * Math.PI * 2);

  if (adjustedFrame < 0) return null;

  const size = 160;
  const borderRadius = 24;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        right: 40,
        width: size + 12,
        height: size + 12,
        opacity: enterOpacity,
        transform: `scale(${enterScale * breathe})`,
        zIndex: 100,
      }}
    >
      {/* Glow ring (visible when speaking) */}
      <div
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: borderRadius + 4,
          background: `rgba(239, 68, 68, ${speakingPulse})`,
          filter: "blur(8px)",
        }}
      />

      {/* Border frame */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: borderRadius + 2,
          border: isSpeaking
            ? "3px solid rgba(239, 68, 68, 0.6)"
            : "2px solid rgba(148, 163, 184, 0.2)",
          background: "#0f172a",
          overflow: "hidden",
          transition: "border 0.3s",
        }}
      >
        {/* Avatar image */}
        <Img
          src={staticFile("avatar/presenter.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Subtle dark gradient at bottom for name tag */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background:
              "linear-gradient(transparent, rgba(0,0,0,0.7))",
          }}
        />
      </div>

      {/* LIVE indicator */}
      <div
        style={{
          position: "absolute",
          top: -6,
          left: -6,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "3px 8px",
          borderRadius: 6,
          background: "rgba(239, 68, 68, 0.9)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            background: "#ffffff",
            opacity: indicatorPulse,
          }}
        />
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: 1,
          }}
        >
          LIVE
        </span>
      </div>
    </div>
  );
};
