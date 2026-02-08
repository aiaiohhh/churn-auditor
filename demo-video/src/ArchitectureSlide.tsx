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
 * Animated architecture diagram showing the Gemini pipeline:
 * Stripe Webhook → Gemini Flash (Triage) → Gemini Pro (Analysis) → Function Calling → Recovery
 */
export const ArchitectureSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  const nodes = [
    { label: "Stripe\nWebhook", color: "#6366f1", icon: "webhook", delay: 0.3 },
    { label: "Gemini\nFlash", color: "#eab308", icon: "zap", delay: 0.8 },
    { label: "Gemini\nPro", color: "#3b82f6", icon: "brain", delay: 1.3 },
    { label: "Function\nCalling", color: "#22c55e", icon: "tool", delay: 1.8 },
    { label: "Recovery\nActions", color: "#ef4444", icon: "heart", delay: 2.3 },
  ];

  const nodeWidth = 160;
  const nodeHeight = 100;
  const gap = 60;
  const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * gap;
  const startX = (1920 - totalWidth) / 2;
  const centerY = 480;

  // Description labels under each node
  const descriptions = [
    "Subscription\ncancelled",
    "Triage in\nmilliseconds",
    "Deep analysis\n+ structured output",
    "Tool execution\nacross stack",
    "Email, Slack,\ntickets",
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#60a5fa",
            fontFamily: "Inter, system-ui, sans-serif",
            textTransform: "uppercase",
            letterSpacing: 3,
            marginBottom: 12,
          }}
        >
          Under the Hood
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "#f1f5f9",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: -1,
          }}
        >
          Dual-Model Gemini 3 Pipeline
        </div>
      </div>

      {/* Pipeline nodes */}
      {nodes.map((node, i) => {
        const nodeScale = spring({
          frame,
          fps,
          delay: Math.round(node.delay * fps),
          config: { damping: 15, stiffness: 150 },
        });
        const nodeOpacity = interpolate(
          frame,
          [node.delay * fps, (node.delay + 0.3) * fps],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const x = startX + i * (nodeWidth + gap);

        return (
          <React.Fragment key={i}>
            {/* Node box */}
            <div
              style={{
                position: "absolute",
                left: x,
                top: centerY - nodeHeight / 2,
                width: nodeWidth,
                height: nodeHeight,
                borderRadius: 16,
                background: `rgba(${hexToRgb(node.color)}, 0.08)`,
                border: `2px solid rgba(${hexToRgb(node.color)}, 0.3)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: nodeOpacity,
                transform: `scale(${nodeScale})`,
              }}
            >
              <NodeIcon type={node.icon} color={node.color} />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: node.color,
                  fontFamily: "Inter, system-ui, sans-serif",
                  textAlign: "center",
                  lineHeight: 1.2,
                  whiteSpace: "pre-line",
                }}
              >
                {node.label}
              </div>
            </div>

            {/* Description below node */}
            <div
              style={{
                position: "absolute",
                left: x,
                top: centerY + nodeHeight / 2 + 16,
                width: nodeWidth,
                textAlign: "center",
                fontSize: 12,
                color: "#64748b",
                fontFamily: "Inter, system-ui, sans-serif",
                lineHeight: 1.4,
                whiteSpace: "pre-line",
                opacity: nodeOpacity,
              }}
            >
              {descriptions[i]}
            </div>

            {/* Arrow to next node */}
            {i < nodes.length - 1 && (
              <Arrow
                x={x + nodeWidth}
                y={centerY}
                width={gap}
                frame={frame}
                fps={fps}
                delay={node.delay + 0.4}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Bottom timing label */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(
            frame,
            [3.5 * fps, 4 * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "12px 32px",
            borderRadius: 12,
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#f87171",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            Cancellation → Recovery
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#94a3b8",
              fontFamily: "Inter, system-ui, sans-serif",
              marginLeft: 12,
            }}
          >
            in under 60 seconds
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── Helper: Animated arrow ─── */
const Arrow: React.FC<{
  x: number;
  y: number;
  width: number;
  frame: number;
  fps: number;
  delay: number;
}> = ({ x, y, width, frame, fps, delay }) => {
  const progress = interpolate(
    frame,
    [delay * fps, (delay + 0.3) * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
  );

  return (
    <svg
      style={{
        position: "absolute",
        left: x,
        top: y - 10,
        width,
        height: 20,
        opacity: progress,
      }}
      viewBox={`0 0 ${width} 20`}
    >
      <line
        x1={4}
        y1={10}
        x2={width * progress - 8}
        y2={10}
        stroke="#475569"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
      <polygon
        points={`${width - 8},5 ${width - 8},15 ${width},10`}
        fill="#475569"
        opacity={progress > 0.8 ? 1 : 0}
      />
    </svg>
  );
};

/* ─── Helper: Node icons ─── */
const NodeIcon: React.FC<{ type: string; color: string }> = ({
  type,
  color,
}) => {
  const size = 24;
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    style: { width: size, height: size },
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "webhook":
      return (
        <svg {...props}>
          <path d="M18 16.98h1.5c1.65 0 3-1.35 3-3s-1.35-3-3-3H18" />
          <path d="M6 16.98H4.5c-1.65 0-3-1.35-3-3s1.35-3 3-3H6" />
          <path d="M9 10.98l3-3 3 3" />
          <path d="M12 7.98v10" />
        </svg>
      );
    case "zap":
      return (
        <svg {...props}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "brain":
      return (
        <svg {...props}>
          <path d="M9.5 2A5.5 5.5 0 005 7.5c0 .89.29 1.73.78 2.45" />
          <path d="M14.5 2A5.5 5.5 0 0120 7.5c0 .89-.29 1.73-.78 2.45" />
          <path d="M4.22 11.95A5.5 5.5 0 007.5 22h1" />
          <path d="M19.78 11.95A5.5 5.5 0 0116.5 22h-1" />
          <path d="M12 2v20" />
        </svg>
      );
    case "tool":
      return (
        <svg {...props}>
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      );
    default:
      return null;
  }
};

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255, 255, 255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
