import { describe, expect, it } from "vitest"
import {
  FixedWindowRateLimiter,
  getClientRateLimitIdentifier,
} from "../../lib/server/request-rate-limit"

describe("fixed-window request rate limit", () => {
  it("allows a bounded burst and rejects later requests", () => {
    const limiter = new FixedWindowRateLimiter({
      limit: 2,
      windowMs: 60_000,
      now: () => 1_000,
      salt: "test-salt",
    })

    expect(limiter.consume("client-a")).toMatchObject({ allowed: true, remaining: 1 })
    expect(limiter.consume("client-a")).toMatchObject({ allowed: true, remaining: 0 })
    expect(limiter.consume("client-a")).toMatchObject({ allowed: false, remaining: 0 })
    expect(limiter.consume("client-b")).toMatchObject({ allowed: true, remaining: 1 })
  })

  it("opens a new window after the reset time", () => {
    let now = 1_000
    const limiter = new FixedWindowRateLimiter({
      limit: 1,
      windowMs: 10_000,
      now: () => now,
      salt: "test-salt",
    })

    expect(limiter.consume("client-a").allowed).toBe(true)
    expect(limiter.consume("client-a").allowed).toBe(false)
    now = 11_000
    expect(limiter.consume("client-a")).toMatchObject({ allowed: true, remaining: 0 })
  })

  it("derives an ephemeral identifier without exposing it in the result", () => {
    const request = new Request("https://astroleet.example/api/climate/explain", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    })

    expect(getClientRateLimitIdentifier(request)).toBe("203.0.113.10")
  })
})
