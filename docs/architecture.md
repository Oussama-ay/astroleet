# Astroleet architecture

## Decision

Astroleet uses a modular Next.js application: one repository and deployment
with explicit boundaries between interactive browser components, server-side
application services, external environmental-data providers, and optional
persistence.

We will not begin with a separate backend or a collection of microservices.
Next.js Route Handlers will form the backend-for-frontend. A separate worker is
introduced only when raster processing or scheduled ingestion exceeds the
runtime and resource limits of normal web requests.

## Current system

```text
Browser
  └─ Next.js pages and client components
       ├─ regional controls and Morocco-restricted Leaflet map
       ├─ observed climate charts, exports, and sharing
       ├─ local Morocco boundary data
       └─ clearly labelled demonstration satellite layers
                 │
                 ▼
Next.js server
  ├─ validated NASA POWER point and sampled-radius routes
  ├─ caching, provenance, rate limiting, and request telemetry
  ├─ deterministic climate screening
  └─ optional server-only OpenRouter or OpenAI explanations
```

The current dashboard provides observed monthly NASA POWER temperature,
precipitation, and relative-humidity data. Its NDVI, soil-moisture,
land-surface-temperature, and satellite-layer history values remain synthetic.
AI is optional and requires a server-side provider key; the observed climate
workflow works without it.

## Current and planned boundaries

```text
Browser
  ├─ map, charts, filters, exports, and geolocation
  └─ calls Astroleet endpoints only
                 │
                 ▼
Next.js server
  ├─ Route Handlers
  ├─ input validation and normalized domain contracts
  ├─ provider adapters and response caching
  ├─ deterministic aggregation and recommendation rules
  ├─ rate limiting, logging, and provenance
  └─ server-only AI orchestration
                 │
                 ▼
External providers
  ├─ NASA POWER climate data (implemented)
  ├─ OpenRouter or OpenAI explanations (optional, implemented)
  ├─ Sentinel-derived vegetation data (planned)
  ├─ land-surface-temperature products (planned)
  └─ soil-moisture products (planned)
                 │
                 ▼
Optional persistence
  ├─ saved locations and user preferences
  ├─ observed-data snapshots and cached aggregates
  └─ object storage for large raster products
```

## Responsibility boundaries

### Browser

The browser owns presentation and interaction: map navigation, selected
location and metric, form state, charts, browser geolocation, and initiating
downloads. It never owns provider secrets or scientific calculations that must
be reproducible and trusted.

### Next.js server

The server validates requests, calls providers, normalizes their responses,
caches results, computes statistics, and attaches provenance. Dashboard code
consumes Astroleet domain objects instead of provider-specific response shapes.

### Provider adapters

Each external source is isolated behind an adapter. An adapter is responsible
for request construction, timeouts, provider error mapping, unit conversion,
missing-value handling, and source metadata. Changing a provider must not
require rewriting dashboard components.

### Background processing

Long-running satellite ingestion, raster transformation, NDVI calculation, or
tile generation will run outside request handlers. Those jobs will write
versioned outputs to object storage and normalized summaries to persistence for
the web application to read.

## Intended directory evolution

```text
app/
  api/                  Internal HTTP endpoints
  dashboard/            Dashboard route
components/
  dashboard/            Interactive dashboard UI
lib/
  domain/               Provider-independent types and calculations
  server/               Server-only services, providers, and caching
  validation/           Request and response validation
  data.ts               Temporary demonstration data
docs/                   Architecture and operational documentation
```

Folders are introduced when their first real feature ships; the repository
should not contain speculative empty abstractions.

## Environmental data contract

Every observed result must carry enough information to be understood and
audited:

- location or geographic coverage;
- observation and aggregation period;
- parameter name, value, and unit;
- source provider and product;
- spatial and temporal resolution;
- retrieval or processing timestamp;
- quality flags and missing-data information;
- status: live, derived, cached, or demonstration.

Provider responses are transformed into this contract before reaching the UI.
Synthetic and observed values must never be presented as the same data class.

## AI boundary

AI is an explanation layer, not the source of environmental facts. Normal
application code retrieves measurements, calculates baselines and anomalies,
and applies documented thresholds. AI may turn that validated context into a
structured explanation, field-check suggestions, or multilingual briefing.

AI calls run only on the server. Outputs must reference supplied evidence,
include limitations, follow a validated schema, and return insufficient
evidence when required measurements are unavailable.

## Security

- Secrets are stored only in server-side environment variables.
- Secret names must not use the `NEXT_PUBLIC_` prefix.
- `.env.example` contains variable names and documentation, never credentials.
- Inputs are validated before provider, database, or AI calls.
- Provider and AI routes receive rate limits, timeouts, and bounded output.
- Logs must not contain credentials or unnecessary precise user locations.
- Saved locations require explicit consent, retention rules, and deletion.

## Persistence decisions

No database is needed for the first read-only climate integration. Add managed
PostgreSQL when accounts, saved locations, alerts, or durable analysis history
become product requirements. Add geographic extensions only when server-side
spatial queries justify their operational cost.

## Delivery status

1. Repository quality checks and domain contracts — implemented.
2. Cached NASA POWER access behind Next.js endpoints — implemented.
3. Observed climate results with provenance beside labelled demo data — implemented.
4. Point, radius, history, sharing, and export workflows — implemented.
5. Deterministic recommendations grounded in observed measurements — implemented.
6. Structured, evidence-constrained AI explanations — implemented.
7. Persistence and scheduled monitoring for saved locations — planned.
8. Replacement of demonstration satellite indicators — planned, one pipeline at a time.
