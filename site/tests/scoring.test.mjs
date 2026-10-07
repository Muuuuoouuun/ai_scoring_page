import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {harness} from './api-harness.mjs';

const now=()=> '2026-10-04T00:00:00Z';
const plain=value=>JSON.parse(JSON.stringify(value));
function seed(h,{id,userId=id,toolId='chatgpt',kind='review',status='published',title=id,task='보고서 작성',plan='Free',usedAt='2026-09-10',updatedAt='2026-10-03T12:00:00Z',ratings=null,author='합성 작성자',body='로컬 합성 경험',affiliation='none'}){
  h.sql.prepare('INSERT INTO posts(id,user_id,author,kind,tool_id,title,body,task,plan,used_at,affiliation,ratings,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,userId,author,kind,toolId,title,body,task,plan,usedAt,affiliation,typeof ratings==='string'?ratings:ratings===null?null:JSON.stringify(ratings),status,updatedAt,updatedAt);
}
async function scores(h,query='tool=chatgpt'){
  const response=await h.scores.GET(new Request('https://example.invalid/api/scores?'+query));
  return {status:response.status,data:await response.json()};
}
function scoring(h){
  assert.ok(fs.existsSync(fileURLToPath(new URL('../lib/scoring.ts',import.meta.url))),'shared scoring module must exist');
  return h.load('lib/scoring.ts');
}

test('score sample separates unrated reviews from each axis response and actual distribution',async()=>{
  const h=harness(undefined,{now});
  seed(h,{id:'quality',ratings:{quality:4}});
  seed(h,{id:'efficiency',ratings:{efficiency:2}});
  seed(h,{id:'unrated'});
  const {status,data}=await scores(h);
  assert.equal(status,200);
  assert.equal(data.sample,3);
  assert.equal(data.ratedSample,2);
  assert.deepEqual(data.axes.quality,{value:4,count:1,distribution:[0,0,0,1,0],fractionalCount:0});
  assert.deepEqual(data.axes.efficiency,{value:2,count:1,distribution:[0,1,0,0,0],fractionalCount:0});
  assert.equal(data.axes.korean,undefined);
});

test('distributions retain disagreeing actual votes rather than deriving them from the mean',async()=>{
  const h=harness(undefined,{now});
  for(const [index,value] of [1,1,5].entries())seed(h,{id:'vote-'+index,ratings:{quality:value}});
  const {data}=await scores(h);
  assert.deepEqual(data.axes.quality,{value:2.3,count:3,distribution:[2,0,0,0,1],fractionalCount:0});
});

test('historically valid fractional ratings keep their arithmetic without invented integer bins',async()=>{
  const h=harness(undefined,{now});
  const written=await h.call(h.community.POST,{kind:'review',toolId:'chatgpt',author:'합성 작성자',title:'소수점 경험',body:'로컬 합성 경험',task:'보고서 작성',plan:'Free',usedAt:'2026-09-10',ratings:{quality:2.5,efficiency:1.25},publicConsent:true});
  assert.equal(written.status,201);
  seed(h,{id:'integer',ratings:{quality:5}});
  const {data}=await scores(h);
  assert.equal(data.ratedSample,2);
  assert.deepEqual(data.axes.quality,{value:3.8,count:2,distribution:[0,0,0,0,1],fractionalCount:1});
  assert.deepEqual(data.axes.efficiency,{value:1.3,count:1,distribution:[0,0,0,0,0],fractionalCount:1});
  for(const axis of Object.values(data.axes))assert.equal(axis.distribution.reduce((sum,count)=>sum+count,0)+axis.fractionalCount,axis.count);
  assert.equal(data.recentReviews.find(review=>review.id===written.data.id).ratings.quality,2.5);
});

test('malformed and noncanonical saved ratings cannot crash or contaminate aggregation',async()=>{
  const h=harness(undefined,{now});
  for(const [id,ratings] of Object.entries({broken:'{broken',array:'[1,2,3]',scalar:'4',null:'null',invalid:{quality:null,korean:0,value:6,workflow:'4',unknown:5},partial:{quality:5,efficiency:null,unknown:4}}))seed(h,{id,ratings});
  const {status,data}=await scores(h);
  assert.equal(status,200);
  assert.equal(data.sample,6);
  assert.equal(data.ratedSample,1);
  assert.deepEqual(data.axes,{quality:{value:5,count:1,distribution:[0,0,0,0,1],fractionalCount:0}});
  assert.deepEqual(data.recentReviews.find(review=>review.id==='partial').ratings,{quality:5});
});

test('filters run after latest published review selection and evidence shares the aggregate scope',async()=>{
  const h=harness(undefined,{now});
  seed(h,{id:'old',userId:'alpha',task:'보고서 작성',ratings:{quality:5},updatedAt:'2026-10-01T00:00:00Z'});
  seed(h,{id:'new',userId:'alpha',task:'자료 조사',ratings:{quality:2},updatedAt:'2026-10-02T00:00:00Z'});
  seed(h,{id:'beta',userId:'beta',task:'보고서 작성',ratings:{quality:3}});
  seed(h,{id:'hidden-newer',userId:'beta',task:'자료 조사',status:'hidden',ratings:{quality:1},updatedAt:'2026-10-04T00:00:00Z'});
  seed(h,{id:'other-tool',toolId:'claude',ratings:{quality:1}});
  const {data}=await scores(h,'tool=chatgpt&task='+encodeURIComponent('보고서 작성')+'&plan=Free');
  assert.equal(data.sample,1);
  assert.equal(data.ratedSample,1);
  assert.deepEqual(data.axes.quality,{value:3,count:1,distribution:[0,0,1,0,0],fractionalCount:0});
  assert.deepEqual(data.recentReviews.map(review=>review.id),['beta']);
  assert.deepEqual(data.tasks.slice().sort(),['보고서 작성','자료 조사'].sort());
  assert.deepEqual(data.plans,['Free']);
});

test('review evidence is newest first, limited to five and ordered consistently for timestamp ties',async()=>{
  const h=harness(undefined,{now});
  for(let index=1;index<=7;index++)seed(h,{id:'review-'+index,title:'경험 '+index,usedAt:'2026-09-0'+index,updatedAt:'2026-10-0'+index+'T00:00:00Z',ratings:{quality:index%5+1}});
  seed(h,{id:'tie-a',userId:'same',ratings:{quality:1},updatedAt:'2026-10-08T00:00:00Z'});
  seed(h,{id:'tie-z',userId:'same',ratings:{quality:5},updatedAt:'2026-10-08T00:00:00Z'});
  const {data}=await scores(h);
  assert.equal(data.sample,8);
  assert.ok(Array.isArray(data.recentReviews),'response includes recent reviews from the aggregate sample');
  assert.deepEqual(data.recentReviews.map(review=>review.id),['tie-z','review-7','review-6','review-5','review-4']);
  assert.deepEqual(data.recentReviews[0],{id:'tie-z',title:'tie-z',task:'보고서 작성',plan:'Free',usedAt:'2026-09-10',updatedAt:'2026-10-08T00:00:00Z',ratings:{quality:5},author:'합성 작성자',excerpt:'로컬 합성 경험',affiliation:'none'});
  assert.deepEqual(data.usedAtRange,{earliest:'2026-09-01',latest:'2026-09-10'});
  assert.equal(data.latest,'2026-10-08T00:00:00Z');
});

test('empty conditions have explicit absent dates, responses and evidence',async()=>{
  const h=harness(undefined,{now});
  seed(h,{id:'existing',ratings:{quality:4}});
  const {data}=await scores(h,'tool=chatgpt&plan=Pro');
  assert.equal(data.sample,0);
  assert.equal(data.ratedSample,0);
  assert.deepEqual(data.axes,{});
  assert.deepEqual(data.recentReviews,[]);
  assert.deepEqual(data.usedAtRange,{earliest:null,latest:null});
  assert.equal(data.latest,null);
});

test('an unrated latest review supersedes older scores until its public status is removed',async()=>{
  const h=harness(undefined,{now});
  seed(h,{id:'older-rated',userId:'same',ratings:{quality:5},updatedAt:'2026-10-01T00:00:00Z'});
  seed(h,{id:'newer-unrated',userId:'same',ratings:{},updatedAt:'2026-10-02T00:00:00Z'});
  const current=(await scores(h)).data;
  assert.equal(current.sample,1);
  assert.equal(current.ratedSample,0);
  assert.deepEqual(current.axes,{});
  assert.deepEqual(current.recentReviews.map(review=>review.id),['newer-unrated']);
  h.sql.prepare("UPDATE posts SET status='deleted' WHERE id=?").run('newer-unrated');
  const restored=(await scores(h)).data;
  assert.equal(restored.sample,1);
  assert.equal(restored.ratedSample,1);
  assert.deepEqual(restored.axes.quality,{value:5,count:1,distribution:[0,0,0,0,1],fractionalCount:0});
  assert.deepEqual(restored.recentReviews.map(review=>review.id),['older-rated']);
});

test('aggregate helper rejects impossible use dates and preserves update date meaning',()=>{
  const h=harness(undefined,{now}),{aggregateScores}=scoring(h);
  const reviews=[
    {id:'a',title:'a',task:'보고서 작성',plan:'Free',used_at:'2026-02-30',updated_at:'2026-10-03T12:00:00Z',ratings:'{"quality":3}'},
    {id:'b',title:'b',task:'보고서 작성',plan:'Free',used_at:'2026-09-09',updated_at:'2026-10-01T12:00:00Z',ratings:null},
    {id:'c',title:'c',task:'보고서 작성',plan:'Free',used_at:'2024-02-29',updated_at:'2026-10-02T12:00:00Z',ratings:'{}'}
  ];
  const data=plain(aggregateScores(reviews));
  assert.deepEqual(data.usedAtRange,{earliest:'2024-02-29',latest:'2026-09-09'});
  assert.equal(data.latest,'2026-10-03T12:00:00Z');
  assert.equal(data.recentReviews[0].usedAt,null);
  assert.equal(data.ratedSample,1);
});

test('shared labels and descriptions cover the five established rating axes',()=>{
  const h=harness(undefined,{now}),{ratingAxes,ratingDescriptions}=scoring(h);
  assert.deepEqual(plain(ratingAxes),{quality:'결과 품질',efficiency:'작업 효율',korean:'한국어',value:'비용 대비',workflow:'작업 연결'});
  assert.deepEqual(Object.keys(ratingDescriptions),Object.keys(ratingAxes));
  assert.ok(Object.values(ratingDescriptions).every(description=>typeof description==='string'&&description.length>10));
});

test('rating sanitation reads canonical own properties and does not mutate its input',()=>{
  const h=harness(undefined,{now}),{sanitizeRatings}=scoring(h);
  const input=Object.assign(Object.create({quality:5}),{efficiency:4,workflow:Infinity,korean:NaN,value:2.5,unknown:3});
  assert.deepEqual(plain(sanitizeRatings(input)),{efficiency:4,value:2.5});
  assert.equal(input.value,2.5);
  assert.equal(input.unknown,3);
  assert.deepEqual(plain(sanitizeRatings('{"quality":1,"__proto__":{"efficiency":5},"constructor":5}')),{quality:1});
});

test('recent public reviews expose their chosen nickname, plain text excerpt and declared affiliation',async()=>{
  const h=harness(undefined,{now});
  for(const [index,affiliation] of ['none','maker','sponsored'].entries()){
    seed(h,{id:'public-'+index,author:'공개 닉네임 '+index,body:'<b>원문 그대로</b>\n자료 검토 경험 '+index,affiliation,ratings:{quality:2.5}});
  }
  const {status,data}=await scores(h);
  assert.equal(status,200);
  assert.equal(data.sample,3);
  for(const [index,affiliation] of ['none','maker','sponsored'].entries()){
    const review=data.recentReviews.find(review=>review.id==='public-'+index);
    assert.equal(review.author,'공개 닉네임 '+index);
    assert.equal(review.excerpt,'<b>원문 그대로</b>\n자료 검토 경험 '+index);
    assert.equal(review.affiliation,affiliation);
    assert.deepEqual(review.ratings,{quality:2.5});
    assert.equal(review.user_id,undefined);
    assert.equal(review.body,undefined,'the full public body stays at the original review link');
  }
});

test('excerpts preserve complete Unicode code points and add an ellipsis only after 180 characters',()=>{
  const h=harness(undefined,{now}),{aggregateScores}=scoring(h);
  const exact='🧪'.repeat(180),prefix='가🧪'.repeat(90);
  const fixtures=[
    {id:'empty',body:'',expected:''},
    {id:'short',body:'한글\n🧪 기록',expected:'한글\n🧪 기록'},
    {id:'exact',body:exact,expected:exact},
    {id:'long',body:prefix+'뒤에 이어지는 경험',expected:prefix+'…'}
  ];
  const data=plain(aggregateScores(fixtures.map(fixture=>({id:fixture.id,title:fixture.id,task:'보고서 작성',plan:'Free',used_at:'2026-09-10',updated_at:'2026-10-03T00:00:00Z',ratings:null,body:fixture.body}))));
  for(const fixture of fixtures){
    const review=data.recentReviews.find(review=>review.id===fixture.id);
    assert.equal(review.excerpt,fixture.expected);
    assert.equal(Array.from(review.excerpt).length,fixture.id==='long'?181:Array.from(fixture.body).length);
  }
});

test('older helper callers and absent public metadata receive neutral display defaults',()=>{
  const h=harness(undefined,{now}),{aggregateScores}=scoring(h);
  const base={title:'경험',task:'보고서 작성',plan:'Free',used_at:null,updated_at:'2026-10-03T00:00:00Z',ratings:null};
  const data=plain(aggregateScores([
    {...base,id:'missing'},
    {...base,id:'empty',author:' \n\t',body:null,affiliation:null},
    {...base,id:'unknown',author:null,affiliation:'unknown'}
  ]));
  for(const review of data.recentReviews){
    assert.equal(review.author,'사용자');
    assert.equal(review.excerpt,'');
    assert.equal(review.affiliation,'none');
  }
});

test('new public metadata follows latest-account selection before filters and never exposes excluded sources',async()=>{
  const h=harness(undefined,{now});
  seed(h,{id:'old',userId:'same',author:'이전 닉네임',body:'이전 업무 원문',task:'보고서 작성',updatedAt:'2026-10-01T00:00:00Z'});
  seed(h,{id:'new',userId:'same',author:'현재 닉네임',body:'현재 업무 원문',task:'자료 조사',affiliation:'maker',updatedAt:'2026-10-02T00:00:00Z'});
  seed(h,{id:'included',author:'참여자',body:'공개된 보고서 경험',affiliation:'sponsored',ratings:{quality:4}});
  for(const status of ['hidden','deleted'])seed(h,{id:status,status,author:'비공개 '+status,body:'공개 제외 '+status});
  seed(h,{id:'discussion',kind:'discussion',author:'대화 작성자',body:'평가가 아닌 글'});
  seed(h,{id:'other-tool',toolId:'claude',author:'다른 도구 작성자',body:'다른 도구 원문'});
  const privateRecord=await h.save('library',{name:'개인 도구',status:'interested',note:'개인 메모 미리보기 금지'});
  assert.equal(privateRecord.status,200);
  h.user(null);
  const {status,data}=await scores(h,'tool=chatgpt&task='+encodeURIComponent('보고서 작성'));
  assert.equal(status,200);
  assert.equal(data.sample,1);
  assert.deepEqual(data.recentReviews.map(review=>({id:review.id,author:review.author,excerpt:review.excerpt,affiliation:review.affiliation})),[{id:'included',author:'참여자',excerpt:'공개된 보고서 경험',affiliation:'sponsored'}]);
  const serialized=JSON.stringify(data);
  for(const excluded of ['이전 업무 원문','현재 업무 원문','비공개 hidden','비공개 deleted','평가가 아닌 글','다른 도구 원문','개인 메모 미리보기 금지'])assert.ok(!serialized.includes(excluded),excluded);
  assert.equal(data.recentReviews[0].user_id,undefined);
});
