import { z } from "zod";

export const ImportSchema = z.object({
  ticker: z.string().trim().toUpperCase().regex(/^[A-Z0-9.\-]{1,20}$/),
  name: z.string().trim().min(1).max(500),
  issuer: z.string().max(200).optional().nullable(),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((s) => {
    const date = new Date(`${s}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === s;
  }, "Enter a valid calendar date"),
  source: z.enum(["url", "upload"]),
  sourceUrl: z.string().url().optional().nullable(),
  contentHash: z.string().min(8),
  holdings: z.array(z.object({
    t: z.string().trim().min(1).max(100),
    n: z.string().trim().min(1).max(500),
    weight: z.number().positive().max(100),
    isin: z.string().regex(/^[A-Z]{2}[A-Z0-9]{10}$/).optional(),
    sector: z.string().nullish().transform((v) => v ?? undefined),
    region: z.string().nullish().transform((v) => v ?? undefined),
    mv: z.number().nullish().transform((v) => v ?? undefined),
    shares: z.number().nullish().transform((v) => v ?? undefined),
  })).min(1).max(20000).refine((holdings) => holdings.reduce((sum, h) => sum + h.weight, 0) <= 105,
    "Holdings weights exceed 100%"),
  partial: z.boolean(),
});
