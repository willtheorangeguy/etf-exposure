'use client';

import { useRef, useState } from "react";
import Link from "next/link";
import { apiGet, fmtMoney, fmtPct, EtfLite, SnapFull } from "@/components/api";
import { computeExposure, Position } from "@/lib/calc";
import type { Holding } from "@/lib/types";

interface Row {
  etf: EtfLite;
  amount: string;
}

export default function CalculatorPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof computeExposure> | null>(null);
  const [filter, setFilter] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const money = (n: number) => fmtMoney(n, currency);

  function addEtf(e: EtfLite, amount: string) {
    setResult(null);
    setRows((r) => (r.some((x) => x.etf.id === e.id) ? r : [...r, { etf: e, amount }]));
  }

  async function compute() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const positions: Position[] = [];
      const holdings: Record<number, Holding[]> = {};
      for (const r of rows) {
        const amount = Number(r.amount);
        if (!Number.isFinite(amount) || amount <= 0) throw new Error(`Enter a positive amount for ${r.etf.ticker}.`);
        if (!r.etf.latest_as_of) throw new Error(`${r.etf.ticker} has no snapshots yet — import one first`);
        const full = await apiGet<SnapFull>(`/api/etfs/${r.etf.id}/snapshots?latest=1`);
        holdings[r.etf.id] = full.holdings;
        positions.push({
          etfId: r.etf.id,
          etfTicker: r.etf.ticker,
          amount,
          asOf: full.as_of_date,
          partial: full.partial,
        });
      }
      setResult(computeExposure(positions, holdings));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Portfolio calculator</h1>
      <p className="mt-1 text-zinc-500">
        Add ETFs and the $ you have in each. Each underlying stock is summed across all your ETFs.
      </p>
      <p className="mt-2 text-sm text-zinc-500">Start by <Link href="/import" className="underline">uploading a holdings file</Link>. Your investment amounts stay in this browser. Enter all amounts in the same currency.</p>
      <label className="mt-4 block text-sm">Portfolio currency <select aria-label="Portfolio currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded border p-2"><option>CAD</option><option>USD</option></select></label>

      <div className="mt-6 space-y-2">
        {rows.map((r, i) => (
          <div key={r.etf.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_10rem_4rem] items-center">
            <span>
              <b>{r.etf.ticker}</b> — {r.etf.name}
              {r.etf.latest_as_of && <span className="text-xs text-zinc-400"> (as of {r.etf.latest_as_of})</span>}
            </span>
            <input
              type="number"
              min={0}
              step="any"
              placeholder="10000"
              aria-label={`Amount invested in ${r.etf.ticker}`}
              value={r.amount}
              onChange={(e) => {
                setResult(null);
                setRows((rows) => rows.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))
              }}
              className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
            />
            <button
              onClick={() => { setResult(null); setRows((rows) => rows.filter((_, j) => j !== i)); }}
              className="text-zinc-500 hover:text-red-500"
            >
              remove
            </button>
          </div>
        ))}
        <EtfAdder onPick={addEtf} />
      </div>

      <button
        onClick={compute}
        disabled={loading || rows.length === 0}
        className="mt-4 rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "Computing…" : "Calculate exposure"}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}

      {result && (
        <div className="mt-8">
          {result.partial && (
            <p className="mb-2 rounded bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              One or more ETFs have partial holdings sheets — totals below will not sum to 100% of invested.
            </p>
          )}
          <div className="mb-2 flex gap-6 text-sm">
            <span>Total invested: <b>{money(result.totalInvested)}</b></span>
            <span>Total attributed: <b>{money(result.totalExposed)}</b></span>
          </div>
          <p className="mb-3 text-sm text-zinc-500">{result.rows.length} underlying holdings. Exposure is your ETF amount multiplied by each reported holding weight.</p>
          <input aria-label="Filter underlying holdings" placeholder="Filter by stock ticker or name" value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-3 w-full rounded border px-3 py-2" />
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1 pr-3">Ticker</th>
                <th className="py-1 pr-3">Name</th>
                <th className="py-1 pr-3 text-right">Exposure</th>
                <th className="py-1 pr-3 text-right">% of total</th>
                <th className="py-1 pr-3">From ETFs</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.filter((r) => `${r.ticker} ${r.name}`.toLowerCase().includes(filter.toLowerCase())).map((r) => (
                <tr key={r.ticker} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1 pr-3 font-mono">{r.ticker}</td>
                  <td className="py-1 pr-3">{r.name}</td>
                  <td className="py-1 pr-3 text-right">{money(r.exposure)}</td>
                  <td className="py-1 pr-3 text-right">{fmtPct(r.pctOfTotal)}</td>
                  <td className="py-1 pr-3 text-xs">{r.byEtf.map((e) => `${e.etfTicker}: ${money(e.contribution)}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function EtfAdder({ onPick }: { onPick: (etf: EtfLite, amount: string) => void }) {
  const [q, setQ] = useState("");
  const [amount, setAmount] = useState("");
  const [results, setResults] = useState<EtfLite[]>([]);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const requestId = useRef(0);
  const [searching, setSearching] = useState(false);

  async function doSearch(v: string) {
    const id = ++requestId.current;
    setSearching(true);
    setErr(null);
    setOpen(true);
    try {
      const { etfs } = await apiGet<{ etfs: EtfLite[] }>(`/api/etfs?q=${encodeURIComponent(v)}`);
      if (id !== requestId.current) return;
      setResults(etfs);
    } catch (e) {
      if (id !== requestId.current) return;
      setErr((e as Error).message);
      setResults([]);
    } finally {
      if (id === requestId.current) setSearching(false);
    }
  }

  function pick(e: EtfLite) {
    onPick(e, amount);
    setQ("");
    setAmount("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <input
          value={q}
          aria-label="Search ETFs"
          placeholder="Search ETFs in the shared DB… (visit /import to add new ones)"
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value.trim()) doSearch(e.target.value);
            else { ++requestId.current; setSearching(false); setResults([]); }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="w-full rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
        />
        {open && results.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded border border-zinc-200 bg-white text-sm shadow dark:border-zinc-700 dark:bg-zinc-900">
            {results.map((r) => (
              <li key={r.id}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(r)} className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <b>{r.ticker}</b> — {r.name}{" "}
                {r.latest_as_of && <span className="text-zinc-400">as of {r.latest_as_of}</span>}
              </button></li>
            ))}
          </ul>
        )}
        {open && q.trim() && !searching && results.length === 0 && !err && <p className="mt-2 text-sm">No ETFs found. <Link href="/import" className="underline">Upload holdings to add one.</Link></p>}
      </div>
      <input
        type="number"
        min={0}
        step="any"
        placeholder="$ amount"
        aria-label="Amount for new ETF"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="rounded border border-zinc-300 bg-transparent px-2 py-2 sm:w-32 dark:border-zinc-700"
      />
      {err && <p className="text-xs text-red-500">{err}</p>}
    </div>
  );
}
