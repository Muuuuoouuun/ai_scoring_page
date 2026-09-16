# V20 무방문 알림 실행 연결 — 현재 소스 조사

2026-09-15, Site HEAD `d5efa3e11997`. 현재 소스와 설치된 Vinext 엔트리, 공식 Cloudflare/Resend 문서를 읽었다. Sites 스킬·Sites 도구·브라우저·운영 설정·실제 환경값·DB에는 접근하지 않았고, Site 수정·발송·테스트 실행·점수 변경은 없다. root가 전달한 현재 운영 상태는 메일 키/발신 주소 항목 미설정, 지원되는 Sites 예약 등록 계약 미확인이다.

**결론: 기존 계정별 생성·발송 함수를 감싸는 실행 루프는 가능하다. 그러나 현재 확인된 호스트에는 그 루프를 방문 없이 인증해 시작할 연결이 없다. 새 엔드포인트나 cron 선언만 먼저 넣어도 실제 무방문 검증은 진행되지 않는다.** 호스트/진입 계약을 확정한 뒤 얇은 호출부만 붙이는 것이 최소 변경이며, 기존 이메일 엔진을 별도로 복제할 이유는 없다.

## 현재 연결 지점과 경계

| 현재 파일·함수 | 재사용 가능한 동작 / 연결 시 주의 |
|---|---|
| [notifications/route.ts:34](/Users/bigmac_moon/dev/ai_score/site/app/api/notifications/route.ts:34) | 로그인 사용자의 `generateNotifications(userId)` 다음 `deliverEmailForUser(userId)` 순서다. 현재 수동·화면 진입 호출과 예약 호출이 공유해야 할 순서다. |
| [notifications.ts:6](/Users/bigmac_moon/dev/ai_score/site/lib/notifications.ts:6) | 같은 source version의 알림/card/outbox를 중복 생성하지 않는 SQL/CAS를 사용한다. 사용자 ID를 받으므로 이 함수 자체는 브라우저 요청이나 로그인을 요구하지 않는다. |
| [email-delivery.ts:161](/Users/bigmac_moon/dev/ai_score/site/lib/email-delivery.ts:161) | 설정·시간·lease·재시도·출처를 재검사하고, 호출1회에서 기존 또는 새 묶음1개까지 시도한다. `{sent:0}`은 시간 전/동의 없음/lease 경합/보류 등도 포함하므로 발송 성공으로 집계할 수 없다. |
| [notice-candidates.ts:12](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts:12) | 검수된 `catalog.latestUpdate`, `promotions.json`, 해당 사용자 계약/결제에서 후보를 만든다. **`currentNotices`는 `registerSource`로 source head를 갱신하므로 순수 read-only 함수가 아니다.** 기계 인증 전에 호출하거나 무변경 dry run으로 사용하지 않는다. |
| [source-sync.ts:15](/Users/bigmac_moon/dev/ai_score/site/lib/source-sync.ts:15) | `syncBatch(false)`는 시간 제한과 전역 lock으로 오래된 도구3개를 갱신한다. 한 실행의 전체 계정 처리 앞/뒤 독립 단계1회로 사용할 수 있으며 사용자마다 반복하거나 매 tick `force=true`로 바꿀 이유가 없다. |
| [layout.tsx:25](/Users/bigmac_moon/dev/ai_score/site/app/layout.tsx:25), [sources/route.ts](/Users/bigmac_moon/dev/ai_score/site/app/api/sources/route.ts) | 현재 public source 갱신은 요청에서 시작한다. 공개 GET을 주기적으로 부르는 것만으로 개인 알림 생성·메일 발송까지 실행되지는 않는다. |
| [db.ts:1](/Users/bigmac_moon/dev/ai_score/site/lib/db.ts:1), [vite.config.ts:14](/Users/bigmac_moon/dev/ai_score/site/vite.config.ts:14) | DB와 이메일 설정은 `cloudflare:workers` 런타임 바인딩을 쓴다. 단순 Node cron에서 이 모듈을 import하는 구조는 바로 실행 가능하지 않다. 소스/로고까지 처리하려면 같은 운영 DB와 BUCKET도 연결돼야 한다. |

**source-sync와 이메일 후보는 별개다.** 갱신한 RSS items는 `source_snapshots`/`liveFeed()`에 들어가고 이메일 후보는 이 테이블을 읽지 않는다. 예약 실행은 현재 검수된 알림을 자동 평가·전달할 수 있지만 새로운 RSS 항목을 자동으로 검수된 카탈로그 공지나 혜택으로 전환하지 않는다. source revision을 사람이 확인해 올리는 현재 경계도 보존해야 한다. 따라서 이 연결만으로 ‘수집한 최신 글 전부의 자동 이메일’을 완성했다고 표현하면 안 된다.

## 호스트가 정해진 뒤 필요한 최소 구조

1. **실행 진입부1개 + 작은 계정 처리 루프.** 같은 Worker의 지원되는 `scheduled` 진입부 또는 공식적으로 도달 가능한 기계 인증 진입부에서 호출한다. 공용 서비스 함수는 웹과 같은 순서로 생성→발송을 수행한다. 사용자 API의 `authenticated()`를 제거하거나 기계 요청에서 `oai-authenticated-user-*`를 위조하는 방법은 사용하지 않는다. 현재 [chatgpt-auth.ts](/Users/bigmac_moon/dev/ai_score/site/app/chatgpt-auth.ts)의 인증은 플랫폼이 전달한 요청 헤더 문맥이며 scheduler 자격 증명 체계가 아니다.
2. **계정 선택은 서버의 현재 데이터에서 한다.** 첫 실제 검증은 동의한 계정으로 범위를 고정할 수 있다. 전체 계정 실행 단계에서는 `settings/preferences` 또는 subscription을 가진 user_id를 중복 제거해 안정적인 key 순서로 나눈다. 설정을 모두 끈 계정의 기존 정정 카드/기본 결제 알림 처리 경계를 보존하려면 email=true 사용자만 전체 알림 대상으로 오인하지 않는다. 각 계정 안에서 기존 함수가 수신 동의·시간을 다시 판단해야 하며 요청이 받는 주소/관심사로 이를 덮어쓰지 않는다.
3. **시간/작업량 상한과 이어가기.** 한 번에 무제한 계정 `Promise.all`을 만들지 않는다. 느린 제공사 호출은 기존15초 timeout을 쓰므로 호스트 제한에 맞춰 작은 페이지와 제한된 동시성을 정하고, 마지막 처리 위치와 오류를 남겨 다음 호출이 이어가게 한다. 매번 첫 페이지에서 끝내면 뒤 계정이 영구 누락된다. 이 상태는 사용자 알림 원장과 별개의 실행 메타정보이며, source 전용 `sync_runs`를 모든 알림 성공 기록으로 재사용하지 않는다.
4. **실패는 단계별로 격리한다.** source 수집 오류 때문에 독립적인 기존 검수 알림의 재시도 전체가 중단되거나, 한 사용자 오류 때문에 다음 사용자가 빠지지 않게 한다. 정상 완료/부분 실패/lease로 건너뜀을 구분한다. 부분 실패를 숨긴 HTTP200·cron 성공만으로 전체 계정 완료를 주장하지 않는다. 영속 작업 큐까지 도입할지는 실제 호스트 제한/계정량이 이를 요구할 때 결정한다.

위 구조를 위해 만들 파일은 호스트 결정 후의 **얇은 실행 서비스 모듈과 선택된 진입 adapter** 정도다. 지금은 URI/비밀키 이름/cron 등록 파일을 가정해 추가하지 않는다. HTTP 방식이 채택되면 별도 기계 자격 증명을 요청마다 먼저 검증하고, 키 미설정·잘못된 인증은 DB 읽기/후보 계산/발송 전에 거절해야 한다. 반환값은 실행 ID·건수·상태만으로 제한하고 개인 주소/본문은 보내지 않는다. private Site 앞단이 그 인증 요청을 정상적으로 허용하는지 확인하기 전에는 새 route의 실효성을 보장할 수 없다.

## 그대로 보존해야 할 실행 불변량

- [workspace-settings.ts:39](/Users/bigmac_moon/dev/ai_score/site/lib/workspace-settings.ts:39)의 기존 `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL` 구성 조건과 **사용자 이메일 수신 동의 + `emailTimingConfirmed`**. 수신 주소는 로그인 사용자에서 저장한 값만 사용한다. scheduler가 누락 값을 채우거나 동의를 켜지 않는다.
- [email-timing.ts](/Users/bigmac_moon/dev/ai_score/site/lib/email-timing.ts)의 명시적 시간대/시각, digest의 하루1묶음, matched의 최근24시간 최대3회, 빈 digest 평가 소비, 같은 날 늦은 처리와 지난 날짜 미재생. 호출 tick은 UTC일 수 있지만 사용자 시각 판단은 이 함수를 그대로 사용한다. 지연된 trigger의 예정 시각으로 현재 시간을 되돌려 만료 혜택을 보내지 않는다. 실제 시작/시도 시각과 예정 시각은 기록에서 분리한다.
- [email-delivery.ts:17](/Users/bigmac_moon/dev/ai_score/site/lib/email-delivery.ts:17)의 사용자별5분 lease·설정 revision, 각 SQL의 authority/CAS, plan/attempt 양쪽 최신 card/head·deadline 확인. 수동 호출과 scheduler가 겹쳐도 이 경로를 공용으로 사용한다. scheduler 재호출 때문에 outbox 상태나 attempts를 초기화하지 않는다.
- 동일 delivery의 **고정 payload + 동일 Idempotency-Key**, 기존 최대3시도·23시간 안전 구간·Retry-After/backoff, 불확실/legacy attempted의 `needs_review`, 늦은 제공사 접수 기록 보존을 유지한다. Resend 공식 문서는 idempotency 보존을24시간으로 설명하므로 현재보다 긴 자동 재전송 창을 임의로 열지 않는다. [Resend idempotency 문서](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [email-cancellation.ts](/Users/bigmac_moon/dev/ai_score/site/lib/email-cancellation.ts)의 동의 철회와 동일 transaction 취소, 계정 삭제 후 늦은 응답의 레코드 재생성 금지, 출처 이전 revision/동일 revision 다른 사실의 보류를 유지한다. 별도 Worker에 과거 카탈로그/혜택 데이터를 복제하면 source head가 이를 거부하거나 충돌 보류하게 되므로 실행 데이터의 배포 버전도 맞아야 한다.

## 구현 전에 확정할 호스트 조건

| 필요한 확인 | 현재 판단과 최소 질문 범위 |
|---|---|
| 실행을 누가 등록·유지하는가 | Cloudflare 일반 기능은 `scheduled()` handler **및** trigger 등록이 둘 다 필요하고 cron 시각은 UTC다. 이 사실이 관리형 Sites의 등록 권한/지원 계약을 대신하지 않는다. [공식 Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) |
| 어떤 실행 문맥에서 기존 코드를 부르는가 | 현재 설치된 [Vinext app-router-entry.js:18](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-router-entry.js:18)는 default `fetch`만 내보낸다. [fetch-handler.js](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/fetch-handler.js)는 custom Worker에서 fetch를 위임하는 예를 설명하지만, 운영 관리 계층이 그 엔트리와 trigger를 받아 준다는 근거는 아니다. |
| 기존 DB/BUCKET·비밀값·인증 경계가 유지되는가 | 같은 운영 바인딩을 지원된 경로로 쓰거나 정상 기계 인증으로 Site에 도달해야 한다. 로컬 DB·가짜 수신자·사용자 세션 쿠키 복사로 대체할 수 없다. 호스트가 사용자 컴퓨터라면 그 컴퓨터의 실행 상태/네트워크에 의존한다는 한계도 별도다. |
| 실행 제한/재호출/관측 계약은 무엇인가 | 일반 Workers의 HTTP 응답 후 `waitUntil`은 최대30초 연장이고 cron은15분 wall time 상한이므로 단순202응답 뒤 무제한 실행은 안 된다. CPU/하위 요청 제한은 실제 호스트 플랜을 확인해야 한다. [공식 Limits](https://developers.cloudflare.com/workers/platform/limits/) scheduled handler는 반환 promise를 기다리므로 그 완료를 명확히 연결한다. [공식 Scheduled Handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/) |

## 검증과 지금의 유효한 종료 지점

호스트 연결이 확정되면 현재 `tests/api-harness.mjs`의 **메모리 SQLite/모의 제공사/controlled clock**과 기존 `email-timing`, `email-delivery`, `notice-races`, `notice-versions` 시험을 재사용할 수 있다. 새 adapter의 시험은 잘못된 기계 인증의 무변경 거절, 수동+예약 동시 호출, 한 계정 실패 후 다음 계정 처리/다음 페이지, 중간 동의 철회, timeout 후 동일 delivery 재시도로 한정하면 된다. 테스트 자체는 실제 운영 scheduler나 수신함 증거가 아니다.

현재는 root가 확인한 메일 구성 부재와 지원되는 무방문 진입 계약 부재 때문에 **코드만 추가해서 실제 실행 검증을 완료할 수 없다**. 전달할 다음 정보는 ‘지원 호스트의 정상 등록/호출 경로, 동일 운영 바인딩과 기계 인증 가능 여부, 실행 제한·주기·오류 기록 방식’이다. 메일 서비스/발신 주소 답변과 함께 이것이 정해지면 기존 함수를 보존한 소규모 adapter 구현이 가능하다. 그 전까지 새 endpoint나 scheduler UI를 만들어 준비 완료로 표시할 실익은 없다. 이 조사는 원래 게이트/점수나 실제 운영 상태를 변경하지 않는다.
