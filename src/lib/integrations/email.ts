import type { ChurnDossier } from "@/lib/schemas/churn";

export interface EmailResult {
  messageId: string;
  to: string;
  subject: string;
  previewText: string;
  sentAt: string;
}

export async function sendWinbackEmail(
  customerEmail: string,
  customerName: string,
  dossier: ChurnDossier
): Promise<EmailResult> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 250));

  const subjects: Record<string, string> = {
    pricing: `${customerName}, we have a special offer for you`,
    bugs: `${customerName}, we fixed the issues you reported`,
    support: `${customerName}, your feedback matters to us`,
    competition: `${customerName}, see what's new`,
    features: `${customerName}, the features you wanted are here`,
    onboarding: `${customerName}, let us help you get started`,
    other: `${customerName}, we'd love to have you back`,
  };

  const subject =
    subjects[dossier.primaryCause] ?? `${customerName}, we'd love to have you back`;

  return {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    to: customerEmail,
    subject,
    previewText: `Hi ${customerName}, we noticed you recently cancelled and wanted to reach out. Based on your feedback, we've made improvements that address your concerns about ${dossier.primaryCause}. We'd love the chance to win you back.`,
    sentAt: new Date().toISOString(),
  };
}
