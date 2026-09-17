# V14 dispatch 독립 적대적 검토 — 2026-09-12

**이 문서 앞부분은 최초 발견 당시 스냅샷이다. 최신 판정은 맨 아래 Final addendum을 따른다. 거기에 기록한 최종 소스에서는 이 검토의 세 재현 결함이 모두 해결됐다.**

범위는 새 `lib/email-delivery.ts`, 실제 `notice-candidates.ts`·`email-timing.ts`·generator와 D1 schema/migration이다. Site·Git·운영 데이터·배포를 변경하지 않았다. provider는 항상 mock이고 실제 네트워크 발송은 없다. 실제 소스를 TypeScript VM으로 읽고 실제 migrations를 적용한 메모리 SQLite에서 경합을 만들었다.

**재현한 결함은 P1 미시도 batch의 유효 생존 항목 처리와 P2 늦은 성공 receipt 소실 두 건이다.** root에 즉시 전달했고 보완 예정임을 확인했다. 아래 해시 기준에서는 두 경로의 최종 수정 완료를 판정하지 않았다. source key의 중요 변경 버전·운영 스케줄러·실제 provider/receipt 등 이미 명시된 미완료 범위를 새 회귀처럼 반복하지 않는다.

## P1 — 유효한 미시도 항목까지 취소한 뒤 빈 digest로 당일 기회를 소비한다

근거: `lib/email-delivery.ts:29–36` dropBatch, `:49–62` planBatch, `:138–142` pending 처리. 최신 generator는 취소된 attempts=0 항목을 복원하지만 drop/replan 내부에는 그 복원이 없다.

실제 재현:

1. 2026-09-12T00:00Z, Seoul09:00 digest, 관심 ChatGPT+Claude, timingConfirmed/consent=true. 실제 generator로 두 후보를 만든다.
2. 실제 planner가 prepared batch를 만들게 하고, 최초 sending UPDATE만 SQLite `BEFORE UPDATE ... RAISE(IGNORE)`로 0행 처리한다. 이는 정상적인 미시도 prepared 상태를 만드는 제어이며 provider는 호출되지 않는다. attempts=0, digest guard=null을 확인한다.
3. 현재 설정의 관심을 ChatGPT만으로 바꾸고 revision을 갱신한다. root가 병행 수정하는 settings invalidation 자체를 시험하기 위해서가 아니라 delivery의 current-source 변경 처리를 분리하기 위해 이 단계만 메모리 SQL로 바꾼다.
4. deliverEmailForUser를 다시 실행한다. mixed batch의 Claude가 유효하지 않으므로 dropBatch가 양쪽 outbox를 모두 cancelled로 만든다. 이어 planner가 queued 0건을 읽고 `evaluated_empty`로 기록한다.
5. 최신 generator 재실행은 ChatGPT를 queued/delivery_id=null로 복원한다. 하지만 당일 digest guard가 이미 다음날이므로 당일 재시도는 보내지 않는다. 다음날에야 한 건이 전달된다.

현재 관찰:

```json
{"stage":"drop/replan same call","calls":0,"next_digest_not_before":"2026-09-13T00:00:00.000Z","last_digest_outcome":"evaluated_empty","bothOutbox":"cancelled"}
{"stage":"regenerate same day","calls":0,"ChatGPT":"queued / delivery_id=null","Claude":"cancelled"}
{"stage":"next day","calls":1,"oldDelivery":"cancelled / attempts=0","newDelivery":"accepted / attempts=1"}
```

첫 관측의 이전 generator에서는 다음날에도 영구 cancelled였으나, root의 최신 generator 복원으로 그 부분은 해소됐다. **남은 문제는 실제 유효 후보가 있는데 빈 평가로 당일 슬롯을 닫는 것**이다. 이는 명시한 '정말 새 유효 항목 0건이면 empty 슬롯 종료' 정책과 다른 상태다.

최소 수정: attempts=0인 stale batch를 취소할 때 현재 유효한 생존 항목을 동일한 authority/transaction 경계 아래 `queued, delivery_id=NULL`로 되돌려 즉시 재계획 가능하게 한다. 실제 무효 항목은 cancelled로 남긴다. old batch의 items/payload는 수정하지 않는다. 반대로 attempts>0인 불확실 batch의 생존 항목을 새 ID로 풀어 중복 발송하지 않도록 분리해야 한다. root가 병행 구현하는 settings/hide의 prepared 취소에도 같은 원칙이 필요하다.

## P2 — lease 교체 후 도착한 유효 성공 응답의 ID가 버려진다

근거: `lib/email-delivery.ts:76–82` finish의 현재 claim+attempt_token 조건, `:118–126` 성공 응답/finish 반환 처리.

실제 재현:

1. matched batch의 첫 mock 요청을 들어간 상태에서 deferred promise로 멈춘다.
2. 제어 시각을 00:00Z→00:06Z로 옮겨 5분 lease를 만료시킨다.
3. 두 번째 dispatcher가 새 lease로 **동일 immutable body/key**를 요청하고 503을 받는다. 현재 batch는 retryable/attempts2, provider_id=null이다.
4. 첫 요청을 200, `{id:'known-old-success'}`로 끝낸다.

관찰:

```json
{"calls":2,"sameBody":true,"sameKey":true,"newerSent":0,"lateSent":0,"status":"retryable","attempts":2,"provider_id":null,"accepted_at":null,"error":"Email provider HTTP 503"}
```

늦은 실패가 새 acceptance를 덮지 않도록 한 guard는 옳다. 그러나 성공 ID를 실제 받았는데도 늦은 성공까지 버려 known acceptance가 retryable/unknown으로 남는다. 이후 재시도/23시간 종료에서 불필요한 review가 생기고 private receipt 이력이 빠진다.

최소 수정: 실패 상태 전이에는 기존 claim/attempt guard를 유지하되, 성공 receipt는 **현재도 존재하는 같은 user/id/immutable payload**에 대한 단조 acceptance 기록으로 병합한다. 이미 있는 acceptance를 늦은 실패로 내리거나 다른 ID로 덮어쓰지 않는다. 계정 삭제로 사라진 batch를 재생성하지 않으며 payload/owner 불일치에는 기록하지 않는다. 동일 request key에서 서로 다른 provider ID가 생긴 불일치는 덮어쓰기보다 검토 가능한 상태로 남긴다. root가 이 보완 방향과 새 RED 추가를 확인했다.

## 실제 통과한 적대적 경계

다음은 별도 inline harness로 실제 실행했다.

| 검사 | 관찰 결과 |
|---|---|
| planner INSERT를 RAISE(IGNORE)로 CAS0 처리 | delivery 0, outbox queued 유지, provider0, digest guard=null. 뒤 item 예약이 무조건 실행되지 않음. |
| prepared→sending UPDATE를 CAS0 처리 | provider0, parent/item attempts0, prepared 유지, digest guard=null. |
| 실제 currentNotices의 재검증 결과를 얻은 직후 pause→DB optout/revision 변경→재개 | stale 결과로 matches가 참이더라도 SQL authority가 전송을 막음. provider0, attempts0, digest slot 미소비. |
| matched batch가 이미2개일 때 세 번째의 attempt CAS 직전 pause→6분 후 새 lease가 세 번째 접수→old CAS 재개 | 총 provider3, newer.sent1/old.sent0, delivery/item attempts는 각각1. 오래된 작업이 네 번째 시도나 quota를 만들지 않음. |
| Gemini promotion+업데이트/ChatGPT mixed batch가 이미503으로1회 시도됨→promotion eligibility 철회→재처리·다음날 | batch needs_review, 원 payload/items bytes 동일, provider 총1, delivery 총1. 생존 항목을 새 batch로 중복 보내지 않음. |

기존 실제 통합 검사도 dependency 파일 작성 완료 후 `node --test --test-reporter=dot tests/email-delivery.test.mjs tests/email-timing.test.mjs`로 **40개(20 delivery+20 calendar), exit0**을 확인했다. 앞선 한 번은 root가 route import를 먼저 쓰고 `email-status.ts`를 아직 작성 중인 순간과 겹쳐 ENOENT로 초기화가 실패했다. 그 과도 상태를 제품 회귀로 판정하지 않았다.

그 초기화 공백 동안 최초 두 결함 및 일부 경계 검사는 **harness의 unrelated route eager preload만 메모리에서 생략**해 실행했다. 실제 DB/migrations/clock/notice candidates/generator/delivery 코드에는 대역을 넣지 않았다. email-status.ts 작성 후 P1 최신 generator 재검사와 quota/lease 경쟁은 원본 harness로 다시 실행했다. 로컬 DB의 의도된 fault injection을 운영 실패 관측이나 실제 이메일 증거라고 주장하지 않는다.

## 완료로 확대하지 않은 범위

immutable retry의 본문/key 보존 및 fail-closed optout guard는 위 범위에서 확인됐지만, P1/P2가 열려 있어 dispatch 전체 완료 판정은 아니다. root가 병행하는 settings/hide 즉시 취소, 생성 race, 개인 status/export/delete/UI의 최종 구현과 연결 검증은 이 보고서로 대신하지 않는다. 실제 scheduler/Resend sender/동의한 실제 receipt, 중요 변경 버전·정정 운영 및 고정 게이트 미완료를 유지한다.

## 마지막 검토 시 파일 SHA256

기준 디렉터리 `/Users/bigmac_moon/dev/ai_score/site/`.

| 파일 | SHA256 |
|---|---|
| `lib/email-delivery.ts` | `a818d1f4b82e7215fb4bd79aeff02c1deaebbc259673d44f1762d97937415bc5` |
| `lib/notice-candidates.ts` | `97f4b46a8485df0dcd48f692fc65158ea7646f35e2eb179bfd601276c93b6152` |
| `lib/email-timing.ts` | `c3201d0d00820de1f98a494af70a6c434c1006a967aa87c21a11de4b86fbd9ff` |
| `lib/notifications.ts` | `6a51d9d45397d9a890025550f025db24a5e047e6c78e12329520dc3f8b654017` |
| `tests/email-delivery.test.mjs` | `4a6b3aec02aa39141530af67cb342987fa2b92d36bf0a2562d2dfe4865c1e25d` |
| `drizzle/0003_condemned_darkhawk.sql` | `0697a4e16be05c322dc253cde849bb644bef57e3644b30ee4e6f4c980be1dadd` |

## Addendum — 최신 두 수정 재검증 및 좁은 잔여 P2

root가 survivor detach/replan과 monotonic acceptReceipt를 구현한 뒤 최신 원본 harness로 재실행했다. `node --test --test-reporter=dot tests/email-delivery.test.mjs tests/email-timing.test.mjs`는 **43개(23 delivery+20 calendar), exit0**이었다. 마지막 세 테스트(늦은 성공, 즉시 survivor 재계획, planning rollback)를 직접 읽었다. 기존 late-failure guard 및 account deletion 후 in-flight 결과가 email row를 재생성하지 않는 테스트도 이 실행에 포함된다. root의 전체183+Home4/TSC 통과는 별도로 전달받은 결과이며 여기서 전체 검사를 중복 실행한 것은 아니다. 아직 배포 전이다.

원래 두 입력을 독립 inline 원본 harness로 재현한 결과:

| 원래 결함 | 최신 실제 결과 | 판정 |
|---|---|---|
| P1 미시도 ChatGPT+Claude에서 Claude 조건 제거 | 같은 dispatch 호출에서 sent1/calls1, 전송 items는 ChatGPT 하나. 원 batch cancelled/attempts0, 새 batch accepted/attempts1, digest outcome은 attempted. | 원래 재현 해결 |
| P2 첫 요청 pause→6분 뒤 새 lease503→첫 요청200+ID | 같은 body/key의 두 요청 뒤 accepted, provider_id=`known-late-success`, accepted_at 보존. 연결 outbox도 sent/동일ID, late.sent1. | 원래 재현 해결 |

### 잔여 P2 — 늦은 성공과 acceptance 저장 실패가 겹치면 fallback에서 known ID를 잃는다

이는 새 범위를 추가한 일반 감사가 아니라 위 P2와 이미 있는 receipt-storage-failure 회귀의 조합이다. `acceptReceipt`가 실패할 때 `attempt`의 catch가 다시 옛 claim token을 요구하는 `finish`로 돌아간다.

재현: 위 늦은 성공 fixture에서 새 lease의503 처리가 끝난 뒤, old200을 풀기 전에 메모리 SQLite에 다음 trigger를 추가한다.

```sql
CREATE TRIGGER fail_acceptance
BEFORE UPDATE OF status ON email_deliveries
WHEN NEW.status='accepted'
BEGIN SELECT RAISE(ABORT,'Controlled acceptance storage failure'); END;
```

old 응답은 유효한 200/id=`known-late-success`다. acceptance UPDATE만 실패하며 needs_review/provider ID 저장은 가능한 상황이다. 그러나 fallback finish의 old token은 현재 claim과 다르므로0행이다. 관찰은 `sent0, status=retryable, provider_id=null, accepted_at=null, attempts=2, error='Email provider HTTP 503'`, 연결 outbox는 failed/provider_id=null이었다. 받은 접수 ID가 저장되지 않고 이전503 상태만 남는다.

최소 수정 제안: **providerId를 실제 알고 있는 성공 응답의 저장 실패 fallback**에도 현재 존재하는 같은 immutable user/id/payload 조건의 단조 known-ID/needs_review 기록을 사용한다. 일반 늦은 실패는 기존 token guard를 유지한다. 이미 accepted인 결과를 내리지 않고, 다른 payload/owner에는 쓰지 않으며, 계정 삭제 후 row를 재생성하지 않는다. 즉 providerId가 없는 단순 실패와 providerId가 있는 접수 기록 실패를 분리하면 된다. 이 잔여 건은 root에 즉시 전달했다.

최신 재검증 스냅샷 SHA256:

| 파일 | SHA256 |
|---|---|
| `lib/email-delivery.ts` | `b3f95f133591c3f55c6887aad5b552a0530fbcdf6381be77fbdbf085dfc4e1f9` |
| `tests/email-delivery.test.mjs` | `d79b35636a2a1157be72b4ab131e19e695af2ae796690f66c8b2ddc6b695a0b3` |
| `lib/notifications.ts` | `6a51d9d45397d9a890025550f025db24a5e047e6c78e12329520dc3f8b654017` |
| `lib/email-status.ts` | `f2be656298e7216f4379a47afeaf900946337276089ceb14a46b4da383d96f91` |

이 addendum 시점의 남은 재현 결함은 위 좁은 P2 한 건이다. 실제 provider 발송·스케줄러·브라우저 검증 완료나 고정 게이트 PASS를 주장하지 않는다.

## Final addendum — retainKnownReceipt 최종 재검증

root가 잔여 조합을 24번째 이메일 회귀로 추가하고 `retainKnownReceipt`를 구현한 뒤, 해당 함수·호출 분기·새 테스트를 읽고 **24개 이메일 검사, exit0**을 독립 확인했다. 이번 수정은 시간 계산을 바꾸지 않으므로 이미 통과한 calendar/전체 Site 검사로 범위를 확대하지 않았다.

이전과 같은 원본 harness 재현을 두 항목(ChatGPT+Claude)으로 별도 실행했다: 첫 mock 요청 pause →6분 뒤 새 lease503 → accepted UPDATE에만 SQLite 실패 trigger →첫 요청200/known ID →다음날 generate/dispatch.

```json
{"status":"needs_review","provider_id":"known-late-success","accepted_at":null,"attempts":2,"next_attempt_at":null,"error":"Acceptance receipt could not be committed"}
```

두 outbox 항목도 모두 needs_review/동일 provider ID였다. 기존 body/key는 같고, 다음날에도 provider 요청 총2회·delivery 총1개를 유지했다. 새 identity로 다시 보내지 않았다. **마지막 잔여 P2의 실제 재현이 해결됐다.**

소스에서 `retainKnownReceipt`는 현재 존재하는 같은 id/user/payload이며 first_attempt_at이 있는 행만 UPDATE한다. already accepted를 내리지 않고 provider ID는 COALESCE로 보존한다. 연결 outbox도 대응하는 needs_review/known-ID parent가 있어야 바뀐다. INSERT가 없어 계정 삭제 후 row를 재생성하지 않는다. providerId가 없는 일반 실패는 기존 token 기반 finish를 계속 사용한다. 늦은 실패 보호와 in-flight 계정 삭제 테스트도 이번 24개 실행에 포함된다.

최종 검토 SHA256:

| 파일 | SHA256 |
|---|---|
| `lib/email-delivery.ts` | `2c5f3fd5e50c7a2c1f0bc468f4272cf9aeb77aad4f7245d3c3077270cb639bb6` |
| `tests/email-delivery.test.mjs` | `111884248294eb6576f5671e7ace377c0a5e5c860ba299b34266f3b4f0bd6727` |

**이 bounded dispatch 검토에서 재현한 P1/P2 및 조합 잔여 P2는 모두 해결됐고, 이 최종 변경에서 추가 중대 결함은 발견하지 못했다.** 이는 검토한 source/harness 경계의 판정이며 배포·실제 provider 전달·무인 scheduler·전체 UI/고정 게이트의 완료 판정이 아니다. root가 진행 중인 브라우저와 빌드/배포 검증을 대신하지 않는다.
