"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisResult } from "@/lib/schemas/churn";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  analyzing: { label: "Analyzing", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  complete: { label: "Complete", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-400 border-red-500/20" },
} as const;

function formatMrr(mrr: number): string {
  if (mrr >= 1000) return `$${(mrr / 1000).toFixed(1)}k`;
  return `$${mrr}`;
}

interface ChurnFeedProps {
  analyses: AnalysisResult[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChurnFeed({ analyses, loading, selectedId, onSelect }: ChurnFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/5" />
                <Skeleton className="h-3 w-24 bg-white/5" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16 text-center">
        <div className="mb-3 rounded-full bg-muted/50 p-3">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-muted-foreground" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-muted-foreground">No churn events yet</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Click &quot;Simulate Cancellation&quot; to generate one
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-2 pr-3">
        {analyses.map((analysis, index) => {
          const status = statusConfig[analysis.status];
          const isActive = analysis.status === "analyzing" || analysis.status === "pending";
          const isSelected = analysis.id === selectedId;

          return (
            <button
              key={analysis.id}
              onClick={() => onSelect(analysis.id)}
              className={cn(
                "glass-card glass-card-hover w-full rounded-xl p-4 text-left transition-all duration-200",
                isActive && "animate-pulse-glow",
                isSelected && "ring-1 ring-primary/50 bg-primary/5",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {analysis.event.customerName}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-[10px] px-1.5 py-0", status.className)}
                    >
                      {isActive && (
                        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      )}
                      {status.label}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-red-400">
                      {formatMrr(analysis.event.mrr)}/mo
                    </span>
                    <span className="text-border">|</span>
                    <span>{analysis.event.plan}</span>
                    <span className="text-border">|</span>
                    <span>
                      {formatDistanceToNow(new Date(analysis.event.canceledAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Confidence mini-indicator for complete analyses */}
                {analysis.status === "complete" && (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Save
                    </span>
                    <span
                      className={cn(
                        "font-mono text-xs font-bold",
                        analysis.dossier.saveProbability >= 0.6
                          ? "text-green-400"
                          : analysis.dossier.saveProbability >= 0.3
                            ? "text-yellow-400"
                            : "text-red-400"
                      )}
                    >
                      {Math.round(analysis.dossier.saveProbability * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
