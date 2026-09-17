import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';

test('catalog connection candidates use exact names or official hosts and never lookalike hosts',()=>{
 const api=harness().load('lib/catalog.ts');assert.equal(typeof api.suggestTools,'function');
 const items=[{id:'notion',name:'Notion',homepage:'https://www.notion.com/'},{id:'other',name:'Other',homepage:'https://other.invalid/'}];
 assert.deepEqual(api.suggestTools('  NOTION ','',items).map(t=>t.id),['notion']);
 assert.deepEqual(api.suggestTools('My notes','https://notion.com/my-page',items).map(t=>t.id),['notion']);
 assert.deepEqual(api.suggestTools('Custom','https://notion.com.attacker.invalid',items),[]);
 assert.deepEqual(api.suggestTools('Custom','not a URL',items),[]);
});

test('connecting a custom service updates its canonical target without losing personal content',async()=>{
 const h=harness();const first=await h.save('library',{name:'My Notion',status:'using',purpose:'Project notes',note:'Private note'});
 const r=await h.save('library',{...first.data.record.payload,toolId:'notion'},first.data.record.id);
 assert.equal(r.status,200);
 const stored=h.sql.prepare('SELECT target,payload FROM private_records WHERE id=?').get(first.data.record.id);
 assert.equal(stored.target,'notion');assert.equal(JSON.parse(stored.payload).note,'Private note');
});
test('linking a second record to an already registered service cannot overwrite either record',async()=>{
 const h=harness();await h.save('library',{name:'Notion',toolId:'notion',status:'using',note:'Keep A'},undefined,'notion');
 const b=await h.save('library',{name:'Second',status:'trial',note:'Keep B'});
 const r=await h.save('library',{...b.data.record.payload,toolId:'notion'},b.data.record.id);
 assert.equal(r.status,409);
 assert.equal(h.sql.prepare('SELECT target FROM private_records WHERE id=?').get(b.data.record.id).target,null);
 assert.equal(h.sql.prepare("SELECT json_extract(payload,'$.note') note FROM private_records WHERE target='notion'").get().note,'Keep A');
});
test('unknown catalog IDs are rejected and other owners cannot relink a record',async()=>{
 const h=harness();const own=await h.save('library',{name:'Private',status:'using'});
 assert.equal((await h.save('library',{name:'Private',status:'using',toolId:'unregistered'},own.data.record.id)).status,400);
 h.user({userId:'beta',email:'beta@example.invalid'});
 assert.equal((await h.save('library',{name:'Private',status:'using',toolId:'notion'},own.data.record.id)).status,404);
});
test('unlinking a catalog service preserves its private record and clears the unique target',async()=>{
 const h=harness();const own=await h.save('library',{name:'Notion',status:'using',toolId:'notion',note:'Keep'},undefined,'notion');
 const r=await h.save('library',{...own.data.record.payload,toolId:''},own.data.record.id,'notion');
 assert.equal(r.status,200);const stored=h.sql.prepare('SELECT target,payload FROM private_records WHERE id=?').get(own.data.record.id);
 assert.equal(stored.target,null);assert.equal(JSON.parse(stored.payload).note,'Keep');
});

test('a concurrent ordinary new-library save must not adopt and overwrite the winning record',async()=>{
 const h=harness();
 const raceId='c42a190b-8f00-4ce4-b7ef-0547bcb15c0f';
 const winner={toolId:'notion',name:'First saved owner note',status:'using',purpose:'Keep purpose',note:'Preserve the first completed save',collection:'',plan:'Paid plan',url:'https://www.notion.com/'};
 const stamp='2026-09-15T00:00:00.000Z';
 const original=h.env.DB.prepare.bind(h.env.DB);
 let inserted=false;
 h.env.DB.prepare=q=>{
  const prepared=original(q);
  if(q==='SELECT id FROM private_records WHERE user_id=? AND kind=? AND target=?'){
   const bind=prepared.bind.bind(prepared);
   prepared.bind=(...values)=>{
    const statement=bind(...values),first=statement.first.bind(statement);
    statement.first=async()=>{
     const snapshot=await first();
     if(!inserted&&snapshot===null&&values[1]==='library'&&values[2]==='notion'){
      inserted=true;
      h.sql.prepare('INSERT INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(raceId,'alpha','library','notion',JSON.stringify(winner),stamp,stamp);
     }
     return snapshot;
    };
    return statement;
   };
  }
  return prepared;
 };
 const result=await h.save('library',{toolId:'notion',name:'Second incomplete draft',status:'interested',note:'Overwrite attempt'});
 const row=h.sql.prepare('SELECT * FROM private_records WHERE id=?').get(raceId);

 assert.equal(inserted,true);
 assert.equal(result.status,409,'New ordinary save must report a collision instead of adopting a concurrently created row');
 assert.deepEqual(JSON.parse(row.payload),winner,'First completed record must remain unchanged');
});

test('ifAbsent quick-save preserves an already saved record',async()=>{
 const h=harness();
 await h.save('library',{toolId:'notion',name:'Keep name',status:'using',note:'Keep note'},undefined,'notion');
 const result=await h.call(h.workspace.POST,{action:'save',ifAbsent:true,kind:'library',target:'notion',payload:{name:'Quick',status:'interested'}});
 assert.equal(result.status,200);assert.equal(result.data.alreadyExists,true);assert.equal(result.data.record.payload.note,'Keep note');
});

test('two authenticated owners can link the same tool without changing each other',async()=>{
 const h=harness();const a=await h.save('library',{name:'Alpha',toolId:'notion',status:'using',note:'A'});
 h.user({userId:'beta',email:'beta@example.invalid'});
 const b=await h.save('library',{name:'Beta',toolId:'notion',status:'using',note:'B'});
 assert.equal(a.status,200);assert.equal(b.status,200);assert.notEqual(a.data.record.id,b.data.record.id);
 assert.equal(h.record(a.data.record.id).note,'A');
 assert.equal((await h.call(h.workspace.GET,null,'GET')).data.records.length,1);
});

test('subscription metadata link keeps its existing money terms, history versions and payment row',async()=>{
 const h=harness();
 const date='2026-09-15';
 const s=await h.save('subscription',{name:'Private custom notes',toolId:'',plan:'Existing monthly plan',amount:20000,currency:'KRW',cycle:'monthly',nextDate:date,status:'active',paymentRoute:'web',bundleId:'',taxStatus:'included',note:'Keep subscription note'});
 assert.equal(s.status,200);
 const payment=await h.save('payment',{subscriptionId:s.data.record.id,amount:20000,currency:'KRW',date,entryType:'charge',note:'Keep payment note'});
 assert.equal(payment.status,200);
 const list=(await h.call(h.workspace.GET,null,'GET')).data.records;
 const original=list.find(r=>r.id===s.data.record.id);
 const oldPayment=h.sql.prepare('SELECT * FROM private_records WHERE id=?').get(payment.data.record.id);
 const result=await h.save('subscription',{...original.payload,toolId:'notion'},s.data.record.id);
 assert.equal(result.status,200);
 const reread=(await h.call(h.workspace.GET,null,'GET')).data.records.find(r=>r.id===s.data.record.id);
 assert.deepEqual(reread.payload.termsHistory.versions,original.payload.termsHistory.versions);
 for(const key of ['amount','currency','cycle','nextDate','plan','note'])assert.equal(reread.payload[key],original.payload[key]);
 assert.equal(reread.payload.toolId,'notion');
 assert.deepEqual(h.sql.prepare('SELECT * FROM private_records WHERE id=?').get(payment.data.record.id),oldPayment);
});
