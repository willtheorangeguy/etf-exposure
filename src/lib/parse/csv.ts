import Papa from "papaparse";

export function csvRows(text: string): (string | number)[][] {
  const res = Papa.parse<(string | number)[]>(text, {
    header: false,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });
  return res.data
    .map((r) => r.map((c) => (typeof c === "string" ? c.trim() : c)))
    .filter((r) => r.some((c) => String(c).trim() !== ""));
}
