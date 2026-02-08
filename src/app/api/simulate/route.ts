import { NextResponse, after } from "next/server";
import { v4 as uuid } from "uuid";
import type { ChurnEvent } from "@/lib/schemas/churn";
import { createAnalysis, updateAnalysis } from "@/lib/db/store";
import { analyzeChurn } from "@/lib/gemini/agent";

interface CustomerProfile {
  name: string;
  email: string;
  plan: string;
  mrr: number;
  reasons: string[];
}

const CUSTOMER_POOL: CustomerProfile[] = [
  {
    name: "Alex Rivera",
    email: "alex.rivera@neonlabs.io",
    plan: "Growth $149/mo",
    mrr: 149,
    reasons: ["too_expensive", "missing_features"],
  },
  {
    name: "Priya Sharma",
    email: "priya@cloudmatrix.dev",
    plan: "Enterprise $499/mo",
    mrr: 499,
    reasons: ["product_issues", "poor_support"],
  },
  {
    name: "Tom Eriksson",
    email: "tom.eriksson@nordicretail.se",
    plan: "Starter $79/mo",
    mrr: 79,
    reasons: ["switched_to_competitor", "not_enough_value"],
  },
  {
    name: "Lena Park",
    email: "lena.park@finflow.co",
    plan: "Growth $149/mo",
    mrr: 149,
    reasons: ["too_expensive", "switched_to_competitor"],
  },
  {
    name: "David Okonkwo",
    email: "david@scaleops.com",
    plan: "Enterprise $499/mo",
    mrr: 499,
    reasons: ["product_issues", "missing_features", "poor_support"],
  },
  {
    name: "Emily Watson",
    email: "emily.watson@brightpath.edu",
    plan: "Starter $79/mo",
    mrr: 79,
    reasons: ["budget_cut", "not_enough_value"],
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateChurnEvent(): ChurnEvent {
  const profile = pickRandom(CUSTOMER_POOL);
  return {
    id: uuid(),
    customerId: `cus_sim_${Math.random().toString(36).slice(2, 10)}`,
    customerEmail: profile.email,
    customerName: profile.name,
    mrr: profile.mrr,
    plan: profile.plan,
    canceledAt: new Date().toISOString(),
    reason: pickRandom(profile.reasons),
    subscriptionId: `sub_sim_${Math.random().toString(36).slice(2, 10)}`,
  };
}

export async function POST() {
  const event = generateChurnEvent();
  const analysis = createAnalysis(event);

  // Run analysis after response is sent (Vercel keeps function alive for after() tasks)
  after(runAnalysis(analysis.id, event));

  return NextResponse.json(
    { analysisId: analysis.id, event, status: "analyzing" },
    { status: 201 }
  );
}

async function runAnalysis(analysisId: string, event: ChurnEvent) {
  updateAnalysis(analysisId, { status: "analyzing" });
  try {
    const result = await analyzeChurn(event);

    if (!result.ok) {
      console.error("Simulation analysis failed:", result.error);
      updateAnalysis(analysisId, { status: "failed" });
      return;
    }

    const ai = result.value;
    updateAnalysis(analysisId, {
      dossier: ai.dossier,
      status: "complete",
      executedActions: ai.executedActions,
      completedAt: ai.completedAt,
      processingTimeMs: ai.processingTimeMs,
    });
  } catch (error) {
    console.error("Simulation analysis failed:", error);
    updateAnalysis(analysisId, { status: "failed" });
  }
}
