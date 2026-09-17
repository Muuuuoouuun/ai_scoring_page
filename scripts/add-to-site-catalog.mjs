/**
 * 서브에이전트가 만든 카탈로그 항목(JSON 배열들)을 검증한 뒤 site/data/catalog.json 에 추가합니다.
 *   node scripts/add-to-site-catalog.mjs <dir-with-batch-*.json> [--write]
 * --write 없이 실행하면 검증 결과만 출력합니다.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const catalogPath=path.join(root,"site/data/catalog.json");
const dir=process.argv[2];const write=process.argv.includes("--write");
if(!dir){console.error("usage: node scripts/add-to-site-catalog.mjs <dir> [--write]");process.exit(1);}

const CATEGORIES=["research","writing","image","development","productivity","project-management","collaboration","video","audio","automation"];
const KINDS=["ai-app","model","saas"];
const PLATFORMS=new Set(["웹","iOS","Android","데스크톱","macOS","Windows","Linux","CLI","IDE","API","VS Code","모바일","데스크톱 앱","Discord"]);
const KOREAN=["지원","확인 필요"];
const STATUS=["supported","conditional","unknown"];
const isHttps=(u)=>typeof u==="string"&&/^https:\/\/[^\s]+$/.test(u);
const host=(u)=>{try{return new URL(u).hostname.replace(/^www\./,"");}catch{return "";}};

const errors=[],warnings=[];
const err=(id,m)=>errors.push(`[${id}] ${m}`);
const warn=(id,m)=>warnings.push(`[${id}] ${m}`);

const catalog=JSON.parse(fs.readFileSync(catalogPath,"utf8"));
const existingIds=new Set(catalog.map(t=>t.id));
const existingNames=new Set(catalog.map(t=>t.name.toLowerCase()));

const files=fs.readdirSync(dir).filter(f=>/^batch-.*\.json$/.test(f)).sort();
if(!files.length){console.error("batch-*.json 파일이 없습니다:",dir);process.exit(1);}

const incoming=[];
for(const f of files){
 const arr=JSON.parse(fs.readFileSync(path.join(dir,f),"utf8"));
 if(!Array.isArray(arr))throw new Error(f+": 배열이 아닙니다");
 for(const t of arr)incoming.push({t,file:f});
}

const seen=new Set();
const validated=[];
for(const {t,file} of incoming){
 const id=String(t.id||"?");
 const req=["id","name","kind","vendor","category","summary","description","homepage","logoSource","pricing","korean","platforms","useCases","features","limitations","sourceUrls","checkedAt","latestUpdate"];
 for(const k of req)if(t[k]===undefined||t[k]===null||t[k]==="")err(id,`${k} 누락 (${file})`);
 if(!/^[a-z0-9-]+$/.test(id))err(id,"id 형식 오류 (소문자·숫자·하이픈)");
 if(existingIds.has(id))err(id,"이미 카탈로그에 있는 id");
 if(seen.has(id))err(id,"배치 안에서 id 중복");seen.add(id);
 if(t.name&&existingNames.has(String(t.name).toLowerCase()))err(id,"이미 카탈로그에 있는 이름");
 if(!KINDS.includes(t.kind))err(id,`kind 오류: ${t.kind}`);
 if(!CATEGORIES.includes(t.category))err(id,`category 오류: ${t.category}`);
 if(!KOREAN.includes(t.korean))err(id,`korean 값은 '지원' 또는 '확인 필요'여야 함: ${t.korean}`);
 if(!isHttps(t.homepage))err(id,`homepage URL 오류: ${t.homepage}`);
 if(!isHttps(t.logoSource))err(id,`logoSource URL 오류: ${t.logoSource}`);
 if(typeof t.summary==="string"&&t.summary.length>60)warn(id,`summary 길이 ${t.summary.length}`);
 if(typeof t.description==="string"&&t.description.length>200)warn(id,`description 길이 ${t.description.length}`);
 if(typeof t.pricing==="string"){
  const hasFree=/무료/.test(t.pricing);
  if(/체험/.test(t.pricing)&&hasFree&&!/무료 (플랜|이용|버전|일일|Starter|Hobby|Personal)/.test(t.pricing))warn(id,`pricing에 '무료'와 '체험'이 함께 있음 — 상시 무료 플랜이 없다면 '무료'를 빼야 필터가 맞음: "${t.pricing}"`);
 }
 if(!Array.isArray(t.platforms)||!t.platforms.length)err(id,"platforms 비어 있음");
 else for(const p of t.platforms)if(!PLATFORMS.has(p))warn(id,`platforms 어휘 밖: ${p}`);
 if(!Array.isArray(t.useCases)||t.useCases.length<3)err(id,"useCases 3개 미만");
 else for(const u of t.useCases)if(String(u).length>14)warn(id,`useCase 길이 초과: ${u}`);
 if(!Array.isArray(t.features)||t.features.length<3)err(id,"features 3개 미만");
 else{
  const home=host(t.homepage);
  t.features.forEach((f,i)=>{
   for(const k of ["name","description","status","sourceUrl"])if(!f[k])err(id,`features[${i}].${k} 누락`);
   if(f.condition===undefined){warn(id,`features[${i}].condition 누락 → 빈 문자열로 정규화`);f.condition="";}
   if(!STATUS.includes(f.status))err(id,`features[${i}].status 오류: ${f.status}`);
   if(f.status==="supported"&&f.condition)warn(id,`features[${i}] supported인데 condition이 있음`);
   if(f.status==="conditional"&&!f.condition)warn(id,`features[${i}] conditional인데 condition이 비어 있음`);
   if(!isHttps(f.sourceUrl))err(id,`features[${i}].sourceUrl 오류: ${f.sourceUrl}`);
   else{
    const h=host(f.sourceUrl);
    const related=h===home||h.endsWith("."+home)||home.endsWith("."+h)||h.split(".").slice(-2).join(".")===home.split(".").slice(-2).join(".");
    if(!related)warn(id,`features[${i}].sourceUrl 도메인이 공식 도메인과 다름: ${h} (homepage ${home})`);
   }
  });
 }
 if(!Array.isArray(t.limitations)||t.limitations.length<2)err(id,"limitations 2개 미만");
 if(!Array.isArray(t.sourceUrls)||t.sourceUrls.length<3)err(id,"sourceUrls 3개 미만");
 else for(const u of t.sourceUrls)if(!isHttps(u))err(id,`sourceUrls 항목 오류: ${u}`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(t.checkedAt)))err(id,`checkedAt 형식 오류: ${t.checkedAt}`);
 const lu=t.latestUpdate||{};
 for(const k of ["title","summary","sourceUrl","id"])if(!lu[k])err(id,`latestUpdate.${k} 누락`);
 if(lu.publishedAt!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(String(lu.publishedAt)))err(id,`latestUpdate.publishedAt 형식 오류: ${lu.publishedAt}`);
 if(lu.sourceUrl&&!isHttps(lu.sourceUrl))err(id,`latestUpdate.sourceUrl 오류: ${lu.sourceUrl}`);
 if(lu.revision!==1)warn(id,`latestUpdate.revision은 1이어야 함: ${lu.revision}`);
 if(lu.id&&!String(lu.id).startsWith(id+"-"))warn(id,`latestUpdate.id가 '${id}-'로 시작하지 않음: ${lu.id}`);
 if(t.feedUrl&&!isHttps(t.feedUrl))err(id,`feedUrl 오류: ${t.feedUrl}`);
 if(t.feedUrl&&!t.feedScope)warn(id,"feedUrl은 있는데 feedScope가 없음");
 // 정규화: 키 순서를 기존 항목과 맞추고 logo 경로를 붙입니다.
 const logosDir=path.join(root,"site/public/logos");
 const present=["svg","png","webp","jpg","ico"].find(e=>fs.existsSync(path.join(logosDir,`${id}.${e}`)));
 const ext=present||((t.logoSource.match(/\.(svg|png|webp|jpg|jpeg|ico)(?:\?|$)/i)||[])[1]||"png");
 if(!present)warn(id,`site/public/logos/${id}.* 정적 로고 파일이 없음 — 이미지가 깨집니다`);
 const norm={id,name:t.name,kind:t.kind,vendor:t.vendor,category:t.category,summary:t.summary,description:t.description,homepage:t.homepage,logoSource:t.logoSource,
  ...(t.logoNote?{logoNote:t.logoNote}:{}),...(Array.isArray(t.aliases)&&t.aliases.length?{aliases:t.aliases}:{}),
  pricing:t.pricing,korean:t.korean,platforms:t.platforms,useCases:t.useCases,
  features:(t.features||[]).map(f=>({name:f.name,description:f.description,status:f.status,condition:f.condition??"",sourceUrl:f.sourceUrl})),
  limitations:t.limitations,sourceUrls:[...new Set(t.sourceUrls)],checkedAt:t.checkedAt,
  latestUpdate:{title:lu.title,summary:lu.summary,publishedAt:lu.publishedAt??null,sourceUrl:lu.sourceUrl,audience:lu.audience||"원문에서 대상 플랜·계정 확인 필요",rollout:lu.rollout||"원문에서 제공 상태 확인 필요",id:lu.id,revision:1},
  ...(t.feedUrl?{feedUrl:t.feedUrl,feedScope:t.feedScope||""}:{}),
  logo:`/logos/${id}.${ext.toLowerCase()==="jpeg"?"jpg":ext.toLowerCase()}`};
 validated.push(norm);
}

console.log(`검증 대상 ${validated.length}개 (${files.join(", ")})`);
if(warnings.length){console.log(`경고 ${warnings.length}건:`);for(const w of warnings)console.log("  - "+w);}
if(errors.length){console.log(`오류 ${errors.length}건:`);for(const e of errors)console.log("  - "+e);process.exit(2);}
if(!write){console.log("검증 통과. --write 로 카탈로그에 추가합니다.");process.exit(0);}
const next=[...catalog,...validated];
fs.writeFileSync(catalogPath,JSON.stringify(next,null,2)+"\n");
console.log(`카탈로그 ${catalog.length} → ${next.length}개 (${validated.map(t=>t.id).join(", ")})`);
