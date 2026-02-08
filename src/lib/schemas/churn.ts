import { z } from "zod";

// === Core Enums ===
export const ChurnCause = z.enum([
  "pricing",
  "bugs",
  "support",
  "competition",
  "features",
  "onboarding",
  "other",
]);
export type ChurnCause = z.infer<typeof ChurnCause>;

export const ActionType = z.enum([
  "linear_ticket",
  "winback_email",
  "slack_alert",
  "manual_review",
]);
export type ActionType = z.infer<typeof ActionType>;

export const Priority = z.enum(["urgent", "high", "medium", "low"]);
export type Priority = z.infer<typeof Priority>;

// === Churn Event (from Stripe webhook) ===
export const ChurnEventSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  mrr: z.number().positive(),
  plan: z.string(),
  canceledAt: z.string().datetime(),
  reason: z.string().optional(),
  subscriptionId: z.string(),
});
export type ChurnEvent = z.infer<typeof ChurnEventSchema>;

// === Evidence from analysis ===
export const EvidenceSchema = z.object({
  source: z.enum(["support_ticket", "usage_data", "exit_survey"]),
  quote: z.string(),
  relevance: z.number().min(0).max(1),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

// === Recommended Action ===
export const RecommendedActionSchema = z.object({
  type: ActionType,
  priority: Priority,
  description: z.string(),
});
export type RecommendedAction = z.infer<typeof RecommendedActionSchema>;

// === ChurnDossier (AI output) ===
export const ChurnDossierSchema = z.object({
  primaryCause: ChurnCause,
  confidence: z.number().min(0).max(1),
  evidence: z.array(EvidenceSchema),
  saveProbability: z.number().min(0).max(1),
  recommendedActions: z.array(RecommendedActionSchema),
  reasoning: z.string(),
});
export type ChurnDossier = z.infer<typeof ChurnDossierSchema>;

// === Full Analysis Result (stored/displayed) ===
export const AnalysisResultSchema = z.object({
  id: z.string().uuid(),
  event: ChurnEventSchema,
  dossier: ChurnDossierSchema,
  status: z.enum(["pending", "analyzing", "complete", "failed"]),
  executedActions: z.array(
    z.object({
      type: ActionType,
      status: z.enum(["pending", "executing", "success", "failed"]),
      result: z.string().optional(),
      executedAt: z.string().datetime().optional(),
    })
  ),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  processingTimeMs: z.number().optional(),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// === API Contracts ===

// POST /api/analyze
export const AnalyzeRequestSchema = z.object({
  event: ChurnEventSchema,
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const AnalyzeResponseSchema = z.object({
  analysisId: z.string().uuid(),
  status: z.enum(["pending", "analyzing", "complete", "failed"]),
  dossier: ChurnDossierSchema.optional(),
});
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

// POST /api/actions
export const ExecuteActionRequestSchema = z.object({
  analysisId: z.string().uuid(),
  action: RecommendedActionSchema,
  context: z.object({
    customerEmail: z.string().email(),
    customerName: z.string(),
    dossier: ChurnDossierSchema,
  }),
});
export type ExecuteActionRequest = z.infer<typeof ExecuteActionRequestSchema>;

export const ExecuteActionResponseSchema = z.object({
  success: z.boolean(),
  actionType: ActionType,
  result: z.string(),
});
export type ExecuteActionResponse = z.infer<typeof ExecuteActionResponseSchema>;

// GET /api/analyze/[id] - returns AnalysisResult
// GET /api/analyze - returns AnalysisResult[]
