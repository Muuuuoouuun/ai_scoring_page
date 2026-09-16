'use client';
export default function Error({reset}:{reset:()=>void}){return <main className="container page" id="main"><div className="empty" role="alert"><h1>화면을 불러오지 못했습니다.</h1><p style={{marginTop:15}}>일시적인 오류일 수 있습니다. 다시 시도해주세요.</p><button className="button primary" onClick={reset}>다시 불러오기</button></div></main>;}
