# Troubleshooting

Start with the Data updates page and the source report in `public/data/catalog.json`. A workflow can deploy retained data while reporting a failed source.

## No holdings downloads found

The page has no recognized static file/fund links. Use a supported issuer product page or a verified direct CSV/XLSX link. JavaScript-rendered directories are not executed by the downloader.

For Vanguard, verify `www.vanguard.ca`, the product path, and the numeric fund ID. See [Add ETFs](./adding-etfs.md).

## Vanguard fund ticker was not found

The first product-page heading did not begin with the required ticker. Confirm you opened the ETF product page rather than a listing or marketing article. A configured ticker does not bypass this adapter check.

## No holdings date found

The parser did not detect an issuer date. The old snapshot remains available. Inspect the actual source metadata. Do not substitute the refresh date or remove the guard.

## ETF ticker not identified

For a verified single-fund source, set its uppercase ticker in configuration. Do not apply that workaround to a multi-fund directory.

## Holdings weights exceed 100%

The imported sum exceeded the 105% validation tolerance. Check whether a file contains multiple tables or incompatible weights. Do not divide weights to make the total pass. Record evidence and request a parser fix with a fixture.

## Refresh exits zero but the new ETF is absent

The refresh can retain an existing catalog after an individual source fails. Print all source errors:

```bash
node -e "const c=require('./public/data/catalog.json'); console.log(c.sources.flatMap(s=>s.errors.map(e=>({source:s.id,...e}))));"
```

Resolve the recorded source issue and repeat refresh. Do not claim the fund was imported until its snapshot exists.

## Missing application assets after deployment

Check `NEXT_PUBLIC_BASE_PATH`. The build and JSON requests need the Pages prefix. Rebuild with `/etf-exposure` for the current deployment and run artifact checks.

## Documentation fails before building

If the inherited config is missing, clone `.mkdocs-shared` and stage assets using [Installation](./installation.md). If a snippet or nav target is missing, fix the link/file rather than disabling strict mode.

The macros plugin evaluates template delimiters inside code samples. Follow `docs/docs.instructions.md` when documenting literal template syntax.

## Type checking references deleted routes

Old local `.next` generated types can reference removed server routes. Regenerate route types:

```bash
npx next typegen
npm run typecheck
```

If generated cache still references removed files, remove only the project-local generated cache after validating its path. Do not remove user data or the repository.

## App disappears when documentation deploys

Two Pages workflows can replace each other's artifacts. This project uses one combined workflow. Keep the app in the artifact root and documentation under `out/docs`.
