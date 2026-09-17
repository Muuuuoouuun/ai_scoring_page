# V14 고정 점수 경계 독립 검토

2026-09-12. V13 JSON/MD, V14 spec/plan, 최신 이메일 timing·delivery·settings·status·export/delete 코드와 관련 테스트를 읽었다. 점수·소스 변경, 테스트 재실행, 브라우저/운영 검증은 하지 않았다. V14 최종 배포 결과 및 새 V14 점수표의 파일 간 비교는 이 보고서 범위가 아니다.

**현재 근거로 V14의 점수 증가분은 0이다. 1.2.4 / 8.4.3 / 8.4.4 / 9.4.4는 모두 GAP·0점으로 유지하는 것이 고정 기준과 일치한다.** 구현·로컬 검증의 진전은 해당 게이트의 evidence에 추가하되 이진 게이트를 쪼개거나 일부 점수를 부여하지 않는다.

## 독립 숫자 검산

[V13 JSON](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-score-worksheet-v13.json)의 9영역·38그룹·152게이트를 순회했다. 고유 ID 152개, 모든 그룹은 4게이트, 각 게이트 weight=그룹 가중치/4, PASS earned=weight 및 GAP/UNVERIFIED earned=0을 확인했다. 영역별 가중치 합은 각각 100이다. V9와 V13의 영역/그룹 순서·이름·그룹 가중치·152 ID/기준 문구/게이트 가중치도 동일하다. [V13 MD](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-score-worksheet-v13.md)의 152행 ID/문구/state/earned는 JSON과 전부 일치한다.

| 영역 | V13 재계산 | V14 유지값 |
|---|---:|---:|
| 정체성·기획 일치 | 86.25 | 86.25 |
| 내용·최신성 | 100.00 | 100.00 |
| 디자인 | 93.75 | 93.75 |
| 사용성 | 95.00 | 95.00 |
| 쾌적성·접근성 | 87.50 | 87.50 |
| 유용성 | 86.25 | 86.25 |
| 커뮤니티 | 93.75 | 93.75 |
| 개인 기능 | 81.25 | 81.25 |
| 배포·운영 | 93.75 | 93.75 |

집계는 **PASS 138 / GAP 4 / UNVERIFIED 10 = 152**, **88 이상 5/9영역**이다. 산술 대조용 earned 합은 817.50/900이다. 네 GAP의 미취득 가중치는 8.75+5+5+6.25=25, UNVERIFIED 10개의 미취득 합은 57.50이며 900−25−57.50=817.50으로 일치한다. 이 합계·평균을 새로운 종합 완료 기준으로 사용하지 않는다.

## V14의 진전과 그대로 남는 경계

| 고정 게이트 | 보강된 근거 | 아직 닫을 수 없는 이유 | 유지 |
|---|---|---|---|
| 1.2.4 retained private/operational minimum including email | 명시 시간 확인, digest/matched 설정, 날짜별 후보 처리, 불변 묶음·접수 기록·개인 export/delete가 코드에 연결됨 | 보존된 전체 개인/운영 최소 요건에는 실제 이메일·무방문 처리·운영 주기가 포함된다. 소스와 로컬 제공자 mock만으로 그 전체가 작동한다고 할 수 없다. | GAP, 0/8.75 |
| 8.4.3 topic hide/not-interested and offered notification timing complete | 기존 숨김/복원에 설정 revision·시각·시간대·digest/조건 모드·동의 취소·대기 상태 설명이 더해짐 | 고정 V13 evidence가 미완료로 남긴 것은 제공된 무인 timing까지 포함한다. ‘다음 새로 확인 시 처리’는 방문 없는 예약 실행을 대신하지 않는다. 숨김과 timing의 일부 구현을 별도 점수로 쪼갤 수 없다. | GAP, 0/5 |
| 8.4.4 consented actual email delivery and unattended processing operate | 제공자 ID 저장, 동일 요청 재시도, 횟수/lease 보호, 늦은 실패 방어와 불확실 상태 기록을 시험할 코드·테스트가 존재 | 운영 sender/provider 연결, 동의한 실제 수신 증거, 무방문 처리 실행이 미연결/미입증이다. mock ID는 실제 provider receipt가 아니며 실제 provider 접수도 받은편지함 도착과 다르다. | GAP, 0/5 |
| 9.4.4 unattended/email operations and operating feedback/cadence complete | 조회 가능한 개인 처리 이력·실패/보류/재시도 상태가 운영 조사 근거를 보강 | 외부 방문 없이 돌리는 등록된 실행 주체·실제 cadence 및 전체 운영 feedback 요구의 완료 증거가 없다. 로컬 시계 전진·수동 refresh는 운영 scheduler가 아니다. | GAP, 0/6.25 |

구현 근거는 [email-timing.ts](/Users/bigmac_moon/dev/ai_score/site/lib/email-timing.ts), [email-delivery.ts](/Users/bigmac_moon/dev/ai_score/site/lib/email-delivery.ts), [workspace-settings.ts](/Users/bigmac_moon/dev/ai_score/site/lib/workspace-settings.ts), [email-cancellation.ts](/Users/bigmac_moon/dev/ai_score/site/lib/email-cancellation.ts), [email-status.ts](/Users/bigmac_moon/dev/ai_score/site/lib/email-status.ts) 및 `tests/email-{timing,delivery,migration}.test.mjs`다. 테스트 소스의 대상은 확인했지만 이번 점수 검토에서 최종 테스트 통과를 재실행해 주장하지 않는다. 최종 실행 결과는 root의 보존된 실제 로그에 연결해야 한다.

현재 호출 경로는 [notifications API:29](/Users/bigmac_moon/dev/ai_score/site/app/api/notifications/route.ts:29)의 인증된 refresh이며, [email-status.ts:17](/Users/bigmac_moon/dev/ai_score/site/lib/email-status.ts:17)는 `processing:'on_refresh'`를 반환한다. [EmailPreferences.tsx:15](/Users/bigmac_moon/dev/ai_score/site/components/EmailPreferences.tsx:15)는 무방문 예약 발송이 아직 연결되지 않았다고 설명하고, [EmailDeliveryStatus.tsx:15](/Users/bigmac_moon/dev/ai_score/site/components/EmailDeliveryStatus.tsx:15)는 ‘제공사 접수’와 수신함 도착을 구분한다. 현재 소스 표현은 이 점수 경계와 맞는다.

## 이미 PASS인 근거의 보강과 남은 UNVERIFIED

동의·자격·중복/재시도·경합 회귀 검사는 이미 PASS인 8.4.2와 5.4.2/5.4.4의 근거를 보강한다. 계정별 receipt/export/delete는 8.1.2·8.5.1·8.5.2의 구현/시험 근거를 확장한다. 같은 게이트를 한 번 더 구현·시험했다고 추가 점수를 얻지는 않는다. 또한 로컬 새 UI 저장/복원·좁은 화면 관찰은 해당 기능의 제한된 UI 근거다. 그 자체로 전체 화면 비교 3.4.4, 실제 확대 5.1.4, screen-reader 5.2.4, 실제 다중 계정/기기 8.1.4, 전체 배포 export/파괴적 삭제 8.5.4의 미검증을 닫지 못한다. 이번 보고서에서는 PNG를 직접 열어 시각 검증했다고 주장하지 않는다.

[V14 spec](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-12-email-timing-design.md)도 네 umbrella GAP의 유지와 운영 scheduler/provider/실제 동의 수신의 분리를 명시한다. V14 결과 기록은 ‘실제 처리 결정·큐·회수 불가능한 전송의 이력 보호를 구현하고 로컬/배포 UI 근거를 보강했다’의 범위여야 한다. 배포 성공만으로 이메일 연결이나 무인 작동이 생기지 않으므로, 최종 source/deployment 증거를 갱신하더라도 이 점수 벡터와 138/4/10 상태 집계는 그대로 유지한다.
