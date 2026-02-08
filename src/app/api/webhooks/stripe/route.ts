import { NextRequest, NextResponse, after } from "next/server";
import Stripe from "stripe";
import { v4 as uuid } from "uuid";
import type { ChurnEvent } from "@/lib/schemas/churn";
import { createAnalysis, updateAnalysis } from "@/lib/db/store";
import { analyzeChurn } from "@/lib/gemini/agent";

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
    apiVersion: "2026-01-28.clover",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event | null = null;

  // If webhook secret is set, verify signature; otherwise accept simulated events for demo
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }
    try {
      event = getStripe().webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } else {
    // Demo mode: parse body as JSON directly
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
  }

  if (event.type !== "customer.subscription.deleted") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const churnEvent = extractChurnEvent(event);
  const analysis = createAnalysis(churnEvent);

  // Run analysis after response is sent (Vercel keeps function alive for after() tasks)
  after(runAnalysis(analysis.id, churnEvent));

  return NextResponse.json(
    { received: true, analysisId: analysis.id },
    { status: 201 }
  );
}

function extractChurnEvent(event: Stripe.Event): ChurnEvent {
  const sub = event.data.object as Stripe.Subscription;
  const customer = sub.customer as string;

  return {
    id: uuid(),
    customerId: customer,
    customerEmail:
      (sub.metadata?.email as string) ?? `${customer}@example.com`,
    customerName:
      (sub.metadata?.name as string) ?? `Customer ${customer.slice(-6)}`,
    mrr: (sub.items?.data?.[0]?.price?.unit_amount ?? 0) / 100,
    plan: sub.items?.data?.[0]?.price?.lookup_key ?? "unknown",
    canceledAt: new Date(
      (sub.canceled_at ?? Math.floor(Date.now() / 1000)) * 1000
    ).toISOString(),
    reason: sub.cancellation_details?.reason ?? undefined,
    subscriptionId: sub.id,
  };
}

async function runAnalysis(analysisId: string, event: ChurnEvent) {
  updateAnalysis(analysisId, { status: "analyzing" });
  try {
    const result = await analyzeChurn(event);

    if (!result.ok) {
      console.error("Analysis failed:", result.error);
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
    console.error("Analysis failed:", error);
    updateAnalysis(analysisId, { status: "failed" });
  }
}
