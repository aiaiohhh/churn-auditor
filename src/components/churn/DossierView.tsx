"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Priority, PipelineStep } from "@/lib/schemas/churn";
import type { AnalysisWithStep } from "@/hooks/useAnalysis";
import { cn } from "@/lib/utils";
import { LiveTimer } from "@/components/churn/LiveTimer";
import { ConfidenceGauge } from "@/components/churn/ConfidenceGauge";
import { ReasoningTrace } from "@/components/churn/ReasoningTrace";

const priorityConfig: Record<Priority, { className: string; label: string }> = {
  urgent: { className: "bg-red-500/10 text-red-600 border-red-500/30", label: "Urgent" },
  high: { className: "bg-orange-500/10 text-orange-600 border-orange-500/30", label: "High" },
  medium: { className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", label: "Medium" },
  low: { className: "bg-blue-500/10 text-blue-600 border-blue-500/30", label: "Low" },
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

// Pipeline step ordering for progress tracking
const PIPELINE_STEPS = ["triaging", "diagnosing", "executing_actions", "complete"] as const;

function getStepState(step: typeof PIPELINE_STEPS[number], currentStep?: PipelineStep): "pending" | "active" | "completed" {
  if (!currentStep) return step === "triaging" ? "active" : "pending";
  const currentIdx = PIPELINE_STEPS.indexOf(currentStep);
  const stepIdx = PIPELINE_STEPS.indexOf(step);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return currentStep === "complete" ? "completed" : "active";
  return "pending";
}

interface DossierViewProps {
  analysis: AnalysisWithStep | null;
}

export function DossierView({ analysis }: DossierViewProps) {
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
      <div className="space-y-4">
        <LiveTimer createdAt={analysis.createdAt} />
        <PipelineProgress analysis={analysis} />
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
        <p className="text-sm font-medium text-red-600">Analysis Failed</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Something went wrong. Try simulating another event.
        </p>
      </div>
    );
  }

  const { dossier } = analysis;

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
          <p className="font-mono text-lg font-bold text-red-600">
            ${analysis.event.mrr}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-xs text-muted-foreground">{analysis.event.plan} plan</p>
        </div>
      </div>

      {/* Live Timer */}
      <LiveTimer
        createdAt={analysis.createdAt}
        completedAt={analysis.completedAt}
        processingTimeMs={analysis.processingTimeMs}
      />

      {/* Pipeline Summary Card */}
      {analysis.pipelineMetadata && (
        <PipelineSummary metadata={analysis.pipelineMetadata} />
      )}

      <Separator className="bg-border/30" />

      {/* Confidence Gauge (replaces cause + confidence + save probability cards) */}
      <ConfidenceGauge
        confidence={dossier.confidence}
        saveProbability={dossier.saveProbability}
        primaryCause={dossier.primaryCause}
      />

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

      {/* AI Reasoning Trace */}
      <ReasoningTrace
        reasoning={dossier.reasoning}
        confidence={dossier.confidence}
      />
    </div>
  );
}

// ─── Pipeline Progress (Analyzing State) ──────────────────────────────

function PipelineProgress({ analysis }: { analysis: AnalysisWithStep }) {
  const currentStep = analysis.pipelineStep;

  const steps = [
    {
      key: "triaging" as const,
      label: "Triage",
      description: "Assessing churn severity with Flash...",
      model: "Flash",
      modelColor: "bg-gemini-blue/10 text-gemini-blue border-gemini-blue/30",
    },
    {
      key: "diagnosing" as const,
      label: "Deep Diagnosis",
      description: "Diagnosing root causes...",
      model: "Pro",
      modelColor: "bg-gemini-purple/10 text-gemini-purple border-gemini-purple/30",
    },
    {
      key: "executing_actions" as const,
      label: "Execute Actions",
      description: "Running recovery actions...",
      model: null,
      modelColor: "",
    },
  ];

  return (
    <div className="flex flex-col items-center py-12">
      <div className="mb-8 text-center">
        <h3 className="text-sm font-semibold text-foreground">
          Analyzing {analysis.event.customerName}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          ${analysis.event.mrr}/mo &middot; {analysis.event.plan}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-0">
        {steps.map((step, i) => {
          const state = getStepState(step.key, currentStep);

          return (
            <div key={step.key} className="relative">
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[15px] top-[32px] h-8 w-px">
                  <div
                    className={cn(
                      "h-full w-full transition-all duration-500",
                      state === "completed"
                        ? "bg-gemini-blue"
                        : "bg-border/50"
                    )}
                  />
                </div>
              )}

              <div className="flex items-start gap-3 pb-8">
                {/* Step indicator */}
                <div className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center">
                  {state === "active" ? (
                    <div className="h-[30px] w-[30px] animate-spin-slow rounded-full border-2 border-gemini-blue/30 border-t-gemini-blue" />
                  ) : state === "completed" ? (
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gemini-blue/10 ring-1 ring-gemini-blue/30">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-gemini-blue" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-muted/30 ring-1 ring-border/50">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Step content */}
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        state === "active"
                          ? "text-foreground"
                          : state === "completed"
                            ? "text-foreground"
                            : "text-muted-foreground/60"
                      )}
                    >
                      {step.label}
                    </span>
                    {step.model && (
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] px-1.5 py-0", step.modelColor)}
                      >
                        {step.model}
                      </Badge>
                    )}
                  </div>
                  {state === "active" && (
                    <p className="mt-0.5 text-xs text-muted-foreground animate-fade-in-up">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pipeline Summary Card (Complete State) ────────────────────────────

function PipelineSummary({ metadata }: { metadata: NonNullable<AnalysisWithStep["pipelineMetadata"]> }) {
  const isGemini = metadata.pipelineSource === "gemini";
  const isProModel = metadata.diagnosisModel === "pro";

  return (
    <Card className="glass-card border-0 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Gemini Pipeline
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0",
              isGemini
                ? "bg-green-500/10 text-green-600 border-green-500/30"
                : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
            )}
          >
            {isGemini ? "Gemini API" : "Demo Mode"}
          </Badge>
        </div>

        {/* Model flow: Flash → Pro/Flash */}
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0.5 bg-gemini-blue/10 text-gemini-blue border-gemini-blue/30"
          >
            Flash
          </Badge>
          <span className="text-muted-foreground/50 text-xs">Triage</span>
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-muted-foreground/40" stroke="currentColor" strokeWidth={2}>
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2 py-0.5",
              isProModel
                ? "bg-gemini-purple/10 text-gemini-purple border-gemini-purple/30"
                : "bg-gemini-blue/10 text-gemini-blue border-gemini-blue/30"
            )}
          >
            {isProModel ? "Pro" : "Flash"}
          </Badge>
          <span className="text-muted-foreground/50 text-xs">Diagnosis</span>
        </div>

        {/* Per-step durations */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {metadata.triageDurationMs != null && (
            <div>
              <p className="font-mono text-xs font-semibold text-foreground">
                {(metadata.triageDurationMs / 1000).toFixed(1)}s
              </p>
              <p className="text-[10px] text-muted-foreground">Triage</p>
            </div>
          )}
          {metadata.diagnosisDurationMs != null && (
            <div>
              <p className="font-mono text-xs font-semibold text-foreground">
                {(metadata.diagnosisDurationMs / 1000).toFixed(1)}s
              </p>
              <p className="text-[10px] text-muted-foreground">Diagnosis</p>
            </div>
          )}
          {metadata.actionsDurationMs != null && (
            <div>
              <p className="font-mono text-xs font-semibold text-foreground">
                {(metadata.actionsDurationMs / 1000).toFixed(1)}s
              </p>
              <p className="text-[10px] text-muted-foreground">Actions</p>
            </div>
          )}
        </div>

        {/* Triage reason */}
        {metadata.triageResult?.reason && (
          <div className="mt-3 rounded-md bg-muted/20 p-2">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground/80">Triage:</span>{" "}
              {metadata.triageResult.reason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
