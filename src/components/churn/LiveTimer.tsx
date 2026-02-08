"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LiveTimerProps {
  createdAt: string;
  completedAt?: string;
  processingTimeMs?: number;
}

export function LiveTimer({ createdAt, completedAt, processingTimeMs }: LiveTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>(0);
  const startTime = useRef(new Date(createdAt).getTime());

  const isComplete = !!completedAt;
  const finalTime = processingTimeMs
    ? processingTimeMs / 1000
    : completedAt
      ? (new Date(completedAt).getTime() - startTime.current) / 1000
      : 0;

  useEffect(() => {
    if (isComplete) {
      setElapsed(finalTime);
      return;
    }

    const tick = () => {
      const now = Date.now();
      setElapsed((now - startTime.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isComplete, finalTime]);

  const displayTime = isComplete ? finalTime : elapsed;
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const formatted = minutes > 0
    ? `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`
    : seconds.toFixed(1);

  const manualHours = 2;
  const savedMinutes = Math.floor(manualHours * 60 - displayTime / 60);
  const savedSeconds = Math.round((manualHours * 3600 - displayTime) % 60);

  return (
    <div className="animate-fade-in-up glass-card rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2.5}>
                <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 animate-pulse-glow">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          )}
          <div>
            <span
              className={cn(
                "font-mono text-lg font-bold tabular-nums",
                isComplete ? "text-green-500" : "text-blue-400"
              )}
            >
              {formatted}s
            </span>
            <span className="ml-1.5 text-xs text-muted-foreground">
              {isComplete ? "total" : "elapsed"}
            </span>
          </div>
        </div>

        {isComplete && (
          <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-green-500 border border-green-500/20">
            COMPLETE
          </span>
        )}
      </div>

      {/* Time saved comparison */}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Manual process: ~{manualHours}h</span>
        <span className="text-muted-foreground/30">|</span>
        <span className={cn("font-semibold", isComplete ? "text-green-500" : "text-blue-400")}>
          Time saved: {savedMinutes > 0 ? `${savedMinutes}h ${savedSeconds}m` : `${Math.floor(manualHours * 3600 - displayTime)}s`}
        </span>
      </div>
    </div>
  );
}
