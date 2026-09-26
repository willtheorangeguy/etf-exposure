import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 5, onnotice: () => {} });

const dir = path.resolve(process.cwd(), "db", "migrations");

try {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const done = await sql`select 1 from schema_migrations where name = ${file}`;
    if (done.length > 0) continue;
    const content = await readFile(path.join(dir, file), "utf8");
    await sql.unsafe(content);
    await sql`insert into schema_migrations (name) values (${file})`;
    console.log(`applied ${file}`);
  }
  console.log("migrations complete");
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
