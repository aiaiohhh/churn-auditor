"use client";

import { ScrollReveal } from "./ScrollReveal";

const painPoints = [
  {
    stat: "$1.6T",
    label: "Lost to churn annually",
    description:
      "SaaS companies hemorrhage revenue to preventable churn — and most never figure out why.",
    color: "text-churn-red",
  },
  {
    stat: "68%",
    label: "Never tell you why they left",
    description:
      "Most customers cancel silently. By the time you notice, they've already moved on.",
    color: "text-churn-orange",
  },
  {
    stat: "3 days",
    label: "Average response time",
    description:
      "Traditional churn workflows take days to diagnose. Your window to save the customer closes in hours.",
    color: "text-churn-yellow",
  },
];

export function ProblemSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gemini-blue">
              The Problem
            </p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              The Silent Revenue Killer
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Customer churn destroys more SaaS companies than competition ever will.
              The worst part? Most of it is preventable.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {painPoints.map((point, i) => (
            <ScrollReveal key={point.stat} delay={i * 0.15}>
              <div className="glass-card-landing group rounded-2xl p-8 transition-all duration-300 bento-glow">
                <div className={`text-5xl font-extrabold ${point.color}`}>
                  {point.stat}
                </div>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {point.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div className="section-divider mx-auto mt-32 max-w-4xl" />
    </section>
  );
}
