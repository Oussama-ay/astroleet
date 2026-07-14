import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { isAIExplanationConfigured } from "@/lib/server/ai-provider-config"

export const runtime = "nodejs"

export async function GET() {
  const requestId = randomUUID()

  return NextResponse.json(
    {
      status: "ok",
      services: {
        nasaPower: "route_available",
        aiExplanation: isAIExplanationConfigured()
          ? "configured"
          : "optional_unconfigured",
      },
      timestamp: new Date().toISOString(),
      requestId,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Request-Id": requestId,
      },
    },
  )
}
