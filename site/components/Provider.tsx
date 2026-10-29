'use client';
import {createContext,useContext,useState,useEffect,useCallback,type ReactNode} from 'react';
import {defaultTopics,discoveryStorageKey,normalizeTopics,type DiscoveryTopic} from '@/lib/discovery-preferences';
type User={name:string}|null;
type Context={user:User;compare:string[];toggleCompare:(id:string)=>void;toast:(message:string)=>void;notice:string;signIn:(returnTo?:string)=>void;topics:DiscoveryTopic[];saveTopics:(topics:DiscoveryTopic[])=>void};
const AppContext=createContext<Context|null>(null);
export function Provider({children,user}:{children:ReactNode;user:User}){
  const [compare,setCompare]=useState<string[]>([]),[notice,setNotice]=useState('');
  const [topics,setTopics]=useState<DiscoveryTopic[]>(defaultTopics);
  useEffect(()=>{try{setTopics(normalizeTopics(JSON.parse(localStorage.getItem(discoveryStorageKey)||'null')));}catch{}const sync=(e:StorageEvent)=>{if(e.key===discoveryStorageKey){try{setTopics(normalizeTopics(JSON.parse(e.newValue||'null')));}catch{setTopics(defaultTopics);}}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  const saveTopics=(value:DiscoveryTopic[])=>{const next=normalizeTopics(value);setTopics(next);try{localStorage.setItem(discoveryStorageKey,JSON.stringify(next));setNotice('선호 장르를 이 브라우저에 저장했습니다.');}catch{setNotice('선호 장르를 적용했습니다. 브라우저 저장이 제한되어 새로고침하면 초기화됩니다.');}};
  useEffect(()=>{try{const items=JSON.parse(sessionStorage.getItem('ais-compare')||'[]');if(Array.isArray(items))setCompare(items.filter(i=>typeof i==='string').slice(0,3));}catch{}},[]);
  const toast=useCallback((message:string)=>{setNotice(message);},[]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(t);},[notice]);
  const toggleCompare=(id:string)=>setCompare(current=>{if(!current.includes(id)&&current.length>=3){toast('비교는 최대 3개까지 가능합니다.');return current;}const next=current.includes(id)?current.filter(x=>x!==id):[...current,id];sessionStorage.setItem('ais-compare',JSON.stringify(next));return next;});
  const signIn=(returnTo?:string)=>{const path=returnTo||window.location.pathname+window.location.search;window.location.assign('/signin-with-chatgpt?return_to='+encodeURIComponent(path));};
  return <AppContext.Provider value={{user,compare,toggleCompare,toast,notice,signIn,topics,saveTopics}}>{children}<div className={'toast'+(notice?' visible':'')} role="status" aria-live="polite">{notice}</div></AppContext.Provider>;
}
export function useApp(){const c=useContext(AppContext);if(!c)throw new Error('Provider missing');return c;}
export async function api<T=Record<string,unknown>>(path:string,options?:RequestInit):Promise<T>{let response:Response;try{response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...options?.headers}});}catch{throw new Error('연결 상태를 확인해주세요. 저장을 요청했다면 목록에서 처리 결과를 확인한 뒤 다시 시도해주세요.');}let data: any;try{data=await response.json();}catch{throw new Error('응답을 받지 못했습니다. 다시 시도해주세요.');}if(!response.ok)throw new Error(data.error||'처리하지 못했습니다.');return data;}
