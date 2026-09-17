/**
 * 공식 로고를 내려받지 못한 도구에 쓰는 임시 SVG 로고(이니셜)를 만듭니다.
 *   node scripts/site-logo-placeholder.mjs <id> "<Name>" [hexColor]
 * 결과: site/public/logos/<id>.svg
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const [id,name,color="#1749e7"]=process.argv.slice(2);
if(!id||!name){console.error("usage: node scripts/site-logo-placeholder.mjs <id> <name> [color]");process.exit(1);}
const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("");
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="${name}">
 <rect width="128" height="128" rx="24" fill="${color}"/>
 <text x="64" y="64" text-anchor="middle" dominant-baseline="central" font-family="Noto Sans KR, Arial, sans-serif" font-size="${initials.length>1?52:64}" font-weight="700" fill="#ffffff">${initials}</text>
</svg>
`;
const out=path.join(root,"site/public/logos",`${id}.svg`);
fs.writeFileSync(out,svg);
console.log("wrote",path.relative(root,out),"initials",initials);
