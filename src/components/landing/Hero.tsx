"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "./MagneticButton";
import { CounterDemo } from "./CounterDemo";
import { GeminiStardust } from "./GeminiOrb";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
      {/* Stardust particles — ring around center, text stays clear */}
      <GeminiStardust />

      {/* Overline badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 mb-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-gemini-blue/20 bg-gemini-blue/5 px-4 py-1.5 text-sm text-gemini-blue">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gemini-blue opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gemini-blue" />
          </span>
          Powered by Gemini AI
        </div>
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 max-w-4xl text-center text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
      >
        Diagnose Customer Churn in{" "}
        <span className="text-gradient-hero">60 Seconds</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="relative z-10 mt-6 max-w-2xl text-center text-lg text-muted-foreground sm:text-xl"
      >
        Every cancellation tells a story. ChurnAuditor uses AI to diagnose why
        customers leave and executes recovery actions — automatically.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <MagneticButton>
          <a href="#demo">
            <Button
              size="lg"
              className="h-12 bg-primary px-8 text-base font-semibold text-white hover:bg-gemini-deep animate-pulse-blue"
            >
              Try Live Demo
            </Button>
          </a>
        </MagneticButton>
        <MagneticButton>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="h-12 border-border/50 px-8 text-base font-semibold"
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
      </motion.div>

      {/* Counter Demo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 mt-16 w-full max-w-3xl"
      >
        <CounterDemo />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground/50"
        >
          <span className="text-xs">Scroll to explore</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
