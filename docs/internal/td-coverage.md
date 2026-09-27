# TD ETF coverage

All 58 TD ETF listings are configured for automatic refresh from their product pages. The existing deployment workflow fetches their latest published lists on its monthly schedule, pushes to main, and manual runs. Run `npm run refresh` to sync locally.

Verified on 2026-09-27 against the [TD ETF directory](https://www.td.com/ca/en/asset-management/funds/solutions/etfs) and its [public listing endpoint](https://www.td.com/bin/fund-filter-data?productType=etf&reqType=overview&lang=en). Both CAD and USD unit classes are included. Portfolio amounts must use the same currency because the calculator does not convert currencies.

## Holdings and dates

The TD adapter reads the product page's `data-top-ten-table` array, which supplies the “See Full List of Holdings” modal. It reads the embedded list rather than the ten visible preview rows. No CSV/XLSX holdings links were found on the inspected product pages.

TD does not supply a verified date for these lists. The accepted TD-specific exception uses the UTC retrieval date for `as_of_date` and records `date_basis: "retrieved"` in both the snapshot and catalog summary. The ETF detail page labels this “Holdings retrieved on” and explains that the issuer date is unavailable. NAV, fee, and performance dates are not used as holdings dates. Other issuer date requirements remain in force.

Holding names serve as identifiers because TD supplies no tickers or ISINs. Names may not aggregate with ticker or ISIN representations from other issuers. Funds holding other ETFs retain their reported ETF positions without recursive look-through.

Normal weight validation remains active. Zero weights are dropped, negative weights are retained, and partial lists remain marked partial. Totals above 100.5% are rejected, retaining previous usable snapshots. Same-date unchanged data does not create another snapshot. A later retrieval date creates a new observation even if the published weights are unchanged.

## Initial sync

The 2026-09-27 retrieval imported all 58 funds with no source errors. TBCK, TCCB, TDNA, TSTB, and TUST are marked partial under the existing weight-total check. Their missing weights are not filled in.

## Inspected product pages

Rows below count all entries in the embedded list, including zero weights. The raw total is diagnostic only and is not validated catalog data. USD unit classes are listed separately by TD and are included in this audit.

| Ticker | Product page | Embedded rows | Raw total (%) |
| --- | --- | ---: | ---: |
| TCOM | [TD Alternative Commodities Pool - ETF Series](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7471) | 10 | 98.20 |
| TGED | [TD Active Global Enhanced Dividend ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7115) | 63 | 99.99 |
| TGED.U | [TD Active Global Enhanced Dividend ETF - US$](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7227) | 63 | 99.99 |
| TGGR | [TD Active Global Equity Growth ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7141) | 71 | 100.03 |
| TINF | [TD Active Global Infrastructure Equity ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7144) | 56 | 99.99 |
| TGRE | [TD Active Global Real Estate Equity ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7134) | 67 | 100.04 |
| TUEX | [TD Active U.S. Enhanced Dividend CAD Hedged ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7279) | 4 | 100.00 |
| TUED | [TD Active U.S. Enhanced Dividend ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7140) | 43 | 99.97 |
| TUED.U | [TD Active U.S. Enhanced Dividend ETF - US$](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7228) | 43 | 99.97 |
| TBNK | [TD Canadian Bank Dividend Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7278) | 7 | 99.99 |
| TTP | [TD Canadian Equity Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=6901) | 322 | 99.96 |
| TDOC | [TD Global Healthcare Leaders Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7192) | 112 | 100.00 |
| TDOC.U | [TD Global Healthcare Leaders Index ETF - US$](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7229) | 112 | 100.00 |
| TECI | [TD Global Technology Innovators Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7202) | 100 | 100.00 |
| TECX | [TD Global Technology Leaders CAD Hedged Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7280) | 225 | 100.02 |
| TEC | [TD Global Technology Leaders Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7113) | 225 | 100.02 |
| TEC.U | [TD Global Technology Leaders Index ETF - US$](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7230) | 225 | 100.02 |
| THE | [TD International Equity CAD Hedged Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=6905) | 5 | 100.00 |
| TPE | [TD International Equity Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=6904) | 879 | 100.00 |
| TDNA | [TD North American Dividend Fund - ETF Series](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7420) | 10 | 37.80 |
| TQCD | [TD Q Canadian Dividend ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7130) | 79 | 99.99 |
| TCLV | [TD Q Canadian Low Volatility ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7142) | 58 | 99.98 |
| TQGD | [TD Q Global Dividend ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7131) | 204 | 99.96 |
| TQGM | [TD Q Global Multifactor ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7132) | 433 | 99.99 |
| TQID | [TD Q International Dividend ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7483) | 162 | 100.01 |
| TILV | [TD Q International Low Volatility ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7116) | 194 | 99.95 |
| TULV | [TD Q U.S. Low Volatility ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7143) | 86 | 99.96 |
| TQSM | [TD Q U.S. Small-Mid-Cap Equity ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7133) | 295 | 99.96 |
| TQSM.U | [TD Q U.S. Small-Mid-Cap Equity ETF - US$](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7413) | 295 | 99.96 |
| THU | [TD U.S. Equity CAD Hedged Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=6903) | 4 | 100.00 |
| TPU | [TD U.S. Equity Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=6902) | 499 | 100.06 |
| TPU.U | [TD U.S. Equity Index ETF - US$](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7231) | 499 | 100.06 |
| TGFI | [TD Active Global Income ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7125) | 284 | 100.02 |
| TUHY | [TD Active U.S. High Yield Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7126) | 126 | 100.01 |
| TDB | [TD Canadian Aggregate Bond Index ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=6900) | 1234 | 99.68 |
| TCCB | [TD Canadian Corporate Bond Fund - ETF Series](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7470) | 10 | 12.60 |
| TCLB | [TD Canadian Long Term Federal Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7127) | 11 | 99.99 |
| TCSH | [TD Cash Management ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7114) | 178 | 100.01 |
| TCSB | [TD Select Short Term Corporate Bond Ladder ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7070) | 114 | 100.01 |
| TUSB | [TD Select US Short Term Corporate Bond Ladder ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7072) | 74 | 99.99 |
| TUSB.U | [TD Select US Short Term Corporate Bond Ladder ETF - US$](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7073) | 74 | 99.99 |
| TSTB | [TD Short Term Bond Fund - ETF Series](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7469) | 10 | 38.20 |
| TBCF | [TD Target 2026 Investment Grade Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7319) | 18 | 99.99 |
| TBUF.U | [TD Target 2026 U.S. Investment Grade Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7322) | 13 | 100.01 |
| TBCG | [TD Target 2027 Investment Grade Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7320) | 37 | 100.01 |
| TBUG.U | [TD Target 2027 U.S. Investment Grade Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7323) | 18 | 100.01 |
| TBCH | [TD Target 2028 Investment Grade Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7409) | 26 | 100.00 |
| TBCI | [TD Target 2029 Investment Grade Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7410) | 21 | 100.00 |
| TBCJ | [TD Target 2030 Investment Grade Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7411) | 34 | 100.00 |
| TBCK | [TD Target 2031 Investment Grade Bond Fund - ETF Series](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7484) | 10 | 47.20 |
| TUSD.U | [TD U.S. Cash Management ETF - US$](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7412) | 94 | 100.04 |
| TULB | [TD U.S. Long Term Treasury Bond ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7128) | 16 | 99.99 |
| TUST | [TD Ultra Short Term Bond Fund - ETF Series](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7468) | 10 | 26.00 |
| TEQT | [TD All-Equity ETF Portfolio](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7418) | 4 | 99.99 |
| TBAL | [TD Balanced ETF Portfolio](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7150) | 5 | 100.00 |
| TCON | [TD Conservative ETF Portfolio](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7149) | 5 | 99.99 |
| TGRO | [TD Growth ETF Portfolio](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7151) | 5 | 100.01 |
| TPRF | [TD Active Preferred Share ETF](https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7071) | 118 | 100.04 |
