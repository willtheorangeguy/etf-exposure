/** Half a percentage point is the largest total overrun treated as rounding. */
export const MAX_HOLDINGS_TOTAL = 100.5;
export const WEIGHT_SUM_EPSILON = 1e-9;

export function holdingsTotal(holdings: readonly { weight: number }[]): number {
  return holdings.reduce((sum, holding) => sum + holding.weight, 0);
}

/** Preserve partial tables and signed positions; only correct small net overruns. */
export function normalizeWeightRounding<T extends { weight: number }>(holdings: T[]): T[] {
  const total = holdingsTotal(holdings);
  if (total <= 100 || total > MAX_HOLDINGS_TOTAL + WEIGHT_SUM_EPSILON || !Number.isFinite(total)) return holdings;

  const adjusted = holdings.map((holding) => ({ ...holding, weight: holding.weight * (100 / total) }));
  // Multiplication and summation can leave a few floating-point bits above 100.
  const excess = holdingsTotal(adjusted) - 100;
  if (excess > 0) {
    const largest = adjusted.reduce((index, holding, i) => holding.weight > adjusted[index].weight ? i : index, 0);
    adjusted[largest].weight -= excess + Number.EPSILON * Math.max(100, Math.abs(adjusted[largest].weight));
  }
  return adjusted;
}
