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
       ├─ regional controls and SVG choropleth
       ├─ charts and recommendation cards
       ├─ local Morocco boundary data
       └─ deterministic demonstration values from lib/data.ts
```

The current dashboard contains no live environmental-provider integration and
requires no runtime secrets. Its NDVI, soil-moisture, land-surface-temperature,
and history values are synthetic. This status must remain visible until each
indicator is replaced by an observed-data pipeline.

## Target system

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
  └─ server-only AI orchestration when introduced
                 │
                 ▼
External providers
  ├─ NASA POWER climate data
  ├─ Sentinel-derived vegetation data
  ├─ land-surface-temperature products
  └─ soil-moisture products
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
- When variables are introduced, `.env.example` contains their names and
  documentation, never credentials.
- Inputs are validated before provider, database, or AI calls.
- Provider and AI routes receive rate limits, timeouts, and bounded output.
- Logs must not contain credentials or unnecessary precise user locations.
- Saved locations require explicit consent, retention rules, and deletion.

## Persistence decisions

No database is needed for the first read-only climate integration. Add managed
PostgreSQL when accounts, saved locations, alerts, or durable analysis history
become product requirements. Add geographic extensions only when server-side
spatial queries justify their operational cost.

## Delivery sequence

1. Establish repository quality checks and domain contracts.
2. Add cached NASA POWER access behind a Next.js endpoint.
3. Show live climate results with provenance beside clearly labelled demo data.
4. Add point, radius, historical, sharing, and export workflows.
5. Ground deterministic recommendations in observed measurements.
6. Add structured AI explanations after data and recommendation tests exist.
7. Add persistence and scheduled monitoring when users can save locations.
8. Replace demonstration satellite indicators one observed pipeline at a time.
