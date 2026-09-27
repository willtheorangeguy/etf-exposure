import * as cheerio from "cheerio";
import Papa from "papaparse";
import { fetchSource, type FetchResult } from "./parse/fetch";
import { xlsxRows } from "./parse/xlsx";
import { assertPublicUrl } from "./public-url";

/** TD publishes names and percentages, but no holdings date or security codes. */
export function tdHoldingsCsv(html: string, retrievedDate: string): string {
  const $ = cheerio.load(html);
  const ticker = $('meta[name="fundCode"]').attr("content")?.trim();
  const name = $("[data-fund-title]").attr("data-fund-title")?.trim();
  if (!ticker || !/^[A-Z][A-Z0-9.\-]{0,19}$/.test(ticker) || !name) {
    throw new Error("TD fund identity was not found on its product page.");
  }
  // This is the modal's full published list, not the ten visible preview rows.
  const raw = $("[data-top-ten-table]").first().attr("data-top-ten-table");
  const rows: unknown = JSON.parse(raw ?? "null");
  if (!Array.isArray(rows) || !rows.length) throw new Error("TD returned no holdings.");
  const holdings = rows.map((row) => {
    if (!row || typeof row.label !== "string" || !row.label.trim()
      || !["string", "number"].includes(typeof row.value) || String(row.value).trim() === ""
      || !Number.isFinite(Number(row.value))) throw new Error("TD returned an invalid holding.");
    return [row.label, row.label, Number(row.value)];
  });
  return Papa.unparse([[name], [`ETF ticker: ${ticker}`], [`Retrieved as of ${retrievedDate}`],
    ["Ticker", "Holding name", "Weight (%)"], ...holdings]);
}

/** Known issuer adapters use published identifiers; they do not guess fund names. */
export async function fetchIssuerSource(url: string): Promise<FetchResult> {
  const parsed = new URL(url);
  if (parsed.hostname === "df.bmogam.com" && /Holdings_Extract_.*_\d{8}\.xlsx$/i.test(parsed.pathname)) {
    // BMO publishes a new filename each business day. Find the newest available file.
    for (let days = 0; days < 14; days++) {
      const date = new Date(); date.setUTCDate(date.getUTCDate() - days);
      const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
      const candidate = url.replace(/\d{8}(?=\.xlsx)/i, stamp);
      try {
        const result = await fetchSource(candidate, 20000, true);
        if (result.source.kind !== "xlsx") throw new Error("Expected BMO workbook");
        const rows = xlsxRows(result.source.buffer);
        // Cash, physical assets, and options can have no ISIN. Keep these rows:
        // negative cash/option weights offset holdings that individually exceed 100%.
        const headerIndex = rows.findIndex((row) => row.includes("ISIN") && row.includes("Name"));
        if (headerIndex >= 0) {
          const header = rows[headerIndex];
          const isinIndex = header.indexOf("ISIN");
          const nameIndex = header.indexOf("Name");
          const currencyIndex = header.indexOf("Currency");
          for (let i = headerIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            const name = String(row[nameIndex] ?? "").trim();
            const currency = String(row[currencyIndex] ?? "").trim();
            const identifier = String(row[isinIndex] ?? "").trim()
              || (/^cash$/i.test(name) && currency ? `CASH.${currency}` : name);
            rows[i] = [identifier, ...row];
          }
          rows[headerIndex] = ["Ticker", ...header];
        }
        const ticker = /_([A-Z0-9.]+)_\d{8}\.xlsx/i.exec(candidate)?.[1];
        return { ...result, source: { kind: "csv", text: Papa.unparse([
          [`BMO ${ticker}`], [`ETF ticker: ${ticker}`], [`As of ${date.toISOString().slice(0,10)}`], ...rows,
        ]) } };
      } catch (err) {
        if (!/HTTP (404|403)/.test((err as Error).message)) throw err;
      }
    }
    throw new Error("BMO has no available holdings file in the last 14 days; existing snapshots were kept.");
  }
  const result = await fetchSource(url, 20000, true);
  if (parsed.hostname === "www.td.com"
    && /^\/ca\/en\/asset-management\/funds\/solutions\/etfs\/fundcard\/?$/i.test(parsed.pathname)) {
    if (result.source.kind !== "html") throw new Error("Expected TD product page HTML.");
    return { ...result, dateBasis: "retrieved", source: { kind: "csv",
      text: tdHoldingsCsv(result.source.text, new Date().toISOString().slice(0, 10)) } };
  }
  if (parsed.hostname.endsWith("blackrock.com") && result.source.kind === "csv") {
    const ticker = /^([A-Z0-9.]+)_holdings$/i.exec(parsed.searchParams.get("fileName") ?? "")?.[1];
    if (ticker) return { ...result, source: { kind: "csv", text: `iShares ${ticker}\n${result.source.text}` } };
  }
  const match = parsed.hostname === "www.vanguard.ca" && /\/product\/etf\/[^/]+\/([A-Z0-9]+)\//.exec(parsed.pathname);
  if (!match || result.source.kind !== "html") return result;
  const $ = cheerio.load(result.source.text);
  const heading = $("h1").first().text().trim();
  const ticker = /^\(([A-Z0-9.\-]+)\)/.exec(heading)?.[1];
  if (!ticker) throw new Error("Vanguard fund ticker was not found in its product heading.");
  const endpoint = "https://www.vanguard.ca/gpx/graphql";
  await assertPublicUrl(endpoint);
  const query = `query($portIds:[String!],$lastItemKey:String){
    funds(portIds:$portIds){profile{fundFullName}}
    borHoldings(portIds:$portIds){holdings(limit:1500,lastItemKey:$lastItemKey){
      items{ticker isin issuerName securityLongDescription marketValuePercentage effectiveDate gicsSectorDescription bloombergIsoCountry}
      totalHoldings lastItemKey}}}`;
  const rows: (string | number)[][] = [];
  let lastItemKey: string | null = null;
  let name = heading.replace(/^\([^)]+\)\s*/, "");
  let asOf: string | undefined;
  for (let page = 0; page < 20; page++) {
    const response = await fetch(endpoint, { method: "POST", redirect: "error", signal: AbortSignal.timeout(20000),
      headers: { "content-type": "application/json", "x-consumer-id": "ca0" },
      body: JSON.stringify({ query, variables: { portIds: [match[1]], lastItemKey } }) });
    if (!response.ok) throw new Error(`Vanguard holdings API returned HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 10 * 1024 * 1024) throw new Error("Vanguard response too large");
    const body = JSON.parse(text);
    if (body.errors?.length) throw new Error(`Vanguard holdings API: ${body.errors[0].message}`);
    name = body.data?.funds?.[0]?.profile?.fundFullName ?? name;
    const holdings = body.data?.borHoldings?.[0]?.holdings;
    if (!holdings?.items?.length) throw new Error("Vanguard returned no holdings");
    for (const h of holdings.items) {
      if (asOf && h.effectiveDate !== asOf) throw new Error("Vanguard returned mixed holdings dates");
      asOf = h.effectiveDate;
      rows.push([h.ticker ?? h.isin ?? "", h.issuerName ?? h.securityLongDescription ?? "", h.marketValuePercentage,
        h.isin ?? "", h.gicsSectorDescription ?? "", h.bloombergIsoCountry ?? ""]);
    }
    lastItemKey = holdings.lastItemKey;
    if (!lastItemKey) break;
    if (page === 19) throw new Error("Vanguard pagination limit reached");
  }
  return { ...result, source: { kind: "csv", text: Papa.unparse([
    [name], [`ETF ticker: ${ticker}`], [`As of ${asOf}`],
    ["Ticker", "Holding name", "Weight (%)", "ISIN", "Sector", "Region"], ...rows,
  ]) } };
}
