import {genreLabels} from './tool-genres';
import {categories,kindLabels} from './catalog';

export type ExploreFilters={q:string;category:string;genre:string;kind:string;free:boolean;korean:boolean};
export const emptyExploreFilters:ExploreFilters={q:'',category:'all',genre:'all',kind:'all',free:false,korean:false};

export function readExploreFilters(params:URLSearchParams):ExploreFilters{
  const category=params.get('category')||'all',kind=params.get('kind')||'all',genre=params.get('genre')||'all';
  return {
    q:params.get('q')||'',
    category:Object.hasOwn(categories,category)?category:'all',
    genre:Object.hasOwn(genreLabels,genre)?genre:'all',
    kind:Object.hasOwn(kindLabels,kind)?kind:'all',
    free:params.get('free')==='1',
    korean:params.get('korean')==='1',
  };
}

export function exploreQuery(filters:ExploreFilters){
  const params=new URLSearchParams();
  if(filters.q)params.set('q',filters.q);
  if(filters.category!=='all')params.set('category',filters.category);
  if(filters.genre&&filters.genre!=='all')params.set('genre',filters.genre);
  if(filters.kind!=='all')params.set('kind',filters.kind);
  if(filters.free)params.set('free','1');
  if(filters.korean)params.set('korean','1');
  return params.toString();
}
