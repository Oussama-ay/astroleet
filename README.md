# Astroleet

Astroleet is an environmental-intelligence platform for Morocco. It presents
vegetation, soil-moisture, and land-surface-temperature indicators across the
country's 12 administrative regions, with regional trends, recommendations,
and transparent methodology.

## Data status

The dashboard combines observed monthly NASA POWER climate data with clearly
labelled demonstration satellite layers. Temperature, precipitation, and
humidity observations are retrieved through cached server-side Astroleet APIs.
The NDVI, soil-moisture, land-surface-temperature, and 12-month satellite-layer
histories remain deterministic synthetic data and must not be treated as live
satellite measurements.

Regional boundaries are real geographic data. The architecture and data
boundaries are documented in [docs/architecture.md](docs/architecture.md).

## Current product

- Cinematic overview of the Morocco environmental-monitoring mission.
- Morocco-restricted Leaflet explorer for regional and point analysis.
- Observed NASA POWER climate history with point and sampled-radius workflows.
- Deterministic anomaly screening with optional grounded AI explanations.
- Shareable analysis URLs and CSV/JSON exports with provenance.
- Demonstration layers for NDVI, soil moisture, and land-surface temperature.
- Twelve-month synthetic histories and rule-based recommendations.
- Methodology, processing pipeline, provenance, and uncertainty documentation.
- Responsive dark interface built for desktop and mobile browsers.

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Material UI and MUI X Charts
- Leaflet and React Leaflet
- OpenAI SDK with OpenRouter/OpenAI provider support
- Zod-validated environmental and AI contracts
- Tailwind CSS 4
- pnpm
- Vercel Analytics in production

## Requirements

- Node.js 22 or newer
- Corepack, included with modern Node.js releases

## Local setup

```bash
corepack enable
corepack pnpm install
cp .env.example .env.local
corepack pnpm dev
```

Open `http://localhost:3000`.

NASA POWER observations work without credentials. AI explanations are optional
and require the server-only variables documented in `.env.example`.

## Commands

| Command | Purpose |
| --- | --- |
| `corepack pnpm dev` | Start the development server. |
| `corepack pnpm lint` | Run ESLint. |
| `corepack pnpm typecheck` | Validate TypeScript. |
| `corepack pnpm test` | Run unit tests. |
| `corepack pnpm test:e2e` | Run the dashboard browser test. |
| `corepack pnpm build` | Create a production build. |
| `corepack pnpm start` | Run the production build. |

## Project structure

```text
app/                    Routes, layouts, and global styles
components/             Shared UI and dashboard components
components/dashboard/   Map, controls, metrics, charts, and recommendations
lib/                    Domain data, scales, theme, and geographic boundaries
public/                 Images, videos, icons, and public geographic data
docs/                   Architecture and engineering decisions
```

## Optional AI climate explanations

The observed-climate dashboard works without AI. It supports OpenRouter or OpenAI for its
on-demand, evidence-constrained explanations. Copy the example environment file:

```bash
cp .env.example .env.local
```

Set `AI_API_KEY` in `.env.local`, then restart the development server. The example selects
`openrouter` with `nvidia/nemotron-3-ultra-550b-a55b:free`. Keep the key server-side: never use a
`NEXT_PUBLIC_` name, paste it into client code, or commit `.env.local`.

Existing `OPENAI_API_KEY` and `OPENAI_MODEL` variables remain compatible. When a legacy model name
contains `/`, Astroleet infers OpenRouter, so current local environments do not need an immediate
rename. For OpenAI, set `AI_PROVIDER=openai`, `AI_API_KEY`, and an OpenAI model in `AI_MODEL`.

OpenRouter's page for this free Nemotron endpoint states that request content may be logged for
security and NVIDIA product improvement. Astroleet excludes exact point coordinates and only sends
compact climate evidence, but do not use a free endpoint for confidential data. Review the
[model policy and endpoint details](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b%3Afree)
before production use.

For deployed environments, add the same variables through the hosting provider's encrypted
environment settings. Use separate provider keys for preview and production when possible, and
configure provider budget and rate-limit controls.

The AI route includes privacy-safe request logs, request IDs, and a best-effort per-instance burst
limit. See [the operations guide](docs/operations.md) for health checks, configuration, telemetry,
and the boundary before durable saved-location monitoring.

If port `3000` is already in use, Next.js may ask to use another port. Accept it, then open the URL printed in the terminal.

## Package installation

This repository uses `pnpm-lock.yaml`. Use pnpm rather than npm or Yarn so
dependency versions remain reproducible.

`pnpm-workspace.yaml` approves the required install scripts for `msw` and
`sharp`. Keep those approvals enabled or pnpm may reject their build steps.

## Data and security rules

- The interface must label values as live, derived, cached, or demonstration.
- Every live result must include its source, period, units, resolution, and
  retrieval time.
- External providers must be called through server-side services rather than
  directly from dashboard components.
- API keys and other secrets must never be committed or exposed through
  `NEXT_PUBLIC_` environment variables.
- AI explanations may interpret validated measurements but must never invent
  or replace the underlying calculations.

## Deployment

The application is configured for Vercel. Before deployment, run:

```bash
corepack pnpm lint
corepack pnpm build
```

Required server variables must be added to the deployment environment and
documented in `.env.example` without secret values.
