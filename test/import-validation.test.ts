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
