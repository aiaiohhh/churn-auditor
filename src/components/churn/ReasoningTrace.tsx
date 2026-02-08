"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ReasoningTraceProps {
  reasoning: string;
  confidence: number;
  isAnalyzing?: boolean;
}

type StepType = "hypothesis" | "evidence" | "validation" | "conclusion";

interface ReasoningStep {
  text: string;
  type: StepType;
}

const stepConfig: Record<StepType, { icon: string; color: string; label: string }> = {
  hypothesis: { icon: "💭", color: "border-l-purple-500/50", label: "Hypothesis" },
  evidence: { icon: "🔍", color: "border-l-blue-500/50", label: "Evidence" },
  validation: { icon: "✅", color: "border-l-green-500/50", label: "Validation" },
  conclusion: { icon: "📊", color: "border-l-orange-500/50", label: "Conclusion" },
};

function classifyStep(text: string, index: number, total: number): StepType {
  const lower = text.toLowerCase();
  if (lower.includes("evidence") || lower.includes("data") || lower.includes("shows") || lower.includes("indicates") || lower.includes("ticket") || lower.includes("survey")) {
    return "evidence";
  }
  if (lower.includes("confirm") || lower.includes("correlat") || lower.includes("consistent") || lower.includes("validate") || lower.includes("support")) {
    return "validation";
  }
  if (index === total - 1 || lower.includes("therefore") || lower.includes("recommend") || lower.includes("conclusion") || lower.includes("overall")) {
    return "conclusion";
  }
  return "hypothesis";
}

function parseReasoning(reasoning: string): ReasoningStep[] {
  // Split on sentence boundaries or newlines
  const sentences = reasoning
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  return sentences.map((text, i) => ({
    text,
    type: classifyStep(text, i, sentences.length),
  }));
}

export function ReasoningTrace({ reasoning, confidence, isAnalyzing }: ReasoningTraceProps) {
  const steps = parseReasoning(reasoning);
  const [visibleCount, setVisibleCount] = useState(isAnalyzing ? 0 : steps.length);
  const [expanded, setExpanded] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAnalyzing) {
      setVisibleCount(steps.length);
      return;
    }

    // Reveal steps one by one during analysis
    setVisibleCount(0);
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += 1;
      setVisibleCount(current);
      if (current >= steps.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 600);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAnalyzing, steps.length]);

  const confidencePercent = Math.round(confidence * 100);
  const progressPercent = steps.length > 0 ? Math.round((visibleCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
            AI Reasoning Trace
          </span>
          {isAnalyzing && visibleCount < steps.length && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Thinking...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            {visibleCount}/{steps.length} steps
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", expanded && "rotate-90")}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-full bg-muted/30">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      {expanded && (
        <div className="space-y-1.5">
          {steps.slice(0, visibleCount).map((step, i) => {
            const config = stepConfig[step.type];
            return (
              <div
                key={i}
                className={cn(
                  "animate-fade-in-up rounded-md border-l-2 bg-muted/10 px-3 py-2",
                  config.color
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-xs shrink-0">{config.icon}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {config.label}
                    </span>
                    <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">
                      {step.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confidence summary at bottom */}
      {visibleCount === steps.length && steps.length > 0 && (
        <div className="animate-fade-in-up flex items-center justify-between rounded-md bg-muted/20 px-3 py-2">
          <span className="text-[10px] text-muted-foreground">Analysis confidence</span>
          <span
            className={cn(
              "font-mono text-xs font-bold",
              confidencePercent >= 70 ? "text-green-500" : confidencePercent >= 40 ? "text-yellow-500" : "text-red-500"
            )}
          >
            {confidencePercent}%
          </span>
        </div>
      )}
    </div>
  );
}
