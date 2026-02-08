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
 * V5 Scene 9: Actions & Success — action cards, timer stop, "SAVED" status.
 * 300 frames (10s).
 */
export const V5ActionsScene: React.FC<{ image: string }> = ({ image }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screenshot entrance (quick)
  const imgOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Action cards
  const actions = [
    { icon: "📧", label: "Winback Email", status: "Sent", delay: 0.5, color: "#22c55e" },
    { icon: "💬", label: "Slack Alert", status: "Delivered", delay: 1.2, color: "#22c55e" },
    { icon: "🎫", label: "Support Ticket", status: "Logged", delay: 1.9, color: "#22c55e" },
  ];

  // Timer stop at 4.5s — "53 seconds"
  const timerStopFrame = Math.round(4.5 * fps);
  const timerOpacity = interpolate(
    frame,
    [timerStopFrame - 5, timerStopFrame],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const timerScale = spring({
    frame,
    fps,
    delay: timerStopFrame,
    config: { damping: 8, stiffness: 250 },
  });

  // "SAVED" badge at 6s
  const savedFrame = Math.round(6 * fps);
  const savedScale = spring({
    frame,
    fps,
    delay: savedFrame,
    config: { damping: 8, stiffness: 200 },
  });
  const savedOpacity = interpolate(
    frame,
    [savedFrame, savedFrame + 5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Success glow
  const glowOpacity = interpolate(
    frame,
    [savedFrame, savedFrame + 10, savedFrame + 30],
    [0, 0.15, 0.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
      }}
    >
      {/* Success glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, rgba(34, 197, 94, ${glowOpacity}) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Left: Screenshot */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 920,
          bottom: 40,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(148, 163, 184, 0.1)",
          opacity: imgOpacity,
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
      </div>

      {/* Right: Action cards + timer */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          width: 880,
          bottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Action cards */}
        {actions.map((action, i) => {
          const aOpacity = interpolate(
            frame,
            [action.delay * fps, (action.delay + 0.2) * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const aX = interpolate(
            frame,
            [action.delay * fps, (action.delay + 0.3) * fps],
            [40, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            }
          );

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 28px",
                borderRadius: 12,
                background: "rgba(34, 197, 94, 0.06)",
                border: "1px solid rgba(34, 197, 94, 0.15)",
                opacity: aOpacity,
                transform: `translateX(${aX}px)`,
                minWidth: 320,
              }}
            >
              <span style={{ fontSize: 28 }}>{action.icon}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#f1f5f9",
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                >
                  {action.label}
                </div>
              </div>
              <div
                style={{
                  padding: "4px 14px",
                  borderRadius: 6,
                  background: "rgba(34, 197, 94, 0.15)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: action.color,
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              >
                {action.status}
              </div>
            </div>
          );
        })}

        {/* Timer stop */}
        {timerOpacity > 0 && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: timerOpacity,
              transform: `scale(${timerScale})`,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                background:
                  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}
            >
              53s
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#94a3b8",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              Total Recovery Time
            </div>
          </div>
        )}

        {/* SAVED badge */}
        {savedOpacity > 0 && (
          <div
            style={{
              marginTop: 8,
              padding: "12px 36px",
              borderRadius: 12,
              background: "rgba(34, 197, 94, 0.12)",
              border: "2px solid rgba(34, 197, 94, 0.4)",
              opacity: savedOpacity,
              transform: `scale(${savedScale})`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.2)",
            }}
          >
            <span style={{ fontSize: 24 }}>✓</span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#22c55e",
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: 3,
              }}
            >
              CUSTOMER SAVED
            </span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
