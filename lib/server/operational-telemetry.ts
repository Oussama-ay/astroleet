export interface OperationalEvent {
  event: "ai_explanation_request"
  requestId: string
  route: "/api/climate/explain"
  outcome: "success" | "rejected" | "failed"
  status: number
  durationMs: number
  errorCode?: string
  model?: string
  signalCount?: number
}

interface OperationalLogger {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}

export function logOperationalEvent(
  event: OperationalEvent,
  logger: OperationalLogger = console,
) {
  const message = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...event,
    durationMs: Math.round(event.durationMs),
  })

  if (event.status >= 500) logger.error(message)
  else if (event.status >= 400) logger.warn(message)
  else logger.info(message)
}
