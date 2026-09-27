import { readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";
import type { StaticCatalog, StaticSnapshot } from "../src/lib/catalog-types";
import { computeExposure } from "../src/lib/calc";
import type { Holding } from "../src/lib/types";

const catalog: StaticCatalog = JSON.parse(await readFile("out/data/catalog.json", "utf8"));
assert(catalog.etfs.length > 0);
for (const route of ["index.html", "etfs/index.html", "sources/index.html"]) await access(`out/${route}`);
const holdings: Record<number, Holding[]> = {};
const positions = [];
for (const etf of catalog.etfs) {
  await access(`out/etfs/${etf.id}/index.html`);
  for (const summary of etf.snapshots) {
    const snapshot: StaticSnapshot = JSON.parse(await readFile(`out/data/${summary.file}`, "utf8"));
    assert.equal(snapshot.holdings.length, summary.holdings_count);
    assert.equal(snapshot.content_hash, summary.content_hash);
    assert(snapshot.holdings.every((h) => h.weight !== 0 && Number.isFinite(h.weight)));
  }
  holdings[etf.id] = JSON.parse(await readFile(`out/data/${etf.snapshots[0].file}`, "utf8")).holdings;
  positions.push({ etfId: etf.id, etfTicker: etf.ticker, amount: 1000, asOf: etf.snapshots[0].as_of_date, partial: etf.snapshots[0].partial });
}
const result = computeExposure(positions, holdings);
assert.equal(result.totalInvested, catalog.etfs.length * 1000);
assert(result.rows.length > 100);
assert(result.rows.every((r) => Number.isFinite(r.exposure)));
const html = await readFile("out/index.html", "utf8");
assert(html.includes(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/_next/`));
console.log(`Static export verified: ${catalog.etfs.length} ETFs, ${result.rows.length} exposure rows; all snapshots and detail pages available.`);
