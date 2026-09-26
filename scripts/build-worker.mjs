import { build } from "esbuild";
await build({ entryPoints: ["scripts/source-worker.ts"], outfile: "dist/source-worker.cjs", bundle: true,
  platform: "node", target: "node22", format: "cjs", external: ["postgres"], minify: true });
