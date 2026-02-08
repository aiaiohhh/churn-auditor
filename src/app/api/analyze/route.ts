import { NextRequest, NextResponse, after } from "next/server";
import { AnalyzeRequestSchema, type ChurnEvent } from "@/lib/schemas/churn";
import {
  createAnalysis,
  getAllAnalyses,
  getPipelineStep,
  updateAnalysis,
} from "@/lib/db/store";
import { analyzeChurn } from "@/lib/gemini/agent";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const analysis = createAnalysis(parsed.data.event);

  const wantsStream = req.headers.get("accept") === "text/event-stream";
  if (wantsStream) {
    return streamAnalysis(analysis.id, parsed.data.event);
  }

  // Run analysis in background — after() keeps the serverless function alive on Vercel
  after(runAnalysisPipeline(analysis.id, parsed.data.event));

  return NextResponse.json(
    { analysisId: analysis.id, status: analysis.status },
    { status: 201 }
  );
}

export async function GET() {
  const analyses = getAllAnalyses().map((a) => ({
    ...a,
    pipelineStep: getPipelineStep(a.id),
  }));
  return NextResponse.json(analyses);
}

function streamAnalysis(analysisId: string, event: ChurnEvent) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      send({ type: "status", analysisId, status: "analyzing" });
      updateAnalysis(analysisId, { status: "analyzing" });

      try {
        const result = await analyzeChurn(event, analysisId);

        if (!result.ok) {
          send({ type: "error", message: result.error });
          updateAnalysis(analysisId, { status: "failed" });
          return;
        }

        const ai = result.value;
        updateAnalysis(analysisId, {
          dossier: ai.dossier,
          status: "complete",
          executedActions: ai.executedActions,
          completedAt: ai.completedAt,
          processingTimeMs: ai.processingTimeMs,
          pipelineMetadata: ai.pipelineMetadata,
        });

        send({ type: "result", analysisId, analysis: ai });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        send({ type: "error", message: msg });
        updateAnalysis(analysisId, { status: "failed" });
      } finally {
        send({ type: "done", analysisId });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function runAnalysisPipeline(analysisId: string, event: ChurnEvent) {
  updateAnalysis(analysisId, { status: "analyzing" });
  try {
    const result = await analyzeChurn(event, analysisId);

    if (!result.ok) {
      console.error("Analysis failed:", result.error);
      updateAnalysis(analysisId, { status: "failed" });
      return;
    }

    const ai = result.value;
    updateAnalysis(analysisId, {
      dossier: ai.dossier,
      status: "complete",
      executedActions: ai.executedActions,
      completedAt: ai.completedAt,
      processingTimeMs: ai.processingTimeMs,
      pipelineMetadata: ai.pipelineMetadata,
    });
  } catch (error) {
    console.error("Analysis pipeline failed:", error);
    updateAnalysis(analysisId, { status: "failed" });
  }
}
