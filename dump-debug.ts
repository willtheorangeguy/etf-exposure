import { fetchIssuerSource } from "./src/lib/issuer-sources.ts";
import { parseSheet } from "./src/lib/parse";
const cases: [string, string][] = [
  ["VVO", "https://www.vanguard.ca/en/product/etf/equity/9828/vanguard-global-minimum-volatility-etf"],
  ["VUS", "https://www.vanguard.ca/en/product/etf/equity/9551/vanguard-morningstar-us-total-market-index-etf-cad-hedged"],
  ["VUS-OK?", "https://www.vanguard.ca/en/product/etf/equity/9550/vanguard-ftse-developed-asia-pacific-all-cap-index-etf"],
];
async function main() {
  for (const [t, u] of cases) {
    const r = await fetchIssuerSource(u);
    const txt = (r.source as unknown as { text: string }).text;
    try {
      const p = parseSheet(r.source, { ticker: t, issuer: "Vanguard" });
      const sum = p.holdings.reduce((a, h) => a + h.weight, 0);
      const bad = p.holdings.filter((h) => h.weight > 100);
      console.log(`OK  ${t}: holdings=${p.holdings.length} sum=${sum.toFixed(3)} partial=${p.partial} over100=${bad.length}`);
      if (bad.length) console.log("  over100 rows:", JSON.stringify(bad.slice(0, 5)));
      const wover = p.holdings.filter((h) => h.weight > 99);
      if (wover.length) console.log("  >99 rows:", JSON.stringify(wover.slice(0, 6).map((h) => [h.t, h.n, h.weight])));
    } catch (e) {
      console.log(`ERR ${t}: ${(e as Error).message}`);
      // show raw rows around the problem
      const { csvRows } = await import("./src/lib/parse/csv");
      const rows = csvRows(txt);
      const big = rows.map((row, i) => [i, row[0], row[1], row[2]]).filter((x) => {
        const n = parseFloat(String(x[3] ?? ""));
        return !Number.isNaN(n) && n > 95;
      });
      console.log("  raw rows weight>95:", JSON.stringify(big.slice(0, 10)));
      console.log("  total raw rows:", rows.length);
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
