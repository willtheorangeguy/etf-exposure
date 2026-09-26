export function cleanNumber(raw: string | number | null | undefined): number | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
  let s = String(raw).trim();
  if (!s) return undefined;
  s = s.replace(/[\s,$]/g, "");
  // handle parentheses as negative (accounting style)
  let neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1);
  }
  if (s.endsWith("%")) s = s.slice(0, -1);
  const n = Number(s);
  if (!Number.isFinite(n)) return undefined;
  return neg ? -n : n;
}

export function normalizeName(raw: string): string {
  let n = String(raw).trim();
  // Vanguard quirk: trailing "/The"
  if (n.endsWith("/The")) n = "The " + n.slice(0, -4).trim();
  return n;
}

export function cleanTicker(raw: string): string {
  return String(raw).trim().toUpperCase();
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function dateFromLine(line: string): string | undefined {
  const s = line.toLowerCase();
  let m = s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
  if (m) {
    const mo = MONTHS[m[1]] ?? 1;
    const day = String(Number(m[2])).padStart(2, "0");
    return `${m[3]}-${String(mo).padStart(2, "0")}-${day}`;
  }
  m = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})/);
  if (m) {
    const mo = MONTHS[m[2]] ?? 1;
    const day = String(Number(m[1])).padStart(2, "0");
    return `${m[3]}-${String(mo).padStart(2, "0")}-${day}`;
  }
  m = s.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }
  return undefined;
}

/**
 * Prefer lines marked "as at" / "as of" (the sheet's reference date) over bare
 * date mentions (e.g. "downloaded on Sep 19 2026"). Falls back to any date.
 */
export function extractAsOf(text: string): string | undefined {
  const lines = String(text)
    .split(/\r?\n|,|;/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (/as\s+(at|of)/.test(line.toLowerCase())) {
      const d = dateFromLine(line);
      if (d) return d;
    }
  }
  for (const line of lines) {
    const d = dateFromLine(line);
    if (d) return d;
  }
  return undefined;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
