# Interfaces

The public interface consists of static JSON files and the browser calculator. There is no deployed mutable HTTP API.

## Catalog file

Request `GET /etf-exposure/data/catalog.json`. It takes no parameters or request body. A successful file request returns HTTP 200. Missing files return the hosting provider's 404 response.

```bash
curl --fail https://williamvdg.me/etf-exposure/data/catalog.json
```

The response contains `version`, `generated_at`, `etfs`, and `sources`. This command prints the initial fund identifiers:

```bash
node -e "const c=require('./public/data/catalog.json'); console.log(c.version,c.etfs.map(e=>e.ticker).join(', '));"
```

```text
1 VCN, XEQT, ZCN
```

Each ETF has an ID, ticker, name, issuer, and dated snapshot summaries. Each summary includes `file`, `as_of_date`, `holdings_count`, `partial`, and `content_hash`.

Source reports include last check/success timestamps, saved/unchanged counts, and errors. Consumers must not interpret `generated_at` as the holdings date.

## Snapshot file

Request the `file` path from a catalog summary under `data/`. It takes no request body or query parameters.

```bash
curl --fail https://williamvdg.me/etf-exposure/data/etfs/VCN/2026-08-31.json
```

HTTP 200 contains snapshot metadata plus a `holdings` array. Missing dates return HTTP 404. Each holding includes `t` (ticker/identifier), `n` (name), and `weight` (percentage), with optional `isin`, `sector`, `region`, `mv`, and `shares`.

Inspect the actual stored response without assuming a particular security order:

```bash
node -e "const s=require('./public/data/etfs/VCN/2026-08-31.json'); console.log(s.as_of_date,s.holdings.length,s.holdings.reduce((n,h)=>n+h.weight,0));"
```

The initial snapshot reports the date `2026-08-31` and 213 positive holdings. Values can change on later refreshes or corrections.

## External issuer calls

Vanguard's adapter performs a GraphQL POST to its published holdings endpoint. The variables are numeric product IDs read from verified product URLs and a pagination cursor. API errors, empty data, mixed dates, or HTTP failures become source errors.

BMO and iShares adapters perform HTTP GET requests. The former resolves the latest available dated XLSX. The latter reads CSV from the configured issuer URL.

Use the existing issuer verification command to exercise the adapters rather than hand-copying their payloads:

```bash
npx tsx scripts/verify-issuers.ts
```

Its output reports source URLs, holdings dates, counts, and total weights for the three baseline issuer examples, then checks security matching. It requires live network access. Source failures do not authorize changing credentials or weakening network validation.
