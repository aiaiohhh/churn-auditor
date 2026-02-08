import type { ChurnDossier } from "@/lib/schemas/churn";

export interface SlackAlertResult {
  channel: string;
  messageTs: string;
  permalink: string;
  text: string;
}

export async function sendSlackAlert(
  customerName: string,
  customerEmail: string,
  dossier: ChurnDossier
): Promise<SlackAlertResult> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 200));

  const emoji: Record<string, string> = {
    urgent: ":rotating_light:",
    high: ":warning:",
    medium: ":large_blue_circle:",
    low: ":white_circle:",
  };

  const topAction = dossier.recommendedActions[0];
  const priorityEmoji = topAction ? emoji[topAction.priority] : ":bell:";

  const text = [
    `${priorityEmoji} *Churn Alert: ${customerName}*`,
    `Email: ${customerEmail}`,
    `Cause: *${dossier.primaryCause}* (${Math.round(dossier.confidence * 100)}% confidence)`,
    `Save Probability: ${Math.round(dossier.saveProbability * 100)}%`,
    `Reasoning: ${dossier.reasoning.slice(0, 200)}`,
  ].join("\n");

  const ts = `${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`;

  return {
    channel: "#churn-alerts",
    messageTs: ts,
    permalink: `https://workspace.slack.com/archives/C0CHURNALERT/p${ts.replace(".", "")}`,
    text,
  };
}
