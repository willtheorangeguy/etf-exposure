import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { computeExposure } from '../src/lib/calc.ts';

const web = process.env.WEB ?? 'http://localhost:3000';
const filePath = process.env.HOLDINGS_FILE ?? '../Holdings details - Vanguard FTSE Canada All Cap Index ETF - 2026-09-19.xlsx';
const ticker = process.env.ETF_TICKER ?? 'VCN';
async function json(path, init) {
  const response = await fetch(`${web}${path}`, init);
  const body = await response.json();
  assert.ok(response.ok, `${path}: ${JSON.stringify(body)}`);
  return body;
}
const form = new FormData();
form.append('file', new File([await readFile(filePath)], filePath.split(/[\\/]/).pop()));
const preview = await json('/api/etfs/import', { method: 'POST', body: form });
assert.ok(preview.holdings.length > 100);
assert.equal(preview.asOfDate, '2026-08-31');
const payload = { ...preview, ticker, name: preview.name, issuer: 'Vanguard' };
const save = () => json('/api/etfs/import/save', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
});
const saved = await save();
const duplicate = await save();
assert.equal(duplicate.status, 'duplicate');
const concurrent = await Promise.all([save(), save(), save()]);
assert.ok(concurrent.every((result) => result.status === 'duplicate'));
const search = await json(`/api/etfs?q=${ticker}`);
assert.ok(search.etfs.some((etf) => etf.id === saved.etfId));
const snapshot = await json(`/api/etfs/${saved.etfId}/snapshots?latest=1`);
assert.ok(Array.isArray(snapshot.holdings));
assert.deepEqual(snapshot.holdings, preview.holdings);
const result = computeExposure([
  { etfId: saved.etfId, etfTicker: ticker, amount: 10000, asOf: snapshot.as_of_date, partial: snapshot.partial },
], { [saved.etfId]: snapshot.holdings });
assert.ok(result.rows.length > 100);
assert.ok(Math.abs(result.rows.find((h) => h.ticker === 'RY').exposure - 776.33) < 0.001);
console.log(`PASS: uploaded, saved, searched and calculated ${snapshot.holdings.length} holdings for ${ticker}. RY exposure on CAD 10,000: CAD 776.33. Total attributed: CAD ${result.totalExposed.toFixed(2)}.`);
