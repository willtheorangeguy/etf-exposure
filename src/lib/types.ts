export interface Holding {
  t: string;
  n: string;
  weight: number;
  sector?: string;
  region?: string;
  mv?: number;
  shares?: number;
}

export interface ParsedSheet {
  ticker?: string;
  name?: string;
  issuer?: string;
  asOfDate: string; // YYYY-MM-DD
  partial: boolean;
  holdings: Holding[];
  contentHash: string;
}

export type ParseSource =
  | { kind: "xlsx"; buffer: Buffer }
  | { kind: "csv"; text: string }
  | { kind: "html"; text: string; url?: string };
