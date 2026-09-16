# V9 날짜별 전환 비교 — 독립 숫자 fixture 18개

2026-09-12. 읽기 전용으로 원 명세 80–95행, 현재 `site/lib/billing.ts`, `site/components/Savings.tsx`를 대조했다. 아래 숫자는 구현 함수를 호출해서 만든 정답이 아니라 날짜별 이벤트를 직접 열거해 합산한 oracle이다. 사이트·Git·배포·브라우저 조작 없음. 범위는 동일 계약 한 건(번들 구성 도구는 같은 계약으로 중복 제거)의 유지안/변경안이다.

원 요구: [명세 86행](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-subscription-optimization-design.md:86)의 같은 시작/종료일, 양쪽 예정 청구·할인 종료·중복 기간·수수료·확인 환불; [92행](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-subscription-optimization-design.md:92)의 미래 순지출 차이와 과거 납부금 보존; [94행](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-subscription-optimization-design.md:94)의 단일 구독 범위. 필수 조건 미확인 억제는 83·85행, 선결제 여력은 83·87행에 이미 있다.

## fixture 해석과 범위

- 금액은 모두 **원통화 최소 단위 정수**. KRW/JPY는 1, USD/EUR는 0.01이다. 날짜 범위는 양 끝 포함이며, 취소/종료 경계는 각 입력의 확인된 청구 최종일 `oldBillThrough` **포함**이다. 날짜별 종료 정책 미확인을 무료로 간주하지 않는다.
- `keep`/`change`는 선택 기간의 **아직 실제로 확인되지 않은 미래 순지출 이벤트**다. 환불은 음수, 청구/수수료는 양수다. 같은 기간의 이미 확인된 `commonActual`은 양쪽 동일하게 더하되 미래 절감액에서 상쇄된다. `pastOutside`는 선택 기간 밖의 실제 이력이며 양쪽 기간 합계에 더하지 않는다.
- 청구 매칭은 기존 계약의 stable plannedKey만 소거한다. 새 후보는 별도 시나리오 키를 가진다. 환불이 원청구 매칭을 풀거나, 같은 날 신규 청구를 소거해서는 안 된다.
- `oldBillThrough`는 실험용 입력 어휘이며 **서버 인터페이스 강제안이 아니다**. 실제 코드에서는 확인된 갱신 중단일/남은 N회/약정 조건으로 같은 기존 청구 집합을 표현하면 된다. 기존 잔여 청구는 신규 청구와 별개의 이벤트로 유지한다. 이미 선납한 이용 기간의 겹침은 추가 현금 청구가 없으면 0이며, 임의의 월 환산액을 다시 더하지 않는다.
- 통화별 `delta = keepNet − changeNet`이다. 여러 통화가 남으면 원통화 벡터만 표시하고, 확인된 환율·기준일 없이 단일 절감액이나 비용 순위를 만들지 않는다.
- `upfront`는 해당 fixture에서 실제로 먼저 준비해야 하는 확인된 신규 청구와 같은 시점 수수료의 **환불 차감 전** 금액이다. 이후 환불은 현금 한도를 충족시켜 주지 않는다. 여러 시점 청구에 대한 추가 현금흐름 정책은 이 작은 fixture가 새로 요구하지 않는다.
- C04/C05의 기간 밖 전환은 명세가 반드시 허용하라고 정하지 않았다. 최소 구현이 결과 계산 전에 구체적 오류로 거부하면 허용한다. 허용할 경우에는 아래 정확한 산술을 따른다. C18처럼 미확인 조건은 임의의 0 확정으로 보완할 수 없다.
- 아래 `sourceVersions`, `candidateVersions`, `unknowns` 등은 구현 독립적인 fixture 어휘다. 현 `Contract`, `TermsHistory`, 입력 schema에 맞춰 adapter로 대응하면 된다. 조건 버전 적용일 당일의 청구는 새 조건을 사용한다. 제공사 달력 기준/세금/기능 조건은 별도 미확인 사례 외에는 확인되었다고 명시적으로 둔다.

## 기대값 요약

| ID | 핵심 상황 | 유지 미래 / 변경 미래 | 차이(유지−변경) | 핵심 판정 |
|---|---|---|---|---|
| C01 | 3개월 동일 시작일 월→월 | 60,000 / 45,000 KRW | +15,000 | 청구 각각 3회 |
| C02 | 둘째 달부터 변경 | 60,000 / 44,000 | +16,000 | 전환 전 20,000은 양쪽 유지 |
| C03 | 9/15~11/14 양끝/전환일 | 40,000 / 32,000 | +8,000 | 10/15는 새 조건, 11/15 제외 |
| C04 | 전환일이 기간 후 | 60,000 / 60,000 | 0 | 허용 시 신규 청구를 앞당기지 않음; 또는 입력 거부 |
| C05 | 전환 연납이 조회 시작 전 | 60,000 / 0 | +60,000 | 기간 밖 120,000은 선결제 필요; 또는 입력 거부 |
| C06 | 윤년 1/31 월 기준 | 300,000 / 270,000 | +30,000 | 1/31·2/29·3/31 |
| C07 | 연납 경계 포함 13회 월 청구 | 260,000 / 240,000 | +20,000 | 연납 두 번; 종료일 하루 전 변형은 +120,000 |
| C08 | 할인 종료 적용일 | 60,000 / 38,000 | +22,000 | 10,000·10,000·18,000 |
| C09 | 10/1까지 기존 중복 청구 | 60,000 / 85,000 | −25,000 | 기존 40,000 + 신규 45,000 |
| C10 | 확정 잔여 2회 중 조건 인상 | 45,000 / 75,000 | −30,000 | 버전마다 N 재시작 금지 |
| C11 | 당월 실제 19,000 공통 | 40,000 / 24,000 | +16,000 | 기간 총전망 59,000 / 43,000 |
| C12 | 미래 기존 청구를 기간 전에 선납 | 20,000 / 30,000 | −10,000 | 같은 날짜 신규 청구는 남음 |
| C13 | 날짜 있는 수수료·확인 환불 | 60,000 / 41,000 | +19,000 | 45,000+8,000−12,000; 범위 밖 제외 |
| C14 | 늦은 환불과 선결제 한도 | 240,000 / 30,000 | +210,000 | 먼저 130,000 필요 > 한도 125,000; 변경 추천 금지 |
| C15 | USD 유지 / KRW 변경+USD 비용 | USD 3,000 / KRW 27,000 + USD 100 | USD +2,900·KRW −27,000 | 단일 절감액/비용순위 없음 |
| C16 | 같은 번들의 두 도구와 실제 결제 | 60,000 / 40,000 | +20,000 | 실제 29,000 공통; 총전망 89,000 / 69,000 |
| C17 | 비용/기능/일정의 미확인 변형 | 확인된 부분만 | 확정 차이/추천 없음 | null·미정과 확인된 0 구분 |
| C18 | 유지안의 예정 가격 인상과 전환 | 80,000 / 65,000 | +15,000 | 기존 미래 조건이 종료 후 청구를 부활시키지 않음 |

C05는 미래 기간의 비용이 0이어도 서비스가 무료이거나 선결제 여력이 있다는 뜻이 아님을 확인하는 사례다. C14는 이미 지불한 기존 이용 기간과 신규 서비스가 겹쳐도 새 청구 없이 가상의 중복 비용을 만들지 않는 사례이기도 하다.

## 실행 가능한 fixture와 독립 산술 검사

다음 JS 블록을 `.mjs`로 추출해 Node로 실행할 수 있다. 기존 billing 함수를 import하지 않는다. `expected` 이벤트/합계는 수기로 지정했고 self-check는 그 이벤트를 단순 합산하여 기록된 합계와 비교한다. 이 검사는 **oracle 내부 산술 검증**이며 V9 구현 통과를 의미하지 않는다.

```js
import assert from 'node:assert/strict';
const E=(date,amount,kind='charge',currency='KRW',key='')=>({date,amount,kind,currency,key});
const KRW=n=>({KRW:n});
const C=(amount,nextDate,extra={})=>({id:'old',amount,currency:'KRW',cycle:'monthly',anchorDate:nextDate,nextDate,status:'active',amountBasis:'total',taxStatus:'included',pricingMode:'fixed',...extra});
const common={asOf:'2026-08-31',from:'2026-09-01',until:'2026-11-30',switchDate:'2026-09-01',features:'confirmed',costsConfirmed:true,oldBillThrough:'2026-08-31'};
const monthlyOld=[E('2026-09-01',20000),E('2026-10-01',20000),E('2026-11-01',20000)];
export const cases=[
 {id:'C01',input:{...common,current:[C(20000,'2026-09-01')],candidate:C(15000,'2026-09-01')},keep:monthlyOld,change:[E('2026-09-01',15000),E('2026-10-01',15000),E('2026-11-01',15000)],keepNet:KRW(60000),changeNet:KRW(45000),delta:KRW(15000)},
 {id:'C02',input:{...common,switchDate:'2026-10-01',oldBillThrough:'2026-09-30',current:[C(20000,'2026-09-01')],candidate:C(12000,'2026-10-01')},keep:monthlyOld,change:[E('2026-09-01',20000),E('2026-10-01',12000),E('2026-11-01',12000)],keepNet:KRW(60000),changeNet:KRW(44000),delta:KRW(16000)},
 {id:'C03',input:{...common,from:'2026-09-15',until:'2026-11-14',switchDate:'2026-10-15',oldBillThrough:'2026-10-14',current:[C(20000,'2026-09-15')],candidate:C(12000,'2026-10-15')},keep:[E('2026-09-15',20000),E('2026-10-15',20000)],change:[E('2026-09-15',20000),E('2026-10-15',12000)],keepNet:KRW(40000),changeNet:KRW(32000),delta:KRW(8000),excludedDates:['2026-11-15']},
 {id:'C04',allowExplicitRangeRejection:true,input:{...common,switchDate:'2026-12-01',oldBillThrough:'2026-11-30',current:[C(20000,'2026-09-01')],candidate:C(15000,'2026-12-01')},keep:monthlyOld,change:monthlyOld,keepNet:KRW(60000),changeNet:KRW(60000),delta:KRW(0),excludedDates:['2026-12-01']},
 {id:'C05',allowExplicitRangeRejection:true,input:{...common,from:'2026-10-01',until:'2026-12-31',switchDate:'2026-09-15',oldBillThrough:'2026-09-14',current:[C(20000,'2026-09-01')],candidate:C(120000,'2026-09-15',{cycle:'annual'}),limit:KRW(100000)},keep:[E('2026-10-01',20000),E('2026-11-01',20000),E('2026-12-01',20000)],change:[],keepNet:KRW(60000),changeNet:{},delta:KRW(60000),futureOutside:[E('2026-09-15',120000)],upfront:KRW(120000),candidateAffordable:false,recommendation:null},
 {id:'C06',input:{...common,asOf:'2028-01-01',from:'2028-01-31',until:'2028-03-31',switchDate:'2028-01-31',oldBillThrough:'2028-01-30',current:[C(100000,'2028-01-31')],candidate:C(90000,'2028-01-31'),calendarPolicy:'provider-confirmed month-end clamp, preserve Jan31 anchor'},keep:[E('2028-01-31',100000),E('2028-02-29',100000),E('2028-03-31',100000)],change:[E('2028-01-31',90000),E('2028-02-29',90000),E('2028-03-31',90000)],keepNet:KRW(300000),changeNet:KRW(270000),delta:KRW(30000)},
 {id:'C07',input:{...common,until:'2027-09-01',current:[C(20000,'2026-09-01')],candidate:C(120000,'2026-09-01',{cycle:'annual'})},keep:['2026-09-01','2026-10-01','2026-11-01','2026-12-01','2027-01-01','2027-02-01','2027-03-01','2027-04-01','2027-05-01','2027-06-01','2027-07-01','2027-08-01','2027-09-01'].map(d=>E(d,20000)),change:[E('2026-09-01',120000),E('2027-09-01',120000)],keepNet:KRW(260000),changeNet:KRW(240000),delta:KRW(20000),endDayBefore:{until:'2027-08-31',keepNet:KRW(240000),changeNet:KRW(120000),delta:KRW(120000)}},
 {id:'C08',input:{...common,current:[C(20000,'2026-09-01')],candidate:C(10000,'2026-09-01',{priceChangesAt:'2026-11-01',renewalAmount:18000})},keep:monthlyOld,change:[E('2026-09-01',10000),E('2026-10-01',10000),E('2026-11-01',18000)],keepNet:KRW(60000),changeNet:KRW(38000),delta:KRW(22000)},
 {id:'C09',input:{...common,switchDate:'2026-09-15',oldBillThrough:'2026-10-01',overlapConfirmedThrough:'2026-10-31',current:[C(20000,'2026-09-01')],candidate:C(15000,'2026-09-15')},keep:monthlyOld,change:[E('2026-09-01',20000,'old'),E('2026-09-15',15000,'new'),E('2026-10-01',20000,'old'),E('2026-10-15',15000,'new'),E('2026-11-15',15000,'new')],keepNet:KRW(60000),changeNet:KRW(85000),delta:KRW(-25000)},
 {id:'C10',input:{...common,oldBillThrough:null,current:[C(20000,'2026-09-15',{status:'cancelled',remainingPayments:2,remainingFromDate:'2026-09-15'})],sourceVersions:[{effectiveFrom:'2026-09-01',amount:20000,remainingPayments:2,remainingFromDate:'2026-09-15'},{effectiveFrom:'2026-10-01',amount:25000,remainingPayments:2,remainingFromDate:'2026-09-15'}],candidate:C(10000,'2026-09-01'),oldResidualObligation:'confirmed, survives new subscription'},keep:[E('2026-09-15',20000),E('2026-10-15',25000)],change:[E('2026-09-01',10000,'new'),E('2026-09-15',20000,'old'),E('2026-10-01',10000,'new'),E('2026-10-15',25000,'old'),E('2026-11-01',10000,'new')],keepNet:KRW(45000),changeNet:KRW(75000),delta:KRW(-30000),excludedDates:['2026-11-15']},
 {id:'C11',input:{...common,asOf:'2026-09-12',switchDate:'2026-10-01',oldBillThrough:'2026-09-30',current:[C(20000,'2026-09-01')],candidate:C(12000,'2026-10-01'),payments:[{id:'p1',subscriptionId:'old',date:'2026-09-02',amount:19000,currency:'KRW',plannedDate:'2026-09-01',plannedKey:'contract:old@2026-09-01',plannedAmount:20000,plannedCurrency:'KRW'}]},commonActual:[E('2026-09-02',19000,'actual','KRW','contract:old@2026-09-01')],keep:[E('2026-10-01',20000),E('2026-11-01',20000)],change:[E('2026-10-01',12000),E('2026-11-01',12000)],keepNet:KRW(40000),changeNet:KRW(24000),delta:KRW(16000),keepCombined:KRW(59000),changeCombined:KRW(43000)},
 {id:'C12',input:{...common,until:'2026-10-31',current:[C(20000,'2026-09-01')],candidate:C(15000,'2026-09-01'),payments:[{id:'p1',subscriptionId:'old',date:'2026-08-31',amount:20000,currency:'KRW',plannedDate:'2026-09-01',plannedKey:'contract:old@2026-09-01',plannedAmount:20000,plannedCurrency:'KRW'}]},pastOutside:[E('2026-08-31',20000,'actual','KRW','contract:old@2026-09-01')],keep:[E('2026-10-01',20000)],change:[E('2026-09-01',15000,'new','KRW','candidate:old@2026-09-01'),E('2026-10-01',15000,'new','KRW','candidate:old@2026-10-01')],keepNet:KRW(20000),changeNet:KRW(30000),delta:KRW(-10000)},
 {id:'C13',input:{...common,current:[C(20000,'2026-09-01')],candidate:C(15000,'2026-09-01'),costs:[{date:'2026-09-15',kind:'fee',amount:8000,currency:'KRW',confirmed:true},{date:'2026-10-01',kind:'refund',amount:12000,currency:'KRW',confirmed:true,refundOfId:'prior-charge'},{date:'2026-12-01',kind:'fee',amount:5000,currency:'KRW',confirmed:true},{date:'2026-12-02',kind:'refund',amount:6000,currency:'KRW',confirmed:true,refundOfId:'prior-charge'}],payments:[{id:'prior-charge',subscriptionId:'old',date:'2026-08-01',amount:20000,currency:'KRW'}]},pastOutside:[E('2026-08-01',20000,'actual')],keep:monthlyOld,change:[E('2026-09-01',15000,'new'),E('2026-09-15',8000,'fee'),E('2026-10-01',15000,'new'),E('2026-10-01',-12000,'confirmed-refund'),E('2026-11-01',15000,'new')],keepNet:KRW(60000),changeNet:KRW(41000),delta:KRW(19000),excludedDates:['2026-12-01','2026-12-02']},
 {id:'C14',input:{...common,until:'2027-08-31',current:[C(240000,'2027-06-01',{cycle:'annual',anchorDate:'2026-06-01'})],candidate:C(120000,'2026-09-01',{cycle:'annual'}),oldPaidCoverageThrough:'2027-05-31',costs:[{date:'2026-09-01',kind:'fee',amount:10000,currency:'KRW',confirmed:true},{date:'2026-09-20',kind:'refund',amount:100000,currency:'KRW',confirmed:true,refundOfId:'paid-june',source:'explicit provider quote'}],payments:[{id:'paid-june',subscriptionId:'old',date:'2026-06-01',amount:240000,currency:'KRW'}],limit:KRW(125000)},pastOutside:[E('2026-06-01',240000,'actual')],keep:[E('2027-06-01',240000)],change:[E('2026-09-01',120000,'new'),E('2026-09-01',10000,'fee'),E('2026-09-20',-100000,'confirmed-refund')],keepNet:KRW(240000),changeNet:KRW(30000),delta:KRW(210000),upfront:KRW(130000),candidateAffordable:false,recommendation:null},
 {id:'C15',input:{...common,current:[C(1000,'2026-09-01',{currency:'USD'})],candidate:C(9000,'2026-09-01'),costs:[{date:'2026-09-01',kind:'fee',amount:200,currency:'USD',confirmed:true},{date:'2026-09-20',kind:'refund',amount:100,currency:'USD',confirmed:true,refundOfId:'prior-usd'}],payments:[{id:'prior-usd',subscriptionId:'old',date:'2026-08-01',amount:1000,currency:'USD'}],fx:null,limit:KRW(10000)},pastOutside:[E('2026-08-01',1000,'actual','USD')],keep:[E('2026-09-01',1000,'old','USD'),E('2026-10-01',1000,'old','USD'),E('2026-11-01',1000,'old','USD')],change:[E('2026-09-01',9000,'new'),E('2026-09-01',200,'fee','USD'),E('2026-09-20',-100,'confirmed-refund','USD'),E('2026-10-01',9000,'new'),E('2026-11-01',9000,'new')],keepNet:{USD:3000},changeNet:{KRW:27000,USD:100},delta:{USD:2900,KRW:-27000},recommendation:null,candidateAffordable:null},
 {id:'C16',input:{...common,asOf:'2026-09-12',switchDate:'2026-10-01',oldBillThrough:'2026-09-30',current:[C(30000,'2026-09-01',{id:'tool-a',bundleId:'work'}),C(30000,'2026-09-01',{id:'tool-b',bundleId:'work'})],candidate:C(20000,'2026-10-01'),payments:[{id:'p1',subscriptionId:'tool-b',date:'2026-09-02',amount:29000,currency:'KRW',plannedDate:'2026-09-01',plannedKey:'bundle:work@2026-09-01',plannedAmount:30000,plannedCurrency:'KRW'}]},commonActual:[E('2026-09-02',29000,'actual','KRW','bundle:work@2026-09-01')],keep:[E('2026-10-01',30000,'old','KRW','bundle:work@2026-10-01'),E('2026-11-01',30000,'old','KRW','bundle:work@2026-11-01')],change:[E('2026-10-01',20000,'new'),E('2026-11-01',20000,'new')],keepNet:KRW(60000),changeNet:KRW(40000),delta:KRW(20000),keepCombined:KRW(89000),changeCombined:KRW(69000)},
 {id:'C17',input:{...common,current:[C(20000,'2026-09-01')],candidate:C(15000,'2026-09-01'),costs:[{kind:'fee',date:'2026-09-01',amount:null,currency:'KRW',confirmed:false}],unknowns:['transition fee']},keep:monthlyOld,change:[E('2026-09-01',15000),E('2026-10-01',15000),E('2026-11-01',15000),E('2026-09-01',null,'fee')],keepNet:KRW(60000),changeNet:KRW(45000),delta:null,complete:false,recommendation:null,unknownCount:1},
 {id:'C18',input:{...common,switchDate:'2026-09-15',oldBillThrough:'2026-09-14',current:[C(20000,'2026-09-01')],sourceVersions:[{effectiveFrom:'2026-08-01',amount:20000,status:'active'},{effectiveFrom:'2026-10-01',amount:30000,status:'active'}],candidate:C(15000,'2026-09-15')},keep:[E('2026-09-01',20000),E('2026-10-01',30000),E('2026-11-01',30000)],change:[E('2026-09-01',20000,'old'),E('2026-09-15',15000,'new'),E('2026-10-15',15000,'new'),E('2026-11-15',15000,'new')],keepNet:KRW(80000),changeNet:KRW(65000),delta:KRW(15000)}
];
// C17의 파생 입력도 각각 원인 하나만 바꾸어 검증한다.
export const unknownVariants=[
 {id:'C17-zero-control',changeFee:{date:'2026-09-01',amount:0,confirmed:true},knownChangeNet:KRW(45000),complete:true,delta:KRW(15000),recommendation:'change'},
 {id:'C17-refund-unknown',fee:0,refund:{date:'2026-09-20',amount:null,confirmed:false},knownChangeNet:KRW(45000),complete:false,delta:null,recommendation:null},
 {id:'C17-features-unknown',fee:0,features:'unknown',knownChangeNet:KRW(45000),completeCosts:true,eligible:null,recommendation:null},
 {id:'C17-features-false',fee:0,features:'not-met',knownChangeNet:KRW(45000),completeCosts:true,eligible:false,recommendation:null},
 {id:'C17-renewal-price',fee:0,candidate:C(10000,'2026-09-01',{priceChangesAt:'2026-10-01',renewalAmount:null}),expected:[E('2026-09-01',10000),E('2026-10-01',null),E('2026-11-01',null)],knownChangeNet:KRW(10000),unknownCount:2,complete:false,delta:null,recommendation:null},
 {id:'C17-next-date',fee:0,candidate:C(15000,null),knownChangeNet:{},complete:false,unknowns:['nextDate'],delta:null,recommendation:null},
 {id:'C17-tax',fee:0,candidate:C(15000,'2026-09-01',{taxStatus:'excluded',taxAmount:null}),knownChangeNet:KRW(45000),complete:false,unknowns:['taxAmount'],delta:null,recommendation:null},
 {id:'C17-refund-date',fee:0,refund:{date:null,amount:5000,confirmed:true},knownChangeNet:KRW(45000),complete:false,unknowns:['refund date; cannot assign to range'],delta:null,recommendation:null}
];
// 숫자가 있는 부분 합계와 최종 비교 가능 여부는 별개다.
const sum=rows=>{const totals={};for(const e of rows){if(e.amount==null)continue;assert(Number.isSafeInteger(e.amount));totals[e.currency]=(totals[e.currency]||0)+e.amount;}return totals;};
const add=(a,b)=>{const t={...a};for(const [c,n] of Object.entries(b))t[c]=(t[c]||0)+n;return t;};
const subtract=(a,b)=>{const t={};for(const c of new Set([...Object.keys(a),...Object.keys(b)]))t[c]=(a[c]||0)-(b[c]||0);return t;};
for(const c of cases){
 assert.deepEqual(sum(c.keep),c.keepNet,c.id+' keep arithmetic');
 assert.deepEqual(sum(c.change),c.changeNet,c.id+' change arithmetic');
 for(const e of [...c.keep,...c.change])assert(e.date>=c.input.from&&e.date<=c.input.until,c.id+' date range');
 if(c.delta!==null)assert.deepEqual(subtract(c.keepNet,c.changeNet),c.delta,c.id+' difference arithmetic');
 if(c.keepCombined)assert.deepEqual(add(sum(c.commonActual||[]),c.keepNet),c.keepCombined,c.id+' common actual keep');
 if(c.changeCombined)assert.deepEqual(add(sum(c.commonActual||[]),c.changeNet),c.changeCombined,c.id+' common actual change');
 if(c.upfront&&c.candidateAffordable===false)assert(Object.entries(c.upfront).some(([currency,n])=>n>(c.input.limit[currency]??-1)),c.id+' upfront constraint');
}
const annual=cases.find(c=>c.id==='C07'),short=annual.endDayBefore;
assert.deepEqual(sum(annual.keep.filter(e=>e.date<=short.until)),short.keepNet);
assert.deepEqual(sum(annual.change.filter(e=>e.date<=short.until)),short.changeNet);
assert.deepEqual(subtract(short.keepNet,short.changeNet),short.delta);
assert.deepEqual(sum(unknownVariants.find(v=>v.id==='C17-renewal-price').expected),KRW(10000));
assert.equal(cases.length,18);
console.log('18 independently enumerated cases: all event sums, differences, common actual totals and explicit boundary/affordability checks passed. 8 unknown-condition variants supplied. This is an oracle check, not V9 implementation validation.');
```

## 구현과 대조할 때 빠뜨리기 쉬운 검증

1. C11/C12/C16에서 실제 결제는 invoice의 original plannedKey/amount/currency로 유지한다. 현재 가격이나 candidate 키로 매칭을 재작성하지 않는다. 선택 기간 밖 실제 결제도 해당 미래 예정 키가 이미 확인됐는지 판별하는 데에는 사용한다.
2. C09의 기존 청구 9/1·10/1을 추가 금액 총액과 다시 더하지 않는다. C10에서 잔여 청구를 가격 변경 버전마다 두 번 생성하지 않는다. C18의 10/1 reserved 활성 상태가 변경안에 기존 청구를 복구하지 않도록 한다.
3. 실제 발생해 버린 비용/환불은 공통 과거 이력이고, 변경을 선택할 때만 앞으로 발생할 **확인된** 비용/환불은 변경안이다. 같은 refund ID를 실제 기록과 시나리오 비용에 모두 넣으면 두 번 차감하지 않고 입력 충돌을 거부하거나 공통 actual로 한 번만 취급해야 한다. 실제 환불이 있다는 이유로 그 원청구를 다시 예상으로 만들지 않는다.
4. C13의 12/1 수수료·12/2 환불은 범위 밖이다. 환불 원결제가 범위 밖이어도 환불 자체가 범위 안이고 확인되면 해당 날짜에만 반영한다. C14의 환불은 provider quote가 있다는 명시적 가정이며 자동 일할 계산의 허가가 아니다.
5. C15의 USD 1,000은 $10.00이다. 통화를 지우고 KRW 27,000과 숫자 크기로 순위를 매기지 않는다. 원통화 한도가 누락된 청구의 affordability는 미확인이다.
6. C17의 `completeCosts`와 기능 적합성은 별개다. 금액을 모두 알아도 필수 기능이 미확인이거나 불충족이면 변경 최적안 추천은 금지한다. 미확인 입력 때문에 기존 값이 0으로 변환되거나 `delta=0`/‘동일 비용’/‘0원’이 되지 않아야 한다. 확인된 부분 합계는 그 의미를 밝혀 표시할 수 있다.
7. 스냅샷/이력을 받아 계산하는 순수 비교는 원래 계약, future versions, actual payment 또는 billing revision을 변경하지 않아야 한다. 입력을 deep-freeze하여 C10·C12·C18을 실행한 뒤 같은 JSON이 보존되는지 확인할 수 있다. 여러 대안 동시 최적화·자동 거래는 이 fixture 범위가 아니다.
