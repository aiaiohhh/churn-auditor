"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AnalysisResult, PipelineStep } from "@/lib/schemas/churn";

export type AnalysisWithStep = AnalysisResult & {
  pipelineStep?: PipelineStep;
};

export function useAnalysis() {
  const [analyses, setAnalyses] = useState<AnalysisWithStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshRef = useRef(0);

  const fetchAnalyses = useCallback(async () => {
    try {
      const res = await fetch("/api/analyze");
      if (!res.ok) throw new Error("Failed to fetch analyses");
      const data = (await res.json()) as AnalysisWithStep[];
      setAnalyses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 2 seconds
  useEffect(() => {
    fetchAnalyses();
    const interval = setInterval(fetchAnalyses, 2000);
    return () => clearInterval(interval);
  }, [fetchAnalyses]);

  const triggerRefresh = useCallback(() => {
    refreshRef.current += 1;
    fetchAnalyses();
  }, [fetchAnalyses]);

  return { analyses, loading, error, triggerRefresh };
}
