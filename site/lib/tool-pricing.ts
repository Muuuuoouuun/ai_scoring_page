import raw from '@/data/tool-pricing.json';

export type BillingPeriod='monthly'|'annual';
export type PriceFilter='all'|'free'|'lower-or-equal';
export type ToolPricing={
 toolId:string;
 freeTier:'available'|'unavailable'|'trial'|'unknown';
 freeNote:string;
 paid:{kind:'subscription'|'usage'|'quote'|'unknown';plan:string;currency:string;unit:'person'|'workspace'|'usage';monthly:number|null;annualMonthly:number|null;annualTotal:number|null;note:string};
 sourceUrl:string;
 additionalSources?:string[];
 checkedAt:string;
};
export const toolPricing=raw as ToolPricing[];
export function getToolPricing(toolId:string){return toolPricing.find(p=>p.toolId===toolId);}
const positive=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>0;

/** Only compare verified USD personal/seat base subscriptions in the same billing period. */
export function comparableMonthlyPrice(pricing:ToolPricing|undefined,period:BillingPeriod='monthly'):number|null{
 if(!pricing||pricing.paid.kind!=='subscription'||pricing.paid.currency!=='USD'||pricing.paid.unit!=='person')return null;
 const paid=pricing.paid;
 const amount=period==='monthly'?paid.monthly:positive(paid.annualTotal)?paid.annualTotal/12:paid.annualMonthly;
 return positive(amount)?amount:null;
}
export function comparePricing(source:ToolPricing|undefined,candidate:ToolPricing|undefined,period:BillingPeriod='monthly'):{relation:'lower'|'equal'|'higher'|'unavailable';difference:number|null;sourceAmount:number|null;candidateAmount:number|null}{
 const sourceAmount=comparableMonthlyPrice(source,period),candidateAmount=comparableMonthlyPrice(candidate,period);
 if(sourceAmount===null||candidateAmount===null)return {relation:'unavailable',difference:null,sourceAmount,candidateAmount};
 const signed=Math.round((candidateAmount-sourceAmount)*100)/100;
 return {relation:signed===0?'equal':signed<0?'lower':'higher',difference:Math.abs(signed),sourceAmount,candidateAmount};
}
export function matchesPriceFilter(source:ToolPricing|undefined,candidate:ToolPricing|undefined,filter:PriceFilter,period:BillingPeriod='monthly'){
 if(filter==='all')return true;
 if(filter==='free')return candidate?.freeTier==='available';
 const {relation}=comparePricing(source,candidate,period);
 return relation==='lower'||relation==='equal';
}
export function formatUsd(amount:number){return '$'+amount.toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:2});}
