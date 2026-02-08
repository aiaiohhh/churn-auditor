import type { AnalysisResult, ChurnEvent, PipelineStep } from "@/lib/schemas/churn";
import { v4 as uuid } from "uuid";

// In-memory store for hackathon MVP
// Replace with Supabase/Postgres for production

const analyses = new Map<string, AnalysisResult>();

// Pipeline step tracking (separate from analysis to avoid race conditions)
const pipelineSteps = new Map<string, PipelineStep>();

export function setPipelineStep(analysisId: string, step: PipelineStep): void {
  pipelineSteps.set(analysisId, step);
}

export function getPipelineStep(analysisId: string): PipelineStep | undefined {
  return pipelineSteps.get(analysisId);
}

export function createAnalysis(event: ChurnEvent): AnalysisResult {
  const analysis: AnalysisResult = {
    id: uuid(),
    event,
    dossier: undefined as unknown as AnalysisResult["dossier"],
    status: "pending",
    executedActions: [],
    createdAt: new Date().toISOString(),
  };
  analyses.set(analysis.id, analysis);
  return analysis;
}

export function getAnalysis(id: string): AnalysisResult | undefined {
  return analyses.get(id);
}

export function getAllAnalyses(): AnalysisResult[] {
  return Array.from(analyses.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateAnalysis(
  id: string,
  updates: Partial<AnalysisResult>
): AnalysisResult | undefined {
  const existing = analyses.get(id);
  if (!existing) return undefined;

  const updated = { ...existing, ...updates };
  analyses.set(id, updated);
  return updated;
}

export function clearStore(): void {
  analyses.clear();
}
