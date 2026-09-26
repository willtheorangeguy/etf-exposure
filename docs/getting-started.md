# Getting started

Run the app using committed holdings, then calculate your first exposure.

## Prerequisites

Use Node.js 22 or newer, npm, Git, and access to the private repository.

```bash
node --version
npm --version
git --version
```

The deployed workflow uses Node.js 22. Python is needed only to build documentation, not to run the calculator.

## Install

```bash
git clone https://github.com/willtheorangeguy/etf-exposure.git
cd etf-exposure
npm ci
```

See [Installation](./installation.md) for documentation dependencies and upgrades.

## First run

1. Start development mode:

    ```bash
    npm run dev
    ```

    The terminal reports a local address, normally [localhost:3000](http://localhost:3000/).

2. Open the calculator. Search for `VCN` and select the matching ETF.

3. Enter `1000` and calculate exposure. The results show every reported holding and its dollar contribution.

## What happened

The browser reads the catalog and latest snapshot from static JSON. For each security, it multiplies your amount by the reported percentage divided by 100. No portfolio amount is sent to a database.

## Next steps

- [Usage](./usage.md) explains partial data and currency handling.
- [Add ETFs](./adding-etfs.md) extends the searchable catalog.
- [Development](./development.md) covers builds and tests.
