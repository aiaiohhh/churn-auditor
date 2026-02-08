import React from "react";
import {
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface PresenterOverlayProps {
  /** Whether narration is currently active */
  isSpeaking: boolean;
  /** Delay before the overlay appears (in frames) */
  enterDelay?: number;
  /** Position: bottom-right (default) or bottom-left */
  position?: "bottom-right" | "bottom-left";
}

/**
 * Presenter overlay — circular/rounded avatar in corner.
 * Shows speaking indicators when narration is active.
 * Falls back to static image if no video available.
 */
export const PresenterOverlay: React.FC<PresenterOverlayProps> = ({
  isSpeaking,
  enterDelay = 0,
  position = "bottom-right",
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

  // Subtle breathing
  const breathe =
    1 + 0.006 * Math.sin((adjustedFrame / fps) * Math.PI * 0.8);

  // Speaking glow
  const speakingGlow = isSpeaking
    ? 0.35 + 0.15 * Math.sin((adjustedFrame / fps) * Math.PI * 4)
    : 0;

  // Speaking border pulse
  const speakingBorderAlpha = isSpeaking
    ? 0.5 + 0.2 * Math.sin((adjustedFrame / fps) * Math.PI * 3)
    : 0.15;

  // Indicator pulse
  const indicatorPulse =
    0.7 + 0.3 * Math.sin((adjustedFrame / fps) * Math.PI * 2);

  if (adjustedFrame < 0) return null;

  const size = 150;
  const borderRadius = 22;
  const isRight = position === "bottom-right";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 36,
        [isRight ? "right" : "left"]: 36,
        width: size + 12,
        height: size + 12,
        opacity: enterOpacity,
        transform: `scale(${enterScale * breathe})`,
        zIndex: 100,
      }}
    >
      {/* Glow ring */}
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: borderRadius + 6,
          background: `rgba(239, 68, 68, ${speakingGlow})`,
          filter: "blur(10px)",
        }}
      />

      {/* Audio wave bars (visible when speaking) */}
      {isSpeaking && (
        <div
          style={{
            position: "absolute",
            bottom: -2,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 2,
            zIndex: 20,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const barHeight =
              3 +
              5 *
                Math.abs(
                  Math.sin(
                    (adjustedFrame / fps) * Math.PI * (3 + i * 0.7) +
                      i * 1.2
                  )
                );
            return (
              <div
                key={i}
                style={{
                  width: 3,
                  height: barHeight,
                  borderRadius: 1.5,
                  background: "#ef4444",
                  opacity: 0.8,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Frame border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: borderRadius + 2,
          border: `2.5px solid rgba(239, 68, 68, ${speakingBorderAlpha})`,
          background: "#0f172a",
          overflow: "hidden",
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

        {/* Bottom gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 36,
            background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
          }}
        />
      </div>

      {/* LIVE badge */}
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
