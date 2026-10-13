/**
 * Minimal in-memory per-IP rate limiter for API routes. Best-effort: the counter
 * lives in the serverless instance's memory, so it caps a single hammering client
 * per warm instance rather than enforcing a hard global quota. It's a deterrent
 * against casual scraping/abuse, not a replacement for a real WAF — for hard
 * limits, enable Vercel's Firewall/BotID in the dashboard. No external deps.
 */

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

/** Returns true if the request is allowed, false if the limit is exceeded. */
export function rateLimit(ip: string, key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const k = `${key}:${ip}`;
  const b = buckets.get(k);
  if (!b || now > b.reset) {
    buckets.set(k, { count: 1, reset: now + windowMs });
    // opportunistic cleanup so the map can't grow unbounded
    if (buckets.size > 5000) {
      for (const [mk, mv] of buckets) if (now > mv.reset) buckets.delete(mk);
    }
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

/** Best-effort client IP from Vercel/proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
