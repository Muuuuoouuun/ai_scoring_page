import type {Feature,Tool} from './catalog';

export type SearchOptions={category?:string;kind?:string;free?:boolean;korean?:boolean;owned?:string[]};
type Exclusion={type:'category'|'kind'|'tool'|'purpose';value:string;label:string};
export type QueryMeaning={positive:string;exclusions:Exclusion[];unresolvedExclusions:string[];requirements:string[];free:boolean};
export type SearchMatch=Tool&{relevance:number;matchedFeatures:Feature[];matchedUseCases:string[];unverifiedRequirements:string[]};
const normalize=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'");
const stop=new Set('ai 앱 서비스 도구 사용 필요 무료 유료 한국어 기능 방법 업무 작업 하고 하여 하려고 하려는 하는 할 싶어요 싶습니다 원해요 원합니다 필요해요 필요합니다 만들 만들고 만든 만드는 만들기 만들고싶어요 보낼 보내기 보고 하고싶어요 해주세요 해줘 주세요 찾고 찾기 찾는 찾아줘 알려줘 추천 추천해줘 싶다 수 있는 있을 없는 위한 위해 대한 여러 다른 함께 통해 한 번 좀 더 및 또는 그리고 그런데 중 중에서 에서 있어요 있습니다 있어야'.split(' '));
function tokens(text:string){return [...new Set(normalize(text).split(/[^\p{L}\p{N}+#]+/u).map(w=>w.replace(/(?:별로|으로|에서|에게|에는|에서는|하고|하기|하는|하며|하면|해서|부터|까지|처럼|보다|들과|들의|들을|들은|이라도|이라면|인가요|이에요|이요|나요|거나|세요|해요|을|를|은|는|이|가|의|로|와|과|도)$/u,'')).filter(w=>w.length>=2&&!stop.has(w)))];}
function hasTerm(text:string,term:string){if(term.length>2)return text.includes(term);return text.split(/[^\p{L}\p{N}]+/u).some(w=>w===term||w.startsWith(term)&&/^(?:을|를|은|는|이|가|의|로|와|과|도|에|에서|으로|하고|하는|하기|합니다|하도록|습니다|고|기|한|해|자|별|부터|까지|용)/u.test(w.slice(term.length)));}

// General task vocabulary; no product IDs or fixed benchmark sentences.
const concepts=[
 ['문서','글','글쓰기','초안','제안서','보고서','문장','퇴고','다듬','표현','writing'],
 ['리서치','논문','조사','근거','출처','인용','research'],
 ['요약','브리핑','요점','핵심','summary'],
 ['코딩','코드','개발','리팩터링','자동완성','디버깅','programming'],
 ['이미지','그림','일러스트','시안','아트','image'],
 ['프로토타입','인터랙션','화면 흐름','클릭','prototype'],
 ['회의','미팅','허들','meeting'],
 ['할 일','할일','마감일','상태','보드','캘린더','일정','task'],
 ['자동화','워크플로','트리거','액션','폼','모듈','반복','automation'],
 ['인증','회원가입','로그인','authentication'],
 ['배포','호스팅','cdn','ci/cd','deployment'],
 ['채널','메시지','커뮤니케이션'],
 ['영상','동영상','비디오','video'],
 ['음성','더빙','전사','효과음','음악','audio'],
 ['프로젝트','pms','칸반','스프린트','간트','백로그','project'],
];
const categoryTerms:Record<string,[string,string[]]>={image:['디자인·이미지',['이미지','디자인','일러스트','그림']],development:['개발',['개발']],writing:['문서·글쓰기',['문서','글쓰기','보고서']],research:['리서치',['논문','리서치']],automation:['자동화',['자동화']],productivity:['생산성',['생산성']],'project-management':['프로젝트 관리',['프로젝트 관리','pms']],collaboration:['협업',['협업']],video:['영상',['영상','동영상','비디오']],audio:['음성·음악',['음성','음악','오디오']]};
const kindTerms:Record<string,[string,string[]]>={model:['AI 모델',['api 모델','ai 모델','모델']], 'ai-app':['AI 앱',['ai 앱']],saas:['SaaS',['saas']]};

export function interpretQuery(query:string,items:Tool[]):QueryMeaning{
 const requirements:string[]=[];
 // Environment and quantitative requirements need their own evidence. A keyword
 // match or a free product plan must never certify them implicitly.
 let input=normalize(query).replace(/(?:제외하지|빼지)\s*말고/gu,'포함');
 for(const [pattern,label] of [
  [/(?:오프라인|(?:인터넷|네트워크)(?:\s*연결)?\s*없이)/gu,'오프라인 사용'],
  [/(?:(?:기기|장치|컴퓨터)\s*(?:안|내|내부)에서만|온디바이스|로컬\s*(?:처리|에서만))/gu,'기기 내부에서만 처리'],
  [/(?:상업용|상업적\s*사용)/gu,'상업용 사용'],
  [/(?:무제한|한도\s*없이)/gu,'사용량 무제한'],
 ] as const){
  const optional='(?:은|는|이|가|을|를)?\\s*(?:필요\\s*없(?:고|어요|습니다|어)?|원하지\\s*않(?:고|아요|습니다|아)?|아닌|아니어도|없어도|제외(?:하고)?|말고|빼고)';
  input=input.replace(new RegExp('('+pattern.source+')(?:'+optional+')?','gu'),(whole:string,term:string,at:number)=>{
   if(at>0&&/[\p{L}\p{N}]/u.test(input[at-1]))return whole;
   if(whole===term)requirements.push(label);
   return ' ';
  });
 }
 input=input.replace(/(?:\d+|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*단계/gu,m=>{requirements.push(m+' 처리');return ' ';});
 const exclusions:Exclusion[]=[],unresolvedExclusions:string[]=[];let positive='',cursor=0;
 const marker=/(?:말고|빼고|아닌|없이|제외(?!하지|하진)(?:하고|한|해(?:주세요|줘|요)?)?|원하지\s*않(?:는|아요|습니다|음|아)?|필요\s*없(?:는|어요|습니다|음|어)?)/gu;
 for(const m of input.matchAll(marker)){
  const before=input.slice(cursor,m.index),candidates:{start:number;end:number;exclusion:Exclusion}[]=[];
  const add=(terms:string[],exclusion:Exclusion)=>{for(const term of terms){const n=normalize(term),at=before.lastIndexOf(n);if(at>=0&&(at===0||!/[\p{L}\p{N}]/u.test(before[at-1]))&&(!/[a-z0-9]/.test(n.at(-1)!)||!/[a-z0-9]/.test(before[at+n.length]||'')))candidates.push({start:at,end:at+n.length,exclusion});}};
  for(const t of items)add([t.name,...t.aliases||[]],{type:'tool',value:t.id,label:t.name});
  for(const [value,[label,terms]] of Object.entries(categoryTerms))add(terms,{type:'category',value,label});
  for(const [value,[label,terms]] of Object.entries(kindTerms))add(terms,{type:'kind',value,label});
  add(['코딩','코드'],{type:'purpose',value:'coding',label:'코딩 중심 도구'});
  candidates.sort((a,b)=>b.end-a.end||a.start-b.start||Number(b.exclusion.type==='tool')-Number(a.exclusion.type==='tool'));
  const last=candidates.find(c=>/^(?:\s*(?:생성|제작|관련|도구|툴|서비스|분야|유형|앱|기능|모델|생성기))*(?:은|는|을|를|이|가|만|도)?\s*$/u.test(before.slice(c.end)));
  if(last){
   exclusions.push(last.exclusion);let start=last.start;
   for(const c of candidates){if(c.end>start)continue;const between=before.slice(c.end,start).replace(/(?:도구|분야|서비스)/g,'').trim();if(/^(?:[,·/\s]*(?:와|과|및|또는|그리고|랑|이랑|하고|나|이나)?[,·/\s]*)$/.test(between)){exclusions.push(c.exclusion);start=c.start;}}
   positive+=before.slice(0,start)+' ';
  }else{const cut=Math.max(before.lastIndexOf(','),before.lastIndexOf('.'),before.lastIndexOf(';'),before.lastIndexOf('\n'))+1;positive+=before.slice(0,cut)+' ';unresolvedExclusions.push(before.slice(cut).trim());}
  cursor=m.index!+m[0].length;
 }
 positive+=input.slice(cursor);
 const free=/(?:^|\s)무료(?:로|인|가|\s|$)/u.test(positive)&&!/(?:무료(?:가|는|로)?\s*(?:아니|아닌|아닐|필요\s*없|상관\s*없)|무료든)/u.test(positive);
 return {positive:positive.trim(),exclusions:exclusions.filter((e,i,a)=>a.findIndex(x=>x.type===e.type&&x.value===e.value)===i),unresolvedExclusions:unresolvedExclusions.filter(Boolean),requirements:[...new Set(requirements)],free};
}

export function rankCatalog(items:Tool[],query:string,options:SearchOptions={}):SearchMatch[]{
 const meaning=interpretQuery(query,items),direct=tokens(meaning.positive),browsing=!query.trim()||(!meaning.positive&&meaning.exclusions.length>0),activeConcepts=concepts.filter(group=>group.some(term=>hasTerm(meaning.positive,term)));
 // Task objects constrain generic verbs: an image input is not image creation,
 // and writing a prompt is not a document-writing feature. Summary alone is
 // deliberately not an object, so it cannot override a requested research topic.
 const targets=[concepts[0],concepts[1],concepts[3],concepts[4],concepts[5],concepts[6],concepts[7],concepts[8],concepts[9],concepts[10],concepts[11],concepts[12],concepts[13],concepts[14]];
 const subjects=targets.filter(group=>activeConcepts.includes(group)&&!(group===concepts[0]&&activeConcepts.includes(concepts[1]))&&!(group===concepts[4]&&activeConcepts.includes(concepts[5])));
 const generatingImage=subjects.includes(concepts[4])&&/(?:생성|만들|제작)/u.test(meaning.positive);
 const writingAction=/(?:작성|초안|글쓰기|퇴고|다듬|편집|생성|만들|만듭)/u;
 const drafting=subjects.includes(concepts[0])&&writingAction.test(meaning.positive);
 const summarizingDocument=subjects.includes(concepts[0])&&activeConcepts.includes(concepts[2]);
 const matchesObject=(raw:string)=>{
  const text=normalize(raw);
  return !subjects.length||subjects.some(group=>{
   const document=group===concepts[0];
   const object=group.some(term=>hasTerm(text,term))||(document&&summarizingDocument&&/(?:소스|자료|파일|브리핑)/u.test(text));
   if(!object)return false;
   if(generatingImage&&group===concepts[4]&&!/(?:생성|만들|제작)/u.test(text))return false;
   if(document&&drafting&&!writingAction.test(text))return false;
   if(document&&summarizingDocument&&!concepts[2].some(term=>hasTerm(text,term)))return false;
   return true;
  });
 };
 const evidenceTexts=items.map(t=>normalize([t.summary,t.description,...t.useCases,...t.features.map(f=>f.name+' '+f.description)].join(' ')));
 const weights=new Map(direct.map(term=>[term,1+Math.log(1+items.length/(1+evidenceTexts.filter(text=>hasTerm(text,term)).length))]));
 const score=(raw:string,expand=true)=>{const text=normalize(raw);let value=direct.reduce((n,term)=>n+(hasTerm(text,term)?weights.get(term)!:0),0);if(meaning.positive.length>1&&text.includes(meaning.positive))value+=8;if(expand)for(const group of activeConcepts)if(group.some(term=>hasTerm(text,term)))value+=1.25;return value;};
 return items.filter(t=>(!options.category||options.category==='all'||t.category===options.category)&&(!options.kind||options.kind==='all'||t.kind===options.kind)&&(!(options.free||meaning.free)||t.pricing.includes('무료'))&&(!options.korean||t.korean==='지원')&&(!options.owned||options.owned.includes(t.id))&&!meaning.exclusions.some(e=>e.type==='tool'?t.id===e.value:e.type==='kind'?t.kind===e.value:e.type==='purpose'?t.category==='development'||['코딩','코드'].some(term=>hasTerm(normalize(t.summary),term)):t.category===e.value)).map(t=>{
  const features=t.features.filter(f=>matchesObject(f.name+' '+f.description)).map(f=>({feature:f,score:score(f.name)*2+score(f.description)})).filter(f=>f.score>0).sort((a,b)=>b.score-a.score);
  const uses=t.useCases.filter(matchesObject).map(use=>({use,score:score(use)})).filter(u=>u.score>0).sort((a,b)=>b.score-a.score);
  const name=normalize(t.name),exact=name===meaning.positive||t.aliases?.some(a=>normalize(a)===meaning.positive);
  const names=[t.name,...t.aliases||[],t.vendor].join(' '),named=score(names,false)>0;
  const body=normalize([t.summary,t.description,...t.useCases,...t.features.map(f=>f.name+' '+f.description)].join(' '));
  const coverage=direct.filter(term=>hasTerm(body,term)).length/Math.max(1,direct.length);
  const sufficient=named||(subjects.length?features.length>0||uses.length>0||matchesObject(t.summary):coverage>=0.3);
  const relevance=browsing?1:(!sufficient||!direct.length&&!activeConcepts.length?0:(exact?100:0)+score(names,false)*4+(features[0]?.score||0)*3+features.slice(1,3).reduce((v,f)=>v+f.score,0)+(uses[0]?.score||0)*2+(matchesObject(t.summary)?score(t.summary):0)+score(t.description,false)*0.3);
  return {...t,relevance,matchedFeatures:features.slice(0,3).map(f=>f.feature),matchedUseCases:uses.slice(0,2).map(u=>u.use),unverifiedRequirements:meaning.requirements.map(r=>r+((options.free||meaning.free)?'의 무료 플랜 이용 범위':''))};
 }).filter(t=>t.relevance>0).sort((a,b)=>b.relevance-a.relevance||a.name.localeCompare(b.name));
}
