import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

/**
 * V6 Scene 6: Event detail — simulate click + analyzing with LiveTimer.
 * 360 frames (12s).
 * Phase 1 (0-4s): simulate-click screenshot with click ripple.
 * Phase 2 (4-12s): analyzing screenshot with countdown timer overlay.
 */
export const V6EventDetailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const phaseSwitch = 4 * fps; // 120 frames

  // Image entrance
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

  // Click ripple at ~2s
  const clickFrame = Math.round(2 * fps);
  const rippleProgress = interpolate(
    frame,
    [clickFrame, clickFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rippleScale = interpolate(rippleProgress, [0, 1], [0.5, 2.5]);
  const rippleOpacity = interpolate(rippleProgress, [0, 0.3, 1], [0, 0.6, 0]);

  // Phase 2 crossfade
  const phase2Opacity = interpolate(
    frame,
    [phaseSwitch - 10, phaseSwitch + 5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Timer starts at phase switch
  const timerStartFrame = phaseSwitch;
  const timerOpacity = interpolate(
    frame,
    [timerStartFrame, timerStartFrame + 10],
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

  // "Analyzing..." status
  const analyzeFrame = phaseSwitch + Math.round(1 * fps);
  const analyzeOpacity = interpolate(
    frame,
    [analyzeFrame, analyzeFrame + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const dots = ".".repeat(
    Math.max(1, 1 + (Math.floor(Math.max(0, frame - analyzeFrame) / 10) % 3))
  );

  // LiveTimer callout
  const liveTimerCalloutFrame = phaseSwitch + Math.round(2 * fps);
  const liveTimerOpacity = interpolate(
    frame,
    [liveTimerCalloutFrame, liveTimerCalloutFrame + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const liveTimerScale = spring({
    frame,
    fps,
    delay: liveTimerCalloutFrame,
    config: { damping: 12, stiffness: 200 },
  });

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

        {/* Phase 1: Simulate click image */}
        <div style={{ position: "relative", width: "100%", height: "calc(100% - 36px)" }}>
          <Img
            src={staticFile("v6-screens/v6-simulate-click.png")}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              opacity: 1 - phase2Opacity,
            }}
          />

          {/* Phase 2: Analyzing image */}
          <Img
            src={staticFile("v6-screens/v6-analyzing.png")}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              opacity: phase2Opacity,
            }}
          />

          {/* Click ripple */}
          {rippleOpacity > 0 && (
            <div
              style={{
                position: "absolute",
                top: "15%",
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

          {/* LiveTimer callout */}
          {liveTimerOpacity > 0 && (
            <div
              style={{
                position: "absolute",
                right: "8%",
                top: "20%",
                transform: `scale(${liveTimerScale})`,
                opacity: liveTimerOpacity,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: 20,
                  border: "2px solid rgba(59, 130, 246, 0.4)",
                  opacity:
                    0.4 +
                    0.3 *
                      Math.sin(
                        ((frame - liveTimerCalloutFrame) / fps) * Math.PI * 3
                      ),
                }}
              />
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "rgba(59, 130, 246, 0.9)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "Inter, system-ui, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                LiveTimer Component
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Countdown timer overlay */}
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
