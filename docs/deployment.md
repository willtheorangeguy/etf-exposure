# Deployment

One workflow publishes the calculator at the Pages root and documentation under `/docs/`. Do not add another Pages deployment workflow.

## Published paths

- [Calculator](https://williamvdg.me/etf-exposure/)
- [Documentation](https://williamvdg.me/etf-exposure/docs/)
- [Holdings catalog](https://williamvdg.me/etf-exposure/data/catalog.json)

Here `/docs/` means the application-relative path `/etf-exposure/docs/`, not the account domain's root `/docs/`.

## Workflow triggers

`.github/workflows/docs.yml` runs for main pushes, main-targeted pull requests, manual dispatch, and a monthly schedule. The cron expression is `17 4 1 * *`: the first day of the month at 04:17 UTC. Scheduled Actions runs can be delayed.

Main/manual/scheduled runs refresh issuer data, validate and export the app, strictly build MkDocs into `out/docs`, check the combined artifact, save validated data history, and deploy. Pull requests build/test both sites without live refresh, data commits, or deployment.

`docs-lint.yml` calls the shared Markdown and strict-build checks on pull requests. External link checking is disabled because private repository links require authentication.

## Permissions and setup

Pages must use **GitHub Actions** as its publishing source. The build job needs contents write for data commits and Pages read for configuration. The deployment needs Pages write and ID-token write in the `github-pages` environment.

Repository branch protection must permit intended bot data commits, or a maintainer must adapt that step to pull requests. Hosting and Actions allowances depend on the GitHub plan.

## Manual refresh

```bash
gh workflow run docs.yml --ref main
gh run list --workflow docs.yml --limit 3
```

Open the resulting run, inspect source reports, and confirm both sites after deployment. A source error retains old data and appears in the app's Data updates page and Actions summary.

## Local combined preview

Build the app with its deployment prefix, then add documentation:

<!-- markdownlint-disable MD046 -->
=== "Windows"

    ```powershell
    $env:NEXT_PUBLIC_BASE_PATH = "/etf-exposure"
    npm run build
    npm run e2e
    node scripts/stage-docs.mjs
    python -m mkdocs build --strict --site-dir out/docs
    node scripts/verify-docs.mjs
    npm start
    ```

=== "macOS / Linux"

    ```bash
    NEXT_PUBLIC_BASE_PATH=/etf-exposure npm run build
    NEXT_PUBLIC_BASE_PATH=/etf-exposure npm run e2e
    node scripts/stage-docs.mjs
    python -m mkdocs build --strict --site-dir out/docs
    node scripts/verify-docs.mjs
    NEXT_PUBLIC_BASE_PATH=/etf-exposure npm start
    ```

<!-- markdownlint-enable MD046 -->

Open [the app preview](http://localhost:4173/etf-exposure/) and [docs preview](http://localhost:4173/etf-exposure/docs/).

## Shared documentation system

The project inherits `willtheorangeguy/mkdocs` configuration and dependencies. `scripts/stage-docs.mjs` stages its generated design assets. The project adapts the shared deployment procedure because this app requires a Node build and issuer refresh before artifact assembly. It retains one deployment, not two competing reusable deploy jobs.

## Data retention

Failed downloads do not erase successful snapshots. Removing a source configuration does not remove its ETF or history. Same-date corrections replace that date's content.

Existing volumes from the former database architecture are untouched. Do not delete an old volume without checking whether it holds history not yet exported to JSON.
