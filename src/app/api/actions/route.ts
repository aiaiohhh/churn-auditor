import { NextRequest, NextResponse } from "next/server";
import {
  ExecuteActionRequestSchema,
  type ChurnDossier,
  type RecommendedAction,
} from "@/lib/schemas/churn";
import { getAnalysis, updateAnalysis } from "@/lib/db/store";
import { createLinearTicket } from "@/lib/integrations/linear";
import { sendWinbackEmail } from "@/lib/integrations/email";
import { sendSlackAlert } from "@/lib/integrations/slack";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ExecuteActionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { analysisId, action, context } = parsed.data;

  const analysis = getAnalysis(analysisId);
  if (!analysis) {
    return NextResponse.json(
      { error: "Analysis not found" },
      { status: 404 }
    );
  }

  try {
    const result = await executeAction(
      action.type,
      context.customerName,
      context.customerEmail,
      context.dossier,
      action
    );

    // Record executed action on the analysis
    const executedAction = {
      type: action.type,
      status: "success" as const,
      result: JSON.stringify(result),
      executedAt: new Date().toISOString(),
    };

    updateAnalysis(analysisId, {
      executedActions: [...analysis.executedActions, executedAction],
    });

    return NextResponse.json({
      success: true,
      actionType: action.type,
      result: JSON.stringify(result),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, actionType: action.type, result: msg },
      { status: 500 }
    );
  }
}

async function executeAction(
  type: string,
  customerName: string,
  customerEmail: string,
  dossier: ChurnDossier,
  action: RecommendedAction
) {
  switch (type) {
    case "linear_ticket":
      return createLinearTicket(action, customerName, dossier);
    case "winback_email":
      return sendWinbackEmail(customerEmail, customerName, dossier);
    case "slack_alert":
      return sendSlackAlert(customerName, customerEmail, dossier);
    case "manual_review":
      return { status: "flagged", message: `Manual review flagged for ${customerName}` };
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}
