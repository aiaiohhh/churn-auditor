import type { ChurnEvent } from "@/lib/schemas/churn";
import {
  getCustomerContext,
  formatContextForPrompt,
} from "@/lib/prompts/mock-data";

const TRIAGE_SYSTEM = `You are a churn-risk triage analyst. Given a cancellation event and customer context, quickly assess whether this churn warrants deep AI analysis.

Respond in JSON with:
- worthDeepAnalysis (boolean): true if the customer is high-value, the churn is preventable, or the signals are complex
- reason (string): 1-2 sentence justification
- urgency ("urgent" | "high" | "medium" | "low"): how quickly should we act
- estimatedSaveProbability (number 0-1): rough chance we can win them back`;

const DIAGNOSIS_SYSTEM = `You are ChurnAuditor, an expert SaaS retention analyst. Given a cancellation event and rich customer context, produce a comprehensive churn diagnosis.

Your analysis must be evidence-based. Cite specific support tickets, usage patterns, and survey responses. Identify the PRIMARY root cause even when multiple factors exist.

Focus on actionable insights. Each recommended action should be specific and immediately executable.`;

export function buildTriagePrompt(event: ChurnEvent): {
  systemInstruction: string;
  prompt: string;
} {
  const ctx = getCustomerContext(event);
  const contextBlock = formatContextForPrompt(ctx);

  const prompt = `## CANCELLATION EVENT
Customer: ${event.customerName} (${event.customerEmail})
MRR: $${event.mrr}/mo
Plan: ${event.plan}
Canceled: ${event.canceledAt}
Stated reason: ${event.reason ?? "None provided"}

${contextBlock}

Assess whether this churn warrants deep analysis.`;

  return { systemInstruction: TRIAGE_SYSTEM, prompt };
}

export interface TriageResult {
  worthDeepAnalysis: boolean;
  reason: string;
  urgency: "urgent" | "high" | "medium" | "low";
  estimatedSaveProbability: number;
}

export const TRIAGE_RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    worthDeepAnalysis: { type: "boolean" as const },
    reason: { type: "string" as const },
    urgency: {
      type: "string" as const,
      enum: ["urgent", "high", "medium", "low"],
    },
    estimatedSaveProbability: { type: "number" as const },
  },
  required: [
    "worthDeepAnalysis",
    "reason",
    "urgency",
    "estimatedSaveProbability",
  ],
};

export function buildDiagnosisPrompt(event: ChurnEvent): {
  systemInstruction: string;
  prompt: string;
} {
  const ctx = getCustomerContext(event);
  const contextBlock = formatContextForPrompt(ctx);

  const prompt = `## CANCELLATION EVENT
Customer: ${event.customerName} (${event.customerEmail})
Customer ID: ${event.customerId}
MRR: $${event.mrr}/mo
Plan: ${event.plan}
Subscription: ${event.subscriptionId}
Canceled: ${event.canceledAt}
Stated reason: ${event.reason ?? "None provided"}

${contextBlock}

Produce a full churn diagnosis. Identify the primary cause, gather evidence with relevance scores, estimate save probability, and recommend specific actions.

For recommendedActions, use these types:
- "linear_ticket": Create a bug ticket for engineering to fix the issue
- "winback_email": Send a personalized win-back email with an offer
- "slack_alert": Alert the CS team in Slack for immediate outreach
- "manual_review": Flag for human review by account management`;

  return { systemInstruction: DIAGNOSIS_SYSTEM, prompt };
}

export const DOSSIER_RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    primaryCause: {
      type: "string" as const,
      enum: [
        "pricing",
        "bugs",
        "support",
        "competition",
        "features",
        "onboarding",
        "other",
      ],
    },
    confidence: { type: "number" as const },
    evidence: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          source: {
            type: "string" as const,
            enum: ["support_ticket", "usage_data", "exit_survey"],
          },
          quote: { type: "string" as const },
          relevance: { type: "number" as const },
        },
        required: ["source", "quote", "relevance"],
      },
    },
    saveProbability: { type: "number" as const },
    recommendedActions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          type: {
            type: "string" as const,
            enum: [
              "linear_ticket",
              "winback_email",
              "slack_alert",
              "manual_review",
            ],
          },
          priority: {
            type: "string" as const,
            enum: ["urgent", "high", "medium", "low"],
          },
          description: { type: "string" as const },
        },
        required: ["type", "priority", "description"],
      },
    },
    reasoning: { type: "string" as const },
  },
  required: [
    "primaryCause",
    "confidence",
    "evidence",
    "saveProbability",
    "recommendedActions",
    "reasoning",
  ],
};
