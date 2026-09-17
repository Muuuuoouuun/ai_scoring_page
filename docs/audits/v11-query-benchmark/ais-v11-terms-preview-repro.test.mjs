import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {harness} from '/Users/bigmac_moon/dev/ai_score/site/tests/api-harness.mjs';

// This script reads Site source; all SQL is the harness's :memory: database.
// It executes the actual check() source with controlled proposal/date inputs.
// No React render, DOM interaction, Site write or network request is performed.
const require=createRequire('/Users/bigmac_moon/dev/ai_score/site/package.json');
const ts=require('typescript');
const source=fs.readFileSync('/Users/bigmac_moon/dev/ai_score/site/components/TermsEditor.tsx','utf8');
const checkSource=source.slice(source.indexOf(' function check('),source.indexOf(' async function save('));
assert.ok(checkSource.startsWith(' function check('));
const compiled=ts.transpileModule(checkSource+'\nglobalThis.invoke=check;',{
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}
}).outputText;
const h=harness();
const billing=h.load('lib/billing.ts');
const from='2026-09-12';
const base={name:'Isolated terms preview QA',amount:20000,currency:'KRW',cycle:'monthly',
  nextDate:'2026-10-01',anchorDate:'2026-10-01',status:'active',paymentRoute:'web',taxStatus:'unknown'};
const created=await h.save('subscription',base);
assert.equal(created.status,200);
const sid=created.data.record.id;
const futureTerms={...base,taxStatus:'included',personalShare:10000};
const appended=await h.terms(sid,{action:'append',effectiveFrom:'2026-10-01',reason:'Fixture future terms',terms:futureTerms});
assert.equal(appended.status,200);
const record=(await h.call(h.workspace.GET,null,'GET')).data.records.find(r=>r.id===sid);
assert.equal(record.payload.termsHistory.versions[0].effectiveFrom,from);
assert.equal(record.payload.termsHistory.versions[0].basis,'observed');
const history=record.payload.termsHistory;
const current=billing.activeTerms(history).filter(v=>v.effectiveFrom<=from).at(-1);
const future=billing.activeTerms(history).find(v=>v.effectiveFrom==='2026-10-01');

function preview(effective,selected=null){
  let result,error;
  const context={history,record,selected,reason:'V10 local preview',alreadyChanged:false,
    proposal:()=>selected?.terms||current.terms,
    today:()=>from,horizonEndDate:billing.horizonEndDate,summarizeContracts:billing.summarizeContracts,
    Date,FormData:class{constructor(form){this.form=form;}get(k){return this.form[k];}},
    setPreview:v=>{result=v;},setError:v=>{error=v;}};
  vm.runInNewContext(compiled,context);
  context.invoke({effectiveFrom:effective});
  return {result,error};
}
const sameDay=preview('2026-10-01');
assert.equal(sameDay.error,'');
assert.equal(sameDay.result.conflictingHistory,1);
assert.equal(Object.keys(sameDay.result.currencies).length,0);
assert.equal(sameDay.result.schedule.length,0);
assert.equal(sameDay.result.unknownFutureAmounts,0);
assert.equal(sameDay.result.pendingTerms,0);

const before=JSON.stringify(h.sql.prepare('SELECT * FROM private_records ORDER BY id').all());
const duplicate=await h.terms(sid,{action:'append',effectiveFrom:'2026-10-01',reason:'Duplicate candidate',terms:current.terms});
assert.equal(duplicate.status,400);
assert.equal(JSON.stringify(h.sql.prepare('SELECT * FROM private_records ORDER BY id').all()),before);

const normal=preview('2026-11-01');
assert.equal(normal.error,'');
assert.equal(normal.result.conflictingHistory,0);
assert.equal(normal.result.currencies.KRW.expected,240000);
assert.equal(normal.result.schedule.length,12);
const correction=preview('2026-10-01',future);
assert.equal(correction.error,'');
assert.equal(correction.result.conflictingHistory,0);
assert.equal(correction.result.currencies.KRW.expected,240000);
assert.equal(correction.result.schedule.length,12);
const corrected=await h.terms(sid,{action:'correct',supersedes:future.id,effectiveFrom:'2026-10-01',reason:'Correction candidate',terms:future.terms});
assert.equal(corrected.status,200);

function compact(p){return {error:p.error,conflictingHistory:p.result.conflictingHistory,
  currencies:p.result.currencies,scheduleCount:p.result.schedule.length,
  scheduleFirst:p.result.schedule[0]?.date,scheduleLast:p.result.schedule.at(-1)?.date,
  unknownFutureAmounts:p.result.unknownFutureAmounts,pendingTerms:p.result.pendingTerms};}
const evidence={checkedAt:new Date().toISOString(),mode:'read-only source, actual extracted check(), memory SQLite API',
  window:[from,billing.horizonEndDate(from,12)],sameDayAppend:compact(sameDay),
  sameDayApi:{...duplicate,allPrivateRecordsByteIdentical:true},newDayAppend:compact(normal),
  sameDayCorrection:compact(correction),sameDayCorrectionApiStatus:corrected.status};
fs.writeFileSync('/private/tmp/ais-v11-terms-preview-repro.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence,null,2));
h.sql.close();
