# Usage

Enter the value of your ETF positions, not the number of ETF shares.

## Calculate exposure

1. Open [the calculator](https://williamvdg.me/etf-exposure/).
2. Search the catalog for `VCN`.
3. Select the ETF and enter an amount such as `1000`.
4. Add other ETFs and calculate.
5. Filter the holdings table to locate a security and inspect its ETF contributions.

A 5% holding in a CAD 1000 position contributes CAD 50. Contributions to matching securities are summed across ETFs. International Securities Identification Numbers (ISINs) help match holdings across issuers.

## Currency

CAD is the default display currency. Enter all amounts in the same currency. Selecting USD changes formatting, not exchange rates or issuer weights.

## Holdings dates and partial data

The calculator uses each selected ETF's latest available holdings date. Open its catalog page to view dated snapshots.

A partial snapshot is not scaled to 100%. Reported exposure can be less than your invested amount. The initial XEQT snapshot is marked partial because its positive reported weights total less than 98%.

Small net weight totals above 100%, up to 100.5%, are adjusted proportionally to 100% during import. Larger overruns are rejected. Negative cash and derivative positions are retained; individual positive holdings can exceed 100% when offset by those negative positions.

## Portfolio privacy

Personal amounts remain in the browser. The site publishes issuer holdings, not your portfolio. Refreshing or closing the page can discard calculator input.

## Missing ETFs

Visitors cannot add shared holdings through an upload form. Maintainers add verified sources using [Add ETFs](./adding-etfs.md). The catalog initially contains VCN, ZCN, and XEQT, not every Canadian ETF.
