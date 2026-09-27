import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { cleanNumber, normalizeName, cleanTicker } from "./normalize";
import type { Holding } from "../types";

function tableRows($: cheerio.CheerioAPI, table: cheerio.Cheerio<AnyNode>): string[][] {
  const rows: string[][] = [];
  table.find("tr").each((_i, trEl) => {
    const cells: string[] = [];
    $(trEl).find("td, th").each((_j, cEl) => {
      cells.push($(cEl).text().trim());
    });
    if (cells.length > 0) rows.push(cells);
  });
  return rows;
}

function findHeaderIdx(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const lower = rows[i].map((c) => c.toLowerCase());
    const hasTicker = lower.some((c) => /\b(ticker|symbol|code)\b/.test(c));
    const hasWeight = lower.some((c) => /%|weight|market value|net asset/.test(c));
    if (hasTicker && hasWeight) return i;
  }
  return -1;
}

export function extractTable($: cheerio.CheerioAPI, url?: string): { header: string; holdings: Holding[] } | null {
  const candidates: cheerio.Cheerio<AnyNode>[] = [];
  if (url && /vanguard/i.test(url)) {
    // Prefer known Vanguard holdings table markers when present
    for (const sel of ["table.holdings", "table[data-test='holdings']", "#holdingsTable", "table.holdings-table"]) {
      if ($(sel).length) candidates.push($(sel));
    }
  }
  candidates.push($("table"));
  for (const table of candidates) {
    const rows = tableRows($, table);
    if (rows.length < 2) continue;
    const hIdx = findHeaderIdx(rows);
    if (hIdx < 0) continue;
    const headerRow = rows[hIdx];
    const ti = headerRow.findIndex((c) => /\b(ticker|symbol|code)\b/i.test(c));
    const wi = headerRow.findIndex((c) => /%|weight/.test(c));
    if (ti < 0 || wi < 0) continue;
    const ni = headerRow.findIndex((c) => /name|holding|issuer|company|security/i.test(c));
    const si = headerRow.findIndex((c) => /sector/i.test(c));
    const ri = headerRow.findIndex((c) => /region|geography/i.test(c));
    const holdings: Holding[] = [];
    for (const r of rows.slice(hIdx + 1)) {
      if (!r[ti]) continue;
      const ticker = cleanTicker(r[ti]);
      const weight = cleanNumber(r[wi]);
      if (!ticker || weight == null || weight === 0) continue;
      const h: Holding = {
        t: ticker,
        n: ni >= 0 ? normalizeName(r[ni]) : ticker,
        weight,
      };
      if (si >= 0 && r[si]) h.sector = r[si];
      if (ri >= 0 && r[ri]) h.region = r[ri];
      holdings.push(h);
    }
    if (holdings.length > 0) return { header: headerRow.join(" | "), holdings };
  }
  return null;
}

export function htmlRows(text: string): string[][] {
  const $ = cheerio.load(text);
  const t = $("table").first();
  if (!t.length) return [];
  return tableRows($, t);
}

export function detectFromHtml(text: string, url?: string): { header: string; holdings: Holding[] } | null {
  const $ = cheerio.load(text);
  return extractTable($, url);
}
