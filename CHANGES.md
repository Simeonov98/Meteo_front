# v1 -> v2

## Structure

- 3 pages (`index.tsx`, `forecast.tsx`, `detailed.tsx`, 1241/751/237 lines)
  each hand-rolled their own header, city selector, chart builders, and
  per-day cards, once per weather provider (Dalivali/Freemeteo/Sinoptik) ->
  shared `src/components/` (`SiteHeader`, `CitySelector`, `ForecastChart`,
  `ForecastCard`, `ProviderSection`) and `src/utils/` (`aggregate.ts`,
  `mae.ts`) used by all three pages. Total page + router line count drops
  from ~2640 to ~1000, including the new shared files.
- `calculateAverages` / `calculateAveragesF` / `calculateAveragesDay` /
  `calculateAveragesDate` / `calculateAveragesDayF` (5 near-identical
  date-bucketing-and-averaging functions, one per page/provider
  combination) -> one `aggregateDailyAverages()` in `src/utils/aggregate.ts`.
- `calcMaeDali` / `calcMaeFree` / `calcMaeSino` (3 near-identical MAE
  functions) -> one `computeMaeByDate()` in `src/utils/mae.ts` (see
  "Correctness fixes" below for the behavior change).
- `chartfunc` / `chartfuncF` / `chartfuncDay` / `chartfuncDate` /
  `chartfuncErr` (5 near-identical Chart.js dataset builders, each also
  re-running `ChartJS.register(...)`) -> `TemperatureChart` / `MaeChart` in
  `src/components/ForecastChart.tsx`, registering Chart.js once.
- `provider.ts`'s 6 `getForTodayDays*`/`getForNextWeek*` procedures each
  duplicated the `new Date(Date.now()).toISOString().split("T")[0]?.concat(...)`
  "start of today" computation -> one `startOfTodayISO()` / `dateRangeFilter()`
  pair.
- The 3 `getCertainDate*` procedures each inlined the same
  `image.src.toString('base64')` mapping -> one `withBase64Image()` helper
  (which also now handles a real null case — see below).

## Correctness fixes

- **MAE calculation used a fragile, accidental self-comparison skip.** The
  old `calcMaeDali`/`Free`/`Sino` decided which snapshot was "the reference"
  by comparing `arrayOfObjects[index - 1]`'s calendar day to the current
  item's day; the very first (index 0) comparison always fails since
  `arrayOfObjects[-1]` is `undefined`, which is what silently excluded the
  latest snapshot from its own error calculation. This only worked because a
  "today" query's rows never actually spanned two calendar days — if they
  ever did, the logic would silently break in a new way each time. v2's
  `computeMaeByDate()` sorts rows `createdAt desc` (already true of the
  underlying queries) and explicitly treats `rows[0]` as ground truth,
  excluding it from the error sum by construction, not by index coincidence.
- **`/detailed` crashed on real data.** `prisma/schema.prisma` uses
  `relationMode = "prisma"` (foreign keys aren't enforced by Postgres), and
  in the live database every forecast row's `imageId` is unset — so
  `include: { image: true }` returns `image: null` at runtime for
  effectively every row, despite the generated Prisma type claiming `image`
  is always present. Both v1 and the first draft of v2's `withBase64Image()`
  did `obj.image.src.toString('base64')` unconditionally, which throws
  `Cannot read properties of null (reading 'src')`. Found by querying the
  live DB directly during verification — real users would hit this on any
  `/detailed` visit that resolves to a real row. `withBase64Image()` now
  passes `image: null` through untouched, and `detailed.tsx` skips
  rendering the `<img>` when it's null instead of crashing.
- **Redundant "latest" queries removed.** `getForTodayDaysDaliLatest` /
  `SinoLatest` / `FreeLatest` fired a second, near-identical tRPC query
  (same filters, `take: 1`) purely to get the most recent snapshot as the
  MAE reference — but `getForTodayDaysDali/Free/Sino` already `orderBy:
  createdAt desc`, so element `[0]` of that result *is* the same row.
  `computeMaeByDate()` derives the reference from the array it's already
  given instead of a second round-trip. (Freemeteo's `Latest` query also had
  a `tmax: { not: null }` filter the main query lacked; that filter moved to
  the main `getForTodayDaysFree`/`getForNextWeekFree` queries so the
  "reference" row is never a null-tmax row, matching the old `Latest`
  query's guarantee.)

## Removed dead code

- **`@clerk/nextjs`**: imported on every page (`SignInButton`,
  `useUser`, etc.) but `_app.tsx` never actually applied `ClerkProvider` —
  auth was never wired up, just imported. Dropped entirely.
- **`@material-tailwind/react`**: imported `Card`, `Typography`, `Tabs`,
  `TabsHeader`, `TabsBody`, `Tab`, `TabPanel`, `ListItem` across the pages;
  only a plain `<Button>` was ever rendered. Replaced with a plain Tailwind
  `<button>`; the dependency (and its Tailwind-v3-only `withMT()` plugin
  wiring) is gone.
- **`@neondatabase/serverless`** and **`chartjs-plugin-datalabels`**: present
  in `package.json`, never imported anywhere in `src`. Removed. (Prisma 7's
  driver-adapter requirement below pulls in `@prisma/adapter-pg` instead —
  a standard `pg`-based adapter, since this app runs as a persistent Node
  server rather than an edge function, so Neon's HTTP/WebSocket serverless
  driver has no advantage here.)
- **Dead tRPC procedures**: `getDaliVali` (its result, `dataDaliVali`, was
  fetched in `forecast.tsx` but never read), `getForErrorDaysDali` (never
  called from any page), the fully-commented-out `getForecastDate`, and a
  second `providers.getAll` that duplicated `cities.getAll` (also never
  called — every page used `cities.getAll`).
- **`horizon-tailwind-react/`**: an empty directory, referenced only by
  commented-out imports (`// import LineChart from "horizon-tailwind-react/..."`).
  Deleted.
- Large blocks of commented-out alternate implementations (old
  table-based renderings, unused `groupBy` variants, dead `useState`s) in
  all three pages — removed rather than carried forward.

## Dependency modernization

Bumped to latest majors: Next.js 13 -> 16, React 18 -> 19, Prisma 4 -> 7,
tRPC 10 -> 11, `@tanstack/react-query` 4 -> 5, Tailwind CSS 3 -> 4, Zod 3 -> 4,
ESLint 8 -> 9, plus the smaller packages (superjson, `@t3-oss/env-nextjs`,
chart.js, date-fns). Consequences worth knowing about:

- **Prisma 7 removed `datasource.url` from `schema.prisma`.** Connection
  config now lives in `prisma.config.ts` (for the CLI) plus a driver adapter
  passed to `new PrismaClient({ adapter })` in `src/server/db.ts` (for the
  app). Added `@prisma/adapter-pg`. The schema's model/table/column names
  and `relationMode` are untouched — this app shares its Postgres database
  directly with the separate `Meteo` scraper, so the data shape can't change
  independently of that project.
- **ESLint 9 requires flat config.** `.eslintrc.cjs` -> `eslint.config.mjs`,
  built from `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
  (both already ship as flat-config arrays).
- **`next lint` was removed in Next.js 16.** `package.json`'s `lint` script
  now runs `eslint .` directly.
- **Tailwind v4 is CSS-first.** `tailwind.config.ts` (JS config + `withMT()`)
  -> an `@theme` block with the 4 custom colors directly in
  `src/styles/globals.css`; `postcss.config.cjs` now runs
  `@tailwindcss/postcss` instead of `tailwindcss` + `autoprefixer` (v4 does
  its own vendor-prefixing internally).
- **tRPC v11's `httpBatchLink` requires `transformer` per-link**, not on the
  top-level client config, when the router itself declares a transformer —
  moved `transformer: superjson` into the `httpBatchLink(...)` call in
  `src/utils/api.ts`. One exception: `@trpc/next@11.18.0`'s own
  `createTRPCNext` config type still separately *requires* a top-level
  `transformer`, while also structurally extending a type that *forbids* it
  (confirmed by reading its `.d.cts` directly — this is a genuine
  inconsistency in that package's shipped types, not app code). Both are set
  since both are needed for the code to actually work; the conflicting
  top-level type error is suppressed with one documented `@ts-expect-error`,
  not a blanket ignore.
- `next.config.mjs`'s `eslint.ignoreDuringBuilds` and
  `typescript.ignoreBuildErrors` are removed now that both are actually
  clean — they existed in v1 to hide real errors, not to represent an
  intentional relaxation.
- `tsconfig.json`'s `moduleResolution` moved `node` -> `bundler` (required
  for the `package.json`-`exports`-based subpath imports used by
  `eslint-config-next/*` and newer `@t3-oss/env-nextjs`); `next build`
  auto-updated `jsx` to `react-jsx` on first run.

## Minor fixes caught while rewriting

- `<a href="/">` in the header -> `next/link`'s `<Link>` (an actual ESLint
  error once `ignoreDuringBuilds` was removed).
- Chart datasets set `tention: 0.7` (not a real Chart.js option — a typo for
  `tension`), so the intended curve smoothing silently never applied. Fixed
  the typo.
- A stray "diviation" -> "deviation" typo in the header tagline.
- Missing `key` prop was on the inner `<Button>` instead of the mapped `<li>`
  in the city list.

## What's unchanged on purpose

- Same 3 routes (`/`, `/forecast`, `/detailed`) and the same features: past
  week per-provider comparison + MAE panel, next week's forecast, and a
  per-day drill-down table with the scraped weather icon.
- Still the Pages Router, still client-side tRPC hooks with `ssr: false` —
  see the Pages Router vs App Router section below for why.
- `prisma/schema.prisma`'s models, table names, and column names are
  byte-for-byte the same, since the separate Python scraper
  (`~/Dev/Meteo`) writes into this exact schema.
- Still Selenium-scraped, Prisma-read forecast data — no new data source or
  caching layer was introduced.

## Pages Router vs App Router

v2 deliberately stayed on the Next.js Pages Router rather than migrating to
the App Router. Both are fully supported in Next.js 16.

| | Pages Router (chosen) | App Router |
|---|---|---|
| Migration effort | None — bump dependencies in place | Rewrite every page into `app/`, add `"use client"` boundaries, swap `createTRPCNext`/`withTRPC` for `@trpc/tanstack-react-query`, move the API handler from `pages/api/trpc/[trpc].ts` to a route handler |
| Data fetching model | Client-side tRPC hooks (`useQuery`), same as today | Can mix Server Components + client hooks, or fetch server-side and stream |
| Fits this app? | Yes — every page is already 100% client-rendered (`ssr: false`); there's no server-only data, no streaming, no partial prerendering need | Would only pay off if the app wanted RSC data fetching, layouts, or streaming — none of which this app currently uses |
| Risk | Low — same architecture, only dependency versions changed | Higher — new file conventions, new tRPC adapter, new data-fetching idioms, all while also absorbing the other v2 changes |
| Future flexibility | Can still migrate later, page by page if needed | N/A |

Given the app's actual requirements (three client-rendered dashboards over a
tRPC API), the App Router would add migration risk without buying anything
this app needs. If a future feature genuinely needs Server Components or
streaming, that's a good trigger to revisit this.
