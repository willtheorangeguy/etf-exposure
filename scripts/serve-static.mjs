import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";

const root = path.resolve("out");
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".png": "image/png", ".svg": "image/svg+xml" };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (base && pathname !== base && !pathname.startsWith(base + "/")) throw new Error("Not found");
    let file = path.resolve(root, "." + (pathname.slice(base.length) || "/"));
    if (file !== root && !file.startsWith(root + path.sep)) throw new Error("Not found");
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.setHeader("content-type", mime[path.extname(file)] ?? "application/octet-stream");
    res.end(await readFile(file));
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
}).listen(Number(process.env.PORT ?? 4173), "127.0.0.1", () => {
  console.log(`Static preview: http://localhost:${process.env.PORT ?? 4173}${base}/`);
});
