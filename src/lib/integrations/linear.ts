import type { ChurnDossier, RecommendedAction } from "@/lib/schemas/churn";

export interface LinearTicketResult {
  ticketId: string;
  ticketUrl: string;
  title: string;
  description: string;
  priority: string;
  teamName: string;
}

export async function createLinearTicket(
  action: RecommendedAction,
  customerName: string,
  dossier: ChurnDossier
): Promise<LinearTicketResult> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 300));

  const ticketId = `CHR-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    ticketId,
    ticketUrl: `https://linear.app/team/issue/${ticketId}`,
    title: `[Churn] ${customerName} - ${dossier.primaryCause}`,
    description: [
      `**Customer:** ${customerName}`,
      `**Cause:** ${dossier.primaryCause} (${Math.round(dossier.confidence * 100)}% confidence)`,
      `**Save Probability:** ${Math.round(dossier.saveProbability * 100)}%`,
      `**Action:** ${action.description}`,
      `**Reasoning:** ${dossier.reasoning}`,
    ].join("\n"),
    priority: action.priority,
    teamName: "Customer Success",
  };
}
