"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "./ScrollReveal";
import type { AnalysisResult } from "@/lib/schemas/churn";

const CUSTOMER_POOL = [
  { name: "Alex Rivera", email: "alex@techflow.io", mrr: 299, plan: "Growth" },
  { name: "Priya Sharma", email: "priya@datawise.co", mrr: 599, plan: "Pro" },
  { name: "Tom Eriksson", email: "tom@nordicops.se", mrr: 149, plan: "Starter" },
  { name: "Lena Park", email: "lena@snapboard.app", mrr: 899, plan: "Enterprise" },
];

const causeColors: Record<string, string> = {
  pricing: "bg-churn-orange/10 text-churn-orange",
  bugs: "bg-churn-red/10 text-churn-red",
  support: "bg-churn-yellow/10 text-churn-yellow",
  competition: "bg-churn-purple/10 text-churn-purple",
  features: "bg-churn-blue/10 text-churn-blue",
  onboarding: "bg-churn-blue/10 text-churn-blue",
  other: "bg-black/[0.06] text-muted-foreground",
};

export function LiveDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const customer = CUSTOMER_POOL[Math.floor(Math.random() * CUSTOMER_POOL.length)];
      if (!customer) return;

      const event = {
        id: crypto.randomUUID(),
        customerId: `cus_demo_${Date.now()}`,
        customerEmail: customer.email,
        customerName: customer.name,
        mrr: customer.mrr,
        plan: customer.plan,
        canceledAt: new Date().toISOString(),
        reason: ["Too expensive", "Found a better alternative", "Missing features", "Too many bugs"][
          Math.floor(Math.random() * 4)
        ],
        subscriptionId: `sub_demo_${Date.now()}`,
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json() as { analysisId: string };
      const analysisId = data.analysisId;

      // Poll for result
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await fetch(`/api/analyze/${analysisId}`);
        if (!pollRes.ok) continue;
        const analysis = (await pollRes.json()) as AnalysisResult;
        if (analysis.status === "complete" || analysis.status === "failed") {
          setResult(analysis);
          break;
        }
      }
    } catch {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section id="demo" className="relative py-32 px-6">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gemini-blue">
              Live Demo
            </p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              See It in Action
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Hit the button below to simulate a real cancellation event and watch
              AI diagnose the root cause.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="glass-card-landing overflow-hidden rounded-2xl p-1">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 rounded-t-xl bg-black/[0.03] px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="mx-auto flex-1 text-center">
                <div className="mx-auto max-w-xs rounded-md bg-black/[0.04] px-3 py-1 text-xs text-muted-foreground">
                  churnauditor.app/dashboard
                </div>
              </div>
            </div>

            {/* Demo area */}
            <div className="min-h-[320px] p-8">
              {/* Trigger button */}
              <div className="mb-8 flex justify-center">
                <Button
                  onClick={simulate}
                  disabled={loading}
                  size="lg"
                  className="bg-primary text-white hover:bg-gemini-deep disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Simulate Cancellation
                    </>
                  )}
                </Button>
              </div>

              {/* Error */}
              {error && (
                <p className="text-center text-sm text-churn-red">{error}</p>
              )}

              {/* Result */}
              <AnimatePresence mode="wait">
                {result?.dossier && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Customer info */}
                    <div className="flex items-center justify-between rounded-xl bg-black/[0.03] p-4">
                      <div>
                        <p className="font-semibold">{result.event.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.event.plan} Plan &middot; ${result.event.mrr}/mo
                        </p>
                      </div>
                      <Badge
                        className={
                          causeColors[result.dossier.primaryCause] ?? causeColors.other
                        }
                      >
                        {result.dossier.primaryCause}
                      </Badge>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-black/[0.03] p-4 text-center">
                        <p className="font-mono text-2xl font-bold text-foreground">
                          {Math.round(result.dossier.confidence * 100)}%
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Confidence</p>
                      </div>
                      <div className="rounded-xl bg-black/[0.03] p-4 text-center">
                        <p className="font-mono text-2xl font-bold text-churn-green">
                          {Math.round(result.dossier.saveProbability * 100)}%
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Save Probability</p>
                      </div>
                      <div className="rounded-xl bg-black/[0.03] p-4 text-center">
                        <p className="font-mono text-2xl font-bold text-gemini-blue">
                          {result.executedActions.length}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Actions Taken</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="rounded-xl bg-black/[0.03] p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Recovery Actions
                      </p>
                      <div className="space-y-2">
                        {result.executedActions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-churn-green">✓</span>
                            <span className="text-muted-foreground">{action.type.replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Processing time */}
                    {result.processingTimeMs && (
                      <p className="text-center text-xs text-muted-foreground">
                        Completed in {(result.processingTimeMs / 1000).toFixed(1)}s
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {!loading && !result && !error && (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                  <svg className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-sm">Click &quot;Simulate Cancellation&quot; to start</p>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
