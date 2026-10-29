import GitHubHub from '@/components/GitHubHub';
import '@/components/github-hub.css';
import {readGitHubFilters} from '@/lib/github-content';

export const metadata={
  title:'GitHub 동향',
  description:'공식 저장소와 릴리스로 확인한 AI 프로젝트의 최근 흐름, 꾸준히 살펴볼 기반 도구와 주요 이슈.',
};

export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const input=await searchParams,params=new URLSearchParams();
  for(const [key,value] of Object.entries(input))if(typeof value==='string')params.set(key,value);
  return <main id="main" className="container page github-hub"><GitHubHub initialFilters={readGitHubFilters(params)}/></main>;
}
