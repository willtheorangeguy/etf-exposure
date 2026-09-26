import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getSql, closeSql } from "./db";

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

export async function migrate() {
  const sql = getSql();
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const done = await sql`select 1 from schema_migrations where name = ${file}`;
    if (done.length > 0) continue;
    const content = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    await sql.unsafe(content);
    await sql`insert into schema_migrations (name) values (${file})`;
    console.log(`applied ${file}`);
  }
  await closeSql();
}
