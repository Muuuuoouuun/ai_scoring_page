# V15 원문 대비 알림 후보 RED

2026-09-12. Parent가 지정한 baseline `a0d353c`의 현재 파일을 읽고, [원문](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-cancellation-promotion-alerts-design.md:86)의 86–106행 및 필요한 65–74/119–123행으로 기대를 먼저 정했다. Git/Sites/브라우저/네트워크/실이메일/checkout 수정은 하지 않았다. 생성물은 이 보고서와 [재현 테스트](/private/tmp/ais-v15-notice-red.test.mjs)뿐이다.

**최종 실행 11개: RED 8개, 대조 1개, 미확정 정책 관찰 2개.** Node test 집계는 fail 8 / pass 3 / skipped 0, 프로세스 종료 1이다. 마지막 실행은 `2026-09-12T14:37:17.445Z`; 첫 실행 `14:35:53.082Z`의 8개 RED 기대값도 그대로 유지했다. 추가 실행은 원문이 미정인 시간대 경계를 더 정확히 관찰하기 위한 것이며 실패 기대를 결과에 맞춰 바꾸지 않았다.

## 사전에 정한 요구와 실제 결과

| 사례·근거 | 사전 기대 | 실제 소스/harness 결과 |
|---|---|---|
| 확인일만 갱신, 원문92 | 동일 행사·고객·중요 버전이므로 이미 보낸 동일 내용의 추가 전달 0회 | 동일 synthetic 행사에서 key가 `promotion:local-promotion-repro:2026-09-12`→`…:2026-09-13`으로 바뀌고 provider mock 총 **1→2회**. 두 번째 처리 `{sent:1}`. |
| 같은 확인일에 고객에게 적용되는 가격 정정, 원문92/96 | 원 카드가 정정을 보여야 하고, 동의·자격·시간 조건이 유지된 열린 matched 창에서는 새 정정 후보를 처리할 수 있어야 함 | `KRW 20000`→`KRW 10000`으로 summary/조건을 정정했으나 key 동일. currentNotices의 계산 body만 새 문구, 저장 notifications body는 **옛 20000 문구**. provider 총 1회 유지, 두 번째 `{sent:0}`. 사전 설정은 matched/UTC/00:00, 두 호출은 같은 날 10시·11시여서 digest/쿼터 제한으로 인한 0건이 아니다. |
| queued 뒤 status=ended, 원문86/94/104 | 종료 행사는 외부 payload에 포함되지 않아야 함 | 후보 `emailAllowed:true`, 해당 행사 포함 provider 요청 **1회**. |
| queued 뒤 status=withdrawn, 원문86/94/104 | 철회 행사는 외부 payload에 포함되지 않아야 함 | 후보 `emailAllowed:true`, 해당 행사 포함 provider 요청 **1회**. |
| 확인된 절대 종료 시각 경과, 원문94/104/122 | `2026-09-12T10:00:01Z` 종료 이후 `10:00:02Z`에는 queued 행사를 보내지 않아야 함 | 해당 행사 포함 provider 요청 **1회**. 경계의 포함/제외 논쟁을 피하고 종료 1초 이후를 사용했다. |
| 저장된 maxPrice=10000 KRW, 월 환산 가격/세금 미확인, 원문70/94/105/121 | 명시 가격 조건을 확인하지 못했으므로 조건 충족 행사 이메일로 보내지 않아야 함. 일반 앱 조건부 정보는 허용 가능 | API 저장 maxPrice/currency를 먼저 확인했지만 후보 `emailAllowed:true`, 행사 이메일 **1회**. 가격이 얼마라고 계산하거나 절감액을 임의 가정하지 않았다. |
| 선택 필요 기능 저장, 원문70/105 | 선택 조건을 서버에 명시적으로 저장할 수 있어야 함 | 제안 fixture 필드 `neededFeatures:['offline-document-editing']`가 actual 설정 API를 거치면 **저장되지 않음**. 현 schema에 이 필드가 없는 범위 누락이며, 기존에 지원된 필드의 회귀라는 주장은 아니다. |
| 대체재 필요 기능 미확인, 원문65/68/94/121 | 동일 업무만 겹치고 필요한 offline 기능 근거가 없는 대체재는 조건 충족 행사로 보내지 않아야 함 | raw 메모리 설정에 필요 기능을 넣고, 후보 도구는 동일 useCase + online 기능 근거만 둠. ‘활용 업무가 겹치는 대안’/`emailAllowed:true`로 행사 이메일 **1회**. raw fixture는 조건 predicate를 분리한 시험이며 현재 UI/API로 이 조건을 저장할 수 있다는 증거가 아니다. |

provider 요청은 행사 고유 시험 제목 `LOCAL TEST PROMOTION`이 payload에 포함됐는지로 센다. 다른 일반 도구 업데이트가 같이 처리되어도 이를 행사 전송 실패/성공으로 섞지 않았다. 모든 provider 응답은 메모리 `Response.json({id:'local-provider-…'})`이며 실제 제공자 접수/수신 증거가 아니다.

대조군은 **변경 없는 accepted 행사 다음 날 재처리 총 1회 유지**, **명시 ineligible 행사 provider 0회**였다. 따라서 모든 기존 중복/자격 보호가 없다는 결론은 아니다. 결함은 확인일과 중요한 변경의 식별, 별도 유효성/조건이 후보 자격에 반영되지 않는 경로다.

## 날짜만 있고 시간대가 미확인인 경우: 정책 관찰로 분리

`expiresAt:'2026-09-12'`, `expiresTimeZone:null`, 지역도 미확인인 동일 fixture를 사용했다.

- `2026-09-12T14:59:59.999Z`: 후보 존재, `emailAllowed:true`. body에는 등록 마감 날짜만 있고 시간대 미확인 안내는 없다.
- `2026-09-12T15:00:00.000Z`: 후보 0개. 데이터나 설정은 바뀌지 않았다.
- 최초 UTC 자정 전후 probe(`23:59:59.999Z`→다음 날 `00:00Z`)에서는 양쪽 모두 이미 제외였다. 이어 [billing.ts:20](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:20)의 `today()`가 **Asia/Seoul 고정**임을 확인하고 서울 자정 경계를 추가 관찰했다. 최초 테스트 이름의 UTC ‘전환’ 단정은 중립적인 ‘관찰’로 바로잡았으며, 해당 테스트에 제품 PASS/FAIL 기대를 새로 넣지 않았다.

원문74/82/104는 마감 시각·시간대·미확인 표시와 근거 없는 임박/카운트다운 금지를 요구하지만, 시간대 미확인 날짜를 어떤 보수적 cutoff로 다룰지까지 정하지는 않는다. 따라서 **서울 자정이 공식 종료라는 근거는 없다는 관찰**과 **새 cutoff 정책 결정**을 구분한다. 이 fixture의 2개 pass는 불확실성 입력을 보존했다는 관찰 시험일 뿐, 제품 마감 처리가 옳다는 PASS가 아니다.

절대 마감 RED의 `expiresAt` ISO instant와 필요 기능 RED의 `neededFeatures`는 원문이 정하지 않은 **데이터 표현 선택**이다. 향후 명시적 `deadlineAt`/조건 객체 등 다른 표현으로 바뀌면 fixture의 입력 adapter는 옮길 수 있지만, ‘확인된 절대 마감 이후 중단’과 ‘필요 기능 미확인을 충족으로 취급하지 않음’이라는 사전 의미 기대는 유지해야 한다. 현재 공식 promotion JSON은 date-only 구조이므로 이 시험을 실재 행사의 정확한 종료 시각을 검증한 것으로 서술하면 안 된다.

## 원인 위치와 전달 단계의 한계

- [notice-candidates.ts:13](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts:13): 일반 update도 publishedAt 또는 checkedAt로 key를 만든다. 이번 실제 전송 RED는 promotion 중심이며 일반 update의 모든 변형을 실행 검증했다고 확대하지 않는다.
- [notice-candidates.ts:16](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts:16): promotion 유효성은 `expiresAt < today()`와 고객의 ineligible만 검사한다. status·absolute instant·expiresTimeZone을 사용하지 않는다.
- [notice-candidates.ts:18](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts:18): 대체재는 useCases 한 개라도 겹치면 연결한다. 선택 필요 기능/가격 조건은 검사하지 않는다.
- [notice-candidates.ts:19](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts:19): promotion key는 checkedAt이고 emailAllowed는 고객 자격 입력 eligible 여부만으로 정한다. maxPrice는 NoticeSettings 타입에는 있으나 후보 결정에서 사용되지 않는다.
- [notifications.ts:11](/Users/bigmac_moon/dev/ai_score/site/lib/notifications.ts:11): `INSERT OR IGNORE`여서 같은 key의 저장 카드 body는 새 후보 내용으로 갱신되지 않는다.
- [email-delivery.ts:43](/Users/bigmac_moon/dev/ai_score/site/lib/email-delivery.ts:43): 매번 currentNotices를 다시 읽지만 최종 의미 검사는 emailAllowed key 집합에 의존한다. 후보가 status/조건 변화를 반영하지 않거나 key가 의미를 식별하지 않으면 V14의 안전한 claim·불변 batch만으로 이 후보 오류가 없어지지는 않는다.

## 실행 방식·증거 보존

재실행은 `node --test --test-reporter=tap /private/tmp/ais-v15-notice-red.test.mjs`다. 각 test는 기대를 assertion으로 먼저 고정하고, 원인 판단에 필요한 실제 key/body/횟수를 diagnostic으로 출력한다. 실제 소스 JSON은 읽어 복제한 뒤 메모리 배열만 수정했다. 원본 harness는 test 프로세스의 data URL 모듈에서 **root 경로 고정 + JSON 객체 주입 seam** 두 부분만 바꾸었고, actual 앱 TS 모듈과 SQL migration은 그대로 읽었다. `fetch`는 URL을 검사하고 모의 Response만 반환한다. 기본 transport는 TEST_ONLY이고 메모리 DB 밖에 데이터를 쓰지 않는다.

두 실행의 baseline SHA-256은 동일했다:

```text
notice-candidates.ts 97f4b46a8485df0dcd48f692fc65158ea7646f35e2eb179bfd601276c93b6152
notifications.ts    6a51d9d45397d9a890025550f025db24a5e047e6c78e12329520dc3f8b654017
email-delivery.ts   2c5f3fd5e50c7a2c1f0bc468f4272cf9aeb77aad4f7245d3c3077270cb639bb6
api-harness.mjs     41b2d82b1cdafc2847668b134825820f6bc4f437a2f7ce8590b253e6d0b4d1f7
promotions.json     17fbad5f7d4490ab360d50e1251f7d177d46c78b739c3c82ceac054d889cc27c
catalog.json        6582363e298f29c7189190ab768a8d9edd88c5e47ab42fd6c6a0b5d4571cdee5
```

정책 선택으로 남는 것은 의미 변경 버전의 저장 형식·검수 절차, 날짜/시간대 불명 마감의 보수적 처리, 기능·가격 조건의 입력/근거 구조다. 이번 RED의 의미 기대는 이 선택들과 구분해 보존했다. 원문이 정하지 않은 feature key 명칭이나 날짜 필드 형식을 그대로 강제해 구현을 채점해서는 안 된다.
