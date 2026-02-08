"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChurnFeed } from "@/components/churn/ChurnFeed";
import { DossierView } from "@/components/churn/DossierView";
import { ActionExecutor } from "@/components/churn/ActionExecutor";
import { SimulateButton } from "@/components/churn/SimulateButton";
import { MetricsChart } from "@/components/churn/MetricsChart";
import { useAnalysis } from "@/hooks/useAnalysis";

export default function DashboardPage() {
  const { analyses, loading, triggerRefresh } = useAnalysis();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedAnalysis =
    analyses.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Hero: Simulate Button */}
      <div className="mx-auto max-w-md">
        <SimulateButton onSimulate={triggerRefresh} />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Generate a realistic churn event and watch AI diagnose it in real-time
        </p>
      </div>

      {/* Main Grid: Feed | Dossier */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left Column: Feed + Metrics */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Churn Events
              {analyses.length > 0 && (
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  ({analyses.length})
                </span>
              )}
            </h2>
            <ChurnFeed
              analyses={analyses}
              loading={loading}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Metrics below feed */}
          {analyses.length > 0 && <MetricsChart analyses={analyses} />}
        </div>

        {/* Right Column: Dossier + Actions */}
        <div className="space-y-6">
          <Tabs defaultValue="dossier" className="w-full">
            <TabsList className="glass-card grid w-full grid-cols-2 border-0">
              <TabsTrigger
                value="dossier"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Dossier
              </TabsTrigger>
              <TabsTrigger
                value="actions"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Actions
                {selectedAnalysis && selectedAnalysis.executedActions.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {selectedAnalysis.executedActions.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dossier" className="mt-4">
              <DossierView analysis={selectedAnalysis} />
            </TabsContent>
            <TabsContent value="actions" className="mt-4">
              <ActionExecutor analysis={selectedAnalysis} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
