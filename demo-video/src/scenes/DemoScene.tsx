import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

interface DemoSceneProps {
  /** Image path relative to public/ */
  image: string;
  /** Caption text */
  caption: string;
  /** Subtitle text */
  subtitle: string;
  /** Optional highlight callouts on the screenshot */
  callouts?: Array<{
    x: number; // percentage from left
    y: number; // percentage from top
    label: string;
    delay: number; // seconds
  }>;
}

/**
 * Enhanced demo scene with browser chrome, Ken Burns effect,
 * caption bar, and optional animated callout annotations.
 */
export const DemoScene: React.FC<DemoSceneProps> = ({
  image,
  caption,
  subtitle,
  callouts = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Image entrance
  const imageScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const imageOpacity = interpolate(imageScale, [0, 1], [0, 1]);

  // Ken Burns: slow zoom
  const kenBurns = interpolate(
    frame,
    [0, durationInFrames],
    [1, 1.04],
    { extrapolateRight: "clamp" }
  );
  const combinedScale = interpolate(imageScale, [0, 1], [1.05, 1]) * kenBurns;

  // Caption
  const captionOpacity = interpolate(
    frame,
    [0.3 * fps, 0.6 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const captionY = interpolate(
    frame,
    [0.3 * fps, 0.6 * fps],
    [15, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  // Subtitle
  const subtitleOpacity = interpolate(
    frame,
    [0.5 * fps, 0.8 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
      }}
    >
      {/* Screenshot with browser chrome */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 60,
          right: 60,
          bottom: 120,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 0 60px rgba(0, 0, 0, 0.5), 0 0 120px rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(148, 163, 184, 0.12)",
          opacity: imageOpacity,
          transform: `scale(${combinedScale})`,
        }}
      >
        {/* Browser bar */}
        <div
          style={{
            height: 36,
            background: "#1e293b",
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            gap: 8,
          }}
        >
          {["#ef4444", "#eab308", "#22c55e"].map((color, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: color,
              }}
            />
          ))}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#0f172a",
                borderRadius: 6,
                padding: "4px 40px",
                fontSize: 11,
                color: "#64748b",
                fontFamily: "system-ui",
              }}
            >
              localhost:3001
            </div>
          </div>
        </div>

        {/* Screenshot image */}
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "calc(100% - 36px)",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />

        {/* Callout annotations */}
        {callouts.map((callout, i) => {
          const cOpacity = interpolate(
            frame,
            [callout.delay * fps, (callout.delay + 0.3) * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const cScale = spring({
            frame,
            fps,
            delay: Math.round(callout.delay * fps),
            config: { damping: 12, stiffness: 200 },
          });

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${callout.x}%`,
                top: `calc(36px + ${callout.y}% * (100% - 36px) / 100)`,
                transform: `translate(-50%, -50%) scale(${cScale})`,
                opacity: cOpacity,
                pointerEvents: "none",
              }}
            >
              {/* Pulse ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: 20,
                  border: "2px solid rgba(239, 68, 68, 0.4)",
                  opacity:
                    0.4 +
                    0.3 *
                      Math.sin(
                        ((frame - callout.delay * fps) / fps) * Math.PI * 3
                      ),
                }}
              />
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.9)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "Inter, system-ui, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {callout.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Caption bar */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#f1f5f9",
            fontFamily: "Inter, system-ui, sans-serif",
            opacity: captionOpacity,
            transform: `translateY(${captionY}px)`,
          }}
        >
          {caption}
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#64748b",
            fontFamily: "Inter, system-ui, sans-serif",
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
