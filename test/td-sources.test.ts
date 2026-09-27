import { describe, expect, it } from "vitest";
import { tdHoldingsCsv } from "../src/lib/issuer-sources";
import { parseSheet } from "../src/lib/parse";
import { refreshCatalog, emptyCatalog } from "../src/lib/static-refresh";
import type { StaticSnapshot } from "../src/lib/catalog-types";

function page(rows: unknown) {
  return `<meta name="fundCode" content="TEC"><div data-fund-title="TD Technology ETF"></div><div>Performance as of Aug 31, 2026</div><div data-top-ten-table='${JSON.stringify(rows)}'></div>`;
}
const rows = [{ label: "Company A - Common", value: "60" }, { label: "Company B - Common", value: "39.9" }, { label: "Cash", value: "0" }];
describe("TD published holdings", () => {
  it("reads more than ten positions from the modal list", () => {
    const full = Array.from({ length: 12 }, (_, i) => ({ label: `Company ${i}`, value: "8" }));
    const parsed = parseSheet({ kind: "csv", text: tdHoldingsCsv(page(full), "2026-09-27") });
    expect(parsed.holdings).toHaveLength(12);
  });
  it("imports the embedded list with the retrieval date and name identifiers", () => {
    const parsed = parseSheet({ kind: "csv", text: tdHoldingsCsv(page(rows), "2026-09-27") });
    expect(parsed.asOfDate).toBe("2026-09-27");
    expect(parsed.dateDetected).toBe(true);
    expect(parsed.holdings.map(h => h.t)).toEqual(["COMPANY A - COMMON", "COMPANY B - COMMON"]);
    expect(parsed.holdings[0].weight).toBe(60);
    expect(parsed.partial).toBe(false);
  });
  it("retains partial status and rejects excessive totals", () => {
    expect(parseSheet({ kind: "csv", text: tdHoldingsCsv(page(rows.slice(0, 1)), "2026-09-27") }).partial).toBe(true);
    expect(() => parseSheet({ kind: "csv", text: tdHoldingsCsv(page([{ label: "A", value: "101" }]), "2026-09-27") })).toThrow("rounding limit");
  });
  it("rejects missing identity, empty lists and malformed positions", () => {
    expect(() => tdHoldingsCsv("<html></html>", "2026-09-27")).toThrow("identity");
    for (const bad of [[], [{ label: "A", value: "invalid" }], [{ value: "100" }], [{ label: "A", value: "" }]]) {
      expect(() => tdHoldingsCsv(page(bad), "2026-09-27")).toThrow();
    }
  });
  it("persists retrieval provenance, deduplicates and retains data on failure", async () => {
    const files = new Map<string, StaticSnapshot>();
    const storage = { read: async (file: string) => files.get(file)!, write: async (file: string, snapshot: StaticSnapshot) => { files.set(file, snapshot); } };
    const config = [{ id: "td-tec", label: "TD TEC", issuer: "TD", ticker: "TEC", url: "https://www.td.com/ca/en/asset-management/funds/solutions/etfs/FundCard?fundId=7113" }];
    const fetcher = async () => ({ dateBasis: "retrieved" as const, finalUrl: config[0].url, contentType: "text/html", source: { kind: "csv" as const, text: tdHoldingsCsv(page(rows), "2026-09-27") } });
    const first = await refreshCatalog(emptyCatalog(), config, storage, fetcher);
    expect(first.etfs[0].snapshots[0].date_basis).toBe("retrieved");
    expect([...files.values()][0].date_basis).toBe("retrieved");
    const second = await refreshCatalog(first, config, storage, fetcher);
    expect(second.sources[0].unchanged).toBe(1);
    const failed = await refreshCatalog(second, config, storage, async () => { throw new Error("HTTP 503"); });
    expect(failed.etfs).toEqual(second.etfs);
  });
});
