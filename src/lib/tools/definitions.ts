export const TOOL_DECLARATIONS = [
  {
    name: "create_linear_ticket",
    description:
      "Creates a bug ticket in Linear for the engineering team to investigate and fix a product issue that contributed to churn.",
    parameters: {
      type: "object" as const,
      properties: {
        title: {
          type: "string" as const,
          description: "Ticket title describing the bug or issue",
        },
        description: {
          type: "string" as const,
          description:
            "Detailed description including customer impact and reproduction steps",
        },
        priority: {
          type: "string" as const,
          enum: ["urgent", "high", "medium", "low"],
          description: "Ticket priority level",
        },
        labels: {
          type: "array" as const,
          items: { type: "string" as const },
          description: "Labels to apply (e.g. 'churn-related', 'performance')",
        },
      },
      required: ["title", "description", "priority"],
    },
  },
  {
    name: "send_winback_email",
    description:
      "Sends a personalized win-back email to the churned customer with a tailored offer or message.",
    parameters: {
      type: "object" as const,
      properties: {
        to: {
          type: "string" as const,
          description: "Recipient email address",
        },
        subject: {
          type: "string" as const,
          description: "Email subject line",
        },
        body: {
          type: "string" as const,
          description: "Email body (plain text)",
        },
        offerCode: {
          type: "string" as const,
          description: "Optional discount or offer code to include",
        },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    name: "send_slack_alert",
    description:
      "Posts an alert to a Slack channel to notify the customer success team about a churn event requiring attention.",
    parameters: {
      type: "object" as const,
      properties: {
        channel: {
          type: "string" as const,
          description: "Slack channel name (e.g. '#cs-alerts')",
        },
        message: {
          type: "string" as const,
          description: "Alert message content",
        },
        urgency: {
          type: "string" as const,
          enum: ["urgent", "high", "medium", "low"],
          description: "Urgency level for the alert",
        },
      },
      required: ["channel", "message", "urgency"],
    },
  },
  {
    name: "flag_for_manual_review",
    description:
      "Flags this churn case for manual review by an account manager, adding it to their review queue.",
    parameters: {
      type: "object" as const,
      properties: {
        assignee: {
          type: "string" as const,
          description: "Account manager to assign (or 'auto' for round-robin)",
        },
        reason: {
          type: "string" as const,
          description: "Why this needs manual review",
        },
        priority: {
          type: "string" as const,
          enum: ["urgent", "high", "medium", "low"],
          description: "Review priority",
        },
      },
      required: ["reason", "priority"],
    },
  },
] as const;

export type ToolName = (typeof TOOL_DECLARATIONS)[number]["name"];
