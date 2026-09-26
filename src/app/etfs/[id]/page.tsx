import { readFile } from "node:fs/promises";
import path from "node:path";
import EtfDetail from "@/components/EtfDetail";
import type { StaticCatalog } from "@/lib/catalog-types";
export const dynamicParams = false;
export async function generateStaticParams() {
  const catalog: StaticCatalog = JSON.parse(await readFile(path.join(process.cwd(), "public/data/catalog.json"), "utf8"));
  return catalog.etfs.map((etf) => ({ id: String(etf.id) }));
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EtfDetail etfId={Number((await params).id)} />;
}
