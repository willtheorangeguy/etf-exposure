import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchIssuerSource } from "../src/lib/issuer-sources";

vi.mock("../src/lib/public-url", () => ({ assertPublicUrl: vi.fn(async () => undefined) }));

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function mockFetch(pageHtml: string, holdingItems: unknown[], name: string) {
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: { body?: string }) => {
    if (String(url).includes("/gpx/graphql")) {
      const body = JSON.parse((init?.body ?? "") as string);
      const portIds = body.variables.portIds as string[];
      const items = portIds[0] ? holdingItems : [];
      return new Response(JSON.stringify({ data: { funds: [{ profile: { fundFullName: name } }],
      borHoldings: [{ holdings: { items, lastItemKey: null } }] } }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response(pageHtml, { status: 200, headers: { "content-type": "text/html" } });
  }));
}

describe("Vanguard product adapter", () => {
  it("accepts D-series product IDs and returns their holdings", async () => {
    mockFetch("<html><head></head><body><h1>(VUDV) Vanguard U.S. High Dividend Yield Index ETF</h1></body></html>",
      [
        { ticker: "AVGO", isin: "US06790X1051", issuerName: "Broadcom Inc", securityLongDescription: "Broadcom Inc", marketValuePercentage: 6.93, effectiveDate: "2026-08-31" },
        { ticker: "JPM", isin: "US4781601066", issuerName: "JPMorgan Chase & Co", securityLongDescription: "JPMorgan Chase & Co", marketValuePercentage: 4.1, effectiveDate: "2026-08-31" },
      ], "Vanguard U.S. High Dividend Yield Index ETF");
    const result = await fetchIssuerSource("https://www.vanguard.ca/en/product/etf/equity/D018/vanguard-us-high-dividend-yield-etf");
    expect(result.source.kind).toBe("csv");
    const text = (result.source as { text: string }).text;
    expect(text).toContain("ETF ticker: VUDV");
    expect(text).toContain("As of 2026-08-31");
    expect(text).toContain("AVGO");
  });
  it("still accepts numeric product IDs", async () => {
    mockFetch("<html><h1>(VCN) Vanguard FTSE Canada All Cap Index ETF</h1></html>",
      [{ ticker: "RY", isin: "CA78371W1055", issuerName: "Royal Bank", securityLongDescription: "Royal Bank", marketValuePercentage: 2.5, effectiveDate: "2026-08-31" }],
      "Vanguard FTSE Canada All Cap Index ETF");
    const result = await fetchIssuerSource("https://www.vanguard.ca/en/product/etf/equity/9561/vanguard-ftse-canada-all-cap-index-etf");
    const text = (result.source as { text: string }).text;
    expect(text).toContain("ETF ticker: VCN");
    expect(text).toContain("RY");
  });
  it("keeps demanding a parenthesized ticker heading", async () => {
    mockFetch("<html><h1>Vanguard Fund Without Ticker</h1></html>",
      [{ ticker: "RY", marketValuePercentage: 1, effectiveDate: "2026-08-31" }], "Vanguard Fund");
    await expect(fetchIssuerSource("https://www.vanguard.ca/en/product/etf/equity/9561/some-fund")).rejects.toThrow(/ticker/i);
  });
});
