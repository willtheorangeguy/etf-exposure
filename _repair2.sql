\set QUIET on
\echo == before ==
select id, jsonb_typeof(holdings) as ty_pre from snapshots order by id;

update snapshots
   set holdings = (holdings #>> '{}')::jsonb
 where jsonb_typeof(holdings) <> 'array';

\echo == after ==
select id,
       jsonb_typeof(holdings)        as ty,
       jsonb_array_length(holdings)  as n,
       (holdings->0)->>'t'          as first_t,
       (holdings->0)->>'weight'     as first_w
  from snapshots
 order by id;
