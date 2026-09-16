# 수정 반영 후 재검토 (2026-09-12)

**아래 초회 검토의 주요6건은 현재 구현에 반영되었다.** 새 코드에서 SQL history UUID guard, 마지막 구성원 삭제의 최종 guarded authority DELETE, legacy seed의 parent 존재 조건, supersedes 조상 해석의 서버/UI 공유, 개인 환불의 원 개인통화 검사, 확정 해지의 예약 조건 전파, 기존 cancellation 확인일 편집 차단/안내를 확인했다.

다시 실행한 `node --test site/tests/history-api.test.mjs site/tests/api.test.mjs`는 **38/38 통과(exit0)**였다. 전체80테스트/TSC 통과는 Root가 전한 결과이며 이 하위 검토에서 중복 실행하지 않았다. 기존 실패 목록은 아래에 초회 기록으로 보존하며, 현재 그대로 미수정이라는 뜻이 아니다.

## 재검토에서 남은2개 경계

1. **[P2] 해지 전파가 이미 적용된 후속 조건도 덮는다.** 현재 `workspace-billing.ts`는 `activeTerms(c.history).filter(v => v.effectiveFrom > effectiveFrom)` 전체를 같은 해지 상태로 정정한다. 실제 API 재현: 최초9/1active → 명시적9/10재활성화 confirmed → 오늘 과거9/5해지 입력. 마지막 요청200 후9/10재활성화도cancelled로 대체되고 현재 상태가active에서cancelled로 바뀌었다. 미래 요금 예약 충돌을 해결한 수정 자체는 맞지만, 이미 적용된 후속 조건은 단순 미래 예약과 구분해야 한다. 최소 보완은 이런 후속 적용 조건이 있을 때 자동 전파를 막고 조건 이력에서 명시적으로 정정하도록 안내하는 것이다. 숨은 재가입 의도를 추정하거나 기록된 후속 상태를 자동 덮어쓰지 않는다.
2. **[P2] 개인 원금이 미확인인 상태에서 기록한 환불의 통화가 나중에 불일치할 수 있다.** 재현: 원 결제 개인금액null → 개인환불EUR100 minor 입력 → 같은 원 결제의 개인금액을KRW7,000으로 보완. 전부200이며 원 결제KRW/환불EUR가 공존했다. 원 결제 수정 branch가 `old.personalCurrency`를 조건으로 삼으므로 이전 값null이면 검사하지 않는다. 이미 개인금액이 있는 자식 환불들의 통화를 새 원 결제 personalCurrency와 비교하면 기존의 원 개인통화 일치 정책을 일관되게 적용할 수 있다. 원금미확인 때 환불을 기록하는 것 자체를 금지할 필요는 없다.

초회 보고서의 작은 보완2개(normalizeTerms ZodError503, legacy 예정 요금 비교 누락)는 이번 읽기 시점에도 남아 있다. 배포 데이터의 실제 상충 여부를 확인한 것은 아니다. 위2개 외에 수정한 CAS/seed/번들/스냅샷/소유권 경로에서 추가 중대한 결함은 확인하지 못했다. Root에 재검토 결과와 위2개 경계를 전달했다.

---

# V8 계약 조건 이력 구현 검토

검토일: 2026-09-12 (Asia/Seoul). 범위: 현재 `site/lib/contract-history.ts`, `site/lib/workspace-billing.ts`, `site/lib/billing.ts`, `site/app/api/billing-terms/route.ts`, workspace/export API, validation 및 SQLite D1 테스트 어댑터. 체크아웃·Git·Sites·브라우저는 변경하지 않았다. 임시 인메모리 fixture만 사용했다. Root가 동시에 수정 중이므로 아래 내용은 각 재현 시점의 구현에 대한 기록이다.

## 우선 처리할 재현된 결함

### 1. [P1] 이력 없는 기존 구독의 bootstrap이 삭제된 계정 기록을 재생성한다

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/contract-history.ts:50`, `/Users/bigmac_moon/dev/ai_score/site/lib/workspace-billing.ts:23`.

`historyContext`가 기존 legacy 구독을 읽고 H 없음/revision0을 확인한 뒤 계정 삭제가 실행되면, `commitHistory`의 seed INSERT는 기존 구독 존재 여부를 검사하지 않고 H를 새로 만든다. 이어서 새 결제 INSERT도 그 H만 검사해 통과한다. 부모 구독은 삭제되어도 orphan payment와 H가 남는다.

실행 증거: 테스트 하네스에서 구독을 만든 다음 H만 제거하여 legacy 상태를 만들었다. 해당 결제 요청의 첫 `D1.batch` 바로 직전에 소유자의 private_records를 전부 삭제하도록 어댑터를 래핑했다. API 결과는 **200**, 남은 행은 **billing_terms revision1 + payment(subscriptionId는 이미 없는 구독)**였다. 같은 경계의 기존 구독 UPDATE는 대상 행0이어도 H만 다시 생기고 성공할 수 있다.

최소 보완: `!exists` seed를 새 독립 계약 생성과 기존 legacy 계약 초기화로 구분한다. 후자는 동일 SQL에서 소유한 기존 parent/member가 여전히 존재하고 같은 billingIdentity에 속할 때만 `INSERT ... SELECT ... WHERE EXISTS(...)` 하도록 한다. 이후 모든 쓰기는 그 생성된 H/id/revision을 검사한다. Root가 계획한 historyId CAS 추가만으로는 이 bootstrap 문제를 막지 못한다.

이 제안은 이미 읽은 기존 부모의 삭제 경쟁을 막는다. 계정 삭제와 완전히 새로운 구독 생성 요청까지 전부 직렬화하는 account-level barrier는 별도 범위이며, 이 검토에서 구현을 요청하는 것은 아니다.

### 2. [P1] 예약된 미래 요금 조건이 확정 해지 뒤 계약을 다시 활성화한다

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/workspace-billing.ts:45`–55, `/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts`의 `summarizeContracts`.

재현:

1. 현재 월30,000원 active 계약.
2. 10/1부터 월50,000원으로 변경하는 confirmed 미래 조건(full snapshot, status=active)을 추가한다.
3. 9/12 해지 확정, 잔여 청구0, 종료일9/12를 저장한다.

모두200. 최종 activeTerms는 `9/12 cancelled / remaining0`, `10/1 active / remaining=null`. 조회 결과는 **10/15·11/15·12/15 각각50,000원, 예상150,000원**이다. 해지 저장이 확인일 조건만 추가하고 이후 full snapshot의 active 상태는 남기기 때문이다.

최소 보완: 해지 확정/종료가 미래 조건과 충돌하는 경우를 저장 시 해결해야 한다. 미래 조건을 함께 정정/철회하는 명확한 정책, 또는 충돌을 설명하고 미래 조건 정정을 요구하는 검증이 가능하다. 단순한 기존 요금 예약이 명시적 재가입 없이 재활성화 조건으로 집계되면 안 된다. 이 수정도 동일 H CAS 트랜잭션 안에서 처리해야 한다.

### 3. [P2] 해지 기록의 확인일 정정이 이전 파생 조건을 대체하지 않는다

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/workspace-billing.ts:47`–54.

재현: 최초 조건의 적용일을9/1로 확인한 월 계약(청구일9/11)에서 cancellation을 `confirmedAt=9/10, remainingPayments=0`으로 저장하고, **같은 cancellation ID**의 확인일을9/12로 수정했다. 둘 다200. activeTerms에는 `9/1 active`, `9/10 cancelled`, `9/12 cancelled`가 남고 **9/11 청구가 계속 사라진다**.

`sameDay`는 새 날짜의 이력만 찾으므로 이전 cancellation이 만든 다른 날짜의 버전을 찾지 못한다. 최소 보완은 서버 소유의 derived version 연결을 cancellation에 보관하여 확인일 수정 시 그 버전을 정정하는 것이다. 현재 범위에서 이를 처리하지 않으면 확인일 변경을 조건 이력 정정으로 명시적으로 유도/제한해야 한다. 메모만 수정할 때 새 조건을 만들지 않는 현재 동작은 적절하다.

### 4. [P2] draft 정정 연쇄가 원 confirmed를 남기고 이전 draft도 계속 대기시킨다

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts`의 `activeTerms`, `pendingTerms`; `/Users/bigmac_moon/dev/ai_score/site/app/api/billing-terms/route.ts:11`.

재현A: confirmed `10/1 50,000` → 날짜 미확인 correct draft → 그 draft를 `10/2 35,000`으로 correct. 모두200이지만 activeTerms에 **10/1 50,000과10/2 35,000 둘 다** 남는다. confirmed 손자 버전은 draft만 supersede하고 그 draft의 원 confirmed는 대체하지 않는다.

재현B: alreadyChanged=true인 draft(37,000)를 alreadyChanged=false인 다른 draft(39,000)로 정정. 모두200, pendingTerms에는 두 draft가 남는다. 이전 uncertainFrom 때문에 예측 미확인 상태도 남는다.

**Root가 이미 수정 중이라고 회신했다:** confirmed 정정은 supersedes 조상을 대체, draft→draft는 옛 draft를 대기 목록에서 제거, draft 철회는 원 confirmed 유지, confirmed 철회는 해당 confirmed 대체. 서버의 정정 가능 대상 집합과 UI 표시도 같은 해석을 써야 한다. 이 보고서는 그 수정 완료를 아직 확인한 결과가 아니다.

### 5. [P2] 번들의 마지막 구성원 삭제 후 같은 bundleId를 재사용할 수 없다

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/workspace-billing.ts:29`–32, `/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:9`.

재현: bundleId=`bundle-reuse` 구독 생성 → 마지막 구독 삭제(200) → 같은 bundleId 구독 생성. 결과409 `다른 창에서 기록이 변경되었습니다. 목록을 새로 불러온 뒤 다시 저장해주세요.`. DB에는 H만 남는다. GET은 그 H를 숨기므로 사용자는 필요한 historyId/revision을 다시 얻을 수 없다. 새로고침으로 해결되지 않는다. 독립 구독 삭제도 orphan H를 export에 남긴다.

최소 보완: 마지막 구성원 삭제 때 H를 어떻게 보존/정리/재연결할지 명확히 정해야 한다. 기존 감사 보존 정책 때문에 H를 남기면 명시적 재연결 흐름 또는 재사용 불가 이유가 필요하다. H를 지우는 정책이라면 일반 business delete 목록에 H를 먼저 넣으면 마지막 H UPDATE가0이 되어 부분 삭제 뒤409를 반환할 수 있으므로, 전용 원자적 종료 경로가 필요하다. historyId를 전체 CAS 조건에 넣어 새 H의 같은 revision이 낡은 요청과 일치하지 않게 해야 한다.

### 6. [P2, 정책 경계] 개인 환불 통화 변경으로 개인 원금 상한 검사를 건너뛴다

위치: `/Users/bigmac_moon/dev/ai_score/site/lib/workspace-billing.ts:67`, 92.

재현: 총 결제KRW30,000, 실제 내 부담KRW7,000. 총 환불KRW10,000을 입력하면서 개인 환불은 `EUR, 90,000,000,000 minor units`로 지정했다. 결과200. 환불 통화가 원 결제 개인 통화와 다르면 비교가 생략되고, 총 결제/정산 통화와도 다르면 그 한도 검사도 생략된다.

교차통화의 실제 개인 환불을 의도적으로 기록하는 모델이면 통화별로 별도 집계하고 환산/상한 검증 불가임을 설명해야 한다. 현재 단순 개인 원장 범위에서 원 결제 개인 부담이 알려진 경우에는 원 개인통화 일치 조건이 가장 작은 보완이다. 모르는 금액을0으로 바꾸거나 임의 환율을 적용하면 안 된다. 동일 개인통화의 합계 상한,0과null 보존, 원 결제 금액 축소 시 기존 환불 합계 검사는 현재 정상이다.

## 추가로 확인한 작은 보완점

- **잘못된 terms 입력이400 대신503**: `normalizeTerms`가 `subscriptionSchema.parse()`의 ZodError를 ApiError400으로 바꾸지 않는다. billing-terms API에 `amount:-1`을 보낸 실제 결과503/재시도 문구였다. `safeParse` 후 첫 검증 오류를400으로 반환하는 정도면 충분하다. 파손된 저장 이력을409로 처리하는 parseHistory와 구분한다.
- **legacy bundle seed 비교가 예약 요금 차이를 무시함**: `sameTerms`는 `priceChangesAt/renewalAmount`를 제외한다. H 없는 두 legacy bundle 행의 현재 조건이 같고 미래 요금만40,000/50,000으로 다르면 초기 결제 저장이200으로 통과하고 첫 행의40,000만 공동 이력에 채택한다. 인메모리 상충 fixture로 확인했다. 실제 배포 데이터에 이런 행이 있다는 뜻은 아니다. seed 전에만 legacy 예약 조건도 비교하거나 seedHistory 결과의 의미상 버전을 비교하면 된다. 정상적인 새 terms workflow의 전체 금융 키 비교와는 별개다.

## 정상으로 확인한 설계 및 검증 범위

- 모든 subscription/payment/cancellation 저장·삭제가 같은 billingIdentity H revision에 참여한다. full payload를 덮는 메타데이터 저장도 revision을 올린다. 이 구조는 번들 조건과 결제/환불 read-before-write 검사의 경쟁을 함께 직렬화한다.
- 각 business SQL에 공통 H guard를 붙인 뒤 마지막에 H revision을 올리는 순서는 D1의 순차 transactional batch 모델에 맞는다. 마지막 UPDATE만 검사하는 방식과 달리 stale revision은 business writes에도0이 된다. 단, 위 bootstrap 경계와 historyId incarnation guard는 보완 대상이다.
- Root가 이미 계획한 것처럼 `historyId`를 모든 guard 및 최종 UPDATE에 포함해야 한다. JS의 checkRevision에만 존재하는 검사는 SQL 사이의 삭제/재생성 경계를 보장하지 않는다.
- 테스트 어댑터는 `BEGIN` 후 `runSync()`를 연속 실행하고 COMMIT/ROLLBACK 한다. 이전의 await-per-statement 인터리빙 문제를 제거했다. mock batch는 실제 D1 네트워크/운영 환경을 직접 검증한 것은 아니다.
- bundleId를 이력 생성 후 일반 edit로 이동시키지 않는 제한은 두 authority 간 CAS가 없는 현재 범위에서 일관적이다. 오류 문구가 별도 계약 기록을 안내한다.
- 결제 예정 청구 연결은 서버가 history schedule에서 생성한다. 저장된 plannedKey/amount/currency/versionId/personalAmount는 같은 청구의 메모·실결제 수정 때 유지된다. 계약 통화/주기 변경 후 과거 청구 스냅샷이 유지되는 기존 테스트를 확인했다.
- 원 결제/환불/구독 조회는 모두 user_id와 kind를 포함한다. 클라이언트는 billing_terms kind를 직접 workspace POST할 수 없다. 다른 소유자 target/id를 통한 이력 수정 경로는 찾지 못했다.
- GET은 H를2000개 visible-record cap에서 제외하고 owner의 H를 따로 hydrate한다. export는 raw H와 legacySnapshot을 포함하며 no-store다. account DELETE는 모든 private_records를 owner별 삭제한다. 단, 위 legacy bootstrap 경쟁은 별도로 남는다.
- H seed와 member writes가 같은 batch에 있으며, SQL 오류가 나면 rollback 된다. validation 실패 전에 seed를 따로 쓰는 구조는 아니다.

## 실행한 검증

기존 `site/tests/api-harness.mjs`를 import하여 `DatabaseSync(':memory:')`에서 위 각 재현을 실행했다. 실제 DB·계정·외부 서비스는 건드리지 않았다.

`node --test site/tests/history-api.test.mjs site/tests/api.test.mjs` 실행 시점 결과는 **33개 중32개 통과/1개 실패**였다. 실패는 Root가 방금 추가하고 수정 중인 `correcting an unresolved correction replaces its original confirmed condition` 회귀 테스트였다(2 !== 1). 기존 history7개, 기존 API24개 및 새 rollback 테스트는 그 실행에서 통과했다. 동시 수정 중 결과이므로 이를 최종 빌드 상태나 수정 완료 판정으로 사용하면 안 된다.

다음 검증은 위 재현에 대응하는 좁은 회귀 사례면 충분하다: legacy seed 직전 삭제, 미래 예약 뒤 해지0, 같은 cancellation 확인일 정정, draft 정정 연쇄와 draft 철회, 마지막 bundle member 삭제 후 정책, 다른 personalCurrency 환불. root의 현재 구현을 수정하지 않았다.

## Root integration after reviewer final note

All reproduced items above were addressed before commit2c1ccc2f9134b225ef84693f58065afe2bb93742 and V8 publication. Final two boundaries have named tests in history-api: backdated cancellation rejects later already-effective decisions; filling a personal original amount rejects incompatible existing refund currencies. Current full run83/83 passed and type/build passed. Normalization errors now return400; legacy shared histories compare recorded future price pairs. This root integration note distinguishes changes made after the read-only review from the reviewer's original observations.
