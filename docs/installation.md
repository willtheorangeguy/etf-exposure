# Installation

Install from source. There is no published npm package or supported Docker deployment in the current architecture.

## Requirements

- Node.js 22 or newer and npm.
- Git and private repository access.
- Python 3.12 and pip when building documentation.
- Network access for dependency installation and issuer refreshes.

Check the runtimes:

```bash
node --version
python --version
```

## Source installation

<!-- markdownlint-disable MD046 -->
=== "Windows"

    ```powershell
    git clone https://github.com/willtheorangeguy/etf-exposure.git
    Set-Location etf-exposure
    npm ci
    npm run dev
    ```

=== "macOS / Linux"

    ```bash
    git clone https://github.com/willtheorangeguy/etf-exposure.git
    cd etf-exposure
    npm ci
    npm run dev
    ```

<!-- markdownlint-enable MD046 -->

## Verify the installation

```bash
npm test
```

The test command exits zero when all tests pass. The documentation migration baseline has 38 tests.

## Documentation dependencies

Clone the shared system once into the ignored build directory:

```bash
git clone --depth 1 https://github.com/willtheorangeguy/mkdocs .mkdocs-shared
python -m pip install -r .mkdocs-shared/shared/requirements-docs.txt
node scripts/stage-docs.mjs
python -m mkdocs build --strict
```

Run these from the application repository root. The design assets are generated and must not be committed.

## Upgrading

From a clean working tree, update the main branch and reinstall from the lockfile:

```bash
git switch main
git pull --ff-only
npm ci
npm test
```

Update the shared documentation checkout with `git -C .mkdocs-shared pull --ff-only`, then restage its assets.

## Uninstalling

Stop the development or preview process with Ctrl+C. Remove the clone only after preserving changes you need. The former database volume is independent of this clone and is not removed by the static migration.
