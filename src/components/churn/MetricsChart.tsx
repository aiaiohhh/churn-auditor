"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult, ChurnCause } from "@/lib/schemas/churn";
import { cn } from "@/lib/utils";

const causeColors: Record<ChurnCause, string> = {
  pricing: "bg-orange-500",
  bugs: "bg-red-500",
  support: "bg-yellow-500",
  competition: "bg-purple-500",
  features: "bg-blue-500",
  onboarding: "bg-cyan-500",
  other: "bg-gray-500",
};

const causeLabels: Record<ChurnCause, string> = {
  pricing: "Pricing",
  bugs: "Bugs",
  support: "Support",
  competition: "Competition",
  features: "Features",
  onboarding: "Onboarding",
  other: "Other",
};

interface MetricsChartProps {
  analyses: AnalysisResult[];
}

export function MetricsChart({ analyses }: MetricsChartProps) {
  const completed = analyses.filter((a) => a.status === "complete");

  // Calculate cause breakdown
  const causeCounts: Partial<Record<ChurnCause, number>> = {};
  for (const a of completed) {
    const cause = a.dossier.primaryCause;
    causeCounts[cause] = (causeCounts[cause] ?? 0) + 1;
  }

  const totalCompleted = completed.length;
  const avgConfidence =
    totalCompleted > 0
      ? Math.round(
          (completed.reduce((sum, a) => sum + a.dossier.confidence, 0) / totalCompleted) * 100
        )
      : 0;
  const avgSave =
    totalCompleted > 0
      ? Math.round(
          (completed.reduce((sum, a) => sum + a.dossier.saveProbability, 0) / totalCompleted) * 100
        )
      : 0;

  // Sort causes by count descending
  const sortedCauses = Object.entries(causeCounts)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0)) as [ChurnCause, number][];

  const maxCount = sortedCauses.length > 0 ? sortedCauses[0]![1] : 1;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="glass-card border-0">
          <CardContent className="p-3 text-center">
            <p className="font-mono text-2xl font-bold text-foreground">
              {analyses.length}
            </p>
            <p className="text-[10px] text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3 text-center">
            <p className="font-mono text-2xl font-bold text-primary">
              {avgConfidence}%
            </p>
            <p className="text-[10px] text-muted-foreground">Avg Confidence</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3 text-center">
            <p
              className={cn(
                "font-mono text-2xl font-bold",
                avgSave >= 50 ? "text-green-600" : "text-yellow-600"
              )}
            >
              {avgSave}%
            </p>
            <p className="text-[10px] text-muted-foreground">Avg Save Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Cause Breakdown Bar Chart */}
      {sortedCauses.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Churn Causes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {sortedCauses.map(([cause, count]) => (
              <div key={cause} className="group">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground/80">
                    {causeLabels[cause]}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                  <div
                    className={cn(
                      "animate-progress-fill h-full rounded-full transition-all",
                      causeColors[cause]
                    )}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
