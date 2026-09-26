import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import type { Holding, ParsedSheet, ParseSource } from "../types";
import { cleanNumber, normalizeName, cleanTicker, extractAsOf, todayISO } from "./normalize";
import { xlsxRows } from "./xlsx";
import { csvRows } from "./csv";
import { extractTable } from "./html";

export class ParseError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = "ParseError";
  }
}

type Row = (string | number)[];

function cellIdx(row: Row, ...needles: RegExp[]): number {
  for (let i = 0; i < row.length; i++) {
    const s = String(row[i]).toLowerCase();
    if (needles.some((n) => n.test(s))) return i;
  }
  return -1;
}

function detectHeader(rows: Row[]): number {
  const tickerRe = /\b(ticker|symbol|code|securities? code)\b/;
  const weightRe = /%|weight|market value|\bvalue\b|net asset/;
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const t = cellIdx(rows[i], tickerRe);
    const w = cellIdx(rows[i], weightRe);
    if (t >= 0 && w >= 0 && w !== t) return i;
  }
  throw new ParseError("could not locate holdings header row (need ticker + weight columns)");
}

function mapRow(row: Row, ti: number, wi: number, ni: number, si: number, ri: number, mvi: number, shi: number): Holding | null {
  const tickRaw = row[ti];
  if (tickRaw == null || String(tickRaw).trim() === "") return null;
  const ticker = cleanTicker(String(tickRaw));
  if (!ticker) return null;
  const weight = cleanNumber(row[wi]);
  if (weight == null || weight <= 0) return null;
  const h: Holding = {
    t: ticker,
    n: ni >= 0 ? normalizeName(String(row[ni] ?? ticker)) : ticker,
    weight,
  };
  if (si >= 0) h.sector = String(row[si] ?? "").trim() || undefined;
  if (ri >= 0) h.region = String(row[ri] ?? "").trim() || undefined;
  const mv = mvi >= 0 ? cleanNumber(row[mvi]) : undefined;
  if (mv != null) h.mv = mv;
  const shares = shi >= 0 ? cleanNumber(row[shi]) : undefined;
  if (shares != null) h.shares = shares;
  return h;
}

function weightScale(rows: Row[], wi: number, headerRow: Row): number {
  if (/percent|%/i.test(String(headerRow[wi] ?? "")) || rows.some((r) => String(r[wi]).includes("%"))) return 1;
  let max = 0;
  for (const r of rows) {
    const n = cleanNumber(r[wi]);
    if (n != null) max = Math.max(max, n);
  }
  return max <= 1.5 ? 100 : 1;
}

function bannerText(rows: Row[], hIdx: number): string {
  return rows.slice(0, hIdx).map((r) => r.join(" ")).join("\n");
}

function tabularParse(rows: Row[]): { header: string; banner: string; holdings: Holding[] } {
  const hIdx = detectHeader(rows);
  const headerRow: Row = rows[hIdx].map((c) => String(c ?? ""));
  const ti = cellIdx(headerRow, /\b(ticker|symbol|code|securities? code)\b/);
  const wi = cellIdx(headerRow, /%|weight/);
  if (wi < 0) throw new ParseError("A percentage weight column is required; market values alone are not weights.");
  const ni = cellIdx(headerRow, /holding|name|issuer|company|security/);
  const si = cellIdx(headerRow, /sector/);
  const ri = cellIdx(headerRow, /region|geography/);
  // "Market value" column: first match that is NOT the weight column
  const mvi = headerRow.findIndex((c, i) => i !== wi && /market value|net asset/i.test(String(c)));
  const shi = headerRow.findIndex((c, i) => i !== wi && /\bshares\b/i.test(String(c)));

  const dataRows = rows.slice(hIdx + 1);
  const scale = weightScale(dataRows, wi, headerRow);

  const holdings: Holding[] = [];
  for (const r of dataRows) {
    const h = mapRow(r, ti, wi, ni, si, ri, mvi, shi);
    if (h) {
      if (scale !== 1) h.weight = h.weight * scale;
      holdings.push(h);
    }
  }
  if (holdings.length === 0) throw new ParseError("no valid holdings rows extracted");
  return { header: headerRow.join(" | "), banner: bannerText(rows, hIdx), holdings };
}

function htmlParse(text: string, url?: string): { header: string; banner: string; holdings: Holding[] } {
  const $ = cheerio.load(text);
  const detected = extractTable($, url);
  if (!detected) throw new ParseError("no holdings table found in HTML");
  const banner = $("body").text().replace(/\s+/g, " ").slice(0, 800);
  return { ...detected, banner };
}

export interface ParseContext {
  ticker?: string;
  name?: string;
  issuer?: string;
  asOf?: string;
  url?: string;
  bannerText?: string;
}

export function parseSheet(src: ParseSource, ctx: ParseContext = {}): ParsedSheet {
  const result =
    src.kind === "html"
      ? htmlParse(src.text, src.url)
      : (() => {
          const rows = src.kind === "xlsx" ? xlsxRows(src.buffer) : csvRows((src as { text: string }).text);
          if (rows.length === 0) throw new ParseError("no rows found in input");
          const r = tabularParse(rows);
          return r;
        })();

  if (result.holdings.length < 1) throw new ParseError("no valid holdings rows extracted");
  const weightTotal = result.holdings.reduce((sum, h) => sum + h.weight, 0);
  if (result.holdings.some((h) => h.weight > 100) || weightTotal > 105) {
    throw new ParseError("Holdings weights exceed 100%. Check the weight column and percentage format.");
  }

  const asOf = ctx.asOf ?? extractAsOf(ctx.bannerText ?? result.banner) ?? todayISO();
  const holdingsSorted = result.holdings
    .map((h) => ({ ...h, t: h.t, n: h.n }))
    .sort((a, b) => a.t.localeCompare(b.t));
  const contentHash = createHash("sha256").update(JSON.stringify(holdingsSorted)).digest("hex");

  const combined = `${result.header}\n${result.banner}`;
  const bannerLines = String(result.banner ?? "")
    .split(/\r?\n|,|;/)
    .map((l) => l.trim())
    .filter(Boolean);
  const nameGuess =
    ctx.name ??
    bannerLines
      .find((l) => l.length >= 6 && l.length <= 120 && !/\d{4}/.test(l) && !/as\s+(at|of)/i.test(l) && !/download/i.test(l) && !/top\s*\d+\s*holding/i.test(l))?.slice(0, 200) ??
    ctx.ticker;
  return {
    ticker: ctx.ticker,
    name: nameGuess,
    issuer: ctx.issuer ?? (/vanguard/i.test(result.banner) ? "Vanguard" : undefined),
    asOfDate: asOf,
    partial: /top\s*\d+\s+holding/i.test(combined) || weightTotal < 98,
    holdings: holdingsSorted,
    contentHash,
  };
}
