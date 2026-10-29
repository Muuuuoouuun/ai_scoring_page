# 2026-10-03 AI·SaaS 업데이트 후보 검토

확인일: 2026-10-03 KST. 기준: `codex.09bigmac`, HEAD `c7f4658`, `site/data/catalog.json` 43개 항목. 공식 제공사 발표·도움말만 근거로 사용했다. 아래는 콘텐츠 반영 제안이며 데이터 수정·커밋·배포·계정 연결은 수행하지 않았다. 적용 권장은 AIs의 정보 반영에 대한 판단으로, 해당 유료 제품 구매나 이 저장소의 운영 도구 도입 승인을 뜻하지 않는다.

## 먼저 선택할 후보

| 우선순위 | 후보 | 발표일 | 판단 | 현재 반영 상태 |
| --- | --- | --- | --- | --- |
| 1 | Gemini Skills와 Gems 전환 일정 | 2026-09-30 | 적용 권장 | Gemini 최신 소식은 9/10 Windows 앱, Skills 없음 |
| 2 | ChatGPT Space와 Pages | 2026-09-29 | 적용 권장 | 행사 요약에 이름만 있음; ChatGPT 기능·최신 소식에는 없음 |
| 3 | Claude Cowork·채팅 통합 | 2026-09-16 | 적용 권장 | Claude 최신 소식은 9/10 Smart reports, 통합 경험 없음 |
| 4 | Notion 3.7 팀 Skills | 2026-09-15 | 적용 권장 | 최신 소식은 9/9 모델 관리, 팀 Skills 없음 |
| 5 | Sonnet 4.5 API 종료 예정 | 2026-09-30 | 적용 권장·고급 | Sonnet 5.5 출시는 있음; 4.5 종료 일정은 없음 |
| 6 | GitHub Copilot 컴퓨터 사용 | 2026-10-01 | 조건부 적용 | 최신 소식은 9/11 사용 지표, 컴퓨터 사용 없음 |
| 7 | Cursor Rollouts·Security Review | 2026-09-23 | 조건부 적용 | 최신 소식은 9/10 Projects, 새 봇 없음 |
| 8 | Gemini 4 Argon 제한 출시 | 2026-09-30 | 일반 추천 보류 | 별도 모델 항목 없음 |

1~4는 일반 이용자가 서비스를 선택하고 기능을 찾는 데 직접 도움이 된다. 5는 기존 API 이용자의 중단 예방에 유용하다. 6~7은 미리보기·유료 플랜·연결 조건을 표시하고 반영한다. 8은 발표 소식으로만 다룰 수 있으며 지금 바로 쓸 모델처럼 추천하지 않는다.

## 후보별 사실·반영 위치

### 1. Gemini Skills와 Gems 전환 — 적용 권장

- **확인 사실:** 9/30 Gemini 채팅에 재사용 지침인 Skills가 도입됐다. 현재 18세 이상 개인 Google 계정에 제공된다. Gems는 개인 계정 2026년 11월, Workspace 기업·비영리 2027년 3월, 교육 2027년 6월 전환 예정이며 자동 이전을 안내한다. 현재 Skills는 Canvas·Deep Research 등에 사용할 수 없다. [공식 릴리스 노트](https://gemini.google/release-notes/), [공식 전환 도움말](https://support.google.com/gemini/answer/18560919)
- **사용자 영향:** 반복 프롬프트를 저장하고 여러 지침을 함께 쓸 수 있다. 기존 Gems 이용자는 자동 이전 시점과 빠진 도구를 미리 알아야 한다. 계정별 차이를 숨기면 회사·학교 이용자가 기능을 찾지 못한다.
- **반영 위치:** `site/data/catalog.json`의 `gemini.features`, `limitations`, `latestUpdate`, `checkedAt`. 새 소식 ID 제안 `gemini-skills-2026-09-30`, revision 1. `site/data/guides.json`에 “반복 작업 지침 저장하기”를 추가할 후보. 기존 기능 검색 설계의 Gems 용어도 전환 별칭으로 유지한다.
- **기존 여부:** 현재 Gemini에는 Canvas·Live·이미지·데스크톱 기능만 있다. 최신 소식 9/10은 별개 발표다.

### 2. ChatGPT Space와 Pages — 적용 권장

- **확인 사실:** DevDay에서 Space·Pages를 발표했다. Pro·Business·Enterprise가 대상이다. 웹·데스크톱에서 페이지 생성·편집·공동 작업을 지원한다. 모바일은 찾기·읽기·공유만 제공한다. 협업 슬라이드·스프레드시트는 아직 예정이라고 안내한다. [DevDay 공식 요약](https://openai.com/index/devday-2026-recap/), [Space 공식 기능·FAQ](https://chatgpt.com/features/space/)
- **사용자 영향:** 긴 대화의 결과물을 팀과 함께 고치는 페이지로 이어갈 수 있다. Plus까지 제공된다고 쓰거나 모바일 편집·슬라이드 협업을 현재 지원으로 표시하면 잘못된 선택을 유도한다.
- **반영 위치:** `catalog.json`의 `chatgpt.features`에 Space·Pages를 조건부 기능으로 추가하고 `latestUpdate`를 `chatgpt-space-pages-2026-09-29`로 교체한다. `guides.json`에 자료를 페이지로 정리하고 공유 권한을 확인하는 가이드를 검토한다. 독립 앱 항목 신설은 중복 탐색 효과를 따져 결정한다.
- **기존 여부:** `events.json`의 DevDay 요약에 Space라는 이름만 있다. ChatGPT 기능·소식에는 없으므로 기존 dots·Codex cloud 항목과 중복되지 않는다.

### 3. Claude Cowork·채팅 통합 — 적용 권장, 템플릿 무료 표기는 보류

- **확인 사실:** 9/16부터 Cowork 작업과 일반 채팅을 한 대화 경험으로 통합하며 Pro·Max의 웹·데스크톱·모바일에 순차 제공한다. 같은 플랜에서도 적용 시점이 다르다. 클라우드 작업은 노트북을 닫아도 계속되지만 로컬 파일·앱을 쓰는 작업은 Claude Desktop이 열려 있어야 한다. [공식 릴리스 노트](https://support.claude.com/en/articles/12138966-release-notes), [통합 경험 도움말](https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude)
- **출처 충돌:** 9/16 릴리스 노트는 Design·Slides·Docs까지 Free라고 적지만 현재 상세 도움말의 표는 Artifacts 생성은 Free, Design·Slides·Docs 템플릿은 유료 베타만이라고 구분한다. “Docs·Slides 무료 제공”은 확정하지 말고 상세 도움말 기준 조건부로 표시한다. Enterprise는 관리자가 켜야 한다. [현재 Artifacts 기능·플랜 표](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)
- **사용자 영향:** 결과물 제작에 앞서 모드를 고르는 부담이 줄어든다. 클라우드 실행과 로컬 컴퓨터 실행을 구분해야 예약 업무가 실제로 계속될 조건을 이해할 수 있다.
- **반영 위치:** `catalog.json`의 `claude.features`, `limitations`, `latestUpdate`를 보강한다. 새 ID `claude-unified-conversations-2026-09-16`. Artifacts의 기존 일반 설명은 플랜별 템플릿 조건을 덧붙인다. 새 가이드는 “대화에서 문서 결과물 만들기”가 적합하다.
- **기존 여부:** 일반 Artifacts는 있으나 통합 대화 경험과 템플릿 조건은 없다. 모델 출시 2건과도 다른 앱 기능이다.

### 4. Notion 3.7 팀 Skills — 적용 권장

- **확인 사실:** 9/15 공유 지침 라이브러리, 페이지·데이터베이스 기반 Skills, Agent 채팅에서 실행·자동 선택, 로컬 에이전트용 `SKILL.md` 내려받기를 발표했다. 별도 Custom MCP 연결은 Business·Enterprise 베타이며 일반 Skills와 제공 조건이 다르다. [공식 3.7 릴리스](https://www.notion.com/releases/2026-09-15), [Skills 공식 도움말](https://www.notion.com/help/create-and-manage-skills)
- **사용자 영향:** 팀의 보고서·검토 형식을 한곳에서 관리하고 여러 AI 도구로 가져갈 수 있다. 공유 지침을 수정할 권한과 AI 이용 한도는 확인해야 한다. 내려받은 사본은 변경 시 다시 내려받도록 안내한다.
- **반영 위치:** `catalog.json`의 `notion.features`에 팀 Skills를 조건부로 추가하고 `latestUpdate`를 `notion-team-skills-2026-09-15`로 바꾼다. `guides.json`의 기존 `notion-task-board`는 데이터베이스 입문으로 유지하고 “팀 보고서 지침 공유하기”를 별도 가이드로 검토한다.
- **기존 여부:** 모델 관리자 정책·AI 데이터베이스 생성만 있다. 원문이 명시하지 않은 Skills의 모든 플랜 무료 제공은 주장하지 않는다.

### 5. Claude Sonnet 4.5 API 종료 예정 — 적용 권장·고급

- **확인 사실:** 9/30 `claude-sonnet-4-5-20250929`의 지원 중단을 발표했다. Claude API 종료는 2026-11-30 예정이고 Sonnet 5.5로 이전을 권한다. 11/30은 미래 종료 예정일이며 출시일이나 이미 종료된 날짜가 아니다. [Claude Platform 공식 릴리스](https://platform.claude.com/docs/en/release-notes/overview)
- **사용자 영향:** 고정 모델 ID를 쓰는 개발자는 서비스 중단 전에 이전해야 한다. 새 모델명으로만 바꾸면 기존 요청 설정·도구 사용이 깨질 수 있어 공식 이전 가이드를 함께 연결한다.
- **반영 위치:** `catalog.json`의 `claude-sonnet-5-5.limitations`와 `sourceUrls`에 이전 정보를 추가한다. 현재 5.5 출시 소식의 주요 사실을 보강할 때는 안정된 기존 ID를 유지하고 revision을 올린다. 별개의 “4.5 종료 예정” 소식까지 보존하려면 서비스당 하나뿐인 `latestUpdate` 구조의 이력 지원을 먼저 설계해야 한다. 종료 날짜를 위해 가짜 새 앱·모델 항목을 만들지 않는다.
- **기존 여부:** 5.5의 9/28 출시와 기본 가격은 이미 반영됐지만 종료 일정·이전 영향은 없다.

### 6. GitHub Copilot 컴퓨터 사용 — 조건부 적용

- **확인 사실:** 10/1 macOS·Windows의 Copilot CLI·앱에 컴퓨터 사용 공개 미리보기를 발표했다. 앱 조작 전 승인과 조직 관리 설정을 적용하며 macOS는 접근성·화면 기록 권한이 필요하다. [GitHub 공식 발표](https://github.blog/changelog/2026-10-01-github-copilot-can-now-interact-with-desktop-apps/)
- **사용자 영향:** API가 없는 데스크톱 앱 작업을 위임할 수 있다. 일반 코드 제안과 달리 앱 권한·조작 승인이 필요한 기능이며, 공개 미리보기임을 앞에 표시해야 한다.
- **반영 위치:** `catalog.json`의 `github-copilot.features`, `platforms`, `latestUpdate`를 보강한다. 새 ID `github-copilot-computer-use-2026-10-01`. 가이드는 실제 지원 계정의 권한 화면·짧은 작업을 확인한 뒤 만든다.
- **가격 보완:** 기존 Business·Enterprise 카드·PayPal 결제 고객은 10/1부터 다음 결제주기의 할당 좌석을 선결제하는 변화가 적용된다. 가격 자체는 변경되지 않는다고 명시한다. 발표일은 8/28이며 시행 시작일 10/1과 구분한다. “가격 인상”으로 요약하지 않는다. 현재 일반 크레딧 설명에는 이 조건이 없다. [공식 결제·정책 공지](https://github.blog/changelog/2026-08-28-upcoming-changes-to-github-copilot-policies-and-billing/)

### 7. Cursor Rollouts·Security Review — 조건부 적용

- **확인 사실:** 9/23 Teams·Enterprise에 PR·배포·관측 데이터를 연결하는 Rollouts와 취약점 검토 봇을 출시했다. Rollouts는 환경별 상태를 판단하고 되돌리기 PR을 준비할 수 있지만 자동 병합·롤백은 하지 않는다. Security Review는 draft PR을 건너뛴다. [Cursor 공식 발표](https://cursor.com/changelog/rollouts-and-security-reviewer)
- **사용자 영향:** 코드 변경의 배포 후 영향과 취약점을 확인하려는 팀에 유용하다. 이 저장소 운영에 도입하려면 유료 플랜·배포 이벤트·관측 데이터 연결 가능성을 먼저 확인해야 한다.
- **반영 위치:** `catalog.json`의 `cursor.features`, `limitations`, `latestUpdate`, `pricing` 조건에 추가한다. 새 ID `cursor-rollouts-security-review-2026-09-23`. 자동 운영 도구 연결은 콘텐츠 수정과 분리해 결정한다.
- **혜택 보류:** 발표의 “다음 10일” 시험 크레딧은 확인일이 기간 경계에 있고 절대 종료 시각이 없다. 현재 유효한 무료 혜택으로 `promotions.json`에 추가하지 않는다.
- **기존 여부:** Projects 베타·Cloud Agents만 있고 두 봇은 없다.

### 8. Gemini 4 Argon — 일반 추천 보류, 제한 출시 소식은 가능

- **확인 사실:** 공식 9/30 발표를 확인했다. 현재 Fairwind의 신뢰된 보안 방어 조직에 제한 제공하며, 일반 개발자·기업·소비자 출시는 이후로 안내한다. 유료 API·Google AI Ultra부터 넓힐 계획이지만 일반 출시 완료는 확인되지 않았다. 발표 가격은 출시 도입 기간의 입력 $2·출력 $10/100만 토큰이며 도입 기간 이후 $4·$20을 예고했다. [Google 공식 발표](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/)
- **사용자 영향·판단:** 일반 이용자에게 바로 구독·사용할 모델로 제안하기에는 접근 조건이 부족하다. 모델 탐색에 넣는다면 제한 제공을 제목·요약·기능 조건에 일관되게 표시하고 실제 비교 추천은 보류한다.
- **반영 위치:** 현재는 이 검토 문서에만 보존한다. 추후 `catalog.json` 신규 `gemini-4-argon` 후보. 별도 가이드는 일반 제공과 계정 접근을 확인한 뒤 작성한다.
- **숫자 주의:** 검색 요약은 1M을 context window로 표시했으나 발표 본문은 output token limit라고 적는다. 검색 요약을 사실 근거로 쓰지 않고 이번 추천에는 해당 숫자·자체 벤치마크를 제외한다.

## 중복 제외·콘텐츠 운영 메모

- 9/30 커밋에서 추가된 Claude Opus/Sonnet 5.5, GPT-6.1 Sol, dots, Codex cloud, Grok 4.7·Team Bots·Build memory·Voice Transcribe 2.0의 기존 발표는 후보에서 제외했다. 새로운 계정·가격·종료 조건만 보강 후보로 다룬다.
- 최신 확인일을 10/3으로 바꾸는 것만으로 새 소식이 되지 않는다. `site/docs/notice-source-contract.md`에 따라 다른 발표는 새 ID, 같은 발표의 중요한 정정은 기존 ID와 높은 revision을 사용한다. API 종료·Gems 전환처럼 미래 날짜는 예정으로 표시한다.
- `/news`는 `catalog.json`의 서비스별 `latestUpdate`에서 나온다. 여러 발표를 하나의 ID에 계속 합치면 저장된 소식·알림 이력이 불명확해진다. 같은 서비스의 여러 공지를 함께 보존하려면 콘텐츠 이력 구조 변경을 별도 검토한다.
- `guides.json`의 `executionCheck`는 실제 실행 확인 후에만 기록한다. 이번 조사는 공식 설명의 사실 확인이며 계정별 실기기 성공 검증은 수행하지 않았다.
- 공식 제공 조건만으로 서비스의 성능·평점·사용자 만족도를 확정할 수 없다. 별도 원격 브랜치의 researched evaluations는 병합 검토 대상이며 이번 후보의 근거로 사용하지 않았다.

권장 첫 반영 묶음은 Gemini Skills·ChatGPT Space·Claude 통합 대화·Notion Skills 4건이다. 개발자 중요 공지인 Sonnet 4.5 종료 조건을 함께 보강하고, Copilot·Cursor는 제공 조건을 갖춘 카드로 추가한다. Argon은 제한 출시 상태가 해소되기 전까지 일반 추천에서 보류한다.
