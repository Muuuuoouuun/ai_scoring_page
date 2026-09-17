# V15 고위험 race 독립 실행 결과

2026-09-12T14:56:41.793Z 시작. 실제 Site TypeScript 모듈과 설치된 SQLite 테스트 하네스로 **행위 시험 15개: 12 통과, 3 RED**를 재현했다. 별도 소스 지문 안정성 확인 1개는 통과했다. Node 출력은 총 16개, 13 통과·3 실패, exit 1이다. 3 RED는 독립된 제품 결함 3개가 아니라 **낡은 후보 스냅샷으로 최신 큐를 취소하는 같은 경로의 3가지 순서**다. 사전 26개 전체 통과나 배포·실수신 검증을 주장하지 않는다.

- [실행 시험](/private/tmp/ais-v15-race-run.test.mjs)
- [최종 TAP·관측 원문](/private/tmp/ais-v15-race-run.tap)
- [구조화 결과·지문](/private/tmp/ais-v15-race-run.json)
- [초기 유효 14개 실행](/private/tmp/ais-v15-race-run.initial.tap), [digest 추가 후 15개 실행](/private/tmp/ais-v15-race-run.pre-cleanup-race.tap)

## 확인된 중요 결함

**최신 검수 큐를 구버전 worker가 취소하고, digest에서는 당일 평가 슬롯까지 소비한다.** 테스트 당시 `lib/email-delivery.ts`의 `planBatch` 64행은 `available`에 없는 pending key를 `Notice is no longer eligible`로 취소하지만, UPDATE guard는 계정 claim/settings만 확인한다. ‘이 실행자가 해당 최신 source를 판단할 권한이 없다’와 ‘현재 사용자 조건에 맞지 않는다’를 구분하지 않는다. 66행의 빈 items 처리도 같은 낡은 판단으로 `digestConsumed(...,'evaluated_empty')`에 진입한다.

| 사전 경계·재현 | 고정된 사전 기대 | 실제 결과 |
|---|---|---|
| R3/R4, matched: R1 source worker와 R2 source worker가 동일 DB 사용. R2가 최신 카드·큐를 생성한 뒤 R1 deliver 실행 | R1 provider 0, 최신 R2 카드·큐 유지 | head/card는 R2 유지, provider 0. **R2 outbox queued→cancelled.** 최신 worker가 generate를 다시 실행하면 큐를 복구하여 sent 1이 됨. |
| R3/R4, digest: 위와 같고 시각 9/12 10:00Z·사용자 UTC 00:00 daily | 구버전이 R2 큐나 현재 daily 슬롯을 취소/소비하지 않음 | 최신 큐 cancelled, `last_digest_outcome=evaluated_empty`, `next_digest_not_before=2026-09-13T00:00:00.000Z`. **즉시 최신 worker가 generate로 복구해도 deliver sent 0, provider 0.** 이 fixture에서는 다음 자정까지 14시간 뒤로 밀림. |
| R8, candidate read→pending SELECT 사이: 시작 시 R1 currentNotices는 유효. pending 조회 직전 멈춘 동안 별도 worker가 R2 생성 후 재개 | 오래된 판단이 새 R2 큐를 취소하지 않음 | **R2 queued→cancelled.** 이 순서에서는 R1 항목이 items에 남아 plan guard가 막으므로 provider 0·digest 슬롯 null. |

따라서 입구의 `headValid=false` 검사만 추가하면 세 번째 경합은 남는다. 실제 취소 UPDATE와 empty-digest 결정에도 캡처한 검수 source/card 상태가 현재와 일치한다는 조건이 필요하다. 높은 revision이나 conflict를 ‘미해당’으로 취소하지 말고, 그 source를 판단할 수 있는 실행자에게 남겨야 한다. 이메일 동의 철회처럼 이미 독립적으로 확정된 개인 요청은 기존 원자 취소 정책을 유지한다. batch 폐기/재계획의 유사한 취소 경로도 같은 권한 원칙으로 점검할 대상이지만, 이번 시험에서 그 경로의 별도 실패까지 재현했다고 주장하지 않는다.

## 통과한 제한 범위

| 사전 ID | 실제 통제한 순서와 확인 결과 |
|---|---|
| R2 (1개) | 이미 accepted/read인 R1에서 checkedAt만 변경, 다음 날 revision만 2로 증가하고 hash 동일. provider 총 1, stable card·latest notification ID 동일, read 1, head/card revision 2, notification history와 전달 receipt 불변. |
| R3 generator CAS (1개) | R1 generate의 notification batch 직전 정지→R2 generate 커밋→R1 재개. 최신 head/card/queue가 R2 직후 값에서 변하지 않음. |
| R8 plan/attempt CAS (4개) | 각 SQL batch 직전에 source head R2 또는 email:false/settings revision 변경. delivery/outbox attempts 0, sending 0, provider 0, digest 슬롯 null. plan 단계면 delivery 자체가 생성되지 않음. |
| R9 모든 항목 존재·소유권 (3개) | 두 항목 prepared batch를 실제로 만든 후 attempt SQL 직전 한 항목의 head 삭제, card 삭제, Beta notification으로 latest pointer 교체. 세 경우 모두 provider/attempt 증가/슬롯 소비 0. |
| R10 (1개) | R1 실제 모의 요청 안에서 정지→R2 생성→R1 provider 200+id 응답. R1 exact payload·key·접수 ID를 기존 역사 행에 보존, 최신 R2 카드 유지. 이후 R2가 별도 key로 정정 1회 발송, 총 요청 2. |
| P6 (2개) | Alpha generate batch 정지 또는 provider 요청 정지 중 실제 workspace DELETE 실행→옛 실행 재개. Alpha private_records/notifications/cards/outbox/deliveries/dispatch 0, Beta의 기존 행 전체 동일, 공통 공개 head 유지. 늦은 접수 응답은 삭제 행을 재생성하지 않음. |

## 시험의 신뢰 경계

`tests/api-harness.mjs`를 그대로 import하고 `options.jsonFixtures`와 `options.now`를 사용했다. 하네스는 실제 모든 `.sql` migration을 새 `:memory:` SQLite에 적용한다. 구버전/신버전은 **서로 복제한 JSON을 로드한 별도 module graph**, `env.DB`만 같은 원본 D1 adapter를 공유한다. 옛 실행자가 새 JSON 객체를 우연히 읽어 버리는 가짜 구버전 시험이 아니다. D1 wrapper는 SQL을 바꾸지 않고 정확한 batch 또는 pending SELECT 직전 barrier만 넣는다. R9의 누락/잘못된 pointer는 메모리 DB에만 주입했다.

설정은 실제 API로 저장하고 explicit timing confirmed와 사전 `emailAllowed=true`를 확인했다. 이 테스트의 대상 외 Gemini 업데이트가 묶음에 섞이지 않도록 **이미 숨긴 토픽이라는 private fixture 상태**를 메모리 DB에 미리 넣었다. 일반 settings API는 서버가 소유한 hiddenTopics 입력을 그대로 받지 않으므로, 그 정상 보호를 우회한 제품 동작 시험이라고 주장하지 않는다. 처음 작성 중 닫는 괄호 누락과 숨김 fixture 가정 오류가 있었으며, 제품 결과를 판독하기 전에 수정했다. 기존 의미 기대값은 바꾸지 않았다.

제공자 mock은 예상 URL만 받아 exact JSON/body/idempotency key를 기록하고 합성 접수 ID를 반환한다. 네트워크·실이메일·브라우저·Sites·Git·Site 파일 변경은 없었다. 실제 D1 분산 실행을 운영에서 재현한 것은 아니며, SQLite transaction이 원자적이라는 하네스 범위에서 SQL 경합 순서를 통제한 증거다.

이번 최종 실행 시작/종료에 기록한 8개 소스 지문은 모두 동일했다. 핵심 `email-delivery.ts` SHA256은 `0edf92ce5dd2f71f87b6f19e3e6f6be5bdf69d791bf43d1da2b65b27c85e7891`, `notice-sources.ts`는 `24479abde21f4935d8ec0019eb1c85df631da3fb0a45428aee8c3f25c3013df1`이다. 이 실행은 event_revision 및 emailNotAfter guard 추가 이후 코드다. root의 이후 수정 결과는 이 보고서의 판정과 구분해서 재실행해야 한다.

재현 명령: `node --test --test-reporter=tap /private/tmp/ais-v15-race-run.test.mjs`. 이번 결과의 exit 1은 위의 고정 기대 세 가지가 실패한 의도적인 RED다. 사전 명세 중 나머지 legacy 전 범위·conflict 해소·다른 개인정보 API 경계는 이번 실행 범위 밖이다.
