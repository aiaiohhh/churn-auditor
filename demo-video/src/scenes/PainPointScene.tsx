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
 * Scene 3: Pain points — scattered data cards that shatter, "TOO LATE" stamp.
 */
export const PainPointScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cards = [
    { label: "Support Tickets", emoji: "🎫", delay: 0.3 },
    { label: "Usage Data", emoji: "📊", delay: 0.8 },
    { label: "Exit Surveys", emoji: "📝", delay: 1.3 },
  ];

  // Calendar flip animation
  const calendarProgress = interpolate(
    frame,
    [1.8 * fps, 2.8 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const dayCount = Math.floor(calendarProgress * 14);

  // Card shatter (cards disperse)
  const shatterProgress = interpolate(
    frame,
    [3.0 * fps, 3.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // TOO LATE stamp
  const stampScale = spring({
    frame,
    fps,
    delay: Math.round(3.5 * fps),
    config: { damping: 8, stiffness: 300 },
  });
  const stampOpacity = interpolate(
    frame,
    [3.5 * fps, 3.7 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
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
      }}
    >
      {/* Data source cards */}
      <div style={{ display: "flex", gap: 40, marginBottom: 60 }}>
        {cards.map((card, i) => {
          const cardScale = spring({
            frame,
            fps,
            delay: Math.round(card.delay * fps),
            config: { damping: 15, stiffness: 200 },
          });
          const cardOpacity = interpolate(
            frame,
            [card.delay * fps, (card.delay + 0.3) * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Shatter: cards fly away
          const shatterX = shatterProgress * (i - 1) * 400;
          const shatterY = shatterProgress * -200;
          const shatterRotate = shatterProgress * (i - 1) * 30;
          const shatterFade = 1 - shatterProgress;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: cardOpacity * shatterFade,
                transform: `scale(${cardScale}) translate(${shatterX}px, ${shatterY}px) rotate(${shatterRotate}deg)`,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 20,
                  background: "rgba(148, 163, 184, 0.06)",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                }}
              >
                {card.emoji}
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#94a3b8",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              >
                {card.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Calendar / day counter */}
      {calendarProgress > 0 && shatterProgress < 1 && (
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#f87171",
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            opacity: 1 - shatterProgress,
          }}
        >
          {dayCount} days later...
        </div>
      )}

      {/* TOO LATE stamp */}
      {stampOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${stampScale}) rotate(-12deg)`,
            opacity: stampOpacity,
          }}
        >
          <div
            style={{
              padding: "20px 60px",
              border: "4px solid #ef4444",
              borderRadius: 8,
              fontSize: 64,
              fontWeight: 900,
              color: "#ef4444",
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            Too Late
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
