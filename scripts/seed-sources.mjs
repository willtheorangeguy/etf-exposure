import assert from 'node:assert/strict';
const web = process.env.WEB ?? 'http://localhost:3000';
const seeds = [
  { label: 'Vanguard Canada — VCN', issuer: 'Vanguard', url: 'https://www.vanguard.ca/en/product/etf/equity/9561/vanguard-ftse-canada-all-cap-index-etf' },
  { label: 'BMO — ZCN', issuer: 'BMO', url: 'https://df.bmogam.com/assets/static/reports/etf-funds-holdings/Holdings_Extract_en_US_ZCN_20260924.xlsx' },
  { label: 'iShares — XEQT', issuer: 'iShares', url: 'https://www.blackrock.com/ca/investors/en/products/309480/fund/1464253357814.ajax?fileType=csv&fileName=XEQT_holdings&dataType=fund' },
];
for (const source of seeds) {
  const response = await fetch(`${web}/api/sources`, { method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...source,intervalDays:30}) });
  const body = await response.json(); assert.ok(response.ok, JSON.stringify(body));
  console.log(`Queued ${source.label} as source ${body.id}`);
}
