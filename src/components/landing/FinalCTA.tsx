"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "./MagneticButton";
import { ScrollReveal } from "./ScrollReveal";

export function FinalCTA() {
  return (
    <section className="relative py-32 px-6">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl p-px">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gemini-blue/30 via-gemini-deep/20 to-gemini-blue/30" />

            {/* Content */}
            <div className="relative rounded-3xl bg-background/90 backdrop-blur-xl">
              <div className="flex flex-col items-center gap-8 px-8 py-20 text-center sm:px-16">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Stop Losing Customers.
                  <br />
                  <span className="text-gradient-gemini">Start Recovering Revenue.</span>
                </h2>

                <p className="max-w-lg text-lg text-muted-foreground">
                  Every minute without ChurnAuditor is a customer you could have saved.
                  See it for yourself — no API keys required.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <MagneticButton>
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        className="h-12 bg-primary px-8 text-base font-semibold text-white hover:bg-gemini-deep"
                      >
                        Open Dashboard
                        <svg
                          className="ml-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </Button>
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <a
                      href="https://github.com/aiaiohhh/churn-auditor"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-12 border-border/50 px-8 text-base font-semibold"
                      >
                        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        View on GitHub
                      </Button>
                    </a>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
