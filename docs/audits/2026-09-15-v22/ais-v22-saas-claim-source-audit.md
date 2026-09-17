# SaaS·협업·PMS 8개 주장–출처 감사

확인일: 2026-09-15. 기존 Tool 스키마에 맞춘 독립 조사 결과이며 Site 체크아웃·DB·배포에는 손대지 않았다. 공식 제품·지원·가격·릴리스 문서와 제품 공급사가 배포한 공식 앱 메타데이터만 사용했다.

가격은 지역·결제 주기·좌석에 따라 바뀌므로 무료 여부와 과금 방식 중심으로 적었다. 평점·사용자 수·저장 수·리뷰·순위·직접 시험한 성능을 만들지 않았다. `supported`는 제품 기능의 존재를 뜻하며 모든 플랜에서 무제한 제공된다는 뜻은 아니다. 플랜 제약은 기능별 condition과 limitations에 적었다.

업데이트 5개는 실제 공식 날짜가 확인되어 날짜를 썼다. monday.com·Jira·Airtable 3개는 정확한 게시일을 임의 생성하지 않고 null로 남겼다. 따라서 checkedAt은 조사일이고 출시일이 아니다.

## Asana

가격·조건: 공식 가격표의 Personal 최대 2명, Starter의 타임라인·규칙, Advanced의 포트폴리오·목표를 반영했다. [가격표](https://asana.com/pricing)
한국어·플랫폼: 공식 설정 문서에 Korean이 명시되어 있으며 가격표가 macOS·Windows·iOS·Android 앱을 안내한다. [화면 설정](https://help.asana.com/s/article/navigation-and-display)
업데이트 날짜: 공식 포럼의 Vanessa_N 원문 게시일 2026-09-09를 사용했다. 포럼 목록의 마지막 활동일 9월 11일 및 기능 대상 월인 8월과 구분한다. [8월 릴리스 원문](https://forum.asana.com/t/asana-release-notes-august-2026/1154956)

| 기능 주장 | 제공 범위·조건 | 공식 출처 |
| --- | --- | --- |
| 작업·프로젝트 보기 — 담당자와 마감일을 정하고 목록·보드·캘린더로 업무를 확인합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://asana.com/pricing) |
| 타임라인·간트 — 프로젝트의 일정과 작업 관계를 시간순으로 살펴봅니다. | Starter 이상에서 제공합니다. | [근거](https://asana.com/pricing) |
| 규칙 자동화 — 배정·알림·상태 변경을 규칙으로 처리합니다. | Starter 이상에서 제공하며 AI Studio에는 별도 크레딧 한도가 적용됩니다. | [근거](https://asana.com/pricing) |
| 포트폴리오·목표 — 여러 프로젝트의 진행 상황을 목표와 연결합니다. | Advanced 이상에서 제공합니다. | [근거](https://asana.com/pricing) |

## monday.com

가격·조건: 가격 페이지 직접 열기는 시간 초과가 있어 상세 조건은 공식 지원 문서로 교차 확인했다. 무료 2명·보드 3개, 보드 1개 연결 대시보드, Standard 이상 자동화·연동을 반영했다. monday CRM/dev는 별도 제품이다. [무료 플랜](https://support.monday.com/hc/en-us/articles/360010487220-Understanding-the-Free-Plan), [자동화·연동](https://support.monday.com/hc/en-us/articles/360002826680-Automations-and-integrations-pricing)
한국어: 공식 UI 지원 언어 목록에 Korean이 있다. [지원 언어](https://support.monday.com/hc/en-us/articles/360003503760-Available-languages-for-monday-com)
업데이트·플랫폼: 공식 변경 페이지에서 AI 연결·AI Blocks와 웹·데스크톱·모바일 앱 범위를 확인했다. 개별 항목의 날짜가 없어 publishedAt=null로 유지했다. [공식 변경 페이지](https://monday.com/whats-new)

| 기능 주장 | 제공 범위·조건 | 공식 출처 |
| --- | --- | --- |
| 보드·업무 항목 — 업무를 보드에 정리하고 담당자·상태를 함께 관리합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://support.monday.com/hc/en-us/articles/360010487220-Understanding-the-Free-Plan) |
| 업무별 대화 — 항목의 업데이트와 멘션으로 작업 맥락 안에서 의견을 나눕니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://support.monday.com/hc/en-us/articles/360010487220-Understanding-the-Free-Plan) |
| 대시보드 — 보드의 진행 상황을 위젯으로 모아 봅니다. | 무료 플랜의 대시보드는 보드 1개와 연결할 수 있습니다. | [근거](https://support.monday.com/hc/en-us/articles/360010487220-Understanding-the-Free-Plan) |
| 자동화·앱 연동 — 조건에 따라 작업을 실행하고 외부 서비스와 데이터를 연결합니다. | Standard 이상이며 플랜별 월간 액션 한도가 적용됩니다. | [근거](https://support.monday.com/hc/en-us/articles/360002826680-Automations-and-integrations-pricing) |

## ClickUp

가격·조건: 무료 파일 저장 공간은 현재 공식 가격표의 60MB를 사용했다. 무료 Docs·Kanban·스프린트, Unlimited의 간트·기본 시간 기록, 플랜별 고급 대시보드·자동화 조건을 확인했다. AI 상품은 별도 과금이다. 플랫폼 목록은 같은 페이지의 다운로드 링크를 확인했다. [가격표](https://clickup.com/pricing)
한국어: Brain AI의 한국어 번역과 앱 UI 현지화를 구분했다. 공식 문서의 UI 언어 목록에서 한국어를 확인하지 못해 확인 필요로 표기했다. [번역·현지화](https://help.clickup.com/hc/en-us/articles/15430667811863-Translate-and-localize-with-Brain-AI)
업데이트: 2026-08-25 PayPal 결제는 인도부터 순차 제공하는 결제 옵션이다. 한국에 제공된다고 하거나 가격 인하로 표현하지 않았다. [공식 변경 기록](https://feedback.clickup.com/changelog)

| 기능 주장 | 제공 범위·조건 | 공식 출처 |
| --- | --- | --- |
| 작업·보드·스프린트 — 작업을 배정하고 칸반 보드와 스프린트로 진행 상황을 관리합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://clickup.com/pricing) |
| 공동 문서 — 팀과 문서를 작성하고 작업 맥락을 공유합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://clickup.com/pricing) |
| 간트·시간 기록 — 일정을 간트로 보고 업무에 사용한 시간을 기록합니다. | Unlimited 이상에서 무제한 간트와 기본 시간 기록을 제공합니다. | [근거](https://clickup.com/pricing) |
| 대시보드·자동화 — 업무 지표를 보고 반복 작업을 자동화합니다. | 고급 대시보드와 자동화 범위·실행 한도는 플랜에 따라 다릅니다. | [근거](https://clickup.com/pricing) |

## Trello

가격·조건: 무료 워크스페이스 협업자 10명·보드 10개·자동화 월 250회, Standard의 Planner 전체 기능, Premium의 고급 보기를 구분했다. 일부 외부 Power-Up은 별도 과금이다. 데스크톱·iOS·Android 링크도 같은 공식 페이지에 있다. [가격표](https://trello.com/pricing)
한국어: 최신 Trello 전체 UI의 한국어 지원을 확정하는 공식 목록을 확보하지 못했다. Jira의 지원 언어 목록을 Trello에 전용하지 않고 확인 필요로 표기했다.
업데이트: 공식 제품 블로그의 2026-07-22 Trello MCP 출시를 사용했다. 전체 Trello 이용자 대상이지만 호환 AI 도구·계정 연결·기존 권한이 필요하다. [Trello MCP](https://www.atlassian.com/blog/trello/connect-trello-to-your-favorite-ai-assistants-with-trello-mcp)

| 기능 주장 | 제공 범위·조건 | 공식 출처 |
| --- | --- | --- |
| 보드·카드 관리 — 업무 카드를 목록별로 정리하고 담당자·마감일을 설정합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://trello.com/pricing) |
| Inbox — 이메일·Slack·Teams의 할 일을 개인 수집 공간에 모읍니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://trello.com/pricing) |
| 규칙 자동화 — 반복되는 카드 정리와 업무 흐름을 자동화합니다. | 무료 플랜은 워크스페이스당 월 250회 명령 실행 한도가 있습니다. | [근거](https://trello.com/pricing) |
| 여러 보기·Planner — 일정을 배치하고 캘린더·타임라인 등으로 업무를 확인합니다. | Planner 전체 기능은 Standard 이상, 캘린더·타임라인 등 고급 보기는 Premium 이상입니다. | [근거](https://trello.com/pricing) |

## Jira

가격·조건: Jira Cloud 기준으로 무료 10명·저장 공간 2GB, Premium의 팀 간 계획, 유료 플랜의 Rovo 조건을 반영했다. 공식 가격표와 에디션 가이드 사이 자동화의 단위·숫자 차이가 있어 정확한 자동화 횟수를 복제하지 않았다. [가격표](https://www.atlassian.com/software/jira/jira/pricing), [에디션](https://www.atlassian.com/software/jira/guides/more/jira-editions)
한국어·플랫폼: 공식 계정 언어 표에서 Jira의 Korean 지원을 확인했다. 모바일 앱은 공식 Jira Cloud 문서가 iOS·Android를 명시한다. [언어](https://support.atlassian.com/atlassian-account/docs/manage-your-language-preferences/), [모바일](https://support.atlassian.com/jira-software-cloud/docs/use-jira-cloud-on-apple-and-android-devices/)
업데이트: 8월 31일~9월 7일 Cloud 주간 기록의 Plans·에이전트 개선을 요약했다. 주간 범위를 개별 기능 출시일로 바꾸지 않아 publishedAt=null이다. 순차 배포 표시를 유지하고 Data Center 릴리스와 섞지 않았다. [Cloud 주간 변경](https://confluence.atlassian.com/cloud/blog/2026/09/atlassian-cloud-changes-aug-31-to-sep-7-2026)

| 기능 주장 | 제공 범위·조건 | 공식 출처 |
| --- | --- | --- |
| 스크럼·칸반·백로그 — 작업을 정리하고 팀의 개발 주기와 우선순위를 관리합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://www.atlassian.com/software/jira/guides/more/jira-editions) |
| 보고서·대시보드 — 프로젝트 진행 상황과 업무 흐름을 보고서로 확인합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://www.atlassian.com/software/jira/jira/pricing) |
| 팀 간 계획 — 여러 팀과 프로젝트의 계획 및 의존성을 함께 관리합니다. | Premium 이상에서 고급 팀 간 계획을 제공합니다. | [근거](https://www.atlassian.com/software/jira/jira/pricing) |
| Rovo AI — 팀의 정보를 검색하거나 대화·에이전트 기능으로 업무를 돕습니다. | 유료 플랜에서 제공하며 관리자 설정과 플랜별 AI 사용량 조건이 적용됩니다. | [근거](https://www.atlassian.com/software/jira/jira/pricing) |

## Airtable

가격·조건: 무료 플랜과 유료 편집 권한 기반 과금, 레코드·첨부·자동화·API 한도를 안내했다. 기본 표·칸반·캘린더만 설명했으며 유료 간트·고급 권한을 무료 기능으로 묶지 않았다. [가격표](https://airtable.com/pricing)
한국어·플랫폼: 전체 UI의 한국어 지원은 공식 확인이 부족해 확인 필요로 표기했다. 다운로드 페이지가 macOS·Windows·iOS·Android를 안내한다. [앱 다운로드](https://www.airtable.com/downloads)
업데이트: 공식 What's New의 개별 최신 게시일을 추출·검증하지 못해 publishedAt=null, 정확한 날짜 미확인 문구를 유지했다. 예정 웹 세미나를 출시 근거로 쓰지 않았다. [제품 변경](https://www.airtable.com/whatsnew)
공급사: 2026-09-04 공식 발표에서 Bending Spoons 인수 완료를 확인해 Airtable (Bending Spoons)로 기재했다. 기업 인수 날짜를 제품 출시일로 사용하지 않았다. [공식 인수 발표](https://www.airtable.com/newsroom/airtable-joins-bending-spoons)

| 기능 주장 | 제공 범위·조건 | 공식 출처 |
| --- | --- | --- |
| 연결된 업무 데이터 — 표의 데이터를 연결해 프로젝트와 운영 정보를 관리합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://www.airtable.com/platform/connected-data) |
| 다양한 데이터 보기 — 표·칸반·캘린더 등으로 같은 데이터를 목적에 맞게 살펴봅니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://www.airtable.com/platform/views) |
| 맞춤 업무 화면 — 데이터를 바탕으로 팀이 사용할 인터페이스를 구성합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://www.airtable.com/platform/interface-designer) |
| 트리거·액션 자동화 — 데이터 변경을 시작점으로 알림과 여러 단계의 업무 흐름을 실행합니다. | 자동화·API에는 플랜별 이용 한도가 적용됩니다. | [근거](https://www.airtable.com/platform/automations) |

## Miro

가격·조건: 무료 최근 보드 3개 편집, 문서·표·칸반, Starter 타이머·투표, Business의 양방향 업무 동기화를 구분했다. AI·프로토타입 조건은 해당 플랜에서 확인하도록 안내했다. [가격표](https://miro.com/pricing/)
한국어: 한국어 도움말 페이지가 있다는 사실만으로 제품 UI 지원을 확정하지 않았다. 확인한 공식 UI 언어 목록에 한국어가 없어 확인 필요로 표기했다. [언어 설정](https://help.miro.com/hc/ko-kr/articles/4957762934802-%EC%96%B8%EC%96%B4-%EC%84%A4%EC%A0%95)
플랫폼: 공식 다운로드 페이지에 iOS·Android·macOS·Windows가 있다. [앱 다운로드](https://miro.com/apps/)
업데이트: 조사 시 공식 변경 페이지에서 확인한 2026-06-22 프로토타입 대안·Claude Design 연결 항목이다. 해당 일자가 전체 Miro의 모든 채널을 통틀어 마지막 배포라는 뜻은 아니다. [변경 기록](https://miro.com/changelog/)

| 기능 주장 | 제공 범위·조건 | 공식 출처 |
| --- | --- | --- |
| 협업 캔버스 — 보드에서 아이디어와 자료를 공유하고 함께 편집합니다. | 무료 플랜은 최근 보드 3개를 편집할 수 있습니다. | [근거](https://miro.com/pricing/) |
| 문서·표·칸반 — 보드 위에서 문서·표·칸반 등으로 정보를 구조화합니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://miro.com/pricing/) |
| 워크숍 도구 — 타이머·투표로 팀 워크숍을 진행합니다. | Starter 이상에서 제공합니다. | [근거](https://miro.com/pricing/) |
| 양방향 업무 동기화 — Jira·Asana·Linear·ClickUp 등과 계획 데이터를 연결합니다. | Business 이상이며 연결 서비스의 계정과 권한이 필요합니다. | [근거](https://miro.com/pricing/) |

## Microsoft Teams

가격·조건: 공식 Teams 가격 페이지와 Microsoft 배포 앱 설명을 확인했다. 무료 버전·Essentials·Microsoft 365 구독을 구분하며, 회의 규모·저장 공간·녹화·기록·Copilot은 플랜·정책 조건을 남겼다. [비즈니스 플랜](https://www.microsoft.com/en-us/microsoft-teams/compare-microsoft-teams-business-options), [기록·자막 정책](https://learn.microsoft.com/en-us/microsoftteams/meeting-transcription-captions)
한국어: Microsoft Corporation 배포 App Store 메타데이터의 KO를 확인해 모바일 앱 지원으로 범위를 제한했다. 데스크톱 UI 및 한국어 자막 기능을 같은 근거로 확정하지 않았다. [공식 앱](https://apps.apple.com/us/app/microsoft-teams/id1113153706)
업데이트: Apple 공식 lookup의 currentVersionReleaseDate=2026-09-11T22:34:57Z, version=8.16.2, iOS 17.0 이상을 확인했다. 공개 노트는 버그 수정·성능 개선이며 구체적 항목은 없었다. App Store의 상대 날짜 대신 UTC 원본 날짜를 썼고 웹·데스크톱 릴리스로 확대하지 않았다. [공식 앱 메타데이터](https://itunes.apple.com/lookup?id=1113153706)
별도 판촉 발견: 공식 가격 페이지의 Copilot Business 한시 할인은 2026-07-01~12-31, 기존 적격 Business 고객·연간 약정 첫해·자동 갱신 조건이다. Teams 자체 할인으로 적거나 카탈로그 기본 가격에 합치지 않았다. [비즈니스 플랜 각주](https://www.microsoft.com/en-us/microsoft-teams/compare-microsoft-teams-business-options)

| 기능 주장 | 제공 범위·조건 | 공식 출처 |
| --- | --- | --- |
| 채팅·팀 대화 — 개인 및 팀 대화에 업무 맥락과 자료를 모읍니다. | 제품 지원 확인; 사용량·계정 조건은 가격표 참조 | [근거](https://www.microsoft.com/en-us/microsoft-teams/compare-microsoft-teams-business-options) |
| 온라인 회의 — 음성·영상 통화와 화면 공유로 회의를 진행합니다. | 회의 시간과 참가자 수는 계정·플랜별로 다릅니다. | [근거](https://www.microsoft.com/en-us/microsoft-teams/compare-microsoft-teams-business-options) |
| 파일 공유·공동 작업 — 파일과 작업을 공유하며 팀 업무를 이어갑니다. | 저장 공간과 Office 앱 범위는 Microsoft 365·Teams 구독에 따라 다릅니다. | [근거](https://www.microsoft.com/en-us/microsoft-teams/compare-microsoft-teams-business-options) |
| 녹화·대화 기록 — 회의 내용을 녹화하고 대화 기록을 확인합니다. | 플랜·관리자 정책·지원 언어에 따라 제공 범위가 달라집니다. | [근거](https://www.microsoft.com/en-us/microsoft-teams/compare-microsoft-teams-business-options) |

## 공식 로고 원본 및 통합 안내

8개 로고를 모두 실제 파일로 확보하고 시각적으로 확인했다. 아래 map에 기록된 8개만 각 sitePath로 복사하면 된다. ZIP·reference.png·공식 HTML·앱 조회 JSON은 조사/검증용이며 게시 대상이 아니다. 로고 재디자인·재색칠·생성 이미지 대체는 하지 않았다.

| 도구 | 로컬 파일 | Site 경로 | 공식 자산을 확인한 페이지 |
| --- | --- | --- | --- |
| airtable | `/private/tmp/ais-v22-saas-assets/airtable.png` | `/logos/airtable.png` | [원문](https://www.airtable.com/) |
| asana | `/private/tmp/ais-v22-saas-assets/asana.ico` | `/logos/asana.ico` | [원문](https://asana.com/) |
| clickup | `/private/tmp/ais-v22-saas-assets/clickup.png` | `/logos/clickup.png` | [원문](https://clickup.com/) |
| jira | `/private/tmp/ais-v22-saas-assets/jira.svg` | `/logos/jira.svg` | [원문](https://atlassian.design/foundations/logos) |
| microsoft-teams | `/private/tmp/ais-v22-saas-assets/microsoft-teams.jpg` | `/logos/microsoft-teams.jpg` | [원문](https://apps.apple.com/us/app/microsoft-teams/id1113153706) |
| miro | `/private/tmp/ais-v22-saas-assets/miro.png` | `/logos/miro.png` | [원문](https://miro.com/) |
| monday | `/private/tmp/ais-v22-saas-assets/monday.png` | `/logos/monday.png` | [원문](https://monday.com/) |
| trello | `/private/tmp/ais-v22-saas-assets/trello.svg` | `/logos/trello.svg` | [원문](https://atlassian.design/foundations/logos) |

- Asana는 공개 공식 favicon ICO다. 별도 브랜드 CDN 자산은 인증이 필요하여 사용하지 않았다. PNG 변환본은 검사 전용이고 실제 ICO를 전달한다.
- Airtable은 URL 확장자와 응답 MIME이 ico이지만 실제 바이트는 48px PNG이므로 .png로 보관했다. 원본 해상도에 맞는 작은 아이콘 용도로 사용한다.
- Jira·Trello는 [Atlassian 공식 로고 패키지](https://atlassian.design/foundations/logos)의 제품 icon SVG를 그대로 추출했다. 원본 아이콘의 색·형상·모서리를 유지하고 제품 이름과 함께 사용한다.
- Microsoft Teams는 Microsoft Corporation이 App Store에 배포한 현재 512px 제품 아이콘이다. 일반 Microsoft 회사 로고가 아니다. 원본 JPG를 그대로 보관했다.
- monday.com·ClickUp·Miro는 공식 제품 홈페이지가 선언한 favicon/apple-touch-icon의 실제 URL을 확인했다.
- 전체 원본 자산 URL, ZIP 내부 경로, 크기, SHA-256은 `/private/tmp/ais-v22-saas-logo-map.json`에 기록했다.

## 검증 및 남은 범위

JSON 구조·필수 필드·기능 수·기존 ID와의 중복·날짜 형식·로고 파일 존재 및 SHA-256·SVG 외부 스크립트 여부를 검증했다. 직접 계정에 가입하여 유료 기능을 실행한 검증은 수행하지 않았다. 제품 사용 점수·성능 우열은 산출하지 않았다. 기능 출처와 가격 조건은 서로 같은 제품/배포형태인지 확인했다.
