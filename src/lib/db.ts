import postgres from "postgres";

export type Sql = postgres.Sql;

let _sql: Sql | null = null;

export function getSql(): Sql {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = postgres(url, { max: 10, onnotice: () => {} });
  }
  return _sql;
}

export async function closeSql() {
  if (_sql) {
    await _sql.end({ timeout: 5 });
    _sql = null;
  }
}
