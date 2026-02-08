"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { AnalysisWithStep } from "@/hooks/useAnalysis";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const statusIcons: Record<string, { icon: React.ReactNode; className: string }> = {
  pending: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    className: "text-yellow-600",
  },
  executing: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
    className: "text-blue-600",
  },
  success: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    className: "text-green-600",
  },
  failed: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    className: "text-red-600",
  },
};

const actionTypeLabels: Record<string, string> = {
  linear_ticket: "Linear Ticket",
  winback_email: "Winback Email",
  slack_alert: "Slack Alert",
  manual_review: "Manual Review",
};

interface ActionCenterProps {
  analysis: AnalysisWithStep | null;
}

export function ActionCenter({ analysis }: ActionCenterProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!analysis || analysis.executedActions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-12 text-center">
        <svg viewBox="0 0 24 24" fill="none" className="mb-3 h-6 w-6 text-muted-foreground/40" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-xs text-muted-foreground">No actions executed yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {analysis.executedActions.map((action, i) => {
        const defaultStatus = { icon: null, className: "text-muted-foreground" };
        const statusInfo = statusIcons[action.status] ?? defaultStatus;
        const isExpanded = expandedIndex === i;

        return (
          <div
            key={i}
            className="glass-card animate-slide-in-right rounded-lg"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <span className={statusInfo.className}>{statusInfo.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground">
                  {actionTypeLabels[action.type] ?? action.type}
                </p>
                {action.executedAt && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(action.executedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] capitalize",
                  action.status === "success" && "bg-green-500/10 text-green-600 border-green-500/30",
                  action.status === "failed" && "bg-red-500/10 text-red-600 border-red-500/30",
                  action.status === "pending" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
                  action.status === "executing" && "bg-blue-500/10 text-blue-600 border-blue-500/30"
                )}
              >
                {action.status}
              </Badge>
              {action.result && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-90")}
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            {isExpanded && action.result && (
              <div className="animate-fade-in-up border-t border-border/20 px-3 py-2">
                <p className="text-xs text-muted-foreground">{action.result}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
