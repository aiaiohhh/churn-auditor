"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import type { ChurnEvent } from "@/lib/schemas/churn";

const FAKE_CUSTOMERS = [
  { name: "Sarah Chen", email: "sarah@acmecorp.com", mrr: 299, plan: "Pro" },
  { name: "Marcus Johnson", email: "marcus@techstart.io", mrr: 149, plan: "Starter" },
  { name: "Emily Rodriguez", email: "emily@scaleup.co", mrr: 599, plan: "Enterprise" },
  { name: "David Kim", email: "david@growthlab.com", mrr: 99, plan: "Starter" },
  { name: "Rachel Thompson", email: "rachel@cloudnine.io", mrr: 449, plan: "Pro" },
  { name: "Alex Patel", email: "alex@dataflow.com", mrr: 899, plan: "Enterprise" },
  { name: "Jordan Lee", email: "jordan@startup.xyz", mrr: 199, plan: "Pro" },
  { name: "Mia Williams", email: "mia@devtools.co", mrr: 349, plan: "Pro" },
  { name: "Chris Anderson", email: "chris@saasly.com", mrr: 79, plan: "Starter" },
  { name: "Nina Petrova", email: "nina@globex.com", mrr: 1299, plan: "Enterprise" },
];

const REASONS = [
  "Too expensive for our current budget",
  "Switching to a competitor",
  "Missing key features we need",
  "Not using it enough to justify the cost",
  "Had issues with customer support",
  "Consolidating our tool stack",
  undefined,
];

interface SimulateButtonProps {
  onSimulate: () => void;
}

export function SimulateButton({ onSimulate }: SimulateButtonProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  async function handleSimulate() {
    if (isSimulating) return;
    setIsSimulating(true);

    try {
      const customer = FAKE_CUSTOMERS[Math.floor(Math.random() * FAKE_CUSTOMERS.length)]!;
      const reason = REASONS[Math.floor(Math.random() * REASONS.length)];

      const event: ChurnEvent = {
        id: uuidv4(),
        customerId: `cus_${uuidv4().slice(0, 14)}`,
        customerEmail: customer.email,
        customerName: customer.name,
        mrr: customer.mrr,
        plan: customer.plan,
        canceledAt: new Date().toISOString(),
        reason,
        subscriptionId: `sub_${uuidv4().slice(0, 14)}`,
      };

      await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });

      onSimulate();
    } catch {
      // Silently handle - the feed will show the error state
    } finally {
      setTimeout(() => setIsSimulating(false), 1000);
    }
  }

  return (
    <Button
      onClick={handleSimulate}
      disabled={isSimulating}
      size="lg"
      className={cn(
        "simulate-glow relative h-14 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-base font-bold text-white",
        "transition-all duration-300 hover:from-red-500 hover:to-red-400",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        isSimulating && "animate-pulse"
      )}
    >
      {isSimulating ? (
        <span className="flex items-center gap-2">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Simulating...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
            <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Simulate Cancellation
        </span>
      )}
    </Button>
  );
}
