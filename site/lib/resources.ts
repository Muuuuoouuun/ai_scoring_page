import raw from '@/data/resources.json';

export type ResourceGroup='reference'|'assets'|'imageTools'|'devUtil';
export type ResourcePricing='free'|'freemium'|'paid';
export type ResourceSite={name:string;url:string;group:ResourceGroup;tagline:string;useCase:string;pricing:ResourcePricing;pricingDetail:string;koreanFriendly:'full'|'partial'|'none';strength:string;caution:string;alternatives:string[];sources?:string[]};

export const resources=raw as ResourceSite[];
export const resourceGroups:ResourceGroup[]=['reference','assets','imageTools','devUtil'];
export const groupLabels:Record<ResourceGroup,string>={reference:'레퍼런스·인스피레이션',assets:'무료 에셋',imageTools:'이미지 보정·변환',devUtil:'실무 유틸리티'};
export const groupNotes:Record<ResourceGroup,string>={
 reference:'화면 설계나 톤앤매너를 잡기 전에 여는 곳입니다.',
 assets:'사진·폰트·아이콘·일러스트를 가져오는 곳입니다. 라이선스를 반드시 확인하세요.',
 imageTools:'누끼, 업스케일, 용량 압축처럼 이미지를 손볼 때 쓰는 도구입니다.',
 devUtil:'색상·다이어그램·캡처처럼 작업 중간에 잠깐 쓰는 도구입니다.'};
export const pricingLabels:Record<ResourcePricing,string>={free:'무료',freemium:'부분 무료',paid:'유료'};
export const pricingTone:Record<ResourcePricing,string>={free:'green',freemium:'',paid:'yellow'};
export const koreanLabels:Record<string,string>={full:'한국어 편함',partial:'영어지만 무난',none:'영어 전용'};

export function groupedResources(items:ResourceSite[]=resources){
 return resourceGroups.map(group=>({group,sites:items.filter(s=>s.group===group)})).filter(g=>g.sites.length>0);
}
/** 도구 상세에서 같은 작업에 쓰는 사이트를 잇기 위한 단순 대조. 평가 점수와 무관하다. */
export function resourcesForGroup(group:ResourceGroup){return resources.filter(s=>s.group===group);}
