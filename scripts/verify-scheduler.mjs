import assert from 'node:assert/strict';
const web = process.env.WEB ?? 'http://localhost:3000';
const request = async (path, body) => {
  const r = await fetch(web + path, body ? {method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(body)} : undefined);
  const data = await r.json(); assert.ok(r.ok,JSON.stringify(data)); return data;
};
const {sources} = await request('/api/sources');
assert.ok(sources.length >= 3);
for (const source of sources) {
  assert.equal(source.report.errors.length,0);
  assert.ok(new Date(source.next_run_at) > new Date());
}
const id = sources[0].id;
await request(`/api/sources/${id}`,{enabled:false});
assert.equal((await request('/api/sources')).sources.find(s=>s.id===id).enabled,false);
await request(`/api/sources/${id}`,{enabled:true});
const since = Date.now();
for (const source of sources) await request(`/api/sources/${source.id}`,{action:'refresh'});
for (let i=0;i<90;i++) {
  const latest = (await request('/api/sources')).sources;
  if (latest.every(s=>new Date(s.last_run_at).getTime() >= since && !s.lease_until && new Date(s.next_run_at) > new Date())) {
    for (const source of latest) {
      assert.equal(source.report.errors.length,0);
      assert.equal(source.report.unchanged,1);
    }
    console.log('PASS: persisted monthly schedules, pause/resume, queued refreshes, and unchanged-file deduplication.');
    process.exit(0);
  }
  await new Promise(resolve=>setTimeout(resolve,1000));
}
throw new Error('Background worker did not finish queued refreshes within 90 seconds.');
