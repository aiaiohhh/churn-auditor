# ChurnAuditor

AI-powered churn analysis dashboard. Detects subscription cancellations via Stripe webhooks, diagnoses root causes with Gemini AI, and recommends recovery actions.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (strict mode, `noUncheckedIndexedAccess`)
- **Styling:** Tailwind CSS 4, shadcn/ui, dark theme with glassmorphism (OKLCH color space)
- **AI:** Google Gemini (`@google/genai`) — Flash for triage, Pro for deep analysis
- **Payments:** Stripe SDK for webhook ingestion
- **Validation:** Zod 4
- **Storage:** In-memory Map (hackathon MVP, no database)
- **Utilities:** date-fns, uuid, tw-animate-css

## Project Structure

```
src/
  app/
    (dashboard)/              # Main dashboard page + layout (page is client component)
    api/
      actions/                # POST: execute recovery actions (Linear, email, Slack)
      analyze/                # POST: trigger AI analysis (async via after() or SSE streaming)
        [id]/                 # GET: poll analysis status by ID (async params)
      seed/                   # POST: seed demo data
      simulate/              # POST: simulate churn events (runs analysis in background)
      webhooks/stripe/       # POST: Stripe webhook handler (demo mode if no secret)
  components/
    churn/                   # ChurnFeed, DossierView, ActionCenter, MetricsChart, SimulateButton
    ui/                      # shadcn/ui primitives (badge, button, card, tabs, etc.)
  hooks/
    useAnalysis.ts           # Polling hook (2s interval), returns { analyses, loading, error, triggerRefresh }
  lib/
    db/store.ts              # In-memory Map store (createAnalysis, getAnalysis, getAllAnalyses, updateAnalysis)
    gemini/
      agent.ts               # 2-stage AI pipeline: triage (Flash) → diagnosis (Flash or Pro) + auto-fallback
      client.ts              # Gemini API wrapper with structured JSON output
      demo-fallback.ts       # Deterministic mock scenarios (hash-based, consistent per customer)
    integrations/            # email.ts, linear.ts, slack.ts — mock implementations with simulated delays
    prompts/
      diagnosis.ts           # Triage + diagnosis prompt templates
      mock-data.ts           # Customer context generator (tickets, usage, surveys)
    schemas/churn.ts         # All Zod schemas (ChurnEvent, ChurnDossier, API contracts, enums)
    tools/
      definitions.ts        # AI tool schema declarations
      executor.ts            # Tool execution: maps tool names → integration functions
    errors.ts                # Result<T,E> type (Rust-inspired, no exceptions in business logic)
    utils.ts                 # cn() helper (clsx + twMerge)
```

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npx vitest run           # Run tests (no tests yet)
```

## Architecture

### AI Pipeline (Two-Stage)
1. **Triage (Flash, temp 0.3):** Quick assessment — is deep analysis worthwhile? Returns urgency + save probability estimate
2. **Diagnosis (Flash or Pro, temp 0.4):** If triage says worth it → Pro model; otherwise → Flash. Returns full `ChurnDossier`
3. **Tool Execution:** Recommended actions are auto-executed via integration mocks (Linear tickets, winback emails, Slack alerts)
4. **Auto-Fallback:** Missing API key or Gemini timeout (25s) → deterministic demo fallback

### Structured Output
Gemini uses `responseMimeType: "application/json"` + `responseSchema` with SDK's `Type` enum from `@google/genai`. Must use SDK Type enum, not string literals.

### Data Flow
- Client polls `/api/analyze` every 2s via `useAnalysis` hook
- Analysis runs in background via Next.js `after()` API (keeps Vercel function alive post-response)
- SSE streaming supported when `Accept: text/event-stream` header is sent
- All state in `Map<string, AnalysisResult>` — resets on deploy

### Error Handling
- **Result type pattern:** `{ ok: true, value: T } | { ok: false, error: E }` — no thrown exceptions in business logic
- **API validation:** Zod `safeParse()` at all entry points, returns `{ error, details: parsed.error.flatten() }` on failure
- **Status codes:** 201 (created), 200 (success), 400 (validation), 404 (not found), 500 (server error)

## Key Conventions

- **Path aliases:** `@/*` maps to `./src/*`
- **Schemas first:** All types flow from Zod schemas in `src/lib/schemas/churn.ts` via `z.infer<typeof Schema>`
- **Demo fallback:** AI pipeline auto-falls back to `demo-fallback.ts` when `GEMINI_API_KEY` is missing — always works for demos. Uses deterministic hash so same customer always gets same result.
- **Client components:** All business components use `"use client"`. Dashboard page is a client component. Layouts are server components.
- **Polling, not WebSockets:** Simple 2s polling via `useAnalysis` hook — sufficient for MVP, stateless on server
- **Mock integrations:** Linear, email, Slack are mock implementations with simulated delays (200-300ms). Replace with real API calls for production.
- **No external state management:** React hooks only (useState + custom hooks)

## Gotchas & Pitfalls

### Stripe SDK
- **Never initialize at module level with empty string.** Use lazy `getStripe()` function pattern
- **`apiVersion` must match installed SDK version exactly** (`2026-01-28.clover`). Verify with `npm list stripe`
- **Demo webhook mode:** If `STRIPE_WEBHOOK_SECRET` is missing, webhook accepts unsigned JSON body. Always require signature verification in production.

### Next.js 16
- **Async params in dynamic routes:** `params` is a `Promise` — must `await` it:
  ```typescript
  export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
  }
  ```
- **`after()` API:** Used for background work post-response. Vercel keeps function alive.
- **`create-next-app` conflicts** with existing `.claude/` directory — scaffold in `/tmp` then copy files over

### Gemini SDK
- **Must use SDK `Type` enum** (`import { Type } from "@google/genai"`) for `responseSchema` definitions, not string literals
- **Timeout:** 25-second limit on Gemini calls; auto-falls back to demo mode on timeout

### SSE Streaming
All three headers required for reliable browser support:
```typescript
headers: {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
}
```

## Styling

- **Dark theme only** (`.dark` class on HTML element)
- **OKLCH color space** for perceptual uniformity
- **Glassmorphism:** `glass-card` class → `rgba(15,23,42,0.6)` bg + `blur(16px)` + subtle border
- **Churn-specific colors:** Red (bugs), orange (pricing), yellow (support), purple (competition), blue (features), green (success)
- **Custom animations:** `fade-in-up`, `slide-in-right`, `pulse-glow`, `pulse-green`, `shimmer`, `progress-fill`, `spin-slow`
- **`cn()` helper:** `twMerge(clsx(...))` — prevents conflicting Tailwind class precedence

## Environment Variables

See `.env.example`:
- `GEMINI_API_KEY` — optional, demo mode works without it
- `STRIPE_SECRET_KEY` — optional for dev
- `STRIPE_WEBHOOK_SECRET` — optional for dev
- `NEXT_PUBLIC_APP_URL` — defaults to `http://localhost:3000`

## Deployment

- **Platform:** Vercel (leverages `after()` API for background tasks)
- **No custom `next.config.ts`** — uses Next.js 16 defaults
- **TypeScript:** Strict mode + `noUncheckedIndexedAccess`, target ES2017
- **All env vars optional** — app fully functional in demo mode without any credentials
