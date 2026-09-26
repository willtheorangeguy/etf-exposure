import type { Holding } from "./types";

export interface Position {
  etfId: number;
  etfTicker: string;
  amount: number;
  asOf: string;
  partial: boolean;
}

export interface ExposureRow {
  securityId: string;
  ticker: string;
  name: string;
  exposure: number;
  pctOfTotal: number;
  byEtf: Array<{ etfTicker: string; contribution: number }>;
  sector?: string;
}

export interface CalcResult {
  totalInvested: number;
  totalExposed: number;
  rows: ExposureRow[];
  sectors: Array<{ sector: string; exposure: number; pctOfTotal: number }>;
  partial: boolean;
}

/**
 * exposure(stock) = Σ over positions of (amount × weight_pct / 100)
 * Rows sorted by exposure desc. pctOfTotal = exposure / Σ amounts of *complete* ETFs?
 * MVP: pctOfTotal = exposure / totalInvested (i.e. % of total invested $ that is in this stock).
 * Partial sheets will make Σ exposures < totalInvested; the `partial` flag lets UI warn.
 */
export function computeExposure(
  positions: Position[],
  holdingsByEtf: Record<number, Holding[]>
): CalcResult {
  for (const [etfId, holdings] of Object.entries(holdingsByEtf)) {
    if (!Array.isArray(holdings)) {
      throw new Error(
        `Snapshot for ETF #${etfId} is stored in an invalid format (expected a holdings array). ` +
        `Refresh the holdings catalog in GitHub Actions, then try again.`
      );
    }
  }
  const totalInvested = positions.reduce((s, p) => s + (Number.isFinite(p.amount) ? p.amount : 0), 0);
  const byStock = new Map<string, ExposureRow>();
  const tickerIsins = new Map<string, Set<string>>();
  const isinTickers = new Map<string, string>();
  for (const holdings of Object.values(holdingsByEtf)) for (const h of holdings) {
    if (h.isin && h.t !== h.isin) {
      const ids = tickerIsins.get(h.t) ?? new Set<string>();
      ids.add(h.isin); tickerIsins.set(h.t, ids);
      isinTickers.set(h.isin, h.t);
    }
  }
  const sectors = new Map<string, number>();
  let totalExposed = 0;
  let anyPartial = false;

  for (const p of positions) {
    const holdings = holdingsByEtf[p.etfId] ?? [];
    if (p.partial) anyPartial = true;
    if (!Number.isFinite(p.amount) || p.amount <= 0) continue;
    for (const h of holdings) {
      const contribution = (p.amount * h.weight) / 100;
      totalExposed += contribution;
      const candidates = tickerIsins.get(h.t);
      const isin = h.isin ?? (candidates?.size === 1 ? [...candidates][0] : undefined);
      const key = isin ?? h.t;
      let row = byStock.get(key);
      if (!row) {
        row = { securityId: key, ticker: isinTickers.get(isin ?? "") ?? h.t, name: h.n, exposure: 0, pctOfTotal: 0, byEtf: [], sector: h.sector };
        byStock.set(key, row);
      }
      if (row.name === row.ticker && h.n !== h.t) row.name = h.n;
      if (!row.sector && h.sector) row.sector = h.sector;
      row.exposure += contribution;
      row.byEtf.push({ etfTicker: p.etfTicker, contribution });
      if (h.sector) sectors.set(h.sector, (sectors.get(h.sector) ?? 0) + contribution);
    }
  }

  const rows = Array.from(byStock.values()).sort((a, b) => b.exposure - a.exposure);
  for (const r of rows) {
    if (totalInvested > 0) r.pctOfTotal = (r.exposure / totalInvested) * 100;
  }
  const sectorRows = Array.from(sectors.entries())
    .map(([sector, exposure]) => ({
      sector,
      exposure,
      pctOfTotal: totalInvested > 0 ? (exposure / totalInvested) * 100 : 0,
    }))
    .sort((a, b) => b.exposure - a.exposure);

  return { totalInvested, totalExposed, rows, sectors: sectorRows, partial: anyPartial };
}
