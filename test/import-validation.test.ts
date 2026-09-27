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
it("rejects single weights above 100", () => {
  expect(ImportSchema.safeParse({ ...input, holdings: [{ t: "RY", n: "Royal Bank", weight: 101 }] }).success).toBe(false);
});
