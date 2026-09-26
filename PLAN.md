# ETF Holding-Exposure Tracker — Build Plan

## Context

Self-hosted website that builds a crowd-sourced database of ETF holdings and converts
"I put $X into these ETFs" into equivalent $ exposure in each underlying stock.

- Any user can add/update an ETF by pasting the issuer's holding-sheet **URL**
  (server fetches + parses) or **uploading** the sheet (CSV/XLSX). PDF deferred.
- Every import becomes a **dated snapshot** — history accumulates in the shared DB.
- Portfolio calc: `exposure(stock) = Σ over ETFs of (amount × weight%)` → $ and % per
  underlying stock, aggregated across all the user's ETFs.
- No auth in MVP. Personal amounts stay in the browser (calc is client-side).

## Fixed decisions

| Decision | Choice |
|---|---|
| Stack | Next.js (App Router) + TypeScript, single repo |
| DB | Postgres (shared crowd-sourced) |
| ORM | postgres.js (raw SQL, sqlx-style) — no ORM |
| Host | Self-hosted, Docker (Dockerfile + docker-compose.yml) |
| Inputs | URL fetch+parse, CSV/XLSX upload (no PDF) |
| URL adapters | Vanguard first; generic table extractor as fallback for other issuers |
| Scope | Calculator + crowd DB, no accounts |
| Top-10 sheets | Supported; flagged `partial: true` + warning banner (exposure math incomplete for those) |

## Data model

`db/migrations/0001_init.sql`, applied by tiny migration runner `src/lib/migrate.ts`
tracks applied files in `schema_migrations`. Applied via `npm run migrate`
(compose entrypoint runs migrate → `next start`).

```sql
create table etfs (
  id bigserial primary key,
  ticker text not null unique,
  name   text not null,
  issuer text,
  created_at timestamptz not null default now()
);
create table snapshots (
  id bigserial primary key,
  etf_id bigint not null references etfs(id) on delete cascade,
  as_of_date date not null,
  source text not null check (source in ('url','upload')),
  source_url text,
  content_hash text not null,          -- sha256 of canonical holdings JSON (sorted by ticker)
  holdings jsonb not null,             -- [{t, n, weight, sector, region, mv, shares}]
  partial bool not null default false,
  created_at timestamptz not null default now(),
  unique (etf_id, as_of_date)
);
create index snapshots_etf_id_idx on snapshots(etf_id, created_at desc);
```

Dedup / snapshot semantics:
- Ticker is globally unique (one ETF = one row; imports upsert `etfs` on ticker).
- Import upserts on `(etf_id, as_of_date)`.
- If `(etf_id, as_of_date)` exists **and** `content_hash` matches → 200 `{duplicate: true}`, no write.
- If same date, different hash → overwrite (sheet corrected) → 201 `{updated: true}`.
- New date → 201 `{created: true}`; history accumulates.

Normalized holding shape (weight is a number, e.g. `7.7633` means 7.7633%):
`{t: ticker, n: name, weight: number, sector?, region?, mv?, shares?}`

## Parser pipeline

All inputs → one normalized shape.

1. **Content routing**: uploaded file extension/MIME; fetched URL → content-type sniff.
   - `...spreadsheetml` / `.xlsx/.xls` → SheetJS path
   - `text/csv` / `.csv` → papaparse path
   - `text/html` → cheerio table-extraction path
2. **Row extraction**
   - XLSX: `XLSX.read` → first sheet → `sheet_to_json` (header:1 → array of arrays).
   - CSV: papaparse `header: false` → array of arrays.
   - HTML: cheerio — find the `<table>` whose header row fuzzy-matches the holdings
     header (ticker + weight column), then grab rows. Vanguard adapter: if URL is a
     vanguard.com holdings page, prefer the holdings table id/class; else generic scan.
3. **Header locate (fuzzy)**: find the row containing a cell matching
   `ticker|symbol|code` AND a cell matching `weight|% of market value|% weight|% of net` etc.
   Use that row as header; data rows follow.
4. **Normalization**
   - Weight: strip `%`/commas/spaces → number. Ambiguity rule: if header contains
     `%`, value is already percent. Else if column max ≤ 1.5, treat as fraction ×100.
   - `mv`/`shares`: strip `$`/commas → number|null.
   - Name: trim; move leading/trailing "The " (Vanguard quirk `Toronto-Dominion Bank/The`)
     → "The Toronto-Dominion Bank".
   - Skip rows missing ticker; skip blank/garbage rows.
5. **As-of date**: search banner rows for regex
   `as at (Mon) (d) (yyyy)` → `YYYY-MM-DD`. Fallbacks: `XLSX.WorkBook` props,
   then today. Also capture fund name + "Top 10 Holdings" presence → `partial: true`.
6. **Sanity check**: reject if < 1 holding, header not found, or weight sum implausible
   (< 50% and < 3 rows). Return structured errors for 422.

Libs: `xlsx` (SheetJS), `papaparse`, `cheerio`, `zod` (API payload validation),
`postgres` (postgres.js driver).

## API surface

Personal amounts never touch the server — calc is client-side; server holds only etf + snapshots.

| Route | Method | Request → Response |
|---|---|---|
| `/api/etfs` | GET | `?q=` (ticker/name ilike) → `[{id, ticker, name, issuer, snapshot_count, latest_as_of}]` |
| `/api/etfs/import` | POST | `{url}` **or** multipart `file` → parsed preview `{ticker, name, issuer, as_of_date, partial, holdings[], content_hash}` (parse only, nothing saved) |
| `/api/etfs/:id/snapshots` | GET | list: `[{id, as_of_date, source, source_url, created_at, partial, holding_count}]` |
| `/api/etfs/:id/snapshots` | GET | `?as_of=YYYY-MM-DD` → full holdings (omit → latest) |
| `/api/etfs/:id/snapshots` | POST | parsed payload → upsert per §data-model. 201/200-dup/422 |

Errors: `400` bad request, `404` unknown etf, `422` parse/normalize failure with
`{error, details?}`, `429`/`502` on fetch failures (network/timeout).

## Frontend pages

- **`/` Calculator** — dynamic rows of [ETF search-select | latest as-of shown | $ amount];
  result table: ticker, name, **$ exposure = Σ(amount × weight/100)**, % of total,
  sector aggregate row. Pure fn in `src/lib/calc.ts`, unit-tested.
- **`/import`** — tabs [URL | Upload] → preview panel (detected ticker, name, as-of,
  partial warning banner, holdings table w/ count) → **Save snapshot** POST.
- **`/etfs`** — catalog: search box, table (ticker, name, issuer, latest as-of, snapshot count).
- **`/etfs/[id]`** — snapshot history list; click → holdings table (name, weight, sector, region, mv, shares).

UI: Tailwind, minimal clean table styling. No component library.

## Docker / ops

- `Dockerfile`: `node:22-alpine` multi-stage:
  1. `deps`: `npm ci` (package-lock)
  2. `build`: `next build` with `output: 'standalone'`
  3. `runner`: copy `.next/standalone` + static, `CMD ["node","server.js"]`
- `docker-compose.yml`:
  - `db`: `postgres:16-alpine`, `POSTGRES_DB/USER/PASS`, named volume `pgdata`, healthcheck `pg_isready`
  - `web`: build `.`, port `3000:3000`, `DATABASE_URL=postgres://etf:etf@db:5432/etf`,
    `depends_on: db (healthy)`, entrypoint script runs `npm run migrate` then `node server.js`
    (standalone: copy migrate as a small node entrypoint)
- `.env.example`: `DATABASE_URL`
- `.dockerignore`: node_modules, .next, .git, test fixtures (large), .env
- README: run (`docker compose up`), backup (pg_dump), adding new adapters.

## Testing & verification

- **Vitest** (`npm test`):
  - normalize fixtures: real sample XLSX (copied to `test/fixtures/vanguard-zag.top10.xlsx`),
    a CSV variant, a Vanguard-style HTML table
  - weight-format cases: `7.7633%` → 7.7633; `0.077633` (fraction) → 7.7633; `7.76` as-is
  - as-of regex: "As at Aug 31 2026" → `2026-08-31`
  - name normalization: "Toronto-Dominion Bank/The" → "The Toronto-Dominion Bank"
  - calc math: single ETF ($10k × 7.7633% = $776.33); two ETFs overlapping stock sums correctly;
    partial sheet: exposure ≤ amount × (sum of weights/100)
- **E2E** (`scripts/e2e.mjs`, run manually or via `npm run e2e`):
  1. `docker compose up -d` (wait healthy)
  2. start static file server on :9000 serving `test/fixtures/vanguard-zag.top10.xlsx`
  3. `POST /api/etfs/import {url: http://localhost:9000/...}` → assert preview
  4. `GET /api/etfs?q=ZAG` → assert found
  5. `POST /api/etfs/1/snapshots` → 201 created
  6. repeat same → 200 `{duplicate: true}`
  7. calc math via direct function call against returned holdings
  8. `docker compose down -v`
- **CI-equivalent local gate**: `npm run lint && npx tsc --noEmit && npm test` all green before "done".

## Build order (sequenced)

1. Scaffold Next.js + deps + vitest/eslint/ts config, `git init`
2. `src/lib/db.ts` (postgres.js client) + `db/migrations/0001_init.sql` + `src/lib/migrate.ts` + `migrate` script
3. Parse pipeline in `src/lib/parse/` + fixtures + unit tests green
4. API route handlers (5 routes)
5. `src/lib/calc.ts` + 4 pages + minimal styles
6. Dockerfile + compose + .env.example + README; `docker compose up` boots, migrate runs, `/` renders
7. E2E script run to green
8. Update `etf-exposure.md` in Downloads with realized details

## Risks / notes

- Weight fraction-vs-percent ambiguity is handled by the max≤1.5 rule; if an issuer ships a
  sheet where some weights are >1 but stored as fractions (impossible for >100% single holding),
  rule is safe for equity ETFs.
- `partial:true` means calculator must warn the user totals won't sum to 100%.
- Crowd-source ticker uniqueness assumes tickers are globally unique (true for listed ETFs).
- No rate limiting on import in MVP; note in README self-hosters can add reverse-proxy throttling.
- SheetJS from npm may be outdated (moved to CDN); pin exact version and lock.
