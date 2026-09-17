현재 재검토 상태(2026-09-12): 아래에서 남아 있다고 기록한 미래일 actual/환불 중복/기간 이용 fit 경계는 모두 수정 확인했다. 엔진19개+비교 API7개=26/26 통과. 최신 판정과 원래8.3.4 매핑은 /private/tmp/ais-v9-gate-834-recheck.md를 따른다. 아래는 초회 감사 기록이다.

---

# V9 날짜별 비교 엔진 읽기 전용 감사

검토일: 2026-09-12 (Asia/Seoul). 대상: `/Users/bigmac_moon/dev/ai_score/site/lib/dated-comparison.ts`, `site/tests/dated-comparison.test.mjs`, 기존 billing/payment 검증, 원 구독 명세 및 `/private/tmp/ais-v9-transition-design-review.md`. 체크아웃·Git·Sites·브라우저·실제 DB 변경 없이 기존 인메모리 하네스로만 재현했다. Root가 동시에 수정하므로 발견 당시와 최종 읽기 상태를 구분한다.

## 결론

초기14개 fixture는 중요한 계산 경계를 검증한다. 검토에서 찾은 **청구 기준일 불일치**와 **비교기간 밖 전환 선결제의 무료 변경 추천**은 Root가 즉시 수정했고, 새2개 회귀 테스트를 포함한 **16/16 테스트 통과(exit0)**를 독립 실행으로 확인했다.

남은 중요한 경계는 **미래 날짜 실제 원장 기록의 자금 한도 우회**와 **ID 없이 재입력한 기존 환불의 이중 차감**이다. 이용 종료/필수 기능 확인의 의미도 UI와 맞춰야 한다.

## 아직 남은 재현 결과

### 1. [P2] 미래일 원장 기록은 실제액에 포함되지만 준비금 계산에서 빠진다

위치: `dated-comparison.ts`의 `actual` 구성, `scenario`의 `e.kind !== 'actual'` cash 필터.

현재 paymentSchema는 미래 날짜를 허용한다. 따라서 서버가 소유한 실제 저장 기록만 넘겨도 다음 상황이 가능하다.

- asOf=9/12, 비교 종료10/1.
- 기존 월 계약10/1청구200,000원.
- 원장에 `date=10/1, plannedDate=10/1, amount=200,000`인 결제를 입력.
- 한 번에 준비할 수 있는 금액1,000원.

실제 엔진 결과: `commonActual=[10/1 200,000]`, `keep.total.KRW=200,000`, **`keep.peak={}`, `keep.complete=true`, `keep.feasible=true`, `recommendation='keep'`**. 예정 청구는 payment 매칭으로 없어지고 actual은 cash에서 제외되므로 미래에 필요한 돈이 없는 것으로 판정된다.

최소 보완: 미래일의 원장 결제/환불이 있으면 해당 날짜 기록을 확인 필요로 표시하고 final cash feasibility/recommendation을 미확인으로 둔다. 실제 기록을 수정하거나 가상의 결제일로 옮기지는 않는다. 과거에 실제로 지급한 선결제(date<asOf, plannedDate>asOf)는 정상이며 계속 예정 청구에서 제외되어야 한다. 이 둘을 구분하는 테스트가 필요하다.

### 2. [P2] 기존 환불을 ID 없이 조정에 다시 넣으면 두 번 차감할 수 있다

위치: `dated-comparison.ts`의 adjustment 처리. `recordedPaymentId`가 있으면 중복 연결을 막고 해당 실제 환불을 공통액에 한 번만 넣는 것은 정상이다. 다만 연결은 optional이다.

재현: 오늘 원장 refund100,000원이 존재하는 상태에서 **같은 환불**을 오늘 날짜·동일 통화/금액의 change adjustment로 다시 입력하되 recordedPaymentId는 생략했다. 유지청구100,000/신규청구120,000인 fixture의 실제 결과는 **keep0/change−80,000, difference80,000, change.complete=true, recommendation='change'**였다. 정당한 비교는 기존 실제 환불을 양쪽에서 한 번만 빼야 하므로 keep0/change20,000이다.

두 개의 별도 환불이 같은 날짜/금액일 수도 있으므로 값만 같다는 이유로 자동 삭제하면 안 된다. 최소 보완은 원장 환불과 겹치는 입력이 있을 때 기존 ID 연결 또는 별개 환불이라는 명시적 구분을 요구하고, 해결 전에는 미확인 상태로 두는 것이다. UI도 ‘이미 기록된 환불 선택’과 ‘아직 반영되지 않은 확인 환불’을 구분해야 한다. 원 결제/공식 정산 식별자가 있다면 이를 재사용한다. 같은 금액·날짜가 둘이라는 이유만으로 동일 거래라고 단정하지 않는다.

### 3. [P2, UI 계약 확인] keepFit=yes는 기간 전체 이용 가능 여부까지 의미해야 한다

엔진은 keepFit 값만으로 유지안의 기능 적합성을 판단한다. 원 계약이 이미 `status=ended, remainingPayments=0, endDate=10/31`이고 비교가12/31까지인데 keepFit=yes이면 비용0인 keep을 complete/feasible로 두고 추천할 수 있다.

필수 기능 ‘종류’가 제공된다는 확인만으로는 이용 권한이 비교 종료일까지 있다는 뜻이 아니다. keepFit UI는 **비교 기간 전체에 필요한 기능·이용 권한이 유지됨**을 확인하는 항목이어야 한다. 실제 원 계약의 확인된 종료와 모순되면 현재 유지에 서비스 공백이 있음을 표시하고, 갱신 가정을 별도로 확인하거나 미확인/부적합으로 처리한다.

주의: `oldAccessUntil`은 변경할 때 기존 이용 종료를 가정한 값일 수 있다. 그 값만으로 유지안을 막으면 갱신을 계속하는 올바른 유지안도 잘못 차단한다. 실제 원 계약의 종료 조건과 변경안의 종료 가정을 구분해야 한다. keepFit=no인 현재 테스트는 잘 동작하지만 알려진 종료와 keepFit=yes가 충돌하는 사례는 검사하지 않는다.

## 이미 수정하고 검증한2건

### A. 첫 청구일이 cadence와 맞지 않으면 연 요금이 사라짐 — 수정 확인

초기 상태에서 annual anchor10/1,nextDate10/2를 넣으면 schema/기본 날짜 검사를 통과했다. paymentDates는 다음 유효 기준일인 다음 해10/1로 넘어가 이번기간의120,000원 청구를0건으로 만들었다. 실제 결과는 keep80,000/change20,000, complete=true, change 추천이었다.

현재 소스는 `paymentDates(anchor,cycle,nextDate,...).includes(nextDate)`로 정합성을 검사하고, `misaligned first bill cannot make an annual quote disappear` 테스트가 통과한다. manual 주기는 별도의 직접1회 의미를 유지한다.

### B. 비교기간 전 필수 선결제가 있어도 변경안0원을 추천 — 수정 확인

초기 상태에서 from11/1,switch10/1,new annual120,000이면 keep40,000/change0, cheaper/recommendation=change였다.10/1의120,000과9/15공통청구20,000은 preparation 배열에만 있었다.

현재 소스는 `preparationOutsidePeriod`를 반환하고 그러한 경우 scalar cheaper/recommendation을 만들지 않는다. `mandatory preparation excluded from query does not produce a cheaper or recommended claim` 테스트가 통과한다. UI에서 이 flag를 날짜·금액과 함께 설명하고 시작일 조정 안내를 표시해야 사용자에게 해결 경로가 생긴다.

## 확인된 정상 경계

- candidate 금액/조정 금액은 음수·비정수·과도한 범위를 거부한다. 환불만 내부 부호를 음수로 바꾸며 합산은 safe integer를 검사한다.
- 잘못된 달력 날짜·과거 switch·역전 기간·범위를 넘는 기간·custom 간격 누락을 검증한다. 월31일→말일→다시31일 및 정상가 적용일의 날짜별 청구가 fixture에서 확인된다.
- 원 계약을 한 billingIdentity로 제한하고 bundle 구성원 청구를 한 번 집계한다. 미리 지급한 과거 결제가 미래 청구와 연결되면 원 청구만 제거한다.
- 실제 원장 기록은 양쪽 공통이고, 신규 가상 청구는 별도 계약 ID로 계산한다. 가상 계산이 기존 계약이나 payments를 변경하는 코드는 없다.
- unknown 금액/갱신가/세금/사용량/추가비용/일할정산은 완전성을 막는다.0과null을 구분한다. 알려진 추가금액도 날짜·source·confirmed가 없으면 확정 집계에 넣지 않는다.
- 하루 준비금은 같은 날짜의 양수 예정 지출을 합하고 환불과 상계하지 않는다. 나중의 환불은 앞선 연 선결제 한도를 낮추지 않는다.
- KRW와USD 등을 단일 절감액으로 합치지 않는다. 비용상 cheaper와 기능·자격·변경의사·예산을 반영한 recommendation을 별도 반환한다.
- 같은 조정 ID, 중복 recordedPaymentId, 다른 선택 계약의 refund ID는 거부한다. 확인된 기간 밖 환불을 기간 합계에 넣지 않는다.
- 기존 잔여 청구의 날짜별 이력 금액 변경을 보존하고 oldBilling cutoff 뒤 청구를 변경안에서 제거한다. 이용 겹침 일수 자체를 돈으로 계산하지 않는다.

## 구현 범위상의 짧은 유의점

- 현재 `candidate.nextDate < switchDate`를 거부한다. switchDate를 이용 시작일로 해석하면 먼저 선결제하고 나중에 이용을 시작하는 견적은 표현할 수 없다. 이 제약을 숨기지 말고 switchDate의 의미를 정확히 정하거나 청구일과 실제 이용 시작일을 구분해야 한다. 현재 테스트는 선청구를 invalid로 고정하므로 이것은 알려진 제약이다.
- `oldBilling='stop'`은 현재 원 계약의 확인된 잔여 청구도 잘라낼 수 있는 가정이다. UI에서 ‘이 날짜부터 추가 청구 없음 확인’으로 명시하고, 단순 해지 신청/새 서비스 선택으로 자동 채우지 않는다. 기존 약정 잔여가 있다면 차이가 표시되어야 한다.
- 이용 종료가 switchDate보다 앞이면 overlap.days는0이지만 from>until인 object가 반환된다. UI는0일일 때 `이용 겹침 없음`으로 표시하고 역전 구간을 그대로 렌더하지 않는다.

위의 남은2개 계산 경계와1개 fit 의미 확인 이외에 이번 bounded audit에서 추가 중대한 계산 결함은 확인하지 못했다. 웹/운영 DB·브라우저 검증이나 최종 UI 판정은 수행하지 않았다.
