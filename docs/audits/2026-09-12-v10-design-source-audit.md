# V10 디자인·콘텐츠 소스 검토

2026-09-12. root가 지정한 기준 소스: `0188f74e26d93f9f7073ea0030ecdd4399c58738`. 고정 V9 디자인 게이트와 app/components/globals.css의 주요 경로를 읽었다. 사이트·Git·배포·브라우저·하위 작업 조작 없음. 아래 항목은 **소스에서 확인되는 구조와 렌더링 QA 후보**이며 실제 시각 결과·넘침·screen-reader PASS를 주장하지 않는다.

**가치가 큰 확인 순서:** 고정 헤더와 앵커 → 긴 검색어/비교 제목 → 자동 생성 제목의 길이 제한 → 모바일 기능표의 실제 가독성. 성숙한 어조를 해치는 유아적 표현이나 평가를 과장하는 문구는 이번 범위에서 찾지 못했다. 친근한 질문형 제목을 성인에게 부적합하다고 임의 판단해 교체할 이유는 없다.

## D01 / P2 — 상세 앵커 일부만 고정 헤더 여백을 받음

소스: [도구 상세](/Users/bigmac_moon/dev/ai_score/site/app/tools/[id]/page.tsx:9), [행사 카드](/Users/bigmac_moon/dev/ai_score/site/app/news/page.tsx:8), [홈 행사 링크](/Users/bigmac_moon/dev/ai_score/site/app/page.tsx:9), [공통 CSS](/Users/bigmac_moon/dev/ai_score/site/app/globals.css:3).

확인된 구조: 헤더는 sticky top 0이며 높이는 데스크톱 78px, 모바일 64px다. 앵커 offset은 `.detail-body .section{scroll-margin-top:100px}`에만 있다. `#overview`에는 `.section`이 없고, `#related`는 `.detail-body` 밖에 있다. 행사 카드는 `id={e.id}`만 있다.

예상 위험: 상세 메뉴의 ‘개요’/‘유사 도구’ 및 홈의 행사 링크로 이동하면 대상 제목·첫 행이 고정 헤더 아래로 들어갈 수 있다. ‘주요 기능’/‘평가·후기’는 다른 여백 정책을 받아 같은 메뉴의 동작이 달라진다.

렌더 QA: `/tools/chatgpt`에서 멀리 아래로 내린 뒤 개요/유사 도구 클릭, 홈 행사→행사 카드 링크를 1440/390/320px에서 각각 확인. 이동 직후 해당 제목과 핵심 카드 조작이 헤더 아래에 가려지지 않아야 한다. 문서 끝이라 정확한 scroll target 도달이 제한되는 경우도 함께 기록한다.

최소 수정 후보: 탐색 대상 section/article에 일관된 앵커 여백을 적용하거나 해당 세부 ID/행사 카드에 같은 규칙을 추가한다. 레이아웃의 실제 여백을 억지로 늘릴 필요는 없다.

## D02 / P2 — 긴 검색어와 개인 비교 제목에 줄바꿈 보호 누락

소스: [Explore](/Users/bigmac_moon/dev/ai_score/site/components/Explore.tsx:8), [GlobalSearch](/Users/bigmac_moon/dev/ai_score/site/components/GlobalSearch.tsx:12), [저장 비교 제목](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:47), [공통 CSS](/Users/bigmac_moon/dev/ai_score/site/app/globals.css:3).

확인된 구조: 두 검색 결과의 `.results-meta`는 flex/space-between이며 검색어가 첫 span에 그대로 출력된다. 자식 min-width/overflow-wrap/flex-wrap 처리가 없다. GlobalSearch는 최대 160자, Explore는 입력 최대 길이도 없다. 공통 긴 글 보호 규칙은 record-row·post-body 등에 적용되지만 results-meta에는 없다. 저장 비교의 `h4`에도 overflow-wrap이 없고, `.section-heading>div{min-width:0}`만으로 긴 토큰의 텍스트 자체가 줄바꿈되지는 않는다.

재현 입력: 검색어 `model-` + `A` 120개(126자). 저장 비교 제목 `contract-` + `A` 180개(189자). 둘 다 현재 입력 허용 범위 안이다. 320/390px에서 문서 clientWidth/scrollWidth 및 제목·결과 건수/정렬 문구의 가림을 확인한다. 일반적인 짧은 한국어 이름만으로는 이 경로가 드러나지 않는다.

최소 수정 후보: 검색 메타 행의 wrapping과 자식 min-width/overflow-wrap, 저장 비교 제목·본문의 긴 토큰 보호를 명시한다. 긴 제목을 화면 밖으로 넘기거나 의미 없이 잘라 숨기는 방식보다 자연스러운 줄바꿈이 적절하다. 표는 내부 가로 스크롤을 유지하고 문서 전체 가로 넘침과 구분한다.

관련 게이트: 3.2.4/3.4.4의 현재 화면 정보 위계·일관성 확인 및 기존 3.3의 좁은 화면 근거를 보강하는 검사다. 기존 대표 화면 PASS를 이 소스 추정만으로 뒤집지는 않는다.

## D03 / P2 — 유효한 두 이름으로 생성한 기본 비교 제목이 저장 한도를 넘음

소스: [Savings 저장폼](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:45), [API 제목 제한](/Users/bigmac_moon/dev/ai_score/site/app/api/cost-comparisons/route.ts:10), [후보 이름 제한](/Users/bigmac_moon/dev/ai_score/site/lib/dated-comparison.ts:10), [기존 구독명 입력](/Users/bigmac_moon/dev/ai_score/site/components/RecordForm.tsx:10).

확인된 구조: 기본 제목은 `기존 구독명 + ' → ' + 후보 이름`이다. 두 이름은 각각 100자까지 유효하므로 생성 제목은 최대 203자다. 제목 input과 API title은 200자 제한이다. 따라서 정상 입력 두 개에서 생성한 기본값을 그대로 보내면 서버 검증에 실패할 수 있다. 이는 시각 추정과 별개인 길이 산술상 충돌이다.

재현: 구독명 `A` 100개, 후보명 `B` 100개로 유효 비교를 만든 뒤 기본 제목을 고치지 않고 저장한다. 예상된 UX는 생성 단계에서 이미 유효한 제목이어야 한다. 표준 maxlength 속성이 프로그램으로 주입한 defaultValue를 자동으로 유효하게 줄여준다고 가정하지 않는다.

최소 수정 후보: 기본 제목을 실제 저장 한도에 맞게 생성한다. 사용자가 작성한 제목은 기존 검증을 유지한다. 저장 전 오류를 보여주는 것만으로도 데이터 손상은 없지만, 앱이 스스로 만든 잘못된 기본값을 고치게 하는 단계는 피할 수 있다.

## D04 / P3 — 운영 화면의 초기 요청에 로딩 설명이 없음

소스: [Admin](/Users/bigmac_moon/dev/ai_score/site/components/Admin.tsx:4), [운영 페이지](/Users/bigmac_moon/dev/ai_score/site/app/admin/page.tsx:4).

확인된 구조: data 초기값 null, error 초기값 빈 문자열이며 data 도착 전 Admin은 화면 내용을 반환하지 않는다. load 자체에도 초기 loading 상태가 없다. 접근 가능한 운영자는 페이지 제목/요약만 보고 기다리게 된다. 동기화 상태나 신고가 없는 것인지, 요청 중인지 구별되지 않는다. 다른 주요 화면은 loading/empty/error 문구를 구분한다.

렌더 QA: 느린 연결에서 운영 화면 첫 진입을 확인한다. 초기 API 응답 대기 중임이 보이는지, 응답 후 신고 없음과 구분되는지 확인한다. 최소 수정은 짧은 상태 문구이며 장식적 skeleton 추가를 요구하지 않는다.

## D05 / 렌더링 우선 관찰 — 모바일 기능표의 핵심 조건이 10–11px

소스: [도구 상세 기능표](/Users/bigmac_moon/dev/ai_score/site/app/tools/[id]/page.tsx:9), [모바일 CSS](/Users/bigmac_moon/dev/ai_score/site/app/globals.css:4).

확인된 구조: 모바일 기능표는 여전히 3열이며 td/th 11px, 설명 small 10px, 조건 배지 10px다. 기능·플랜 조건·근거가 같은 표에 있고, 일반 입력은 모바일 16px다. 따라서 입력폼과 상세 정보의 가독성 차이가 클 수 있다. 이 수치만으로 특정 접근성 기준 미달이나 시각 실패를 단정하지 않는다.

렌더 QA: 내용이 가장 긴 실제 도구의 ‘주요 기능과 조건’에서 320/390px, 기본 배율과 실제 200%로 읽는다. 긴 영문 기능명, 한글 조건 문장의 줄 수, 지원 상태 배지, 근거 링크가 함께 읽히는지 확인한다. 실제로 촘촘하다면 정보 우선순위를 유지한 셀 간격/폰트 조정 또는 좁은 화면에서 읽을 수 있는 표 구조를 선택한다. 임의로 출처·제약을 숨겨 화면을 깔끔하게 만들지는 않는다.

## 성인 어조·위계·일관성 관찰

- 홈의 ‘일에 맞는 도구’, 비교의 ‘같은 기간’, 도구 기능의 조건부/미확인, 실제 원장과 예상치의 구분은 목적 중심의 문구다. 강제 구매·성능 과장·어린이식 보상 표현을 찾지 못했다.
- 공통 색상 토큰·한국어 본문·주/보조 버튼·note/error·기본 form label이 재사용된다. 영어 eyebrow가 여러 화면에서 반복되지만 한국어 주제목이 따로 있으며, 소스만으로 ‘성인 어조 불일치’라고 판정할 근거는 없다.
- source 화면과 운영 화면에 일부 raw toolId/status가 노출된다. 필요하면 사람에게 읽히는 서비스명·상태명으로 정리할 수 있으나, 이것을 새 필수 범위나 점수 조건으로 추가하지 않는다.
- 성능 진단은 `?diagnostics=1`일 때만 나타난다. 일반 방문에 개발 진단창이 상시 노출된다는 문제는 없다.
- 현재 네 가이드는 모두 toolIds가 한 개다. 가이드 마지막 링크의 공통 문구가 현재 화면에서 여러 동일 버튼을 만드는 문제는 없다. 미래 다중 도구 가능성만으로 결함을 만들지 않았다.

## 고정 게이트와 이번 검토의 한계

기준: [V9 고정 JSON](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-score-worksheet-v9.json). 디자인은 기존 81.25이며 다음 게이트는 각각 6.25점의 UNVERIFIED 상태다.

- 3.1.4 `The complete rendered V4 theme has a documented visual critique.`
- 3.2.4 `Current desktop/mobile information hierarchy is visually checked across every principal screen.`
- 3.4.4 `New guide/search/admin/expanded-billing screens have a complete cross-screen visual comparison.`

이번 소스 검토는 이 세 게이트의 PASS 근거가 아니다. 실제 렌더링 검토가 필요하며, 고정 문구의 ‘complete/every principal screen’을 일부 짧은 정상 화면으로 대체하지 않는다. 오래된 V4 표기를 새 점수 조건으로 바꾸거나 가중치를 조정하지 않는다.

root의 시각 검토에서 정상·빈 상태를 구분할 주요 화면 묶음은 홈/탐색/도구 상세·비교, 전체 검색, 가이드 상세, 소식·피드·행사, 커뮤니티 목록·글 상세, 추천·참여 랭킹, 출처·운영, 개인 목록·설정·알림, 구독 원장·조건 이력 dialog·날짜 비교 입력/결과/저장 조건이다. 표의 내부 스크롤, 긴 글, dialog 내 세로 스크롤은 문서 넘침과 별도로 기록한다. 이는 기존 전체 화면 요구를 찾아가기 위한 목록이며 새 화면 기능을 요구하지 않는다.

실제 화면/색상 대비 계산/폰트 로딩/200% 확대/screen-reader는 수행하지 않았다. 정량 점수 변화 및 배포 완료 판정을 하지 않는다.

## root가 추가한 실제 배포 관찰 — 이 검토자의 소스 추정과 구분

보고서 완료 직전 root가 별도로 수행한 prod 390px QA 결과를 전달했다.

- D02 긴 검색어: 실제 문서 clientWidth 375 / scrollWidth 1120으로 재현.
- D01 개요 앵커: 대상 top 약 −0.05px, 고정 헤더 64px로 제목 가림 재현. root는 해당 PNG를 보관했다고 보고했다.
- 계획된 수정은 results-meta wrapping/gap 및 자식 min-width/overflow-wrap, main 앵커 scroll-margin-top, 저장 h4 wrapping이다. 이 회신 시점에는 완료·재검증으로 판정하지 않는다.
- D03 자동 제목 203자 충돌은 아직 별도의 추가 실제 재현 전이며 D01/D02 수정 완료와 묶지 않는다.

이 수치는 root의 실제 관찰 보고다. 이 검토자가 브라우저나 PNG를 직접 검사한 것으로 표현하지 않는다. 두 대표 문제의 확인·수정만으로 전체 디자인 게이트 PASS를 부여하지 않는다.
