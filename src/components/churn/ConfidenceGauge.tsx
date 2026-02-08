"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChurnCause } from "@/lib/schemas/churn";

const causeLabels: Record<ChurnCause, string> = {
  pricing: "Pricing",
  bugs: "Bugs",
  support: "Support",
  competition: "Competition",
  features: "Missing Features",
  onboarding: "Onboarding",
  other: "Other",
};

const causeColors: Record<ChurnCause, string> = {
  pricing: "text-orange-500",
  bugs: "text-red-500",
  support: "text-yellow-500",
  competition: "text-purple-500",
  features: "text-blue-500",
  onboarding: "text-cyan-500",
  other: "text-gray-500",
};

interface ConfidenceGaugeProps {
  confidence: number;
  saveProbability: number;
  primaryCause: ChurnCause;
}

export function ConfidenceGauge({ confidence, saveProbability, primaryCause }: ConfidenceGaugeProps) {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const [animatedSave, setAnimatedSave] = useState(0);

  const confidencePercent = Math.round(confidence * 100);
  const savePercent = Math.round(saveProbability * 100);

  useEffect(() => {
    // Animate from 0 to target over ~800ms
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedConfidence(Math.round(eased * confidencePercent));
      setAnimatedSave(Math.round(eased * savePercent));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [confidencePercent, savePercent]);

  // SVG circle params
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const confidenceOffset = circumference - (animatedConfidence / 100) * circumference;

  // Color based on confidence value
  const getColor = (value: number) => {
    if (value >= 70) return { stroke: "stroke-green-500", text: "text-green-500", glow: "drop-shadow(0 0 8px oklch(0.72 0.19 142))" };
    if (value >= 40) return { stroke: "stroke-yellow-500", text: "text-yellow-500", glow: "drop-shadow(0 0 8px oklch(0.8 0.18 90))" };
    return { stroke: "stroke-red-500", text: "text-red-500", glow: "drop-shadow(0 0 8px oklch(0.63 0.26 29))" };
  };

  const colors = getColor(animatedConfidence);

  return (
    <div className="animate-fade-in-up glass-card rounded-xl p-4">
      <div className="flex items-center gap-6">
        {/* SVG Gauge */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="-rotate-90"
            style={{ filter: colors.glow }}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30"
            />
            {/* Animated progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={confidenceOffset}
              className={cn("transition-all duration-75", colors.stroke)}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-mono text-2xl font-bold", colors.text)}>
              {animatedConfidence}
            </span>
            <span className="text-[10px] text-muted-foreground">% confident</span>
          </div>
        </div>

        {/* Right side: Cause + Save Probability */}
        <div className="flex-1 space-y-3">
          {/* Primary Cause */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Root Cause
            </p>
            <p className={cn("text-sm font-bold mt-0.5", causeColors[primaryCause])}>
              {causeLabels[primaryCause]}
            </p>
          </div>

          {/* Save Probability */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Save Probability
              </p>
              <span
                className={cn(
                  "font-mono text-sm font-bold",
                  savePercent >= 60 ? "text-green-500" : savePercent >= 30 ? "text-yellow-500" : "text-red-500"
                )}
              >
                {animatedSave}%
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted/30">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  savePercent >= 60
                    ? "bg-gradient-to-r from-green-600 to-green-400"
                    : savePercent >= 30
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                      : "bg-gradient-to-r from-red-600 to-red-400"
                )}
                style={{ width: `${animatedSave}%` }}
              />
            </div>
          </div>

          {/* Verdict badge */}
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2",
              savePercent >= 60
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : savePercent >= 30
                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
            )}
          >
            {savePercent >= 60 ? "High Save Potential" : savePercent >= 30 ? "Moderate Risk" : "Critical Risk"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
