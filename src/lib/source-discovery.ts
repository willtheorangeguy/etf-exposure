import * as cheerio from "cheerio";

export interface DownloadLink { url: string; ticker?: string; name?: string }
const validTicker = (s?: string) => s && /^[A-Z][A-Z0-9.\-]{0,19}$/.test(s) && !["HOLDINGS", "HOLDING", "DOWNLOAD", "FUND", "ETF"].includes(s) ? s : undefined;

export function tickerFromMetadata(text: string): string | undefined {
  return validTicker(/(?:ETF\s+ticker|Ticker\s*(?:symbol)?|Trading\s+symbol)\s*[:：]\s*([A-Z][A-Z0-9.\-]{0,19})\b/.exec(text)?.[1]);
}

export function tickerFromLink(url: string, text = ""): string | undefined {
  let name = new URL(url).pathname.split("/").pop() ?? "";
  try { name = decodeURIComponent(name); } catch { return undefined; }
  const queryName = new URL(url).searchParams.get("fileName") ?? "";
  return validTicker(/^([A-Z][A-Z0-9.]{0,9})_holdings$/i.exec(queryName)?.[1]?.toUpperCase())
    ?? validTicker(/_([A-Z][A-Z0-9.]{0,9})_\d{8}\.xlsx$/i.exec(name)?.[1]?.toUpperCase())
    ?? validTicker(/^([A-Z][A-Z0-9.]{0,9})(?:[-_](?:holdings|holding)|\.(?:csv|xlsx|xls)$)/i.exec(name)?.[1]?.toUpperCase())
    ?? validTicker(/\b([A-Z][A-Z0-9.]{0,9})\s+(?:ETF\s+)?[Hh]oldings\b/.exec(text)?.[1]);
}

export function discoverLinks(html: string, base: string): { files: DownloadLink[]; pages: DownloadLink[] } {
  const $ = cheerio.load(html);
  const files = new Map<string, DownloadLink>();
  const pages = new Map<string, DownloadLink>();
  const pageTicker = tickerFromMetadata($("body").text());
  $("a[href]").each((_, el) => {
    const a = $(el);
    let url: URL;
    try { url = new URL(a.attr("href")!, base); } catch { return; }
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return;
    url.hash = "";
    const text = `${a.text()} ${a.attr("title") ?? ""}`.trim();
    const ticker = validTicker(a.attr("data-ticker")?.toUpperCase())
      ?? tickerFromMetadata(a.closest("tr, li, article").text())
      ?? tickerFromLink(url.href, text) ?? pageTicker;
    const link = { url: url.href, ticker, name: a.attr("data-fund-name") };
    if (/\.(?:csv|xlsx|xls)(?:$|\?)/i.test(url.href) || /holdings/i.test(text) && /download|csv|excel|xlsx/i.test(text)) {
      files.set(url.href, link);
    } else if (url.origin === new URL(base).origin && /etf|fund|holding/i.test(`${url.pathname} ${text}`) && url.href !== base) {
      pages.set(url.href, link);
    }
  });
  return { files: [...files.values()], pages: [...pages.values()] };
}
