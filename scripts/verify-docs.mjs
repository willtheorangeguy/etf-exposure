import { access, readFile } from "node:fs/promises";
import assert from "node:assert/strict";

for (const file of ["out/index.html", "out/data/catalog.json", "out/docs/index.html",
  "out/docs/adding-etfs/index.html", "out/docs/vanguard-expansion/index.html",
  "out/docs/search/search_index.json", "out/docs/stylesheets/theme.css"]) await access(file);
const html = await readFile("out/docs/index.html", "utf8");
assert(html.includes("https://williamvdg.me/etf-exposure/docs/"));
assert(html.includes("adding-etfs/"));
const search = JSON.parse(await readFile("out/docs/search/search_index.json", "utf8"));
assert(search.docs.some((d) => d.location.includes("vanguard-expansion/")));
console.log("Combined Pages artifact verified: app root, docs subpath, ETF guides, search and design assets.");
