# V15 알림 버전 구현 독립 코드 검토

2026-09-12, `/Users/bigmac_moon/dev/ai_score/site` 읽기 전용 검토. 실제 TypeScript/API 소스를 VM으로 로드하고 실제 migration을 적용한 메모리 SQLite, 고정 시각·JSON fixture·mock provider로 검증했다. Site/Git/Sites/브라우저/운영/배포 변경은 하지 않았다. 검토 중 root가 수정했으므로 아래에는 최초 RED와 마지막 GREEN을 분리한다.

**최종 결과: 독립 8사례 PASS, 관련 기존 회귀 48사례 PASS. 이 검토에서 실제 재현했던 5개 결함은 모두 수정 확인했다.** 실제 provider/scheduler 연결·실수신, 브라우저 및 전체 품질 게이트 완료를 뜻하지 않는다. sourceAuthority의 추가 취소 경합은 root가 별도 검토자에게 배정했으므로 그 독립 결과를 이 보고서의 수행 범위로 합치지 않는다.

## 발견 사항과 최종 수정 확인

### F1 — [P1, 수정 확인] A→B→A 중요 정정이 과거 A의 sent 키로 억제됨

- 최초 위치: `lib/notice-candidates.ts` candidate의 hash-only key 생성(최초 20,39행). 관련 저장은 `lib/notifications.ts`의 notifications/source_key 고유키와 outbox UNIQUE(notification_id).
- 재현: 같은 행사, 가격 USD0(v1) 수락 → USD5(v2) 수락 → USD0(v3), 같은 날 10/11/12시. 최초 실제 중요 버전 전달 2, 기대 3. 카드 source_revision=3인데 latest notification metadata는 revision=1인 행을 재사용했다.
- 최소 수정: 중요 내용이 바뀐 event revision을 hash와 함께 식별하고, 고객에게 중간 B가 반영되지 않아 현재 사실이 같은 경우의 중복 억제는 별도로 유지한다. checkedAt/내용 없는 review revision 증가를 새 소식으로 만들지 않는다.
- 최종 코드: `lib/notice-sources.ts:3–6` event_revision, `lib/notice-candidates.ts:25–30` 고객 현재 키/새 event key/정정 기준 이력 선택. 독립 재실행 **3회 전달**, GREEN. 기존 revision-only/read-state 회귀도 PASS.

### F2 — [P2, 수정 확인] 고객에게 무관한 기능 변경을 일반 혜택으로 다시 보냄

- 최초 위치: `lib/notice-candidates.ts:30–37`. relevant=false로 정정만 끄고 `holds.length===0` 일반 권유 분기로 돌아갔다.
- 재현: neededFeatures=['document-analysis']로 v1 수락 후, 문서 분석은 그대로 두고 live-conversation 지원만 추가·revision 증가. 최초 이메일 1→2, 기대 1 유지. 두 번째 메일은 정정 제목도 없는 일반 혜택이었다.
- 최소 수정: 과거 안내와 비교한 무관 변경을 이메일 보류 사유로 보존하여 일반 권유 분기까지 차단한다. 단순 직전 카드만 비교해서 정정 기준을 잃지 않도록 과거 attempted material 또는 저장된 correctionBaseline을 사용한다.
- 최종 코드: `lib/notice-candidates.ts:29–43` 기준 material 보존, unrelatedChange/hold/emailAllowed. 독립 실제 이메일 **1회 유지**, GREEN.

### F3 — [P2, 수정 확인] 관심 해제 후 보유한 철회 정정 카드가 앱에서 사라짐

- 최초 위치: `lib/notice-candidates.ts`의 direct/alternative 후보 제외, `app/api/notifications/route.ts:10–12` current.has 필터.
- 재현: 행사 안내 수락 → withdrawn v2 저장/노출 → Gemini 관심 해제 및 email=false. DB withdrawn 카드는 1개인데 GET 1→0. 원문 96행의 발송 불허 시 앱에서 수정 확인 경로가 없었다.
- 최소 수정: 기존 카드/버전 보유 행사는 현재 관심이 없어도 정정 사실을 읽는 후보로 유지하되 이메일/new-card 생성은 막고 hideTopic은 유지한다.
- 최종 코드: `lib/notice-candidates.ts:54–61` 기존 행사 유지, interested=false 및 retainedOnly 분리; 40,43행 이메일 차단. 독립 GET **1→1**, GREEN. 기존 inApp=false 정정 보존 회귀도 PASS.

### F4 — [P1, 수정 확인] 마감 전 작성한 정정 이메일을 마감 뒤 그대로 재시도함

- 최초 위치: `lib/notice-candidates.ts` correction의 전체 holds 우회, `lib/email-delivery.ts` key 중심 matches/currentItemsGuard.
- 재현: 정확한 마감 2026-09-12T10:02:00Z. v1 수락 → 10:00:30 가격 정정 v2 첫 요청 mock503 → 10:02:00 재시도. 최초 기존 정정 provider 호출 1→2, 같은 immutable key/body로 수락되었으며 본문은 마감 전 ‘입력한 조건과 일치’였다. 기대는 해당 기존 요청의 추가 호출 0.
- 최소 수정: 불변 안내 작성 당시의 emailNotAfter를 저장하고 후보/발송 SQL에서 확인한다. 만료/철회 사실 자체를 처음 정정하는 새 버전과 마감 전 기존 요청 재시도를 구분한다. 기존 payload를 고쳐 보내지 않는다.
- 최종 코드: `lib/notice-candidates.ts:41–44`, `lib/notifications.ts:15` metadata.emailNotAfter, `lib/notice-sources.ts:10–12` 모든 item의 deadline guard. 독립 최종 호출 **1회 유지**, 해당 기존 delivery **needs_review/attempts1**, GREEN. 기존 accepted v1과 두 immutable 요청 본문은 보존됐다.

### F5 — [P2, 수정 확인] 내 기록 삭제 후 개인 결제 UUID·날짜가 공유 source registry에 남음

- 최초 위치: 모든 candidate에서 `registerSource` 호출, `lib/notice-sources.ts:3–4` 무조건 공유 등록; 사용자 DELETE는 notification_cards는 삭제하지만 notice_source_heads는 공식 공유 자료로 취급했다.
- 재현: 다음 결제일 2026-09-15인 개인 구독 생성 → 알림 생성 → ‘내 기록 삭제’. `billing:<개인 subscription UUID>:2026-09-15` source head 실제 1개 잔존, 기대 0.
- 삭제 SQL만 추가하면 오래 읽은 개인 계약의 registerSource가 삭제 뒤 재생성할 수 있다. 최소 수정은 앱 전용 billing을 공유 source registry에서 완전히 분리하는 방식이다.
- 최종 코드: `lib/notice-candidates.ts:21` billing 등록 제외, `lib/notice-sources.ts:8` billing source guard 분리. 개인 카드 생성에는 기존 settings/owner guard가 남고, billing 이메일은 계속 불가다.
- 최종 독립 사례는 **생성 전후 공유 billing head 0, 내 기록 삭제 후 0**을 확인했다. 최종 0004 migration 이전에 배포된 V15가 없다는 root 작업 맥락이며, 가상의 이미 배포된 잘못된 V15 데이터 이관까지 검증했다고 주장하지 않는다.

## 별도로 통과한 핵심 보호

- **구 source GET:** 최신 v2 USD5 카드/헤드 저장 후 fixture를 구 v1 USD0으로 되돌려 GET. 최신 저장 USD5를 유지하며 구 문구로 덮어보이지 않았다. `app/api/notifications/route.ts:12`의 headValid 및 source_version 일치 조건을 실제 검증했다. 최초 정적 읽기에는 해당 guard가 없었으나 실행 시 root 수정이 반영돼 이 사례는 RED로 보고하지 않았다.
- **한 item의 카드 부재:** 실제 SQLite trigger로 첫 sending CAS를 0행 처리해 미시도 immutable batch를 만든 뒤, 포함된 promotion 카드 하나만 제거하고 재시도. 전체 provider 요청 0, parent/child attempts 모두 0. `currentItemsGuard`는 누락된 항목도 실패로 처리했다.
- **기본 소유권·삭제:** alpha 자료를 생성 후 beta GET에는 0개; alpha 전체 삭제 후 카드 0개. 새 카드 export/delete 관련 기존 통합 회귀도 PASS.
- **기존 보존:** 실제 과거 이메일 migration의 sent/uncertain 보존, legacy date-key baseline 보류/다음 정정, immutable payload/receipt, 기존 late receipt와 known-receipt 보존, CAS/lease/동의 관련 기존 이메일 회귀를 함께 실행했다. 각 결과는 아래 원시 출력에 남긴다.
- **읽음 CAS:** `app/api/notifications/route.ts:15,21–24`는 expectedSourceKey 및 최신 notification id/source version을 확인한다. 기존 old-read/new-material 회귀 PASS. 브라우저의 실제 포커스/읽음 UI 동작 검증은 수행하지 않았다.

## 재현 아티팩트와 실행 결과

독립 스크립트: `/private/tmp/ais-v15-independent-cases.mjs`.

- 최초 5사례: `/private/tmp/ais-v15-independent-cases.out` — ABA/무관 기능/관심 해제 RED, stale GET/기본 삭제 PASS.
- 별도 만료 RED: `/private/tmp/ais-v15-correction-expiry.out`.
- missing-card PASS + billing 잔존 RED: `/private/tmp/ais-v15-guards-delete.out`.
- 중간 8사례: `/private/tmp/ais-v15-independent-latest.out` — 7 PASS, billing 잔존 1 RED.
- 최종 8사례: `/private/tmp/ais-v15-independent-final.out` — **8 PASS, 0 FAIL**, 실제 Node 종료 코드 0. billing 재현의 최종 전제는 ‘등록 자체 0’으로 강화했고 ‘삭제 후 0’ 기대값은 유지했다.
- 관련 기존 최종 회귀: `/private/tmp/ais-v15-existing-regressions-final.out` — **48 PASS, 0 FAIL**, 실제 Node 종료 코드 0.

```sh
node --test /private/tmp/ais-v15-independent-cases.mjs
# cwd: /Users/bigmac_moon/dev/ai_score/site
node --test --test-reporter=spec tests/notice-versions.test.mjs tests/email-delivery.test.mjs tests/email-migration.test.mjs
```

테스트는 실제 소스와 실제 SQL migration을 메모리에 적용하며 실제 provider 호출은 하지 않는다. 실행 시간은 테스트 의존성 검증 시간일 뿐 제품 성능/사용자 체감 수치가 아니다. 고정 점수/게이트를 변경하지 않았다. retained 전체 명세의 제품 완성이나 배포 성공은 이 보고서에서 판정하지 않는다.

## 최종 검토 소스 SHA-256

- `lib/notice-candidates.ts`: `33ef6f44b1d8bd03090649782de40237320299a7186cb758302d2fd63816e0d6`
- `lib/notice-sources.ts`: `6b39a91474d28268b0872ecdd93c0994251906e38aedc7e81e0dad03d5128b55`
- `lib/notifications.ts`: `ef97f7ff17b0bf907d66d8ce718c0c6be4e269144c793020b627bd51609a2ba7`
- `lib/email-delivery.ts`: `eb4010f2d3f7f3f5fabcbecf80ee24efd3ab7e4b17005830209bca2eacde0abd`
- `app/api/notifications/route.ts`: `a1c4a4492e1226fd941aeeeb5cec497d821cada06caac85b8927703ea47b5079`
- `app/api/export/route.ts`: `f8bf050b2b88b56359a60b57371161bd46e61366925cd5932c7458e51584195f`
- `app/api/workspace/route.ts`: `76aaa99b7f5b299f0ff51a93c4083b4b790ccc58cb4a0cacae0793b35cbccb14`
- `db/schema.ts`: `3eca62baa5b69085e82723220ed6e576bc9b7214795ab3fb14ff763e0d41b9fe`
- `lib/promotion-facts.ts`: `88b0a2d256db45de20137a031246eac138b4ff0712d4b6edf21bd55626d7b757`
- `drizzle/0004_panoramic_queen_noir.sql`: `ead5b731da7ffc32a4b9affbb8f83098a33886bc83d4c4fc262ef109b1975fa0`
