export type CommunityDraft={kind:string;toolId:string;author:string;title:string;body:string;task:string;plan:string;usedAt:string;affiliation:string;ratings:Record<string,number>};
type DraftContext={postId?:string;parentId?:string;toolId?:string;kind?:string};
type DraftStorage=()=>Pick<Storage,'getItem'|'setItem'>;
const kinds=['review','question','discussion','feature','reply'];
const axes=['quality','efficiency','korean','value','workflow'];

// Keep the existing keys so drafts written before this change remain available.
export function communityDraftKey({postId,parentId,toolId}:DraftContext){
  return 'ais-draft-'+(postId||parentId||toolId||'new');
}
export function communityDraftReturn({parentId,toolId,kind}:DraftContext){
  if(parentId)return '/community/'+encodeURIComponent(parentId)+'?write=reply';
  const query=new URLSearchParams({write:kind&&kinds.includes(kind)&&kind!=='reply'?kind:'discussion'});
  if(toolId)query.set('tool',toolId);
  return '/community?'+query;
}
export function readCommunityDraft(storage:DraftStorage,key:string):Partial<CommunityDraft>|null{
  try{
    const raw=storage().getItem(key);
    if(!raw)return null;
    const value=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const draft:Partial<CommunityDraft>={};
    for(const field of ['toolId','author','title','body','task','plan','usedAt'] as const){
      if(typeof value[field]==='string')draft[field]=value[field];
    }
    if(kinds.includes(value.kind))draft.kind=value.kind;
    if(['none','maker','sponsored'].includes(value.affiliation))draft.affiliation=value.affiliation;
    if(value.ratings&&typeof value.ratings==='object'&&!Array.isArray(value.ratings)){
      draft.ratings={};
      for(const axis of axes){
        const rating=value.ratings[axis];
        if(Number.isInteger(rating)&&rating>=1&&rating<=5)draft.ratings[axis]=rating;
      }
    }
    return draft;
  }catch{return null;}
}
export function writeCommunityDraft(storage:DraftStorage,key:string,value:Partial<CommunityDraft>){
  try{storage().setItem(key,JSON.stringify(value));return true;}catch{return false;}
}
