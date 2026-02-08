"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type Stage = "idle" | "detecting" | "analyzing" | "diagnosed" | "recovering" | "saved";

const STAGES: { stage: Stage; label: string; duration: number }[] = [
  { stage: "idle", label: "", duration: 1000 },
  { stage: "detecting", label: "Cancellation detected", duration: 2000 },
  { stage: "analyzing", label: "AI diagnosing root cause...", duration: 3500 },
  { stage: "diagnosed", label: "Root cause: Pricing friction", duration: 2500 },
  { stage: "recovering", label: "Executing recovery actions...", duration: 2500 },
  { stage: "saved", label: "Customer saved!", duration: 3000 },
];

export function CounterDemo() {
  const [stageIndex, setStageIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const current = STAGES[stageIndex] ?? STAGES[0];

  useEffect(() => {
    if (current === undefined) return;
    const timer = setTimeout(() => {
      if (stageIndex < STAGES.length - 1) {
        setStageIndex(stageIndex + 1);
      } else {
        setStageIndex(0);
        setSeconds(0);
      }
    }, current.duration);
    return () => clearTimeout(timer);
  }, [stageIndex, current]);

  useEffect(() => {
    if (current === undefined) return;
    if (current.stage === "idle" || current.stage === "saved") return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [stageIndex, current]);

  const stageColor: Record<Stage, string> = {
    idle: "text-muted-foreground",
    detecting: "text-churn-red",
    analyzing: "text-churn-orange",
    diagnosed: "text-churn-blue",
    recovering: "text-churn-purple",
    saved: "text-churn-green",
  };

  if (current === undefined) return null;

  return (
    <div className="glass-card-landing overflow-hidden rounded-2xl p-1">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 rounded-t-xl bg-black/[0.03] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="mx-auto flex-1 text-center">
          <div className="mx-auto max-w-xs rounded-md bg-black/[0.04] px-3 py-1 text-xs text-muted-foreground">
            churnauditor.app/dashboard
          </div>
        </div>
      </div>

      {/* Demo content */}
      <div className="relative flex min-h-[280px] flex-col items-center justify-center gap-6 p-8">
        {/* Timer */}
        <div className="font-mono text-5xl font-bold tabular-nums tracking-tight text-foreground">
          {String(Math.floor(seconds / 60)).padStart(1, "0")}:
          {String(seconds % 60).padStart(2, "0")}
        </div>

        {/* Stage indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            {current.stage !== "idle" && (
              <>
                <p className={`text-lg font-medium ${stageColor[current.stage]}`}>
                  {current.label}
                </p>

                {/* Stage-specific visuals */}
                {current.stage === "detecting" && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="animate-pulse">
                      customer.subscription.deleted
                    </Badge>
                  </div>
                )}

                {current.stage === "analyzing" && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-48 overflow-hidden rounded-full bg-black/[0.06]">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "linear" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Gemini AI</span>
                  </div>
                )}

                {current.stage === "diagnosed" && (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge className="bg-churn-orange/10 text-churn-orange">
                      Pricing
                    </Badge>
                    <Badge className="bg-black/[0.04] text-muted-foreground">
                      87% confidence
                    </Badge>
                    <Badge className="bg-churn-green/10 text-churn-green">
                      62% save probability
                    </Badge>
                  </div>
                )}

                {current.stage === "recovering" && (
                  <div className="flex flex-col gap-2 text-sm">
                    {["Sending winback email...", "Creating Linear ticket...", "Posting Slack alert..."].map(
                      (action, i) => (
                        <motion.div
                          key={action}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.5 }}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.5 + 0.4 }}
                            className="text-churn-green"
                          >
                            ✓
                          </motion.span>
                          {action}
                        </motion.div>
                      )
                    )}
                  </div>
                )}

                {current.stage === "saved" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-churn-green/10 ring-2 ring-churn-green/30"
                  >
                    <svg
                      className="h-8 w-8 text-churn-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Stage dots */}
        <div className="flex gap-2">
          {STAGES.filter((s) => s.stage !== "idle").map((s, i) => (
            <div
              key={s.stage}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                stageIndex > i
                  ? "w-6 bg-gemini-blue"
                  : stageIndex === i + 1
                    ? "w-6 bg-gemini-blue/50"
                    : "w-1.5 bg-black/[0.1]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
