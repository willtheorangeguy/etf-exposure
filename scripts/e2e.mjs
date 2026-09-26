// E2E against a running docker compose stack (or any local instance).
// Steps: serve fixture, import preview, save snapshot, verify dedup, calc math.
// Usage: docker compose up -d --build   (wait for :3000)   ->   npm run e2e
import { readFileSync } from "node:fs";
import http from "node:http";
import { fileURLToPath } from "node:url";

const WEB = process.env.WEB ?? "http://localhost:3000";
// Inside the web container, "localhost" is the container itself; route to host via host.docker.internal.
const HOST_FIX = process.env.FIXTURE_URL ?? "http://host.docker.internal:9000/vanguard-zag.top10.xlsx";
const FILE = fileURLToPath(new URL("../test/fixtures/vanguard-zag.top10.xlsx", import.meta.url));

let failed = false;
function check(name, cond, extra = "") {
  const ok = !!cond;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failed = true;
}

const fileBuf = readFileSync(FILE);
const staticSrv = http.createServer((req, res) => {
  if (req.url.endsWith(".xlsx")) {
    res.writeHead(200, {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-length": fileBuf.length,
    });
    res.end(fileBuf);
  } else {
    res.writeHead(404);
    res.end();
  }
});

async function postJson(path, body) {
  const r = await fetch(`${WEB}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const txt = await r.text();
  let json;
  try { json = txt ? JSON.parse(txt) : null; } catch { json = txt; }
  return { status: r.status, body: json };
}

await new Promise((resolve) => staticSrv.listen(9000, resolve));
console.log("fixture static server on :9000");
try {
  // 1. import preview via URL
  const imp = await postJson("/api/etfs/import", { url: HOST_FIX });
  check("import preview: 200", imp.status === 200, `status=${imp.status} ${JSON.stringify(imp.body).slice(0, 120)}`);
  check("import preview: has holdings", Array.isArray(imp.body?.holdings) && imp.body.holdings.length >= 3, `${imp.body?.holdings?.length} rows`);
  check("import preview: as-of date", imp.body?.asOfDate === "2026-08-31", String(imp.body?.asOfDate));
  check("import preview: partial flag", imp.body?.partial === true);
  const T = process.env.TEST_TICKER ?? "E2E";

  // 2. catalog endpoint works
  const search = await (await fetch(`${WEB}/api/etfs?q=${T}`)).json();
  check("catalog search endpoint", Array.isArray(search.etfs));

  // 3. save snapshot
  const payload = {
    ticker: T,
    name: imp.body?.name ?? "ZAG ETF",
    issuer: imp.body?.issuer ?? null,
    asOfDate: imp.body?.asOfDate,
    source: "url",
    sourceUrl: HOST_FIX,
    contentHash: imp.body?.contentHash,
    holdings: imp.body?.holdings,
    partial: imp.body?.partial,
  };
  const save = await postJson("/api/etfs/import/save", payload);
  check("save snapshot succeeds", [200, 201].includes(save.status), JSON.stringify(save.body).slice(0, 120));
  const etfId = save.body?.etfId;

  // 4. catalog lists it
  const found = await (await fetch(`${WEB}/api/etfs?q=${T}`)).json();
  const row = found.etfs.find((e) => e.ticker === T);
  check("catalog lists etf", !!row && Number(row.snapshot_count) === 1, JSON.stringify(row));
  check("latest as-of matches", row?.latest_as_of === "2026-08-31", String(row?.latest_as_of));

  // 5. full holdings round-trip
  const full = await (await fetch(`${WEB}/api/etfs/${etfId}/snapshots?as_of=${imp.body?.asOfDate}`)).json();
  check("full snapshot round-trip", full.holdings.length === imp.body.holdings.length, `${full.holdings.length} vs ${imp.body.holdings.length}`);

  // 6. repeat same payload -> 200 duplicate
  const again = await postJson("/api/etfs/import/save", payload);
  check("repeat save: 200 duplicate", again.status === 200 && again.body?.status === "duplicate", JSON.stringify(again.body).slice(0, 120));

  // 7. snapshot history list
  const hist = await (await fetch(`${WEB}/api/etfs/${etfId}/snapshots`)).json();
  check("snapshot history", hist.snapshots.length === 1 && hist.snapshots[0].partial === true, JSON.stringify(hist.snapshots));

  // 8. calc math against returned holdings (same formula as src/lib/calc.ts)
  const ry = full.holdings.find((h) => h.t === "RY");
  const expected = (10000 * ry.weight) / 100;
  check("calc math: $10k x RY weight = $776.33", Math.abs(expected - 776.33) < 0.01, `$${expected}`);
  const sum = full.holdings.reduce((s, h) => s + h.weight, 0);
  check("partial sheet: weight sum < 100", sum < 100, `sum=${sum.toFixed(2)}`);
} finally {
  staticSrv.close();
}
console.log(failed ? "\nE2E FAILED" : "\nE2E GREEN");
process.exit(failed ? 1 : 0);
