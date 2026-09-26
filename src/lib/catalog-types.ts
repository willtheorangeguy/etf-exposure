import type { Holding } from "./types";

export interface CatalogSnapshot {
  id: number;
  as_of_date: string;
  source: "url";
  source_url: string;
  created_at: string;
  partial: boolean;
  content_hash: string;
  holdings_count: number;
  file: string;
}
export interface CatalogEtf {
  id: number;
  ticker: string;
  name: string;
  issuer: string | null;
  snapshots: CatalogSnapshot[];
}
export interface SourceReport {
  id: string;
  label: string;
  url: string;
  last_checked_at: string;
  last_success_at: string | null;
  imported: number;
  unchanged: number;
  errors: Array<{ url: string; error: string }>;
}
export interface StaticCatalog {
  version: 1;
  generated_at: string;
  etfs: CatalogEtf[];
  sources: SourceReport[];
}
export interface StaticSnapshot extends Omit<CatalogSnapshot, "file" | "holdings_count"> {
  holdings: Holding[];
}
