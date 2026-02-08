"use client";

import { ScrollReveal } from "./ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Detect",
    description:
      "Stripe webhook fires on cancellation. ChurnAuditor captures the event instantly.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-9.86a4.5 4.5 0 00-6.364 6.364L6.09 11.09m10.394-5.768l-1.757 1.757" />
      </svg>
    ),
    color: "bg-churn-red/10 text-churn-red ring-churn-red/20",
  },
  {
    number: "02",
    title: "Diagnose",
    description:
      "Gemini AI analyzes support tickets, usage data, and exit surveys to find the real reason.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    color: "bg-gemini-blue/10 text-gemini-blue ring-gemini-blue/20",
  },
  {
    number: "03",
    title: "Recover",
    description:
      "Automated winback emails, Linear tickets, and Slack alerts — all executed in seconds.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: "bg-churn-green/10 text-churn-green ring-churn-green/20",
  },
];

export function SolutionSection() {
  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-20 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gemini-blue">
              How It Works
            </p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              From Cancellation to Recovery
              <br />
              <span className="text-gradient-gemini">in 60 Seconds</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connectors between steps */}
          <div className="absolute inset-x-0 top-0 hidden md:block">
            {/* Connector 1→2 */}
            <div className="absolute top-[36px] flex items-center" style={{ left: "calc(33.333% - 32px)", width: "64px" }}>
              <div className="h-px flex-1 bg-gradient-to-r from-churn-red/25 to-gemini-blue/25" />
              <svg className="mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/30" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="h-px flex-1 bg-gradient-to-r from-gemini-blue/25 to-gemini-blue/10" />
            </div>
            {/* Connector 2→3 */}
            <div className="absolute top-[36px] flex items-center" style={{ left: "calc(66.666% - 32px)", width: "64px" }}>
              <div className="h-px flex-1 bg-gradient-to-r from-gemini-blue/25 to-churn-green/25" />
              <svg className="mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/30" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="h-px flex-1 bg-gradient-to-r from-churn-green/25 to-churn-green/10" />
            </div>
          </div>

          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.2}>
              <div className="relative flex flex-col items-center text-center">
                {/* Step icon */}
                <div
                  className={`relative z-10 mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl ring-1 bg-white ${step.color}`}
                >
                  {step.icon}
                </div>

                {/* Step number */}
                <span className="mb-2 font-mono text-xs text-muted-foreground">
                  {step.number}
                </span>

                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
