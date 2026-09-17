import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './api-harness.mjs';

const base={name:'Test subscription',amount:30000,currency:'KRW',cycle:'monthly',nextDate:'2026-09-15',status:'active',paymentRoute:'web',bundleId:'',endDate:'',remainingPayments:null};
const review={kind:'review',toolId:'chatgpt',author:'A tester',title:'Actual test review',body:'Test body',task:'Report writing',plan:'Free',usedAt:'2026-09-10',ratings:{quality:4},publicConsent:true};
test('API enforces authentication, cross-origin rejection and strips identity input',async()=>{const h=harness();h.user(null);assert.equal((await h.call(h.workspace.POST,{action:'save',kind:'library',payload:{}})).status,401);h.user({userId:'alpha',email:'alpha@example.invalid'});assert.equal((await h.call(h.workspace.POST,{},'POST',{Origin:'https://other.invalid'})).status,403);const r=await h.save('library',{name:'Private',status:'using',userId:'beta'});assert.equal(r.status,200);assert.equal(h.sql.prepare('SELECT user_id FROM private_records WHERE id=?').get(r.data.record.id).user_id,'alpha');});
test('account isolation covers read, update, delete, parent references and export',async()=>{const h=harness(),a=await h.save('subscription',base);h.user({userId:'beta',email:'beta@example.invalid'});assert.equal((await h.call(h.workspace.GET,null,'GET')).data.records.length,0);assert.equal((await h.save('subscription',{...base,name:'Hacked'},a.data.record.id)).status,404);assert.equal((await h.call(h.workspace.POST,{action:'delete',kind:'subscription',id:a.data.record.id})).status,404);assert.equal((await h.save('payment',{subscriptionId:a.data.record.id,amount:1,currency:'KRW',date:'2026-09-12'})).status,400);const exportRoute=h.load('app/api/export/route.ts');assert.equal((await h.call(exportRoute.GET,null,'GET')).data.records.length,0);assert.equal(h.record(a.data.record.id).name,base.name);});
test('quick-save never overwrites an existing private note or use status',async()=>{const h=harness();await h.save('library',{name:'ChatGPT',toolId:'chatgpt',status:'using',purpose:'Keep',note:'Private note'},undefined,'chatgpt');const r=await h.call(h.workspace.POST,{action:'save',ifAbsent:true,kind:'library',target:'chatgpt',payload:{name:'ChatGPT',status:'interested'}});assert.equal(r.data.record.payload.note,'Private note');assert.equal(r.data.record.payload.status,'using');});
test('bundle edits update shared payment conditions atomically; conflicting new rows rejected',async()=>{const h=harness(),a=await h.save('subscription',{...base,bundleId:'bundle'}),b=await h.save('subscription',{...base,bundleId:'bundle',name:'Bundle second'});assert.equal(b.status,200);const first=(await h.call(h.workspace.GET,null,'GET')).data.records.find(r=>r.id===a.data.record.id).payload.termsHistory.versions[0];const edited=await h.terms(a.data.record.id,{action:'correct',supersedes:first.id,effectiveFrom:first.effectiveFrom,reason:'Confirmed shared terms',terms:{...h.record(a.data.record.id),amount:35000,nextDate:'2026-10-01',anchorDate:'2026-10-01'}});assert.equal(edited.status,200);assert.equal(h.record(b.data.record.id).amount,35000);assert.equal(h.record(b.data.record.id).nextDate,'2026-10-01');assert.equal((await h.save('subscription',{...base,bundleId:'bundle',amount:40000})).status,400);});
test('cancellation corrections clear end dates and referenced subscriptions remain intact',async()=>{const h=harness(),s=await h.save('subscription',base),c=await h.save('cancellation',{subscriptionId:s.data.record.id,stage:'confirmed',paymentRoute:'web',endDate:'2026-09-30'});assert.equal(c.status,200);assert.equal(h.record(s.data.record.id).status,'cancelled');const edited=await h.save('cancellation',{...h.record(c.data.record.id),stage:'requested',endDate:''},c.data.record.id);assert.equal(edited.status,200);assert.equal(h.record(s.data.record.id).endDate,null);assert.equal((await h.call(h.workspace.POST,{action:'delete',kind:'subscription',id:s.data.record.id})).status,409);});
test('review mutation preserves kind and account ownership; ordinary edit works',async()=>{const h=harness(),p=await h.call(h.community.POST,review);assert.equal(p.status,201);assert.equal((await h.call(h.community.POST,{...review,id:p.data.id,title:'Edited'})).status,200);assert.equal((await h.call(h.community.POST,{...review,id:p.data.id,kind:'discussion',task:'',plan:'',usedAt:'',ratings:undefined})).status,400);h.user({userId:'beta',email:'beta@example.invalid'});assert.equal((await h.call(h.community.POST,{...review,id:p.data.id})).status,404);assert.equal((await h.call(h.community.DELETE,{id:p.data.id},'DELETE')).status,404);});
test('ratings count the latest review once per account and reject future dates',async()=>{const h=harness();const a=await h.call(h.community.POST,review);h.sql.prepare('UPDATE posts SET updated_at=? WHERE id=?').run('2026-09-01T00:00:00Z',a.data.id);const b=await h.call(h.community.POST,{...review,ratings:{quality:2}});assert.equal(b.status,201);const r=await h.scores.GET(new Request('https://example.invalid/api/scores?tool=chatgpt'));const data=await r.json();assert.equal(data.sample,1);assert.equal(data.axes.quality.value,2);assert.equal(data.axes.quality.count,1);assert.equal((await h.call(h.community.POST,{...review,usedAt:'2099-01-01'})).status,400);});
test('remaining charges generate reminders; generation deduplicates and respects in-app opt-out',async()=>{const h=harness(),billing=h.load('lib/billing.ts');await h.save('settings',{interests:[],includeAlternatives:false,inApp:true,email:false});await h.save('subscription',{...base,nextDate:billing.today(),status:'cancelled',remainingPayments:1});const n=h.load('lib/notifications.ts');assert.equal((await n.generateNotifications('alpha')).created,1);assert.equal((await n.generateNotifications('alpha')).created,0);assert.equal((await h.call(h.notices.GET,null,'GET')).data.notifications.length,1);const settings=h.sql.prepare("SELECT id FROM private_records WHERE kind='settings'").get();await h.save('settings',{interests:[],includeAlternatives:false,inApp:false,email:true},settings.id);assert.equal((await h.call(h.notices.GET,null,'GET')).data.notifications.length,0);});
test('email address is server-controlled and missing transport is not treated as success',async()=>{const h=harness();const r=await h.save('settings',{interests:[],includeAlternatives:false,inApp:false,email:true,emailAddress:'somebody@example.invalid'});assert.equal(r.data.record.payload.emailAddress,'alpha@example.invalid');delete h.env.RESEND_API_KEY;assert.equal((await h.save('settings',{interests:[],includeAlternatives:false,inApp:true,email:true})).status,503);});
test('account deletion removes private records and ratings while preserving other users replies',async()=>{const h=harness();await h.save('subscription',base);const p=await h.call(h.community.POST,review);h.user({userId:'beta',email:'beta@example.invalid'});const reply=await h.call(h.community.POST,{kind:'reply',parentId:p.data.id,toolId:'chatgpt',author:'Beta',title:'Reply',body:'Keep this reply',publicConsent:true});assert.equal(reply.status,201);h.user({userId:'alpha',email:'alpha@example.invalid'});assert.equal((await h.call(h.workspace.DELETE,{confirmation:'wrong'},'DELETE')).status,400);assert.equal((await h.call(h.workspace.DELETE,{confirmation:'내 기록 삭제'},'DELETE')).status,200);assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM private_records WHERE user_id='alpha'").get().n,0);const removed=h.sql.prepare('SELECT * FROM posts WHERE id=?').get(p.data.id);assert.equal(removed.body,'');assert.equal(removed.ratings,null);assert.equal(removed.user_id,'deleted');assert.equal(h.sql.prepare('SELECT body FROM posts WHERE id=?').get(reply.data.id).body,'Keep this reply');});

test('source changes remain pending review across unchanged responses and 304 checks',async()=>{let content='first',notModified=false;const h=harness(async url=>url.includes('logo')?new Response('logo',{headers:{'content-type':'image/png'}}):notModified?new Response(null,{status:304}):new Response('<title>Official</title>'+content));const sync=h.load('lib/source-sync.ts');await sync.syncTool('claude');content='second';await sync.syncTool('claude');assert.equal(h.sql.prepare("SELECT status FROM source_snapshots WHERE id='claude:content'").get().status,'review_needed');await sync.syncTool('claude');assert.equal(h.sql.prepare("SELECT status FROM source_snapshots WHERE id='claude:content'").get().status,'review_needed');notModified=true;await sync.syncTool('claude');assert.equal(h.sql.prepare("SELECT status FROM source_snapshots WHERE id='claude:content'").get().status,'review_needed');});

test('moderation requires the configured administrator and can hide and restore contributions',async()=>{const h=harness(),admin=h.load('app/api/admin/route.ts');assert.equal((await h.call(admin.GET,null,'GET')).status,403);const post=await h.call(h.community.POST,review);h.env.ADMIN_USER_IDS='alpha';assert.equal((await h.call(admin.GET,null,'GET')).status,200);assert.equal((await h.call(admin.POST,{action:'hide',id:post.data.id})).status,200);assert.equal(h.sql.prepare('SELECT status FROM posts WHERE id=?').get(post.data.id).status,'hidden');assert.equal((await h.call(admin.POST,{action:'restore',id:post.data.id})).status,200);assert.equal(h.sql.prepare('SELECT status FROM posts WHERE id=?').get(post.data.id).status,'published');h.user({userId:'beta'});assert.equal((await h.call(admin.POST,{action:'hide',id:post.data.id})).status,403);});

test('global search finds public content and excludes hidden posts and private records',async()=>{
 const h=harness(),content=h.load('lib/content.ts');
 const p=await h.call(h.community.POST,{kind:'discussion',author:'Tester',title:'유일한검색검증',body:'공개 검색 대상',publicConsent:true});
 await h.save('library',{name:'비공개검색검증',status:'using'});h.user(null);
 const search=h.load('app/api/search/route.ts');
 const query=async(q,type='all')=>(await search.GET(new Request('https://example.invalid/api/search?q='+encodeURIComponent(q)+'&type='+type))).json();
 assert.ok((await query(content.guides[0].title)).results.some(r=>r.type==='guide'));
 assert.ok((await query(content.events[0].title)).results.some(r=>r.type==='event'));
 assert.ok((await query(content.updates[0].title)).results.some(r=>r.type==='news'));
 assert.ok((await query('ChatGPT','tool')).results.every(r=>r.type==='tool'));
 assert.equal((await query('유일한검색검증')).results[0].type,'community');
 h.sql.prepare("UPDATE posts SET status='hidden' WHERE id=?").run(p.data.id);
 assert.equal((await query('유일한검색검증')).results.length,0);
 assert.equal((await query('비공개검색검증')).results.length,0);
 assert.equal((await query('%')).results.length,0);
});
test('saved comparison retains private choice and outcome across edit, quick-save and export',async()=>{
 const h=harness(),payload={type:'comparison',target:'chatgpt,claude',title:'ChatGPT · Claude 비교',reason:'문서 작업용',outcome:'초안 작성 후 직접 수정',note:'개인 메모'};
 const r=await h.save('saved',payload,undefined,'comparison:chatgpt,claude');assert.equal(r.status,200);assert.equal(r.data.record.payload.outcome,payload.outcome);
 const again=await h.call(h.workspace.POST,{action:'save',kind:'saved',ifAbsent:true,target:'comparison:chatgpt,claude',payload:{type:'comparison',target:payload.target,title:payload.title}});assert.equal(again.data.record.payload.reason,payload.reason);
 const exported=await h.call(h.load('app/api/export/route.ts').GET,null,'GET');assert.ok(JSON.stringify(exported.data).includes(payload.outcome));
});
test('queued email revalidates current interests and never emails eligibility-unknown promotions',async()=>{
 const sent=[];const h=harness(async(url,options)=>{sent.push(JSON.parse(options.body).subject);return Response.json({id:'mock-id'});},{now:()=>"2026-09-12T00:00:00.000Z"});
 const s=await h.save('settings',{interests:['gemini'],includeAlternatives:false,inApp:true,email:true,emailMode:'matched',emailTimeZone:'UTC',emailTime:'00:00'});assert.equal(s.data.record.payload.emailTimingConfirmed,true);
 const n=h.load('lib/notifications.ts');await n.generateNotifications('alpha');
 assert.equal((await h.call(h.notices.GET,null,'GET')).data.email.state,'ready');assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM email_outbox WHERE status='queued'").get().n,1);
 assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM email_outbox o JOIN notifications n ON n.id=o.notification_id WHERE n.source_key LIKE 'promotion:%'").get().n,0);
 await h.save('settings',{interests:[],includeAlternatives:false,inApp:true,email:true},s.data.record.id);
 assert.equal((await n.deliverEmailForUser('alpha')).sent,0);assert.equal(sent.length,0);
});
test('incomplete subscription and dated price conditions survive persistence',async()=>{
 const h=harness(),payload={...base,nextDate:null,amountBasis:'perSeat',seats:null,taxStatus:'excluded',taxAmount:null,priceChangesAt:'2026-10-01',renewalAmount:40000,pricingMode:'hybrid',usageBudget:50000};
 const r=await h.save('subscription',payload);assert.equal(r.status,200);assert.equal(h.record(r.data.record.id).nextDate,null);assert.equal(h.record(r.data.record.id).renewalAmount,40000);
});
test('refund requires an owned compatible charge and cannot exceed its remaining balance',async()=>{
 const h=harness(),s=await h.save('subscription',base),charge=await h.save('payment',{subscriptionId:s.data.record.id,amount:20000,currency:'KRW',date:'2026-09-12',entryType:'charge'});
 const payload={subscriptionId:s.data.record.id,amount:5000,currency:'KRW',date:'2026-09-12',entryType:'refund',refundOfId:charge.data.record.id};
 const r=await h.save('payment',payload);assert.equal(r.status,200);assert.equal(r.data.record.payload.entryType,'refund');
 assert.equal((await h.save('payment',{...payload,amount:16000})).status,400);
 assert.equal((await h.save('payment',{...payload,currency:'USD'})).status,400);
 assert.equal((await h.call(h.workspace.POST,{action:'delete',kind:'payment',id:charge.data.record.id})).status,409);
 const other=await h.save('payment',{subscriptionId:s.data.record.id,amount:30000,currency:'KRW',date:'2026-09-12'});
 assert.equal((await h.save('payment',{...payload,refundOfId:other.data.record.id},charge.data.record.id)).status,400);
});
test('source review survives failed fetch then 304 and unchanged recovery',async()=>{
 let content='a',mode=200;
 const h=harness(async url=>url.includes('logo')?new Response('logo',{headers:{'content-type':'image/png'}}):mode===304?new Response(null,{status:304}):new Response('<title>Official</title>'+content,{status:mode}));
 const sync=h.load('lib/source-sync.ts');await sync.syncTool('claude');content='b';await sync.syncTool('claude');mode=503;await sync.syncTool('claude');mode=304;await sync.syncTool('claude');
 assert.equal(h.sql.prepare("SELECT status FROM source_snapshots WHERE id='claude:content'").get().status,'review_needed');mode=200;await sync.syncTool('claude');assert.equal(JSON.parse(h.sql.prepare("SELECT payload FROM source_snapshots WHERE id='claude:content'").get().payload).needsReview,true);
});
test('hiding an owned notice persists topic preferences, excludes old notices and cancels email',async()=>{
 const sent=[],h=harness(async()=>{sent.push(1);return Response.json({id:'mock'});},{now:()=>"2026-09-12T00:00:00.000Z"});
 const preference=await h.save('settings',{interests:['chatgpt'],includeAlternatives:false,inApp:true,email:true,emailMode:'matched',emailTimeZone:'UTC',emailTime:'00:00'});assert.equal(preference.data.record.payload.emailTimingConfirmed,true);await h.load('lib/notifications.ts').generateNotifications('alpha');assert.equal((await h.call(h.notices.GET,null,'GET')).data.email.state,'ready');assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM email_outbox WHERE status='queued'").get().n,1);
 const notice=h.sql.prepare('SELECT id FROM notifications LIMIT 1').get();
 h.user({userId:'beta',email:'beta@example.invalid'});assert.equal((await h.call(h.notices.POST,{action:'hide',id:notice.id})).status,404);
 h.user({userId:'alpha',email:'alpha@example.invalid'});assert.equal((await h.call(h.notices.POST,{action:'hide',id:notice.id})).status,200);
 assert.equal((await h.call(h.notices.GET,null,'GET')).data.notifications.length,0);
 assert.equal((await h.load('lib/notifications.ts').deliverEmailForUser('alpha')).sent,0);assert.equal(sent.length,0);
 const settings=h.sql.prepare("SELECT payload FROM private_records WHERE kind='settings'").get();assert.ok(JSON.parse(settings.payload).hiddenTopics.includes('update:chatgpt'));
});
test('explicit billing occurrence matching rejects duplicate bundle charges and incompatible currencies',async()=>{
 const h=harness(undefined,{now:()=>"2026-09-15T12:00:00.000Z"}),s=await h.save('subscription',{...base,bundleId:'suite'}),s2=await h.save('subscription',{...base,name:'Suite peer',bundleId:'suite'});
 const p={subscriptionId:s.data.record.id,amount:30000,currency:'KRW',date:'2026-09-16',plannedDate:'2026-09-15'};
 const charge=await h.save('payment',p);assert.equal(charge.status,200);assert.equal(charge.data.record.payload.plannedDate,p.plannedDate);
 assert.equal((await h.save('payment',{...p,subscriptionId:s2.data.record.id})).status,409);
 assert.equal((await h.save('payment',{...p,plannedDate:'2026-10-15',currency:'USD'})).status,400);
 assert.equal((await h.save('payment',{...p,plannedDate:'2026-09-14'})).status,400);
});
test('billing anchors cannot silently change paid occurrences, and next dates must align',async()=>{
 const h=harness(),s=await h.save('subscription',{...base,bundleId:'suite'}),peer=await h.save('subscription',{...base,bundleId:'suite'});
 await h.save('payment',{subscriptionId:s.data.record.id,amount:30000,currency:'KRW',date:'2026-09-15',plannedDate:'2026-09-15'});
 assert.equal((await h.save('subscription',{...base,bundleId:'suite',nextDate:'2026-09-16',anchorDate:'2026-09-16'},peer.data.record.id)).status,409);
 assert.equal((await h.save('subscription',{...base,bundleId:'suite',nextDate:'2026-10-01'},s.data.record.id)).status,400);
 assert.equal((await h.terms(s.data.record.id,{action:'append',effectiveFrom:'2026-10-01',reason:'Next confirmed cycle',terms:{...base,bundleId:'suite',anchorDate:'2026-09-15',nextDate:'2026-10-15'}})).status,200);
});
test('legacy bundle migration accepts matching anchors and rejects contradictory personal shares',async()=>{
 const h=harness(),s=await h.save('subscription',{...base,bundleId:'legacy',personalShare:5000});const old=h.record(s.data.record.id);delete old.anchorDate;
 h.sql.prepare('UPDATE private_records SET payload=? WHERE id=?').run(JSON.stringify(old),s.data.record.id);
 assert.equal((await h.save('subscription',{...base,bundleId:'legacy',personalShare:5000})).status,200);
 assert.equal((await h.save('subscription',{...base,bundleId:'legacy',personalShare:9000})).status,400);
});
test('a matched bill is not regenerated as an upcoming payment reminder',async()=>{
 const h=harness(),date=h.load('lib/billing.ts').today(),s=await h.save('subscription',{...base,nextDate:date});
 await h.save('payment',{subscriptionId:s.data.record.id,amount:30000,currency:'KRW',date,plannedDate:date});
 await h.load('lib/notifications.ts').generateNotifications('alpha');
 assert.equal(h.sql.prepare("SELECT COUNT(*) n FROM notifications WHERE source_key LIKE 'billing:%'").get().n,0);
});
test('saving stale settings preserves hidden topics unless the user explicitly restores them',async()=>{
 const h=harness(),payload={interests:['chatgpt'],includeAlternatives:false,inApp:true,email:false,hiddenTopics:[]},s=await h.save('settings',payload);await h.load('lib/notifications.ts').generateNotifications('alpha');const n=h.sql.prepare('SELECT id FROM notifications LIMIT 1').get();await h.call(h.notices.POST,{action:'hide',id:n.id});await h.save('settings',payload,s.data.record.id);assert.ok(h.record(s.data.record.id).hiddenTopics.includes('update:chatgpt'));await h.save('settings',{...payload,restoreTopics:['update:chatgpt']},s.data.record.id);assert.equal(h.record(s.data.record.id).hiddenTopics.length,0);
});
