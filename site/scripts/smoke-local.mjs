import assert from 'node:assert/strict';
const base='http://localhost:5173';
const routes=['/','/explore','/search?q=notion','/tools/chatgpt','/tools/gemini-3-8-flash','/compare?ids=chatgpt,claude','/recommend','/news','/news?tab=events','/news?tab=feed','/news/notion','/guides','/guides/notion-task-board','/community','/my','/about','/privacy','/sources','/ranking','/promotions'];
for(const route of routes){const response=await fetch(base+route);assert.equal(response.status,200,route);await response.body?.cancel();}
assert.equal((await fetch(base+'/tools/nonexistent')).status,404);
assert.equal((await fetch(base+'/api/workspace')).status,401);
assert.equal((await fetch(base+'/api/workspace',{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'forged@example.invalid'}})).status,401);
const signin=await fetch(base+'/signin-with-chatgpt?return_to=/my',{redirect:'manual'});assert.equal(signin.status,302);const cookie=signin.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
async function api(path,body,method='POST'){const response=await fetch(base+path,{method,headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},...body?{body:JSON.stringify(body)}:{}});return {status:response.status,data:await response.json()};}
const p={action:'save',kind:'library',payload:{name:'HTTP smoke verification',status:'using',purpose:'Verify storage',note:'Disposable local test'}};
const saved=await api('/api/workspace',p);assert.equal(saved.status,200);const id=saved.data.record.id;
try{const edited=await api('/api/workspace',{...p,id,payload:{...p.payload,note:'Updated and persisted'}});assert.equal(edited.status,200);const loaded=await api('/api/workspace',null,'GET');assert.equal(loaded.data.records.find(r=>r.id===id).payload.note,'Updated and persisted');const csrf=await fetch(base+'/api/workspace',{method:'POST',headers:{Cookie:cookie,Origin:'https://other.invalid','Content-Type':'application/json'},body:JSON.stringify(p)});assert.equal(csrf.status,403);}finally{const removed=await api('/api/workspace',{action:'delete',kind:'library',id});assert.equal(removed.status,200);}
console.log(JSON.stringify({publicRoutes:routes.length,notFound:true,anonymousDenied:true,spoofedIdentityDenied:true,signInReturn:true,persistedCRUD:true,crossOriginDenied:true}));
