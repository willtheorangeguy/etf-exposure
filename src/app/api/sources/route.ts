import { NextRequest, NextResponse } from "next/server";
import { addSource, listSources, SourceSchema } from "@/lib/sources";
import { assertPublicUrl } from "@/lib/public-url";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ sources: await listSources() }); }
export async function POST(req: NextRequest) {
  try {
    const parsed = SourceSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid source URL, label, and interval (1–365 days)." }, { status: 422 });
    await assertPublicUrl(parsed.data.url);
    return NextResponse.json(await addSource(parsed.data), { status: 201 });
  } catch (err) { return NextResponse.json({ error: (err as Error).message }, { status: 400 }); }
}
