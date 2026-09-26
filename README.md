# ETF Holding-Exposure Tracker

Self-hosted, crowd-sourced database of ETF holdings. Convert "I put $X into these ETFs"
into equivalent $ exposure in each underlying stock.

- Any user can add/update an ETF by pasting the issuer's holding-sheet **URL** (server fetches + parses)
  or **uploading** the sheet (CSV / XLSX).
- Every import becomes a **dated snapshot**; history accumulates in the shared Postgres DB.
- Calculator: `exposure(stock) = Σ over ETFs of (amount × weight%)` — $ and % per underlying stock.
- Personal amounts never leave the browser. No auth in MVP.

## Run (Docker)

```bash
docker compose up -d --build
# → migrate runs, web on http://localhost:3000
```

Stop + wipe data: `docker compose down -v`

## Run (local dev)

```bash
npm install
# postgres must be reachable; e.g. `docker compose up -d db`
export DATABASE_URL=postgres://etf:etf@localhost:5432/etf   # see .env.example
npm run migrate
npm run dev
```

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | `next build` (standalone output) |
| `npm run lint` | eslint |
| `npx tsc --noEmit` | typecheck |
| `npm test` | vitest unit tests |
| `npm run migrate` | apply `db/migrations/*.sql` |
| `npm run e2e` | end-to-end against a running web server (see below) |

### E2E

```bash
docker compose up -d --build     # terminal A: wait until http://localhost:3000 responds
npm run e2e                      # terminal B
```

The e2e script serves `test/fixtures/vanguard-zag.top10.xlsx` on `:9000`, imports it via URL,
saves a snapshot, verifies dedup (200 `{duplicate:true}` on re-POST), fetches full holdings,
and checks the exposure math. Env overrides: `WEB`, `FIXTURE_URL`.

### CI-equivalent local gate

```bash
npm run lint && npx tsc --noEmit && npm test
```

## Backup

```bash
docker compose exec db pg_dump -U etf etf > backup-$(date +%F).sql
# restore:
gunzip -c backup.sql | docker compose exec -T db psql -U etf etf
```

## Adding a new issuer adapter

1. Drop a sample sheet/URL in a note (don't commit real customer data).
2. If it's a new content type or layout, add extraction under `src/lib/parse/` and register
   it in `src/lib/parse/index.ts` (routing by URL pattern or MIME).
3. Add a fixture in `test/fixtures/` and a case in `test/parse.test.ts`.
4. Run the gate: lint + typecheck + test.

## Notes for self-hosters

- No rate limiting in MVP. Put a reverse proxy (Caddy/Traefik/nginx) in front if exposed publicly,
  and add throttling on `/api/etfs/import`.
- `xlsx` (SheetJS) is pinned to the npm-published `0.18.5`; newer builds live on the CDN.
  Upgrade deliberately and re-run tests.
- Ticker uniqueness is assumed (true for listed ETFs).
- `partial:true` snapshots (e.g. top-10 sheets) make totals not sum to 100% — UI warns.

## Using the calculator

The catalog can now be populated and maintained from issuer links at `/sources`.
End users search those ETFs; they do not need to upload sheets or supply ticker metadata.

## Automatic issuer sources

Open `/sources`, enter an issuer listing/product page or direct CSV/XLSX URL,
and choose a refresh interval (default: 30 days). The Docker `worker` service
checks the database every minute and runs due imports, including after restarts.
It discovers linked downloads and same-origin fund pages (up to two levels,
100 pages and 1,000 URLs per run). Tickers come from issuer metadata or
recognizable download filenames. For an ambiguous single-fund source, set its
ticker once. Re-submit a URL to update its settings. Pause/resume and Refresh now
are available; last attempt, next due date, and per-file failures are visible.

Supported issuer adapters:

- Vanguard Canada ETF product pages use the same public holdings API as their
  workbook Download button, including pagination and stock ISINs.
- BMO `Holdings_Extract_..._TICKER_YYYYMMDD.xlsx` links automatically try the
  newest date over the preceding 14 days. Holdings retain ISINs when the sheet
  lacks stock tickers; published ISIN/ticker aliases in the catalog fill these in.
- iShares CSV URLs identify the ETF from `fileName`. When the CSV includes both
  parent ETFs and a look-through table, only the last stock-level table is used.

New snapshots retain their issuer dates. Undated or invalid files are rejected,
unchanged files are deduplicated, and failed refreshes retain the last good data
and retry after one day. Incomplete or rounded weight totals remain flagged.
Sources are not an exhaustive worldwide ETF feed: add the issuer directories or
fund links you want covered. JavaScript-only listing pages without a supported
adapter need issuer-specific integration; refresh issues explain what failed.

Run everything: `docker compose up -d --build`.
Local development additionally needs `npm run worker` in a separate terminal
with the same `DATABASE_URL`, after `npm run migrate`.
Register the three supplied issuer examples: `node scripts/seed-sources.mjs`.
Verify live issuer parsing: `npx tsx scripts/verify-issuers.ts`.
Public URLs are required by default; `TRUSTED_SOURCE_HOSTS` is an optional,
explicit comma-separated hostname allowlist for private mirrors/test fixtures.
Source registration follows the MVP's existing no-auth shared database model.

## Manual uploads

1. Open `/import`, choose the issuer's CSV/XLSX file, and preview it.
2. Enter the ETF's actual ticker, confirm its name and holdings date, then save.
   The download date can differ from the holdings date. A file name alone does not establish its ticker.
3. Open `/`, search for the saved ETF, select it, and enter your investment amount.
4. Select CAD or USD, enter every position in that currency, and calculate.
   Every underlying holding is displayed; filter by stock ticker or name to find one.
   Overlapping stocks are summed across ETFs, with contributions shown in the results.

Currency selection labels the entered amounts; it does not convert currencies or fetch exchange rates.
Personal amounts are used only in the browser and are cleared when you reload.
Partial sheets use their reported weights without scaling them up to 100%.

To verify the supplied full-size Vanguard workbook against a running app:
`npx tsx scripts/verify-upload.mjs`. Override `HOLDINGS_FILE`, `ETF_TICKER`, or `WEB`
for a different file or server. This imports VCN into the local database.
The URL E2E test uses ticker `E2E` so it cannot overwrite a real ETF's snapshot.
