# Configuration

Edit source entries in `config/sources.json`. Environment variables control the export prefix and local preview separately.

## Precedence

For a fund's ticker, the refresh uses the queued/configured ticker first, then explicit metadata from the first six rows, then a supported URL pattern. Discovered file links can provide their own ticker. There is no generic CLI-over-environment-over-file precedence: these settings configure different parts of the app.

The environment variable names below are literal. There is no automatic prefixing or mapping from JSON fields.

For a fund's name, a configured `name` takes precedence over source metadata. BMO holdings workbooks omit the fund name, so their entries supply names verified on BMO product pages. A successful refresh updates catalog names even when the holdings are unchanged.

## Source configuration

The file contains a nonempty JSON array. IDs must be unique.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string | Required | Stable lowercase identifier matching `^[a-z0-9-]+$`. Example: `vanguard-vcn`. |
| `label` | string | Required | Nonempty status-page label. Example: `Vanguard Canada — VCN`. |
| `url` | string | Required | Public HTTP/HTTPS product page, directory, or CSV/XLSX link. Example appears below. |
| `issuer` | string | Omitted | Optional issuer name. Example: `Vanguard`. |
| `ticker` | string | Omitted | Fund ticker matching `^[A-Z][A-Z0-9.\\-]{0,19}$`. Example: `VCN`. Omit on multi-fund directories. |
| `name` | string | Detected from source metadata | Optional verified full name for a single fund, from 1 to 500 characters. Example: `BMO S&P/TSX Capped Composite Index ETF`. Omit on multi-fund directories. |

Invalid configuration fails schema validation before refresh. A failed individual download is recorded and retains prior data.

## Environment variables

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | string | Empty | App export and JSON URL prefix. Example: `/etf-exposure`. Set the same value for build, artifact checks, and preview. |
| `PORT` | numeric string | `4173` | Static preview port. Example: `4174`. |
| `TRUSTED_SOURCE_HOSTS` | comma-separated string | Empty | Explicit network-validation bypass for named test/mirror hosts. Example: `localhost`. Keep unset in production. |
| `GITHUB_STEP_SUMMARY` | file path | Unset | Actions-provided summary output. Example: `/tmp/refresh-summary.md`. Normally set by GitHub, not manually. |

The app does not validate arbitrary base paths. Use an empty value or a leading-slash path without a trailing slash. An invalid port prevents the preview server from starting.

## Examples

This is the existing VCN source with an explicit ticker:

```json title="config/sources.json"
[
  {
    "id": "vanguard-vcn",
    "label": "Vanguard Canada — VCN",
    "issuer": "Vanguard",
    "ticker": "VCN",
    "url": "https://www.vanguard.ca/en/product/etf/equity/9561/vanguard-ftse-canada-all-cap-index-etf"
  }
]
```

Do not replace the existing array with this example when adding a fund. Preserve the BMO and iShares entries.

<!-- markdownlint-disable MD046 -->
=== "Windows"

    ```powershell
    $env:NEXT_PUBLIC_BASE_PATH = "/etf-exposure"
    npm run build
    npm run e2e
    npm start
    ```

=== "macOS / Linux"

    ```bash
    NEXT_PUBLIC_BASE_PATH=/etf-exposure npm run build
    NEXT_PUBLIC_BASE_PATH=/etf-exposure npm run e2e
    NEXT_PUBLIC_BASE_PATH=/etf-exposure npm start
    ```

<!-- markdownlint-enable MD046 -->

## Documentation configuration

`mkdocs.yml` inherits the shared theme, extensions, plugins, and validation. Do not redeclare `plugins` or `markdown_extensions`: lists replace the inherited values.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `INHERIT` | path | Project setting | `.mkdocs-shared/shared/mkdocs.base.yml`. |
| `site_url` | URL | Project setting | `https://williamvdg.me/etf-exposure/docs/`. Canonical docs prefix. |
| `edit_uri` | path | Project setting | `edit/main/docs/`. Repository edit links. |
| `exclude_docs` | multiline paths | Project setting | Excludes `internal/`, the writing standard, and compatibility index pages. |

The monthly schedule lives in the deployment workflow, not in the source array. See [Deployment](./deployment.md).
