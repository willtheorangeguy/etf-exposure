import { refreshNextSource } from "../src/lib/sources";
import { closeSql } from "../src/lib/db";

let stopping = false;
let wake: (() => void) | undefined;
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => { stopping = true; wake?.(); });
async function main() {
  console.log("Holdings refresh worker started; checking persisted schedules every minute.");
  while (!stopping) {
    try {
      if (await refreshNextSource()) continue;
    } catch (err) { console.error("Refresh worker:", (err as Error).message); }
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 60000);
      wake = () => { clearTimeout(timer); resolve(); };
    });
  }
  await closeSql();
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
