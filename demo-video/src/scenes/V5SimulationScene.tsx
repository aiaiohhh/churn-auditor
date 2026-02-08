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

/**
 * V5 Scene 6: Live simulation — screenshot with prominent 60-second countdown timer.
 * 450 frames (15s).
 */
export const V5SimulationScene: React.FC<{
  image: string;
  analyzeImage?: string;
}> = ({ image, analyzeImage }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Screenshot entrance
  const imgScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const imgOpacity = interpolate(imgScale, [0, 1], [0, 1]);

  // Ken Burns
  const kenBurns = interpolate(frame, [0, durationInFrames], [1, 1.03], {
    extrapolateRight: "clamp",
  });
  const combinedScale = interpolate(imgScale, [0, 1], [1.03, 1]) * kenBurns;

  // Click ripple at ~3s
  const clickFrame = Math.round(2.5 * fps);
  const rippleProgress = interpolate(
    frame,
    [clickFrame, clickFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rippleScale = interpolate(rippleProgress, [0, 1], [0.5, 2.5]);
  const rippleOpacity = interpolate(rippleProgress, [0, 0.3, 1], [0, 0.6, 0]);

  // Timer starts at ~3.5s
  const timerStartFrame = Math.round(3.5 * fps);
  const timerOpacity = interpolate(
    frame,
    [timerStartFrame - 5, timerStartFrame],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const timerScale = spring({
    frame,
    fps,
    delay: timerStartFrame,
    config: { damping: 10, stiffness: 200 },
  });
  const elapsed = Math.max(0, (frame - timerStartFrame) / fps);
  const countdown = Math.max(0, 60 - Math.floor(elapsed));

  // "NOW" text flash
  const nowOpacity = interpolate(
    frame,
    [timerStartFrame, timerStartFrame + 10, timerStartFrame + 20],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "Analyzing..." status
  const analyzeFrame = Math.round(5 * fps);
  const analyzeOpacity = interpolate(
    frame,
    [analyzeFrame, analyzeFrame + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const dots = ".".repeat(
    Math.max(1, 1 + (Math.floor(Math.max(0, frame - analyzeFrame) / 10) % 3))
  );

  // Switch to analyzing screenshot
  const showAnalyze = analyzeImage && frame > analyzeFrame;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
      }}
    >
      {/* Screenshot */}
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
          opacity: imgOpacity,
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
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
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
              localhost:3000/dashboard
            </div>
          </div>
        </div>

        <Img
          src={staticFile(showAnalyze ? analyzeImage! : image)}
          style={{
            width: "100%",
            height: "calc(100% - 36px)",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />

        {/* Click ripple */}
        {rippleOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: "50%",
              width: 60,
              height: 60,
              borderRadius: 30,
              border: "3px solid rgba(59, 130, 246, 0.8)",
              transform: `translate(-50%, -50%) scale(${rippleScale})`,
              opacity: rippleOpacity,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Countdown timer — prominent overlay */}
      {timerOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: timerOpacity,
            transform: `scale(${timerScale})`,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: "rgba(239, 68, 68, 0.1)",
              border: "3px solid rgba(239, 68, 68, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(239, 68, 68, 0.2)",
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                color: countdown <= 10 ? "#ef4444" : "#f87171",
                lineHeight: 1,
              }}
            >
              {countdown}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              SECONDS
            </div>
          </div>
        </div>
      )}

      {/* "NOW" flash */}
      {nowOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 80,
            fontWeight: 900,
            fontFamily: "Inter, system-ui, sans-serif",
            color: "#ef4444",
            opacity: nowOpacity,
            letterSpacing: 8,
            pointerEvents: "none",
          }}
        >
          NOW
        </div>
      )}

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
          }}
        >
          Live Simulation
        </div>
        {analyzeOpacity > 0 && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#60a5fa",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              opacity: analyzeOpacity,
            }}
          >
            Gemini is analyzing{dots}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
