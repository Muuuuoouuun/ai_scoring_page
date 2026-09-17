import raw from '@/data/catalog.json';
import {rankCatalog,interpretQuery,type SearchOptions} from './catalog-search';
import {similarTools} from './tool-similarity';
export {similarTools} from './tool-similarity';
export type Feature={name:string;description:string;status:'supported'|'conditional'|'unknown';condition:string;sourceUrl:string};
export type Tool={id:string;name:string;kind:'ai-app'|'model'|'saas';vendor:string;category:string;summary:string;description:string;homepage:string;logo:string;logoSource:string;logoNote?:string;aliases?:string[];pricing:string;korean:string;platforms:string[];useCases:string[];features:Feature[];limitations:string[];sourceUrls:string[];checkedAt:string;latestUpdate:{id?:string;revision?:number;title:string;summary:string;publishedAt:string|null;sourceUrl:string;audience?:string;rollout?:string};feedScope?:string;feedUrl?:string};
export const catalog=raw as Tool[];
export const categories:Record<string,string>={all:'전체',research:'리서치',writing:'문서·글쓰기',image:'디자인·이미지',development:'개발',productivity:'생산성','project-management':'프로젝트 관리',collaboration:'협업',video:'영상',audio:'음성·음악',automation:'자동화'};
export const kindLabels:Record<string,string>={'ai-app':'AI 앱',model:'AI 모델',saas:'SaaS'};
export function findTool(id:string){return catalog.find(t=>t.id===id);}
export function suggestTools(name:string,url:string,items:Tool[]=catalog){
 const normalized=name.normalize('NFKC').trim().toLowerCase();
 const host=(input:string)=>{try{const u=new URL(input);return u.protocol==='https:'?u.hostname.toLowerCase().replace(/^www\./,''):'';}catch{return '';}};
 const givenHost=host(url);
 return items.filter(t=>[t.name,t.id,...t.aliases||[]].some(n=>n.normalize('NFKC').trim().toLowerCase()===normalized)||Boolean(givenHost&&host(t.homepage)===givenHost));
}
export function relatedTools(tool:Tool,items:Tool[]=catalog){return similarTools(tool,items).slice(0,2).map(t=>t.tool);}
export function searchCatalog(query:string,options:SearchOptions={}){return rankCatalog(catalog,query,options);}
export function interpretCatalogQuery(query:string){return interpretQuery(query,catalog);}
