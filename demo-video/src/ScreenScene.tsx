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

interface ScreenSceneProps {
  image: string;
  caption: string;
  subtitle: string;
  index: number;
}

export const ScreenScene: React.FC<ScreenSceneProps> = ({
  image,
  caption,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Image entrance: scale up with spring
  const imageScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const imageTranslateScale = interpolate(imageScale, [0, 1], [1.05, 1]);

  // Subtle Ken Burns zoom over the scene duration
  const kenBurns = interpolate(frame, [0, 3 * fps], [1, 1.03], {
    extrapolateRight: "clamp",
  });

  const combinedScale = imageTranslateScale * kenBurns;

  // Caption entrance
  const captionOpacity = interpolate(
    frame,
    [0.3 * fps, 0.7 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const captionY = interpolate(
    frame,
    [0.3 * fps, 0.7 * fps],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  // Subtitle entrance (staggered)
  const subtitleOpacity = interpolate(
    frame,
    [0.6 * fps, 1 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Step indicator dot
  const dotScale = spring({
    frame,
    fps,
    delay: Math.round(0.2 * fps),
    config: { damping: 15, stiffness: 200 },
  });

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
          top: 40,
          left: 80,
          right: 80,
          bottom: 140,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow:
            "0 0 60px rgba(0, 0, 0, 0.5), 0 0 120px rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          opacity: imageScale,
          transform: `scale(${combinedScale})`,
        }}
      >
        {/* Browser top bar */}
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
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#ef4444",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#eab308",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#22c55e",
            }}
          />
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

        {/* Screenshot */}
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "calc(100% - 36px)",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
      </div>

      {/* Caption bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Step dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: "#ef4444",
            transform: `scale(${dotScale})`,
            marginBottom: 4,
          }}
        />

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
