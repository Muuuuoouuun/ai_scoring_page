'use client';
import Link from '@/components/Link';
import {usePathname} from 'next/navigation';
import {useState,useRef,useEffect} from 'react';
import {useApp} from './Provider';
import Feedback from './Feedback';
import {Search,Menu,X,ArrowRight,Layers} from './Icons';
import './interaction-polish.css';
const isCurrent=(href:string,path:string)=>href==='/'?path==='/':path.startsWith(href)||href==='/explore'&&path.startsWith('/tools');
const nav=[['/','발견'],['/explore','도구 탐색'],['/news','소식·행사'],['/github','GitHub'],['/community','커뮤니티'],['/my','마이페이지']];
export function Header(){const path=usePathname();return <HeaderNavigation key={path} path={path}/>;}
function HeaderNavigation({path}:{path:string}){
  const [open,setOpen]=useState(false),{user}=useApp();
  const headerRef=useRef<HTMLElement>(null),menuRef=useRef<HTMLElement>(null),toggleRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!open)return;
    const menu=menuRef.current;
    (menu?.querySelector<HTMLAnchorElement>('[aria-current="page"]')||menu?.querySelector<HTMLAnchorElement>('a'))?.focus({preventScroll:true});
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!headerRef.current?.contains(event.target))setOpen(false);};
    const desktop=window.matchMedia('(min-width: 761px)');
    const resize=()=>{if(desktop.matches)setOpen(false);};
    document.addEventListener('pointerdown',outside);
    desktop.addEventListener('change',resize);
    return()=>{document.removeEventListener('pointerdown',outside);desktop.removeEventListener('change',resize);};
  },[open]);
  return <><a className="skip" href="#main">본문으로 이동</a><header ref={headerRef} className="site-header" data-menu-open={open||undefined} onKeyDown={e=>{if(open&&e.key==='Escape'){e.preventDefault();setOpen(false);toggleRef.current?.focus();}}} onBlur={e=>{if(open&&!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
    <div className="header-inner">
      <Link href="/" className="brand" aria-label="AIs 홈" onClick={()=>setOpen(false)}>AIs<span/></Link>
      <nav id="primary-navigation" ref={menuRef} aria-label="주 메뉴" className={open?'open':''}>
        {nav.map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)} className={isCurrent(href,path)?'active':''} aria-current={isCurrent(href,path)?'page':undefined}><span>{label}</span><ArrowRight className="nav-link-arrow" size={16} aria-hidden="true"/></Link>)}
      </nav>
      <div className="header-actions">
        <Link className="icon-button" href="/search" aria-label="전체 검색" onClick={()=>setOpen(false)}><Search size={19} aria-hidden="true"/></Link>
        {user?<Link href="/my" className="account-button" onClick={()=>setOpen(false)}>내 계정</Link>:<a className="account-button" href="/signin-with-chatgpt?return_to=/my" target="_top">로그인</a>}
        <button ref={toggleRef} type="button" className="mobile-menu icon-button" aria-controls="primary-navigation" aria-label={open?'메뉴 닫기':'메뉴 열기'} aria-expanded={open} onClick={()=>setOpen(current=>!current)}>{open?<X size={22} aria-hidden="true"/>:<Menu size={22} aria-hidden="true"/>}</button>
      </div>
    </div>
  </header></>;
}
export function Footer(){return <footer className="site-footer"><div className="footer-inner"><Link className="brand small" href="/">AIs<span/></Link><p>AI·SaaS를 이해하고, 나에게 맞게.</p><div><Link href="/about">소개·평가 기준</Link><Link href="/cancellation">구독 해지 안내</Link><Link href="/privacy">개인정보</Link><Link href="/sources">출처·갱신 현황</Link><Feedback/></div></div></footer>;}
export function CompareDock(){const {compare,toggleCompare,toast}=useApp(),path=usePathname();if(!compare.length||path==='/compare')return null;return <aside className="compare-dock interaction-compare-dock" aria-label="비교 목록"><span className="compare-dock-symbol" aria-hidden="true"><Layers size={19}/></span><span className="compare-dock-summary" role="status" aria-live="polite" aria-atomic="true">비교할 도구 <strong key={compare.length}>{compare.length}<span>/3</span></strong></span><Link className="button primary small" href={'/compare?ids='+compare.join(',')}>비교하기<ArrowRight size={16} aria-hidden="true"/></Link><button type="button" className="icon-button" aria-label="비교 목록 비우기" onClick={()=>{compare.forEach(toggleCompare);toast('비교 목록을 비웠습니다.');}}><X size={18} aria-hidden="true"/></button></aside>;}
