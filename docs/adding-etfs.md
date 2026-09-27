# Add ETFs

Add one issuer source to `config/sources.json`, run a refresh, and verify the generated catalog before adding more funds. You add ETFs here, not the individual stocks inside them. The issuer download supplies those holdings.

## Choose the source type

| Source | Use when | Existing support |
| --- | --- | --- |
| Vanguard Canada product page | Adding a Canadian Vanguard ETF | The adapter reads the page's fund ID and uses Vanguard's published holdings endpoint. |
| Direct CSV/XLSX | The issuer offers a stable downloadable file | The generic parser detects holdings columns and date metadata. |
| BMO dated XLSX | The file name contains fund ticker and an eight-digit date | The adapter searches the newest available file within 14 days. |
| iShares CSV | The download URL specifies `fileName=TICKER_holdings` | The parser handles CSV tables and selects the last repeated holdings table. |
| Issuer directory | Server-rendered HTML contains relevant fund/download anchors | Discovery follows same-origin fund pages up to two levels. |

A PDF, marketing fact sheet, search-results page, or JavaScript-only directory is not a substitute for a verified holdings source. The downloader does not run a browser.

## Inspect the existing implementation

Read these files before editing:

- `config/sources.json`: source entries.
- `src/lib/issuer-sources.ts`: issuer-specific downloads and Vanguard pagination.
- `src/lib/static-refresh.ts`: source schema, discovery, deduplication, and reports.
- `src/lib/parse/index.ts`: date/header detection and partial weights.
- `test/static-refresh.test.ts` and `test/sources.test.ts`: existing acceptance cases.

New funds from a supported issuer normally need configuration changes only. Do not add a database, runtime API, browser upload, new scheduler, or hardcoded security weights.

## Verify a product page

1. Open the actual issuer product page.
2. Record the fund ticker, full name, product URL, and holdings date.
3. Confirm that it offers holdings, not only performance or a top-ten marketing list.
4. Compare its ticker with existing source entries to avoid duplicates.
5. Check whether it holds securities directly or holds other ETFs.

For Vanguard Canada, the adapter requires the host `www.vanguard.ca` and a path matching `/product/etf/<category>/<numeric-fund-id>/...`. The first `h1` must begin with a parenthesized ticker, as the VCN page does. A configured ticker does not bypass that heading requirement.

Never infer the numeric fund ID from a ticker, reuse VCN's ID for another fund, or construct a plausible URL without opening it.

## Append a source entry

This existing VCN entry is the reference shape:

```json title="VCN source object"
{
  "id": "vanguard-vcn",
  "label": "Vanguard Canada — VCN",
  "issuer": "Vanguard",
  "ticker": "VCN",
  "url": "https://www.vanguard.ca/en/product/etf/equity/9561/vanguard-ftse-canada-all-cap-index-etf"
}
```

For a new fund, substitute only values verified on its own issuer page. Append the object to the existing array. Keep all unrelated sources and generated history. Use a stable lowercase ID such as the issuer name followed by the verified ticker.

For iShares Canada, open each product page from BlackRock's Canadian directory and use its **Download Holdings** CSV link. Verify the unit currency on the page before including a CAD fund; the directory also lists USD unit classes. Set both `ticker` and the verified full `name` explicitly. A download filename may omit punctuation: CLU.C uses `fileName=CLUC_holdings`, so its configured ticker must remain `CLU.C`. Gold and silver bullion pages without holdings downloads cannot be imported from their performance or NAV tables.

Set `ticker` explicitly for a single fund. Do not set one fund's ticker on a directory containing several funds. Configuration can override detected metadata, so a wrong configured ticker can label another fund's holdings incorrectly. Cross-check the issuer page and generated name.

If the holdings download omits the fund's full name, set `name` to the name verified on its product page. BMO's ZCN source uses `"name": "BMO S&P/TSX Capped Composite Index ETF"`. This updates the catalog name on refresh even when no holdings have changed. Use this override only for a single fund.

## Refresh and inspect

From the repository root:

```bash
npm run refresh
```

The script refreshes **all** configured sources. It has no per-source command-line filter. Its zero exit status is not proof that every new fund succeeded: individual source failures retain usable previous data.

Print a compact catalog report:

```bash
node -e "const c=require('./public/data/catalog.json'); console.table(c.etfs.map(e=>({ticker:e.ticker,name:e.name,date:e.snapshots[0]?.as_of_date,count:e.snapshots[0]?.holdings_count,partial:e.snapshots[0]?.partial}))); console.log(c.sources.filter(s=>s.errors.length));"
```

For each new fund, verify:

- The configured ticker matches the issuer's ticker.
- The catalog name identifies the intended fund.
- The fund has at least one snapshot with a real issuer date.
- The newest snapshot has positive holdings and a plausible percentage total.
- The refresh report for that source has no errors.
- Partial status is explained, not hidden.
- Holdings correspond to the fund's asset class. Bond identifiers and ETF holdings are not automatically individual stocks.

Open the file referenced by the snapshot's `file` field under `public/data/`. Review a sample of names, tickers, weights, and International Securities Identification Numbers (ISINs). The parser drops zero weights and retains negative cash/short positions. BMO positions without ISINs use the issuer's holding name or a currency-qualified cash identifier. Net totals above 100% and up to 100.5% are corrected proportionally to 100%; larger overruns are rejected. Do not compare the holdings count to an issuer's count without accounting for zero-weight rows.

## Validate the change

Run the repository checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
```

The artifact check validates every catalog snapshot and generated ETF page. It also runs a sample exposure calculation. Repeat build and checks with `NEXT_PUBLIC_BASE_PATH=/etf-exposure` before publishing. See [Configuration](./configuration.md) for platform-specific commands.

Run refresh a second time:

```bash
npm run refresh
```

Unchanged same-date data should report `unchanged` rather than create another snapshot. Catalog status timestamps still change, which is expected.

## Publish and confirm

Commit explicit paths: source configuration, generated data, and any test/docs changes you intended. Never hand-edit generated holdings or hashes to pass validation. Keep unrelated edits out of the change.

Open a pull request. After review and merge, the combined Pages workflow refreshes data, rebuilds the app and docs, and deploys. Confirm:

- The ticker appears in the deployed catalog.
- Its detail page shows the intended fund and holdings date.
- A small position produces finite exposure values.
- Data updates shows the source's success or an actionable error.

## Stop conditions

Do not weaken date, weight, network, or schema validation to import a fund. Stop and report evidence when a verified fund cannot be parsed, requires authentication, returns no holdings, or exceeds discovery/pagination limits.

For funds that hold other ETFs, the current calculator uses their reported holdings. It does not recursively resolve ETF constituents. Do not claim per-stock look-through for such a fund unless the issuer source already provides that table. Review this distinction before adding a fund.
