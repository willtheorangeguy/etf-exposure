import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSql } from "./db";
import { fetchIssuerSource } from "./issuer-sources";
import { parseSheet } from "./parse";
import { xlsxRows } from "./parse/xlsx";
import { csvRows } from "./parse/csv";
import { discoverLinks, tickerFromLink, tickerFromMetadata, type DownloadLink } from "./source-discovery";
import { ImportSchema } from "./import-validation";
import { upsertEtfAndSnapshot } from "./etfs";

export const SourceSchema = z.object({
  url: z.string().url().max(2000).refine((s) => /^https?:$/.test(new URL(s).protocol) && !new URL(s).username && !new URL(s).password),
  label: z.string().trim().min(1).max(200),
  issuer: z.string().trim().max(200).optional(),
  ticker: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9.\-]{0,19}$/).optional(),
  intervalDays: z.number().int().min(1).max(365).default(30),
});

export async function listSources() {
  return getSql()`select id::integer, url, label, ticker, issuer, interval_days, enabled,
    next_run_at, last_run_at, last_success_at, lease_until, report from holdings_sources order by id desc`;
}

export async function addSource(input: z.infer<typeof SourceSchema>) {
  const url = new URL(input.url); url.hash = "";
  const [row] = await getSql()`insert into holdings_sources (url,label,ticker,issuer,interval_days)
    values (${url.href},${input.label},${input.ticker ?? null},${input.issuer ?? null},${input.intervalDays})
    on conflict (url) do update set label=excluded.label,ticker=excluded.ticker,
    issuer=excluded.issuer,interval_days=excluded.interval_days,enabled=true,next_run_at=now()
    returning id::integer`;
  return row;
}

interface Report { imported: number; unchanged: number; files: number; errors: Array<{ url: string; error: string }> }

/** Claims one persisted job; a lease survives restarts and prevents overlapping workers. */
export async function refreshNextSource(): Promise<boolean> {
  const sql = getSql();
  const token = randomUUID();
  const [job] = await sql`update holdings_sources set lease_token=${token}, lease_until=now()+interval '15 minutes', last_run_at=now()
    where id=(select id from holdings_sources where enabled and next_run_at<=now()
      and (lease_until is null or lease_until<now()) order by next_run_at for update skip locked limit 1)
    returning *`;
  if (!job) return false;
  const report: Report = { imported: 0, unchanged: 0, files: 0, errors: [] };
  const queue: Array<DownloadLink & { depth: number }> = [{ url: job.url, ticker: job.ticker ?? undefined, depth: 0 }];
  const visited = new Set<string>();
  let pages = 0;
  try {
    while (queue.length && visited.size < 1000) {
      const item = queue.shift()!;
      if (visited.has(item.url)) continue;
      visited.add(item.url);
      const heartbeat = await sql`update holdings_sources set lease_until=now()+interval '15 minutes'
        where id=${job.id} and lease_token=${token} and enabled returning id`;
      if (!heartbeat.length) throw new Error("Refresh cancelled or claimed by another worker.");
      try {
        const fetched = await fetchIssuerSource(item.url);
        if (fetched.source.kind === "html") {
          if (++pages > 100) { report.errors.push({ url: item.url, error: "Page limit reached. Add narrower issuer source pages." }); break; }
          const links = discoverLinks(fetched.source.text, fetched.finalUrl);
          if (links.files.length || links.pages.length) {
            queue.push(...links.files.map((link) => ({ ...link, ticker: link.ticker ?? item.ticker, depth: item.depth })));
            if (item.depth < 2) queue.push(...links.pages.map((link) => ({ ...link, ticker: link.ticker ?? item.ticker, depth: item.depth + 1 })));
            continue;
          }
        }
        report.files++;
        const metadata = fetched.source.kind === "xlsx" ? xlsxRows(fetched.source.buffer).slice(0, 6).map((r) => r.join(" ")).join("\n")
          : fetched.source.kind === "csv" ? csvRows(fetched.source.text).slice(0, 6).map((r) => r.join(" ")).join("\n") : fetched.source.text;
        const ticker = item.ticker ?? tickerFromMetadata(metadata) ?? tickerFromLink(fetched.finalUrl);
        if (!ticker) throw new Error("ETF ticker could not be identified. Use a labelled issuer link, or register this fund's URL with a ticker once.");
        const parsed = parseSheet(fetched.source, { ticker, name: item.name, issuer: job.issuer ?? undefined });
        const unmappedIsins = parsed.holdings.filter((h) => h.isin === h.t).map((h) => h.t);
        if (unmappedIsins.length) {
          // A published ISIN can resolve a missing ticker only when the catalog agrees.
          const aliases = await sql`select h->>'isin' as isin, min(h->>'t') as ticker
            from snapshots s cross join lateral jsonb_array_elements(
              case when jsonb_typeof(s.holdings)='array' then s.holdings else '[]'::jsonb end) h
            where h->>'isin'=any(${unmappedIsins}) and h->>'t'<>h->>'isin'
            group by h->>'isin' having count(distinct h->>'t')=1`;
          const byIsin = new Map(aliases.map((a) => [a.isin, a.ticker]));
          for (const h of parsed.holdings) if (h.isin === h.t && byIsin.has(h.t)) h.t = byIsin.get(h.t)!;
        }
        if (!parsed.dateDetected) throw new Error("No holdings date found. Automatic imports require a date in the sheet.");
        const validated = ImportSchema.parse({ ...parsed, name: parsed.name ?? ticker, source: "url", sourceUrl: fetched.finalUrl });
        const saved = await upsertEtfAndSnapshot(validated);
        if (saved.status === "duplicate") report.unchanged++; else report.imported++;
      } catch (err) {
        report.errors.push({ url: item.url, error: (err as Error).message.slice(0, 1000) });
      }
    }
    if (queue.length) report.errors.push({ url: job.url, error: "Discovery limit reached; add narrower issuer source pages." });
    if (!report.files && !report.errors.length) report.errors.push({ url: job.url, error: "No holdings downloads found." });
  } catch (err) {
    report.errors.push({ url: job.url, error: (err as Error).message });
  }
  const success = report.errors.length === 0;
  await sql`update holdings_sources set report=${sql.json({ ...report })},lease_token=null,lease_until=null,
    last_success_at=case when ${success} then now() else last_success_at end,
    next_run_at=now()+(${success ? job.interval_days : 1} * interval '1 day')
    where id=${job.id} and lease_token=${token}`;
  console.log(`Source ${job.id}: ${report.imported} saved, ${report.unchanged} unchanged, ${report.errors.length} issues.`);
  return true;
}
