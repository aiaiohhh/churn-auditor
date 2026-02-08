import { v4 as uuid } from "uuid";
import type {
  ChurnEvent,
  ChurnDossier,
  ChurnCause,
  Evidence,
  RecommendedAction,
  AnalysisResult,
  PipelineMetadata,
} from "@/lib/schemas/churn";
import { type Result, ok } from "@/lib/errors";
import { executeTool } from "@/lib/tools/executor";
import { setPipelineStep } from "@/lib/db/store";

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    primaryCause: "bugs",
    confidence: 0.89,
    saveProbability: 0.65,
    reasoning:
      "Multiple unresolved support tickets indicate product reliability issues drove this cancellation. The customer's usage dropped sharply after reporting a critical dashboard performance bug (TKT-4821) and a broken CSV export (TKT-4856). Their exit survey explicitly mentions 'recent bugs killing productivity' and finding a competitor. However, the positive sentiment toward the product concept and willingness to return suggest a winback is feasible if issues are resolved.",
    evidence: [
      {
        source: "support_ticket",
        quote:
          "Dashboard takes 15+ seconds to load since last week's update. This is blocking our morning standup workflow.",
        relevance: 0.95,
      },
      {
        source: "support_ticket",
        quote:
          "Exporting more than 10k rows the CSV export times out. We need this for our monthly reporting.",
        relevance: 0.82,
      },
      {
        source: "usage_data",
        quote:
          "Login frequency dropped 86% (22 to 3 sessions) and API calls dropped 94% (2,380 to 142) in the last 30 days.",
        relevance: 0.91,
      },
      {
        source: "exit_survey",
        quote:
          "Love the concept but the recent bugs have been killing our productivity. We found a competitor that just works.",
        relevance: 0.97,
      },
    ],
    actions: [
      {
        type: "slack_alert",
        priority: "urgent",
        description:
          "High-MRR customer churned due to unresolved bugs. Two open tickets (TKT-4821, TKT-4856) need immediate escalation.",
      },
      {
        type: "linear_ticket",
        priority: "urgent",
        description:
          "Fix dashboard performance regression causing 15s+ load times. Directly caused churn of customer with significant MRR.",
      },
      {
        type: "winback_email",
        priority: "high",
        description:
          "Customer expressed willingness to return if issues are fixed. Send personalized email acknowledging bugs and offering timeline for fixes plus discount.",
      },
    ],
  },
  {
    primaryCause: "pricing",
    confidence: 0.76,
    saveProbability: 0.52,
    reasoning:
      "Customer's inquiry about plan switching and nonprofit discounts, combined with moderate usage decline, suggests pricing pressure. The customer is actively using core features but may have found a more affordable alternative. Their exit survey satisfaction score of 3/5 indicates the product meets needs but cost-benefit analysis shifted.",
    evidence: [
      {
        source: "support_ticket",
        quote:
          "Can you clarify what happens to our data if we switch from annual to monthly? Also, are there any discounts for nonprofits?",
        relevance: 0.88,
      },
      {
        source: "usage_data",
        quote:
          "Feature adoption remains strong (dashboard 85%, reports 60%) but login frequency declined, suggesting evaluation of alternatives.",
        relevance: 0.72,
      },
      {
        source: "exit_survey",
        quote:
          "Love the concept but the recent bugs have been killing our productivity. We found a competitor that just works.",
        relevance: 0.65,
      },
    ],
    actions: [
      {
        type: "winback_email",
        priority: "high",
        description:
          "Offer a 20% discount or custom pricing plan. Highlight unique value propositions vs competitors.",
      },
      {
        type: "slack_alert",
        priority: "medium",
        description:
          "Pricing-sensitive customer churned. Consider reviewing pricing tiers for similar customer segments.",
      },
      {
        type: "manual_review",
        priority: "medium",
        description:
          "Account manager should assess whether a custom enterprise plan could retain this and similar accounts.",
      },
    ],
  },
  {
    primaryCause: "support",
    confidence: 0.82,
    saveProbability: 0.58,
    reasoning:
      "Escalated support ticket left unresolved for over a week signals a support process failure. The customer's frustration escalated from a technical issue to a service quality concern. Combined with the steep usage decline, this indicates the customer lost confidence in the team's ability to support their needs.",
    evidence: [
      {
        source: "support_ticket",
        quote:
          "Dashboard takes 15+ seconds to load since last week's update. This is blocking our morning standup workflow.",
        relevance: 0.9,
      },
      {
        source: "usage_data",
        quote:
          "API calls dropped 94% month-over-month, indicating the customer stopped relying on the platform for critical workflows.",
        relevance: 0.85,
      },
      {
        source: "exit_survey",
        quote:
          "We found a competitor that just works. Might come back if things stabilize.",
        relevance: 0.88,
      },
    ],
    actions: [
      {
        type: "slack_alert",
        priority: "urgent",
        description:
          "Support response time likely contributed to churn. Escalated ticket TKT-4821 was unresolved for 10+ days.",
      },
      {
        type: "winback_email",
        priority: "high",
        description:
          "Personal apology from support lead with direct line for future issues. Offer dedicated support contact.",
      },
    ],
  },
  {
    primaryCause: "competition",
    confidence: 0.71,
    saveProbability: 0.38,
    reasoning:
      "Exit survey explicitly mentions finding a competitor. Combined with the timing of usage decline and unresolved product issues, the customer likely evaluated alternatives and found one with better reliability. Low save probability because the switching cost has already been paid.",
    evidence: [
      {
        source: "exit_survey",
        quote:
          "We found a competitor that just works. Might come back if things stabilize.",
        relevance: 0.95,
      },
      {
        source: "usage_data",
        quote:
          "Login frequency dropped from 22 to 3 sessions over 30 days, consistent with gradual migration to alternative platform.",
        relevance: 0.78,
      },
    ],
    actions: [
      {
        type: "manual_review",
        priority: "high",
        description:
          "Competitive loss -- identify which competitor won this account and assess feature gaps.",
      },
      {
        type: "winback_email",
        priority: "medium",
        description:
          "Acknowledge their feedback, share product roadmap highlights, and offer to reconnect in 30 days after improvements ship.",
      },
      {
        type: "slack_alert",
        priority: "medium",
        description:
          "Competitive churn detected. Product team should review competitive positioning for this segment.",
      },
    ],
  },
];

interface DemoScenario {
  primaryCause: ChurnCause;
  confidence: number;
  saveProbability: number;
  reasoning: string;
  evidence: Evidence[];
  actions: RecommendedAction[];
}

function pickScenario(event: ChurnEvent): DemoScenario {
  // Deterministic pick based on customer ID so the same customer always gets the same result
  let hash = 0;
  for (let i = 0; i < event.customerId.length; i++) {
    hash = (hash * 31 + event.customerId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % DEMO_SCENARIOS.length;
  return DEMO_SCENARIOS[index]!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeChurnDemo(
  event: ChurnEvent,
  existingAnalysisId?: string
): Promise<Result<AnalysisResult>> {
  const startTime = Date.now();
  const analysisId = existingAnalysisId ?? uuid();

  // Simulate triage step
  if (existingAnalysisId) setPipelineStep(existingAnalysisId, "triaging");
  const triageStart = Date.now();
  await sleep(800 + Math.random() * 400);
  const triageDurationMs = Date.now() - triageStart;

  // Simulate diagnosis step
  if (existingAnalysisId) setPipelineStep(existingAnalysisId, "diagnosing");
  const diagnosisStart = Date.now();
  await sleep(1500 + Math.random() * 1000);
  const diagnosisDurationMs = Date.now() - diagnosisStart;

  const scenario = pickScenario(event);

  const dossier: ChurnDossier = {
    primaryCause: scenario.primaryCause,
    confidence: scenario.confidence,
    saveProbability: scenario.saveProbability,
    reasoning: scenario.reasoning,
    evidence: scenario.evidence,
    recommendedActions: scenario.actions,
  };

  // Execute actions through the real executor (mock integrations)
  if (existingAnalysisId) setPipelineStep(existingAnalysisId, "executing_actions");
  const actionsStart = Date.now();
  const executedActions = [];
  for (const action of dossier.recommendedActions) {
    const toolName =
      action.type === "linear_ticket"
        ? "create_linear_ticket"
        : action.type === "winback_email"
          ? "send_winback_email"
          : action.type === "slack_alert"
            ? "send_slack_alert"
            : "flag_for_manual_review";

    const result = await executeTool(toolName, {
      title: action.description,
      description: action.description,
      priority: action.priority,
      to: event.customerEmail,
      subject: `Re: ${event.customerName}`,
      body: action.description,
      channel: "#cs-alerts",
      message: action.description,
      urgency: action.priority,
      reason: action.description,
      assignee: "auto",
    });

    executedActions.push({
      type: action.type,
      status: result.status as "success" | "failed",
      result: result.result,
      executedAt: result.executedAt,
    });
  }
  const actionsDurationMs = Date.now() - actionsStart;

  if (existingAnalysisId) setPipelineStep(existingAnalysisId, "complete");

  const pipelineMetadata: PipelineMetadata = {
    triageResult: {
      worthDeepAnalysis: true,
      reason: "Demo mode — simulated triage assessment",
      urgency: "high",
      estimatedSaveProbability: scenario.saveProbability,
    },
    diagnosisModel: "flash",
    triageDurationMs,
    diagnosisDurationMs,
    actionsDurationMs,
    pipelineSource: "demo",
  };

  const analysisResult: AnalysisResult = {
    id: analysisId,
    event,
    dossier,
    status: "complete",
    executedActions,
    createdAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    processingTimeMs: Date.now() - startTime,
    pipelineMetadata,
  };

  return ok(analysisResult);
}
