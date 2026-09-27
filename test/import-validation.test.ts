import { expect, it } from "vitest";
import { ImportSchema } from "../src/lib/import-validation";

const input = { ticker: " vcn ", name: "Example", asOfDate: "2026-08-31", source: "upload", contentHash: "12345678", partial: false, holdings: [{ t: "RY", n: "Royal Bank", weight: 100, sector: null }] };
it("normalizes ticker and optional null fields", () => {
  const parsed = ImportSchema.parse(input);
  expect(parsed.ticker).toBe("VCN");
  expect(parsed.holdings[0].sector).toBeUndefined();
});
it("rejects impossible calendar dates", () => {
  expect(ImportSchema.safeParse({ ...input, asOfDate: "2026-02-30" }).success).toBe(false);
});
it("rejects totals above the rounding tolerance", () => {
  expect(ImportSchema.safeParse({ ...input, holdings: [...input.holdings, { t: "TD", n: "TD", weight: 10 }] }).success).toBe(false);
});
it("normalizes accepted overruns without changing the input or partial tables", () => {
  const holdings = [{ t: "A", n: "Alpha", weight: 60.3 }, { t: "B", n: "Beta", weight: 40.2 }];
  const parsed = ImportSchema.parse({ ...input, holdings });
  expect(parsed.holdings.reduce((sum, h) => sum + h.weight, 0)).toBeLessThanOrEqual(100);
  expect(parsed.holdings[0].weight).toBeCloseTo(60, 10);
  expect(holdings[0].weight).toBe(60.3);
  expect(ImportSchema.parse(parsed).holdings).toEqual(parsed.holdings);
  const partial = ImportSchema.parse({ ...input, partial: true, holdings: [{ t: "A", n: "Alpha", weight: 40 }] });
  expect(partial.holdings[0].weight).toBe(40);
});
it("rejects an overrun just beyond the normalization limit", () => {
  expect(ImportSchema.safeParse({ ...input, holdings: [
    { t: "A", n: "Alpha", weight: 60 }, { t: "B", n: "Beta", weight: 40.5001 },
  ] }).success).toBe(false);
});
it("accepts a holding above 100% when negative cash offsets it", () => {
  const parsed = ImportSchema.parse({ ...input, holdings: [
    { t: "A", n: "Alpha", weight: 100.83 }, { t: "CASH.CAD", n: "Cash", weight: -0.83 },
  ] });
  expect(parsed.holdings[0].weight).toBeCloseTo(100.83, 10);
});
it("accepts negative-weight (short hedge) rows that net to 100%", () => {
  const parsed = ImportSchema.parse({ ...input, holdings: [
    { t: "EQ", n: "Equity Core", weight: 98.94 },
    { t: "USD", n: "USD Forward", weight: 1.42 },
    { t: "EUR", n: "EUR Forward", weight: -0.36 },
  ]});
  expect(parsed.holdings[2].weight).toBeCloseTo(-0.36, 4);
});
it("rejects zero weights", () => {
  expect(ImportSchema.safeParse({ ...input, holdings: [{ t: "RY", n: "Royal Bank", weight: 0 }] }).success).toBe(false);
});
it("rejects an unoffset single weight beyond the rounding limit", () => {
  expect(ImportSchema.safeParse({ ...input, holdings: [{ t: "RY", n: "Royal Bank", weight: 101 }] }).success).toBe(false);
});
