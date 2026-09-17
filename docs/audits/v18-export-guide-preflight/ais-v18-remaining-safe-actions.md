# V18 남은 고정 게이트와 지금 가능한 안전한 과업

2026-09-13. Source `97022e07918cc0254a252b6e7a219e35fb00e9bb`/Sites 버전19는 V17 채택 문서의 기준이다. 이번 하위 감사는 기존 문서·현재 소스·호출 가능한 도구 메타데이터만 읽고 **이 파일만 작성**했다. Site/기존 문서/브라우저/운영/배포/DB를 변경하지 않았으며 Notion 등 연결 앱도 호출하지 않았다. Sites 예약 지원을 다시 검색하지 않았다.

**결론: 실제 가이드 1건 재현은 아직 실행할 가치가 있는 독립 과업이다.** 고정 6.3.4에 외부 사람이라는 필수 조건을 추가할 근거는 없다. Root가 진행하는 운영 내보내기 다운로드는 8.5.4의 안전한 부분을 완료할 수 있다. 반면 전체 삭제까지 자동 완료로 세거나, 구현자의 비교 지식을 사용자 이해로 바꾸어 6.1.4를 올리는 것은 적절하지 않다.

## 고정 현황과 11개별 판단

[V17 채택 점수표](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-13-score-worksheet-v17.md:31)와 JSON의 unique gate를 독립 계수했다. **152개 = PASS141 + GAP4 + UNVERIFIED7**, 남은 **11개**다. 새 기준/부분점수/상태 변경은 하지 않는다.

| ID (현재 상태) | 기존 기준의 핵심 | 지금 가능한 범위 / 남는 구체 조건 |
|---|---|---|
| 1.2.4 GAP | retained private/operational minimum, including email | V14/V15의 시간·동의·경합·receipt 구현을 또 검사해도 실제 이메일/무인 운영까지 포함한 umbrella는 닫히지 않는다. 현재 증거의 제공사 실수신·지원된 운영 실행 경로·cadence 부족이 그대로다. |
| 1.3.4 U | external anonymous visitor의 deployed public-information task | V17 배포는 owner/custom/허용1계정·외부0·그룹0이고 외부 방문자 관찰이 없다. 현재 owner 세션이나 로컬 guest를 외부 익명 방문자로 다시 기록할 수 없다. 배포 공개 범위와 실제 외부 관찰의 선행 조건이 필요하며 이 감사에서 정책 변경을 제안/수행하지 않는다. |
| 5.1.4 U | 실제 zoom/reflow와 complete screen matrix | V17 D/M·확장 비평은 재사용 가능하지만 200% Z는 별도다. 최신 V17 기록상 Chrome 첫 조작에서 사용자 화면 변경이 감지돼 중단했고 작업 시간 조율 응답 대기다. 잠금 해제와 앱 목록 읽기만으로 재개 권한/안전한 제어 시간 또는 확대 완료가 되지 않는다. |
| 5.2.4 U | reader 읽기 순서·설명·상태 announcements observed run | 같은 native Chrome/VoiceOver 조율 대기가 현재 blocker다. ARIA 소스/정지 이미지/DOM tree를 실제 발화로 대체하지 않는다. 응답 후 이미 작성한 한정 과업을 수행하면 되고 새 대규모 reader matrix는 필요 없다. |
| 6.1.4 U | representative person/task가 comparison evidence로 후보 선택을 보임 | 현재 기능·조건 비교 UI는 준비돼 있으나 기존 근거는 ‘saving is not understanding’이다. 소스에 대한 구현자의 지식/검색 fixture 정답/합성 비용 결과만으로 이해를 증명할 수 없다. 기존 사용자 과업을 위한 비교 증거·중립 질문 준비는 가능하지만 실제 선택/보류 이유가 관찰되기 전 U 유지가 맞다. 아래 경계 참조. |
| 6.3.4 U | complete representative guide reproduced + result checked | **지금 실행 후보.** 외부 사람·실기기·운영 이메일은 원문 필수 조건이 아니다. 현재 Notion 업무 보드 가이드 1건을 실제 도구에서 단계대로 재현하고 3개 결과 checks를 확인하면 된다. 단, 해당 도구의 로그인/편집 권한·허용된 작업 공간이 실제로 있어야 한다. |
| 8.1.4 U | independent real production sessions로 cross-device/account isolation | 현재 owner1계정 관찰과 SQLite alpha/beta 시험은 이미 유용하지만 독립 실제 두 계정/기기 운영 세션이 아니다. 같은 계정을 새 탭으로 열거나 dev 인증을 바꾸는 것으로 이 조건을 없앨 수 없다. |
| 8.4.3 GAP | hide/not-interested AND offered notification timing complete | 주제 숨김/복원·명시 시각/zone/digest 선택·중복/경합 보강은 기존 근거다. 실제 무인 시각 실행의 부족으로 conjunction이 미완료라는 V14/V15 경계를 유지한다. 같은 local UI를 반복 저장해 점수를 더할 수 없다. |
| 8.4.4 GAP | consented actual email AND unattended processing operate | 제공사 설정 코드와 mock receipt는 실제 수신/무방문 실행 증거가 아니다. 기존의 실수신·운영 예약 경로/인증·실행 기록 부족이 그대로다. 이번에는 예약 도구 탐색이나 제공사 자격 증명 재요청을 반복할 이유가 없다. |
| 8.5.4 U | complete deployed export/download AND full-account destructive flow observed | **다운로드 절반은 지금 실행 가능하며 root가 진행 중.** 실제 받은 파일의 범위/파싱/현재 계정 데이터를 확인한다. 전체 계정 삭제는 별도 동작으로 남으며 취소/글1건삭제/로컬DELETE로 대신하지 않는다. 현재 운영 기록의 의도된 전체 삭제 범위가 확정되지 않았다면 export 성공만으로 이 게이트 전체를 PASS하지 않는다. |
| 9.4.4 GAP | required unattended/email operations AND operating feedback/cadence complete | feedback 구현·수집 집계/수동 확인 실행과 주기 운영의 실적은 다르다. 필수 이메일/무인 실행 및 실제 cadence 근거 부족이라는 기존 blocker가 그대로며 문서상의 계획/로컬자동화를 Sites 운영 예약으로 이름 바꾸지 않는다. |

## 다음 실제 행동: 6.3.4 Notion 가이드 한 건

현재 [guides.json](/Users/bigmac_moon/dev/ai_score/site/data/guides.json)의 `notion-task-board`는 Notion 계정·페이지 편집 권한·업무 목록을 준비물로 요구한다. Zapier는 두 연결 앱과 Publish가 필요하고, Midjourney는 유료 구독·생성이 필요하며, Gemini Notebook은 Google 로그인과 자료가 필요하다. 이 중 Notion은 작은 업무3개로 표·보드 동기화와 정렬을 직접 확인할 수 있어 최소 실행 후보다. 이는 새 가이드나 새 기준을 만드는 것이 아니다.

1. 기존 허용된 편집 공간에서 `V18 가이드 재현 · 합성 업무`처럼 구분되는 비공개 연습 페이지를 사용한다. 로그인/권한이 없으면 그 정확한 상태를 남기고 권한을 우회하거나 남의 페이지를 임의 변경하지 않는다. 편집 공간의 실제 사용 가능성은 이 읽기 전용 감사에서 확인하지 않았다.
2. 배포 `/guides/notion-task-board`의 **기존 단계 그대로** 새 database, 업무 이름/상태/우선순위/마감일, 상태별 보드, 마감일 정렬·필터, 카드 메모·상태 변경을 수행한다. 날짜는 기존 예시 또는 수행일에 맞는 연습 날짜임을 명시한다.
3. 기존 checks **세 가지**를 실제 결과에서 확인한다: 필터 없는 표와 보드에 같은 업무3개; 한 카드 상태를 바꾸면 두 보기에 같은 값; 실제 마감일 순서가 정렬과 일치. 이때 사용한 원래 입력/작업 URL/단계별 성공·막힘/최종 표·보드/결과 대조를 남긴다. 실패가 생겼다면 기존 recovery로 복구한 사실도 보존한다. 실패가 없는데 recovery를 사용했다고 꾸밀 필요는 없다.
4. 실제 도구에서 생성·변경한 결과를 다시 읽어 확인한다. 단순 가이드 스크롤/문서의 예시 표 복사/로컬 HTML로 Notion 흉내내기는 complete reproduction이 아니다. 완료한 **이 한 가이드**의 실행 근거와 나머지3개 미실행을 분리한다.

현재 도구 목록에는 `notion_fetch`, `notion_create_database`, `notion_create_view`, `notion_create_pages`, `notion_update_page`, `notion_query_data_sources`가 실제 callable metadata로 존재한다. 이것은 **인증 성공 또는 편집 권한 확인이 아니다.** 필요하면 root가 연결의 읽기 접근부터 확인할 수 있지만, root의 최신 계획처럼 실제 UI를 따라 재현하면 `/database`와 보기 +의 사용자 단계까지 직접 검증할 수 있다. Connector/API로 결과를 만들기만 했다면 실제 UI 단계를 수행했다고 표기하지 않는다.

고정 6.3.4에는 ‘외부 참가자’나 ‘실제 인간이 직접 해야 함’이 없으므로 **그 조건을 임의로 추가하지 않는다.** 재현자가 에이전트임을 밝힌 실제 도구 작업·실결과 검증은 사용성 연구와 분리해서 판단할 수 있다. 현재 [guide page](/Users/bigmac_moon/dev/ai_score/site/app/guides/[id]/page.tsx:5)는 모든 가이드에 ‘직접 실행 결과는 미등록’을 출력한다. 후속에서 완료 근거를 등록할 때 선택한1건만 정확히 연결하고 전체4건을 수행했다고 바꾸지 않는다.

## 6.1.4의 원래 과업과 대체 불가능한 증거

고정 원문은 ‘A representative person/task demonstrates choosing between candidates from the comparison evidence.’이고, 최초 V4부터 미검증 이유가 **‘No observed comparison-understanding task; saving is not understanding’**이었다. [제품 방향 원문](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-ai-score-product-direction-design.md:166)은 후보·근거 이해, 선택/보류 이유, 첫 사용 계획을 관찰하며 선택 도움 정의에서 단순 저장·클릭을 제외한다. [페이지 구조의 원래 흐름](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-12-page-structure-design.md:69)은 검색/목적별 탐색→상세→후보 비교 후 기능·조건·차이를 이해하는 것이다.

- ‘external’이나 새 참가자 수·모집 방식·독립 평가자라는 조건은 이 게이트에 없으므로 **외부인을 추가 모집해야 한다고 일괄 고정하지 않는다.** 실제 선택 문제를 가진 현재 사용자1명의 과업도 검토 대상이 될 수 있다. 원문 파일럿의10명/20명/7일/28일은 이 단일 게이트에 새 최소 인원·기간으로 옮기지 않는다.
- 그러나 현재 root/하위 에이전트는 카탈로그 검수·추천 알고리즘/시험 기대를 알고 있다. 그것을 이용해 사후 이유를 작성하거나 QA 저장결과에서 ‘완전 추천’ 값을 만든 것은 사용자 이해 관찰이 아니다. 별도 에이전트를 ‘대표 사람’으로 부르는 것도 안 된다.
- 지금 안전하게 준비할 수 있는 것은 이미 사용된 과업(예: V11의 ‘자료 여러 편을 비교하고 출처를 확인하면서 요약’)의 실제 선택 조건을 유지한 비교 화면과 중립적 확인 항목이다. 사전에 목적·필수 조건을 적고, 후보의 차이/플랜 제약/출처/확인 필요를 비교 화면에서 찾게 한 뒤 시험·유지·전환·보류 중 선택 이유와 다음 행동을 기록한다. 특정 제품을 정답으로 알려 주거나 내부 점수를 공개해 답을 유도하지 않는다.
- 현재 [compare page](/Users/bigmac_moon/dev/ai_score/site/app/compare/page.tsx:6)는 최대3개 후보의 업무·요금·환경·한국어·기능/condition/source·limitations·미평가/확인일을 제공한다. 소스 분기 또는 V11 순위 benchmark의 정답은 이 화면을 보고 실제로 이해했다는 관찰을 대신하지 않는다.

따라서 이번 턴에서 외부 조율 없이 확실히 이어갈 **우선순위는 guide reproduction**이며,6.1.4는 과업 준비/기존 자료 정리만을 PASS로 바꾸지 않는다. 실제 사용자 선택 응답이나 그와 동등한 기존 관찰 근거가 새로 확보되기 전에는 같은 미검증 사유를 정확히 유지한다.

## Root가 진행하는 운영 다운로드의 실제 범위

[Preferences](/Users/bigmac_moon/dev/ai_score/site/components/Preferences.tsx)는 `/api/export` download 링크를 제공하고, [GET export](/Users/bigmac_moon/dev/ai_score/site/app/api/export/route.ts:5)는 인증 userId에 속한 records/posts/notifications/notificationCards/feedback/emailDeliveries/emailOutbox/emailSchedule와 exportedAt를 반환한다. filename은 `ais-my-records.json`, no-store이며 private payload와 delivery items는 JSON으로 풀어 내보낸다. 실제 내려받은 파일의 파싱, 이 키들의 존재, 현재 계정의 보이는 기록과 일치·비어 있는 배열의 사실 표기까지 확인할 수 있다. 링크 클릭 또는 응답 텍스트만을 OS/브라우저 다운로드 완료로 부르지 않는다.

[workspace DELETE](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:41)는 ‘내 기록 삭제’ 확인 후 private records/알림·이메일 이력·피드백·반응/신고를 지우고 작성 글을 익명 삭제 상태로 바꾼다. 이 원래 destructive 절반은 다운로드와 별개이며 export에 자동 전체 복원 기능이 있는 것은 아니다. Root가 현재 수행하는 안전한 다운로드 절반을 끝낸 뒤, 전체 삭제를 수행하지 않았다는 사실을 그대로 남기면 된다. 이 감사는 삭제 승인이나 실행을 추가하지 않는다.

## 같은 blocker의 재확인 방식

확대·VoiceOver: [V17 최종 관찰76행](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-13-v17-expanded-visual-verification.md:76)의 사용자 화면 변경 감지/작업 시간 조율 응답 대기를 재사용한다. 새로운 UI 제어 시도를 반복해 기존 충돌을 무시할 필요가 없다. 응답 후에는 이미 있는 [native gate scope](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/ais-v17-native-gate-scope.md)로 진행한다.

이메일·무인 실행: [기존 V12 capability 감사](/Users/bigmac_moon/dev/ai_score/docs/audits/v12-feedback/ais-v12-scheduling-capability-review.md)를 그대로 재사용했다. 현재 source에서 layout은 요청 후 waitUntil(syncBatch), notifications POST refresh는 인증한 현재 사용자에 대해 generate/deliver를 실행하며, email-delivery는 RESEND_API_KEY/EMAIL_FROM/SITE_URL를 구성 전제로 한다. 이는 요청 실행 코드이고 실제 설정/수신/예약 운영 완료의 증거가 아니다. 이번에 도구/문서를 다시 탐색하거나 cron을 임의로 추가하지 않았다.

직전 V17은 실제 수정·판독·배포·3.4.4 채택이라는 진행이 있었고, 이번에는 export 실제 파일 확인과 guide 실제 재현이라는 별도 진행 가능성이 있다. 따라서 이 감사만으로 ‘더 할 일이 전혀 없다’거나 전체 goal blocked/complete를 판정하지 않는다. 다음 행동이 실제 선행 조건에서 실패할 경우 그 원인과 이미 시도한 범위를 기록하고, 같은 외부 조건을 이름만 바꾸어 반복 조사하지 않는다.
