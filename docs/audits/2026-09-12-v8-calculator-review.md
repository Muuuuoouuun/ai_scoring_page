# V8 계산기 한정 독립 검토

2026-09-12. 현재 수정 중인 `site/lib/billing.ts`와 `site/tests/billing-history.test.mjs`를 읽고 계산 함수를 실행했다. 사이트 파일/Git/Sites/브라우저는 변경하지 않았다. 아래 행 번호는 검토 당시 작업 트리 기준이며 부모의 병행 수정에 따라 달라질 수 있다.

**새로 재현한 문제는 매칭된 개인 예상액의 통화 혼합 1건, 미래 조건의 불완전성 경고 누락 1건, 번들 비교의 호환/정규화 문제 1묶음이다.** 부모가 이미 확인한 중지→재개 후 월 환산0 유지와 `uncertainFrom` 이후 구 월 환산 유지 문제는 여기서 다시 지적하지 않는다.

## 실행한 기존 검증

- `node --experimental-strip-types --test tests/billing-history.test.mjs tests/billing.test.mjs`: **38/38 통과**.
- `/private/tmp/ais-v8-billing-cases.md`의14개 fixture를 현재 `nextDate/termsHistory` 모양으로만 변환해 실제 `billingReport`에 실행: **25/25 조회의 날짜·금액·개인액·매칭 상태 기대값 일치**.
- 정상 조건의 잔여 N회 공유, 해지 전 청구와 잔여 시작점 구분, 조회기간 변경, 같은 날 주기 전환, 연간 중간 가격 변경, 윤년 말일, unknown 상태와 확정 잔여, 기간 밖 결제의 매칭, 환불 날짜, 개인액null 중복 방지, 정상 일치 번들 순서 반전에서 새 중복/누락은 재현되지 않았다.
- 아래 오류는 기존14개 이력 테스트와 독립 fixture의 **추가 경계**다. API/UI/배포 회귀는 이 검토로 통과했다고 하지 않는다.

## P1 · 같은 청구일을 정정하면 원 매칭 통화에 새 개인액이 붙음

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:106`–`:112`. 특히 반환문은 `amount/currency/versionId`만 원 연결 스냅샷으로 치환하고, 펼쳐진 `d.personalShare`는 새 조건 값을 남긴다.

재현:

1. 9/15 예정액 USD2,000(20달러), 개인 예상USD1,000(10달러)을 원 결제에 연결한다. 실제 결제USD1,900, 실제 개인 부담KRW12,000을 기록한다.
2. 같은 날짜의 계약 조건을 명시 정정하여 현재 조건이 KRW30,000/개인KRW8,000이 되게 한다. 원 연결 스냅샷은 보존한다.
3. 9월 `billingReport` 조회.

실제 반환:

```json
{
  "amount": 2000,
  "currency": "USD",
  "personalShare": 8000,
  "versionId": "old",
  "currentAmount": 30000,
  "currentCurrency": "KRW",
  "actualAmount": 1900,
  "actualCurrency": "USD",
  "difference": -100
}
```

기대: 원 매칭을 표시하는 행의 `personalShare`는 보존한 **USD1,000** 또는 명확히 분리된 `plannedPersonalAmount=1000, plannedPersonalCurrency='USD'`여야 한다. 정정된 개인액8,000은 `currentPersonalShare=8000/currentCurrency='KRW'`처럼 별도다. 현재 반환은 원 매칭 `currency='USD'`와 새 KRW 정수8,000을 한 행에 묶어80달러처럼 읽게 한다. 실제 개인 원장합계KRW12,000과 계약 차액USD−100 계산 자체는 이번 사례에서 보존됐다.

작은 수정: matched 행의 표시 스냅샷을 금액·통화·개인 예상액·버전 전체로 일관되게 선택한다. `plannedPersonalAmount:null`과 필드 미존재를 새 현재 부담액으로 자동 보충하지 않는다. 현재 조건 참고값을 남기려면 개인액도 `current*` 필드로 분리한다. `report.personal`을 원래 예정값 합으로 쓸지 현재 정정 조건 참고값으로 쓸지는 명시하고 행의 통화와 섞지 않는다.

기존 테스트의 공백: `billing-history.test.mjs:76`은 **정정 후 기존 날짜가 사라진 경우**를 검사하여 스냅샷 행 복원은 통과한다. 기존 날짜가 그대로 존재하면서 개인액/통화만 바뀐 경우는 검사하지 않는다.

## P2 · 미래 세금·사용량 조건은 누락되지만 불완전성 카운터가0

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:154`–`:155`, `:173`–`:175`.

재현: 9월은 KRW20,000·세금 포함·고정 요금. 10/1부터 KRW30,000으로 바꾸면서 다음 중 하나를 적용하고9/1–10/31 조회한다.

| 10월 조건 | 실제 기대 합계 | 실제 카운터 | 최소 기대 |
|---|---:|---|---|
| `taxStatus='excluded', taxAmount=null` | 50,000 | `unknownTax=0, unknownFutureAmounts=0` | 50,000은 알려진 부분합이며 별도 세액 미확인1계약/해당 이벤트를 표시 |
| `taxStatus='unknown'` | 50,000 | `unknownTax=0` | 세금 포함 여부 미확인 표시 |
| `pricingMode='hybrid'` | 50,000 | `variable=0` | 10월 사용량 추가액이 미포함임을 표시 |

현재 `unknownTax/variable`은 조회 시작일의 `current` 조건에서만 가져온다. 일정에는 새 조건의 기본 금액을 합산하지만 그 구간의 불완전성을 집계하지 않아서 전체 조회가 완전한 비용처럼 보인다. 알 수 없는 세금/사용량을 추정해서 총액에 넣으라는 요구가 아니다.

작은 수정: 조회 범위와 겹치는 활성 버전/실제 생성 일정의 세금·사용량 불완전성을 모아 카운터/이유를 반환한다. 현재 월 환산의 불완전성과 기간 예상의 불완전성을 구분하거나, 적어도 기간 내 해당 계약을 한 번 표시한다. 같은 번들의 여러 멤버/여러 버전 때문에 동일 불완전 계약을 중복 집계하지 않는다. 미래 구간만 조회하면 이미 경고가 생기는 사례도 포함해 범위를 앞당겨도 경고가 사라지지 않는지 검사한다.

## P2 · 번들 비교가 레거시 값 충돌은 놓치고 키 순서 차이는 충돌로 취급

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:147`–`:149`.

### 알려진 서로 다른 레거시 금액을 임의 선택

이력 없는 같은 `bundleId='pack'`, 같은 주기/날짜/상태/통화인 두 행에서 a.amount=30,000, b.amount=50,000을 전달한다.

실제: `conflictingHistory=0`, 예정9/15 한 행30,000, `unknown*=0`.

기대: 알려진 서로 다른 청구 조건을 충돌로 표시하고 확인되지 않은30,000 또는50,000을 확정 합계로 선택하지 않는다. 유지 설계 `v8-history-review.md`의 기존 번들 금융 조건 충돌 확인에 해당한다. **실제 배포 계정에 이런 충돌 레코드가 있다는 주장은 아니며**, 저장된 레거시 입력을 처리하는 호환 경계다. 기존 정상 API가 같은 값을 보장하는 경우에는 발생하지 않는다.

작은 수정: history 부재 경로도 정규화한 금융 필드의 양립 가능성을 검사한다. 기존에 허용/검증한 “금액null 멤버 + 같은 조건의 알려진 금액 멤버” 선택은 유지하되, 알려진 금액끼리 다르거나 주기/통화/상태가 서로 다르면 경고로 분리한다.

### 의미가 같은 이력을 다른 JSON 키 순서 때문에 전체 제외

동일 history 값에 대해 한 멤버는 `{schemaVersion, revision, knownFrom, versions}`, 다른 멤버는 `{versions, knownFrom, revision, schemaVersion}` 순서로 객체를 만들면:

실제: `conflictingHistory=1`, `schedule=[]`.

기대: 같은 금융 조건·버전·메타데이터 값이면 같은 번들1회 합산. 객체 키 순서는 계약 조건이 아니다. 현재 서버가 동일 문자열을 멤버에게 복사하는 경로에서는 덜 발생하지만, 정규화/마이그레이션/다른 JSON 작성 순서에서는 안전한 비교가 아니다.

작은 수정: 스키마 정규화 후 키 순서와 무관한 깊은 비교 또는 안정 직렬화를 사용한다. 실제 버전/조건의 차이를 무시하라는 의미가 아니다.

## 그대로 실행할 수 있는 좁은 재현

아래는 현재 모듈을 읽어서 출력만 한다. 사이트 파일을 생성/변경하지 않는다.

```sh
cd /Users/bigmac_moon/dev/ai_score
node --experimental-strip-types --input-type=module - <<'JS'
import {summarizeContracts,billingReport} from './site/lib/billing.ts';
const base={amount:2000,currency:'USD',cycle:'monthly',anchorDate:'2026-09-15',nextDate:'2026-09-15',status:'active',amountBasis:'total',taxStatus:'included',personalShare:1000};
const v=(id,effectiveFrom,patch={},extra={})=>({id,effectiveFrom,recordedAt:'2026-09-12T00:00:00Z',state:'confirmed',reason:'test',terms:{...base,...patch},...extra});
const C=versions=>({id:'c',...base,termsHistory:{schemaVersion:1,revision:versions.length,knownFrom:'2026-09-01',versions}});
const corrected=C([v('old','2026-09-01'),v('fixed','2026-09-01',{amount:30000,currency:'KRW',personalShare:8000},{supersedes:'old'})]);
const p={id:'p',subscriptionId:'c',date:'2026-09-15',amount:1900,currency:'USD',plannedDate:'2026-09-15',plannedKey:'contract:c@2026-09-15',plannedAmount:2000,plannedCurrency:'USD',plannedPersonalAmount:1000,plannedVersionId:'old',personalAmount:12000,personalCurrency:'KRW'};
console.log('matched snapshot',billingReport([corrected],[p],'2026-09-01','2026-09-30','2026-09-16').schedule[0]);
for(const patch of [{taxStatus:'excluded',taxAmount:null},{taxStatus:'unknown'},{pricingMode:'hybrid'}]){
 const c=C([v('v1','2026-09-01',{amount:20000,currency:'KRW'}),v('v2','2026-10-01',{amount:30000,currency:'KRW',...patch})]);
 const r=summarizeContracts([c],'2026-09-01','2026-10-31');
 console.log('future uncertainty',patch,{expected:r.currencies.KRW.expected,unknownTax:r.unknownTax,variable:r.variable,unknownFutureAmounts:r.unknownFutureAmounts});
}
const a={id:'a',...base,amount:30000,currency:'KRW',bundleId:'pack'},b={...a,id:'b',amount:50000};
console.log('legacy conflict',summarizeContracts([a,b],'2026-09-01','2026-09-30'));
const h=C([v('v1','2026-09-01')]).termsHistory;
const reordered={versions:h.versions,knownFrom:h.knownFrom,revision:h.revision,schemaVersion:h.schemaVersion};
console.log('same history reordered',summarizeContracts([{...a,termsHistory:h},{...a,id:'b',termsHistory:reordered}],'2026-09-01','2026-09-30'));
JS
```

제시한 실제 값은 검토 시점에 실행해 관측했다. 부모가 병행 수정 중이므로 이후 같은 명령의 결과가 달라지면 해당 재현이 해결됐는지 기대값과 비교하면 된다. 이 보고서는 새 범위나 점수 변경을 제안하지 않는다.
