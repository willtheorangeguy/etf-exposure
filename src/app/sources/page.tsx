"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/components/api";

interface Source {
  id: number; url: string; label: string; interval_days: number; enabled: boolean;
  next_run_at: string; last_run_at: string | null; last_success_at: string | null; lease_until: string | null;
  report: { imported: number; unchanged: number; files: number; errors: Array<{ url: string; error: string }> } | null;
}
export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [issuer, setIssuer] = useState("");
  const [ticker, setTicker] = useState("");
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load() { const data = await apiGet<{ sources: Source[] }>("/api/sources"); setSources(data.sources); }
  useEffect(() => {
    let active = true;
    const poll = () => apiGet<{ sources: Source[] }>("/api/sources").then((data) => { if (active) setSources(data.sources); }).catch((e) => { if (active) setError(e.message); });
    poll(); const timer = setInterval(poll, 5000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await apiPost("/api/sources", { url, label, issuer: issuer || undefined, ticker: ticker || undefined, intervalDays: days });
      setUrl(""); setLabel(""); setTicker(""); setMessage("Source queued. The background worker will pick it up within a minute."); await load();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function update(id: number, body: object) {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/sources/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error((await response.json()).error);
      await load();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  const date = (value: string | null) => value ? new Date(value).toLocaleString() : "Never";
  return <main className="mx-auto max-w-5xl px-4 py-8">
    <h1 className="text-2xl font-semibold">Automatic holdings sources</h1>
    <p className="mt-2 text-zinc-500">Register an issuer page or a holdings download once. New ETFs become searchable in the <Link href="/etfs" className="underline">catalog</Link>, and their holdings refresh automatically.</p>
    <form onSubmit={add} className="mt-6 grid gap-3 rounded border p-4 sm:grid-cols-2">
      <label className="sm:col-span-2">Issuer page or file URL<input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" placeholder="https://issuer.example/etfs or a CSV/XLSX download" /></label>
      <label>Source label<input required value={label} onChange={(e) => setLabel(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" placeholder="Vanguard Canada" /></label>
      <label>Issuer (optional)<input value={issuer} onChange={(e) => setIssuer(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label>Refresh every (days)<input type="number" min="1" max="365" required value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label>ETF ticker override (single fund only)<input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} className="mt-1 w-full rounded border px-3 py-2" placeholder="Usually detected automatically" /></label>
      <p className="text-sm text-zinc-500 sm:col-span-2">Vanguard Canada product pages, BMO dated XLSX links, and iShares CSV links are supported. Directory pages must expose fund or download links in their HTML. Re-submit the same URL to update its settings.</p>
      <button disabled={busy} className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">Add source and refresh</button>
    </form>
    {error && <p role="alert" className="mt-3 text-red-600">{error}</p>}
    {message && <p role="status" className="mt-3 text-emerald-700">{message}</p>}
    <div className="mt-6 space-y-4">{sources.map((s) => <section key={s.id} className="rounded border p-4">
      <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{s.label}</h2><span className="text-sm">{!s.enabled ? "Paused" : s.lease_until && new Date(s.lease_until) > new Date() ? "Refreshing…" : new Date(s.next_run_at) <= new Date() ? "Queued" : `Every ${s.interval_days} days`}</span></div>
      <a href={s.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm underline">{s.url}</a>
      <p className="mt-2 text-sm text-zinc-500">Last attempt: {date(s.last_run_at)} · Last complete refresh: {date(s.last_success_at)} · Next: {s.enabled ? date(s.next_run_at) : "Paused"}</p>
      {s.report && <><p className="mt-2 text-sm">{s.report.imported} snapshots saved · {s.report.unchanged} unchanged · {s.report.errors.length} issues</p>
        {s.report.errors.length > 0 && <details className="mt-2 text-sm"><summary>Refresh issues</summary><ul className="mt-2 space-y-2">{s.report.errors.map((e, i) => <li key={i}><a href={e.url} className="break-all underline">{e.url}</a><p className="text-red-600">{e.error}</p></li>)}</ul></details>}</>}
      <div className="mt-3 flex gap-4 text-sm"><button disabled={busy} onClick={() => update(s.id, { action: "refresh" })} className="underline">Refresh now</button><button disabled={busy} onClick={() => update(s.id, { enabled: !s.enabled })} className="underline">{s.enabled ? "Pause" : "Resume"}</button></div>
    </section>)}{sources.length === 0 && <p className="text-zinc-500">No sources registered yet.</p>}</div>
  </main>;
}
