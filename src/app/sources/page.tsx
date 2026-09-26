'use client';
import { useEffect, useState } from "react";
import { getCatalog } from "@/lib/catalog-client";
import type { StaticCatalog } from "@/lib/catalog-types";
export default function Sources() {
  const [catalog, setCatalog] = useState<StaticCatalog | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getCatalog().then(setCatalog).catch((e) => setError(e.message)); }, []);
  return <main className="mx-auto max-w-5xl px-4 py-8">
    <h1 className="text-2xl font-semibold">Data updates</h1>
    <p className="mt-2">GitHub Actions downloads issuer holdings monthly. Previous valid snapshots stay available if a download fails.</p>
    <p className="mt-2 text-zinc-500">To add funds or issuer directories, edit <code>config/sources.json</code> in the repository and run the Pages workflow. No server or shared upload database is required.</p>
    {error && <p role="alert" className="mt-4 text-red-500">{error}</p>}
    {!catalog && !error && <p className="mt-4">Loading update status…</p>}
    {catalog && <p className="mt-4 text-sm">Last refresh attempt: {catalog.generated_at}. {catalog.etfs.length} ETFs available.</p>}
    {catalog?.sources.map((s) => <section key={s.id} className="mt-5 rounded border p-4">
      <h2 className="font-semibold">{s.label}</h2>
      <a href={s.url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm underline">Issuer source</a>
      <p className="mt-2 text-sm">Last successful refresh: {s.last_success_at ?? "Not yet successful"}</p>
      <p className="text-sm">{s.imported} snapshots saved · {s.unchanged} unchanged</p>
      {s.errors.map((e, i) => <p key={i} role="alert" className="mt-2 break-all text-sm text-amber-700 dark:text-amber-300">{e.error} — {e.url}</p>)}
    </section>)}
  </main>;
}
