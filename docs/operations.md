# Astroleet operations

## Runtime health

`GET /api/health` reports whether the application process is running and whether the optional AI
credential is configured. It does not call NASA POWER or OpenAI, reveal credentials, or guarantee
that an external provider currently has capacity.

## AI request safeguards

`POST /api/climate/explain` applies a five-request-per-minute default burst limit before parsing the
request or contacting OpenAI. Override the defaults with `AI_RATE_LIMIT_MAX_REQUESTS` and
`AI_RATE_LIMIT_WINDOW_SECONDS`.

The limiter stores hashed client identifiers only in process memory. It protects a warm application
instance from accidental bursts, but it is not a global quota across multiple serverless instances.
Production-wide enforcement requires a managed distributed store or hosting-platform firewall.

Every AI response includes:

- an `X-Request-Id` header for support correlation;
- standard `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers;
- `Retry-After` when the application or provider rejects a burst.

## Privacy-safe telemetry

AI route events are emitted as one-line JSON records through the hosting platform's normal logs.
Records contain the request ID, outcome, HTTP status, duration, safe error code, model on success,
and signal count. They never contain API keys, exact coordinates, environmental values, prompts,
provider response bodies, or client IP addresses.

OpenAI failures are separated into quota, provider rate limit, authentication/configuration,
timeout, invalid structured output, and general provider availability categories. Public responses
remain safe while logs retain enough context to find the failing request.

## Durable monitoring boundary

Saved locations, analysis history, scheduled checks, and notifications are not persisted yet.
Implementing them requires explicit product choices for user identity, consent, retention and
deletion, managed PostgreSQL, and a notification channel such as email. Do not schedule monitoring
or store precise locations until those decisions and services are configured.
