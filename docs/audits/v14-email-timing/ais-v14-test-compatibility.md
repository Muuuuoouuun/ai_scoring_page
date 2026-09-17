# V14 이메일 테스트 호환성 검토

2026-09-12 읽기 전용 검토. 현재 `tests/*.mjs`, 보존된 V14 RED, 새 email timing spec/plan 및 작성 중인 settings/harness 코드를 읽었다. Site 수정·실제 네트워크·테스트 재실행은 하지 않았다. 구현 중간 상태의 검토이며 최종 GREEN 판정이 아니다.

**기존 테스트를 삭제하거나 `sent=0`만 남기면 안 된다. 새 명시 시간 확인·발송 가능 시각·유효 후보를 fixture로 먼저 갖추고, 원래 검증하려던 관심사·자격·숨김·동의 때문에 막히는지 확인해야 한다.** 기존 일괄 발송 이전의 outbox attempts 조작은 새 immutable batch 재시도 모델에서 같은 뜻이 아니다.

## 실제 발견한 기존 테스트와 이전 방법

| 위치·현재 이름 | 기존 가정/문제 | 보호를 유지하는 fixture·assertion |
|---|---|---|
| [api.test.mjs:14](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:14) `remaining charges generate reminders; generation deduplicates and respects in-app opt-out` | 두 번째 설정은 email:true이나 mode/zone/time이 없다. 이 테스트의 핵심은 앱 결제 알림 생성 1회·중복 생성 0회·inApp=false 후 표시 0건이며, 발송 성공 테스트가 아니다. | 이 세 숫자는 그대로 유지한다. email:true 상태까지 유지하려면 명시 설정을 함께 저장하고 200을 확인한다. 결제 예정 알림의 emailAllowed=false 보호도 별도로 유지한다. 이 테스트를 이메일이 안 켜졌다는 이유만으로 제거하지 않는다. billing.today()와 nextDate는 같은 제어 시각에서 얻는다. |
| [api.test.mjs:15](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:15) `email address is server-controlled and missing transport is not treated as success` | 시간 확인 없는 email:true 저장. 새 시간 검증 실패가 원래 운송 설정 검증보다 먼저 발생하면 엉뚱한 실패/통과가 된다. | 유효한 명시 mode/zone/time을 포함해 첫 저장 200·서버 사용자 이메일 유지·위조 emailAddress 무시를 확인한다. 이후 TEST_ONLY transport를 제거하고 같은 유효 설정으로 저장해 **503**을 계속 기대한다. 400/아무 실패면 됨으로 약화하지 않는다. |
| [api.test.mjs:44](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:44) `email retry revalidates current interests and never emails eligibility-unknown promotions` | 실제로는 실패/재시도 없이 큐 생성→관심사 제거→deliver 1회다. 이름과 달리 재시도 검증이 없다. 시간 미확인·슬롯 이전·빈 큐 때문에 sent=0이어도 통과할 수 있다. | 명시 설정과 고정 due 시각을 사용한다. 변경 전에 유효 update 후보가 최소 1개 존재하고 unknown promotion 후보는 0개임을 확인한다. 관심사 제거 후 그 update의 큐/준비 묶음이 취소·제외되어 provider 호출 0임을 확인한다. 같은 조건의 관심사 유지 대조 fixture는 1개의 비어 있지 않은 묶음을 접수해야 한다. **진짜 retry 재검증은 별도 실패 batch fixture**로 분리한다. |
| [api.test.mjs:72](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:72) `hiding an owned notice persists topic preferences, excludes old notices and cancels email` | email:true만으로 queue를 준비하고 즉시 deliver가 0인지 검사한다. 새 시간 gate로 인한 0건이 숨김 보호처럼 보일 위험. | due 시각·confirmed 설정·유효 update 후보를 먼저 입증한다. beta 숨김 **404**, alpha 숨김 **200**, 화면 알림 0건, persisted hiddenTopics와 provider 0건을 모두 유지한다. 아직 시도하지 않은 대상 큐/묶음의 취소도 확인한다. attempted batch를 숨긴 경우는 새 별도 fixture에서 needs_review/불확실 보존을 검증하며, 같은 body/key를 고쳐 보내는 것으로 바꾸지 않는다. |
| [api.test.mjs:103](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:103) `a matched bill is not regenerated as an upcoming payment reminder` | 결제 내역 매칭의 앱 알림 검사다. 이름의 matched는 새 emailMode와 관계없다. | 시간 조건 이메일 테스트로 바꾸지 않는다. 실제 결제 매칭 뒤 billing 알림 0건을 유지한다. 필요하면 현재 날짜만 제어 clock으로 고정한다. |
| [api.test.mjs:109](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:109) `saving stale settings preserves hidden topics unless the user explicitly restores them` | email:false이며 전송 기대는 없다. 새 revision으로 이름의 ‘stale’ 의미가 혼동될 수 있다. | 기존 stale **payload**의 hiddenTopics 보존과 명시 restore를 유지한다. 현재 `h.save`는 최신 revision을 다시 읽으므로 stale revision 거절 테스트가 아니다. 오래된 revision 자체의 CAS 409는 별도로 캡처한 guard를 raw `h.call`에 전달해 확인한다. |

현재 `site/tests`에서 기존 deliverEmailForUser를 직접 호출하는 곳은 위 두 개의 0건 검사다. 기존 `api.test.mjs`에 ‘알림 N개→provider N회’ 또는 ‘실패 직후 즉시 성공 재시도’를 직접 기대하는 성공 테스트는 찾지 못했다. 그 가정은 아래 보존 RED fixture에 명확히 존재한다. 과거 파일의 범위를 과장하지 않는다.

## 새 settings 테스트와 보존 RED의 이동

- [email-delivery.test.mjs:5](/Users/bigmac_moon/dev/ai_score/site/tests/email-delivery.test.mjs:5)의 preferences는 이미 digest/Asia-Seoul/09:00 세 값을 명시한다. round-trip·invalid 값·즉시 취소·rollback 4개는 본래 기대를 유지할 수 있다. 첫 저장 200 뒤 서버가 `emailTimingConfirmed===true`로 저장했는지 추가 확인한다. 취소/rollback 자체는 due 시각까지 갈 필요가 없지만, queue가 비어 있는 상태에서 우연히 통과하지 않도록 대상 row 존재를 먼저 assert한다.
- [보존 RED](/Users/bigmac_moon/dev/ai_score/docs/audits/v14-email-timing/ais-v14-email-red.test.mjs)의 `settings`는 세 시간 필드가 없다. 원본은 역사적 증거로 그대로 둔다. 새 코드를 대상으로 무턱대고 이 원본을 GREEN 용도로 재실행하면 timing hold로 provider barrier에 진입하지 않아 대기할 수도 있다. 활성 회귀 테스트는 새 fixture로 작성하고 대기에는 테스트 자체의 제한 시간을 둔다.
- RED ‘접수 ID 보존’: 명시 due fixture의 **실제 생성된 immutable batch**에 provider가 id를 반환하도록 한다. 접수 묶음 1건, provider 호출 1회, delivery와 연결된 outbox의 접수 ID·연결 ID·접수 시각을 확인한다. `sent`는 접수된 **묶음 수**이므로 알림 개수와 같다고 가정하지 않는다.
- RED ‘concurrent duplicate’: 먼저 같은 계정에 여러 유효 notice를 준비하고 동일 due slot에서 두 실제 deliver를 중첩한다. provider 응답 전 진입은 1회, 두 결과의 접수 묶음 합은 1, 각 notice는 한 묶음에 한 번만 포함되어야 한다. per-notice 잠금만으로 다른 묶음 두 개가 만들어지는 것도 막아야 하므로 계정/slot 결과를 함께 본다.
- RED ‘attempts=2→4’: `email_outbox`만 attempts=2로 바꾸는 옛 fixture는 더 이상 정상 retry가 아니다. 실제 파이프라인으로 immutable delivery를 만들고, 모의 실패→정해진 B1 대기 경과→두 번째 실패→B2 경과로 **delivery attempts=2**를 만든 뒤 동시 마지막 retry를 실행한다. provider 1회 추가, attempts 최대 3, 동일 body/key·수신자·묶음 ID를 유지한다.
- 옛 attempted unsent row는 **별도 legacy 보호 테스트**로 남긴다. 불변 payload/delivery 연결 없이 queued/failed에 attempts>0인 과거 row가 needs_review로 이동하고 provider 0회인지 검증한다. 이 row를 재시도시키기 위해 보호를 끄거나 새 delivery/idempotency key를 붙이면 새 정책을 무너뜨린다. 미시도 row는 정상 후보, sent 과거 row는 sent 및 기존 사실만 보존한다.
- RED ‘late failure overwrites sent’: 새 claim이 두 provider 진입을 막으면 예전 방식으로 2개 응답을 기다릴 필요가 없다. 정상 경합은 1회 진입을 검증하고, stale finalize는 실제 모듈의 claim-token 경로를 통제해 만료/교체된 token의 늦은 실패가 새 접수를 덮지 못하는 별도 시험으로 옮긴다. token 검사를 우회한 무조건 SQL UPDATE를 테스트가 직접 수행해서 결함을 만들어서는 안 된다.
- RED ‘동의 off 후 발송 0’: 설정 확인·due 시각·유효 후보를 확보한 뒤 off한다. 즉시 cancelled와 추가 provider 0을 모두 유지한다. 이미 외부 요청이 시작된 경우는 회수가 불가능하므로 별도 상태/receipt 보존 시험으로 구분한다.

## 명시 설정과 controlled clock의 구체 형태

작성 중인 [workspace-settings.ts:31](/Users/bigmac_moon/dev/ai_score/site/lib/workspace-settings.ts:31)는 `emailMode`, `emailTimeZone`, `emailTime`이 모두 제공되면 서버에서 timing을 확인한 것으로 기록한다. 따라서 test payload에 `emailTimingConfirmed:true`만 임의 삽입하지 말고 실제 저장 API로 세 값을 명시하여 서버 결과를 확인한다. 기존 시간 미확인 설정은 별도의 negative fixture로 보존한다. 다른 profile 값만 수정하는 요청에서는 이전 시간/확인값 보존도 별도 확인한다.

현재 [api-harness.mjs:9](/Users/bigmac_moon/dev/ai_score/site/tests/api-harness.mjs:9)는 `harness(fetcher, {now: () => instant})`를 지원하며 VM의 `Date`에 주입한다. 아래는 권장 형태이며 파일에 구현하지 않았다.

```js
let instant = '2026-09-11T23:59:59.999Z'; // Seoul 08:59:59.999
const requests = [];
const h = harness(async (url, options) => {
  requests.push({url, key: options.headers['Idempotency-Key'], body: options.body});
  return Response.json({id: 'local-receipt'});
}, {now: () => instant});
const p = {interests: ['chatgpt'], includeAlternatives: false, inApp: true,
  email: true, emailMode: 'digest', emailTimeZone: 'Asia/Seoul', emailTime: '09:00'};
// Save through h.save, assert HTTP 200 and emailTimingConfirmed === true.
// Before due: provider 0. Set instant to 2026-09-12T00:00:00.000Z and process.
```

1. **기본 clock:** due 직전/정각/직후를 위 UTC 값으로 고정한다. 후보 생성·처리·settings stamp는 같은 harness clock을 사용한다. 테스트 코드에서 SQL로 넣는 created_at/first_attempt_at도 전역 real Date 대신 이 fixture 시각을 사용한다. `h.load('lib/billing.ts').today()`는 같은 VM clock이므로 billing fixture와 어긋나지 않는다.
2. **daily 묶음:** 여러 notice→1번의 provider 호출·서로 다른 item key 전부 포함·중복 0. 같은 날 이후 새 후보를 추가해도 새 digest는 0; 다음 서울 09:00(`2026-09-13T00:00:00Z`)에만 새 notice 묶음 1. 빈 slot도 평가되었음을 확인하고, 그날 나중 후보가 왔다고 즉시 발송으로 기대를 되돌리지 않는다.
3. **matched:** 동일 selected time gate를 사용하되, 새 후보별 적절한 후속 처리와 rolling 24h 최대 3묶음을 검증한다. retry는 새 묶음/쿼터 소비로 세지 않는다. 이 모드의 전송도 ‘후보마다 개별 메일’이라는 fixture로 고정하지 않는다.
4. **backoff:** B1/B2의 정확한 간격은 root가 확정한 정책값으로 독립 벡터에 먼저 고정한다. 아직 문서에 없는 분/초를 임의 제안하지 않는다. 직후와 nextAttempt 직전에는 provider 요청·attempts 증가가 모두 0, 정각에는 1이다. DB가 내놓은 nextAttemptAt로 clock을 옮기는 테스트만 있으면 잘못 계산된 간격도 통과하므로, `firstAttempt+B1` 등 절대 기대값 검사도 필요하다.
5. **실제 retry 조건 재확인:** 정상 retry fixture에서는 관심/자격/숨김/consent와 body가 유지될 때 동일 문자열 body·동일 key로 재시도되어야 한다. 실패 뒤 관심/유효성 등을 바꾼 fixture에서는 원래 0건 보호를 유지하되 attempted batch는 needs_review, 그 surviving item을 새 key로 다시 보내지 않는지를 확인한다.
6. **기한:** safe retry window는 queue created_at 대신 첫 실제 시도 기준이다. 생성이 오래됐으나 아직 미시도인 정상 후보와, 최근에 옮겨졌어도 최초 시도가 오래된 attempted batch를 나눠 시험한다. clock은 변수만 전진시키며 실제 `sleep`, 날짜 전역 덮어쓰기, mock fetch 내부 네트워크 위임은 필요 없다.

새 API settings revision은 현재 `h.save`가 최신 guard를 넣는다. 일반 fixture 저장은 이 경로를 재사용하되, race/CAS 검사는 미리 캡처한 revision으로 raw API를 호출해야 한다. 테스트가 최신 revision을 매번 자동으로 가져와 stale update 보호를 시험했다고 주장하면 안 된다.

이번 목록은 과거 보호를 새 정책에서 더 정확히 검사하기 위한 이동안이다. 시간 미확인·아직 이른 시각·legacy hold가 원래 동의/자격 차단을 대신해 버리는 거짓 양성을 제거해야 하며, 운영 scheduler·실접수·수신 완료 범위는 계속 별도로 남는다.
