# ETF Exposure

Static ETF look-through calculator hosted on GitHub Pages. GitHub Actions downloads issuer holdings monthly; no PostgreSQL, application server, or paid worker is needed. Investment amounts remain in the browser and default to CAD. All amounts must use the same currency; no currency conversion is performed.

## Local development

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Committed holdings allow development and builds without issuer network access. To update them, run `npm run refresh`.

Production preview:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
npm start
```

The static preview listens at http://localhost:4173. For a project subdirectory, set `NEXT_PUBLIC_BASE_PATH=/etf-exposure` for both build, e2e, and preview. Next.js links and JSON fetches honor that prefix.

## Publishing and refresh

Enable GitHub Pages with **GitHub Actions** as the source. The workflow in `.github/workflows/pages.yml` runs on main pushes, manually from Actions, and monthly on the first day at 04:17 UTC (scheduled runs can be delayed). It refreshes issuer data, tests and exports the site, commits validated JSON history, and deploys the static artifact. Pull requests build and test without refreshing, committing, or deploying.

The workflow requires repository contents write permission for its data commit, plus Pages write and ID-token write for deployment. If branch protection blocks bot pushes, permit these data commits or adapt the workflow to submit a pull request. GitHub Pages and Actions eligibility/allowances depend on your account and repository plan; a private repository does not automatically make the published site private.

The current configured site is https://williamvdg.me/etf-exposure/. The workflow obtains its base path from Pages configuration.

## Add issuer sources

Edit `config/sources.json` and push or manually run the workflow:

```json
{
  "id": "issuer-fund",
  "label": "Issuer — ETF",
  "issuer": "Issuer",
  "ticker": "ETF",
  "url": "https://issuer.example/holdings.csv"
}
```

Use a unique stable id. Ticker is optional when reliably identified from issuer metadata or the download URL. Supported sources include Vanguard Canada product pages, BMO dated holdings XLSX downloads, iShares holdings CSV downloads, and pages linking to CSV/XLSX files. Same-origin fund-page discovery is bounded to two levels; it is not a universal all-issuer crawler. Broader directories can discover new funds automatically, but the three initial sources seed only VCN, ZCN, and XEQT. Add more issuer/fund links to expand coverage.

BMO's dated filename is resolved to the newest available file in a 14-day window. Vanguard uses its published holdings endpoint. iShares multi-table files use the underlying/look-through holdings table. No PDF parsing is provided; the supplied BMO URL is XLSX.

## Data and failure handling

`public/data/catalog.json` lists ETFs, snapshot summaries, and refresh status. Dated holdings live in `public/data/etfs/TICKER/YYYY-MM-DD.json`. Data is committed to the repository and included in the public site. No portfolio amounts are committed or uploaded.

Downloads are bounded in size and time and reject private-network destinations. Imports require a real holdings date, positive validated weights, and a plausible total. Identical snapshots are deduplicated; same-date issuer corrections replace that date's file. Older dates remain selectable. ISINs unify matching stocks across issuers where possible.

A failed issuer download retains its last good snapshots, appears on the Data updates page and Actions summary, and does not prevent publication of other good data. If there is no usable catalog at all, refresh fails and no empty site is deployed. Partial holdings are labeled and never scaled to 100%, so reported exposure may be less than the invested amount. Snapshot dates, not the workflow date, indicate holdings freshness.

The former shared upload/API/database architecture has been removed. Existing local database volumes are not deleted by this migration. Historical data not already present in the JSON catalog must be explicitly exported before retiring an old database.
