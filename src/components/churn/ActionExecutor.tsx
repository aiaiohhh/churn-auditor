"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnalysisWithStep } from "@/hooks/useAnalysis";

const actionFunctions: Record<string, { fn: string; icon: string; color: string }> = {
  linear_ticket: { fn: "create_linear_ticket", icon: "🎫", color: "text-purple-400" },
  winback_email: { fn: "send_winback_email", icon: "📧", color: "text-blue-400" },
  slack_alert: { fn: "post_slack_alert", icon: "💬", color: "text-green-400" },
  manual_review: { fn: "flag_manual_review", icon: "👤", color: "text-yellow-400" },
};

const actionParams: Record<string, { label: string; field: string }[]> = {
  linear_ticket: [
    { label: "Title", field: "Churn diagnosis: {cause}" },
    { label: "Priority", field: "{priority}" },
    { label: "Assignee", field: "Auto-assigned" },
  ],
  winback_email: [
    { label: "Recipient", field: "{email}" },
    { label: "Template", field: "Personalized winback" },
    { label: "Offer", field: "Based on save probability" },
  ],
  slack_alert: [
    { label: "Channel", field: "#churn-alerts" },
    { label: "Urgency", field: "{priority}" },
    { label: "Mention", field: "@customer-success" },
  ],
  manual_review: [
    { label: "Queue", field: "CS Review Queue" },
    { label: "Priority", field: "{priority}" },
    { label: "SLA", field: "24h response" },
  ],
};

interface ActionExecutorProps {
  analysis: AnalysisWithStep | null;
}

export function ActionExecutor({ analysis }: ActionExecutorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!analysis || analysis.executedActions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-12 text-center">
        <svg viewBox="0 0 24 24" fill="none" className="mb-3 h-6 w-6 text-muted-foreground/40" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-xs text-muted-foreground">No actions executed yet</p>
        <p className="mt-1 text-[10px] text-muted-foreground/60">
          Select a completed analysis to see tool execution
        </p>
      </div>
    );
  }

  const actions = analysis.executedActions;
  const completedCount = actions.filter((a) => a.status === "success").length;
  const allComplete = completedCount === actions.length;

  // Calculate total execution time from executedAt timestamps
  const executionTimes = actions
    .filter((a) => a.executedAt)
    .map((a) => new Date(a.executedAt!).getTime());
  const totalTimeMs = executionTimes.length >= 2
    ? Math.max(...executionTimes) - Math.min(...executionTimes) + 300 // +300ms for last action
    : actions.length * 250; // estimate

  return (
    <div className="space-y-3 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            ACTION ERA
          </span>
          <span className="text-yellow-400">⚡</span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-[10px]",
            allComplete
              ? "bg-green-500/10 text-green-500 border-green-500/20"
              : "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
          )}
        >
          {allComplete ? `${completedCount}/${actions.length} Complete` : `Executing ${completedCount}/${actions.length}`}
        </Badge>
      </div>

      {/* Tagline */}
      <p className="text-[10px] text-muted-foreground">
        AI autonomously executes recovery actions — no human in the loop
      </p>

      {/* Action Cards */}
      <div className="space-y-2">
        {actions.map((action, i) => {
          const config = actionFunctions[action.type] ?? {
            fn: action.type,
            icon: "⚙️",
            color: "text-muted-foreground",
          };
          const params = actionParams[action.type] ?? [];
          const isExpanded = expandedIndex === i;
          const isSuccess = action.status === "success";
          const isFailed = action.status === "failed";
          const isExecuting = action.status === "executing";

          return (
            <div
              key={i}
              className="glass-card animate-slide-in-right overflow-hidden rounded-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Main row */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <span className="text-base shrink-0">{config.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <code className={cn("text-xs font-semibold font-mono", config.color)}>
                      {config.fn}()
                    </code>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/30">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        isSuccess
                          ? "bg-gradient-to-r from-green-600 to-green-400 w-full"
                          : isFailed
                            ? "bg-gradient-to-r from-red-600 to-red-400 w-full"
                            : isExecuting
                              ? "bg-gradient-to-r from-blue-600 to-blue-400 w-3/4 animate-pulse"
                              : "bg-muted/50 w-0"
                      )}
                    />
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {isSuccess && (
                    <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-500 border border-green-500/20">
                      CREATED ✓
                    </span>
                  )}
                  {isFailed && (
                    <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/20">
                      FAILED ✗
                    </span>
                  )}
                  {isExecuting && (
                    <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20 animate-pulse">
                      RUNNING...
                    </span>
                  )}
                  {action.status === "pending" && (
                    <span className="rounded bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      QUEUED
                    </span>
                  )}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={cn("h-3 w-3 text-muted-foreground transition-transform", isExpanded && "rotate-90")}
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {/* Expandable params */}
              {isExpanded && (
                <div className="animate-fade-in-up border-t border-border/20 px-3 py-2 space-y-1.5">
                  {/* Function params */}
                  <div className="rounded-md bg-muted/10 p-2 font-mono text-[10px]">
                    <span className="text-muted-foreground">{"{"}</span>
                    {params.map((p, j) => (
                      <div key={j} className="ml-3">
                        <span className="text-purple-400">{p.label}</span>
                        <span className="text-muted-foreground">: </span>
                        <span className="text-green-400">&quot;{p.field}&quot;</span>
                        {j < params.length - 1 && <span className="text-muted-foreground">,</span>}
                      </div>
                    ))}
                    <span className="text-muted-foreground">{"}"}</span>
                  </div>
                  {/* Result */}
                  {action.result && (
                    <div className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground/80">Result:</span> {action.result}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      {allComplete && (
        <div className="animate-fade-in-up flex items-center justify-between rounded-lg bg-green-500/5 border border-green-500/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-green-400">⚡</span>
            <span className="text-xs font-semibold text-green-400">
              All actions executed
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            Total: {(totalTimeMs / 1000).toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  );
}
