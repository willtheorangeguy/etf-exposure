'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog-client";
import type { StaticCatalog } from "@/lib/catalog-types";
export default function Etfs() {
  const [catalog, setCatalog] = useState<StaticCatalog | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { getCatalog().then(setCatalog).catch((e) => setError(e.message)); }, []);
  const rows = catalog?.etfs.filter((e) => `${e.ticker} ${e.name}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <main className="mx-auto max-w-5xl px-4 py-8">
    <h1 className="text-2xl font-semibold">ETF catalog</h1>
    <p className="mt-2 text-zinc-500">Holdings downloaded from issuers. <Link href="/sources" className="underline">View data updates</Link>.</p>
    <label className="mt-4 block">Search ticker or name
      <input value={query} onChange={(e) => setQuery(e.target.value)} className="ml-3 rounded border p-2" type="search" />
    </label>
    {error && <p role="alert" className="mt-3 text-red-500">{error}</p>}
    {!catalog && !error && <p className="mt-4">Loading catalog…</p>}
    <table className="mt-4 w-full text-left text-sm">
      <thead><tr className="border-b"><th className="p-2">Ticker</th><th className="p-2">Name</th><th className="p-2">Issuer</th><th className="p-2">Holdings date</th></tr></thead>
      <tbody>{rows?.map((e) => <tr className="border-b" key={e.id}>
        <td className="p-2 font-mono"><Link className="underline" href={`/etfs/${e.id}`}>{e.ticker}</Link></td>
        <td className="p-2">{e.name}</td><td className="p-2">{e.issuer}</td><td className="p-2">{e.snapshots[0]?.as_of_date ?? "—"}</td>
      </tr>)}</tbody>
    </table>
    {rows?.length === 0 && <p className="mt-4">No matching ETFs.</p>}
  </main>;
}
