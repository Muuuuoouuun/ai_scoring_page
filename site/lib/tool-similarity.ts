import type {Tool,Feature} from './catalog';

type Capability={id:string;label:string;matches:(name:string,description:string)=>boolean};
const capabilities:Capability[]=[
 {id:'writing',label:'문서·글 작성',matches:n=>/문서.*(?:작성|초안)|글 작성|공동 문서|글쓰기|문서 편집|문장.*(?:작성|다듬)|카피라이팅/.test(n)},
 {id:'research',label:'자료 조사·검색',matches:(n,d)=>/리서치|research|웹 검색|심층 조사|자료 조사|출처.*검색/.test(n)||/웹 답변/.test(n)&&/웹.*검색/.test(d)},
 {id:'summary',label:'자료 요약',matches:(n,d)=>/요약|summary/.test(n)||/(?:파일|문서|자료).*(?:분석|작업)/.test(n)&&/요약/.test(d)},
 {id:'coding',label:'코드 작성·수정',matches:(n,d)=>/코드.*(?:생성|작성|완성|수정|편집|제안)|코딩|코드 자동완성|개발 작업 위임/.test(n)||/agent|에이전트|code/.test(n)&&/개발 작업|코드.*(?:작성|수정|편집)/.test(d)},
 {id:'image-generation',label:'이미지 생성',matches:n=>/이미지(?:·영상)? 생성|텍스트.*이미지.*생성|text.to.image/.test(n)},
 {id:'image-editing',label:'이미지 편집',matches:(n,d)=>/이미지.*(?:편집|채우기)|생성형 채우기|사진 편집|배경 제거/.test(n)||/편집|디자인|사진|이미지/.test(n)&&/배경 제거|이미지.*(?:편집|채우기)|사진 편집/.test(d)},
 {id:'video-generation',label:'영상 생성',matches:n=>/(?:영상|동영상|비디오) 생성|text.to.video|image.to.video/.test(n)},
 {id:'voice-generation',label:'음성 생성',matches:n=>/음성(?:·음악)? 생성|음성 합성|텍스트.*음성|text.to.speech|더빙/.test(n)},
 {id:'transcription',label:'음성 전사',matches:n=>/전사|음성.*텍스트|speech.to.text/.test(n)},
 {id:'projects',label:'업무·프로젝트 관리',matches:(n,d)=>!/영상|비디오|이미지|창작/.test(n)&&(/프로젝트.*(?:관리|보드|보기|이니셔티브|계획)|칸반|이슈|스프린트|타임라인|간트|planner|팀 간 계획|(?:업무|작업|할 일).*(?:관리|배정)/.test(n)||/보드/.test(n)&&/담당자|마감일|업무.*관리/.test(d))||/데이터베이스 보기/.test(n)&&/보드|캘린더/.test(d)},
 {id:'database',label:'구조화된 데이터 관리',matches:(n,d)=>/데이터베이스|관계형 데이터|테이블 관리/.test(n)||/데이터/.test(n)&&/표|테이블|레코드/.test(d)&&/관리|연결|보기/.test(n+' '+d)},
 {id:'team-messaging',label:'팀 채널·메시지',matches:n=>/채널|팀 채팅|채팅.*협업|채팅·팀|팀 대화|메시지/.test(n)},
 {id:'meetings',label:'실시간 음성·영상 회의',matches:n=>/허들|화상 회의|영상 회의|음성.*영상 회의|온라인 회의/.test(n)&&!/전사|요약|노트|녹취/.test(n)},
 {id:'workflow',label:'업무 흐름 자동화',matches:n=>/워크플로|자동화|시나리오|트리거.*액션/.test(n)},
 {id:'prototyping',label:'화면 프로토타입',matches:n=>/프로토타입|인터랙션 디자인/.test(n)},
 {id:'visual-input',label:'시각 자료 입력·분석',matches:(n,d)=>/(?:이미지|시각).*?(?:입력|분석)/.test(n)||/멀티모달 입력/.test(n)&&/이미지|시각/.test(d)},
 {id:'structured-output',label:'구조화된 출력',matches:n=>/구조화된 출력|json 출력/.test(n)},
 {id:'tool-calling',label:'도구 호출·활용',matches:n=>/도구.*(?:호출|활용)|함수 호출|도구를 쓰는/.test(n)},
 {id:'whiteboard',label:'협업 화이트보드',matches:n=>/화이트보드|무한 캔버스|협업 캔버스/.test(n)},
];
export type SimilarityMatch={id:string;label:string;sourceFeatures:Feature[];candidateFeatures:Feature[]};
export type SimilarTool={tool:Tool;matches:SimilarityMatch[];score:number};
function evidence(tool:Tool){
 const features=tool.features.filter(f=>f.status!=='unknown'&&f.sourceUrl);
 return capabilities.map(c=>({id:c.id,label:c.label,features:features.filter(f=>c.matches(f.name.normalize('NFKC').toLowerCase(),f.description.normalize('NFKC').toLowerCase()))})).filter(c=>c.features.length);
}
/** Shared documented capabilities, not a quality score or a claim of interchangeable plans. */
export function similarTools(source:Tool,items:Tool[]):SimilarTool[]{
 const origin=evidence(source);
 return items.filter(t=>t.id!==source.id&&(t.kind==='model')===(source.kind==='model')).map(tool=>{
  const target=evidence(tool),matches=origin.flatMap(a=>{const b=target.find(b=>b.id===a.id);return b?[{id:a.id,label:a.label,sourceFeatures:a.features,candidateFeatures:b.features}]:[];});
  return {tool,matches,score:matches.length};
 }).filter(t=>t.matches.length>0).sort((a,b)=>b.score-a.score||a.tool.name.localeCompare(b.tool.name,'ko'));
}
