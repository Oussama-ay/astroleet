import { describe, expect, it, vi } from "vitest"
import { logOperationalEvent } from "../../lib/server/operational-telemetry"

describe("operational telemetry", () => {
  it("emits one structured, privacy-safe event", () => {
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }

    logOperationalEvent(
      {
        event: "ai_explanation_request",
        requestId: "request-123",
        route: "/api/climate/explain",
        outcome: "success",
        status: 200,
        durationMs: 14.6,
        model: "gpt-5.6-luna",
        signalCount: 1,
      },
      logger,
    )

    expect(logger.info).toHaveBeenCalledOnce()
    const event = JSON.parse(logger.info.mock.calls[0][0])
    expect(event).toMatchObject({
      event: "ai_explanation_request",
      requestId: "request-123",
      outcome: "success",
      status: 200,
      durationMs: 15,
    })
    expect(JSON.stringify(event)).not.toContain("latitude")
    expect(logger.warn).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })
})
