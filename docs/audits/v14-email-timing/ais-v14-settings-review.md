# V14 settings 단계 독립 검토 — 2026-09-12

범위: 현재 `lib/workspace-settings.ts`, workspace route, validation, API harness, `tests/email-delivery.test.mjs`와 연결된 hide 경로. Site·운영·배포·Git을 수정하지 않았으며 네트워크 발송은 하지 않았다. 실제 Site API를 메모리 SQLite/실제 마이그레이션과 네트워크 금지 harness에서 실행했다.

root의 명시된 정책을 기준으로 삼았다: 빈 digest도 당일 평가 슬롯 종료, matched는 UI에 명시한 rolling 24h 3-batch 제한 및 지정 시간 이후 처리, 최초/미소비 설정 변경의 지난 due는 첫 refresh catch-up. 이전 검토의 다른 제안(T04 오후 발송 등)을 이번 구현의 요구로 적용하지 않았다. timing/delivery 본체는 root가 병행 구현 중이며 이 보고서는 settings 단계의 실제 결함에 한정한다.

## 발견한 실제 결함

### P1 — hide가 revision을 갱신하지 않아 동시 설정 저장이 숨김을 소실시킨다

근거: `lib/workspace-settings.ts:11,14–15,40,44`, `app/api/notifications/route.ts:19–23`.

settings는 SELECT 시점의 hiddenTopics를 새 payload에 복사하고 emailRevision으로 CAS한다. 현재 hide는 hiddenTopics/updated_at만 갱신하며 emailRevision은 그대로다. 따라서 hide가 성공했더라도 먼저 읽어 둔 settings save를 CAS가 걸러내지 못한다.

실제 재현 순서:

1. alpha의 설정을 `email=true, interests=['chatgpt']`로 저장하고 실제 generateNotifications로 알림 한 건을 만든다.
2. 이름만 바꾸는 settings POST를 시작한다. 실제 `SELECT id,payload,updated_at FROM private_records...` 결과를 얻은 직후, 호출자에게 돌려주기 전에 deferred barrier로 멈춘다.
3. 실제 notifications POST의 `hide`를 실행한다.
4. settings SELECT를 재개해 저장을 끝낸다.

관찰 출력:

```json
{"hideStatus":200,"hiddenBeforeSave":["update:chatgpt"],"hideChangedRevision":false,"saveStatus":200,"hiddenAfterSave":[]}
```

사용자의 숨김이 지워져 앱 알림/메일 후보가 다시 나타날 수 있다. 기대 결과는 save 409와 숨김 보존, 또는 현재 DB hiddenTopics를 명시적 restore만 반영해 보존한 save 200이다.

최소 수정: hide의 같은 DB UPDATE에서 새로운 서버 emailRevision도 저장하고, 관련 대기 취소/향후 prepared invalidation을 같은 transaction에 넣는다. 그러면 기존 settings CAS가 오래된 snapshot을 409로 거절한다. revision으로 발송을 보호할 예정이므로 SQL hiddenTopics 병합만 하는 것보다 hide도 revision을 올리는 방식이 일관된다. 새 테스트는 hide가 settings snapshot 이후/쓰기 이전에 커밋되도록 실제 경합을 만들어야 한다.

### P2 — `ifAbsent` no-op이 불필요한 revision 충돌로 기존값을 반환하지 못한다

근거: `lib/workspace-settings.ts:15,25–27`.

이미 설정이 있을 때 유효한 `{action:'save',kind:'settings',ifAbsent:true,payload:...}`를 revision 없이 보내면 현재 409다. existing record를 반환하는 27줄보다 revision 검사가 먼저 실행된다. 기존 route의 ifAbsent는 기록을 덮어쓰지 않고 200/alreadyExists를 반환하는 계약이었다.

실제 관찰:

```json
{"case":"ifAbsent existing record without revision","status":409,"emailPreserved":true}
```

데이터를 덮지는 않지만 read/no-op 성격의 기존 API 사용이 막힌다. 기대는 `200, alreadyExists:true`, 기존 record/revision/queue 무변경이다. 최소 수정은 사용자/명시 ID 소유권과 기존 payload 유효성 처리를 유지한 채 기존값 반환 분기를 mutation revision 검사보다 먼저 처리하는 것. delete나 실제 overwrite의 revision 검사는 그대로 필요하다. 이번 검토에서는 settings ifAbsent를 호출하는 현재 화면은 확인하지 않았으므로 전체 UI 장애라고 확대하지 않는다.

## 통과한 실행 검증

`node --test tests/email-delivery.test.mjs tests/api.test.mjs`를 실행해 **28/28 PASS, exit 0**을 확인했다. 기존 API 24개 + settings 신규 4개다. 신규 테스트는 모드/zone/time 저장, 잘못된 입력 거절, alpha optout의 즉시 취소 및 beta 보존, 취소 SQL 실패 시 settings rollback을 다룬다.

추가로 Site 소스를 바꾸지 않은 inline 실행에서 다음을 확인했다.

- optout 성공 후 이전 revision으로 email=true 저장: 409, 최종 email=false 유지.
- alpha ID/revision을 beta가 보내기: 404, alpha 불변, beta 설정 생성 0건.
- legacy email=true/no-timing/no-revision 저장: 200, email=true 유지, 기존 hiddenTopics 유지, 기본 표시 시간 09:00과 `emailTimingConfirmed=false`. payload에 임의 `emailTimingConfirmed:true`를 넣어도 미확인 상태를 승격하지 않는다.
- 실제 두 settings 저장을 교차시켜 새 revision의 승자가 커밋된 뒤 stale optout 재개: stale 409, 승자의 email=true 및 queued outbox 유지. CAS 0행 후 뒤 취소 SQL이 잘못 실행되지 않는다.
- settings DELETE 이전에 다른 save가 승리: DELETE 409, 승자 record와 queued outbox 유지.
- settings DELETE에 SQLite trigger로 실패 주입: DELETE 앞에서 수행한 outbox 취소도 rollback되어 설정/queue가 모두 유지된다. 검사의 `AIs request failed unknown` 한 줄은 이 의도된 로컬 SQL 실패의 API 로그이지 운영 오류 관측이 아니다.

일반 settings CAS와 D1.batch의 실패 rollback 및 owner 조건에서는 추가 실제 결함을 발견하지 못했다. 다만 P1처럼 settings를 변경하는 모든 경로가 같은 revision 계약을 따라야 한다.

## 기존 테스트가 이 결함을 놓친 이유·남겨둔 경계

`tests/api-harness.mjs`의 `h.save('settings',...)`는 매 호출 직전 GET으로 최신 revision을 자동 첨부한다. 편리한 정상 경로지만 stale revision/ifAbsent/no-revision을 검증하지 않는다. 관련 회귀는 위처럼 `h.call(workspace.POST, body)`로 명시한 revision을 고정해야 한다. 기존 hiddenTopics 테스트는 hide를 끝낸 뒤 settings가 다시 SELECT하므로 P1의 동시 snapshot 경합을 만들지 않는다.

현재 UI의 expectedSettingsRevision 전달, 새 delivery/dispatch-state 테이블 취소·내보내기·전체 삭제, timing 정책, immutable provider retry는 다음 단계의 대상이다. 이 보고서의 PASS를 해당 미완성 경로의 완료 증거로 사용하지 않는다. 운영 scheduler/Resend/실제 receipt와 원문 umbrella 요구는 계속 미완료다.

## 재현 당시 파일 SHA256

기준 디렉터리 `/Users/bigmac_moon/dev/ai_score/site/`.

| 파일 | SHA256 |
|---|---|
| `lib/workspace-settings.ts` | `6776839d046df53459cdfb3c4b31b3339a5bb61984fdc17643a97265039edfda` |
| `app/api/workspace/route.ts` | `447b933605516fd9d4d972cce3bcb0279e71ac31f02d60d56edb26ffe83ebabd` |
| `app/api/notifications/route.ts` | `92a9f903bc78c69680578348e9e552e8060f0340e347106fd8e07a66c54d7735` |
| `lib/validation.ts` | `c74327b404c3b5bfe13aca44fcf43b490a26e555a1439583d0241beff9b59583` |
| `tests/api-harness.mjs` | `41b2d82b1cdafc2847668b134825820f6bc4f437a2f7ce8590b253e6d0b4d1f7` |
| `tests/email-delivery.test.mjs` | `d2140dae522bc5d29207db9012d47a946d676059f10ec880246e9715caaea88c` |
