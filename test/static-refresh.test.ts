import { describe, it, expect } from "vitest";
import { emptyCatalog, refreshCatalog, SourcesConfig } from "../src/lib/static-refresh";
import type { StaticSnapshot } from "../src/lib/catalog-types";
import type { FetchResult } from "../src/lib/parse/fetch";

const config = SourcesConfig.parse([{ id: "test-etf", label: "Test ETF", ticker: "ETF", url: "https://issuer.example/holdings.csv" }]);
function fixture(date = "2026-09-24", weight = 100): FetchResult {
  return { source: { kind: "csv", text: `ETF ticker: ETF\nAs of ${date}\nTicker,Name,Weight (%)\nRY,Royal Bank,${weight}\n` }, contentType: "text/csv", finalUrl: config[0].url };
}
function memory() {
  const files = new Map<string, StaticSnapshot>();
  let writes = 0;
  return { files, get writes() { return writes; }, read: async (f: string) => structuredClone(files.get(f)!), write: async (f: string, s: StaticSnapshot) => { writes++; files.set(f, structuredClone(s)); } };
}
describe("static catalog refresh", () => {
  it("stores dated snapshots and deduplicates unchanged data", async () => {
    const storage = memory();
    const first = await refreshCatalog(emptyCatalog(), config, storage, async () => fixture());
    const second = await refreshCatalog(first, config, storage, async () => fixture());
    expect(first.etfs[0].snapshots[0].holdings_count).toBe(1);
    expect(second.sources[0].unchanged).toBe(1);
    expect(storage.writes).toBe(1);
  });
  it("retains good data and last success when an issuer fails", async () => {
    const storage = memory();
    const first = await refreshCatalog(emptyCatalog(), config, storage, async () => fixture(), "2026-09-24T00:00:00Z");
    const next = await refreshCatalog(first, config, storage, async () => { throw new Error("HTTP 503"); }, "2026-10-01T00:00:00Z");
    expect(next.etfs).toEqual(first.etfs);
    expect(next.sources[0].last_success_at).toBe(first.sources[0].last_success_at);
    expect(next.sources[0].errors[0].error).toBe("HTTP 503");
  });
  it("keeps history sorted and replaces same-date corrections", async () => {
    const storage = memory();
    let catalog = await refreshCatalog(emptyCatalog(), config, storage, async () => fixture());
    const id = catalog.etfs[0].snapshots[0].id;
    catalog = await refreshCatalog(catalog, config, storage, async () => fixture("2026-08-31"));
    expect(catalog.etfs[0].snapshots.map((s) => s.as_of_date)).toEqual(["2026-09-24", "2026-08-31"]);
    catalog = await refreshCatalog(catalog, config, storage, async () => fixture("2026-09-24", 95));
    expect(catalog.etfs[0].snapshots).toHaveLength(2);
    expect(catalog.etfs[0].snapshots[0].id).toBe(id);
    expect(catalog.etfs[0].snapshots[0].partial).toBe(true);
  });
  it("rejects undated files", async () => {
    const storage = memory();
    const result = await refreshCatalog(emptyCatalog(), config, storage, async () => ({ ...fixture(), source: { kind: "csv", text: "Ticker,Name,Weight (%)\nRY,Royal Bank,100\n" } }));
    expect(result.etfs).toHaveLength(0);
    expect(result.sources[0].errors[0].error).toContain("No holdings date");
  });
  it("discovers funds from directory links without configured tickers", async () => {
    const storage = memory();
    const result = await refreshCatalog(emptyCatalog(), [{ id: "directory", label: "Directory", url: "https://issuer.example/etfs" }], storage, async (url) => url.endsWith("/etfs")
      ? { source: { kind: "html", url, text: '<html><a data-ticker="VCN" href="/VCN_holdings.csv">VCN holdings</a></html>' }, finalUrl: url, contentType: "text/html" }
      : fixture());
    expect(result.etfs[0].ticker).toBe("VCN");
    expect(result.sources[0].errors).toEqual([]);
  });
});
