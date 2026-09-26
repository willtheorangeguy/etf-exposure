import type { Holding } from "@/lib/types";

export interface EtfLite {
  id: number;
  ticker: string;
  name: string;
  issuer: string | null;
  snapshot_count: number;
  latest_as_of: string | null;
}

export interface PreviewData {
  ticker?: string;
  name?: string;
  issuer?: string;
  asOfDate: string;
  partial: boolean;
  holdings: Holding[];
  contentHash: string;
  source: "url" | "upload";
  sourceUrl: string | null;
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
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${await safeText(res)}`);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown, isForm?: boolean): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    body: isForm ? (body as FormData) : JSON.stringify(body),
    headers: isForm ? undefined : { "content-type": "application/json" },
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) throw new Error(typeof json === "string" ? json : (json as { error?: string })?.error ?? res.statusText);
  return json as T;
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return res.statusText;
  }
}

export function fmtMoney(n: number, currency = "CAD"): string {
  return n.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 2 });
}

export function fmtPct(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%";
}
