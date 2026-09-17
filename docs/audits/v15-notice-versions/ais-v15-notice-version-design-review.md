# V15 알림 중요 버전·원 카드·정정 설계 독립 검토

검토일 2026-09-12. `/Users/bigmac_moon/dev/ai_score`의 현재 V14 소스를 읽은 **사전 설계 검토**다. 아래 기대값은 구현 테스트 결과가 아니다. Site·Git·Sites·브라우저·운영 데이터는 변경하지 않았다. 실제 이메일 provider와 runtime scheduler 미연결, 실수신 미검증은 그대로 남는다. V15 구현이나 점수 PASS를 판정하지 않는다.

## 결론과 가장 작은 일관된 안

Root가 제안한 **기존 notifications를 불변 버전 행으로 보존하고 notification_cards만 추가하는 안에 동의**한다. `email_outbox UNIQUE(notification_id)`와 기존 delivery.items/payload를 유지할 수 있으므로, 기존 테이블을 안정 카드로 바꾸고 outbox 고유키를 재작성하는 안보다 이관 위험이 작다. 단, 새 카드만 추가해서는 충분하지 않다. 버전 출처와 고객 영향 판정, 과거 자격 확인의 버전 연결, 기존 이력의 보수적 기준 버전 등록, 발송 직전 현재 버전 guard, 앱에서 종료·정정 기록을 읽는 경로까지 연결해야 한다.

가장 중요한 위험은 다음 네 가지다.

1. 현재 `promotionEligibility[id]='eligible'`에는 확인한 자격 버전이 없다. 변경된 자격에도 이를 재사용하면 고객이 확인하지 않은 조건을 확인했다고 처리한다.
2. 현재 후보에서 사라진 항목을 GET에서도 제거하므로, 철회·만료된 잘못된 안내를 원 카드에서 정정할 수 없다.
3. 카드 CAS만으로는 구 배포 프로세스가 아직 새 소스로 갱신되지 않은 고객에게 오래된 조건을 발송하는 것을 막지 못한다. 발송 DB guard가 현재 게시된 소스 버전도 확인해야 한다.
4. source key를 재작성하거나 과거 `sent/needs_review`를 새 hash로 재큐잉하면 중복 및 증거 손실이 생긴다. 원 행과 immutable 요청은 그대로 둔다.

## 원문 요건과 현재 연결점

원문: `docs/superpowers/specs/2026-09-11-cancellation-promotion-alerts-design.md`.

| 원문 | 실제 유지해야 하는 범위 | 현재 소스의 연결점/공백 |
|---|---|---|
| 86, 104 | 공식 검수·대상·기간·자격·가격·마감 시간대·종료/수정 | `data/promotions.json:7–33`은 status와 날짜/시간대/문자열 조건은 있지만 가격·검수 버전·기능의 비교 가능한 구조는 없음 |
| 90, 92, 106 | 같은 행사·고객·중요 버전 1회; 모드·대체 관계 중복 없음 | `notice-candidates.ts:13,19`는 update 날짜 / promotion checkedAt을 key로 사용; `notifications.ts:11–17`는 key별 행과 outbox 하나 |
| 92, 96 | 원 카드 갱신; 고객에 영향 있는 수정만 정정 후보 | `notifications.ts:11`은 INSERT OR IGNORE만; `api/notifications/route.ts:11–13`은 현재 후보 key만 노출 |
| 94, 105 | 발송 직전 자격·필수 기능·관심·가격/기간 조건·동의 재확인 | `notice-candidates.ts:16–19`는 자격 boolean/관심/날짜만 사용. `validation.ts:14`의 maxPrice/currency는 후보 판정에 연결되지 않았으며 기능·기간 규칙도 없음 |
| 94, 106 | 재시도 같은 전달 건, 만료/해제 이후 재시도 금지, 불확실 이력 확인 | `email-delivery.ts:43–46,104–148`의 current key 재검사와 불변 요청·receipt 보존을 유지 |

선택 행사 마감 재알림은 92행에서 명시한 후속 기능이다. V15가 자연 만료마다 이메일을 만들 필요는 없다. 전 시장 수집·실시간 탐지·추가 채널·제휴 우선순위 최적화도 이 작업의 새 요구로 만들지 않는다. 반대로 필수 기능과 가격/기간 연결을 단순 해시 도입으로 대체하면 원문 미완료가 남는다.

## 1. 세 식별자를 구분한다

- `hideTopic`: 기존 `promotion:<id>`, `update:<toolId>`, `billing:<contractId>`와 호환하는 숨김 범위. 재동의/복원 전 새 중요 버전도 숨김을 지킨다.
- `eventKey/cardKey`: 같은 실제 행사를 가리키는 안정 키. promotion은 행사 id. update는 검수한 공식 릴리스 항목 id를 포함한다. **서비스 숨김 topic과 행사 identity는 같지 않을 수 있다.** 같은 도구의 별개 공식 업데이트 둘을 하나의 정정 카드로 접으면 안 된다. billing은 계약+청구일의 기존 의미를 유지한다.
- `versionKey`: 실제 행사의 검수된 중요 버전. 날짜·checkedAt·발송 모드·수신 주소·관심 매칭 경로는 버전 식별자에 넣지 않는다.

권장 키 예: `promotion:<eventId>:v<materialRevision>:<semanticHash>`; prefix의 기존 hideTopic 호환을 유지하거나 취소 SQL이 명시적인 hideTopic을 읽도록 이관한다. 새 버전은 새로운 notifications 행, 같은 버전 반복은 같은 행이다.

중요 버전의 순서와 내용 hash는 별개다. 가격 A→B→A는 고객에게 두 번 바뀐 사실이므로 v1→v2→v3이며, 마지막 A를 첫 A hash로만 식별해서 억제하면 안 된다. 반대로 checkedAt만 바뀐 같은 사실은 중요 버전 증가/새 outbox 0이다. 검수 시 materialRevision과 변경 이유/분야를 명시하고 canonical facts hash로 오류를 검증하는 방식이 작고 감사 가능하다. 문구의 의미를 해시가 자동으로 판단한다고 주장하지 않는다.

검수된 material facts에는 가격의 통화·단위·적용 기간/갱신, 자격·지역·계정 조건, 해당 플랜의 필요한 기능/제약, 시작/종료 조건·시간대·철회/정정 상태를 포함한다. 의미 없는 배열 순서, checkedAt, 수집 실행 시각, 추적 query 등은 정규화하거나 제외한다. 중요 사실을 바꾸고 버전을 그대로 둔 입력은 검증에서 거절/보류해야 한다.

## 2. 최소 데이터 확장

```ts
// JSON 검수 데이터의 개념 형태. 실제 확인되지 않은 값은 null/unknown.
noticeMeta: {
  eventId: string,
  materialRevision: number,
  semanticHash: string,
  changeKind: 'new' | 'material' | 'correction' | 'retracted',
  changedFields: string[],
  correctionReason?: string,
  reviewedAt: string,
  reviewStatus: 'verified' | 'checking',
  eligibilityFingerprint: string
}

// 새 사용자 원 카드. notification row / outbox / delivery는 기존 그대로.
notification_cards: {
  id, user_id, event_key, hide_topic,                  // UNIQUE(user_id,event_key)
  latest_notification_id, material_revision, material_snapshot,
  source_generation, row_revision,
  status, changed_at, read,                          // 또는 seen_version_key
  legacy_baseline_version, legacy_baseline_reason
}
```

`id=해당 행사의 최초 notification id`는 가능하다. 최초 기준은 `(created_at,id)`로 결정적으로 선택하고, 같은 도구의 **서로 다른 행사**를 합치지 않는다. 기존 read/hide 링크가 오래된 버전 id를 보낼 수 있으므로 그 id→해당 소유자의 카드 연결을 처리하거나 명시적 호환 오류를 준다. 다른 고객 버전을 latest_notification_id로 참조할 수 없도록 모든 조인/쓰기에서 user_id도 확인한다.

notifications는 불변 version text/snapshot을 보유한다. 카드의 현재 status/correctionReason/changedAt를 함께 렌더링하면, 기존 sent 행을 덮어쓰지 않고 원 카드에 ‘정정/종료’를 표시할 수 있다. 중요한 고객 영향 변경에만 unread를 되돌리고, 단순 확인일 갱신은 read·changedAt을 새 소식처럼 바꾸지 않는다. 과거 버전 내용도 내보내기/이력의 근거로 남는다.

가격 조건은 `maxPrice` 숫자 하나로 비교하지 않는다. 최소 사용자 규칙과 공식 사실 모두 통화, 금액 단위(총액/좌석), 기간/반복 주기, 프로모션 기간 또는 갱신 중 어느 구간인지가 필요하다. 비교할 수 없는 기간·통화·세금/사용량 불확실성은 일치가 아니라 unknown이다. 환율/연간÷12 계산으로 서로 다른 계약을 임의로 동등하게 만들 필요는 없다.

필수 기능은 실제 해당 행사 플랜의 기능 id와 supported/conditional/unknown, 충족 조건을 연결한다. 현재 `catalog.features`의 전 서비스 수준 conditional 설명만으로 유료 플랜 지원을 확정하지 않는다. 사용자 선택 규칙을 설정 UI/API에 저장하고 currentNotices와 발송 검사에서 사용해야 한다. subscription의 자유 입력 `requiredFeatures`를 조용히 추출하거나 사용자 개인 구독 전체를 메일에 넣지 않는다.

## 3. 자격·기능·가격 재검증과 정정 후보를 분리한다

자격 확인은 최소 `{status, eligibilityFingerprint, confirmedAt}`로 저장한다. 설정 폼이 보여 준 조건 fingerprint를 요청에 포함하고 서버의 현재 조건과 다르면 새 확인을 요구한다. 서버가 오래 열린 폼의 eligible에 새 fingerprint를 자동 부착하면 허위 확인이 된다. 기존 eligible 문자열은 현재 조건 확인으로 자동 승격하지 않으며 보수적으로 unknown/재확인 필요로 취급한다. 가격만 바뀌고 자격 조건이 같으면 같은 eligibilityFingerprint를 유지할 수 있다. 여권·학교 증빙·결제 정보 등 민감한 원본 수집은 이 기능에 필요 없다.

후보는 적어도 다음 두 목적을 구분해야 한다.

| 목적 | 대상과 허용 조건 |
|---|---|
| 새 혜택/중요 변경 권유 | 검수된 현재 유효 행사 + 현재 관심/대안 관계 + 숨김 아님 + 최신 자격 확인 + 필수 기능·가격/기간 충족 + 현재 채널 동의. unknown은 앱 조건부 정보로 유지하고 맞춤 이메일 권유는 보류 |
| 과거 안내의 정정 | 이전 안내 기록과 고객 판단에 영향을 주는 정정이 있음 + 현재 채널 동의/숨김 및 관심 정책 재확인. 현재 자격이 ineligible이거나 행사가 철회됐다는 사실 자체가 정정 이유일 수 있으므로 새 권유의 eligible/active 조건을 그대로 요구하지 않음 |

정정 수신 대상을 신규 수신자 전체로 늘리지 않는다. 최소 과거 안내가 존재하는 고객에게만 적용하고, accepted 이력이면 ‘이전 이메일 안내’, needs_review이면 ‘이전 안내 내용’처럼 전달 확실성을 구별한다. 앱 카드 존재를 실제 열람으로 주장하지 않는다. 현재 이메일 수신 해제/주제 숨김/관심 해제 시 새 이메일 정정은 0이고 원 카드의 정정 사실은 보존한다. 관심 해제 후에도 정정 이메일을 별도 허용하는 정책은 사용자 설정에 없는 이상 새로 추정하지 않는다.

`inApp=false`는 새 앱 알림/배지 억제와 이미 보유한 안내의 정정 기록 열람을 구분해야 한다. 원문 96행은 발송 불허 시 앱에서 수정 내용을 확인할 수 있게 요구한다. 현행 GET의 `disabled:true,notifications:[]`만으로는 둘 다 꺼 둔 고객의 기존 정정 확인 경로가 없다. 이미 보유한 카드의 읽기 전용 ‘이전 안내/정정 내역’ 경로를 제공하는 것이 최소다. 숨긴 주제는 기본 목록에서 계속 숨기되 복원/이력 경로를 유지한다.

자연 만료는 카드 ended 상태, 신규 권유/재시도 0이다. 이미 잘못 보낸 종료일을 앞당기는 정정은 별도 correction 후보다. 자연 만료를 ‘새 중요 버전’으로 매일 생성하거나 종료 카드를 새 고객 모두에게 알리지 않는다. source 항목 삭제만으로 ‘공식 철회’라고 추정하지 말고 확인 중으로 보류하거나 검수된 retraction tombstone을 남긴다.

현재 유일한 학생 행사에는 마감 날짜는 있지만 시간대가 null이고 갱신가는 없다(`promotions.json:12–26`). 값을 발명하지 않는다. 명백히 유효한 먼 시점까지 무조건 차단할 필요는 없지만, 마감이 지났을 수 있는 불확실 구간에서는 권유/재시도를 보류하는 보수적 safeUntil 정책을 사전에 명시해야 한다. 날짜만으로 임의 시간대·정확한 카운트다운을 만들지 않는다. 확인되지 않은 갱신 가격을 0으로 비교하지 않는다.

## 4. 기존 행을 보존하는 이관 순서

1. notifications, outbox, deliveries의 id/status/attempts/provider_id/sent_at/first_attempt_at와 delivery.items/payload를 그대로 둔다. 과거 key와 본문을 현재 hash로 다시 쓰지 않는다.
2. 기존 행을 **증명 가능한 행사 단위**로 접어 원 카드 하나를 만든다. 날짜 key만으로 동일 행사인지 불분명한 과거 업데이트는 억지로 합치지 않는다. 숨김은 기존 topic 범위를 승계한다.
3. 첫 현재 hash를 카드 기준 버전으로 등록할 때 과거 sent 또는 attempted/needs_review가 그 행사에 있으면 `legacy_baseline_version=currentVersion`, reason=`prior version unverifiable`로 이번 기준 버전 이메일을 보류한다. **새 sent/receipt 행을 만들지 않는다.** 다음 실제 중요 버전까지 영구적으로 막는 topic 차단으로 확대하지 않는다.
4. 과거 본문/조건과 현재가 같다는 것은 hash 근거가 없으면 주장하지 않는다. 기준 버전 등록의 보수적 보류는 중복 방지 선택이며, 실제 중요 변경을 한번 놓칠 수 있다는 한계를 이관 문서에 남긴다. 원 카드에는 현재 사실을 보여 준다.
5. queued/attempts=0/delivery=NULL은 현재 조건으로 취소 후 재계획할 수 있다. prepared/attempts=0의 immutable payload는 편집하지 말고 기존 배치를 취소하고 유효 survivor를 원자적으로 detach→queued 처리한다. 새 버전은 새 notification/outbox로 만든다.
6. attempted 배치에 구 버전이 있으면 기존 규칙대로 needs_review로 보류한다. 같은 불확실 원 이메일을 새 key로 재시도하지 않는다. 독립적인 고객 영향 정정이 발생한 경우에만 별도 정정 버전으로 구분한다.
7. 단순 모드/시간대/주소/관심 경로 변경과 hide→restore는 같은 버전의 sent/needs_review를 리셋하지 않는다. 미시도 cancelled의 복구도 현재 버전·조건·legacy 보류를 모두 통과해야 한다.
8. 이관은 재실행 가능해야 한다. 최초 notification id/카드/read 상태와 baseline 보류가 두 번째 실행에서 달라지면 안 된다. 동일 생성 경쟁은 unique + CAS로 카드 하나와 버전 outbox 하나로 수렴시킨다.

## 5. Race·rollback·현재성 경계

- **카드 경쟁:** v2 읽기 후 v3가 먼저 저장된 경우 v2는 카드/새 outbox/unread를 되돌리지 못해야 한다. 카드의 source materialRevision 단조 조건 + expected row_revision을 사용한다. read 액션도 사용자가 읽은 version을 전달해야 v2를 보는 중 도착한 v3를 읽음으로 처리하지 않는다.
- **CAS 0:** D1 batch에서 앞 UPDATE가 0행이어도 뒤 SQL은 실행될 수 있다는 기존 `email-delivery.ts:16` 원칙을 유지한다. 버전 행 INSERT, 카드 head 변경, outbox 생성, 구 queued 취소 모두 승리한 카드/소스/설정 revision을 각각 guard한다. 실제 SQL 오류에서는 모든 관련 변경이 rollback되어야 한다.
- **구 소스 프로세스:** 사용자 카드 단조 revision만으로 충분하지 않다. 새 검수 소스가 게시됐으나 그 사용자 카드가 아직 v1인 순간, 구 worker가 v1을 발송할 수 있다. 가장 작은 강한 fence는 게시된 source generation 단일 DB 행과 컴파일된 manifest generation 비교이며, 계획/첫 시도/재시도 SQL도 이를 확인한다. publication generation은 checkedAt 갱신 때 바뀔 수 있으나 이메일 중요 version과는 별개다. 또는 배포 시 발송 중지·기존 실행 drain을 운영 제약으로 명시해야 하며, 확인 없이 동등한 보장이라고 주장하지 않는다.
- **source/설정 TOCTOU:** currentNotices를 읽은 뒤 철회/자격/기능/가격/optout가 바뀌면 첫 sending CAS와 모든 자식 쓰기는 현재 source head + settings revision을 확인해야 한다. 순수 함수 결과만 다시 비교하면 DB 읽기 뒤 발생한 변경을 막지 못한다. 네트워크 요청이 이미 시작된 뒤에는 회수 보장을 만들지 않는다.
- **구 요청의 늦은 성공:** 카드가 v2로 바뀌어도 v1의 동일 immutable 요청 성공은 v1 delivery/outbox에만 accepted로 단조 기록한다. v2를 sent로 만들거나 v1을 재생성하지 않는다. late failure token guard, receipt 기록 실패 시 retainKnownReceipt는 유지한다.
- **불확실 배치:** 여러 행사 중 한 항목 철회 시 미시도 survivor 보존/replan, 시도한 배치의 immutable 보류를 유지한다. 정정 기능을 이유로 일부 payload만 고쳐 같은 idempotency key로 보내면 안 된다.
- **삭제:** `api/workspace/route.ts:41–51`의 사용자 전체 삭제 트랜잭션에 새 카드/추가 버전 메타데이터를 포함한다. 계정 삭제와 경쟁한 생성/이관이 오래 읽은 사용자 설정으로 카드를 부활시키지 못하도록 현재 소유 설정 또는 데이터 세대 guard가 필요하다. 기존 late receipt 함수는 INSERT하지 않는 성질을 유지한다.
- **내보내기/격리:** `api/export/route.ts:7–16`에 카드 id/event/version/status/change reason/baseline 보류 및 과거 notification id/source key 연결을 포함한다. 현재 export는 notification id를 제외하므로 outbox 참조를 따라가기 어렵다. 모든 JOIN은 n.user_id=c.user_id까지 확인한다. beta가 alpha의 카드/과거 버전을 read/hide/export/latest 참조로 접근하는 경우 404/빈 결과다. 공개 API로 개인 자격·필수 기능·가격 규칙을 내보내지 않는다.
- **숨김 취소:** `email-cancellation.ts:5–9`는 문자열 prefix를 사용한다. 새 키 형식이 prefix를 깨면 숨김이 배치를 못 취소한다. 기존 prefix 유지 또는 명시 hideTopic 기반으로 바꾸고 과거 delivery.items도 호환해야 한다.

## 6. 구현 전 고정할 최소 회귀 기대값

아래의 ‘이메일 1’은 실제 도착 보장이 아니라 **새 eligible version outbox 1 / mock provider 수락 최대 1**이라는 별도 측정이다. 같은 배치에 둘 이상 묶이면 버전 수와 요청 수를 구별한다.

| ID | 입력/순서 | 고정 기대값 |
|---|---|---|
| N01 | v1 수락 뒤 checkedAt만 다음 날 변경·반복 refresh | 새 버전 0, 새 outbox 0, 카드 id/read 불변, receipt 불변 |
| N02 | 같은 날짜 v1 가격 10→v2 가격 15, 실제 고객 가격 판단 영향 | 같은 카드 1, 새 중요 버전/outbox 1; 재실행 추가 0 |
| N03 | v1 가격10→v2가격15→v3가격10 | 3개 서로 다른 중요 버전; v3를 v1 hash와 같다고 억제하지 않음 |
| N04 | 직접 관심과 2개 대안 관계로 같은 행사 매칭 | 카드 1, 해당 버전 outbox 1 |
| N05 | matched에서 v1 수락 후 digest→matched·주소/시간 변경 | v1 새 전달 0; 기존 receipt/attempts 불변 |
| N06 | 여러 공식 업데이트가 같은 도구/같은 날 발표 | 실제 행사 둘의 카드/버전을 혼동하지 않음; 서비스 hide는 둘 모두 적용 |
| N07 | 지역 조건만 타 지역 고객에게 영향 없이 변경 | 원문/현재 카드 사실은 갱신, 영향 없는 고객 새 정정 이메일 0; 해당 고객만 후보 |
| N08 | eligible@자격A 저장 후 자격B 추가; 오래 열린 폼이 A를 제출 | B의 eligible 자동 승계 0, stale 확인 저장 거절/재확인; 권유 이메일 0 |
| N09 | 가격만 변경, 자격A 유지 | 자격 확인을 불필요하게 B로 바꾸지 않음; 가격 조건은 새로 평가 |
| N10 | 필수 기능 지원→unknown 또는 조건 불충족, planned 배치 있음 | 앱 이유 보존, 신규 권유/첫 시도/재시도 0; 기존 안내에 영향 있으면 별도 정정 판정 |
| N11 | 최대 USD20/month vs USD21/month, USD20/year, EUR20/month, 갱신가unknown | 동일 기준 초과는 불일치, 다른 기간/통화·unknown은 일치로 승격하지 않음; 조건부 앱 정보 |
| N12 | 이미 보낸 행사 철회 또는 잘못된 종료일 정정, 현재 이메일 동의 유지 | 원 카드 corrected/retracted 보존; 과거 수신자에게 정정 버전 최대1, 신규 혜택 권유0 |
| N13 | N12에서 email off/주제 hide/관심 해제 | 정정 이메일0, 원 카드 정정 기록 보존; 기존 기록 확인/복원 경로 존재 |
| N14 | 자연 만료 시각 경과; repeated refresh; 마감 시간대 불확실 경계 | ended 카드 보존, 새 권유/구 재시도0, 자동 마감 재알림0; 미확인 경계 보류 이유 |
| N15 | legacy sent/needs_review/attempted에 과거 hash 없음; 기준 버전 등록 두 번 | 기존 행/상태/payload 그대로, 새 기준 버전 이메일0, baseline 보류를 sent로 표시하지 않음 |
| N16 | legacy queued0 단독 및 mixed prepared0 | 현재 조건으로 재계획; 불변 구 배치 payload 유지, 유효 survivor 누락0; 수락 중복0 |
| N17 | v2 생성 두 요청 경쟁; 첫 카드 CAS를 강제로0 처리 | 카드1·버전outbox1; 패배 요청 후속 생성/취소/unread 오염0 |
| N18 | 카드/새 outbox/구 queue 취소 중간 SQL에 ABORT 주입 | 전부 rollback, 카드만 v2거나 새 outbox만 남는 부분 반영0 |
| N19 | v1 current 읽기 pause→v2 철회 게시/설정 optout→sending 재개 | provider 호출0, child attempts/slot도 잘못 소비하지 않음 |
| N20 | 구 source worker가 아직 갱신 안 된 고객 v1 카드에서 계획 | 게시 generation fence 불일치로 provider 호출0; source 오래됨 진단 가능 |
| N21 | v1 전송 시작→v2 정정→v1 늦은 수락/늦은 실패/수락 DB 오류 | v1 receipt만 단조 보존, v2 sent 오염0, late failure가 accepted 하향0, needs_review known ID 보존 |
| N22 | v2 화면 열기→v3 도착→v2 read 요청 | v3의 unread 유지; checkedAt만 갱신된 경우 unread 재생성0 |
| N23 | alpha 카드 id/옛 version id를 beta가 read/hide/latest 참조 | 모두 소유권 거절; beta의 카드/이력에 alpha 본문 노출0 |
| N24 | 계정 데이터 삭제와 카드 생성/기준 버전 등록/늦은 receipt 경쟁 | 새 카드 포함 사용자 기록0, 삭제 후 재생성0; export도 비어 있음 |
| N25 | 같은 버전 cancelled0→restore와 sent/needs_review→restore 비교 | 전자는 현재 조건·기준 보류 통과 시에만 복구, 후자는 새 전달0 |
| N26 | 검수 JSON에서 행사 사라짐 vs 명시 retracted | 단순 누락을 공식 철회로 단정0; 명시 철회는 정정 정책; 앱 원 카드 손실0 |

## 관찰 스냅샷

SHA-256 (소스가 이후 바뀌면 이 보고서는 위 설계 기준과 해당 스냅샷 관찰로 읽는다):

- `site/lib/notice-candidates.ts`: `97f4b46a8485df0dcd48f692fc65158ea7646f35e2eb179bfd601276c93b6152`
- `site/lib/notifications.ts`: `6a51d9d45397d9a890025550f025db24a5e047e6c78e12329520dc3f8b654017`
- `site/lib/email-delivery.ts`: `2c5f3fd5e50c7a2c1f0bc468f4272cf9aeb77aad4f7245d3c3077270cb639bb6`
- `site/app/api/notifications/route.ts`: `afde836fdea235f63dd27ecad12968b07f475792914ff931a06fe783eaaa2780`
- `site/db/schema.ts`: `274b1000039303ae56c72eb25caa04559012e48659bce16f46c1f4f25cd6677f`
- `site/data/promotions.json`: `17fbad5f7d4490ab360d50e1251f7d177d46c78b739c3c82ceac054d889cc27c`
- `site/lib/validation.ts`: `09e0dad647fb99462382139a1007f60d9fc4b15265c13a3b92a887b0cf43670c`
