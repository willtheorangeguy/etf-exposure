import { NextRequest } from "next/server";
import { searchEtfs } from "@/lib/etfs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  try {
    const rows = await searchEtfs(q);
    return Response.json({ etfs: rows });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
