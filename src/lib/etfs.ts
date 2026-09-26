import { getSql } from "./db";
import type { Holding } from "./types";
import { createHash } from "node:crypto";

export interface EtfListRow {
  id: number;
  ticker: string;
  name: string;
  issuer: string | null;
  snapshot_count: number;
  latest_as_of: string | null;
}

export async function searchEtfs(q?: string): Promise<EtfListRow[]> {
  const sql = getSql();
  const rows: Array<{
    id: string | number;
    ticker: string;
    name: string;
    issuer: string | null;
    snapshot_count: string | number;
    latest_as_of: string | null;
  }> = q && q.trim()
    ? await sql`
        select e.id, e.ticker, e.name, e.issuer,
               count(s.id) as snapshot_count,
               max(s.as_of_date)::text as latest_as_of
        from etfs e
        left join snapshots s on s.etf_id = e.id
        where e.ticker ilike ${`%${q.trim()}%`} or e.name ilike ${`%${q.trim()}%`}
        group by e.id
        order by (case when e.ticker ilike ${`${q.trim()}%`} then 0 else 1 end), e.ticker
        limit 50
      `
    : await sql`
        select e.id, e.ticker, e.name, e.issuer,
               count(s.id) as snapshot_count,
               max(s.as_of_date)::text as latest_as_of
        from etfs e
        left join snapshots s on s.etf_id = e.id
        group by e.id
        order by e.ticker
        limit 200
      `;
  return rows.map((r) => ({
    id: Number(r.id),
    ticker: r.ticker,
    name: r.name,
    issuer: r.issuer,
    snapshot_count: Number(r.snapshot_count),
    latest_as_of: r.latest_as_of,
  }));
}

export interface SnapshotSummary {
  id: number;
  as_of_date: string;
  source: string;
  source_url: string | null;
  created_at: string;
  partial: boolean;
  holdings_count: number;
}

export async function listSnapshots(etfId: number): Promise<SnapshotSummary[]> {
  const sql = getSql();
  const rows: Array<{
    id: string | number;
    as_of_date: string;
    source: string;
    source_url: string | null;
    created_at: Date;
    partial: boolean;
    holdings_count: string | number;
  }> = await sql`
    select s.id, s.as_of_date::text as as_of_date, s.source, s.source_url,
           s.created_at, s.partial, jsonb_array_length(s.holdings) as holdings_count
    from snapshots s
    where s.etf_id = ${etfId}
    order by s.as_of_date desc, s.created_at desc
  `;
  return rows.map((r) => ({
    id: Number(r.id),
    as_of_date: r.as_of_date,
    source: r.source,
    source_url: r.source_url,
    created_at: r.created_at.toISOString(),
    partial: r.partial,
    holdings_count: Number(r.holdings_count),
  }));
}

export interface SnapshotFull {
  id: number;
  as_of_date: string;
  source: string;
  source_url: string | null;
  created_at: string;
  partial: boolean;
  content_hash: string;
  holdings: unknown[];
}

export async function getSnapshotLatest(etfId: number, asOf?: string): Promise<SnapshotFull | null> {
  const sql = getSql();
  const rows: Array<{
    id: string | number;
    as_of_date: string;
    source: string;
    source_url: string | null;
    created_at: Date;
    partial: boolean;
    content_hash: string;
    holdings: unknown[];
  }> = asOf
    ? await sql`
        select s.id, s.as_of_date::text as as_of_date, s.source, s.source_url, s.created_at,
               s.partial, s.content_hash, s.holdings
        from snapshots s
        where s.etf_id = ${etfId} and s.as_of_date::text = ${asOf}
      `
    : await sql`
        select s.id, s.as_of_date::text as as_of_date, s.source, s.source_url, s.created_at,
               s.partial, s.content_hash, s.holdings
        from snapshots s
        where s.etf_id = ${etfId}
        order by s.as_of_date desc, s.created_at desc
        limit 1
      `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: Number(r.id),
    as_of_date: r.as_of_date,
    source: r.source,
    source_url: r.source_url,
    created_at: r.created_at.toISOString(),
    partial: r.partial,
    content_hash: r.content_hash,
    holdings: r.holdings,
  };
}

export async function getEtfById(id: number) {
  const sql = getSql();
  const rows: Array<{ id: string | number; ticker: string; name: string; issuer: string | null }> =
    await sql`select id, ticker, name, issuer from etfs where id = ${id}`;
  if (rows.length === 0) return null;
  return { id: Number(rows[0].id), ticker: rows[0].ticker, name: rows[0].name, issuer: rows[0].issuer };
}

export async function getEtfByTicker(ticker: string) {
  const sql = getSql();
  const rows: Array<{ id: string | number; ticker: string; name: string; issuer: string | null }> =
    await sql`select id, ticker, name, issuer from etfs where ticker = ${ticker.trim().toUpperCase()}`;
  if (rows.length === 0) return null;
  return { id: Number(rows[0].id), ticker: rows[0].ticker, name: rows[0].name, issuer: rows[0].issuer };
}

export interface UpsertInput {
  ticker: string;
  name: string;
  issuer?: string | null;
  asOfDate: string;
  source: "url" | "upload";
  sourceUrl?: string | null;
  contentHash: string;
  holdings: Holding[];
  partial: boolean;
}

export interface UpsertResult {
  etfId: number;
  ticker: string;
  name: string;
  status: "created" | "updated" | "duplicate";
  snapshotId: number;
  asOfDate: string;
}

export async function upsertEtfAndSnapshot(input: UpsertInput): Promise<UpsertResult> {
  const holdings = input.holdings.map((h) => ({ ...h })).sort((a, b) => a.t.localeCompare(b.t));
  // Hash the validated contents on the server, never trust a submitted hash.
  const contentHash = createHash("sha256").update(JSON.stringify(holdings)).digest("hex");
  return getSql().begin(async (sql) => {
  const ticker = input.ticker.trim().toUpperCase();
  // Upsert locks the ETF row until commit, serializing concurrent imports.
  const [etf] = await sql`
    insert into etfs (ticker, name, issuer)
    values (${ticker}, ${input.name}, ${input.issuer ?? null})
    on conflict (ticker) do update set name = excluded.name,
      issuer = coalesce(excluded.issuer, etfs.issuer)
    returning id, name
  `;
  const etfId = Number(etf.id);
  const etfName = String(etf.name);

  const existing = await sql`
    select id, content_hash, partial, jsonb_typeof(holdings) as holdings_type from snapshots
    where etf_id = ${etfId} and as_of_date::text = ${input.asOfDate}
  `;
  if (existing.length > 0) {
    if (existing[0].content_hash === contentHash && existing[0].partial === input.partial && existing[0].holdings_type === "array") {
      return { etfId, ticker, name: etfName, status: "duplicate", snapshotId: Number(existing[0].id), asOfDate: input.asOfDate };
    }
    const [upd] = await sql`
      update snapshots
      set source = ${input.source},
           source_url = ${input.sourceUrl ?? null},
            content_hash = ${contentHash},
            holdings = ${sql.json(holdings)}::jsonb,
           partial = ${input.partial}
      where id = ${existing[0].id}
      returning id
    `;
    return { etfId, ticker, name: etfName, status: "updated", snapshotId: Number(upd.id), asOfDate: input.asOfDate };
  }
  const [row] = await sql`
    insert into snapshots (etf_id, as_of_date, source, source_url, content_hash, holdings, partial)
    values (${etfId}, ${input.asOfDate}::date, ${input.source}, ${input.sourceUrl ?? null},
             ${contentHash}, ${sql.json(holdings)}::jsonb, ${input.partial})
    returning id
  `;
  return { etfId, ticker, name: etfName, status: "created", snapshotId: Number(row.id), asOfDate: input.asOfDate };
  }) as Promise<UpsertResult>;
}
