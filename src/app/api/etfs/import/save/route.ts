import { NextRequest, NextResponse } from "next/server";
import { ImportSchema as Schema } from "@/lib/import-validation";
import { upsertEtfAndSnapshot } from "@/lib/etfs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation failed", details: parsed.error.flatten() }, { status: 422 });
  }
  const input = parsed.data;
  try {
    const result = await upsertEtfAndSnapshot({
      ticker: input.ticker,
      name: input.name,
      issuer: input.issuer ?? null,
      asOfDate: input.asOfDate,
      source: input.source,
      sourceUrl: input.sourceUrl ?? null,
      contentHash: input.contentHash,
      holdings: input.holdings.map((h) => ({ ...h, sector: h.sector ?? undefined, region: h.region ?? undefined, mv: h.mv ?? undefined, shares: h.shares ?? undefined })),
      partial: input.partial,
    });
    const status = result.status === "duplicate" ? 200 : 201;
    return NextResponse.json(result, { status });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
