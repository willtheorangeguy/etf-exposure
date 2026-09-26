import { describe, expect, it } from "vitest";
import { computeExposure, type Position } from "../src/lib/calc";
import type { Holding } from "../src/lib/types";

const zag: Holding[] = [
  { t: "RY", n: "Royal Bank of Canada", weight: 7.7633 },
  { t: "TD", n: "The Toronto-Dominion Bank", weight: 5.4902 },
  { t: "SHOP", n: "Shopify Inc", weight: 4.9002 },
];

const otherEtf: Holding[] = [
  { t: "RY", n: "Royal Bank of Canada", weight: 10.1 },
  { t: "ENB", n: "Enbridge Inc", weight: 3.2 },
];

describe("computeExposure", () => {
  it("single ETF: $10k x 7.7633% = $776.33", () => {
    const positions: Position[] = [{ etfId: 1, etfTicker: "ZAG", amount: 10000, asOf: "2026-08-31", partial: false }];
    const res = computeExposure(positions, { 1: zag });
    expect(res.totalInvested).toBe(10000);
    const ry = res.rows.find((r) => r.ticker === "RY")!;
    expect(ry.exposure).toBeCloseTo(776.33, 2);
    expect(ry.pctOfTotal).toBeCloseTo(7.7633, 4);
  });

  it("two ETFs overlapping stock sums correctly", () => {
    const positions: Position[] = [
      { etfId: 1, etfTicker: "ZAG", amount: 10000, asOf: "2026-08-31", partial: false },
      { etfId: 2, etfTicker: "XYZ", amount: 20000, asOf: "2026-08-31", partial: false },
    ];
    const res = computeExposure(positions, { 1: zag, 2: otherEtf });
    const ry = res.rows.find((r) => r.ticker === "RY")!;
    expect(ry.exposure).toBeCloseTo(776.33 + 2020, 2);
    expect(ry.byEtf).toHaveLength(2);
    expect(res.rows[0].ticker).toBe("RY");
  });

  it("partial sheet: exposure <= amount x sum(weights)/100 flagged", () => {
    const positions: Position[] = [{ etfId: 1, etfTicker: "ZAG", amount: 10000, asOf: "2026-08-31", partial: true }];
    const res = computeExposure(positions, { 1: zag });
    const weightSum = zag.reduce((s, h) => s + h.weight, 0);
    expect(weightSum).toBeLessThan(100);
    expect(res.totalExposed).toBeLessThanOrEqual(10000 * (weightSum / 100) + 1e-9);
    expect(res.partial).toBe(true);
  });

  it("aggregates sectors", () => {
    const holdings: Holding[] = [
      { t: "RY", n: "Royal Bank of Canada", weight: 7.7633, sector: "Financials" },
      { t: "SHOP", n: "Shopify Inc", weight: 4.9, sector: "Technology" },
    ];
    const res = computeExposure(
      [{ etfId: 1, etfTicker: "ZAG", amount: 10000, asOf: "2026-08-31", partial: false }],
      { 1: holdings }
    );
    expect(res.sectors.map((s) => s.sector).sort()).toEqual(["Financials", "Technology"]);
  });

  it("zeros for empty positions", () => {
    const res = computeExposure([], {});
    expect(res.totalInvested).toBe(0);
    expect(res.rows).toEqual([]);
  });
});
