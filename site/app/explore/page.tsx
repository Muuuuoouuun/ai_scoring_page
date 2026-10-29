import Explore from '@/components/Explore';
import {readExploreFilters} from '@/lib/explore-filters';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const input=await searchParams,params=new URLSearchParams();
  for(const [key,value] of Object.entries(input))if(typeof value==='string')params.set(key,value);
  return <main id="main" className="container page"><Explore initialFilters={readExploreFilters(params)}/></main>;
}
