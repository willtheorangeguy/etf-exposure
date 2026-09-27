import type { ParseSource } from "../types";
import { ParseError } from "./index";
import { assertPublicUrl } from "../public-url";

const MAX_BYTES = 10 * 1024 * 1024;

export interface FetchResult {
  dateBasis?: "retrieved";
  source: ParseSource;
  contentType: string;
  finalUrl: string;
}

export async function fetchSource(url: string, timeoutMs = 20000, publicOnly = false): Promise<FetchResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ParseError(`invalid URL: ${url}`);
  }
  if (!/^https?:$/.test(parsed.protocol)) throw new ParseError(`unsupported protocol: ${parsed.protocol}`);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res: Response;
  let buf: ArrayBuffer;
  try {
    let target = parsed.href;
    let redirects = 0;
    while (true) {
    if (publicOnly) await assertPublicUrl(target);
    res = await fetch(target, {
      redirect: "manual",
      signal: ctrl.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; etf-exposure-tracker/0.1)",
        accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, text/html",
      },
    });
    if (![301, 302, 303, 307, 308].includes(res.status)) break;
    await res.body?.cancel();
    if (++redirects > 5) throw new ParseError("too many redirects");
    const location = res.headers.get("location");
    if (!location) throw new ParseError("redirect without a location");
    target = new URL(location, target).href;
    if (!/^https?:/.test(target)) throw new ParseError("unsupported redirect protocol");
    }
    if (!res.ok) throw new ParseError(`fetch returned HTTP ${res.status}`);
    if (Number(res.headers.get("content-length")) > MAX_BYTES) throw new ParseError("content too large (>10MB)");
    const reader = res.body?.getReader();
    if (!reader) throw new ParseError("empty response body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new ParseError("content too large (>10MB)");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    buf = bytes.buffer;
  } catch (err) {
    throw new ParseError(`fetch failed: ${(err as Error).message}`);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new ParseError(`fetch returned HTTP ${res.status}`);

  const finalUrl = res.url || url;
  const ct = (res.headers.get("content-type") ?? "").toLowerCase();

  if (buf.byteLength > MAX_BYTES) throw new ParseError(`content too large (>10MB)`);
  const lower = finalUrl.toLowerCase();
  const isBinarySpreadsheet =
    buf.byteLength >= 4 && new Uint8Array(buf)[0] === 0x50 && new Uint8Array(buf)[1] === 0x4b;

  if (/spreadsheetml|xlsx|xls/.test(ct) || isBinarySpreadsheet || /\.(xlsx|xls)$/i.test(lower)) {
    return { source: { kind: "xlsx", buffer: Buffer.from(buf) }, contentType: ct, finalUrl };
  }
  const text = new TextDecoder("utf-8").decode(buf);
  if (/text\/html/.test(ct) || /<\s*html/i.test(text.slice(0, 4000))) {
    return { source: { kind: "html", text, url: finalUrl }, contentType: ct, finalUrl };
  }
  if (/text\/csv/.test(ct) || /\.csv$/i.test(lower) || /ticker|symbol/i.test(text.slice(0, 4000))) {
    return { source: { kind: "csv", text }, contentType: ct, finalUrl };
  }
  throw new ParseError(`unsupported content-type: ${ct || "unknown"} — expected XLSX, CSV or HTML`);
}
