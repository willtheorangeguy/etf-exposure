<!-- Logo -->
<h1 align="center">ETF Exposure</h1>

<!-- Tagline -->
<h4 align="center">Issuer ETF holdings converted into per-stock dollar exposure for your portfolio.</h4>

<!-- Badges -->
<p align="center">
  <img alt="GitHub Issues" src="https://img.shields.io/github/issues/willtheorangeguy/etf-exposure">
  <img alt="GitHub Pull Requests" src="https://img.shields.io/github/issues-pr/willtheorangeguy/etf-exposure">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="App and docs deployment" src="https://github.com/willtheorangeguy/etf-exposure/actions/workflows/docs.yml/badge.svg">
  <img alt="Documentation checks" src="https://github.com/willtheorangeguy/etf-exposure/actions/workflows/docs-lint.yml/badge.svg">
  <a href="https://williamvdg.me/etf-exposure/docs/"><img alt="Documentation" src="https://img.shields.io/badge/docs-online-c33207"></a>
</p>

<!-- Nav -->
<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#support">Support</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

[Open the calculator](https://williamvdg.me/etf-exposure/). Enter your ETF amounts to see each reported holding's dollar exposure and contributions across funds. GitHub Pages serves the app. GitHub Actions refreshes issuer holdings monthly without an application server or database.

## Key Features

- Search a preloaded ETF catalog, initially VCN, ZCN, and XEQT.
- View every reported holding, filter results, and inspect contributions by ETF.
- Download holdings from Vanguard Canada, BMO, iShares, or supported CSV/XLSX links.
- Retain dated snapshots and last good data when an issuer download fails.
- Keep personal investment amounts in the browser, with CAD as the default.
- Publish the calculator and searchable documentation in one Pages deployment.

## Installation

Install Node.js 22 or newer, then run:

```bash
git clone https://github.com/willtheorangeguy/etf-exposure.git
cd etf-exposure
npm ci
npm run dev
```

The repository is private, so cloning requires access. Open [the local app](http://localhost:3000/).

## Usage

Search for `VCN`, select it, enter `1000` CAD, and calculate exposure. A holding at 5% contributes CAD 50. Use the same currency for every ETF amount; the app does not convert currencies.

For catalog expansion, follow [Add ETFs](docs/adding-etfs.md). Give another model the [Vanguard expansion handoff](docs/vanguard-expansion.md), which defines scope, source discovery, acceptance checks, and stop conditions.

## Documentation

Full documentation lives in [`docs/`](docs/README.md):
[Installation](docs/installation.md) · [Usage](docs/usage.md) · [Configuration](docs/configuration.md) · [Troubleshooting](docs/troubleshooting.md)

Read the [published MkDocs site](https://williamvdg.me/etf-exposure/docs/) for searchable guides.

## Support

File an [issue](https://github.com/willtheorangeguy/etf-exposure/issues/new/choose). Repository access is required.

## Contributing

Contributions welcome. See the org-wide [Contributing Guide](https://github.com/willtheorangeguy/.github/blob/main/CONTRIBUTING.md) and [Code of Conduct](https://github.com/willtheorangeguy/.github/blob/main/CODE_OF_CONDUCT.md).

## License

MIT — see [`LICENSE.md`](LICENSE.md). Issuer holdings remain third-party data; this software license does not grant rights to issuer content.
