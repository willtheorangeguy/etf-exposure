import assert from "node:assert/strict";
import { fetchIssuerSource } from "../src/lib/issuer-sources";
import { parseSheet } from "../src/lib/parse";
import { tickerFromLink } from "../src/lib/source-discovery";
import { computeExposure } from "../src/lib/calc";
const urls = [
  "https://www.vanguard.ca/en/product/etf/equity/9561/vanguard-ftse-canada-all-cap-index-etf",
  "https://df.bmogam.com/assets/static/reports/etf-funds-holdings/Holdings_Extract_en_US_ZCN_20260924.xlsx",
  "https://www.blackrock.com/ca/investors/en/products/309480/fund/1464253357814.ajax?fileType=csv&fileName=XEQT_holdings&dataType=fund",
];
async function main() {
const parsed = await Promise.all(urls.map(async (url) => {
  const fetched = await fetchIssuerSource(url);
  const data = parseSheet(fetched.source, { ticker: tickerFromLink(url) });
  assert.ok(data.dateDetected);
  assert.ok(data.holdings.length > 100);
  const total = data.holdings.reduce((sum, h) => sum + h.weight, 0);
  assert.ok(total <= 105 && total > 85, `Unexpected weight total: ${total}`);
  console.log(url, data.holdings.length, data.asOfDate, total.toFixed(4));
  return data;
}));
assert.ok(parsed[2].holdings.some((h) => h.t === "NVDA"));
assert.ok(!parsed[2].holdings.some((h) => h.t === "XIC"));
const result = computeExposure(parsed.slice(0,2).map((p, i) => ({ etfId:i,etfTicker:i===0?"VCN":"ZCN",amount:10000,asOf:p.asOfDate,partial:p.partial })), {0:parsed[0].holdings,1:parsed[1].holdings});
const ry = result.rows.find((h) => h.ticker === "RY");
assert.equal(ry?.byEtf.length,2);
console.log("PASS: all three issuer sources parsed; Vanguard and BMO Royal Bank exposures merged by ISIN.");
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
