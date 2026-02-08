import type { ActionType } from "@/lib/schemas/churn";
import type { ToolName } from "@/lib/tools/definitions";

export interface ToolCallResult {
  actionType: ActionType;
  status: "success" | "failed";
  result: string;
  executedAt: string;
}

const TOOL_TO_ACTION: Record<ToolName, ActionType> = {
  create_linear_ticket: "linear_ticket",
  send_winback_email: "winback_email",
  send_slack_alert: "slack_alert",
  flag_for_manual_review: "manual_review",
};

async function mockCreateLinearTicket(args: Record<string, unknown>): Promise<string> {
  await delay(300);
  return `Created Linear ticket LIN-${randomId()}: "${args["title"]}" (priority: ${args["priority"]})`;
}

async function mockSendWinbackEmail(args: Record<string, unknown>): Promise<string> {
  await delay(400);
  return `Win-back email sent to ${args["to"]} with subject "${args["subject"]}"${args["offerCode"] ? ` (offer: ${args["offerCode"]})` : ""}`;
}

async function mockSendSlackAlert(args: Record<string, unknown>): Promise<string> {
  await delay(200);
  return `Slack alert posted to ${args["channel"]}: "${(args["message"] as string).slice(0, 80)}..."`;
}

async function mockFlagForManualReview(args: Record<string, unknown>): Promise<string> {
  await delay(250);
  const assignee = args["assignee"] ?? "auto (round-robin)";
  return `Flagged for manual review, assigned to ${assignee} (priority: ${args["priority"]})`;
}

const EXECUTORS: Record<ToolName, (args: Record<string, unknown>) => Promise<string>> = {
  create_linear_ticket: mockCreateLinearTicket,
  send_winback_email: mockSendWinbackEmail,
  send_slack_alert: mockSendSlackAlert,
  flag_for_manual_review: mockFlagForManualReview,
};

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolCallResult> {
  const toolName = name as ToolName;
  const executor = EXECUTORS[toolName];
  const actionType = TOOL_TO_ACTION[toolName];

  if (!executor || !actionType) {
    return {
      actionType: "manual_review",
      status: "failed",
      result: `Unknown tool: ${name}`,
      executedAt: new Date().toISOString(),
    };
  }

  try {
    const result = await executor(args);
    return {
      actionType,
      status: "success",
      result,
      executedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      actionType,
      status: "failed",
      result: e instanceof Error ? e.message : "Unknown execution error",
      executedAt: new Date().toISOString(),
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomId(): number {
  return Math.floor(1000 + Math.random() * 9000);
}
