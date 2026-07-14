import { createHash, randomBytes } from "node:crypto"

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
}

interface RateLimitBucket {
  count: number
  resetAt: number
}

interface FixedWindowRateLimiterOptions {
  limit: number
  windowMs: number
  now?: () => number
  salt?: string
}

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>()
  private readonly limit: number
  private readonly windowMs: number
  private readonly now: () => number
  private readonly salt: string

  constructor({ limit, windowMs, now = Date.now, salt }: FixedWindowRateLimiterOptions) {
    if (!Number.isInteger(limit) || limit < 1) throw new Error("Rate limit must be positive")
    if (!Number.isInteger(windowMs) || windowMs < 1) {
      throw new Error("Rate limit window must be positive")
    }

    this.limit = limit
    this.windowMs = windowMs
    this.now = now
    this.salt = salt || randomBytes(32).toString("hex")
  }

  consume(identifier: string): RateLimitResult {
    const now = this.now()
    const key = createHash("sha256").update(this.salt).update(identifier).digest("hex")
    const existing = this.buckets.get(key)
    const bucket =
      !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + this.windowMs }
        : existing

    bucket.count += 1
    this.buckets.set(key, bucket)
    if (this.buckets.size > 1_000) this.pruneExpired(now)

    return {
      allowed: bucket.count <= this.limit,
      limit: this.limit,
      remaining: Math.max(0, this.limit - bucket.count),
      resetAt: bucket.resetAt,
    }
  }

  private pruneExpired(now: number) {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key)
    }
  }
}

export const AI_RATE_LIMIT_MAX_REQUESTS = readPositiveInteger(
  process.env.AI_RATE_LIMIT_MAX_REQUESTS,
  5,
  100,
)
export const AI_RATE_LIMIT_WINDOW_SECONDS = readPositiveInteger(
  process.env.AI_RATE_LIMIT_WINDOW_SECONDS,
  60,
  3_600,
)

export const aiExplanationRateLimiter = new FixedWindowRateLimiter({
  limit: AI_RATE_LIMIT_MAX_REQUESTS,
  windowMs: AI_RATE_LIMIT_WINDOW_SECONDS * 1_000,
})

export function getClientRateLimitIdentifier(request: Request) {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || "unidentified-client"
}

function readPositiveInteger(value: string | undefined, fallback: number, maximum: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maximum ? parsed : fallback
}
