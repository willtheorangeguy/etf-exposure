# ETF Exposure

ETF Exposure turns issuer holdings into dollar exposure for each reported security in your ETF portfolio. Developers maintain the source catalog in Git and publish a static calculator and documentation site. Portfolio amounts stay in the browser.

## Key features

- Calculate exposure across multiple ETFs.
- Search and filter reported holdings.
- Download issuer holdings monthly.
- Keep historical snapshots and show partial-data warnings.
- Publish without a runtime database or application server.

## Quick start

```bash
npm ci
npm run dev
```

Open [the local calculator](http://localhost:3000/). Committed holdings are available without a refresh. See [Getting started](./getting-started.md) for prerequisites and the first calculation.

## Where to next

<div class="grid cards" markdown>

- **Maintain the catalog**

    [Add ETFs](./adding-etfs.md) with verified issuer links and acceptance checks.

- **Configure data sources**

    [Configuration](./configuration.md) explains how issuer sources are configured.

- **Modify the app**

    [Architecture](./architecture.md) explains the browser, data files, and refresh pipeline.

- **Publish and debug**

    [Deployment](./deployment.md) covers the combined Pages artifact and monthly refresh.

</div>

## Support

File an [issue](https://github.com/willtheorangeguy/etf-exposure/issues/new/choose). Repository access is required.
