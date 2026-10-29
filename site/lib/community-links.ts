/** Explicit HTTPS links only. Never fetch user-provided pages or render their HTML. */
export function communityLinks(body:string):{url:string;host:string}[]{
  const links=new Map<string,{url:string;host:string}>();
  for(const match of body.matchAll(/https:\/\/[^\s<>"'`]+/gi)){
    let candidate=match[0].replace(/[.,;:!?，。]+$/g,'');
    const pairs:Record<string,string>={')':'(',']':'[','}':'{'};
    while(pairs[candidate.at(-1)||'']){
      const close=candidate.at(-1)!,open=pairs[close];
      if(candidate.split(close).length<=candidate.split(open).length)break;
      candidate=candidate.slice(0,-1).replace(/[.,;:!?，。]+$/g,'');
    }
    try{const url=new URL(candidate);if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.'))continue;
      links.set(url.href,{url:url.href,host:url.hostname.replace(/^www\./,'')});
    }catch{}
    if(links.size===5)break;
  }
  return [...links.values()];
}
