# AIs 카탈로그 V5 공식 출처 감사 — SaaS 9개 + GitHub Copilot

확인일: **2026-09-12** (Asia/Seoul). 마지막 시간 확인: 2026-09-12 08:00 UTC.

대상: `/Users/bigmac_moon/dev/ai_score/site/data/catalog.json`의 notion, figma, canva, slack, zapier, make, linear, supabase, vercel, github-copilot, 총 10개. 사이트·Git·브라우저 UI 수정 없음. 현재 기능 35개를 각 연결 출처와 대조했다. 금액을 새로 제시하지 않았으며, 한국어 `확인 필요`는 미지원 판정이 아니다.

## 먼저 반영할 수정

1. **GitHub Copilot 최신 공지 교체.** 기존 2026-09-10 주간 릴리스는 사실이지만 최신이 아니다. 공식 Copilot RSS의 첫 항목은 2026-09-11 **Add VS Code Agents to Copilot usage metrics**다. 제목: `VS Code Agents 사용 지표 추가`. 요약: `조직·엔터프라이즈의 Copilot 사용 보고서에 VS Code Agents 창의 활성 사용자·세션·메시지 지표가 추가되었습니다.` 날짜: `2026-09-11`. 출처: https://github.blog/changelog/2026-09-11-add-vs-code-agents-to-copilot-usage-metrics/ . 대상: `Copilot 지표 조회 권한 보유자 · 사용 지표 정책 활성화 필요`. 배포: `일반 제공`. 원문은 일반 편집기 Agent Mode와 별도 집계임을 명시한다.
2. **Copilot feedScope 교체.** 현재 URL `https://github.blog/changelog/label/copilot/feed/`는 Copilot 전용 피드다. `GitHub 전체 변경 소식; Copilot 항목 필터링 필요` → `GitHub Copilot 변경 소식`.
3. **Vercel 최신 요약은 본문 기준으로 수정.** 현재 최신 SDK·CLI 및 이미지 조건은 페이지의 메타 설명과 일치하지만, HTTP 200 HTML의 실제 본문은 모든 Sandbox가 64GB를 제공하며 Managed/custom image 및 deprecated `runtime` 방식도 포함한다고 설명한다. 제안: `Sandbox 기본 저장 공간이 32GB에서 64GB로 확대되었으며, 이미지와 기존 runtime 방식으로 생성하는 Sandbox도 포함합니다.` 날짜 2026-09-11 유지. 대상 `Vercel Sandbox 사용자`, 배포 `제공 중`. 출처: https://vercel.com/changelog/vercel-sandbox-64-gb-storage . 웹 텍스트 도구는 이 글의 본문을 누락했고 ordinary HTTP HTML에서 본문과 `<time dateTime="2026-09-11T00:00-06:00">`를 확인했다.
4. **Notion 최신 공지 표현 정밀화.** `에이전트별 허용 모델`은 개별 에이전트마다 제어한다는 의미로 읽힐 수 있다. 실제 원문은 Notion Agent와 Custom Agents의 모델 허용 목록을 각각 정하고 Custom Agents 기본 모델도 정하는 기능이다. 제안: `Business·Enterprise 워크스페이스 소유자가 Notion Agent와 Custom Agents에서 허용할 AI 모델을 각각 관리할 수 있습니다.` audience `Business·Enterprise 워크스페이스 소유자`, rollout `제공 중`. https://www.notion.com/releases/2026-09-09 . 최초 직접 열기는 도구 내부 오류였으나 공식 릴리스 목록 링크로 다시 열어 성공했다.
5. **Canva 동시 작업 기능의 출처 강화.** 현재 `/logos/`는 댓글·공유·협업을 설명하지만 요금표가 `Real-time collaboration`과 `Comments`를 함께 명시한다. 현재 설명은 유지하고 해당 기능 `sourceUrl`을 `https://www.canva.com/pricing/`로 바꾸는 것이 더 직접적이다.

## notion — PASS, 최신 요약 표현 정밀화

공식 홈페이지 `https://www.notion.com/` 확인. 제공사 Notion Labs는 공식 푸터로 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 데이터베이스 보기 | PASS. 표와 여러 보기, 보드·캘린더를 설명한다. |
| 속성·필터·정렬 | PASS. 속성 추가, 마감일, 필터·정렬 절차가 직접 있다. |
| AI 데이터베이스 생성 | PASS conditional. 설명→미리보기→조정→완료 절차가 있다. Business/Enterprise는 이용량 허용 범위가 있고 다른 플랜은 워크스페이스 크레딧을 이용한다. |

위 3개 기능의 연결 출처: https://www.notion.com/help/create-a-database . 현재 제한 설명도 일치. 보충 가능: 이 AI 생성 흐름은 새 데이터베이스용이며 기존 DB 편집, DB 내 페이지·자동화·폼·차트·페이지 템플릿 생성은 지원하지 않는다고 문서가 구분한다.

가격 PASS: Free와 유료 구독, Custom Agents의 크레딧 구조 확인. 파일·협업 제한도 요금표와 일치. https://www.notion.com/pricing .

한국어 PASS: 현재 언어 목록에 Korean 포함. https://www.notion.com/en-gb/help/change-your-language . 플랫폼 PASS: 웹·데스크톱·모바일. https://www.notion.com/desktop , https://www.notion.com/mobile .

최신 항목/날짜 PASS: 2026-09-09, **Control which AI models your agents can use**. 공식 목록의 첫 항목이며 세부 원문도 존재. https://www.notion.com/releases , https://www.notion.com/releases/2026-09-09 . 위 수정 4 권장.

로고 PASS: 홈페이지 `apple-touch-icon` 등 실제 링크와 현재 로컬 PNG 바이트 일치. `https://www.notion.com/front-static/logo-ios.png`.

## figma — PASS

공식 홈페이지 `https://www.figma.com/` 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 공동 디자인 | PASS. 파일 공유·편집 권한·댓글 기능, 디자인 페이지의 공동 캔버스로 확인. |
| 프로토타입 | PASS. 요금표의 interactive prototypes 및 인터랙션 설명으로 확인. |
| 개발 전달·고급 기능 | PASS conditional. Dev Mode, 고급 프로토타입, Full/Dev/Collab 좌석과 플랜별 구분 확인. |

기능 연결 출처 https://www.figma.com/pricing/ 확인. 보강 공식 제품 페이지 https://www.figma.com/design/ . 무료 Starter와 좌석별 유료 구조, AI 사용량 제한 모두 PASS.

한국어·플랫폼 PASS: 다운로드 페이지 본문이 웹·데스크톱·모바일의 한국어 UI와 macOS/Windows/iOS/Android를 직접 열거한다. https://www.figma.com/downloads/ . **선택 보강**: 모바일은 디자인 파일 확인·댓글·프로토타입 실행·미러링 중심이며 데스크톱과 기능 범위가 같다는 뜻은 아니다. https://help.figma.com/hc/en-us/articles/1500007537281-Guide-to-the-Figma-mobile-app . 현재 플랫폼 목록 자체는 맞다.

최신 PASS: **Control opacity at scale**, 2026-09-03. 색상 변수의 연결을 유지하며 숫자 변수로 불투명도를 제어한다는 요약 일치. 공식 목록과 Atom 첫 항목 일치. https://www.figma.com/release-notes/ , https://www.figma.com/release-notes/feed/atom.xml . 일반 출시 항목으로 표시되나 구체적 좌석 대상은 해당 글에서 확정하지 않아 audience의 불확실성 유지 가능.

로고 PASS: 홈페이지 icon 링크로 `https://static.figma.com/app/icon/2/icon-256.png` 확인. 로컬과 동일 바이트.

## canva — 내용 PASS, 기능 출처 강화, 로고 출처는 이전 관찰 증빙

공식 홈페이지 `https://www.canva.com/` 및 한국어 페이지 `https://www.canva.com/ko_kr/`의 웹 본문 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 템플릿 기반 제작 | PASS. 요금표에 디자인 템플릿 및 디자인·출판 기능 포함. |
| 동시 작업과 댓글 | 설명 PASS. `/logos/`의 댓글·공유보다 요금표의 Real-time collaboration/Comments가 더 직접적이므로 sourceUrl 교체 권장. |
| AI 편집과 브랜드 관리 | PASS conditional. 배경 제거, 크기 변경, Brand Kits, 플랜별 AI allowance 확인. |

기능·가격: https://www.canva.com/pricing/ (현재 인도 영어 요금표로 리다이렉트되지만 공식 페이지다. 통화 금액은 사용하지 않음), https://www.canva.com/logos/ . Free/Pro/Business/Enterprise 구조와 프리미엄·AI·브랜드 키트 제한 PASS. 무료에도 제한된 Brand Kit가 있으므로 브랜드 관리 전체가 유료라고 일반화하지 않아야 한다. 현재 문구는 그런 주장을 하지 않는다.

한국어 PASS: 한국어 제품 홈페이지와 공식 AI 언어 안내 및 현재 요금표의 Korean 목록. https://www.canva.com/ko_kr/newsroom/news/canva-ai-languages/ . 플랫폼 PASS: 공식 `/logos/`의 모바일→데스크톱 안내 및 웹 앱 확인.

최신 표시 PASS: https://www.canva.com/launches/ 에 brand components, 동영상 및 이미지 편집 출시 기능이 있고 정확 게시일이 명확하지 않다. 현재 `publishedAt:null`과 공식 출시 페이지라는 제목은 정직한 표현이다. 특정 항목의 일괄 배포·유료 대상을 단정하면 안 된다.

로고 CURRENT BYTES PASS / FRESH ORIGIN UNAVAILABLE: `https://static.canva.com/domain-assets/canva/static/images/android-192x192-2.png`를 HTTP 200으로 재취득했고 로컬 PNG와 동일했다. ordinary 홈페이지 HTML은 403으로 현재 rel-icon 원점은 재관찰하지 못했다. 이전 연구 기록 `/private/tmp/ais-saas-research-notes.md`는 공식 한국어 홈페이지의 live DOM에서 이 아이콘 링크를 관찰했다고 명시한다. 따라서 **이전 공식 페이지 관찰 + 현재 원격/로컬 동일성** 증빙이며, 이번 감사에서 홈페이지 메타데이터를 새로 확인했다고 표기하지 말 것. 교체할 이유는 발견되지 않았다.

## slack — PASS

공식 홈페이지 `https://slack.com/` 및 Salesforce 소속 공식 푸터 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 채널과 메시지 | PASS. 프로젝트·주제별 채널, 메시지·파일 공유 설명. https://slack.com/intl/ko-kr/features |
| 허들 | PASS conditional. 무료 1:1, 유료 그룹 및 음성·영상·화면 공유 설명. |
| 앱 연동 | PASS conditional. Free의 연결 앱 수 제한을 명시. |
| AI 요약 | PASS conditional. 대화 요약과 허들 노트가 있고 AI 기능은 플랜별 구분. |

후자 3개 및 가격·제한 출처: https://slack.com/pricing . Free, Pro, Business+, Enterprise+ 구조와 무료 최근 90일 기록 접근 확인. 보충 가능: Free의 1년 이상 데이터 삭제 정책도 별도로 존재하지만 현재 90일 접근 문장은 맞다.

한국어 PASS: https://slack.com/help/articles/215058658-Manage-your-language-preferences . 플랫폼 PASS: https://slack.com/downloads/other 는 Mac/Windows/Linux/iOS/Android, 웹 접근을 안내한다.

최신 PASS: 공식 변경 기록 첫 부분은 **August 2026 / Slackbot big mode, skills improvements, and deep research**. 정확 일자가 없으므로 null 유지. big mode는 gradual rollout, 스킬 외부 공유·스킬 집합·deep research 내용 확인. https://slack.com/help/articles/115004846068-Slack-updates-and-changes. . rollout에 `큰 화면 모드 순차 배포`로 구체화 가능; 묶인 모든 항목을 전면 배포라고 표시하지 말 것.

로고 PASS: homepage shortcut icon `https://a.slack-edge.com/9cc0056/img/icons/favicon-32.png`와 로컬 동일. 작은 공식 favicon이므로 큰 크기에서는 선명도 제한이 있다.

## zapier — PASS

공식 홈페이지 `https://zapier.com/` 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 트리거·액션 자동화 | PASS. trigger 이벤트→앱 action 실행 및 연결 계정 설정을 직접 설명. https://zapier.com/blog/get-started-with-zapier/ |
| Tables·Forms | PASS. 구조화 데이터, 입력 폼이 플랫폼과 Free에 포함됨. |
| 다단계 워크플로 | PASS conditional. Free는 two-step, Professional은 multi-step이라고 구분. |

후자 2개 및 가격 출처 https://zapier.com/pricing . Free의 월별 작업 제한, task-based 유료 구조와 추가 제품 확인. 연결 앱마다 가능한 트리거·액션과 권한이 다르다는 제한도 시작 가이드와 일치. 웹 플랫폼 PASS. 한국어 `확인 필요` 유지: 이번 공식 출처에서 한국어 UI 지원은 확인하지 못했다.

최신 표시 PASS: https://zapier.com/blog/updates 는 신규 앱·기능 목록이며, 제품 전체 최신일이라고 단정하지 않는 null 표시가 적절하다.

로고 PASS: 홈페이지 실제 icon 링크 `https://zapier.com/favicon.ico`, 로컬과 동일.

## make — PASS, 크레딧 제한 문구 보강 권장

공식 홈페이지 `https://www.make.com/` 및 `https://www.make.com/en/about` 확인. About은 Celonis 소속을 명시한다.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 시각적 워크플로 | PASS. no-code visual workflow builder를 명시. |
| 라우터·필터 | PASS. Free에도 포함. |
| 예약 실행 | PASS conditional. 무료 15분, 유료 1분 최소 간격을 구분. |
| Make AI Agents | PASS conditional. 현재 요금표가 beta 표기하며 Make AI Provider와 자체 LLM 연결을 구분. |

4개 연결 출처: https://www.make.com/en/pricing . Free와 credits 기반 요금, 무료 활성 시나리오·실행 간격 제한 확인. AI 제공자·토큰에 따라 크레딧 방식이 다른 점은 https://help.make.com/credit-usage-for-ai-agents 및 https://help.make.com/credits 에서 추가 확인. 자체 AI provider 연결은 유료 플랜 대상이며 Make 제공 AI는 모든 플랜에서 이용 가능하다고 설명한다.

제한의 `크레딧 소진 시 실행이 멈출 수 있습니다`는 가능성 문장으로 유의미하나 이번에 읽은 credits 문서는 소진 후 업그레이드·추가 구매·자동 구매 선택을 직접 명시한다. 더 직접적인 원문 대응 문구: `크레딧이 소진되면 업그레이드나 추가 크레딧 구매가 필요할 수 있습니다.` 추가 sourceUrl로 credits 문서 권장. 웹 플랫폼 PASS. 한국어 UI는 확인 필요 유지.

최신 PASS: **Greenhouse Recruiting Client Credentials auth, new OpenAI model, and other app updates**, 2026-09-11. https://help.make.com/2026 의 ordinary HTTP 200 본문에서 Greenhouse 인증, WordPress 수정, OpenAI 기능 확대와 날짜를 직접 재확인했다. 텍스트 웹 도구는 이 페이지를 5줄로 불완전하게 추출하므로 HTTP 본문 영수증을 함께 보존했다. https://www.make.com/en/whats-new 또한 공식 업데이트 인덱스다. 대상 `해당 앱 모듈을 이용하는 사용자`, 배포 `변경 기록에 반영됨; 개별 연결 조건 확인` 정도로 표현 가능.

로고 PASS: `https://help.make.com/` HTTP 200의 shortcut icon이 정확히 `https://archbee-image-uploads.s3.amazonaws.com/oAyFj2GHlBeBVWF5OAir2/tc7eidumLSpPBQvwpAMR0_favn-1.ico`를 가리킨다. 공식 도움말이 사용하는 Archbee 호스팅 자산임을 재검증했고 로컬 ICO와 동일하다.

## linear — PASS

공식 홈페이지 `https://linear.app/` 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 이슈와 사이클 | PASS. issue tracking and cycle planning을 직접 안내. |
| 프로젝트와 이니셔티브 | PASS. projects and initiatives를 직접 안내. |
| 타사 앱 승인 | PASS conditional. paid plans에서 관리자가 설치 전에 검토·승인할 수 있음. |

앞 2개 출처 https://linear.app/features . 앱 승인 출처 https://linear.app/changelog/2026-09-03-priority-inbox .

가격·제한 PASS: https://linear.app/pricing 은 Free/Basic/Business/Enterprise와 Free의 팀·이슈 제한을 명시. 플랫폼 PASS: https://linear.app/download 는 웹, macOS, Windows, iOS, Android를 직접 열거. 한국어 UI `확인 필요` 유지.

최신 PASS: **Priority inbox**, 2026-09-03. 공식 변경 목록 및 RSS 첫 항목과 일치. 기본 중요 알림 분리와 사용자 필터 설정 요약 맞음. https://linear.app/changelog , https://linear.app/rss/changelog.xml . 앱 승인만 유료 조건이 명시되어 있으므로 Priority inbox 자체에도 같은 유료 제한이 있다고 확장하지 말 것.

로고 PASS: 홈페이지 apple-touch-icon `https://linear.app/static/apple-touch-icon.png?v=2`와 로컬 동일.

## supabase — PASS

공식 홈페이지 `https://supabase.com/` 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| Postgres와 데이터 API | PASS. full Postgres 및 REST API를 직접 안내. |
| 인증 | PASS. signup/login과 RLS를 안내. |
| 스토리지·실시간 데이터 | PASS. 파일 저장과 real-time synchronization을 직접 안내. |
| 프로젝트 자원 확장 | PASS conditional. 플랜별 포함 자원과 초과 리소스 요금 구분. |

앞 3개 출처 https://supabase.com/ . 자원·가격·제한 출처 https://supabase.com/pricing . Free와 사용량 기반 유료 구조 확인. 무료 프로젝트는 1주 비활성 후 pause라고 명시하여 현재 완곡한 제한 문구는 맞다. RLS와 운영 설계 문장은 공식 제품 기능에 근거한 실무 안내이며 보증 문구는 아니다.

플랫폼 PASS: 대시보드/REST API 및 CLI. https://supabase.com/docs , https://supabase.com/docs/guides/local-development . 한국어 UI `확인 필요` 유지.

최신 PASS: **Read replicas moved to Project Settings → Infrastructure**, 2026-08-21. 공식 changelog와 changelog RSS의 첫 항목 일치. 이전 Replication의 관리 위치가 바뀌었다는 내용 확인. https://supabase.com/changelog/read-replicas-moved-to-infrastructure , https://supabase.com/changelog-rss.xml . 대상 `읽기 복제본을 관리하는 사용자`, 배포 `대시보드 반영됨`으로 구체화 가능.

로고 PASS: 홈페이지 icon 링크 `https://supabase.com/favicon/favicon-196x196.png`와 로컬 동일.

## vercel — 기능·가격 PASS, 최신 요약 수정

공식 홈페이지 `https://vercel.com/` 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 저장소 기반 배포 | PASS. Import repo / automatic CI/CD를 직접 설명. |
| CDN·컴퓨팅 | PASS. 전송과 Functions/Compute 포함. |
| 트래픽·성능 확인 | PASS. Traffic & performance insights를 직접 안내. |
| Hobby 플랜 | PASS conditional. 무료 개인 프로젝트, 개인·비상업용 조건 일치. |

4개 연결 출처 https://vercel.com/pricing . Hobby/Pro/Enterprise 구조, 포함량·추가 사용 과금과 한도 확인. 비상업 조건은 https://vercel.com/docs/plans/hobby 에서도 재확인.

플랫폼 PASS: 웹 콘솔 및 https://vercel.com/docs/cli . 한국어 UI `확인 필요` 유지.

최신 날짜 PASS: 2026-09-11. 다만 요약은 위 수정 3 참조. 공식 changelog 첫날/첫항목과 일치. https://vercel.com/changelog . 실제 글의 HTML 본문이 metadata보다 적용 대상을 넓게 설명하므로 본문 우선.

로고 PASS: 홈페이지 apple-touch-icon `https://assets.vercel.com/image/upload/q_auto/front/favicon/vercel/apple-touch-icon-256x256.png`와 로컬 동일.

## github-copilot — 기능·가격·브랜드 PASS, 최신/피드 수정

공식 홈페이지 `https://github.com/features/copilot` 확인.

| 현재 기능 | 판정과 근거 |
| --- | --- |
| 코드 제안 | PASS. IDE 입력 중 제안 직접 명시. |
| 코드 대화 | PASS. 코드 질문·도움 직접 명시. |
| 개발 작업 위임 | PASS conditional. research/plan/code changes/검토용 PR 생성 직접 명시. |
| 크레딧 기반 사용량 | PASS conditional. 각 개인 플랜 monthly AI credits와 조직별 포함량·pool 설명. |

앞 3개 출처 https://docs.github.com/en/copilot/get-started/what-is-github-copilot . 크레딧 출처 https://docs.github.com/en/billing/concepts/product-billing/github-copilot-billing . Free 플랜 명시. IDE/GitHub 웹/GitHub Mobile/데스크톱 Copilot app/CLI를 모두 직접 나열하여 플랫폼 PASS. 관리자 접근 정책과 모델 종료 가능성은 합리적 조건이며, 현재 한국어 범위 `확인 필요` 유지.

기존 9월 10일 주간 요약은 실제 본문과 일치하지만 최신 표시에서는 교체 필요. CLI HydraFusion은 experimental, VS Code 자동화와 JetBrains 관리 제어는 public preview라는 조건을 기존 주간 기록을 보존할 때도 유지할 것. https://github.blog/changelog/2026-09-10-github-copilot-weekly-releases-september-7/ . 새 최신 항목은 위 수정 1. RSS는 HTTP 200의 실제 RSS이며 최신 첫 항목 pubDate는 2026-09-11 21:30:30 UTC. https://github.blog/changelog/label/copilot/feed/ .

로고 PASS **제공사 마크**: 현재 homepage favicon `https://github.githubassets.com/favicons/favicon.svg`와 로컬 SVG 동일. `logoNote: GitHub 공식 마크`가 정확하다. 공식 브랜드 가이드는 2025년부터 기존 Copilot 아이콘을 중심으로 한 단독 로고를 폐기했고 GitHub 마크와 제품명 조합을 설명한다. https://brand.github.com/brand-identity/copilot . 과거 로봇 심볼을 현재 독립 제품 로고로 바꾸지 않을 것. 이전 정밀 조사 영수증: `/private/tmp/ais-ai-logos/product-logo-update.json`.

## 검증 영수증과 한계

- `/private/tmp/ais-saas-logo-receipts-v5.json`: 10개 원격 자산 HTTP 200, 로컬과 바이트 및 SHA256 동일. 홈페이지→asset rel-icon 새 확인은 Canva를 제외한 9개. Make는 공식 help.make.com 메타데이터로 확인.
- `/private/tmp/ais-saas-update-receipts-v5.json`: Make/Vercel HTTP 본문·게시일, Copilot/Figma/Linear/Supabase RSS·Atom 구조와 최신 3항목.
- `/private/tmp/ais-saas-research-notes.md`: 이전 Canva 공식 한국어 홈페이지 live DOM 관찰 설명. `/private/tmp/ais-saas-downloaded-assets.json`, `/private/tmp/ais-saas-observed-assets.json`와 대조.
- 도구가 본문을 누락한 Make/Vercel은 일반 HTTP HTML로 보완했다. 로그인·보안 제한 우회나 브라우저 조작은 하지 않았다.
- `latestUpdate.audience`/`rollout`의 현재 공통 문구는 사실 단정은 아니지만, 위에서 원문으로 확인한 대상·상태가 있는 항목은 구체화 가능하다. 공개일 null인 Canva/Zapier/Slack에 일자를 임의로 채우지 않는다.
- 한국어 `확인 필요` 6개(GitHub Copilot, Zapier, Make, Linear, Supabase, Vercel)는 한국어 UI 또는 모든 AI 기능의 한국어 범위가 이번 자료로 확정되지 않았다는 뜻이다. 별도 확증 없이 `미지원`으로 바꾸지 않는다.

