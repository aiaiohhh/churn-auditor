import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { SocialProof } from "@/components/landing/SocialProof";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { GradientMesh } from "@/components/landing/GradientMesh";
import { NoiseTexture } from "@/components/landing/NoiseTexture";

export const metadata: Metadata = {
  title: "ChurnAuditor - Diagnose Customer Churn in 60 Seconds",
  description:
    "AI-powered churn recovery that diagnoses why customers cancel and executes recovery actions automatically. Powered by Gemini AI.",
};

export default function LandingPage() {
  return (
    <div className="relative">
      <GradientMesh />
      <NoiseTexture />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <LiveDemo />
      <BentoFeatures />
      <SocialProof />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
