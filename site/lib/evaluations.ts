import raw from '@/data/evaluations.json';

export type ScoreAxis='functionality'|'uiux'|'reliability'|'comfort'|'pricing';
export type CapabilityLevel='full'|'partial'|'none';
export type Comparison={competitor:string;better:string;weaker:string};
export type HistoryEntry={date:string;title:string;change:string;risk:string;level:'high'|'medium'|'low'};
export type PlaybookEntry={title:string;how:string;tip:string};
export type ExternalRating={source:string;score:string;note?:string;url?:string};
export type Evaluation={
 sourceName:string;verdict:string;scores:Record<ScoreAxis,number>;
 impact:{judgmentSpeed:number;thinkingDepth:number;executionDensity:number;collaborationClarity:number};
 badges:{timeSaver:boolean;thinkCarefully:boolean;lockinRisk:boolean};
 pricingSummary:string;koreaNote?:string;comparisons:Comparison[];history:HistoryEntry[];playbook:PlaybookEntry[];
 externalRatings:ExternalRating[];capabilities?:Record<string,{level:CapabilityLevel;note?:string}>;
 roles?:string[];teamFit?:string[];sources:{label:string;url:string}[];checkedAt:string};

export const evaluations=raw as Record<string,Evaluation>;
export const axisLabels:Record<ScoreAxis,string>={functionality:'기능 완성도',uiux:'UI/UX',reliability:'에러·안정성',comfort:'쾌적도',pricing:'가격 합리성'};
export const impactLabels:Record<string,string>={judgmentSpeed:'판단 속도',thinkingDepth:'사고 깊이',executionDensity:'실행 밀도',collaborationClarity:'협업 명확성'};
export const badgeLabels:Record<string,string>={timeSaver:'시간 절약',thinkCarefully:'신중한 사용',lockinRisk:'락인 위험'};
export const capabilityLabels:Record<string,string>={freePlan:'무료 플랜',koreanSupport:'한국어 지원',aiAssistant:'AI 어시스턴트 내장',agentAutomation:'에이전트 자동화',apiIntegrations:'API·연동',teamAdmin:'팀 권한·관리자',dataExport:'데이터 내보내기',ssoSecurity:'SSO·보안',mobileApp:'모바일 앱',offlineLocal:'오프라인·로컬'};
export const levelLabels:Record<CapabilityLevel,string>={full:'지원',partial:'부분 지원',none:'미지원'};

/** 축별 가중치. 안정성과 기능을 가장 무겁게, 가격을 그다음으로 본다. */
const weights:Record<ScoreAxis,number>={functionality:0.25,uiux:0.15,reliability:0.25,comfort:0.15,pricing:0.2};
/** 외부 리뷰 사이트 신뢰 가중치. 결제 불만이 몰리는 곳은 낮게 본다. */
const sourceWeights:[RegExp,number][]=[[/\bg2\b/i,1],[/capterra/i,1],[/trustradius/i,1],[/product\s*hunt/i,0.8],[/app\s*store|google\s*play/i,0.8],[/chrome\s*web\s*store/i,0.7],[/trustpilot/i,0.5]];

export function sourceWeight(source:string){return sourceWeights.find(([p])=>p.test(source))?.[1]??0.6;}

/** '4.7/5' '9.1/10' '82%' 같은 표기를 100점으로 환산한다. 숫자로 읽을 수 없으면 null. */
export function parseRating(score:string){
 const text=score.trim(),fraction=text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
 let value:number|null=null,scale:number|null=null;
 if(fraction){value=Number(fraction[1]);scale=Number(fraction[2]);}
 else{const percent=text.match(/^(\d+(?:\.\d+)?)\s*%/),single=text.match(/^(\d+(?:\.\d+)?)(?:\s*점)?$/);
  if(percent){value=Number(percent[1]);scale=100;}
  else if(single){value=Number(single[1]);scale=value<=5?5:value<=10?10:100;}}
 if(value===null||scale===null||!Number.isFinite(value)||!Number.isFinite(scale)||scale<=0||value<0||value>scale)return null;
 return Math.round(value/scale*1000)/10;
}

export function editorialScore(scores:Record<ScoreAxis,number>){
 return Math.round((Object.keys(weights) as ScoreAxis[]).reduce((sum,key)=>sum+scores[key]*weights[key],0));
}

/** 숫자로 읽히는 외부 평점만 가중 평균한다. 설문 재인용·리뷰 건수는 제외된다. */
export function externalScore(ratings:ExternalRating[]){
 const parsed=ratings.flatMap(r=>{const value=parseRating(r.score);return value===null?[]:[{value,weight:sourceWeight(r.source)}];});
 if(!parsed.length)return null;
 const total=parsed.reduce((sum,p)=>sum+p.weight,0);
 return {score:Math.round(parsed.reduce((sum,p)=>sum+p.value*p.weight,0)/total),count:parsed.length};
}

export type Tier='strong'|'recommended'|'conditional'|'caution';
export const tierLabels:Record<Tier,string>={strong:'강력 추천',recommended:'추천',conditional:'조건부 추천',caution:'신중 검토'};
export const tierTone:Record<Tier,string>={strong:'green',recommended:'',conditional:'yellow',caution:'gray'};
export function tierOf(score:number):Tier{return score>=85?'strong':score>=75?'recommended':score>=65?'conditional':'caution';}

export type Verdict={editorial:number;external:{score:number;count:number}|null;composite:number;stars:number;tier:Tier};
/** 종합 = 편집 점수 70% + 외부 사이트 평점 30%. 외부 평점이 없으면 편집 점수만 쓴다. */
export function verdictOf(evaluation:Evaluation):Verdict{
 const editorial=editorialScore(evaluation.scores),external=externalScore(evaluation.externalRatings);
 const composite=external?Math.round(editorial*0.7+external.score*0.3):editorial;
 return {editorial,external,composite,stars:Math.round(composite/20*10)/10,tier:tierOf(composite)};
}

export function findEvaluation(toolId:string){return evaluations[toolId];}
/** 종합 점수 기준 순위. 동점은 같은 순위를 쓴다. */
export function evaluationRank(toolId:string){
 const entries=Object.entries(evaluations).map(([id,e])=>({id,score:verdictOf(e).composite})).sort((a,b)=>b.score-a.score);
 const index=entries.findIndex(e=>e.id===toolId);
 if(index<0)return null;
 const score=entries[index].score;
 return {rank:entries.findIndex(e=>e.score===score)+1,total:entries.length};
}
