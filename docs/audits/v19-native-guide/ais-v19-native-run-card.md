# V19 실제 200%·VoiceOver 실행 카드

2026-09-14. 기준 source `97022e07918cc0254a252b6e7a219e35fb00e9bb`. root만 UI를 조작하며 이 문서는 수행 전 체크리스트다. **5.1.4/5.2.4의 문구·범위·가중치·현재 U 상태는 변경하지 않았다.** 사용자 명시적 재개 이후 실제 환경을 다시 확인하고 시작한다.

- 5.1.4: “Zoom/reflow and the complete screen matrix are measured.”
- 5.2.4: “Screen-reader reading order, descriptions and status announcements have an observed run.”

## 먼저 실행할 reader 3과업

Notion 로그인이 필요 없는 기존 AIs 화면부터 진행한다. 실제 접근 가능한 배포 또는 현재 소스의 로컬 UI를 사용하고 환경·role을 기록한다. VoiceOver와 실제 reader 출력을 확보한 뒤 아래 순서로 하면, 첫 과업에서 상태 발표를 가장 먼저 확인할 수 있다.

| 순서 | 실제 수행 | 바로 기록할 증거 |
|---|---|---|
| R1 공개 탐색·결과 상태 | `/explore`에서 주 메뉴/현재 페이지→본문 이동→h1→검색 필드 이름·현재 값→필터/체크 상태를 reader로 따라간다. 없는 검색어(예: `zz-v19-no-result`)를 입력해0건으로 바꾸고 조건 초기화로 돌아온다. | 실제 읽힌 메뉴·필드·체크 문구와 순서. **검색/필터에 초점을 둔 채 실제로 전달된 결과 수/0건 status 문구**, 초기화 후 전달 여부와 누락. 결과 문장에 수동으로 초점을 옮겨 읽은 것은 자동 상태 발표와 별도로 표기한다. |
| R2 비교표의 문맥·설명 | `/compare?ids=chatgpt,claude,notion`에서 제품 열 제목, 같은 기능/조건 행의 값을 이동하며 읽는다. 최소 한 긴 조건/설명과 반복 저장·비교 제어의 대상 이름을 확인한다. | 실제 reader 출력에서 현재 값의 **제품과 항목**을 알 수 있는지, 조건 설명이 읽히는지, 반복 제어를 구분할 수 있는지. 모든 제품/행을 새 전수 과제로 늘리지 않는다. |
| R3 개인 긴 모달 | `/my?tab=subscription`에서 현재 개인 메뉴를 읽고 기존 QA 조건 이력 또는 새 구독 모달을 연다. 제목/초기 초점→필드 이름·값·금액/미확인 도움말→열린 상세→하단→닫기 후 원 제어까지 읽는다. | dialog 제목, 실제 읽힌 설명·확장 상태와 순서, 하단/복귀 때의 reader 출력. 기존 QA가 있으면 **저장 없는** 같은 적용일 미리보기 오류→정상 미리보기로 alert도 관찰할 수 있다. QA가 없으면 새 모달로 설명·순서를 확인하고, 오류를 만들려고 실제 구독을 저장하지 않는다. |

각 과업은 `환경/Chrome·VoiceOver 버전/URL·role → 동작 → 실제 들린 문구 또는 실제 reader 출력 → 예상과 다른 누락·순서 → 복구/재실행`으로 짧게 기록한다. 실제 발화·reader 출력과 연결된 관찰이어야 하며 VoiceOver 켜짐 화면, DOM/AX tree, aria 속성, 일반 텍스트만으로 대체하지 않는다. 음성 파일 저장 자체를 새 필수조건으로 추가하지 않는다.

**R1의 실제 상태 변화 하나가 관찰됐다면 R3 오류까지 반드시 성공해야만 그것을 인정한다는 새 조건은 없다.** 반대로 직접 실행한 중요한 상태가 전달되지 않으면 누락으로 남긴다. 세 과업은 읽기 순서·설명·상태 발표를 연결하는 기존 범위이며 28페이지 전체 reader sweep이나 사용자 연구가 아니다. 상태 문구를 확인하려고 저장·공개 게시·실제 결제·철회·삭제를 실행할 필요는 없다.

## 이어 채울 실제 200% Z 목록 — 기존 28행 그대로

Chrome의 **실제 200% 표시**를 먼저 남긴다. 같은 창에서 CSS `innerWidth/innerHeight`, document `clientWidth/scrollWidth`와 필요 시 내부 scroller의 client/scroll/left를 별도로 기록한다. CSS zoom/transform·좁힌 창·OS 확대·이미지 축소는 Z 대체가 아니다. 확대 후 CSS 폭이 달라지므로 과거1440/390을 그대로 적지 않는다.

각 행은 상→중→하 본문·마지막 CTA/footer·초점이 가려지지 않는지 확인한다. 표는 양끝 열, 모달은 제목/닫기부터 하단 저장/취소까지 실제 접근한다. 긴 화면은 판독 가능한 viewport 구간을 남기고 고정 헤더/dock의 가림과 내부 표 스크롤을 문서 overflow와 구분한다.

| ID | Z 대상 |
|---|---|
| P01 | `/` — 홈 전체·행사/최근 커뮤니티/말단 |
| P02 | `/explore` — 필터·결과/0건·reset |
| P03 | `/search?q=Notion` — 전체 결과·유형 필터/0건 |
| P04 | `/tools/notion` 등 — 상세·앵커·긴 기능/조건표; 실제 본 변형 URL 명시 |
| P05 | `/compare?ids=chatgpt,claude,notion` —3열 표 양끝·선택 부족 안내 |
| P06 | `/recommend` — 입력·체크·결과/이유·현재 가능한0건 |
| P07 | `/ranking` — 기간·실제 집계 또는 미집계 상태 |
| P08 | `/guides` —4개 카드와 CTA |
| P09 | `/guides/notion-task-board` 등 — 준비/예/순서/결과/복구/출처·말단 |
| P10 | `/news` — 업데이트·필터·긴 제목 |
| P11 | `/news?tab=events` — 행사 조건·일시·신청 |
| P12 | `/news?tab=feed` — 실제 피드·출처·보관 상태 |
| P13 | `/news/chatgpt` 등 — 상세·발행/확인일·출처 |
| P14 | `/promotions` — 자격·지역·만료 경고와 CTA |
| P15 | `/cancellation` — 웹/Apple/Google·웹 미확인 안내 |
| P16 | `/sources` —20개 패널·현재 상태·긴 안내 |
| P17 | `/community` — 필터·목록/빈 상태·작성 진입 |
| P18 | `/community/{실제 id}` — 본문·답글·현재 제어; id 기록 |
| P19 | `/about` — 긴 제목/본문·내부 링크·말단 |
| P20 | `/privacy` — 긴 본문·삭제 안내·말단 |
| A01 | `/admin` — **실제 운영 권한**의 현재 목록/빈 상태·표 양끝·두 피드백 details |
| M01 | `/my?tab=library` — 도구/모음·필터·폼 |
| M02 | `/my?tab=saved` — 콘텐츠·기록 수정·긴 제목 |
| M03 | `/my?tab=subscription` — 구독·이력·청구/월별·결제/환불 |
| M04 | `/my?tab=savings` — 새/저장 비교·조건·일정·간단 계산 |
| M05 | `/my?tab=cancellation` — 연결 안내·기록·해지 폼 |
| M06 | `/my?tab=notifications` — 목록/빈 상태·긴 본문·제어 |
| M07 | `/my?tab=settings` — 혜택/숨긴 주제·시간 설정·데이터 관리 |

P04/P09/P13은 기존 템플릿을 재사용하되 실제 본 URL과 구조 차이를 밝힌다. 20제품·4가이드 모두를 새 principal로 늘리지 않는다. 다른 가이드 본문 전체 스캔은 기존 권장사항이며 필수 화면 수를 바꾸지 않는다.

**확장 몸체는 해당 Z 행 아래에 연결한다.** S01 메뉴/dock/toast와 S02 공통 dialog 초점은 공통 관찰을 재사용하고, S03 후기 상태, S04 커뮤니티 폼, S05 도구/모음/저장 폼, S06 구독, S07 조건 이력·미리보기, S08 결제/환불/해지·월별, S09 날짜별 비교, S10 저장 조건·간단 계산, S11 설정, S12 실제 관리의 서로 다른 몸체·하단/표 양끝은 하나로 대신하지 않는다. V17 V01–V09 진입 경로·QA·기존 D/M 비평을 재사용해 **Z 관찰만** 채운다.

추가 상태 G01 guest `/my`, A02 권한 없음, E01 없는 URL, E02 현재 통제 가능한 공통 오류는 기존 행에 남긴다. 못 보는 상태는 사유를 적고 운영 장애/새 후기를 만들지 않는다. 레이아웃 가족의760/761·1050/1051·500 이하 전환은 기존 증거를 재사용하거나 부족한 곳만 측정한다. 28행×모든 분기점×D/M200% 조합은 새로 요구하지 않는다. 관찰되지 않은 중요한 확장 칸이 있는데28개 상단만으로 complete라고 하지 않는다.

기록 한 줄 형식: `ID / URL·query / source·local 또는 production·role·QA / Chrome zoom / CSS viewport / raster / doc·내부 폭 / 상중하·양끝·키보드 도달 / 결과·미관찰·수정 후 재확인`.

## Notion 가이드와의 경계

P09의 확대·reader 관찰은 Notion 실제 재현6.3.4를 대신하지 않는다. 로그인 후 별도 진행할 기존5단계는 DB 생성→3업무/속성→상태별 보드→마감일 정렬·필터→카드 메모/상태 변경이다. 결과는 같은3업무, 양 보기 상태 동기화,9/16→9/17→9/18 정렬을 확인한다. 이 준비가 끝나 있으므로 reader 실행을 Notion 로그인 재대기로 묶을 필요가 없다.

근거: [기존 native 범위](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/ais-v17-native-gate-scope.md), [원래28개·확장 매트릭스](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v10-screen-matrix.md), [V18 Notion 사전 점검](/Users/bigmac_moon/dev/ai_score/docs/audits/v18-export-guide-preflight/ais-v18-notion-guide-preflight.md). 실제 실행 결과/점수 판정은 아직 없으며 원본·Site·브라우저는 수정하지 않았다.
