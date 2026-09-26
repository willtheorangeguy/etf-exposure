import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { emptyCatalog, refreshCatalog, SourcesConfig } from "../src/lib/static-refresh";
import type { StaticCatalog, StaticSnapshot } from "../src/lib/catalog-types";

async function main() {
  const root = path.resolve("public/data");
  const config = SourcesConfig.parse(JSON.parse(await readFile("config/sources.json", "utf8")));
  let previous: StaticCatalog;
  try { previous = JSON.parse(await readFile(path.join(root,"catalog.json"),"utf8")); }
  catch (err) { if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err; previous = emptyCatalog(); }
  const resolveFile = (file: string) => {
    const target = path.resolve(root,file);
    if (!target.startsWith(root + path.sep)) throw new Error("Invalid catalog path");
    return target;
  };
  const atomicWrite = async (file:string, value:unknown) => {
    await mkdir(path.dirname(file),{recursive:true});
    const temporary = `${file}.tmp`;
    await writeFile(temporary, JSON.stringify(value,null,2) + "\n");
    await rename(temporary,file);
  };
  const catalog = await refreshCatalog(previous,config,{
    read: async (file) => JSON.parse(await readFile(resolveFile(file),"utf8")) as StaticSnapshot,
    write: (file,snapshot) => atomicWrite(resolveFile(file),snapshot),
  });
  if (!catalog.etfs.length) throw new Error("No usable holdings catalog exists. Refusing to publish an empty site.");
  await atomicWrite(path.join(root,"catalog.json"),catalog);
  for (const source of catalog.sources) console.log(`${source.label}: ${source.imported} saved, ${source.unchanged} unchanged, ${source.errors.length} issues.`);
  const failures = catalog.sources.flatMap((s) => s.errors);
  if (failures.length) {
    console.error("Issuer failures (previous data retained):",failures);
    if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY,
      `## Holdings refresh issues\n\n${failures.map((e)=>`- ${e.url}: ${e.error}`).join("\n")}\n`,{flag:"a"});
  }
}
main().catch((err)=>{console.error(err);process.exitCode=1;});
