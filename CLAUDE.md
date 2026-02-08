# ChurnAuditor

AI-powered churn analysis dashboard. Detects subscription cancellations via Stripe webhooks, diagnoses root causes with Gemini AI, and recommends recovery actions.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (strict mode, `noUncheckedIndexedAccess`)
- **Styling:** Tailwind CSS 4, shadcn/ui, dark theme with glassmorphism
- **AI:** Google Gemini (`@google/genai`) — Flash for triage, Pro for deep analysis
- **Payments:** Stripe SDK for webhook ingestion
- **Validation:** Zod 4
- **Storage:** In-memory Map (hackathon MVP, no database)

## Project Structure

```
src/
  app/
    (dashboard)/          # Main dashboard page + layout
    api/
      actions/            # Execute recovery actions (Linear, email, Slack)
      analyze/            # Trigger AI analysis; [id]/ for status polling
      seed/               # Seed demo data
      simulate/           # Simulate churn events
      webhooks/stripe/    # Stripe webhook handler
  components/
    churn/                # ChurnFeed, DossierView, ActionCenter, MetricsChart, SimulateButton
    ui/                   # shadcn/ui primitives (badge, button, card, etc.)
  hooks/                  # useAnalysis (polling hook)
  lib/
    db/store.ts           # In-memory Map store
    gemini/               # AI pipeline: agent.ts, client.ts, demo-fallback.ts
    integrations/         # email.ts, linear.ts, slack.ts (action dispatchers)
    prompts/              # AI prompt templates + mock data
    schemas/churn.ts      # All Zod schemas (ChurnEvent, ChurnDossier, API contracts)
    tools/                # AI tool definitions + executor
    errors.ts             # Error utilities
    utils.ts              # cn() helper
```

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npx vitest run           # Run tests (no tests yet)
```

## Key Conventions

- **Path aliases:** `@/*` maps to `./src/*`
- **Schemas first:** All types flow from Zod schemas in `src/lib/schemas/churn.ts`
- **Demo fallback:** AI pipeline auto-falls back to `demo-fallback.ts` when `GEMINI_API_KEY` is missing — always works for demos
- **Stripe lazy init:** Never initialize Stripe SDK at module level with empty string; use lazy `getStripe()` pattern
- **API version:** Stripe `apiVersion` must match installed SDK version exactly (`2026-01-28.clover`)
- **No database:** All state lives in `src/lib/db/store.ts` (in-memory Map, resets on restart)

## Environment Variables

See `.env.example`:
- `GEMINI_API_KEY` — optional, demo mode works without it
- `STRIPE_SECRET_KEY` — optional for dev
- `STRIPE_WEBHOOK_SECRET` — optional for dev
- `NEXT_PUBLIC_APP_URL` — defaults to `http://localhost:3000`
