import { createHash } from "node:crypto";
import { z } from "zod";
import { fetchIssuerSource } from "./issuer-sources";
import { discoverLinks, tickerFromLink, tickerFromMetadata, type DownloadLink } from "./source-discovery";
import { parseSheet } from "./parse";
import { xlsxRows } from "./parse/xlsx";
import { csvRows } from "./parse/csv";
import { ImportSchema } from "./import-validation";
import type { StaticCatalog, StaticSnapshot } from "./catalog-types";

export const SourcesConfig = z.array(z.object({
  id: z.string().regex(/^[a-z0-9-]+$/), label: z.string().min(1),
  url: z.string().url().refine((s) => /^https?:\/\//.test(s)),
  issuer: z.string().optional(), ticker: z.string().regex(/^[A-Z][A-Z0-9.\-]{0,19}$/).optional(),
  name: z.string().trim().min(1).max(500).optional(),
})).min(1).refine((items) => new Set(items.map((s) => s.id)).size === items.length, "Source ids must be unique");

export function emptyCatalog(): StaticCatalog { return { version: 1, generated_at: new Date().toISOString(), etfs: [], sources: [] }; }

interface Storage {
  read: (file: string) => Promise<StaticSnapshot>;
  write: (file: string, snapshot: StaticSnapshot) => Promise<void>;
}

/** Never removes a previous snapshot when an issuer fails or disappears. */
export async function refreshCatalog(previous: StaticCatalog, config: z.infer<typeof SourcesConfig>, storage: Storage,
  fetcher = fetchIssuerSource, now = new Date().toISOString()): Promise<StaticCatalog> {
  const catalog: StaticCatalog = structuredClone(previous);
  catalog.generated_at = now;
  catalog.sources = [];
  const aliases = new Map<string, Set<string>>();
  const learnAliases = (holdings: StaticSnapshot["holdings"]) => {
    for (const h of holdings) if (h.isin && h.t !== h.isin) {
      const ticks = aliases.get(h.isin) ?? new Set<string>(); ticks.add(h.t); aliases.set(h.isin, ticks);
    }
  };
  for (const etf of catalog.etfs) for (const snapshot of etf.snapshots) learnAliases((await storage.read(snapshot.file)).holdings);
  for (const source of config) {
    const report = { id: source.id, label: source.label, url: source.url, last_checked_at: now,
      last_success_at: previous.sources.find((s) => s.id === source.id)?.last_success_at ?? null,
      imported: 0, unchanged: 0, errors: [] as Array<{url:string;error:string}> };
    const queue: Array<DownloadLink & {depth:number}> = [{ url: source.url, ticker: source.ticker, name: source.name, depth: 0 }];
    const visited = new Set<string>();
    let pages = 0;
    while (queue.length && visited.size < 1000) {
      const item = queue.shift()!;
      if (visited.has(item.url)) continue;
      visited.add(item.url);
      try {
        const fetched = await fetcher(item.url);
        if (fetched.source.kind === "html") {
          if (++pages > 100) throw new Error("Page limit reached. Add narrower issuer sources.");
          const links = discoverLinks(fetched.source.text, fetched.finalUrl);
          if (links.files.length || links.pages.length) {
            queue.push(...links.files.map((link) => ({ ...link, ticker: link.ticker ?? item.ticker, name: link.name ?? item.name, depth: item.depth })));
            if (item.depth < 2) queue.push(...links.pages.map((link) => ({ ...link, depth: item.depth + 1 })));
            continue;
          }
          throw new Error("No holdings downloads found. Use a supported issuer product page or a direct CSV/XLSX link.");
        }
        const rows = fetched.source.kind === "xlsx" ? xlsxRows(fetched.source.buffer) : csvRows(fetched.source.text);
        const metadata = rows.slice(0, 6).map((r) => r.join(" ")).join("\n");
        const ticker = item.ticker ?? tickerFromMetadata(metadata) ?? tickerFromLink(fetched.finalUrl);
        if (!ticker) throw new Error("ETF ticker not identified. Set ticker in the source configuration for this fund.");
        const parsed = parseSheet(fetched.source, { ticker, name: item.name, issuer: source.issuer });
        if (!parsed.dateDetected) throw new Error("No holdings date found; last good snapshot retained.");
        for (const h of parsed.holdings) if (h.isin === h.t && aliases.get(h.t)?.size === 1) h.t = [...aliases.get(h.t)!][0];
        const input = ImportSchema.parse({ ...parsed, name: parsed.name ?? ticker, source: "url", sourceUrl: fetched.finalUrl });
        const holdings = input.holdings.sort((a,b) => a.t.localeCompare(b.t));
        learnAliases(holdings);
        const hash = createHash("sha256").update(JSON.stringify(holdings)).digest("hex");
        let etf = catalog.etfs.find((e) => e.ticker === ticker);
        if (!etf) {
          etf = { id: Math.max(0,...catalog.etfs.map((e) => e.id)) + 1, ticker, name: input.name, issuer: input.issuer ?? null, snapshots: [] };
          catalog.etfs.push(etf);
        }
        const latestDate = etf.snapshots[0]?.as_of_date;
        if (!latestDate || input.asOfDate >= latestDate) { etf.name = input.name; etf.issuer = input.issuer ?? etf.issuer; }
        const existing = etf.snapshots.find((s) => s.as_of_date === input.asOfDate);
        if (existing?.content_hash === hash && existing.partial === input.partial) { report.unchanged++; continue; }
        const file = `etfs/${ticker}/${input.asOfDate}.json`;
        const snapshot: StaticSnapshot = { id: existing?.id ?? Math.max(0,...etf.snapshots.map((s) => s.id)) + 1,
          as_of_date: input.asOfDate, source: "url", source_url: fetched.finalUrl, created_at: existing?.created_at ?? now,
          partial: input.partial, content_hash: hash, holdings };
        await storage.write(file, snapshot);
        const { holdings: unused, ...summary } = snapshot;
        void unused;
        etf.snapshots = [...etf.snapshots.filter((s) => s.as_of_date !== input.asOfDate),
          { ...summary, holdings_count: holdings.length, file }].sort((a,b) => b.as_of_date.localeCompare(a.as_of_date));
        report.imported++;
      } catch (err) { report.errors.push({url:item.url,error:(err as Error).message.slice(0,1000)}); }
      if (pages > 100) break;
    }
    if (queue.length) report.errors.push({url:source.url,error:"Discovery limit reached. Add narrower issuer sources."});
    if (!report.errors.length) report.last_success_at = now;
    catalog.sources.push(report);
  }
  catalog.etfs.sort((a,b) => a.ticker.localeCompare(b.ticker));
  return catalog;
}
