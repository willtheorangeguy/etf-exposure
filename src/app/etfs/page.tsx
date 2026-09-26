import { searchEtfs, type EtfListRow } from "@/lib/etfs";
import Link from "next/link";
import EtfFilter from "@/components/EtfFilter";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = { title: "ETF catalog — ETF Exposure" };

export default async function EtfCatalog({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  let rows: EtfListRow[] = [];
  let err: string | null = null;
  try {
    rows = await searchEtfs(q);
  } catch (e) {
    err = (e as Error).message;
    rows = [];
  }
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">ETF catalog</h1>
          <p className="mt-1 text-zinc-500">Crowd-sourced holdings. <Link className="underline" href="/import">Add one →</Link></p>
        </div>
      </div>
      <Suspense fallback={<div className="mt-4 h-9 sm:w-96" />}>
        <EtfFilter />
      </Suspense>
      {err && <p className="mt-3 text-red-500">{err}</p>}
      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-1 pr-3">Ticker</th>
            <th className="py-1 pr-3">Name</th>
            <th className="py-1 pr-3">Issuer</th>
            <th className="py-1 pr-3">Updated</th>
            <th className="py-1 pr-3 text-right">Snapshots</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-1 pr-3 font-mono">
                <Link className="underline" href={`/etfs/${r.id}`}>{r.ticker}</Link>
              </td>
              <td className="py-1 pr-3">{r.name}</td>
              <td className="py-1 pr-3">{r.issuer ?? ""}</td>
              <td className="py-1 pr-3">{r.latest_as_of ?? "—"}</td>
              <td className="py-1 pr-3 text-right">{r.snapshot_count}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-zinc-500">
                No ETFs in the shared DB yet — <Link className="underline" href="/import">import one →</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
