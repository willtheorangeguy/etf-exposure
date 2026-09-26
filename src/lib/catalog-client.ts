import type { StaticCatalog, StaticSnapshot } from "./catalog-types";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
let pending: Promise<StaticCatalog> | undefined;
export async function getCatalog(): Promise<StaticCatalog> {
  pending ??= fetch(`${base}/data/catalog.json`,{cache:"no-store"}).then(async(r)=>{
    if (!r.ok) throw new Error("Could not load the holdings catalog. Please try again.");
    return r.json() as Promise<StaticCatalog>;
  }).catch((err)=>{pending=undefined;throw err;});
  return pending;
}
export async function getStaticSnapshot(file: string): Promise<StaticSnapshot> {
  const r = await fetch(`${base}/data/${file}`,{cache:"no-store"});
  if (!r.ok) throw new Error("Could not load this holdings snapshot.");
  return r.json();
}
