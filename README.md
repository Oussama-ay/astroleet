# Astroleet

Astroleet is an environmental-intelligence platform for Morocco. It presents
vegetation, soil-moisture, and land-surface-temperature indicators across the
country's 12 administrative regions, with regional trends, recommendations,
and transparent methodology.

## Data status

The current dashboard is a demonstration. Environmental values and 12-month
histories are deterministic synthetic data modelled on Morocco's north-to-south
agro-climatic gradient. They are not live satellite observations and must not
be used for operational decisions.

The regional boundaries are real geographic data. Live provider integrations,
beginning with NASA POWER climate data, will be added behind server-side
Astroleet APIs. The architecture and data-boundary decisions are documented in
[docs/architecture.md](docs/architecture.md).

## Current product

- Cinematic overview of the Morocco environmental-monitoring mission.
- Interactive choropleth for Morocco's 12 regions.
- Demonstration layers for NDVI, soil moisture, and land-surface temperature.
- Twelve-month demonstration histories and rule-based recommendations.
- Methodology, processing pipeline, provenance, and uncertainty documentation.
- Responsive dark interface built for desktop and mobile browsers.

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Material UI and MUI X Charts
- React Simple Maps and D3 geographic projection
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

No environment variables are currently required. The example file documents
the security rules that future data-provider integrations must follow.

## Commands

| Command | Purpose |
| --- | --- |
| `corepack pnpm dev` | Start the development server. |
| `corepack pnpm lint` | Run ESLint. |
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

Environment variables introduced by future server integrations must be added
to the deployment environment and documented in `.env.example` without secret
values.
