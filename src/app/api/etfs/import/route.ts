import { NextRequest, NextResponse } from "next/server";
import { parseSheet, ParseError } from "@/lib/parse";
import { fetchSource } from "@/lib/parse/fetch";
import type { ParseSource } from "@/lib/types";

function parseErrorBody(err: unknown) {
  if (err instanceof ParseError) {
    return NextResponse.json({ error: err.message, details: err.details ?? undefined }, { status: 422 });
  }
  return NextResponse.json({ error: (err as Error).message }, { status: 422 });
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function sourceFromUpload(buf: Buffer, filename: string): ParseSource {
  const lower = filename.toLowerCase();
  if (/\.(xlsx|xls)$/.test(lower) || buf.length > 0 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03) {
    return { kind: "xlsx", buffer: buf };
  }
  const text = new TextDecoder("utf-8").decode(buf);
  return { kind: "csv", text };
}

export async function POST(req: NextRequest) {
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing file field" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "file too large (>10MB)" }, { status: 413 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const src = sourceFromUpload(buf, file.name || "upload.csv");
    try {
      const parsed = parseSheet(src);
      return NextResponse.json({ ...parsed, source: "upload", sourceUrl: null });
    } catch (err) {
      return parseErrorBody(err);
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "body must be JSON {url} or multipart/form-data file" }, { status: 400 });
  }
  const url = (body as { url?: string })?.url;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let source: ParseSource;
  let finalUrl: string;
  try {
    const fetched = await fetchSource(url);
    source = fetched.source;
    finalUrl = fetched.finalUrl;
  } catch (err) {
    return parseErrorBody(err);
  }
  const ticker =
    ctxTickerFromUrl(finalUrl) ??
    /holdings?[\.-]([a-zA-Z][a-zA-Z0-9.\-]{0,7})/i.exec(finalUrl)?.[1]?.toUpperCase();
  try {
    const parsed = parseSheet(source, { url: finalUrl, ticker });
    return NextResponse.json({ ...parsed, source: "url", sourceUrl: finalUrl });
  } catch (err) {
    return parseErrorBody(err);
  }
}

function ctxTickerFromUrl(url: string): string | undefined {
  const m = /\/(?:etf|funds|mutualfunds|holdings|security)[/-]([A-Z][A-Z0-9.\-]{0,7})\b/i.exec(url);
  return m?.[1]?.toUpperCase();
}
