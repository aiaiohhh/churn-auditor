# ChurnAuditor

AI-powered churn analysis dashboard that detects subscription cancellations, diagnoses root causes with Google Gemini, and recommends automated recovery actions.

Built for the [Gemini API Developer Competition](https://gemini3.devpost.com/).

## How It Works

When a customer cancels their subscription, ChurnAuditor builds a complete intelligence dossier in seconds:

1. **Stripe Webhook** captures the cancellation event
2. **Gemini Flash** performs rapid triage to assess severity and determine analysis depth
3. **Gemini Pro** runs deep diagnosis using structured output to identify the root cause, gather evidence, and calculate save probability
4. **Action Engine** automatically dispatches recovery actions (Linear tickets, winback emails, Slack alerts)

The entire pipeline runs in under 10 seconds, giving your team an actionable dossier before the customer is even gone.

## Gemini Integration

ChurnAuditor uses a **two-stage AI pipeline** with model routing:

- **Triage (Gemini 3 Flash)**: Fast assessment at temperature 0.3 determines if the churn event warrants deep analysis. Uses structured JSON output with a defined response schema for reliable parsing.
- **Diagnosis (Gemini 3 Pro / Flash)**: Full root cause analysis at temperature 0.4 with structured output producing a typed `ChurnDossier` including primary cause, confidence score, evidence array, save probability, and recommended actions. High-value churns route to Pro; lower-priority to Flash.
- **Resilient fallback**: If Gemini is unavailable or times out (25s), the pipeline auto-falls back to demo mode so the app always works.

All AI responses are validated against Zod schemas for type safety.

## Architecture

```
Stripe Webhook ──> Churn Event
                        |
                   Gemini Flash
                   (Triage: 1-2s)
                        |
              ┌─── Worth deep analysis? ───┐
              YES                          NO
              |                            |
         Gemini Pro                   Gemini Flash
        (Diagnosis: 3-8s)           (Diagnosis: 1-3s)
              |                            |
              └──────────┬─────────────────┘
                         |
                   Action Engine
              ┌──────┬───┴───┬──────┐
           Linear  Email  Slack  Manual
           Ticket  Send   Alert  Review
```

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **AI**: Google Gemini via `@google/genai` (Flash + Pro with structured output)
- **Payments**: Stripe SDK for webhook ingestion
- **Validation**: Zod 4 for schema-first type safety
- **Styling**: Tailwind CSS 4, shadcn/ui, glassmorphism dark theme
- **Storage**: In-memory (hackathon MVP)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Run the dev server
npm run dev
```

Open [https://churn-auditor.vercel.app](https://churn-auditor.vercel.app/)) and click **Simulate Cancellation** to trigger an AI analysis.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No* | Google Gemini API key. Demo mode works without it. |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (optional for dev) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret (optional for dev) |

*Demo fallback mode works without any API keys.

## Project Structure

```
src/
  app/
    (dashboard)/          # Dashboard page + layout
    api/
      analyze/            # AI analysis endpoints
      simulate/           # Churn event simulator
      actions/            # Recovery action execution
      webhooks/stripe/    # Stripe webhook handler
  lib/
    gemini/               # AI pipeline (agent, client, demo-fallback)
    schemas/              # Zod schemas (single source of truth)
    tools/                # Tool definitions + executor
    integrations/         # Email, Linear, Slack dispatchers
    prompts/              # AI prompt templates
  components/churn/       # Dashboard UI components
```

## License

MIT
