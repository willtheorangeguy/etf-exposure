# Development

Use committed JSON for repeatable application work. Refresh issuer data only when you intend to change catalog data.

## Development loop

```bash
npm ci
npm run dev
```

Next.js serves the app at [localhost:3000](http://localhost:3000/). Read the guides in `node_modules/next/dist/docs/` before changing Next.js code, as required by `AGENTS.md`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
```

A static build requires the committed `public/data/catalog.json`. It generates one ETF detail page for every catalog ID. No database migration runs.

## Documentation loop

After installing [documentation dependencies](./installation.md):

```bash
node scripts/stage-docs.mjs
python -m mkdocs serve
```

Use [the docs preview](http://localhost:8000/). The app's development server does not serve MkDocs pages.

Before committing:

```bash
python -m mkdocs build --strict --site-dir out/docs
node scripts/verify-docs.mjs
```

Build the app first so artifact verification can check both the root and docs. A later `npm run build` may replace the output directory. Rebuild docs afterward.

## Change boundaries

For [catalog additions](./adding-etfs.md), prefer configuration changes. Parser or adapter fixes need a reproducing test. Do not modify holdings JSON by hand.

For documentation, follow `docs/docs.instructions.md`. Keep shared generated assets ignored. Do not replace inherited plugin or extension lists. Use explicit Git staging paths and preserve unrelated user changes.

The org-wide [Contributing Guide](https://github.com/willtheorangeguy/.github/blob/main/CONTRIBUTING.md) covers contributions.
