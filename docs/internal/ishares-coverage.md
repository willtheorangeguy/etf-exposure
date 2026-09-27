# iShares Canada coverage

Verified on 2026-09-27 against the [BlackRock Canada product directory](https://www.blackrock.com/ca/investors/en/products/product-list). Each imported fund uses a CSV link opened from its own product page and its verified full name. CAD refers to the fund unit currency, including CAD-hedged and unhedged funds; it does not mean all underlying assets are Canadian.

Directory: 175 products. Supported CAD funds: 152 (151 additions; XEQT already existed). USD unit classes excluded: 19. CAD bullion funds blocked: 4.

The existing parser selects the last repeated holdings table when BlackRock supplies look-through holdings. It does not resolve ETF constituents recursively. Partial flags remain visible: totals below 98% reflect the issuer CSV after zero-weight rows are dropped, including rounding in large look-through tables. No missing weights are invented. Totals from 100% through 100.5% use the existing rounding correction.

## Blocked funds

These product pages publish no CSV holdings link. Per the adding-ETFs stop conditions, no sources or artificial holdings were added.

| Ticker | Product page | Reason |
| --- | --- | --- |
| CGL.C | [iShares Gold Bullion ETF](https://www.blackrock.com/ca/investors/en/products/241528/ishares-gold-bullion-etf) | No published CSV holdings download |
| SVR.C | [iShares Silver Bullion ETF](https://www.blackrock.com/ca/investors/en/products/240642/ishares-silver-bullion-etf) | No published CSV holdings download |
| CGL | [iShares Gold Bullion ETF](https://www.blackrock.com/ca/investors/en/products/272269/ishares-gold-bullion-etf) | No published CSV holdings download |
| SVR | [iShares Silver Bullion ETF](https://www.blackrock.com/ca/investors/en/products/272952/ishares-silver-bullion-etf) | No published CSV holdings download |

## Excluded USD unit classes

IBIT.U, XAGG.U, XAW.U, XCBU.U, XDG.U, XDU.U, XEC.U, XEF.U, XFLI.U, XMC.U, XMU.U, XQQU.U, XSHU.U, XSTP.U, XTLT.U, XTOT.U, XUS.U, XUSC.U, XUU.U.

## Verified CAD holdings

| Ticker | Product page | Date | Nonzero holdings | Total (%) | Partial |
| --- | --- | --- | ---: | ---: | --- |
| CBH | [iShares 1-10 Year Laddered Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239416/ishares-110-year-laddered-corporate-bond-index-fund) | 2026-09-24 | 89 | 99.9600 | false |
| CBO | [iShares 1-5 Year Laddered Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239420/ishares-15-year-laddered-corporate-bond-index-fund) | 2026-09-24 | 466 | 99.9700 | false |
| CDZ | [iShares S&P/TSX Canadian Dividend Aristocrats Index ETF](https://www.blackrock.com/ca/investors/en/products/239834/ishares-sptsx-canadian-dividend-aristocrats-index-fund) | 2026-09-24 | 96 | 100.0000 | false |
| CEW | [iShares Equal Weight Banc & Lifeco ETF](https://www.blackrock.com/ca/investors/en/products/239532/ishares-equal-weight-banc-lifeco-etf) | 2026-09-24 | 11 | 100.0000 | false |
| CGR | [iShares Global Real Estate Index ETF](https://www.blackrock.com/ca/investors/en/products/239558/ishares-global-real-estate-index-fund) | 2026-09-24 | 87 | 100.0000 | false |
| CIE | [iShares International Fundamental Index ETF](https://www.blackrock.com/ca/investors/en/products/239569/ishares-international-fundamental-index-fund) | 2026-09-24 | 1015 | 100.0000 | false |
| CIF | [iShares Global Infrastructure Index ETF](https://www.blackrock.com/ca/investors/en/products/239554/ishares-global-infrastructure-index-fund) | 2026-09-24 | 63 | 100.0000 | false |
| CJP | [iShares Japan Fundamental Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239576/ishares-japan-fundamental-index-fund-cadhedged-fund) | 2026-09-24 | 256 | 100.0000 | false |
| CLF | [iShares 1-5 Year Laddered Government Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239422/ishares-15-year-laddered-government-bond-index-fund) | 2026-09-24 | 85 | 100.0000 | false |
| CLG | [iShares 1-10 Year Laddered Government Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239418/ishares-110-year-laddered-government-bond-index-fund) | 2026-09-24 | 97 | 100.0000 | false |
| CLU | [iShares US Fundamental Index ETF](https://www.blackrock.com/ca/investors/en/products/239863/ishares-us-fundamental-index-fund) | 2026-09-24 | 983 | 99.9600 | false |
| CLU.C | [iShares US Fundamental Index ETF](https://www.blackrock.com/ca/investors/en/products/239860/ishares-us-fundamental-index-fund) | 2026-09-24 | 983 | 99.9600 | false |
| CMR | [iShares Premium Money Market ETF](https://www.blackrock.com/ca/investors/en/products/239414/ishares-premium-money-market-etf) | 2026-09-24 | 213 | 100.0000 | false |
| COW | [iShares Global Agriculture Index ETF](https://www.blackrock.com/ca/investors/en/products/239548/ishares-global-agriculture-index-fund) | 2026-09-24 | 38 | 100.0000 | false |
| CPD | [iShares S&P/TSX Canadian Preferred Share Index ETF](https://www.blackrock.com/ca/investors/en/products/239836/ishares-sptsx-canadian-preferred-share-index-fund) | 2026-09-24 | 150 | 99.9400 | false |
| CRQ | [iShares Canadian Fundamental Index ETF](https://www.blackrock.com/ca/investors/en/products/239478/ishares-canadian-fundamental-index-fund) | 2026-09-24 | 101 | 99.9800 | false |
| CUD | [iShares US Dividend Growers Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239828/ishares-sp-us-dividend-growers-index-fund-cadhedged-fund) | 2026-09-24 | 162 | 100.0000 | false |
| CVD | [iShares Convertible Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239435/ishares-convertible-bond-index-etf) | 2026-09-24 | 22 | 100.0000 | false |
| CWO | [iShares Emerging Markets Fundamental Index ETF](https://www.blackrock.com/ca/investors/en/products/239474/ishares-emerging-markets-fundamental-index-etf) | 2026-09-24 | 364 | 100.0000 | false |
| CWW | [iShares Global Water Index ETF](https://www.blackrock.com/ca/investors/en/products/239755/ishares-sp-global-water-index-fund) | 2026-09-24 | 77 | 100.0000 | false |
| CYH | [iShares Global Monthly Dividend Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239556/ishares-global-monthly-dividend-index-etf) | 2026-09-24 | 306 | 100.0000 | false |
| FIE | [iShares Canadian Financial Monthly Income ETF](https://www.blackrock.com/ca/investors/en/products/239476/ishares-canadian-financial-monthly-income-etf) | 2026-09-24 | 28 | 100.0000 | false |
| GBAL | [iShares ESG Balanced ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/315672/ishares-esg-balanced-etf-portfolio) | 2026-09-24 | 1314 | 100.0000 | false |
| GCNS | [iShares ESG Conservative Balanced ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/315670/ishares-esg-conservative-balanced-etf-portfolio) | 2026-09-24 | 1301 | 100.0000 | false |
| GEQT | [iShares ESG Equity ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/315678/ishares-esg-equity-etf-portfolio) | 2026-09-24 | 808 | 100.0000 | false |
| GGRO | [iShares ESG Growth ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/315676/ishares-esg-growth-etf-portfolio) | 2026-09-24 | 1211 | 99.7800 | false |
| IBIT | [iShares Bitcoin ETF](https://www.blackrock.com/ca/investors/en/products/340780/ishares-bitcoin-etf) | 2026-09-24 | 2 | 99.9900 | false |
| IBQT | [iShares Equity + Bitcoin ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/352417/ishares-equity-+-bitcoin-etf-portfolio) | 2026-09-24 | 1811 | 94.2600 | true |
| XAD | [iShares U.S. Aerospace & Defense Index ETF](https://www.blackrock.com/ca/investors/en/products/332752/ishares-u-s-aerospace-defense-index-etf) | 2026-09-24 | 52 | 99.9900 | false |
| XAGG | [iShares U.S. Aggregate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/320095/ishares-u-s-aggregate-bond-index-etf) | 2026-09-24 | 2594 | 81.7600 | true |
| XAGH | [iShares U.S. Aggregate Bond Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/320099/ishares-u-s-aggregate-bond-index-etf-cad-hedged) | 2026-09-24 | 2672 | 81.9300 | true |
| XAW | [iShares Core MSCI All Country World ex Canada Index ETF](https://www.blackrock.com/ca/investors/en/products/272108/ishares-core-sp-us-total-market-index-etf) | 2026-09-24 | 2009 | 94.4300 | true |
| XBAL | [iShares Core Balanced ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/239449/ishares-balanced-income-coreportfoliotm-fund) | 2026-09-24 | 2628 | 89.5500 | true |
| XBB | [iShares Core Canadian Universe Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239493/ishares-canadian-universe-bond-index-etf) | 2026-09-24 | 1753 | 100.0000 | false |
| XBM | [iShares S&P/TSX Global Base Metals Index ETF](https://www.blackrock.com/ca/investors/en/products/239847/ishares-sptsx-global-base-metals-index-etf) | 2026-09-24 | 60 | 100.0000 | false |
| XCB | [iShares Core Canadian Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239485/ishares-canadian-corporate-bond-index-etf) | 2026-09-24 | 1331 | 100.0000 | false |
| XCBG | [iShares ESG Advanced Canadian Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/320096/ishares-esg-advanced-canadian-corporate-bond-index-etf) | 2026-09-24 | 371 | 100.0000 | false |
| XCBU | [iShares U.S. IG Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/319677/ishares-u-s-ig-corporate-bond-index-etf) | 2026-09-24 | 3176 | 100.0000 | false |
| XCD | [iShares S&P Global Consumer Discretionary Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/251242/ishares-sp-global-consumer-discretionary-index-etf-cadhedged-fund) | 2026-09-24 | 154 | 99.9900 | false |
| XCG | [iShares Canadian Growth Index ETF](https://www.blackrock.com/ca/investors/en/products/239497/ishares-canadian-growth-index-etf) | 2026-09-24 | 36 | 100.0000 | false |
| XCH | [iShares China Index ETF](https://www.blackrock.com/ca/investors/en/products/239481/ishares-china-index-etf) | 2026-09-24 | 55 | 100.0000 | false |
| XCHP | [iShares Semiconductor Index ETF](https://www.blackrock.com/ca/investors/en/products/332756/ishares-semiconductor-index-etf) | 2026-09-24 | 32 | 100.0000 | false |
| XCLN | [iShares Global Clean Energy Index ETF](https://www.blackrock.com/ca/investors/en/products/327373/ishares-global-clean-energy-index-etf) | 2026-09-24 | 118 | 100.0000 | false |
| XCNS | [iShares Core Conservative Balanced ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/309484/ishares-core-conservative-balanced-etf-portfolio) | 2026-09-24 | 2610 | 89.0900 | true |
| XCS | [iShares S&P/TSX SmallCap Index ETF](https://www.blackrock.com/ca/investors/en/products/239852/ishares-sptsx-small-cap-index-etf) | 2026-09-24 | 235 | 99.9200 | false |
| XCSR | [iShares ESG Advanced MSCI Canada Index ETF](https://www.blackrock.com/ca/investors/en/products/313580/ishares-esg-advanced-msci-canada-index-etf) | 2026-09-24 | 136 | 100.0000 | false |
| XCV | [iShares Canadian Value Index ETF](https://www.blackrock.com/ca/investors/en/products/239498/ishares-canadian-value-index-etf) | 2026-09-24 | 41 | 99.9600 | false |
| XDG | [iShares Core MSCI Global Quality Dividend Index ETF](https://www.blackrock.com/ca/investors/en/products/287839/ishares-core-msci-global-quality-dividend-index-etf) | 2026-09-24 | 375 | 100.0000 | false |
| XDGH | [iShares Core MSCI Global Quality Dividend Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/287841/ishares-core-msci-global-quality-dividend-index-etf-cad-hedged) | 2026-09-24 | 390 | 100.0000 | false |
| XDIV | [iShares Core MSCI Canadian Quality Dividend Index ETF](https://www.blackrock.com/ca/investors/en/products/287823/ishares-core-msci-canadian-quality-dividend-index-etf) | 2026-09-24 | 23 | 99.9900 | false |
| XDNA | [iShares Genomics Immunology and Healthcare Index ETF](https://www.blackrock.com/ca/investors/en/products/327372/ishares-genomics-immunology-and-healthcare-index-etf) | 2026-09-24 | 55 | 100.0000 | false |
| XDRV | [iShares Global Electric and Autonomous Vehicles Index ETF](https://www.blackrock.com/ca/investors/en/products/330880/ishares-global-electric-and-autonomous-vehicles-index-etf) | 2026-09-24 | 51 | 99.9500 | false |
| XDSR | [iShares ESG Advanced MSCI EAFE Index ETF](https://www.blackrock.com/ca/investors/en/products/313746/ishares-esg-advanced-msci-eafe-index-etf) | 2026-09-24 | 401 | 100.0000 | false |
| XDU | [iShares Core MSCI US Quality Dividend Index ETF](https://www.blackrock.com/ca/investors/en/products/287834/ishares-core-msci-us-quality-dividend-index-etf) | 2026-09-24 | 156 | 100.0000 | false |
| XDUH | [iShares Core MSCI US Quality Dividend Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/287836/ishares-core-msci-us-quality-dividend-index-etf-cad-hedged) | 2026-09-24 | 158 | 100.0000 | false |
| XDV | [iShares Canadian Select Dividend Index ETF](https://www.blackrock.com/ca/investors/en/products/239496/ishares-canadian-select-dividend-index-etf) | 2026-09-24 | 33 | 100.0000 | false |
| XEB | [iShares J.P. Morgan USD Emerging Markets Bond Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239573/ishares-jp-morgan-usd-emerging-markets-bond-index-etf-cadhedged-fund) | 2026-09-24 | 626 | 99.9000 | false |
| XEC | [iShares Core MSCI Emerging Markets IMI Index ETF](https://www.blackrock.com/ca/investors/en/products/251423/ishares-msci-emerging-markets-imi-index-etf) | 2026-09-24 | 1726 | 98.0300 | false |
| XEF | [iShares Core MSCI EAFE IMI Index ETF](https://www.blackrock.com/ca/investors/en/products/251421/ishares-msci-eafe-imi-index-etf) | 2026-09-24 | 1666 | 99.2300 | false |
| XEG | [iShares S&P/TSX Capped Energy Index ETF](https://www.blackrock.com/ca/investors/en/products/239839/ishares-sptsx-capped-energy-index-etf) | 2026-09-24 | 27 | 100.0000 | false |
| XEH | [iShares MSCI Europe IMI Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/262832/ishares-msci-europe-imi-index-etf-cadhedged-fund) | 2026-09-24 | 985 | 99.8800 | false |
| XEI | [iShares S&P/TSX Composite High Dividend Index ETF](https://www.blackrock.com/ca/investors/en/products/239846/ishares-sptsx-equity-income-index-etf) | 2026-09-24 | 78 | 99.9900 | false |
| XEM | [iShares MSCI Emerging Markets Index ETF](https://www.blackrock.com/ca/investors/en/products/239636/ishares-msci-emerging-markets-index-etf) | 2026-09-24 | 968 | 99.6300 | false |
| XEMC | [iShares MSCI Emerging Markets ex China Index ETF](https://www.blackrock.com/ca/investors/en/products/330878/ishares-msci-emerging-markets-ex-china-index-etf) | 2026-09-24 | 601 | 99.8500 | false |
| XEN | [iShares Jantzi Social Index ETF](https://www.blackrock.com/ca/investors/en/products/239574/ishares-jantzi-social-index-etf) | 2026-09-24 | 53 | 100.0000 | false |
| XEQT | [iShares Core Equity ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/309480/ishares-core-equity-etf-portfolio) | 2026-09-24 | 1835 | 94.6200 | true |
| XESG | [iShares ESG Aware MSCI Canada Index ETF](https://www.blackrock.com/ca/investors/en/products/307298/ishares-esg-aware-msci-canada-index-etf) | 2026-09-24 | 131 | 100.0000 | false |
| XETM | [iShares S&P/TSX Energy Transition Materials Index ETF](https://www.blackrock.com/ca/investors/en/products/332757/ishares-s-p-tsx-energy-transition-materials-index-etf) | 2026-09-24 | 109 | 100.0000 | false |
| XEU | [iShares MSCI Europe IMI Index ETF](https://www.blackrock.com/ca/investors/en/products/262831/ishares-msci-europe-imi-index-etf) | 2026-09-24 | 974 | 99.8600 | false |
| XEXP | [iShares Exponential Technologies Index ETF](https://www.blackrock.com/ca/investors/en/products/327374/ishares-exponential-technologies-index-etf) | 2026-09-24 | 196 | 99.9700 | false |
| XFH | [iShares Core MSCI EAFE IMI Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/272102/ishares-core-msci-eafe-imi-index) | 2026-09-24 | 1684 | 99.2000 | false |
| XFLB | [iShares Core Canadian 15+ Year Federal Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/330862/ishares-core-canadian-15+-year-federal-bond-index-etf) | 2026-09-24 | 10 | 100.0000 | false |
| XFLI | [iShares Flexible Monthly Income ETF](https://www.blackrock.com/ca/investors/en/products/339049/ishares-flexible-monthly-income-etf) | 2026-09-24 | 3120 | 97.4900 | true |
| XFLX | [iShares Flexible Monthly Income ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/339051/ishares-flexible-monthly-income-etf-cad-hedged) | 2026-09-24 | 3137 | 97.4800 | true |
| XFN | [iShares S&P/TSX Capped Financials Index ETF](https://www.blackrock.com/ca/investors/en/products/239840/ishares-sptsx-capped-financials-index-etf) | 2026-09-24 | 25 | 100.0000 | false |
| XFR | [iShares Floating Rate Index ETF](https://www.blackrock.com/ca/investors/en/products/239487/ishares-floating-rate-index-etf) | 2026-09-24 | 25 | 100.0000 | false |
| XGB | [iShares Core Canadian Government Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239486/ishares-canadian-government-bond-index-etf) | 2026-09-24 | 520 | 99.9300 | false |
| XGD | [iShares S&P/TSX Global Gold Index ETF](https://www.blackrock.com/ca/investors/en/products/239848/ishares-sptsx-global-gold-index-etf) | 2026-09-24 | 69 | 99.9800 | false |
| XGGB | [iShares Global Government Bond Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/308044/ishares-global-government-bond-index-etf-cad-hedged) | 2026-09-24 | 1255 | 99.8300 | false |
| XGI | [iShares S&P Global Industrials Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/251243/ishares-sp-global-industrials-index-etf-cadhedged-fund) | 2026-09-24 | 242 | 99.9700 | false |
| XGRO | [iShares Core Growth ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/239447/ishares-balanced-growth-coreportfoliotm-fund) | 2026-09-24 | 2398 | 90.8700 | true |
| XHAK | [iShares Cybersecurity and Tech Index ETF](https://www.blackrock.com/ca/investors/en/products/327371/ishares-cybersecurity-and-tech-index-etf) | 2026-09-24 | 40 | 99.9900 | false |
| XHB | [iShares Canadian HYBrid Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239488/ishares-canadian-hybrid-corporate-bond-index-etf) | 2026-09-24 | 697 | 100.0000 | false |
| XHC | [iShares Global Healthcare Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239743/ishares-global-healthcare-index-etf-cadhedged-fund) | 2026-09-24 | 127 | 99.9700 | false |
| XHD | [iShares U.S. High Dividend Equity Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239857/ishares-us-high-dividend-equity-index-etf-cadhedged-fund) | 2026-09-24 | 81 | 99.9900 | false |
| XHU | [iShares U.S. High Dividend Equity Index ETF](https://www.blackrock.com/ca/investors/en/products/272110/ishares-us-high-dividend-equity-index-etf) | 2026-09-24 | 77 | 100.0000 | false |
| XHY | [iShares U.S. High Yield Bond Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239858/ishares-us-high-yield-bond-index-etf-cadhedged-fund) | 2026-09-24 | 1341 | 100.0000 | false |
| XIC | [iShares Core S&P/TSX Capped Composite Index ETF](https://www.blackrock.com/ca/investors/en/products/239837/ishares-sptsx-capped-composite-index-etf) | 2026-09-24 | 219 | 100.0000 | false |
| XID | [iShares India Index ETF](https://www.blackrock.com/ca/investors/en/products/239732/ishares-india-index-etf) | 2026-09-24 | 55 | 99.9900 | false |
| XIG | [iShares U.S. IG Corporate Bond Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239859/ishares-us-ig-corporate-bond-index-etf-cadhedged-fund) | 2026-09-24 | 3184 | 100.0000 | false |
| XIGS | [iShares 1-5 Year U.S. IG Corporate Bond Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/319673/ishares-1-5-year-u-s-ig-corporate-bond-index-etf-cad-hedged) | 2026-09-24 | 4539 | 99.4100 | false |
| XIN | [iShares MSCI EAFE Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239624/ishares-msci-eafe-index-etf-cadhedged-fund) | 2026-09-24 | 680 | 99.9000 | false |
| XINC | [iShares Core Income Balanced ETF Portfolio](https://www.blackrock.com/ca/investors/en/products/309482/ishares-core-income-balanced-etf-portfolio) | 2026-09-24 | 2425 | 88.8300 | true |
| XINT | [iShares Core MSCI All-International Equity Index ETF](https://www.blackrock.com/ca/investors/en/products/352415/ishares-core-msci-all-international-equity-index-etf) | 2026-09-24 | 2280 | 95.9800 | true |
| XIT | [iShares S&P/TSX Capped Information Technology Index ETF](https://www.blackrock.com/ca/investors/en/products/239841/ishares-sptsx-capped-information-technology-index-etf) | 2026-09-24 | 16 | 100.0000 | false |
| XIU | [iShares S&P/TSX 60 Index ETF](https://www.blackrock.com/ca/investors/en/products/239832/ishares-sptsx-60-index-etf) | 2026-09-24 | 63 | 100.0000 | false |
| XLB | [iShares Core Canadian Long Term Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239489/ishares-canadian-long-term-bond-index-etf) | 2026-09-24 | 622 | 99.9900 | false |
| XMA | [iShares S&P/TSX Capped Materials Index ETF](https://www.blackrock.com/ca/investors/en/products/239842/ishares-sptsx-capped-materials-index-etf) | 2026-09-24 | 62 | 100.0000 | false |
| XMC | [iShares S&P U.S. Mid-Cap Index ETF](https://www.blackrock.com/ca/investors/en/products/275746/ishares-sp-us-mid-cap-index-etf) | 2026-09-24 | 404 | 100.0000 | false |
| XMD | [iShares S&P/TSX Completion Index ETF](https://www.blackrock.com/ca/investors/en/products/239845/ishares-sptsx-completion-index-etf) | 2026-09-24 | 159 | 100.0000 | false |
| XMH | [iShares S&P U.S. Mid-Cap Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/275749/ishares-sp-us-mid-cap-index-etf-ca-hedged) | 2026-09-24 | 409 | 99.9100 | false |
| XMI | [iShares MSCI Min Vol EAFE Index ETF](https://www.blackrock.com/ca/investors/en/products/239625/ishares-msci-eafe-minimum-volatility-index-etf) | 2026-09-24 | 280 | 99.9700 | false |
| XML | [iShares MSCI Min Vol EAFE Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/283151/ishares-msci-min-vol-eafe-index-etf-cad-hedged) | 2026-09-24 | 289 | 99.9800 | false |
| XMM | [iShares MSCI Min Vol Emerging Markets Index ETF](https://www.blackrock.com/ca/investors/en/products/239640/ishares-msci-emerging-markets-minimum-volatility-index-etf) | 2026-09-24 | 304 | 100.0000 | false |
| XMS | [iShares MSCI Min Vol USA Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/283153/ishares-msci-min-vol-usa-index-etf-cad-hedged) | 2026-09-24 | 182 | 99.9500 | false |
| XMTM | [iShares MSCI USA Momentum Factor Index ETF](https://www.blackrock.com/ca/investors/en/products/309728/ishares-msci-usa-momentum-factor-index-etf) | 2026-09-24 | 128 | 100.0000 | false |
| XMU | [iShares MSCI Min Vol USA Index ETF](https://www.blackrock.com/ca/investors/en/products/239694/ishares-msci-usa-minimum-volatility-index-etf) | 2026-09-24 | 175 | 99.9800 | false |
| XMV | [iShares MSCI Min Vol Canada Index ETF](https://www.blackrock.com/ca/investors/en/products/239616/ishares-msci-canada-minimum-volatility-index-etf) | 2026-09-24 | 72 | 100.0000 | false |
| XMW | [iShares MSCI Min Vol Global Index ETF](https://www.blackrock.com/ca/investors/en/products/239604/ishares-msci-all-country-world-minimum-volatility-index-etf) | 2026-09-24 | 381 | 99.9200 | false |
| XMY | [iShares MSCI Min Vol Global Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/283155/ishares-msci-min-vol-global-index-etf-cad-hedged) | 2026-09-24 | 402 | 100.0000 | false |
| XPF | [iShares S&P/TSX North American Preferred Stock Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239851/ishares-sptsx-north-american-preferred-stock-index-etf-cadhedged-fund) | 2026-09-24 | 392 | 100.0000 | false |
| XQB | [iShares High Quality Canadian Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239433/ishares-high-quality-canadian-bond-index-etf) | 2026-09-24 | 599 | 100.0000 | false |
| XQLT | [iShares MSCI USA Quality Factor Index ETF](https://www.blackrock.com/ca/investors/en/products/309726/ishares-msci-usa-quality-factor-index-etf) | 2026-09-24 | 122 | 100.0000 | false |
| XQQ | [iShares NASDAQ 100 Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239698/ishares-nasdaq-100-index-etf-cadhedged-fund) | 2026-09-24 | 107 | 100.0000 | false |
| XQQU | [iShares NASDAQ 100 Index ETF](https://www.blackrock.com/ca/investors/en/products/332751/ishares-nasdaq-100-index-etf) | 2026-09-24 | 103 | 99.9900 | false |
| XRB | [iShares Canadian Real Return Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239490/ishares-canadian-real-return-bond-index-etf) | 2026-09-24 | 14 | 100.0000 | false |
| XRE | [iShares S&P/TSX Capped REIT Index ETF](https://www.blackrock.com/ca/investors/en/products/239843/ishares-sptsx-capped-reit-index-etf) | 2026-09-24 | 15 | 100.0000 | false |
| XSAB | [iShares ESG Aware Canadian Aggregate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/307306/ishares-esg-aware-canadian-aggregate-bond-index-etf) | 2026-09-24 | 705 | 99.7600 | false |
| XSB | [iShares Core Canadian Short Term Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239491/ishares-canadian-short-term-bond-index-etf) | 2026-09-24 | 763 | 99.9000 | false |
| XSC | [iShares Conservative Short Term Strategic Fixed Income ETF](https://www.blackrock.com/ca/investors/en/products/275742/ishares-short-term-conservative-strategic-fixed-income-etf) | 2026-09-24 | 2994 | 92.0000 | true |
| XSE | [iShares Conservative Strategic Fixed Income ETF](https://www.blackrock.com/ca/investors/en/products/275744/ishares-conservative-strategic-fixed-income-etf) | 2026-09-24 | 3564 | 93.3600 | true |
| XSEA | [iShares ESG Aware MSCI EAFE Index ETF](https://www.blackrock.com/ca/investors/en/products/307302/ishares-esg-aware-msci-eafe-index-etf) | 2026-09-24 | 348 | 99.9500 | false |
| XSEM | [iShares ESG Aware MSCI Emerging Markets Index ETF](https://www.blackrock.com/ca/investors/en/products/307304/ishares-esg-aware-msci-emerging-markets-index-etf) | 2026-09-24 | 300 | 99.9700 | false |
| XSH | [iShares Core Canadian Short Term Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/239492/ishares-canadian-short-term-corporate-maple-bond-index-etf) | 2026-09-24 | 653 | 100.0000 | false |
| XSHG | [iShares ESG Advanced 1-5 Year Canadian Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/320097/ishares-esg-advanced-1-5-year-canadian-corporate-bond-index-etf) | 2026-09-24 | 223 | 100.0000 | false |
| XSHU | [iShares 1-5 Year U.S. IG Corporate Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/319674/ishares-1-5-year-u-s-ig-corporate-bond-index-etf) | 2026-09-24 | 4526 | 99.3000 | false |
| XSI | [iShares Short Term Strategic Fixed Income ETF](https://www.blackrock.com/ca/investors/en/products/271493/ishares-short-term-strategic-fixed-income-etf) | 2026-09-24 | 2718 | 88.8600 | true |
| XSMB | [iShares Core Canadian 1-10 Year Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/343593/ishares-core-canadian-1-10-year-bond-index-etf) | 2026-09-24 | 346 | 100.0000 | false |
| XSMC | [iShares S&P U.S. Small-Cap Index ETF](https://www.blackrock.com/ca/investors/en/products/309732/ishares-s-p-u-s-small-cap-index-etf) | 2026-09-24 | 612 | 100.0000 | false |
| XSMH | [iShares S&P U.S. Small-Cap Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/309734/ishares-s-p-u-s-small-cap-index-etf-cad-hedged) | 2026-09-24 | 623 | 99.9900 | false |
| XSP | [iShares Core S&P 500 Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239727/ishares-sp-500-index-etf-cadhedged-fund) | 2026-09-24 | 516 | 100.0000 | false |
| XSPC | [iShares S&P 500 3% Capped Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/337897/ishares-s-p-500-3-capped-index-etf-cad-hedged) | 2026-09-24 | 515 | 99.8800 | false |
| XST | [iShares S&P/TSX Capped Consumer Staples Index ETF](https://www.blackrock.com/ca/investors/en/products/239838/ishares-sptsx-capped-consumer-staples-index-etf) | 2026-09-24 | 11 | 100.0000 | false |
| XSTB | [iShares ESG Aware Canadian Short Term Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/307308/ishares-esg-aware-canadian-short-term-bond-index-etf) | 2026-09-24 | 272 | 99.9600 | false |
| XSTH | [iShares 0-5 Year TIPS Bond Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/319670/ishares-0-5-year-tips-bond-index-etf-cad-hedged) | 2026-09-24 | 32 | 99.9900 | false |
| XSTP | [iShares 0-5 Year TIPS Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/319672/ishares-0-5-year-tips-bond-index-etf) | 2026-09-24 | 28 | 100.0000 | false |
| XSU | [iShares U.S. Small Cap Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/239711/ishares-us-small-cap-index-etf-cadhedged-fund) | 2026-09-24 | 1791 | 99.8800 | false |
| XSUS | [iShares ESG Aware MSCI USA Index ETF](https://www.blackrock.com/ca/investors/en/products/307300/ishares-esg-aware-msci-usa-index-etf) | 2026-09-24 | 271 | 100.0000 | false |
| XTLH | [iShares 20+ Year U.S. Treasury Bond Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/330870/ishares-20+-year-u-s-treasury-bond-index-etf-cad-hedged) | 2026-09-24 | 53 | 99.9800 | false |
| XTLT | [iShares 20+ Year U.S. Treasury Bond Index ETF](https://www.blackrock.com/ca/investors/en/products/330866/ishares-20+-year-u-s-treasury-bond-index-etf) | 2026-09-24 | 43 | 100.0000 | false |
| XTOH | [iShares Core S&P Total U.S. Stock Market Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/343570/ishares-core-s-p-total-u-s-stock-market-index-etf-cad-hedged) | 2026-09-24 | 1182 | 98.5700 | false |
| XTOT | [iShares Core S&P Total U.S. Stock Market Index ETF](https://www.blackrock.com/ca/investors/en/products/343519/ishares-core-s-p-total-u-s-stock-market-index-etf) | 2026-09-24 | 1163 | 98.5000 | false |
| XTR | [iShares Diversified Monthly Income ETF](https://www.blackrock.com/ca/investors/en/products/239495/ishares-diversified-monthly-income-etf) | 2026-09-24 | 3252 | 94.0800 | true |
| XUH | [iShares Core S&P U.S. Total Market Index ETF (CAD-Hedged)](https://www.blackrock.com/ca/investors/en/products/272106/ishares-core-sp-us-total-market-index-etf) | 2026-09-24 | 1069 | 98.5700 | false |
| XUS | [iShares Core S&P 500 Index ETF](https://www.blackrock.com/ca/investors/en/products/251422/ishares-sp-500-index-etf) | 2026-09-24 | 507 | 100.0000 | false |
| XUSC | [iShares S&P 500 3% Capped Index ETF](https://www.blackrock.com/ca/investors/en/products/337895/ishares-s-p-500-3-capped-index-etf) | 2026-09-24 | 506 | 100.0000 | false |
| XUSF | [iShares S&P U.S. Financials Index ETF](https://www.blackrock.com/ca/investors/en/products/332753/ishares-s-p-u-s-financials-index-etf) | 2026-09-24 | 78 | 99.9900 | false |
| XUSR | [iShares ESG Advanced MSCI USA Index ETF](https://www.blackrock.com/ca/investors/en/products/313743/ishares-esg-advanced-msci-usa-index-etf) | 2026-09-24 | 282 | 99.9500 | false |
| XUT | [iShares S&P/TSX Capped Utilities Index ETF](https://www.blackrock.com/ca/investors/en/products/239844/ishares-sptsx-capped-utilities-index-etf) | 2026-09-24 | 14 | 100.0000 | false |
| XUU | [iShares Core S&P U.S. Total Market Index ETF](https://www.blackrock.com/ca/investors/en/products/272104/ishares-core-sp-us-total-market-index-etf) | 2026-09-24 | 1054 | 98.5200 | false |
| XVLU | [iShares MSCI USA Value Factor Index ETF](https://www.blackrock.com/ca/investors/en/products/309730/ishares-msci-usa-value-factor-index-etf) | 2026-09-24 | 150 | 99.9500 | false |
| XWD | [iShares MSCI World Index ETF](https://www.blackrock.com/ca/investors/en/products/239697/ishares-msci-world-index-etf) | 2026-09-24 | 1197 | 100.0000 | false |

CLU.C uses the issuer filename `CLUC_holdings`; the explicit configured ticker preserves the TSX symbol. XEQT retains its existing source ID and URL, with an explicit ticker and full fund name.

## Validation

- The initial CMR refresh imported one snapshot and left all 199 existing sources unchanged, with no source errors.
- Full refresh: 350 ETFs, 152 iShares funds, no source errors. Every supported iShares fund matched its verified name, issuer date, nonzero holdings count, and partial flag.
- Repeat full refresh: all 350 sources unchanged, zero saved snapshots, zero source errors.
- Lint and type checking passed; all 55 tests passed.
- Root and `/etf-exposure` builds and artifact checks passed: all 350 ETF detail pages and snapshots were available, with 22,185 finite exposure rows.
