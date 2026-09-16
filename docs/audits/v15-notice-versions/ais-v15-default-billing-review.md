# V15 기본 설정 없는 결제 알림 추가 검토

2026-09-13 Asia/Seoul. `/Users/bigmac_moon/dev/ai_score/site` 읽기 전용. root가 수정한 `lib/notifications.ts`, `lib/notice-candidates.ts`와 마지막 2개 회귀에 한정했다. 기존 `/private/tmp/ais-v15-code-review.md` 및 8/8 검토는 덮어쓰지 않았다.

**결론: 이 기본 결제 알림 경로에서 개인 삭제·동의·소유권을 해치는 새 결함을 발견하지 않았다. root의 관련 2사례와 독립 추가 4사례 모두 실제 통과했다.** 전체 233 테스트 통과는 root 보고이며, 이 추가 검토가 그 전체를 독립 재실행한 것은 아니다. Site/운영/Git/브라우저/배포/점수는 변경하지 않았다.

## 코드에서 확인한 보호

- `notice-candidates.ts:13–15,67`: personalRecord는 user_id로 제한해 읽은 실제 구독 행의 id와 원시 payload다. 요청자가 전달하는 새 개인 권한 토큰이 아니다. 기본 동작은 inApp=true/email=false이며 관심 서비스는 빈 배열이다.
- `notifications.ts:10–13`: 설정이 없으면 personalRecord가 있는 billing 후보만 생성 가능하다. commit 때 여전히 preferences 설정이 없고, 같은 user_id/id/kind='subscription' 및 **동일 원시 payload**가 실제 존재해야 한다. 소유 구독 삭제·수정이나 뒤늦은 설정 생성은 오래된 생성 작업을 차단한다.
- `notifications.ts:19–22`: version INSERT와 카드 INSERT/UPDATE 각각 같은 설정/소유 구독/카드 CAS 조건을 적용한다. 앞 SQL이 0행인 경우를 성공한 권한으로 간주하지 않는다. 실제 SQL 오류는 D1 batch에 대응하는 하네스 SQLite 트랜잭션으로 rollback된다.
- `notice-candidates.ts:21,67`: billing은 registerSource를 호출하지 않으며 앱 전용 hold가 있다. `notifications.ts:26–31`의 이메일 조건을 통과하지 않으므로 fallback이 이메일 동의를 만들지 않는다. personalRecord의 전체 payload는 notification metadata/API 본문에 그대로 직렬화되지 않는다.
- 설정이 존재하는 기존 경로는 settings id/user/revision guard를 유지하며, billing에는 실제 소유 구독/payload guard가 추가 적용된다.

## 실제 실행

| 검사 | 관찰 결과 |
|---|---|
| root: 설정 없이 저장한 다음 결제 | 카드 생성1, GET1, 공유 billing source head0 |
| root: 생성 batch 직전 일시정지 → 전체 개인 기록 삭제 → 재개 | created0, private_records/cards/notifications0, 공유 billing head0 |
| 독립: alpha 소유 구독, 설정 없음; beta 및 alpha 두 번 생성 | beta0, alpha1→0, alpha 카드1/beta0; email_outbox/deliveries0; beta GET0; 공유 billing head0 |
| 독립: 설정 없음으로 읽은 생성 작업 pause → inApp=false/email=false 설정 저장 → 재개 | 옛 생성0, version/card0; 다음 생성도0, email_outbox0 |
| 독립: 생성 pause → 실제 workspace API로 소유 구독 이름/payload 수정 → 재개 | 옛 생성0, version/card0; 새 생성1, GET에는 새 이름 |
| 독립: notification_cards INSERT에서 실제 SQLite ABORT | notification version/card/outbox 전부0으로 rollback; trigger 제거 후 정상 생성1 |

명령/원본:

- 독립 스크립트: `/private/tmp/ais-v15-default-billing-cases.mjs`
- `node --test /private/tmp/ais-v15-default-billing-cases.mjs` → **4 PASS, 0 FAIL, exit0**; 출력 `/private/tmp/ais-v15-default-billing-cases.out`
- Site cwd에서 `node --test --test-name-pattern='saved upcoming bill|default billing generator' tests/notice-versions.test.mjs` → **2 PASS, 0 FAIL, exit0**; 출력 `/private/tmp/ais-v15-default-billing-root-tests.out`

실제 Site 소스를 VM으로 로드하고 실제 migration을 메모리 SQLite에 적용했다. 네트워크 발송은 허용하지 않았으며 테스트 시각은 고정값이다. 이 추가 검토는 실제 운영 알림 생성, 이메일 수신, 전체 성능/접근성/제품 완료의 증거가 아니다.

## 검토 파일 SHA-256

- `lib/notifications.ts`: `13e62a4a40f82d91f83c2d182446a20b0685e000ec3032b39632013e4fb32a26`
- `lib/notice-candidates.ts`: `855d6c789c89473223a1c5b17596efe26c40a37ca77e207c90c739d6c5c22a57`
- `tests/notice-versions.test.mjs`: `fe822ddc8e968496a83e74cfcdf1182fcdbaea00ee4f88b105e0f897388f8576`
