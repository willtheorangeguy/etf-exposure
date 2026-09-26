import postgres from "postgres";
const arr = [{t:"RY",n:"Royal Bank",weight:7.76},{t:"TD",n:"TD Bank",weight:5.49}];
const sql = postgres(process.env.DB_URL, { max: 1 });
async function t(label, expr) {
  try {
    await sql.unsafe("drop table if exists _t; create table _t(j jsonb)");
    if (expr === "array") await sql`insert into _t values (${arr}::jsonb)`;
    if (expr === "string") await sql`insert into _t values (${JSON.stringify(arr)}::jsonb)`;
    const r = await sql`select jsonb_typeof(j) as ty, left(j::text,120) as v from _t`;
    if (r[0].ty === "array") {
      const n = (await sql`select jsonb_array_length(j) as n, (j->0)->>'t' as t0 from _t`)[0];
      console.log(`\n[expr=${expr}] jsonb_typeof=ARRAY n=${n.n} first.t=${n.t0}`);
    }
    console.log(`[expr=${expr}] jsonb_typeof=${r[0].ty}\n   v=${r[0].v}`);
  } catch (e) {
    console.log(`[expr=${expr}] ERROR: ${e.message}`);
  }
}
await t("array", "array");     // current repo code: ${input.holdings}::jsonb
await t("string", "string");   // alternative: ${JSON.stringify(h)}::jsonb
await sql.unsafe("drop table if exists _t").catch(()=>{});
await sql.end({timeout:2});
