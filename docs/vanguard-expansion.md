# Expand Vanguard coverage

Use this handoff to add the remaining **Vanguard Canada ETFs**. Do not treat “Vanguard stocks” as a request to manually enter every underlying company or to import the unrelated US Vanguard catalog.

## Scope and prerequisites

The baseline contains VCN. BMO ZCN and iShares XEQT must stay intact. Catalog expansion is a configuration-and-data task unless a verified product reveals an adapter defect.

Read [Add ETFs](./adding-etfs.md), then inspect the source files it lists. Use the live [VCN product page](https://www.vanguard.ca/en/product/etf/equity/9561/vanguard-ftse-canada-all-cap-index-etf) as the working adapter reference.

The expected complete fund list is not frozen in this guide. Discover and verify the current Canadian issuer list when doing the task. Record its URL, access date, and all tickers so “all funds” is measurable.

## Build an evidence inventory

Create `docs/internal/vanguard-coverage.md` during the expansion task. It is excluded from the public docs site but remains reviewable in Git.

Use these columns:

| Field | What to record |
| --- | --- |
| Ticker | Exact Canadian ETF/share-class ticker from the issuer page |
| Fund name | Full name, not a guessed expansion of the ticker |
| Product URL | Opened, verified `www.vanguard.ca` product URL |
| Numeric fund ID | ID read from that URL |
| Asset class | Equity, fixed income, or allocation as reported by the issuer |
| Holdings structure | Direct securities, other ETFs, or verified look-through table |
| Status | Imported, already present, blocked, or excluded with reason |
| Latest holdings date | Date in the generated snapshot, not the refresh date |
| Positive holdings count | Count actually stored by the parser |
| Weight total / partial | Sum of stored percentages and partial flag |
| Evidence / blocker | Observed error or reason for any missing fund |

Do not fill a row with a fabricated URL, fund ID, date, or holding count.

## Work in bounded batches

1. Verify the issuer's current Canadian ETF listing. Enumerate product links rather than trusting a search snippet or an old ticker list.
2. Inspect one unconfigured direct-holdings equity ETF. Append its source with an explicit ticker.
3. Run refresh and the acceptance checks in [Add ETFs](./adding-etfs.md).
4. Confirm that the source, name, date, holdings, and generated detail page agree.
5. Add a small batch, such as three to five verified funds. Refresh again and update the evidence inventory.
6. Repeat until every discovered Canadian ETF has a recorded outcome.
7. Re-run the full checks and report totals: imported, already present, blocked, and excluded.

A broad directory is optional. Prefer explicit product links for a finite catalog: they make failures and coverage visible per fund. The existing discovery crawler follows static anchors, not JavaScript-rendered tables. Never attach one fixed ticker to a multi-fund directory.

## Allocation and bond funds

Allocation funds may report other ETFs instead of stocks. The current Vanguard adapter downloads those reported rows. The exposure calculator does not expand a holding that happens to be another ETF.

If an allocation fund needs recursive look-through, record it as blocked for that requirement and ask for direction. Do not silently present fund-level exposure as company-level exposure or change the calculation architecture during this catalog task.

Bond funds can contain identifiers instead of exchange tickers. The schema permits holding identifiers and ISINs. Confirm the output contains the issuer's bond names and weights. Do not label bonds as stocks or guess equity tickers.

## Adapter contract

The existing Vanguard adapter:

- Reads the numeric product ID from the opened product URL.
- Extracts the ETF ticker from the page's first `h1`.
- Calls `https://www.vanguard.ca/gpx/graphql` with that product ID.
- Requests up to 1500 holdings per page.
- Follows `lastItemKey` for at most 20 pages.
- Rejects empty holdings, mixed dates, API errors, and oversized responses.
- Converts reported rows into the existing parser format.

The published `x-consumer-id: ca0` header is not a personal credential. Do not scrape private tokens or add secrets to the repository.

If a product fails this contract, preserve the last good data and record the response/error. A code fix requires a reproducing fixture or mocked adapter test and explicit review. Never remove a guard to make the batch pass.

## Copyable agent task

Paste this into the model that performs the expansion:

```text title="Vanguard Canada catalog expansion task"
Add the remaining Vanguard Canada ETFs to this repository's holdings catalog.
Read AGENTS.md, docs/adding-etfs.md, docs/vanguard-expansion.md,
config/sources.json, src/lib/issuer-sources.ts, src/lib/static-refresh.ts,
src/lib/parse/index.ts, test/sources.test.ts, and test/static-refresh.test.ts.

Do not add individual stocks by hand or import the US Vanguard catalog.
Discover the current Canadian ETF listing from the issuer. Open every product
URL before adding it. Record the listing URL, access date, and per-fund evidence
in docs/internal/vanguard-coverage.md using the guide's inventory columns.

Preserve VCN, ZCN, XEQT, all unrelated sources, and existing dated snapshots.
Add stable source entries with explicit fund tickers and verified product URLs.
Start with one direct-holdings equity fund, validate it, then work in batches
of three to five. Do not guess URLs, numeric product IDs, names, or weights.

Run npm run refresh and inspect source errors, not only its exit status.
Check each fund's ticker, full name, real holdings date, positive holdings,
weight total, partial flag, source URL, and generated detail page.
Run refresh again to verify same-date deduplication.
Run npm run lint, npm run typecheck, npm test, npm run build, and npm run e2e.
Repeat the export checks with NEXT_PUBLIC_BASE_PATH=/etf-exposure.

The calculator does not recursively expand ETF holdings. Flag allocation
funds needing that behavior as blocked and request direction. Verify bond
funds as bond exposure, not stocks. Do not disable validation, normalize
partial weights to 100%, add private-network exceptions, hand-edit generated
holdings/hashes, or replace the static architecture.

If a source fails, preserve good data and record evidence. Do not claim
complete coverage until every fund in the discovered issuer list has an
imported, already-present, blocked, or excluded outcome.
Stage explicit intended files only. Open a reviewable pull request.
Report each new ticker's date, holding count, weight total, partial status,
test results, and all remaining blockers.
```

## Completion checklist

- [ ] The issuer list and observation date are recorded.
- [ ] Every listed Canadian ETF has an inventory row.
- [ ] Each new source points to its verified product page.
- [ ] Existing sources and snapshot history remain present.
- [ ] No new source error is hidden behind an overall successful refresh.
- [ ] Each imported fund has valid data and a generated catalog detail page.
- [ ] Allocation/bond limitations are stated accurately.
- [ ] A second refresh confirms deduplication.
- [ ] Tests, lint, types, and both export prefixes pass.
- [ ] The handoff reports imported and blocked funds separately.
