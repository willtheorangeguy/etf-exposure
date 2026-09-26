import { describe, expect, it } from "vitest";
import { discoverLinks, tickerFromLink, tickerFromMetadata } from "../src/lib/source-discovery";
import { isPublicAddress } from "../src/lib/public-url";
import { parseSheet } from "../src/lib/parse";
import { computeExposure } from "../src/lib/calc";

describe("issuer discovery", () => {
  it("discovers relative downloads and same-origin fund pages", () => {
    const links = discoverLinks('<a data-ticker="VCN" href="/files/new.xlsx">Download holdings</a><a href="/etf/vcn">VCN fund</a><a href="https://elsewhere.test/fund">Other fund</a>', "https://issuer.test/etfs");
    expect(links.files).toEqual([{url:"https://issuer.test/files/new.xlsx",ticker:"VCN",name:undefined}]);
    expect(links.pages).toHaveLength(1);
  });
  it("extracts ETF identifiers from the supplied issuer file URLs", () => {
    expect(tickerFromLink("https://df.bmogam.com/Holdings_Extract_en_US_ZCN_20260924.xlsx")).toBe("ZCN");
    expect(tickerFromLink("https://blackrock.com/download.ajax?fileName=XEQT_holdings")).toBe("XEQT");
    expect(tickerFromMetadata("ETF ticker: VCN")).toBe("VCN");
    expect(tickerFromLink("https://issuer.test/holdings.xlsx")).toBeUndefined();
  });
  it("blocks loopback, private, mapped IPv6 and link-local source addresses", () => {
    for (const ip of ["127.0.0.1","10.1.2.3","169.254.169.254","172.16.1.1","192.168.1.1","::1","::ffff:127.0.0.1","fe80::1"]) expect(isPublicAddress(ip)).toBe(false);
    expect(isPublicAddress("8.8.8.8")).toBe(true);
    expect(isPublicAddress("2606:4700:4700::1111")).toBe(true);
  });
  it("uses the last iShares table without double counting parent ETFs", () => {
    const parsed = parseSheet({kind:"csv",text:'Fund Holdings as of,"Sep 24, 2026"\nTicker,Name,Weight (%)\nXIC,Parent ETF,100\n\nFund Holdings as of,"Sep 24, 2026"\nTicker,Name,Weight (%)\nRY,Royal Bank,100'});
    expect(parsed.asOfDate).toBe("2026-09-24");
    expect(parsed.holdings.map((h) => h.t)).toEqual(["RY"]);
  });
  it("retains BMO ISINs when stock ticker columns are absent", () => {
    const parsed = parseSheet({kind:"csv",text:'As of 2026-09-24\nWeight (%),Name,ISIN\n100,Royal Bank,CA7800871021'});
    expect(parsed.holdings[0].isin).toBe("CA7800871021");
    expect(parsed.holdings[0].t).toBe("CA7800871021");
  });
  it("aggregates the same security across ticker and ISIN representations", () => {
    const positions = [0,1,2].map((etfId) => ({etfId,etfTicker:`ETF${etfId}`,amount:100,asOf:"2026-09-24",partial:false}));
    const result = computeExposure(positions,{0:[{t:"RY",n:"Royal Bank",weight:100,isin:"CA7800871021"}],1:[{t:"CA7800871021",n:"Royal Bank",weight:100,isin:"CA7800871021"}],2:[{t:"RY",n:"Royal Bank",weight:100}]});
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].ticker).toBe("RY");
    expect(result.rows[0].exposure).toBe(300);
  });
});
