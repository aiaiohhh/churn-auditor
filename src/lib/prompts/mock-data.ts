import type { ChurnEvent } from "@/lib/schemas/churn";

export interface CustomerContext {
  supportTickets: SupportTicket[];
  usageData: UsageSnapshot;
  exitSurvey: ExitSurvey | null;
}

export interface SupportTicket {
  id: string;
  subject: string;
  body: string;
  status: "open" | "closed" | "escalated";
  createdAt: string;
  sentiment: "positive" | "neutral" | "negative" | "frustrated";
}

export interface UsageSnapshot {
  loginFrequency: { last30Days: number; previous30Days: number };
  featureAdoption: Record<string, number>;
  lastActiveAt: string;
  apiCallsLast30Days: number;
  apiCallsPrevious30Days: number;
}

export interface ExitSurvey {
  submittedAt: string;
  overallSatisfaction: number;
  reasonCategory: string;
  verbatim: string;
}

const MOCK_CONTEXTS: Record<string, CustomerContext> = {
  default: {
    supportTickets: [
      {
        id: "TKT-4821",
        subject: "Dashboard loading extremely slow",
        body: "Our team dashboard takes 15+ seconds to load since last week's update. This is blocking our morning standup workflow. We've tried clearing cache and different browsers.",
        status: "escalated",
        createdAt: "2025-01-28T09:15:00Z",
        sentiment: "frustrated",
      },
      {
        id: "TKT-4856",
        subject: "Export CSV broken for large datasets",
        body: "When exporting more than 10k rows the CSV export times out. We need this for our monthly reporting. This used to work fine.",
        status: "open",
        createdAt: "2025-02-01T14:30:00Z",
        sentiment: "negative",
      },
      {
        id: "TKT-4790",
        subject: "Billing question about annual plan",
        body: "Can you clarify what happens to our data if we switch from annual to monthly? Also, are there any discounts for nonprofits?",
        status: "closed",
        createdAt: "2025-01-20T11:00:00Z",
        sentiment: "neutral",
      },
    ],
    usageData: {
      loginFrequency: { last30Days: 3, previous30Days: 22 },
      featureAdoption: {
        dashboard: 0.85,
        reports: 0.6,
        api: 0.45,
        integrations: 0.1,
        automations: 0.0,
      },
      lastActiveAt: "2025-02-03T08:22:00Z",
      apiCallsLast30Days: 142,
      apiCallsPrevious30Days: 2380,
    },
    exitSurvey: {
      submittedAt: "2025-02-05T16:45:00Z",
      overallSatisfaction: 3,
      reasonCategory: "product_quality",
      verbatim:
        "Love the concept but the recent bugs have been killing our productivity. We found a competitor that just works. Might come back if things stabilize.",
    },
  },
};

export function getCustomerContext(event: ChurnEvent): CustomerContext {
  return MOCK_CONTEXTS[event.customerId] ?? MOCK_CONTEXTS["default"]!;
}

export function formatContextForPrompt(ctx: CustomerContext): string {
  const tickets = ctx.supportTickets
    .map(
      (t) =>
        `[${t.id}] (${t.sentiment}) ${t.subject}\n  "${t.body}"\n  Status: ${t.status} | Created: ${t.createdAt}`
    )
    .join("\n\n");

  const usage = [
    `Logins: ${ctx.usageData.loginFrequency.last30Days} (last 30d) vs ${ctx.usageData.loginFrequency.previous30Days} (prev 30d)`,
    `API calls: ${ctx.usageData.apiCallsLast30Days} (last 30d) vs ${ctx.usageData.apiCallsPrevious30Days} (prev 30d)`,
    `Last active: ${ctx.usageData.lastActiveAt}`,
    `Feature adoption: ${Object.entries(ctx.usageData.featureAdoption)
      .map(([k, v]) => `${k}: ${Math.round(v * 100)}%`)
      .join(", ")}`,
  ].join("\n");

  const survey = ctx.exitSurvey
    ? [
        `Satisfaction: ${ctx.exitSurvey.overallSatisfaction}/5`,
        `Reason: ${ctx.exitSurvey.reasonCategory}`,
        `Verbatim: "${ctx.exitSurvey.verbatim}"`,
      ].join("\n")
    : "No exit survey submitted.";

  return `## SUPPORT TICKETS\n${tickets}\n\n## USAGE DATA\n${usage}\n\n## EXIT SURVEY\n${survey}`;
}
