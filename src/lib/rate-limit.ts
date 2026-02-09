import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// --- Types ---

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp (seconds)
}

// --- Storage (same Map pattern as src/lib/db/store.ts) ---
// Key format: "${ip}:${routeKey}"
const requests = new Map<string, RateLimitEntry>();

// --- Cleanup (lazy, throttled to every 60s) ---
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;
const MAX_WINDOW_MS = 5 * 60 * 1000; // 5 min ceiling for pruning

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - MAX_WINDOW_MS;
  for (const [key, entry] of requests) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      requests.delete(key);
    }
  }
}

// --- Core: Sliding Window ---

function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  cleanup();

  let entry = requests.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    requests.set(key, entry);
  }

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.limit) {
    // Rate limited — find when the oldest request in window expires
    const oldestInWindow = entry.timestamps.at(0) ?? now;
    const resetAt = Math.ceil((oldestInWindow + config.windowMs) / 1000);
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt,
    };
  }

  // Allowed — record this request
  entry.timestamps.push(now);
  const remaining = config.limit - entry.timestamps.length;
  const resetAt = Math.ceil((now + config.windowMs) / 1000);

  return {
    allowed: true,
    limit: config.limit,
    remaining,
    resetAt,
  };
}

// --- IP Extraction ---

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return "127.0.0.1";
}

// --- Rate Limit Headers ---

function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetAt),
  };
  if (!result.allowed) {
    headers["Retry-After"] = String(
      Math.max(1, result.resetAt - Math.floor(Date.now() / 1000))
    );
  }
  return headers;
}

// --- Pre-defined Route Configs ---

export const RATE_LIMITS = {
  // Write operations that trigger Gemini / mutations: strict
  simulate: { limit: 5, windowMs: 60_000 },
  analyzePost: { limit: 5, windowMs: 60_000 },
  seed: { limit: 3, windowMs: 60_000 },
  actions: { limit: 10, windowMs: 60_000 },
  stripeWebhook: { limit: 20, windowMs: 60_000 },

  // Read operations: generous (polling every 2s = 30/min per tab)
  analyzeGet: { limit: 60, windowMs: 60_000 },
  analyzeGetById: { limit: 60, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitConfig>;

// --- Public API ---

/**
 * Rate limit guard for route handlers. Returns a 429 NextResponse if the
 * caller has exceeded the limit, or null if the request is allowed.
 *
 * Usage:
 *   const blocked = applyRateLimit(req, "simulate");
 *   if (blocked) return blocked;
 */
export function applyRateLimit(
  req: NextRequest,
  routeKey: keyof typeof RATE_LIMITS
): NextResponse | null {
  const config = RATE_LIMITS[routeKey];
  const ip = getClientIp(req);
  const key = `${ip}:${routeKey}`;
  const result = checkRateLimit(key, config);
  const headers = rateLimitHeaders(result);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: Math.max(
          1,
          result.resetAt - Math.floor(Date.now() / 1000)
        ),
      },
      { status: 429, headers }
    );
  }

  return null;
}
