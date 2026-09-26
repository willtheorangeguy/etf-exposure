'use client';

import { useState } from "react";
import Link from "next/link";
import { apiPost, type PreviewData } from "@/components/api";

export default function ImportPage() {
  const [tab, setTab] = useState<"url" | "upload">("upload");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [asOfDate, setAsOfDate] = useState("");

  async function run() {
    setBusy(true);
    setError(null);
    setPreview(null);
    setSaved(null);
    try {
      let p: PreviewData;
      if (tab === "url") {
        if (!url.trim()) throw new Error("enter a URL");
        p = await apiPost<PreviewData>("/api/etfs/import", { url: url.trim() });
      } else {
        if (!file) throw new Error("choose a CSV or XLSX file");
        const form = new FormData();
        form.append("file", file);
        p = await apiPost<PreviewData>("/api/etfs/import", form, true);
      }
      setPreview(p);
      setTicker(p.ticker ?? "");
      setName(p.name ?? "");
      setIssuer(p.issuer ?? "");
      setAsOfDate(p.asOfDate);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!preview) return;
    const tick = ticker.trim().toUpperCase();
    if (!/^[A-Z0-9.\-]{1,20}$/.test(tick)) {
      setError("Provide the ETF ticker (for example, VCN). The file may not contain it.");
      return;
    }
    const nm = name.trim() || tick;
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const res = await apiPost<{ status: string; ticker: string; name: string; etfId: number }>(
        "/api/etfs/import/save",
        {
          ticker: tick,
          name: nm,
          issuer: issuer.trim() || null,
          asOfDate,
          source: preview.source,
          sourceUrl: preview.sourceUrl,
          contentHash: preview.contentHash,
          holdings: preview.holdings,
          partial: preview.partial,
        }
      );
      const note =
        res.status === "duplicate"
          ? "Already existed with same hash — no write."
          : res.status === "updated"
            ? "Overwrote existing snapshot for that date."
            : "Created new snapshot.";
      setSaved(`Saved ${res.ticker} as of ${asOfDate} — ${note}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Import an ETF holdings sheet</h1>
      <p className="mt-1 text-zinc-500">
        Paste an issuer URL (e.g. a Vanguard holdings download) or upload a CSV/XLSX sheet.
      </p>

      <div className="mt-6 flex gap-2 border-b">
        {(["url", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "border-b-2 border-zinc-900 px-4 py-2 font-medium dark:border-zinc-100"
                : "px-4 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }
          >
            {t === "url" ? "From URL" : "Upload file"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "url" ? (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…/holdings.xlsx  or  https://…/etf/ZAG/holdings"
            className="w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
        ) : (
          <input
            type="file"
            accept=".csv,.xlsx,.xls,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
        )}
        <button
          onClick={run}
          disabled={busy}
          className="mt-3 rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {busy ? "Working…" : "Fetch & preview"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500">{error}</p>}
      {saved && (
        <p className="mt-3 rounded bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          {saved} <Link className="underline" href={`/etfs`}>View catalog →</Link>
        </p>
      )}

      {preview && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded border border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <span className="flex items-center gap-2">
              <b>ETF ticker</b>
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="ZAG"
                className="w-24 rounded border border-zinc-300 bg-transparent px-2 py-0.5 font-mono dark:border-zinc-700"
              />
            </span>
            <span className="flex items-center gap-2">
              <b>Name</b>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vanguard FTSE Canada All Cap Index ETF"
                className="w-64 rounded border border-zinc-300 bg-transparent px-2 py-0.5 dark:border-zinc-700"
              />
            </span>
            <span className="flex items-center gap-2">
              <b>Issuer</b>
              <input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Vanguard"
                className="w-32 rounded border border-zinc-300 bg-transparent px-2 py-0.5 dark:border-zinc-700"
              />
            </span>
            <label><b>As of:</b> <input aria-label="Holdings as-of date" type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} /></label>
            <span><b>Holdings:</b> {preview.holdings.length}</span>
            {preview.partial && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                partial sheet (e.g. top-10) — calculator will warn
              </span>
            )}
            <button
              onClick={save}
              disabled={busy}
              className="ml-auto rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Save snapshot
            </button>
          </div>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-3">Ticker</th>
                <th className="py-1 pr-3">Name</th>
                <th className="py-1 pr-3 text-right">%</th>
                {preview.holdings[0]?.sector && <th className="py-1 pr-3">Sector</th>}
                {preview.holdings[0]?.region && <th className="py-1 pr-3">Region</th>}
              </tr>
            </thead>
            <tbody>
              {preview.holdings.map((h, i) => (
                <tr key={`${h.t}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1 pr-3 font-mono">{h.t}</td>
                  <td className="py-1 pr-3">{h.n}</td>
                  <td className="py-1 pr-3 text-right">{h.weight}%</td>
                  {preview.holdings[0]?.sector && <td className="py-1 pr-3">{h.sector ?? ""}</td>}
                  {preview.holdings[0]?.region && <td className="py-1 pr-3">{h.region ?? ""}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
