# V14 이메일 처리 독립 RED 재현

실행: 2026-09-12T13:31:58.298Z. 현재 Site의 API harness·실제 TypeScript 모듈·실제 migration을 사용했다. Site/환경/운영을 변경하지 않았고 네트워크·브라우저·실이메일·배포를 사용하지 않았다. 작성물은 `/private/tmp/ais-v14-email-red.*`뿐이다.

**결과: 필요한 동작을 assertion으로 둔 6개 테스트가 RED, 기존 전송 직전 동의 확인 대조군 1개가 PASS다.** 이 결과는 로컬 동작·DB 상태 결함을 입증하며 실제 제공자의 중복 메일 수신이나 운영 장애 발생 횟수를 입증하지 않는다.

- 실행 코드: [ais-v14-email-red.test.mjs](/private/tmp/ais-v14-email-red.test.mjs)
- 관측값·실행 소스 SHA-256: [ais-v14-email-red.json](/private/tmp/ais-v14-email-red.json)
- Node test 출력: [ais-v14-email-red.tap](/private/tmp/ais-v14-email-red.tap)
- 재실행: `node --test /private/tmp/ais-v14-email-red.test.mjs` — 현 baseline에서 실패하는 것이 의도된 RED다. 재실행은 JSON 관측 파일을 갱신한다.

## 재현 결과와 우선순위

| 우선순위·검증 | 실제 입력/제어 | 실제 관측 | 요구한 불변량 |
|---|---|---|---|
| P1 동시 행 발송 보호 | 유효한 outbox 1행에 `deliverEmailForUser('alpha')` 두 개를 동시에 시작, provider 응답은 barrier로 보류 | 응답 해제 전 provider mock 진입 2회, attempts 2. 두 함수 모두 `{sent:1}` 반환. 동일 notification의 **동일 idempotency key** 사용 | 한 행의 한 번의 유효한 claim만 provider 요청에 진입해야 한다. |
| P1 재시도 상한 보호 | 같은 방식, 시작 상태 `failed`, attempts=2, 양쪽 provider 응답 HTTP503 | provider 호출 2회, 최종 attempts=4, failed | 상한 3은 초기 SELECT뿐 아니라 실제 claim/update 시점에도 보장되어야 한다. |
| P1 terminal 상태 보호 | 같은 행의 두 provider 호출을 확보한 뒤 첫 응답 200+id, 두 번째는 뒤늦게 HTTP409 mock | 첫 성공 완료 후 sent, 늦은 실패 완료 후 **failed**로 바뀜 | 오래된/다른 실행자의 완료 처리가 먼저 확정한 성공을 덮으면 안 된다. |
| P2 동의 철회 즉시 취소 | alpha의 queued/failed/sent/needs_review/cancelled와 beta의 queued/failed를 준비하고 실제 설정 API로 `email:false` 저장 | HTTP200, 설정 false. alpha queued/failed가 그대로 남음 | 같은 저장 트랜잭션에서 해당 계정 queued/failed만 cancelled가 되어야 한다. sent·needs_review·다른 계정 보존도 함께 검사했다. |
| P2 철회 트랜잭션 원자성 | outbox cancelled UPDATE 때 ABORT하는 메모리 SQLite trigger 설치 후 `email:false` 저장 | HTTP200, 설정 false, outbox queued. 현재 구현은 취소 UPDATE 자체가 없으므로 trigger도 실행되지 않음 | 취소 쓰기를 추가한 구현은 그 쓰기가 실패할 때 설정 변경도 rollback해야 한다. 현 테스트는 누락된 공동 트랜잭션 요구를 RED로 고정한다. 현재 DB transaction primitive 자체의 rollback 고장을 입증한 것은 아니다. |
| P2 제공자 접수 ID 영속성 | provider mock이 유일한 nonempty id를 담은 HTTP200 반환 | 1회 호출, `{sent:1}`, row status=sent 및 sent_at 존재. 반환 ID는 row 어디에도 없음 | 제공자 접수 ID를 영속 기록해 나중에 조회·조사할 수 있어야 한다. 테스트는 특정 새 컬럼명에 결합하지 않는다. |
| 대조 PASS 전송 직전 철회 검사 | 기존 큐 생성 후 설정 false 저장, 그 뒤 새 deliver 실행 | provider 요청 **0회**, sent 0, outbox cancelled | 현재에도 새로운 전송 시작 전 동의 재검증은 작동한다. 즉시 취소 누락을 ‘철회하면 항상 메일이 발송된다’로 확대하면 안 된다. |

P1은 실제 메일 2통이 확인됐다는 뜻이 아니라 **애플리케이션의 발송 상호배제·횟수 제한·결과 일관성이 동시에 깨진다**는 우선순위다. 현재 제공자 idempotency key는 존재하고, 위 두 요청에서도 동일했다. 제공자 측 중복 억제가 실제 메일을 막을 가능성은 별개이며, 그것만으로 local attempts=4나 sent→failed 덮어쓰기가 고쳐지지 않는다. HTTP409는 순서를 통제한 모의 비-2xx 응답이며, 실제 제공자의 특정 동시 요청 정책을 확인했다고 주장하지 않는다.

## 원인 위치

- [workspace/route.ts:26](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:26)는 이메일 연결 검사와 서버 사용자 이메일 설정을 수행한다. [동일 파일:42](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:42)의 batch에는 private_records 쓰기만 들어가고, outbox 취소가 없다.
- [notifications.ts:42](/Users/bigmac_moon/dev/ai_score/site/lib/notifications.ts:42)의 pending SELECT는 queued/failed 및 attempts<3을 읽는다. 이 조회 결과는 이후 다른 실행자가 행을 바꾸는 것을 막지 않는다.
- [notifications.ts:49](/Users/bigmac_moon/dev/ai_score/site/lib/notifications.ts:49)의 attempts 증가와 성공/실패 상태 UPDATE는 `WHERE id=?`만 검사한다. 계정·현재 status·시도 상한·claim 소유권 조건이 없고, 발송 전 선점 결과도 확인하지 않는다. 그래서 양쪽이 같은 이전 상태를 읽고 진입하며, 늦은 UPDATE가 이긴다.
- 같은 줄에서 response JSON의 id 존재는 확인하지만, 성공 UPDATE는 status/sent_at/error만 저장한다. [schema.ts:15](/Users/bigmac_moon/dev/ai_score/site/db/schema.ts:15)와 적용 migration에도 접수 ID 컬럼이 없다.
- [notifications.ts:45](/Users/bigmac_moon/dev/ai_score/site/lib/notifications.ts:45)의 최신 설정·소스·자격 재확인은 유효한 보호이며 유지해야 한다. 이번 RED는 이 보호가 없다는 지적이 아니다.

## 최소한의 안전한 구현 조건

1. 실제 `email:false` 저장 시 설정 변경과 같은 `db.batch()`에 `user_id`가 일치하고 status가 queued/failed인 행의 취소를 포함한다. 저장하지 않는 `ifAbsent` 반환이나 소유권 거절에는 취소 side effect가 생기면 안 된다. sent 기록과 다른 계정은 건드리지 않는다. 취소 실패 trigger 테스트가 rollback을 확인하게 한다.
2. provider 호출 전에 status·attempts 상한·계정·유효한 claim 상태를 조건으로 한 **원자적 선점**을 수행하고 `meta.changes===1`인 실행자만 전송한다. attempts 증가는 그 선점의 일부여야 한다. 복구 가능한 lease를 사용한다면 오래된 실행자를 구분하는 토큰/세대도 필요하며, 성공/실패 finalize는 그 소유권을 조건으로 한다. 단지 SELECT 후 `status='sending'`을 무조건 쓰는 것은 같은 경합을 막지 못한다.
3. 검증한 제공자 ID와 접수 시각을 해당 선점자의 성공 상태와 함께 저장한다. ‘제공자가 요청을 접수함’은 받은편지함 도착 증명이 아니므로 상태/UI 용어도 구분한다. 늦은 실패가 다른 실행자의 성공/취소 상태를 덮지 못하게 한다. 네트워크와 D1을 하나의 ACID 트랜잭션으로 묶었다고 표현하지 않는다.
4. 직전 동의·관심사·혜택 자격·숨긴 주제 재확인과 현재 idempotency key를 유지한다. 이미 provider에 나간 요청을 설정 저장으로 회수할 수 있다는 보장은 하지 않는다. queued/failed 취소, 아직 전송하지 않은 claim, 이미 외부 요청이 시작된 상태의 처리 경계를 구분해야 한다.

## harness가 검증하는 범위

[api-harness.mjs:10](/Users/bigmac_moon/dev/ai_score/site/tests/api-harness.mjs:10)는 실제 SQL migrations로 SQLite 메모리 DB를 만들고, [동일 파일:12](/Users/bigmac_moon/dev/ai_score/site/tests/api-harness.mjs:12)의 D1 batch adapter는 BEGIN/COMMIT/ROLLBACK을 구현한다. 실제 API와 notifications 모듈을 transpile하여 실행하고 fetch는 명시적 mock으로만 제공했다. 기본 fetcher도 외부 호출 금지 예외를 낸다. 사용자·수신자는 모두 `.invalid` 시험 데이터다.

동시성 시험은 한 메모리 DB에서 두 실제 async 함수의 중첩 실행을 만들고, provider 응답 시점만 barrier로 통제했다. 이는 코드가 허용하는 유효한 경합 순서의 재현이며, 실제 D1의 다중 isolate 지연·장애·제공자 전달 보장은 별도 범위다. 근거 파일의 sourceHashes로 수정 전 baseline을 구분할 수 있다. 기존 테스트에 이미 있는 전송 직전 관심사/혜택 자격 검사와 topic 숨김 검사는 재사용할 가치가 있으며, 이번 7개가 전체 이메일 회귀를 대체하지 않는다.

이 RED 묶음을 해소해도 예약 실행, 시점·빈도·digest 구성, 전체 동의 조건, 실행 호스트와 운영 전달 증거의 미완료 범위가 함께 완료되는 것은 아니다. root의 전체 timing/digest integration 검증과 분리해 기록해야 한다.
