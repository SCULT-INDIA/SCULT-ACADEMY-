import "server-only";
import { headers } from "next/headers";

/* Best-effort, per-instance rate limiting for login and certificate
   lookups. It slows down guessing; it is not a substitute for a shared
   store if this ever needs hard guarantees across many instances. */

const buckets = new Map<string, { count: number; resetAt: number }>();

export async function clientKey(scope: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

/** Returns true when the caller is still within `limit` attempts per `windowMs`. */
export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
