# Meteo_front

Meteo_front is the frontend for the Meteo project: a dashboard ("MergeMeteo")
that compares multi-day weather forecasts for Plovdiv, Sofia, and Vidin from
three Bulgarian weather sites — Dalivali, Freemeteo, and Sinoptik. It reads
directly from the same Postgres (Neon) database that a separate scraper
repo, [`Meteo`](https://github.com/Simeonov98/Meteo), writes into — there is
no API between the two projects, just a shared database and a fixed Prisma
schema.

This is v2: a dependency-modernization and de-duplication pass over the
original app. See [CHANGES.md](CHANGES.md) for exactly what changed and why,
including a note on why it stayed on the Next.js Pages Router.

## Stack

- **Next.js** (Pages Router) — React framework, SSR/static hosting.
- **tRPC** + **Prisma** — end-to-end typesafe API over the shared Postgres DB.
- **Tailwind CSS** — utility-first styling.
- **Chart.js** — the temperature/MAE line charts.

## Project layout

```
prisma/            Prisma schema (shared with the Meteo scraper — see CHANGES.md)
prisma.config.ts    Prisma CLI config (connection URL, driver adapter setup)
src/
  pages/            index.tsx (past week), forecast.tsx (next week), detailed.tsx (drill-down)
  components/        Shared UI: SiteHeader, CitySelector, ForecastChart, ForecastCard, ProviderSection
  utils/             aggregateDailyAverages, computeMaeByDate — shared across pages
  server/api/        tRPC routers (cities, providers) and context
```

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL for the shared Postgres/Neon DB
npx prisma generate
```

## Usage

```bash
npm run dev     # http://localhost:3000
npm run build
npm run start
npm run lint
```

## License

MIT — see the `LICENSE` file.
