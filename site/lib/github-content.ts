import snapshot from '@/data/github-content.json';

export const githubSections={trends:'주목할 흐름',steady:'꾸준한 프로젝트',issues:'주요 이슈'} as const;
export const githubCategories={all:'모든 분야',coding:'코딩 도구',automation:'업무 자동화',models:'모델·추론',agents:'에이전트 개발',integration:'MCP·연동',security:'보안'} as const;
export type GitHubSection=keyof typeof githubSections;
export type GitHubCategory=keyof typeof githubCategories;
export type GitHubEntry={
  id:string;section:GitHubSection;category:Exclude<GitHubCategory,'all'>;name:string;repo:string;
  headline:string;summary:string;reason:string;nextStep:string;tags:string[];checkedAt:string;
  publishedAt?:string;issueType?:'security'|'migration'|'maintenance';scope?:string;
  release?:{version:string;publishedAt:string;url:string};sources:{label:string;url:string}[];
};
export type GitHubFilters={tab:GitHubSection;category:GitHubCategory;sort:'recent'|'curated';q:string};
export const emptyGitHubFilters:GitHubFilters={tab:'trends',category:'all',sort:'recent',q:''};
export const githubCheckedAt=snapshot.checkedAt;
export const githubEntries=snapshot.entries as GitHubEntry[];

export function readGitHubFilters(params:URLSearchParams):GitHubFilters{
  const tab=params.get('tab')||'trends',category=params.get('category')||'all';
  return {
    tab:Object.hasOwn(githubSections,tab)?tab as GitHubSection:'trends',
    category:Object.hasOwn(githubCategories,category)?category as GitHubCategory:'all',
    sort:params.get('sort')==='curated'?'curated':'recent',
    q:(params.get('q')||'').slice(0,160),
  };
}

export function githubQuery(filters:GitHubFilters){
  const params=new URLSearchParams();
  if(filters.tab!=='trends')params.set('tab',filters.tab);
  if(filters.category!=='all')params.set('category',filters.category);
  if(filters.sort!=='recent')params.set('sort',filters.sort);
  if(filters.q)params.set('q',filters.q);
  return params.toString();
}

export function filterGitHubEntries(entries:GitHubEntry[],filters:GitHubFilters){
  const words=filters.q.normalize('NFC').toLowerCase().trim().split(/\s+/).filter(Boolean);
  const result=entries.filter(entry=>{
    if(entry.section!==filters.tab||(filters.category!=='all'&&entry.category!==filters.category))return false;
    const searchable=[entry.name,entry.repo,entry.headline,entry.summary,entry.scope||'',entry.nextStep,...entry.tags].join(' ').normalize('NFC').toLowerCase();
    return words.every(word=>searchable.includes(word));
  });
  if(filters.sort==='recent')result.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
  return result;
}
