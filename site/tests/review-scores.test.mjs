import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';

function seed(h,overrides={}){
  const row={
    id:'review-1',user_id:'account-1',author:'Test author',kind:'review',tool_id:'chatgpt',
    title:'A public usage review',body:'A public experience',task:'Writing',plan:'Free',
    used_at:'2026-09-01',ratings:JSON.stringify({quality:4}),status:'published',
    created_at:'2026-09-02T00:00:00.000Z',updated_at:'2026-09-02T00:00:00.000Z',...overrides,
  };
  const fields=Object.keys(row);
  h.sql.prepare(`INSERT INTO posts(${fields.join(',')}) VALUES(${fields.map(()=>'?').join(',')})`).run(...Object.values(row));
  return row;
}

async function scores(h,filters={}){
  const query=new URLSearchParams({tool:'chatgpt',...filters});
  const response=await h.scores.GET(new Request('https://example.invalid/api/scores?'+query));
  assert.equal(response.status,200);
  return response.json();
}

for(const count of [0,1,4,5]){
  test(`scores expose ${count} actual reviews without inventing unscored axes`,async()=>{
    const h=harness();
    for(let i=0;i<count;i++)seed(h,{id:`review-${i}`,user_id:`account-${i}`,ratings:JSON.stringify({quality:i+1})});
    const result=await scores(h);
    assert.equal(result.sample,count);
    assert.equal(result.ratedReviewCount,count);
    assert.equal(result.evidenceTotal,count);
    assert.equal(result.evidence.length,count);
    assert.equal(result.axes.workflow,undefined);
    if(count===0){
      assert.deepEqual(result.axes,{});
      assert.equal(result.latest,null);
      assert.equal(result.usedAtRange,null);
      assert.deepEqual(result.tasks,[]);
      assert.deepEqual(result.plans,[]);
    }else{
      assert.deepEqual(result.axes.quality,{
        value:(count+1)/2,count,distribution:Array.from({length:5},(_,i)=>i<count?1:0),
      });
      assert.deepEqual(result.usedAtRange,{from:'2026-09-01',to:'2026-09-01'});
    }
  });
}

test('axis counts and distributions use only the reviews that answered each axis',async()=>{
  const h=harness();
  seed(h,{ratings:JSON.stringify({quality:1,korean:5})});
  seed(h,{id:'review-2',user_id:'account-2',ratings:JSON.stringify({quality:2})});
  seed(h,{id:'review-3',user_id:'account-3',ratings:JSON.stringify({quality:2,workflow:4})});
  seed(h,{id:'review-4',user_id:'account-4',ratings:null});
  const result=await scores(h);
  assert.equal(result.sample,4);
  assert.equal(result.ratedReviewCount,3);
  assert.deepEqual(result.axes,{
    quality:{value:1.7,count:3,distribution:[1,2,0,0,0]},
    korean:{value:5,count:1,distribution:[0,0,0,0,1]},
    workflow:{value:4,count:1,distribution:[0,0,0,1,0]},
  });
  assert.deepEqual(result.evidence.find(review=>review.id==='review-4').ratings,{});
});

test('malformed, scalar and invalid ratings do not fail or influence aggregation',async()=>{
  const h=harness();
  const invalid=['{broken','null','true','5','"five"','[1,2,3]',null,'{}',
    '{"quality":0,"efficiency":6,"korean":2.5,"value":"4","workflow":null,"unknown":5,"__proto__":{"quality":5},"constructor":5}'];
  invalid.forEach((ratings,i)=>seed(h,{id:`bad-${i}`,user_id:`bad-account-${i}`,ratings}));
  seed(h,{id:'valid',user_id:'valid-account',ratings:'{"quality":5,"efficiency":1,"unknown":5,"korean":false}'});
  const result=await scores(h);
  assert.equal(result.sample,invalid.length+1);
  assert.equal(result.ratedReviewCount,1);
  assert.deepEqual(result.axes,{
    quality:{value:5,count:1,distribution:[0,0,0,0,1]},
    efficiency:{value:1,count:1,distribution:[1,0,0,0,0]},
  });
  assert.deepEqual(result.evidence.find(review=>review.id==='valid').ratings,{quality:5,efficiency:1});
  assert.ok(result.evidence.filter(review=>review.id!=='valid').every(review=>Object.keys(review.ratings).length===0));
});

test('usage dates come from used_at while recency and evidence order come from updated_at',async()=>{
  const h=harness();
  seed(h,{id:'older-update',user_id:'older',used_at:'2026-09-10',updated_at:'2026-09-11T00:00:00.000Z'});
  seed(h,{id:'newer-update',user_id:'newer',used_at:'2026-08-01',updated_at:'2026-09-15T00:00:00.000Z'});
  for(const [i,used_at] of [null,'','not-a-date','2026-02-30'].entries()){
    seed(h,{id:`missing-date-${i}`,user_id:`missing-${i}`,used_at,updated_at:'2026-09-20T00:00:00.000Z'});
  }
  const result=await scores(h);
  assert.deepEqual(result.usedAtRange,{from:'2026-08-01',to:'2026-09-10'});
  assert.equal(result.latest,'2026-09-20T00:00:00.000Z');
  assert.deepEqual(result.evidence.map(review=>review.id),[
    'missing-date-3','missing-date-2','missing-date-1','missing-date-0','newer-update','older-update',
  ]);
  assert.ok(result.evidence.filter(review=>review.id.startsWith('missing-date')).every(review=>review.usedAt===null));
  const evidence=result.evidence.find(review=>review.id==='newer-update');
  assert.equal(evidence.usedAt,'2026-08-01');
  assert.equal(evidence.updatedAt,'2026-09-15T00:00:00.000Z');
});

test('task and plan filters apply after latest public review selection for each account and tool',async()=>{
  const h=harness();
  seed(h,{id:'alpha-old',user_id:'alpha',task:'Writing',plan:'Free',ratings:'{"quality":1}'});
  seed(h,{id:'alpha-new',user_id:'alpha',task:'Coding',plan:'Pro',ratings:'{"quality":5}',used_at:'2026-09-11',updated_at:'2026-09-12T00:00:00.000Z'});
  seed(h,{id:'alpha-other-tool',user_id:'alpha',tool_id:'claude',task:'Writing',plan:'Free',updated_at:'2026-09-15T00:00:00.000Z'});
  seed(h,{id:'beta-public',user_id:'beta',task:'Writing',plan:'Free',ratings:'{"quality":3}',used_at:'2026-08-20'});
  seed(h,{id:'beta-hidden',user_id:'beta',status:'hidden',task:'Coding',plan:'Pro',updated_at:'2026-09-14T00:00:00.000Z'});
  seed(h,{id:'gamma-free',user_id:'gamma',task:'Writing',plan:'Free',ratings:'{"quality":4}'});
  seed(h,{id:'delta-pro',user_id:'delta',task:'Writing',plan:'Pro',ratings:'{"quality":2}'});
  const result=await scores(h,{task:'Writing',plan:'Free'});
  assert.equal(result.sample,2);
  assert.equal(result.ratedReviewCount,2);
  assert.equal(result.axes.quality.value,3.5);
  assert.deepEqual(new Set(result.evidence.map(review=>review.id)),new Set(['beta-public','gamma-free']));
  assert.equal(result.evidenceTotal,2);
  assert.equal(result.latest,'2026-09-02T00:00:00.000Z');
  assert.deepEqual(result.usedAtRange,{from:'2026-08-20',to:'2026-09-01'});
  assert.deepEqual(new Set(result.tasks),new Set(['Writing','Coding']));
  assert.deepEqual(new Set(result.plans),new Set(['Free','Pro']));
  const absent=await scores(h,{task:'Coding',plan:'Free'});
  assert.equal(absent.sample,0);
  assert.deepEqual(absent.axes,{});
  assert.deepEqual(absent.evidence,[]);
  assert.equal(absent.usedAtRange,null);
  assert.equal(absent.latest,null);
});

test('same-timestamp latest review selection uses id and never revives older rated reviews',async()=>{
  const h=harness();
  seed(h,{id:'a-old',ratings:'{"quality":5}'});
  seed(h,{id:'z-latest',ratings:null});
  const result=await scores(h);
  assert.equal(result.sample,1);
  assert.equal(result.ratedReviewCount,0);
  assert.deepEqual(result.axes,{});
  assert.equal(result.evidence[0].id,'z-latest');
});

test('public score evidence excludes private records, hidden, deleted and other post kinds',async()=>{
  const h=harness();
  seed(h,{id:'public-review'});
  seed(h,{id:'hidden',user_id:'hidden',status:'hidden'});
  seed(h,{id:'deleted',user_id:'deleted',status:'deleted'});
  seed(h,{id:'discussion',user_id:'discussion',kind:'discussion'});
  seed(h,{id:'question',user_id:'question',kind:'question'});
  const stamp='2026-09-10T00:00:00.000Z';
  h.sql.prepare('INSERT INTO private_records(id,user_id,kind,target,payload,created_at,updated_at) VALUES(?,?,?,?,?,?,?)')
    .run('private','account-1','library','chatgpt',JSON.stringify({note:'Private note',ratings:{quality:1}}),stamp,stamp);
  h.user(null);
  const result=await scores(h);
  assert.equal(result.sample,1);
  assert.equal(result.evidenceTotal,1);
  assert.deepEqual(result.evidence,[{
    id:'public-review',title:'A public usage review',task:'Writing',plan:'Free',
    usedAt:'2026-09-01',updatedAt:'2026-09-02T00:00:00.000Z',ratings:{quality:4},
  }]);
  assert.equal(JSON.stringify(result).includes('Private note'),false);
});

test('evidence is capped at twenty while aggregation and total cover the full filtered population',async()=>{
  const h=harness();
  for(let i=0;i<23;i++){
    seed(h,{id:`review-${String(i).padStart(2,'0')}`,user_id:`account-${i}`,ratings:'{"quality":5}'});
  }
  const result=await scores(h);
  assert.equal(result.sample,23);
  assert.equal(result.ratedReviewCount,23);
  assert.equal(result.axes.quality.count,23);
  assert.deepEqual(result.axes.quality.distribution,[0,0,0,0,23]);
  assert.equal(result.evidenceTotal,23);
  assert.equal(result.evidence.length,20);
  assert.equal(result.evidence[0].id,'review-22');
  assert.equal(result.evidence.at(-1).id,'review-03');
});

test('unknown tools keep the existing not-found boundary',async()=>{
  const h=harness();
  const response=await h.scores.GET(new Request('https://example.invalid/api/scores?tool=not-a-tool'));
  assert.equal(response.status,404);
});

test('the pure aggregator accepts frozen input and does not reorder the supplied reviews',()=>{
  const h=harness(),{aggregateReviewScores}=h.load('lib/review-scores.ts');
  const reviews=Object.freeze([
    Object.freeze({id:'first',title:'First',task:'Writing',plan:'Free',ratings:'{"quality":1}',used_at:null,updated_at:'2026-09-01T00:00:00.000Z'}),
    Object.freeze({id:'second',title:'Second',task:'Writing',plan:'Pro',ratings:'{"quality":5}',used_at:null,updated_at:'2026-09-02T00:00:00.000Z'}),
  ]);
  const result=aggregateReviewScores(reviews,{task:'Writing'});
  assert.equal(result.axes.quality.value,3);
  assert.equal(result.evidence[0].id,'second');
  assert.equal(result.usedAtRange,null);
  assert.equal(reviews[0].id,'first');
  assert.equal(reviews[0].ratings,'{"quality":1}');
});
