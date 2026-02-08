import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import type { AnalysisResult } from "@/lib/schemas/churn";
import { updateAnalysis, createAnalysis, getAllAnalyses } from "@/lib/db/store";

const SEED_ANALYSES: Omit<AnalysisResult, "id">[] = [
  {
    event: {
      id: uuid(),
      customerId: "cus_pricing_01",
      customerEmail: "sarah.chen@acmecorp.io",
      customerName: "Sarah Chen",
      mrr: 149,
      plan: "Growth $149/mo",
      canceledAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      reason: "too_expensive",
      subscriptionId: "sub_seed_001",
    },
    dossier: {
      primaryCause: "pricing",
      confidence: 0.88,
      evidence: [
        {
          source: "exit_survey",
          quote: "Love the product but our budget was cut this quarter.",
          relevance: 0.95,
        },
        {
          source: "support_ticket",
          quote: "Is there a smaller plan available? We don't use half the features.",
          relevance: 0.82,
        },
      ],
      saveProbability: 0.72,
      recommendedActions: [
        { type: "winback_email", priority: "high", description: "Offer 30% discount for 3 months to retain" },
        { type: "slack_alert", priority: "medium", description: "Notify CS team about high-value save opportunity" },
      ],
      reasoning: "Customer explicitly cited budget constraints. High usage metrics and positive support interactions suggest strong product-market fit. A targeted discount could retain this account.",
    },
    status: "complete",
    executedActions: [
      { type: "winback_email", status: "success", result: "Win-back email sent to sarah.chen@acmecorp.io", executedAt: new Date(Date.now() - 1 * 3600_000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 3600_000 + 8400).toISOString(),
    processingTimeMs: 8400,
  },
  {
    event: {
      id: uuid(),
      customerId: "cus_bugs_02",
      customerEmail: "james.wright@startupxyz.com",
      customerName: "James Wright",
      mrr: 499,
      plan: "Enterprise $499/mo",
      canceledAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
      reason: "product_issues",
      subscriptionId: "sub_seed_002",
    },
    dossier: {
      primaryCause: "bugs",
      confidence: 0.93,
      evidence: [
        {
          source: "support_ticket",
          quote: "Dashboard keeps crashing when loading reports with >10k rows. Filed 3 tickets, no fix.",
          relevance: 0.97,
        },
        {
          source: "usage_data",
          quote: "Login frequency dropped from daily to weekly over last 30 days.",
          relevance: 0.78,
        },
        {
          source: "exit_survey",
          quote: "Reliability issues made it impossible to depend on for client reporting.",
          relevance: 0.91,
        },
      ],
      saveProbability: 0.45,
      recommendedActions: [
        { type: "linear_ticket", priority: "urgent", description: "Fix dashboard crash on large datasets - blocking enterprise customers" },
        { type: "winback_email", priority: "high", description: "Apologize and offer extended trial once fix is deployed" },
        { type: "slack_alert", priority: "urgent", description: "Escalate: Enterprise churn due to unresolved P1 bug" },
      ],
      reasoning: "Multiple support tickets about the same dashboard crash went unresolved. This is a high-MRR enterprise customer lost to a known bug. Immediate engineering fix needed before win-back is viable.",
    },
    status: "complete",
    executedActions: [
      { type: "linear_ticket", status: "success", result: "Created Linear ticket LIN-4821: \"Fix dashboard crash on large datasets\"", executedAt: new Date(Date.now() - 5 * 3600_000 + 6200).toISOString() },
      { type: "slack_alert", status: "success", result: "Slack alert posted to #cs-alerts", executedAt: new Date(Date.now() - 5 * 3600_000 + 6800).toISOString() },
    ],
    createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 3600_000 + 7200).toISOString(),
    processingTimeMs: 7200,
  },
  {
    event: {
      id: uuid(),
      customerId: "cus_comp_03",
      customerEmail: "maria.gonzalez@retailflow.co",
      customerName: "Maria Gonzalez",
      mrr: 79,
      plan: "Starter $79/mo",
      canceledAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
      reason: "switched_to_competitor",
      subscriptionId: "sub_seed_003",
    },
    dossier: {
      primaryCause: "competition",
      confidence: 0.76,
      evidence: [
        {
          source: "exit_survey",
          quote: "Found a tool that integrates better with Shopify out of the box.",
          relevance: 0.89,
        },
        {
          source: "usage_data",
          quote: "Feature usage concentrated on integrations page; never adopted analytics module.",
          relevance: 0.7,
        },
      ],
      saveProbability: 0.28,
      recommendedActions: [
        { type: "manual_review", priority: "medium", description: "Review Shopify integration gaps vs competitor" },
        { type: "winback_email", priority: "low", description: "Send product update when Shopify integration ships" },
      ],
      reasoning: "Customer needed deeper Shopify integration which we currently lack. Low save probability until the integration gap is addressed. Worth flagging for product roadmap discussion.",
    },
    status: "complete",
    executedActions: [
      { type: "manual_review", status: "success", result: "Flagged for manual review, assigned to auto (round-robin)", executedAt: new Date(Date.now() - 12 * 3600_000 + 5500).toISOString() },
    ],
    createdAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    completedAt: new Date(Date.now() - 12 * 3600_000 + 5900).toISOString(),
    processingTimeMs: 5900,
  },
];

export async function POST() {
  // Avoid duplicating seeds if already present
  const existing = getAllAnalyses();
  if (existing.length > 0) {
    return NextResponse.json(
      { message: "Store already has data", count: existing.length },
      { status: 200 }
    );
  }

  const seeded: string[] = [];
  for (const seed of SEED_ANALYSES) {
    const analysis = createAnalysis(seed.event);
    updateAnalysis(analysis.id, {
      dossier: seed.dossier,
      status: seed.status,
      executedActions: seed.executedActions,
      completedAt: seed.completedAt,
      processingTimeMs: seed.processingTimeMs,
    });
    seeded.push(analysis.id);
  }

  return NextResponse.json(
    { message: "Seeded demo data", analysisIds: seeded },
    { status: 201 }
  );
}
