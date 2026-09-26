const WEB = "http://localhost:3000";
import { readFileSync } from "node:fs";
const raw = readFileSync(process.env.FILE);          // Buffer
const b64 = raw.toString("base64");
const bytes = Uint8Array.from(Buffer.from(b64, "base64"));
const name = "Holdings details - Vanguard FTSE Canada All Cap Index ETF - 2026-09-19.xlsx";
const file = new File([bytes], name, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
const fd = new FormData();
fd.append("file", file);

const imp = await fetch(WEB + "/api/etfs/import", { method: "POST", body: fd });
const impj = await imp.json().catch(async () => (await imp.text()));
console.log("IMPORT status", imp.status, "| holdings", impj?.holdings?.length, "| asOf", impj?.asOfDate, "| partial", impj?.partial);
if (!Array.isArray(impj?.holdings) || impj.holdings.length === 0) { console.log("IMPORT body:", JSON.stringify(impj).slice(0,400)); process.exit(1); }

const T = "ZAG";
const payload = { ticker: T, name: impj.name, issuer: impj.issuer ?? null, asOfDate: impj.asOfDate, source: "upload", sourceUrl: null, contentHash: impj.contentHash, holdings: impj.holdings, partial: impj.partial };
const save = await fetch(WEB + "/api/etfs/import/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
const savej = await save.json().catch(async () => (await save.text()));
console.log("SAVE status", save.status, "|", JSON.stringify(savej).slice(0,200));
const etfId = savej?.etfId;

const list = await (await fetch(WEB + `/api/etfs/${etfId}/snapshots`)).json();
console.log("SNAPSHOTS", JSON.stringify(list.snapshots?.map(s=>({id:s.id, n:s.holdings_count, partial:s.partial}))));
const latestAsOf = list.snapshots?.[0]?.as_of_date;
const det = await fetch(WEB + `/api/etfs/${etfId}/snapshots?as_of=${latestAsOf}`);
const detj = await det.json().catch(async () => (await det.text()));
console.log("DETAIL holdings isArray=", Array.isArray(detj?.holdings), "len", Array.isArray(detj?.holdings) ? detj.holdings.length : "N/A");

const amt = 2000;
if (Array.isArray(detj?.holdings)) {
  const ry = detj.holdings.find(h => h.t === "RY");
  console.log("CALC RY weight=" + ry?.weight, "exposure@2000 =", (amt * ry.weight)/100);
  const bad = detj.holdings.filter(h => typeof h?.weight !== "number" || !Number.isFinite(h.weight));
  console.log("bad-weight rows:", bad.length);
  const totalInv = amt; const totalExp = detj.holdings.reduce((s,h)=>s+(amt*h.weight)/100,0);
  const pct = totalInv>0 ? (totalExp/totalInv)*100 : 0;
  console.log("TOTAL invested=", totalInv, "exposed=", totalExp.toFixed(2), "sum%=" + pct.toFixed(2));
} else {
  console.log("DETAIL (not array):", JSON.stringify(detj).slice(0,300));
}
process.exit(0);
