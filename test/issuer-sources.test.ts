import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchIssuerSource } from "../src/lib/issuer-sources";
import * as XLSX from "xlsx";
import { parseSheet } from "../src/lib/parse";
import { ImportSchema } from "../src/lib/import-validation";

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

describe("BMO holdings adapter", () => {
  function workbookResponse(rows: (string | number)[][]) {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Holdings");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(buffer, {
      headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    })));
  }

  it("keeps negative cash and option offsets without ISINs", async () => {
    workbookResponse([
      ["Weight (%)", "Name", "ISIN", "Currency", "Asset Class"],
      [109.49, "Equity Core", "US78462F1030", "USD", "Equity"],
      [-0.13, "Cash", "", "CAD", "Cash"],
      [-9.36, "733140062 BMOMOOTC PUT OPTIONS", "", "CAD", "Derivatives"],
    ]);
    const result = await fetchIssuerSource("https://df.bmogam.com/assets/static/reports/etf-funds-holdings/Holdings_Extract_en_US_ZAPR_20260925.xlsx");
    const parsed = parseSheet(result.source, { ticker: "ZAPR" });
    expect(parsed.holdings).toHaveLength(3);
    expect(parsed.holdings.find((h) => h.t === "CASH.CAD")?.weight).toBeCloseTo(-0.13, 10);
    expect(parsed.holdings.find((h) => h.t === "733140062 BMOMOOTC PUT OPTIONS")?.weight).toBeCloseTo(-9.36, 10);
    expect(parsed.holdings.find((h) => h.isin === "US78462F1030")?.weight).toBeCloseTo(109.49, 10);
    expect(ImportSchema.safeParse({ ...parsed, source: "url" }).success).toBe(true);
  });

  it("retains physical gold without an ISIN and its cash offset", async () => {
    workbookResponse([
      ["Weight (%)", "Name", "ISIN", "Currency"],
      [100.03, "SPOT PHYSICAL GOLD", "", "USD"],
      [-0.03, "Cash", "", "CAD"],
    ]);
    const result = await fetchIssuerSource("https://df.bmogam.com/assets/static/reports/etf-funds-holdings/Holdings_Extract_en_US_ZGLD_20260925.xlsx");
    const parsed = parseSheet(result.source, { ticker: "ZGLD" });
    expect(parsed.holdings.find((h) => h.t === "SPOT PHYSICAL GOLD")?.weight).toBeCloseTo(100.03, 10);
    expect(parsed.holdings.find((h) => h.t === "CASH.CAD")?.weight).toBeCloseTo(-0.03, 10);
    expect(parsed.partial).toBe(false);
  });
});
