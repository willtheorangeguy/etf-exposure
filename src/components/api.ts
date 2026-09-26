import type { Holding } from "@/lib/types";
import { getCatalog, getStaticSnapshot } from "@/lib/catalog-client";

export interface EtfLite {
  id: number;
  ticker: string;
  name: string;
  issuer: string | null;
  snapshot_count: number;
  latest_as_of: string | null;
}

export interface SnapSummary {
  id: number;
  as_of_date: string;
  source: string;
  source_url: string | null;
  created_at: string;
  partial: boolean;
  holdings_count: number;
}

export interface SnapFull {
  id: number;
  as_of_date: string;
  source: string;
  source_url: string | null;
  created_at: string;
  partial: boolean;
  content_hash: string;
  holdings: Holding[];
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = new URL(path,"https://catalog.local");
  const catalog = await getCatalog();
  const lite = (e: typeof catalog.etfs[number]): EtfLite => ({id:e.id,ticker:e.ticker,name:e.name,issuer:e.issuer,snapshot_count:e.snapshots.length,latest_as_of:e.snapshots[0]?.as_of_date ?? null});
  if (url.pathname === "/api/etfs") {
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    return {etfs:catalog.etfs.filter((e)=>`${e.ticker} ${e.name}`.toLowerCase().includes(q)).map(lite)} as T;
  }
  const id = /^\/api\/etfs\/(\d+)\/snapshots$/.exec(url.pathname)?.[1];
  const etf = catalog.etfs.find((e)=>e.id===Number(id));
  if (!etf) throw new Error("ETF not found in the catalog.");
  if (url.searchParams.has("latest") || url.searchParams.has("as_of")) {
    const snapshot = url.searchParams.has("latest") ? etf.snapshots[0] : etf.snapshots.find((s)=>s.as_of_date===url.searchParams.get("as_of"));
    if (!snapshot) throw new Error("Snapshot not found.");
    return await getStaticSnapshot(snapshot.file) as T;
  }
  return {etf:lite(etf),snapshots:etf.snapshots} as T;
}

export function fmtMoney(n: number, currency = "CAD"): string {
  return n.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 2 });
}

export function fmtPct(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%";
}
