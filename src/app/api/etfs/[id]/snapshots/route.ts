import { NextRequest, NextResponse } from "next/server";
import { listSnapshots, getSnapshotLatest, upsertEtfAndSnapshot, getEtfById } from "@/lib/etfs";
import { ImportSchema } from "@/lib/import-validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function resolveEtfId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n)) return null;
  const etf = await getEtfById(n);
  return etf ? n : null;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const etfId = await resolveEtfId(ctx);
  if (!etfId) return NextResponse.json({ error: "etf not found" }, { status: 404 });
  const asOf = req.nextUrl.searchParams.get("as_of");
  if (asOf || req.nextUrl.searchParams.has("latest")) {
    const snap = await getSnapshotLatest(etfId, asOf ?? undefined);
    if (!snap) return NextResponse.json({ error: "snapshot not found" }, { status: 404 });
    return NextResponse.json(snap);
  }
  const list = await listSnapshots(etfId);
  const etf = await getEtfById(etfId);
  return NextResponse.json({ etf, snapshots: list });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const etfId = await resolveEtfId(ctx);
  if (!etfId) return NextResponse.json({ error: "etf not found" }, { status: 404 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const parsed = ImportSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const body = parsed.data;
  const etf = await getEtfById(etfId);
  if (body.ticker.toUpperCase() !== etf!.ticker) {
    return NextResponse.json(
      { error: `body ticker ${body.ticker} does not match etf ${etf!.ticker}` },
      { status: 409 }
    );
  }
  const result = await upsertEtfAndSnapshot({
    ...body,
    name: body.name || etf!.name,
    issuer: etf!.issuer ?? body.issuer,
  });
  const status = result.status === "duplicate" ? 200 : 201;
  return NextResponse.json(result, { status });
}
