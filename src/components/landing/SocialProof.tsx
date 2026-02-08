"use client";

import { ScrollReveal } from "./ScrollReveal";
import { AnimatedCounter } from "./AnimatedCounter";

const stats = [
  { value: 60, suffix: "s", label: "Avg diagnosis time", color: "text-gemini-blue" },
  { value: 89, suffix: "%", label: "Diagnostic accuracy", color: "text-gemini-deep" },
  { value: 52, suffix: "%", label: "Customer recovery rate", color: "text-churn-green" },
  { value: 4, suffix: "", label: "Integrated actions", color: "text-churn-purple" },
];

const techStack = [
  { name: "Next.js 16", icon: "N" },
  { name: "Gemini AI", icon: "G" },
  { name: "Stripe", icon: "S" },
  { name: "TypeScript", icon: "TS" },
  { name: "Vercel", icon: "V" },
];

export function SocialProof() {
  return (
    <section className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className="glass-card-landing rounded-2xl p-6 text-center">
                <div className={`text-4xl font-extrabold ${stat.color}`}>
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    duration={1500}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Built with */}
        <ScrollReveal delay={0.3}>
          <div className="mt-20 text-center">
            <p className="mb-6 text-sm text-muted-foreground">Built with</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-2 rounded-full border border-border/50 bg-black/[0.03] px-4 py-2 text-sm text-muted-foreground"
                >
                  <span className="font-mono text-xs font-bold text-foreground">
                    {tech.icon}
                  </span>
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
