import { describe, expect, it } from "vitest";
import { cleanNumber, normalizeName, extractAsOf } from "../src/lib/parse/normalize";

describe("cleanNumber", () => {
  it("strips %, commas, $ and spaces", () => {
    expect(cleanNumber("7.7633%")).toBe(7.7633);
    expect(cleanNumber("$1,382,499,734.20")).toBe(1382499734.2);
    expect(cleanNumber(" 4,878,263 ")).toBe(4878263);
    expect(cleanNumber("0.077633")).toBe(0.077633);
  });
  it("handles negatives and accounting parens", () => {
    expect(cleanNumber("-5.5")).toBe(-5.5);
    expect(cleanNumber("(100)")).toBe(-100);
  });
  it("returns undefined for garbage", () => {
    expect(cleanNumber("n/a")).toBeUndefined();
    expect(cleanNumber("")).toBeUndefined();
    expect(cleanNumber(null)).toBeUndefined();
  });
});

describe("normalizeName", () => {
  it("fixes trailing /The (Vanguard quirk)", () => {
    expect(normalizeName("Toronto-Dominion Bank/The")).toBe("The Toronto-Dominion Bank");
    expect(normalizeName("Bank of Nova Scotia/The")).toBe("The Bank of Nova Scotia");
  });
  it("trims and leaves normal names alone", () => {
    expect(normalizeName("  Shopify Inc ")).toBe("Shopify Inc");
    expect(normalizeName("Royal Bank of Canada")).toBe("Royal Bank of Canada");
  });
});

describe("extractAsOf", () => {
  it("prefers 'as at' lines over download dates", () => {
    const text = "This file was downloaded on Sep 19 2026\nTop 10 Holdings\nAs at Aug 31 2026";
    expect(extractAsOf(text)).toBe("2026-08-31");
  });
  it("reads day-first British style", () => {
    expect(extractAsOf("As at 31 August 2026")).toBe("2026-08-31");
  });
  it("reads ISO dates", () => {
    expect(extractAsOf("As of 2026-08-31")).toBe("2026-08-31");
  });
  it("falls back to any date mention", () => {
    expect(extractAsOf("downloaded Sep 19 2026")).toBe("2026-09-19");
  });
  it("returns undefined when no date found", () => {
    expect(extractAsOf("Top 10 Holdings")).toBeUndefined();
  });
});
