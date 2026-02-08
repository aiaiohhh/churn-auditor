"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { AnalysisResult, ChurnCause, Priority } from "@/lib/schemas/churn";
import { cn } from "@/lib/utils";

const causeColors: Record<ChurnCause, { bg: string; text: string; label: string }> = {
  pricing: { bg: "bg-orange-500/10", text: "text-orange-400", label: "Pricing" },
  bugs: { bg: "bg-red-500/10", text: "text-red-400", label: "Bugs" },
  support: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Support" },
  competition: { bg: "bg-purple-500/10", text: "text-purple-400", label: "Competition" },
  features: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Missing Features" },
  onboarding: { bg: "bg-cyan-500/10", text: "text-cyan-400", label: "Onboarding" },
  other: { bg: "bg-gray-500/10", text: "text-gray-400", label: "Other" },
};

const priorityConfig: Record<Priority, { className: string; label: string }> = {
  urgent: { className: "bg-red-500/10 text-red-400 border-red-500/20", label: "Urgent" },
  high: { className: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "High" },
  medium: { className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Medium" },
  low: { className: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Low" },
};

const sourceConfig: Record<string, { label: string; icon: string }> = {
  support_ticket: { label: "Support", icon: "ticket" },
  usage_data: { label: "Usage", icon: "chart" },
  exit_survey: { label: "Survey", icon: "form" },
};

const actionTypeLabels: Record<string, string> = {
  linear_ticket: "Linear Ticket",
  winback_email: "Winback Email",
  slack_alert: "Slack Alert",
  manual_review: "Manual Review",
};

interface DossierViewProps {
  analysis: AnalysisResult | null;
}

export function DossierView({ analysis }: DossierViewProps) {
  const [reasoningOpen, setReasoningOpen] = useState(false);

  if (!analysis) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-24 text-center">
        <div className="mb-4 rounded-full bg-muted/30 p-4">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-muted-foreground/50" stroke="currentColor" strokeWidth={1.5}>
            <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Select a churn event</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Click an event from the feed to view its dossier
        </p>
      </div>
    );
  }

  if (analysis.status === "pending" || analysis.status === "analyzing") {
    return (
      <div className="flex h-full flex-col items-center justify-center py-24 text-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 animate-spin-slow rounded-full border-2 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary" stroke="currentColor" strokeWidth={2}>
              <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <p className="text-sm font-medium text-foreground">Analyzing churn event...</p>
        <p className="mt-1 text-xs text-muted-foreground">
          AI is diagnosing root causes and generating recovery actions
        </p>
        <div className="mt-4 w-48">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full animate-shimmer rounded-full bg-primary/40" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (analysis.status === "failed") {
    return (
      <div className="flex h-full flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 rounded-full bg-red-500/10 p-4">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-red-400" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-400">Analysis Failed</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Something went wrong. Try simulating another event.
        </p>
      </div>
    );
  }

  const { dossier } = analysis;
  const cause = causeColors[dossier.primaryCause];
  const confidencePercent = Math.round(dossier.confidence * 100);
  const savePercent = Math.round(dossier.saveProbability * 100);

  return (
    <div className="animate-fade-in-up space-y-5">
      {/* Customer Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {analysis.event.customerName}
          </h2>
          <p className="text-xs text-muted-foreground">{analysis.event.customerEmail}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold text-red-400">
            ${analysis.event.mrr}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-xs text-muted-foreground">{analysis.event.plan} plan</p>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Primary Cause + Confidence Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Primary Cause
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={cn("text-sm px-3 py-1 border", cause.bg, cause.text)}>
              {cause.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="font-mono text-2xl font-bold text-foreground">
                {confidencePercent}
              </span>
              <span className="mb-0.5 text-xs text-muted-foreground">%</span>
            </div>
            <Progress
              value={confidencePercent}
              className="mt-2 h-1.5 bg-muted/50"
            />
          </CardContent>
        </Card>
      </div>

      {/* Save Probability Gauge */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Save Probability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative h-3 overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn(
                    "animate-progress-fill absolute inset-y-0 left-0 rounded-full transition-all",
                    savePercent >= 60
                      ? "bg-gradient-to-r from-green-600 to-green-400"
                      : savePercent >= 30
                        ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                        : "bg-gradient-to-r from-red-600 to-red-400"
                  )}
                  style={{ width: `${savePercent}%` }}
                />
              </div>
            </div>
            <span
              className={cn(
                "font-mono text-xl font-bold",
                savePercent >= 60
                  ? "text-green-400"
                  : savePercent >= 30
                    ? "text-yellow-400"
                    : "text-red-400"
              )}
            >
              {savePercent}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Cards */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Evidence
        </h3>
        <div className="space-y-2">
          {dossier.evidence.map((ev, i) => {
            const source = sourceConfig[ev.source] ?? { label: ev.source, icon: "info" };
            return (
              <div
                key={i}
                className="glass-card animate-slide-in-right rounded-lg p-3"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-[10px] text-primary border-primary/20"
                  >
                    {source.label}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    relevance: {Math.round(ev.relevance * 100)}%
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  &ldquo;{ev.quote}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Actions */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recommended Actions
        </h3>
        <div className="space-y-2">
          {dossier.recommendedActions.map((action, i) => {
            const priority = priorityConfig[action.priority];
            return (
              <div
                key={i}
                className="glass-card animate-slide-in-right flex items-start gap-3 rounded-lg p-3"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[10px]", priority.className)}
                >
                  {priority.label}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">
                    {actionTypeLabels[action.type] ?? action.type}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasoning (Collapsible) */}
      <div>
        <button
          onClick={() => setReasoningOpen(!reasoningOpen)}
          className="flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={cn("h-3.5 w-3.5 transition-transform", reasoningOpen && "rotate-90")}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          AI Reasoning
        </button>
        {reasoningOpen && (
          <div className="mt-3 animate-fade-in-up rounded-lg bg-muted/20 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {dossier.reasoning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
