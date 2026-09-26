import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const id = Number((await ctx.params).id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Invalid source id" }, { status: 400 });
  try {
    const body = await req.json();
    const sql = getSql();
    let rows;
    if (body.action === "refresh") {
      rows = await sql`update holdings_sources set enabled=true,next_run_at=now() where id=${id}
        and (lease_until is null or lease_until<now()) returning id`;
      if (!rows.length && (await sql`select id from holdings_sources where id=${id}`).length)
        return NextResponse.json({ error: "This source is already refreshing." }, { status: 409 });
    }
    else if (typeof body.enabled === "boolean") rows = await sql`update holdings_sources set enabled=${body.enabled}, next_run_at=case when ${body.enabled} then now() else next_run_at end where id=${id} returning id`;
    else return NextResponse.json({ error: "Use action: refresh or enabled: true/false" }, { status: 400 });
    return rows.length ? NextResponse.json({ queued: body.action === "refresh" }) : NextResponse.json({ error: "Source not found" }, { status: 404 });
  } catch (err) { return NextResponse.json({ error: (err as Error).message }, { status: 400 }); }
}
