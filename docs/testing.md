# Testing

Unit tests check parsing, validation, exposure grouping, network checks, source discovery, and static refresh behavior. Artifact checks validate the generated files.

## Unit suite

```bash
npm test
```

The documentation migration baseline has 38 tests across six files. Tests inject downloads and storage where possible rather than requiring issuer access.

| File | Coverage |
| --- | --- |
| `test/calc.test.ts` | Dollar exposure, partial data, and security matching |
| `test/parse.test.ts` | Supported file parsing and metadata |
| `test/normalize.test.ts` | Column/identifier normalization |
| `test/import-validation.test.ts` | Holdings schema and dates |
| `test/sources.test.ts` | Discovery, public addresses, ISINs, and multi-table files |
| `test/static-refresh.test.ts` | Deduplication, failed-source retention, date history, corrections, and discovery |

## Application artifact checks

```bash
npm run build
npm run e2e
```

The `e2e` command verifies static files, snapshots, detail pages, URL prefix, and sample exposure calculations. It is not an automated interactive browser test.

Use the production base path when checking a deployment. See [Configuration](./configuration.md).

## Documentation checks

```bash
node scripts/stage-docs.mjs
python -m mkdocs build --strict --site-dir out/docs
node scripts/verify-docs.mjs
```

Strict mode must pass without warnings. The combined artifact check verifies the app survives, the ETF guides exist, search indexes the Vanguard guide, and the shared stylesheet is present.

## Live issuer checks

```bash
npm run refresh
```

This command changes generated data and refresh status. Inspect every source's errors. A retained catalog can allow the command to succeed despite an issuer failure.

[Add ETFs](./adding-etfs.md) defines per-fund acceptance checks. Unit tests do not establish current complete issuer coverage.
