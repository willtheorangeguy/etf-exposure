// Generates test/fixtures/vanguard-zag.top10.xlsx shaped like the real Vanguard sheet:
// banner lines, "Top 10 Holdings", header row (Ticker | Holding name | % of market value | ...), data rows.
import * as XLSX from "xlsx";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const out = path.join(process.cwd(), "test", "fixtures");
mkdirSync(out, { recursive: true });

const rows = [
  ["This file was downloaded on Sep 19 2026"],
  [],
  ["Top 10 Holdings"],
  ["Vanguard FTSE Canada All Cap Index ETF"],
  ["As at Aug 31 2026"],
  [],
  ["Ticker", "Holding name", "% of market value", "Sector", "Region", "Market value", "Shares"],
  ["RY", "Royal Bank of Canada", "7.7633%", "Financials", "CA", "$1,382,499,734.20", "4,878,263"],
  ["TD", "Toronto-Dominion Bank/The", "5.4902%", "Financials", "CA", "$977,696,512.92", "5,831,076"],
  ["SHOP", "Shopify Inc", "4.9002%", "Technology", "CA", "$872,635,107.63", "4,271,469"],
  ["BMO", "Bank of Montreal", "3.2695%", "Financials", "CA", "$582,231,198.00", "2,464,575"],
  ["BNS", "Bank of Nova Scotia/The", "3.0619%", "Financials", "CA", "$545,268,610.11", "4,297,853"],
  ["ENB", "Enbridge Inc", "3.0014%", "Energy", "CA", "$534,496,242.36", "7,611,738"],
  ["CM", "Canadian Imperial Bank of Commerce", "2.8307%", "Financials", "CA", "$504,090,413.71", "3,204,411"],
  ["AEM", "Agnico Eagle Mines Ltd", "2.7333%", "Materials", "CA", "$488,770,654.68", "6,633,688"],
  ["LSE.A", "Lionsgate Studios Corp", "2.6501%", "Communication Services", "CA", "$472,854,002.41", "19,641,509"],
  ["SLCA", "Suncor Energy Inc", "2.6136%", "Energy", "CA", "$466,102,007.81", "13,738,713"],
];

const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Holdings");
const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
writeFileSync(path.join(out, "vanguard-zag.top10.xlsx"), buf);
console.log("wrote", path.join(out, "vanguard-zag.top10.xlsx"), buf.length, "bytes");
