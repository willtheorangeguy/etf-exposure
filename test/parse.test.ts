import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSheet, ParseError } from "../src/lib/parse";

const fixtures = join(__dirname, "fixtures");

describe("parseSheet pipeline", () => {
  it("keeps small explicit percentage weights as percentages", () => {
    const t = parseSheet({ kind: "csv", text: "Ticker,Name,% weight\nA,Alpha,0.5\nB,Beta,0.25" });
    expect(t.holdings.map((h) => h.weight)).toEqual([0.5, 0.25]);
    expect(t.partial).toBe(true);
  });

  it("corrects small overruns before hashing and keeps relative weights", () => {
    const source = { kind: "csv" as const, text: "Ticker,Name,% weight\nA,Alpha,60.3\nB,Beta,40.2" };
    const parsed = parseSheet(source);
    expect(parsed.holdings.reduce((sum, h) => sum + h.weight, 0)).toBeLessThanOrEqual(100);
    expect(parsed.holdings[0].weight).toBeCloseTo(60, 10);
    expect(parsed.holdings[1].weight).toBeCloseTo(40, 10);
    expect(parsed.partial).toBe(false);
    expect(parsed.contentHash).toBe(parseSheet(source).contentHash);
  });

  it("rejects overruns beyond half a percentage point", () => {
    expect(() => parseSheet({ kind: "csv", text: "Ticker,Name,% weight\nA,Alpha,60\nB,Beta,40.5001" }))
      .toThrow(/100.5% rounding limit/);
  });

  it("retains holdings above 100% when negative offsets balance them", () => {
    const parsed = parseSheet({ kind: "csv", text: "Ticker,Name,% weight\nA,Alpha,109.49\nOPT,Option,-9.36\nCASH,Cash,-0.13" });
    expect(parsed.holdings.find((h) => h.t === "A")?.weight).toBeCloseTo(109.49, 10);
    expect(parsed.holdings.reduce((sum, h) => sum + h.weight, 0)).toBeCloseTo(100, 10);
  });

  it("does not treat market values as percentage weights", () => {
    expect(() => parseSheet({ kind: "csv", text: "Ticker,Name,Market value\nA,Alpha,12345" })).toThrow(ParseError);
  });

  it("selects weights when market value precedes the weight column", () => {
    const t = parseSheet({ kind: "csv", text: "Ticker,Name,Market value,% weight\nA,Alpha,12345,100" });
    expect(t.holdings[0].weight).toBe(100);
    expect(t.partial).toBe(false);
  });
  it("parses the Vanguard ZAG top-10 XLSX fixture", () => {
    const buf = readFileSync(join(fixtures, "vanguard-zag.top10.xlsx"));
    const t = parseSheet({ kind: "xlsx", buffer: buf }, { url: "https://example.test/zag.xlsx" });
    expect(t.asOfDate).toBe("2026-08-31");
    expect(t.partial).toBe(true);
    expect(t.holdings.length).toBeGreaterThan(3);
    const ry = t.holdings.find((h) => h.t === "RY")!;
    expect(ry.weight).toBeCloseTo(7.7633, 4);
    expect(ry.mv).toBeCloseTo(1382499734.2, 0);
    expect(ry.shares).toBe(4878263);
    const td = t.holdings.find((h) => h.t === "TD")!;
    expect(td.n).toBe("The Toronto-Dominion Bank");
    expect(t.holdings.every((h, i, a) => a[i - 1] == null || a[i - 1].t <= h.t)).toBe(true);
  });

  it("parses a CSV with fraction-style weights (no % in header -> x100)", () => {
    const csv = "Ticker,Name,weight\nRY, Royal Bank ,0.077633\nTD,TD Bank,0.054902\n";
    const t = parseSheet({ kind: "csv", text: csv });
    expect(t.holdings.map((h) => h.t)).toEqual(["RY", "TD"]);
    expect(t.holdings[0].weight).toBeCloseTo(7.7633, 4);
  });

  it("parses a CSV with percent weights (max <= 1.5 rule: 7.76 > 1.5 so scale 1)", () => {
    const csv = "Ticker,Name,% weight\nRY, Royal Bank ,7.76\nTD,TD Bank,0.5\n";
    const t = parseSheet({ kind: "csv", text: csv });
    expect(t.holdings[0].weight).toBeCloseTo(7.76, 4);
    expect(t.holdings[1].weight).toBeCloseTo(0.5, 4);
  });

  it("parses the Vanguard-style HTML fixture", () => {
    const html = readFileSync(join(fixtures, "sample.html"), "utf8");
    const t = parseSheet({ kind: "html", text: html }, { url: "https://vanguard.example/etf/zag/holdings" });
    expect(asOfFrom(t)).toBeDefined();
    expect(t.partial).toBe(true);
    expect(t.holdings.find((h) => h.t === "RY")!.weight).toBeCloseTo(7.7633, 4);
    expect(t.holdings.find((h) => h.t === "TD")!.n).toBe("The Toronto-Dominion Bank");
  });

  it("keeps negative-weight (short hedge) rows that net to 100%", () => {
    const csv = "Ticker,Name,% weight\nEQ,Equity Core,99.0\nUSD,USD Forward Long,-0.42\nCAD,CAD Forward Long,1.42\nEUR,FX Forward Short,-0.12\nCAD,CAD Forward Long,0.12\n";
    const t = parseSheet({ kind: "csv", text: csv });
    expect(t.holdings.length).toBe(5);
    expect(t.holdings.find((h) => h.t === "EUR")!.weight).toBeCloseTo(-0.12, 4);
    const total = t.holdings.reduce((s, h) => s + h.weight, 0);
    expect(total).toBeCloseTo(100, 3);
    expect(t.partial).toBe(false);
  });

  it("rejects input without a recognizable header", () => {
    expect(() => parseSheet({ kind: "csv", text: "a,b,c\n1,2,3\n" })).toThrow(ParseError);
  });

  it("stable content hash: same holdings -> same hash", () => {
    const csv = "Ticker,Name,weight\nRY, Royal Bank ,7.7633\nTD,TD Bank,5.4902\n";
    const a = parseSheet({ kind: "csv", text: csv });
    const b = parseSheet({ kind: "csv", text: csv });
    expect(a.contentHash).toBe(b.contentHash);
    expect(a.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });
});

function asOfFrom(t: { asOfDate: string }) {
  return /^\d{4}-\d{2}-\d{2}$/.test(t.asOfDate) ? t.asOfDate : undefined;
}
