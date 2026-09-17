# V8 계산 최소 예시 — 실행 가능한 데이터와 기대값

기준: 배포 소스 `123de1697a5a6c40a8d7666fd08df80ffbb6c9dc`, `docs/audits/2026-09-12-v8-history-review.md`의 유지 요구. 사이트 코드와 연결하지 않은 제안 fixture다. 새 요구나 점수 가산은 없다.

아래 JavaScript 블록은 그대로 ES module로 실행할 수 있다. `cases`는 입력, 손으로 열거한 청구 목록, 조회별 기대값이다. 실제 구현의 history 저장 모양이 다르면 테스트 adapter만 바꾸고 기대 날짜/금액은 유지한다. `selfCheck()`는 열거된 날짜와 원장의 독립 합산으로 기대값의 산술만 검산한다. **V8 구현이 통과했다는 테스트가 아니며, 이력에서 날짜를 생성하는 제품 계산기를 대신하지 않는다.**

공통 의미:

- 금액은 최소 통화 단위 정수. KRW10,000은10,000원, USD2,000은20.00달러다.
- 조회 양끝 날짜는 포함한다. 버전 구간은 `[effectiveFrom, nextEffectiveFrom)`이며 적용일 당일은 새 버전이다.
- `firstDueDate`는 일정 생성의 보존된 시작점이다. `remainingFromDate`부터 확정 잔여 N회를 소비하며 가격 버전/조회 시작일마다 초기화하지 않는다.
- `planned`는 기간 안 전체 예정 원형의 알려진 금액 합이다. `remaining`은 `asOf` 이상이고 결제와 연결되지 않은 청구만 합산한다. `forecast=actual+remaining`이다.
- `personalPlanned`는 날짜별 예상 부담이며 실제 개인 지출이 아니다. 연결 결제가 있으면 개인액 null이어도 원 예정 개인액은 다시 합산하지 않는다.
- 0 합계 버킷은 `{}`로 정규화했다. 미확인과 실제0의 차이는 unknown 카운터와 원장 값으로 확인한다. `{}`를 “모두 무료로 확인됨”으로 표시하지 않는다.

```js
import assert from 'node:assert/strict';

const T = (patch={}) => ({
  plan:'P',amount:20000,currency:'KRW',amountBasis:'total',seats:null,
  taxStatus:'included',taxAmount:null,pricingMode:'fixed',personalShare:10000,
  cycle:'monthly',cycleMonths:null,anchorDate:'2026-09-15',firstDueDate:'2026-09-15',
  status:'active',pauseBilling:'unknown',resumeDate:null,endDate:null,
  remainingPayments:null,remainingFromDate:null,...patch
});
const V = (id,effectiveFrom,patch={},extra={}) => ({
  id,effectiveFrom,recordedAt:'2026-09-01T00:00:00Z',state:'confirmed',
  reason:'가상 테스트',sourceNote:'',terms:T(patch),...extra
});
const C = (versions,id='c',bundleId='',knownFrom=versions[0].effectiveFrom) => ({
  id,bundleId,history:{schemaVersion:1,revision:versions.length,knownFrom,versions:structuredClone(versions)}
});
const P = (patch={}) => ({
  id:'p',subscriptionId:'c',entryType:'charge',date:'2026-09-15',amount:20000,currency:'KRW',
  personalAmount:null,personalCurrency:null,refundOfId:'',plannedDate:'2026-09-15',
  plannedKey:'contract:c@2026-09-15',plannedAmount:20000,plannedCurrency:'KRW',
  plannedVersionId:'v1',plannedPersonalAmount:10000,...patch
});
const E = (date,amount,personalShare,currency='KRW',identity='contract:c') =>
  ({key:identity+'@'+date,date,currency,amount,personalShare});
const B = value => typeof value==='number' ? (value===0?{}:{KRW:value}) : (value||{});
const totals = ({planned=0,actual=0,remaining=0,forecast=0,
  personalPlanned=0,personalActual=0,personalRemaining=0,personalForecast=0,
  unknownPersonalActual=0,unknownPersonalExpected=0,unknownScheduledAmounts=0,unconfirmed=0}) => ({
  planned:B(planned),actual:B(actual),remaining:B(remaining),forecast:B(forecast),
  personalPlanned:B(personalPlanned),personalActual:B(personalActual),
  personalRemaining:B(personalRemaining),personalForecast:B(personalForecast),
  unknownPersonalActual,unknownPersonalExpected,unknownScheduledAmounts,unconfirmed
});
const Q = (from,until,asOf,expected) => ({from,until,asOf,expected:totals(expected)});
const noLink = {plannedDate:null,plannedKey:'',plannedAmount:null,plannedCurrency:null,
  plannedVersionId:null,plannedPersonalAmount:null};
const cancelled = {status:'cancelled',remainingPayments:2,remainingFromDate:'2026-09-15',endDate:'2026-08-31'};
const bundleVersions = [V('v1','2026-09-01',{amount:30000}),V('v2','2026-10-01',{amount:36000,personalShare:12000})];

export const cases = [
  {
    id:'R1_price_change_does_not_reset_two_remaining',
    subscriptions:[C([V('v1','2026-09-01',cancelled),V('v2','2026-10-01',{...cancelled,amount:30000,personalShare:8000})])],
    payments:[],events:[E('2026-09-15',20000,10000),E('2026-10-15',30000,8000)],
    queries:[
      Q('2026-09-01','2026-11-30','2026-09-01',{planned:50000,remaining:50000,forecast:50000,personalPlanned:18000,personalRemaining:18000,personalForecast:18000}),
      Q('2026-10-01','2026-11-30','2026-10-01',{planned:30000,remaining:30000,forecast:30000,personalPlanned:8000,personalRemaining:8000,personalForecast:8000}),
      Q('2026-11-01','2026-11-30','2026-11-01',{}),
      Q('2026-09-01','2026-11-30','2026-10-01',{planned:50000,remaining:30000,forecast:30000,personalPlanned:18000,personalRemaining:8000,personalForecast:8000,unconfirmed:1})
    ],
    mustNot:['2026-11-15에 제3회 생성','이용 종료일8/31로 확정 잔여 청구 삭제','10월 조회에서 잔여2회 재시작']
  },
  {
    id:'R2_later_cancellation_starts_its_own_remaining_basis',
    subscriptions:[C([
      V('v1','2026-09-01'),
      V('v2','2026-10-01',{status:'cancelled',firstDueDate:'2026-10-15',remainingPayments:2,remainingFromDate:'2026-10-15',endDate:'2026-09-30'}),
      V('v3','2026-11-01',{status:'cancelled',firstDueDate:'2026-10-15',remainingPayments:2,remainingFromDate:'2026-10-15',endDate:'2026-09-30',amount:30000,personalShare:8000})
    ])],payments:[],events:[E('2026-09-15',20000,10000),E('2026-10-15',20000,10000),E('2026-11-15',30000,8000)],
    queries:[Q('2026-09-01','2026-12-31','2026-09-01',{planned:70000,remaining:70000,forecast:70000,personalPlanned:28000,personalRemaining:28000,personalForecast:28000}),
      Q('2026-11-01','2026-12-31','2026-11-01',{planned:30000,remaining:30000,forecast:30000,personalPlanned:8000,personalRemaining:8000,personalForecast:8000})],
    mustNot:['9월 청구가10월부터 확정한 잔여2회를 미리 소진','11월 가격 변경으로12월 청구 추가']
  },
  {
    id:'D1_same_day_custom_cycle_change_owns_boundary',
    subscriptions:[C([V('v1','2026-09-01'),V('v2','2026-10-15',{cycle:'custom',cycleMonths:3,anchorDate:'2026-10-15',firstDueDate:'2026-10-15',amount:90000,personalShare:30000})])],
    payments:[],events:[E('2026-09-15',20000,10000),E('2026-10-15',90000,30000),E('2027-01-15',90000,30000)],
    queries:[Q('2026-09-01','2027-01-31','2026-09-01',{planned:200000,remaining:200000,forecast:200000,personalPlanned:70000,personalRemaining:70000,personalForecast:70000}),
      Q('2026-11-01','2027-01-31','2026-11-01',{planned:90000,remaining:90000,forecast:90000,personalPlanned:30000,personalRemaining:30000,personalForecast:30000})],
    mustNot:['10/15 옛 월간20,000과 새3개월90,000을 동시에 생성','11/15 또는12/15 옛 월간 잔존']
  },
  {
    id:'D2_prepaid_annual_price_change_is_not_a_midcycle_charge',
    subscriptions:[C([V('v1','2026-01-01',{cycle:'annual',anchorDate:'2026-01-31',firstDueDate:'2026-01-31',amount:120000,personalShare:60000}),
      V('v2','2026-03-01',{cycle:'annual',anchorDate:'2026-01-31',firstDueDate:'2026-01-31',amount:144000,personalShare:72000})])],
    payments:[P({date:'2026-01-31',amount:120000,personalAmount:60000,personalCurrency:'KRW',plannedDate:'2026-01-31',plannedKey:'contract:c@2026-01-31',plannedAmount:120000,plannedPersonalAmount:60000})],
    events:[E('2026-01-31',120000,60000),E('2027-01-31',144000,72000)],
    queries:[Q('2026-01-01','2027-01-31','2026-03-01',{planned:264000,actual:120000,remaining:144000,forecast:264000,personalPlanned:132000,personalActual:60000,personalRemaining:72000,personalForecast:132000}),
      Q('2026-03-01','2026-12-31','2026-03-01',{})],
    mustNot:['3/1 새 연간 청구 생성','가격 변경만으로 기존 선결제 환불/일할액 생성']
  },
  {
    id:'D3_leap_month_end_and_effective_day',
    subscriptions:[C([V('v1','2028-01-01',{anchorDate:'2028-01-31',firstDueDate:'2028-01-31',amount:10000,personalShare:4000}),
      V('v2','2028-02-29',{anchorDate:'2028-01-31',firstDueDate:'2028-01-31',amount:20000,personalShare:6000})])],
    payments:[],events:[E('2028-01-31',10000,4000),E('2028-02-29',20000,6000),E('2028-03-31',20000,6000),E('2028-04-30',20000,6000)],
    queries:[Q('2028-01-01','2028-04-30','2028-01-01',{planned:70000,remaining:70000,forecast:70000,personalPlanned:22000,personalRemaining:22000,personalForecast:22000})],
    mustNot:['3/29로 기준일 표류','2/29에 옛 가격 적용']
  },
  {
    id:'D4_pause_unknown_gap_and_confirmed_resume',
    subscriptions:[C([V('v1','2026-09-01'),V('v2','2026-10-01',{status:'paused',pauseBilling:'unknown',remainingPayments:null}),
      V('v3','2026-11-01',{status:'active',amount:30000,personalShare:8000})])],
    payments:[],events:[E('2026-09-15',20000,10000),E('2026-11-15',30000,8000)],
    queries:[Q('2026-09-01','2026-11-30','2026-09-01',{planned:50000,remaining:50000,forecast:50000,personalPlanned:18000,personalRemaining:18000,personalForecast:18000})],
    warnings:{unknownPauseBillingIdentities:['contract:c'],unknownInterval:['2026-10-01','2026-10-31']},
    mustNot:['10월 중지=무료 확정','11월 현재 active 상태를9~10월 전체에 소급 적용']
  },
  {
    id:'D5_unknown_pause_retains_confirmed_remaining_count',
    subscriptions:[C([V('v1','2026-09-01',{...cancelled,status:'paused',pauseBilling:'unknown'}),
      V('v2','2026-10-01',{...cancelled,status:'paused',pauseBilling:'unknown',amount:30000,personalShare:8000})])],
    payments:[],events:[E('2026-09-15',20000,10000),E('2026-10-15',30000,8000)],
    queries:[Q('2026-09-01','2026-11-30','2026-09-01',{planned:50000,remaining:50000,forecast:50000,personalPlanned:18000,personalRemaining:18000,personalForecast:18000})],
    warnings:{unknownPauseBillingIdentities:['contract:c']},
    mustNot:['unknown 상태를 이유로 확정한 잔여2회 삭제','버전마다2회를 다시 생성']
  },
  {
    id:'M1_historical_usd_link_survives_current_krw_terms',
    subscriptions:[C([V('v1','2026-09-01',{amount:2000,currency:'USD',personalShare:1000}),
      V('v2','2026-10-01',{amount:30000,currency:'KRW',personalShare:8000})])],
    payments:[P({date:'2026-09-14',amount:1900,currency:'USD',personalAmount:12000,personalCurrency:'KRW',plannedAmount:2000,plannedCurrency:'USD',plannedPersonalAmount:1000})],
    events:[E('2026-09-15',2000,1000,'USD'),E('2026-10-15',30000,8000)],
    queries:[Q('2026-09-01','2026-10-31','2026-10-01',{planned:{USD:2000,KRW:30000},actual:{USD:1900},remaining:30000,forecast:{USD:1900,KRW:30000},personalPlanned:{USD:1000,KRW:8000},personalActual:12000,personalRemaining:8000,personalForecast:20000})],
    snapshotAfterUnrelatedEdit:{plannedKey:'contract:c@2026-09-15',plannedAmount:2000,plannedCurrency:'USD',plannedVersionId:'v1',plannedPersonalAmount:1000},
    matchedDifference:{currency:'USD',amount:-100,personalDifference:null},
    mustNot:['과거 USD 결제 메모 수정 시 현재 KRW와 비교하여 거부','1,900을1,900원으로 재해석','개인KRW12,000에서 예상USD1,000을 빼서 차액 생성']
  },
  {
    id:'P1_unknown_actual_share_never_reopens_matched_expected_share',
    subscriptions:[C([V('v1','2026-09-01'),V('v2','2026-10-01',{amount:30000,personalShare:8000})])],
    payments:[P()],events:[E('2026-09-15',20000,10000),E('2026-10-15',30000,8000)],
    queries:[Q('2026-09-01','2026-10-31','2026-09-16',{planned:50000,actual:20000,remaining:30000,forecast:50000,personalPlanned:18000,personalRemaining:8000,personalForecast:8000,unknownPersonalActual:1}),
      Q('2026-09-01','2026-09-30','2026-09-16',{planned:20000,actual:20000,forecast:20000,personalPlanned:10000,unknownPersonalActual:1})],
    mustNot:['개인 전망18,000으로 이중 합산','미확인 실제 개인액을0원 확인으로 표시']
  },
  {
    id:'P2_cross_period_charge_and_current_period_refund',
    subscriptions:[C([V('v1','2026-09-01'),V('v2','2026-10-01',{amount:30000,personalShare:8000})])],
    payments:[P({date:'2026-08-31',amount:19000,personalAmount:7000,personalCurrency:'KRW'}),
      P({...noLink,id:'r',entryType:'refund',refundOfId:'p',date:'2026-09-20',amount:5000,personalAmount:2000,personalCurrency:'KRW'})],
    events:[E('2026-09-15',20000,10000),E('2026-10-15',30000,8000)],
    queries:[Q('2026-09-01','2026-10-31','2026-09-21',{planned:50000,actual:-5000,remaining:30000,forecast:25000,personalPlanned:18000,personalActual:-2000,personalRemaining:8000,personalForecast:6000}),
      Q('2026-09-01','2026-09-30','2026-09-21',{planned:20000,actual:-5000,forecast:-5000,personalPlanned:10000,personalActual:-2000,personalForecast:-2000})],
    mustNot:['조회기간밖 결제를 매칭맵에서 제외','환불 후 원 예정 청구 재개','음수 순지출을0으로 자름']
  },
  {
    id:'P3_zero_unknown_and_refund_month_are_distinct',subscriptions:[],events:[],
    payments:[P({...noLink,id:'z',date:'2026-09-02',amount:10000,personalAmount:0,personalCurrency:'KRW'}),
      P({...noLink,id:'u',date:'2026-09-03',amount:10000}),
      P({...noLink,id:'ru',entryType:'refund',refundOfId:'u',date:'2026-09-05',amount:2000}),
      P({...noLink,id:'k',date:'2026-09-06',amount:8000,personalAmount:3000,personalCurrency:'KRW'}),
      P({...noLink,id:'rk',entryType:'refund',refundOfId:'k',date:'2026-10-01',amount:2000,personalAmount:1000,personalCurrency:'KRW'})],
    queries:[Q('2026-09-01','2026-09-30','2026-10-02',{actual:26000,forecast:26000,personalActual:3000,personalForecast:3000,unknownPersonalActual:2}),
      Q('2026-09-01','2026-10-31','2026-10-02',{actual:24000,forecast:24000,personalActual:2000,personalForecast:2000,unknownPersonalActual:2}),
      Q('2026-10-01','2026-10-31','2026-10-02',{actual:-2000,forecast:-2000,personalActual:-1000,personalForecast:-1000})],
    note:'순수 원장 합산 단위 테스트이므로 subscriptions를 생략했다. API 테스트에는 소유 구독을 먼저 만든다.'
  },
  {
    id:'U1_known_effective_date_unknown_price_and_undated_draft',
    subscriptions:[C([V('v1','2026-09-01'),V('v2','2026-10-01',{amount:null,personalShare:8000}),
      V('draft',null,{amount:99000,personalShare:99000},{state:'draft'})])],
    payments:[],events:[E('2026-09-15',20000,10000),E('2026-10-15',null,8000),E('2026-11-15',null,8000)],
    queries:[Q('2026-09-01','2026-11-30','2026-09-01',{planned:20000,remaining:20000,forecast:20000,personalPlanned:26000,personalRemaining:26000,personalForecast:26000,unknownScheduledAmounts:2})],
    mustNot:['이후 금액 미확인을 옛20,000으로 채움','날짜 없는 초안99,000을 활성화','총액 미확인이면 별도로 확인한 개인 예정액8,000도 무조건 삭제']
  },
  {
    id:'B1_bundle_shared_history_and_member_payment_match_once',
    subscriptions:[C(bundleVersions,'a','pack'),C(bundleVersions,'b','pack')],
    payments:[P({subscriptionId:'b',amount:29000,personalAmount:9000,personalCurrency:'KRW',plannedKey:'bundle:pack@2026-09-15',plannedAmount:30000})],
    events:[E('2026-09-15',30000,10000,'KRW','bundle:pack'),E('2026-10-15',36000,12000,'KRW','bundle:pack')],
    queries:[Q('2026-09-01','2026-10-31','2026-09-16',{planned:66000,actual:29000,remaining:36000,forecast:65000,personalPlanned:22000,personalActual:9000,personalRemaining:12000,personalForecast:21000})],
    mustNot:['도구2개라서 예정/개인액2배','a로 표시한 일정에서 b에 연결한 결제를 놓침']
  },
  {
    id:'D6_manual_once_not_recreated_by_price_version',
    subscriptions:[C([V('v1','2026-09-01',{cycle:'manual',amount:10000,personalShare:4000}),
      V('v2','2026-10-01',{cycle:'manual',amount:20000,personalShare:6000})])],
    payments:[],events:[E('2026-09-15',10000,4000)],
    queries:[Q('2026-09-01','2026-12-31','2026-09-01',{planned:10000,remaining:10000,forecast:10000,personalPlanned:4000,personalRemaining:4000,personalForecast:4000}),
      Q('2026-10-01','2026-12-31','2026-10-01',{})],
    mustNot:['가격 버전만 추가했는데 수동1회 청구 재생성']
  }
];

// 독립 검산: 이력 해석을 하지 않고, 위에 손으로 열거한 events와 실제 원장만 합산한다.
function cleaned(map){return Object.fromEntries(Object.entries(map).filter(([,v])=>v!==0).sort(([a],[b])=>a.localeCompare(b)));}
function plus(map,currency,amount){assert.ok(Number.isSafeInteger(amount));map[currency]=(map[currency]||0)+amount;assert.ok(Number.isSafeInteger(map[currency]));}
function sumMaps(a,b){const out={...a};for(const [c,n] of Object.entries(b))plus(out,c,n);return out;}
function validDate(s){const d=new Date(s+'T00:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;}
export function selfCheck(){
  let queries=0;
  for(const c of cases){
    assert.equal(new Set(c.events.map(e=>e.key)).size,c.events.length,c.id+' duplicate listed event');
    for(const e of c.events)assert.ok(validDate(e.date),c.id+' invalid listed date');
    const matched=new Set(c.payments.filter(p=>p.entryType!=='refund'&&p.plannedKey).map(p=>p.plannedKey));
    for(const q of c.queries){
      const got=totals({});
      for(const e of c.events.filter(e=>q.from<=e.date&&e.date<=q.until)){
        if(e.amount==null)got.unknownScheduledAmounts++;else plus(got.planned,e.currency,e.amount);
        if(e.personalShare!=null)plus(got.personalPlanned,e.currency,e.personalShare);
        if(matched.has(e.key))continue;
        if(e.date<q.asOf){got.unconfirmed++;continue;}
        if(e.amount!=null)plus(got.remaining,e.currency,e.amount);
        if(e.personalShare==null)got.unknownPersonalExpected++;else plus(got.personalRemaining,e.currency,e.personalShare);
      }
      for(const p of c.payments.filter(p=>q.from<=p.date&&p.date<=q.until)){
        const sign=p.entryType==='refund'?-1:1;plus(got.actual,p.currency,sign*p.amount);
        if(p.personalAmount==null)got.unknownPersonalActual++;
        else {assert.ok(p.personalCurrency);plus(got.personalActual,p.personalCurrency,sign*p.personalAmount);}
      }
      got.forecast=sumMaps(got.actual,got.remaining);got.personalForecast=sumMaps(got.personalActual,got.personalRemaining);
      for(const key of Object.keys(got))if(typeof got[key]==='object')got[key]=cleaned(got[key]);
      assert.deepEqual(got,q.expected,c.id+' '+q.from+'..'+q.until+' asOf '+q.asOf);queries++;
    }
  }
  return {fixtures:cases.length,queries};
}
```

실행 예시(이 Markdown만 읽고, 파일을 추가 생성하지 않는다):

```sh
node --input-type=module - <<'JS'
import fs from 'node:fs';
const md=fs.readFileSync('/private/tmp/ais-v8-billing-cases.md','utf8');
const source=md.split('```js\n')[1].split('\n```')[0];
const fixture=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
console.log(fixture.selfCheck());
JS
```

추가 필수 변형은 새 기능이 아니라 위 경계의 작은 회귀 사례다.

| 원 fixture | 입력 변형 | 기대 결과 |
|---|---|---|
| R1 | 잔여 횟수0 | 모든 조회에서0개 청구, unknown 잔여가 아님 |
| R1 | cancelled의 잔여 횟수null | 예정0원 확정이 아니라 잔여 청구 미확인; 미확인 계약 식별자1개 |
| R1 | 잔여3회, 11/1에40,000/개인6,000 가격 버전 추가 | 9/15=20,000,10/15=30,000,11/15=40,000 총90,000/개인24,000;12월0건 |
| R2 | 현재 조회가11/1부터 | 11/15 한 번만 남음. 과거9/15와10/15를 조회에서 숨겨도 잔여 기준/소진 이력은 유지 |
| D1 | 주기만 바꾸고 새 기준일/첫 청구일 미확인 | 새 구간 일정 미확인. 임의의 적용일 청구나 옛 월간 반복 생성 금지 |
| D3 | 2028→2026, 적용일2/29→2/28 | 1/31,2/28,3/31,4/30; 총70,000/개인22,000 유지 |
| D4 | pauseBilling='stops', 확인 재개11/1 | 10월 청구 없음이 확인된 경우. unknownPause 경고는0. 9월과11월 금액은 원 fixture와 같음 |
| D5 | status='unknown', remaining2 | 갱신 미확인을 표시하면서9/15·10/15 확정 잔여2회 유지 |
| M1 | 9월 예상 조건을 명시적으로 정정해2,500으로 재산정하더라도 원 연결 snapshot은2,000 | 실제1,900, 연결 당시 예상2,000, 당시 차액−100USD 유지. 정정 기준 차이−600은 표시하더라도 별도 의미로 분리 |
| M1 | 과거 결제의 개인Amount12,000KRW를 현재 계약 부담8,000으로 바꿈 | 계약 변경만으로는 허용되지 않는 자동 덮어쓰기. 원 결제를 사용자가 명시 수정할 때만 실제 원장 변경 |
| P1 | 실제 개인Amount를null→0, currencyKRW로 명시 확인 | 미확인 건수1→0. 개인 전망은 여전히10월8,000이며9월 예상10,000 재가산 없음 |
| P1 | 원 연결 결제 삭제 | 원 예정9/15가 조회 asOf9/16보다 과거이므로 미확인 과거1건이 됨. 미래 예상에는 재가산하지 않음 |
| P2 | 환불 개인액null | 실제 개인 합계에 해당 환불액을 추정하지 않음; 기간 내 개인 미확인1건. 9월 예정은 여전히 연결됨 |
| P3 | 원 개인3,000에 이미 개인환불1,000, 추가개인환불2,001 | 누적3,001>3,000이므로 거절. 전체 환불 가능액이 남아 있어도 개인 한도 우회 금지 |
| P3 | 원 개인액3,000을500으로 줄이거나 다른통화로 변경, 기존 개인환불1,000 유지 | 모순을 만드는 수정 거절. 환불을 먼저 정정/정리하도록 안내 |
| U1 | v2.personalShare도null | 개인 예정/전망 알려진10,000만 유지, 미래 개인액 미확인2회. null을0원 확인으로 표시하지 않음 |
| B1 | subscriptions 순서를[b,a]로 교환 | 날짜·금액·개인 합계·매칭 결과 동일 |
| D6 | 새 수동 청구일10/20을 명시적으로 확인한 별도 버전 | 9/15 원1회 +10/20 새1회. 반복 주기를 만들지 않음 |

마이그레이션 경계의 별도 검증: `knownFrom=2026-09-12`이고 이전 조건을 확인하지 않은 기존 계약에서9/1~9/11을 조회할 때, 그 기간의 **실제 결제**는 보존하고 **확정 과거 예정 조건**을 현재 금액으로 만들어내지 않는다. 이력 공백을 표시한다. 기존 `plannedKey`, `plannedAmount`, 결제/환불의 원통화·날짜는 변환/메모 저장/현재 가격 변경 후 그대로여야 한다.

M1의 독립 개인 통화(KRW)는 앞선 설계가 제안한 지원 방식이다. 첫 구현을 명시적으로 원통화 개인액만 지원하도록 제한한다면 개인액을USD900(9달러)으로 바꾸고 기대 `personalActual={USD:900}`, `personalForecast={USD:900,KRW:8000}`으로 사용한다. 임의 환산/통화 혼합을 금지하는 의미는 같다. 독립 개인 통화 지원 자체를 새 필수 요구로 가산하지 않는다.

API 테스트는 M1의 `snapshotAfterUnrelatedEdit` 및 B1의 번들 키/금액과 영속 저장 전후를 비교해야 한다. 위 `selfCheck`는 숫자 검산만 하므로 소유권, 이력 수정 보호, 동시 저장, 저장 후 새로고침, DOM 필드 연결을 통과시킨 증거가 아니다.

검산 실행 결과: 제안 데이터14개, 조회 기대값25개가 모두 일치했다. 사이트 코드를 import하거나 변경하지 않았다.
