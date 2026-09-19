/**
 * Tiny in-memory sliding-window limiter.
 *
 * Good enough to stop accidental hammering. On Vercel each serverless instance
 * has its own memory, so this is NOT a hard guarantee. For real protection put
 * Upstash Redis (@upstash/ratelimit) or Vercel's WAF rate limiting in front of the route.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

const hits = new Map<string, number[]>();

export function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((WINDOW_MS - (now - recent[0])) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return { ok: true, retryAfter: 0 };
}
