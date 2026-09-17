# V18 실제 내보내기와 가이드 실행 준비

2026-09-13. 직전 V17 goal turn은 실제 화면 수정·배포·교차 검토 및 고정3.4.4 채택으로 **progress**였다. 이번에는 실제 배포 UI의 내보내기 파일을 받아 구조를 검증했다. 이는8.5.4의 부분 증거이며 전체 목표나 해당 게이트 완료가 아니다.

## 현재 소스·점수

Source `97022e07918cc0254a252b6e7a219e35fb00e9bb`, checkout clean. [기존 비공개 배포](https://ais-discovery-hub.aaahaaah19.chatgpt.site)는 Sites19이며 이번에는 코드·운영 자료·배포를 변경하지 않았다. 빌드·기능 테스트·배포 조회를 의미 없이 다시 실행하지 않았다.

[채택 V17 점수표](2026-09-13-score-worksheet-v17.md)를 그대로 유지한다. PASS141/GAP4/UNVERIFIED7, 88 이상5/9. 기준·가중치·점수 변화는 없다.

## 실제 다운로드

흐름: 배포 홈 → 내 계정 → 설정 → 내 기록 내보내기. CUA의 앱 내 브라우저에서 실제 링크를 클릭했고 `waitForEvent('download')`가 반환됐다. 브라우저는 설정 화면을 유지했다. 이어 실제 로컬 파일을 열어 JSON 파싱·필수8배열·exportedAt를 확인했다.

- 받은 파일: `/Users/bigmac_moon/Downloads/ais-my-records.json`,685 bytes.
- SHA256: `bc59822619586148f29ac05f306f4144b736b5c9dab503ff0c52996f07c3b482`.
- 파일 mtime UTC `2026-09-12T16:56:11.035935+00:00`; 서버 exportedAt `2026-09-12T16:56:13.285Z`. 클라이언트와 서버 시각을 동일한 시계라고 가정하지 않는다.
- records0, posts1, notifications0, notificationCards0, feedback0, emailDeliveries0, emailOutbox0, emailSchedule0.
- posts의 기존 행은 내보낸 파일에 존재한다. 사적인 필드 값은 보고서·도구 출력에 복사하지 않았다. 원본 다운로드를 배포하거나 감사 디렉터리에 복제하지 않았다.
- records와 emailDeliveries가 비어 있으므로 중첩 payload/items의 실제 비어 있지 않은 행 파싱을 검증한 것으로 세지 않는다. 독립 계정 격리나 모든 데이터 종류의 실제 운영 행을 검증한 것으로 확대하지 않는다.

| 확인 | 결과 |
|---|---|
| 대상 URL·페이지 제목 | 배포 설정 URL와 AIs 제목 일치 |
| 의미 있는 화면·오류 오버레이 | 설정과 데이터 관리 노출, 프레임워크 오류 화면 없음 |
| 콘솔 | error0 |
| 실제 다운로드 | 이벤트와 저장된685byte JSON 확인 |
| 화면 폭 | CSS410×783, document/scroll395/395 |
| 전체 데이터 삭제 | 실행하지 않음;8.5.4는UNVERIFIED 유지 |

[구조·해시·범위 영수증](v18-export-guide-preflight/download-verification.json) · [다운로드 후 화면](v18-export-guide-preflight/settings-after-download.jpg). 원래 결과 탭을 홈으로 복귀시키고 deliverable로 유지했다.

## 기존 가이드의 재현 가능성

남은6.3.4는 ‘A complete representative guide is reproduced and its result checked.’이며 외부 사람을 필수로 추가하지 않는다. 기존 `notion-task-board`의 준비물·5단계·3개 결과 checks를 그대로 사용한다. 새로 더 쉬운 가이드를 만들어 원래 과업을 대체하지 않는다.

기존 단계는 새 database 생성 → 업무3개와 상태/우선순위/마감일 속성 → 상태별 보드 → 마감일 정렬·필터 저장 → 카드 메모·상태 변경이다. 필터 없는 두 보기의 동일3개 업무, 상태 수정 동기화, 실제 날짜 순서라는3checks를 모두 실제 도구에서 확인해야 한다.

연결 도구의 self 읽기는 성공했고 관련 Notion 도구가 제공됨을 독립 사전 확인했다. 최소 task 관련 AIs 검색0건, ai_score 검색은 관련 없는 제목/경로만 확인해 본문은 열지 않았다. API 호출만으로 동일 결과를 만든 것을 가이드의 UI5단계 수행으로 세지 않는다.

실제 UI 확인: 새 앱 내 브라우저 탭에서 notion.so → 공식 marketing → Notion 로그인 화면. 기존 ChatGPT 로그인 연결을 선택했으나 auth.openai.com의 이메일 입력 화면으로 이동해 인증된 세션이 없음을 확인했다. 이메일/비밀번호/코드를 입력하거나 계정을 만들지 않았다. Notion으로 돌아와 로그인용 탭19를 handoff로 남겼다. native Notion 앱은 목록에 없었다. 실제 DB·페이지·업무 생성이나 가이드 실행은 아직0건이다.

사용자에게 Notion 로그인 후 알려 달라는 요청1건을 보냈으며 현재 응답 대기다. 탭provider `browser-use:9b540b5e-71b8-49b3-9101-2cd5795a937f`, `open_in_codex`는 queued. 사용자 앞에 로그인 화면이 이미 열렸다고 주장하지 않는다. Chrome/VoiceOver의 기존 시간 조율 질문도 답변 없이 재시도하지 않았다.

## 다음 행동과 중단 조건

로그인 답변 후 준비된 Notion 탭의 실제 상태부터 확인하고 기존5단계·3checks를 수행한다. 성공하면 선택한1개 가이드에만 실행 증거를 연결하고 독립 평가를 받는다. 다른 가이드나 사용자 이해 과업까지 완료로 처리하지 않는다.

나머지 이메일 제공사·실수신/무인 운영·독립 실제 계정·전체 삭제·실제 비교 선택 과업의 선행 조건은 [남은 안전한 과업 감사](v18-export-guide-preflight/ais-v18-remaining-safe-actions.md)에 유지했다. 전체 삭제는 사용자 기록을 되돌릴 수 없이 지우는 별도 작업이므로 다운로드와 섞지 않는다. 이번 다운로드 검증은 진행이 있었으며 목표를 complete 또는 blocked로 바꾸지 않았다.

[Notion 실행 사전 점검](v18-export-guide-preflight/ais-v18-notion-guide-preflight.md): 기존 예시3행과5단계·3checks의 실행 기대를 보존했다. 보존본에서는 작업과 무관한 개인 워크스페이스 이름만 생략했다.

## 후속 연속 대기 감사

V18 종료의 인증 대기와 이후 두 goal continuation에서 같은 Notion 로그인 화면·답변 부재가 확인됐다. 3회 연속 같은 선행 조건의 기준을 충족해 목표 상태 도구가 `blocked`를 반환했다. 전체 목표와 점수는 변경하지 않았다. [연속 상태 기록](v18-export-guide-preflight/continuation-state.json)과 [독립 차단 감사](v18-export-guide-preflight/ais-v18-blocked-audit.md)를 보존한다. 인증·화면 사용 조율 등 조건이 바뀌어 재개되면 차단 횟수는 새로 센다.
