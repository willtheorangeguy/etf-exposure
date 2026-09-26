'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/components/api";
import type { EtfLite, SnapSummary, SnapFull } from "@/components/api";

export default function EtfDetailPage({ etfId }: { etfId: number }) {
  const [etf, setEtf] = useState<EtfLite | null>(null);
  const [snaps, setSnaps] = useState<SnapSummary[] | null>(null);
  const [snap, setSnap] = useState<SnapFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await apiGet<{ etf: EtfLite; snapshots: SnapSummary[] }>(`/api/etfs/${etfId}/snapshots`);
        setEtf(list.etf);
        setSnaps(list.snapshots);
        if (list.snapshots[0]) {
          const full = await apiGet<SnapFull>(`/api/etfs/${etfId}/snapshots?as_of=${list.snapshots[0].as_of_date}`);
          setSnap(full);
        }
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [etfId]);

  function pick(asOf: string) {
    apiGet<SnapFull>(`/api/etfs/${etfId}/snapshots?as_of=${asOf}`)
      .then(setSnap)
      .catch((e) => setError((e as Error).message));
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link className="text-sm text-zinc-500 underline" href="/etfs">← catalog</Link>
      {etf && (
        <div className="mt-2">
          <h1 className="text-2xl font-semibold">
            <span className="font-mono">{etf.ticker}</span> — {etf.name}
            {etf.issuer && <span className="text-zinc-500"> ({etf.issuer})</span>}
          </h1>
        </div>
      )}
      {error && <p className="mt-3 text-red-500">{error}</p>}
      {snaps && (
        <div className="mt-4">
          <h2 className="font-medium">Snapshots</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {snaps.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => pick(s.as_of_date)}
                  className={
                    snap && snap.as_of_date === s.as_of_date
                      ? "rounded bg-zinc-900 px-3 py-1 font-mono text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "rounded px-3 py-1 font-mono hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }
                >
                  {s.as_of_date}
                  <span className="ml-2 text-xs opacity-70">
                    {s.source}{s.source_url ? " · url" : ""} · {s.holdings_count} holdings
                    {s.partial ? " · partial" : ""}
                  </span>
                </button>
              </li>
            ))}
            {snaps.length === 0 && <li className="text-sm text-zinc-500">No snapshots available.</li>}
          </ul>
        </div>
      )}
      {snap && (
        <div className="mt-6">
          <h2 className="font-medium">Holdings as of {snap.as_of_date}</h2>
          {snap.partial && (
            <p className="mt-1 rounded bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Partial sheet — some holdings missing.
            </p>
          )}
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-3">Ticker / ID</th>
                <th className="py-1 pr-3">Name</th>
                <th className="py-1 pr-3 text-right">%</th>
                {snap.holdings[0]?.sector && <th className="py-1 pr-3">Sector</th>}
                {snap.holdings[0]?.region && <th className="py-1 pr-3">Region</th>}
              </tr>
            </thead>
            <tbody>
              {snap.holdings.map((h, i) => (
                <tr key={`${h.t}-${i}`} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1 pr-3 font-mono">{h.t}</td>
                  <td className="py-1 pr-3">{h.n}</td>
                  <td className="py-1 pr-3 text-right">{h.weight}%</td>
                  {snap.holdings[0]?.sector && <td className="py-1 pr-3">{h.sector ?? ""}</td>}
                  {snap.holdings[0]?.region && <td className="py-1 pr-3">{h.region ?? ""}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
