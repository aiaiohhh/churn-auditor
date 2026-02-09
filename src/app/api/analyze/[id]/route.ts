import { NextRequest, NextResponse } from "next/server";
import { getAnalysis, getPipelineStep } from "@/lib/db/store";
import { applyRateLimit } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const blocked = applyRateLimit(req, "analyzeGetById");
  if (blocked) return blocked;

  const { id } = await params;

  const analysis = getAnalysis(id);
  if (!analysis) {
    return NextResponse.json(
      { error: "Analysis not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...analysis,
    pipelineStep: getPipelineStep(id),
  });
}
