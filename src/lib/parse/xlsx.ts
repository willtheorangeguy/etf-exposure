import * as XLSX from "xlsx";

export function xlsxRows(buffer: Buffer): (string | number)[][] {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  return rows.filter((r) => Array.isArray(r) && r.some((c) => c !== "" && c != null));
}
