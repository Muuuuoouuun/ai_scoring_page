# V14 순수 이메일 달력 함수 독립 검토

검토 시각: 2026-09-12T13:56:17Z, Asia/Seoul 22:56. Site 소스·테스트는 읽기만 했으며 이 보고서만 작성했다. 실제 브라우저·배포·외부 이메일·운영 데이터는 사용하거나 변경하지 않았다. 테스트의 SQLite는 기존 harness의 메모리 DB였다.

## 결론

**고정된 현대 날짜·2011 Apia 사례 범위에서 재현된 역변환, DST, 날짜선 이동, 미래 digest guard 결함은 없다.** 기존 시간 테스트를 독립 재실행하여 **20/20 통과**했다. 별도로 기대값을 지정한 경계 **10/10**과, 구현의 오프셋 샘플링을 사용하지 않는 순방향 Intl 기준 계산 **10/10**이 일치했다. 이 세 묶음은 중복 사례가 있으므로 “고정 38개 전체 통과”나 “독립 40개 사례 통과”로 합산하지 않는다.

순수 함수가 제공하는 것은 **특정 시점에 처리 가능한지와 슬롯의 날짜·예정 시점 계산**이다. 실제 가드의 영속 보존, 빈 요약 완료 처리, matched의 rolling 24시간 상한, 일괄 발송과 중복 방지, legacy 시간 확인 보류는 발송 파이프라인 검증이 별도로 필요하다. 실제 무방문 실행·이메일 전달·게이트 완료의 증거가 아니다.

## 검토한 스냅샷

| 파일 | SHA-256 |
|---|---|
| [email-timing.ts](/Users/bigmac_moon/dev/ai_score/site/lib/email-timing.ts) | `c3201d0d00820de1f98a494af70a6c434c1006a967aa87c21a11de4b86fbd9ff` |
| [email-timing.test.mjs](/Users/bigmac_moon/dev/ai_score/site/tests/email-timing.test.mjs) | `1f3cbd673216fef185f0f24c813ffed10b81b339c0fce940c345802a6f7f5520` |
| [workspace-settings.ts](/Users/bigmac_moon/dev/ai_score/site/lib/workspace-settings.ts) | `6776839d046df53459cdfb3c4b31b3339a5bb61984fdc17643a97265039edfda` |
| [고정 38개 필수 벡터·비채택 2개](/private/tmp/ais-v14-timing-cases.md) | `d0701b9e1e32674a9aa927bf94626c5a30129d84feef8dd6a01ea05acc9709a7` |

정책 매핑은 문서의 `daily`→코드 `digest`, `condition`→코드 `matched`다. root의 최종 선택을 적용했다: 최초/미소비 당일 catch-up 허용, 소비한 digest의 옛 zone/time 다음날 guard 보존, 빈 digest도 평가 완료, rolling24h3은 matched에만 적용하되 과거 모든 mode의 시도 건을 계산. 비채택 미래-only E01/E05는 실패 분모에서 제외한다.

## 소스 관찰

1. [emailSchedule:14](/Users/bigmac_moon/dev/ai_score/site/lib/email-timing.ts:14)는 모드와 HH:mm을 검증하고 명시적 명명 시간대를 Intl로 확인한다. 형식은 Gregorian·Latin 숫자·h23으로 고정되어 호스트 현지 표시 문자열의 재파싱을 피한다. `emailLocalParts`는 사용자 날짜를 명시한 시간대에서 구하므로 UTC 일자 자르기를 사용하지 않는다.
2. [emailDueOnDate:30](/Users/bigmac_moon/dev/ai_score/site/lib/email-timing.ts:30)는 nominal UTC의 ±48시간을 12시간 간격으로 보아 오프셋 후보를 만들고, 각 역변환을 다시 실제 현지 날짜·시각·초와 대조한다. 정렬한 정확 일치 중 이른 값을 택하므로 fold의 첫 시각을 고른다. 정상/반복 시각마다 수천 분을 탐색하는 구조는 아니다.
3. 정확 일치가 없는 경우에만 후보 UTC 구간에서 분 단위로 검사한다. 고정 gap 및 추가 Havana 자정 gap·Chatham 전환에서 해당 날짜의 첫 유효 분을 반환했다. Apia의 사라진 날짜는 `null`, 다음 실제 날짜의 due는 정상 반환했다. 이는 모든 역사적 IANA 전환을 전수 증명한 것은 아니다.
4. [emailWindow:51](/Users/bigmac_moon/dev/ai_score/site/lib/email-timing.ts:51)는 오늘 현지 날짜와 canonical due를 비교한다. 따라서 fold 때 현재 벽시계가 01:05로 돌아와도 이미 첫 01:30을 지났으면 창이 열려 있다. 소비한 digest guard를 주면 그다음 가능한 날짜로 넘어가며, matched는 이 digest 전용 guard를 무시한다.
5. 미래 guard가 오늘보다 멀면 먼저 guard의 현지 날짜로 이동한다. 그래서 다음 날짜를 찾는 8회 반복 한도가 있다고 해서 일주일 이상 먼 guard가 실패하지는 않는다. 2026년9월에서 2027년12월까지의 guard를 직접 확인했다.
6. 다음 digest guard는 현재 슬롯의 **다음 현지 날짜**에서 구한다. 실제 경과 23시간/25시간인 DST 경계를 모두 통과했고, Apia의 사라진 날짜도 건너뛰었다. 단순 `due+24h` 방식이 아니다.

## 기존 20개 검사 재실행

실행: `/Users/bigmac_moon/dev/ai_score/site`에서 아래 명령. 결과는 tests20 / pass20 / fail0 / skipped0 / cancelled0이었다.

```sh
node --test tests/email-timing.test.mjs
```

기존 검사에는 고정 T01–T12의 핵심 입력·due·가시적 창, M05/M09/M10의 달력 결과, E03/E04/E08/E09의 미래 guard, E10/E11 catch-up이 포함되어 있다. 하나의 test 안에서 여러 벡터/속성을 확인하므로 test20과 벡터38은 다른 분모다. 테스트 실행의 소요시간을 사이트 성능이나 예정 발송의 정확도 수치로 사용하지 않는다.

## 추가 경계 직접 호출 — 10/10 통과

Node의 TypeScript 직접 로딩으로 실제 `site/lib/email-timing.ts`를 읽었다. 고정 시점은 모두 명시적 UTC instant이며 결과의 `localDate`, `eligible`, `nextEligibleAt`, 필요한 `nextDigestNotBefore`를 사전에 지정한 값과 비교했다. 각 행은 state 저장을 수행한 결과가 아닌 순수 함수 결과다.

| ID | 입력 | 관측 결과·사전 기대 일치 |
|---|---|---|
| S01 | UTC00:00, now=`2026-09-12T00:00Z` | eligible=true, nextEligible=12일00:00Z, nextDigest=13일00:00Z |
| S02 | Seoul23:59, now=12일14:58:59Z | eligible=false, nextEligible=12일14:59Z |
| S03 | Seoul23:59, now=12일15:00Z=13일00:00 현지 | localDate=13일, eligible=false, nextEligible=13일14:59Z. 이전 일자를 재평가하지 않음 |
| S04 | Seoul09:00, now=2026-09-12T01:00Z, guard=`2027-12-15T00:00Z` | localDate=2027-12-15, eligible=false, nextEligible=guard, nextDigest=2027-12-16T00:00Z |
| S05 | Seoul08:00, now=13일00:00Z, guard=동일 instant | eligible=true, nextEligible=13일00:00Z, nextDigest=13일23:00Z. 경계의 `>=` 처리 확인 |
| S06 | matched Seoul09:00, now=12일01:00Z, digest guard=2027-12-15 | eligible=true, nextEligible=12일00:00Z. matched가 digest guard를 잘못 상속하지 않음 |
| S07 | Apia09:00, now=`2011-12-29T19:00Z` | localDate=29일, eligible=true, nextDigest=`2011-12-30T19:00Z`=31일09:00 현지 |
| S08 | matched Seoul14:00, now=12일01:00Z | eligible=false, nextEligible=12일05:00Z. 새 수신 시작 시각을 실제 결정에 반영 |
| S09 | New York01:30, now=`2026-11-01T06:30Z`, consumed guard=`2026-11-02T06:30Z` | eligible=false, localDate=11월2일, nextEligible=guard. fold 두 번째 발생에 재슬롯 없음 |
| S10 | Kiritimati15:00, now=13일01:00Z, old guard=13일00:00Z | eligible=true, nextEligible=13일01:00Z, nextDigest=14일01:00Z. 날짜선 이동 뒤 실제 가드가 지난 경계 확인 |

## 역변환의 독립 순방향 기준 비교 — 10/10 일치

기준 계산은 구현의 오프셋 샘플을 재사용하지 않았다. 해당 날짜의 nominal UTC00:00을 중심으로 −36h부터 +60h까지 UTC 분들을 열거하고, 각 instant를 Intl로 현지 표시했다. 날짜가 같고 목표 HH:mm 이상인 것 중 가장 작은 현지 분을 고르고 동률이면 이른 UTC를 유지했다. 정확한 시각·fold·gap·사라진 날짜를 동일 정의로 확인한다. 구현과 **같은 런타임의 시간대 데이터**를 사용하므로 tzdb 자체의 정확도를 독립 검증한 것은 아니다. 이 열거 방식은 검증 oracle이며 운영 매 사용자 처리 방식으로 제안하지 않는다.

| 시간대 | 현지 날짜·시각 | 실제 함수 = 기준 결과 |
|---|---|---|
| America/New_York | 2026-03-08 02:30 | 2026-03-08T07:00:00Z |
| America/New_York | 2026-11-01 01:30 | 2026-11-01T05:30:00Z |
| Australia/Lord_Howe | 2026-10-04 02:15 | 2026-10-03T15:30:00Z |
| Australia/Lord_Howe | 2026-04-05 01:45 | 2026-04-04T14:45:00Z |
| Pacific/Apia | 2011-12-30 09:00 | null |
| Pacific/Kiritimati | 2026-09-12 09:00 | 2026-09-11T19:00:00Z |
| Pacific/Pago_Pago | 2026-09-12 09:00 | 2026-09-12T20:00:00Z |
| Asia/Kathmandu | 2026-09-12 09:00 | 2026-09-12T03:15:00Z |
| America/Havana | 2026-03-08 00:30 | 2026-03-08T05:00:00Z |
| Pacific/Chatham | 2026-09-27 03:00 | 2026-09-26T14:00:00Z |

런타임은 Node24.18.0, ICU78.3, tz2026a였다. 데이터 버전이 다른 배포 환경이나 시간대 규칙 변경 이후에도 같은 결과라고 미리 보증하지 않는다. 실제 배포 런타임의 대표 벡터 확인은 별도다.

## 통합에서 남은 검증 — 순수 함수의 결함과 구분

| 중요도·영역 | 순수 함수에서 확인한 것 | 발송 파이프라인에서 추가로 입증할 것 |
|---|---|---|
| P1, 소비한 digest guard | 전달받은 옛 guard보다 앞서 열지 않음 | 성공/빈 평가 때만 guard를 영속 저장하고 시간대·시각·모드·동의 변경, no-op 저장, 새로고침으로 초기화하지 않음. 미래 미소비 슬롯의 반환 guard를 미리 저장하지 않음 |
| P1, 빈 슬롯·묶음 | due 이후 eligibility 계산 | M02/M03/M04/M06의 한 통 묶음, 빈 평가 완료, 늦게 도착한 후보의 다음 슬롯 처리. 이 함수는 DB 상태를 갖지 않아 스스로 처리하지 않음 |
| P1, matched 상한 | matched에 digest guard를 적용하지 않음 | M07/E07/I05에서 과거 **모든 mode**의 attempted/accepted/불확실 batch를 rolling24h로 계산하고 마지막 자리를 원자적으로 예약. daily에는 별도 rolling3을 강제하지 않음 |
| P1, legacy 명시 확인 | `emailSchedule({})`는 표시/기본 설정을 위해 기본값을 반환함 | 기본값 반환이 legacy 전송 허가가 되어서는 안 됨. `emailTimingConfirmed===true`를 발송 진입점에서 검사하고 미확인 row를 보류 |
| P1, 소식 버전·동의·재시도 | 날짜·시각 결과가 안정됨 | I01–I07의 버전별 중복 방지·공식 종료·동의·불확실 재시도는 별도 전달/후보 계층의 검증 대상. 단순 확인일을 의미 있는 새 버전으로 취급하지 않음 |
| P2, UI 시간 의미 | eligible=true여도 `nextEligibleAt`이 과거 due일 수 있음 | 이 값은 “최초 처리 가능 시점”이며 “미래에 실행될 예약 시각”이 아님. 예: E10 now10:01에09:00을 반환하면 지금 처리 가능으로 표시; 외부 스케줄러가 그 시각에 등록되었다고 표시하지 않음 |

특히 `emailWindow`는 미래/미소비 슬롯을 조회해도 `nextDigestNotBefore`를 계산해서 반환한다. **반환됐다는 이유만으로 저장하면 첫 요약을 소비하지 않고 다음 날로 넘길 수 있다.** 저장 주체가 실제 평가/전달 건의 상태 전이와 연결하는지가 핵심 통합 사례다. 이 보고서에서 그런 잘못된 저장이 이미 발생했다고 주장하는 것은 아니다.

## 채택된 legacy 보호의 추가 사례

[workspace-settings.ts:30](/Users/bigmac_moon/dev/ai_score/site/lib/workspace-settings.ts:30)에서 세 시간 필드가 명시된 유효 입력인지 판단하고, 서버가 `emailTimingConfirmed`를 계산하여 저장하는 기반을 확인했다. 이는 순수 시간 함수의 검사 항목이 아니며 아래는 고정38개 이후 root가 채택한 보호의 **추가 통합 사례**다. 기존 분모를 사후 변경하지 않는다.

- L01: 기존 `email=true` row에 세 timing 필드/확인 플래그가 없음 → 기본값을 계산할 수 있어도 제공사 호출0·보류. 관심·프로필만 저장해도 보류 유지.
- L02: `emailTimingConfirmed:true`만 클라이언트가 보내고 필드3개를 명시하지 않음 → 확인으로 승격되지 않음. 서버에서 신뢰 가능한 이전 확인이 있지 않은 한 보류 유지.
- L03: 유효한 mode/zone/HH:mm 3개를 명시 저장 → 확인 상태 true, 이후 첫 처리에서 현재 창·소비 guard·동의·상한 적용. 이메일을 꺼 둔 상태에서 명시 확인했어도 실제 동의 전에는 전송0.

이번 검토에서는 L01–L03 전체 발송 파이프라인을 실행하지 않았다. 현재 root가 병행 구현 중인 전달 코드의 완료 여부를 이 순수 달력 검토로 단정하지 않는다.

## 범위 한계

현대 사용 시점과 고정 2011 회귀, 명시적 UTC instant/정상화된 `EmailSchedule`을 대상으로 했다. 모든 역사적 시간대 전환·날짜 범위·형식 없는 현지 시각 문자열을 지원한다고 검증하지 않았다. `emailDueOnDate`는 `emailSchedule`로 검증한 schedule을 받는 호출 규약으로 사용해야 한다. 실행 clock과 저장 guard도 명시적 UTC instant여야 한다.

현재 범위에서는 순수 달력 코드를 다시 쓰도록 요청할 재현 결함이 없다. 남은 검증은 위 영속 상태·발송 통합과 배포 런타임 및 실제 운영 증거다. 사이트 변경, 실제 무방문 실행, 실제 이메일 전달, 기존 게이트 점수 변경은 이 검토에서 수행하지 않았다.
