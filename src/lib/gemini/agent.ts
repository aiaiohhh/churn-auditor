import { v4 as uuid } from "uuid";
import type {
  ChurnEvent,
  ChurnDossier,
  AnalysisResult,
} from "@/lib/schemas/churn";
import { ChurnDossierSchema } from "@/lib/schemas/churn";
import { type Result, ok, err } from "@/lib/errors";
import { generateStructured } from "@/lib/gemini/client";
import {
  buildTriagePrompt,
  buildDiagnosisPrompt,
  TRIAGE_RESPONSE_SCHEMA,
  DOSSIER_RESPONSE_SCHEMA,
  type TriageResult,
} from "@/lib/prompts/diagnosis";
import { executeTool, type ToolCallResult } from "@/lib/tools/executor";
import { analyzeChurnDemo } from "@/lib/gemini/demo-fallback";

const PIPELINE_TIMEOUT_MS = 25_000;

export async function analyzeChurn(
  event: ChurnEvent
): Promise<Result<AnalysisResult>> {
  // Auto-fallback to demo mode when API key is not configured
  if (!process.env.GEMINI_API_KEY) {
    console.log("[ChurnAuditor] No GEMINI_API_KEY set, using demo fallback");
    return analyzeChurnDemo(event);
  }

  // Run the real pipeline with a timeout safety net.
  // If Gemini is slow or down, fall back to demo mode so the app always works.
  try {
    const result = await Promise.race([
      analyzeChurnReal(event),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini pipeline timed out")), PIPELINE_TIMEOUT_MS)
      ),
    ]);
    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[ChurnAuditor] Gemini pipeline failed (${msg}), falling back to demo`);
    return analyzeChurnDemo(event);
  }
}

async function analyzeChurnReal(
  event: ChurnEvent
): Promise<Result<AnalysisResult>> {
  const startTime = Date.now();
  const analysisId = uuid();

  // Step 1: Triage with Flash
  const triageResult = await runTriage(event);
  if (!triageResult.ok) return err(`Triage failed: ${triageResult.error}`);

  const triage = triageResult.value;

  // Step 2: Deep diagnosis with Pro (or Flash for low-priority)
  const model = triage.worthDeepAnalysis ? "pro" : "flash";
  const dossierResult = await runDiagnosis(event, model);
  if (!dossierResult.ok) return err(`Diagnosis failed: ${dossierResult.error}`);

  const dossier = dossierResult.value;

  // Step 3: Execute recommended actions
  const executedActions = await executeActions(dossier, event);

  const result: AnalysisResult = {
    id: analysisId,
    event,
    dossier,
    status: "complete",
    executedActions: executedActions.map((a) => ({
      type: a.actionType,
      status: a.status === "success" ? "success" : "failed",
      result: a.result,
      executedAt: a.executedAt,
    })),
    createdAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    processingTimeMs: Date.now() - startTime,
  };

  return ok(result);
}

async function runTriage(event: ChurnEvent): Promise<Result<TriageResult>> {
  const { systemInstruction, prompt } = buildTriagePrompt(event);
  return generateStructured<TriageResult>({
    model: "flash",
    prompt,
    systemInstruction,
    temperature: 0.3,
    responseSchema: TRIAGE_RESPONSE_SCHEMA,
    parse: (raw) => raw as TriageResult,
  });
}

async function runDiagnosis(
  event: ChurnEvent,
  model: "flash" | "pro"
): Promise<Result<ChurnDossier>> {
  const { systemInstruction, prompt } = buildDiagnosisPrompt(event);
  return generateStructured<ChurnDossier>({
    model,
    prompt,
    systemInstruction,
    temperature: 0.4,
    responseSchema: DOSSIER_RESPONSE_SCHEMA,
    parse: (raw) => ChurnDossierSchema.parse(raw),
  });
}

async function executeActions(
  dossier: ChurnDossier,
  event: ChurnEvent
): Promise<ToolCallResult[]> {
  const results: ToolCallResult[] = [];

  for (const action of dossier.recommendedActions) {
    const args = buildToolArgs(action.type, action, event, dossier);
    const result = await executeTool(args.toolName, args.params);
    results.push(result);
  }

  return results;
}

function buildToolArgs(
  actionType: string,
  action: { type: string; priority: string; description: string },
  event: ChurnEvent,
  dossier: ChurnDossier
): { toolName: string; params: Record<string, unknown> } {
  switch (actionType) {
    case "linear_ticket":
      return {
        toolName: "create_linear_ticket",
        params: {
          title: `[Churn] ${action.description.slice(0, 80)}`,
          description: `Customer: ${event.customerName} (${event.customerEmail})\nMRR: $${event.mrr}\nCause: ${dossier.primaryCause}\n\n${action.description}`,
          priority: action.priority,
          labels: ["churn-related", dossier.primaryCause],
        },
      };
    case "winback_email":
      return {
        toolName: "send_winback_email",
        params: {
          to: event.customerEmail,
          subject: `We'd love to win you back, ${event.customerName}`,
          body: action.description,
          offerCode: dossier.saveProbability > 0.5 ? "WINBACK20" : undefined,
        },
      };
    case "slack_alert":
      return {
        toolName: "send_slack_alert",
        params: {
          channel: "#cs-alerts",
          message: `Churn Alert: ${event.customerName} ($${event.mrr}/mo) - ${dossier.primaryCause}. ${action.description}`,
          urgency: action.priority,
        },
      };
    case "manual_review":
      return {
        toolName: "flag_for_manual_review",
        params: {
          assignee: "auto",
          reason: action.description,
          priority: action.priority,
        },
      };
    default:
      return {
        toolName: "flag_for_manual_review",
        params: {
          reason: `Unknown action type: ${actionType}. ${action.description}`,
          priority: "medium",
        },
      };
  }
}
