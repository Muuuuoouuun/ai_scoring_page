import type { ToolEvaluation } from "@/lib/types";

/**
 * 도구 id → 조사 기반 평가 데이터.
 * 공식 체인지로그, 가격 페이지, G2/Capterra/Product Hunt 등 외부 사이트를 참고해 채웠습니다.
 * scripts/merge-research.js 로 생성됩니다. 조사 기준: 2026-09
 */
export const evaluations: Record<string, ToolEvaluation> = {
  // Notion
  "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a": {
    oneLine: "모듈형 워크스페이스로 문서·DB·AI 에이전트를 통합하지만, AI 전면 사용은 Business 요금제($20/월)로만 열립니다.",
    scoreBreakdown: { functionality: 90, uiux: 86, reliability: 80, comfort: 71, pricing: 60 },
    keyFeatures: [
      "Notion Agent — 20분 이상 걸리는 멀티스텝 작업을 자율 수행하는 개인 AI 에이전트",
      "Custom Agents — 트리거·스케줄 기반 24/7 자율 실행 에이전트(크레딧 과금)",
      "AI Meeting Notes — 모바일에서 회의를 백그라운드로 자동 전사·요약",
      "모델 선택 — GPT-5.2·Claude Opus 4.5·Gemini 3 중 선택 또는 Auto 모드",
      "대시보드 뷰 — 차트·KPI·지표를 한 화면에 모으는 데이터베이스 대시보드",
      "Notion Workers — 외부 데이터 동기화·커스텀 에이전트 도구를 호스팅형으로 배포"
    ],
    pricingSummary: "Free는 $0, Plus는 $10/월(연간, 월간 $12), Business는 $20/월(연간, 월간 $24)이며 Enterprise는 별도 협의입니다. 2025년 5월부터 별도 AI 애드온이 사라지고 무제한 AI가 Business 이상 전용으로 바뀌며 사실상 가격이 인상됐습니다.",
    koreaNote: "한국어 UI와 AI 응답 품질은 안정적인 편이지만, 국내 세금계산서 발행이 기본 지원되지 않아 기업 도입 시 결제 방식을 별도로 확인해야 합니다.",
    comparisons: [
      {
        competitor: "Coda",
        worksBetterHere: "AI Meeting Notes 자동 전사와 24/7 자율 실행되는 Custom Agents 등 완성도 높은 에이전트 기능을 기본 제공합니다.",
        weakerHere: "Coda는 보는 사람은 무료인 Doc Maker 과금 방식과 표 기반 Packs 자동화로 대규모 내부 툴 구축에서 더 저렴하고 유리합니다."
      },
      {
        competitor: "Confluence",
        worksBetterHere: "블록 에디터 하나로 문서·칸반·데이터베이스를 자유롭게 섞을 수 있어 온보딩과 구조 변경이 훨씬 빠릅니다.",
        weakerHere: "Confluence는 Jira 네이티브 연동과 무제한 버전 기록이 강력하고, Rovo AI는 약 $5.42/유저로 Notion Business($20)보다 AI 도입 비용이 저렴합니다."
      },
      {
        competitor: "Obsidian",
        worksBetterHere: "클라우드 기반 실시간 공동 편집과 Business 플랜의 AI 에이전트가 기본 내장되어 있습니다.",
        weakerHere: "Obsidian은 로컬 마크다운 파일로 저장돼 벤더 락인이 없고 오프라인에서도 완전히 동작하며, 2026년 추가된 Sync 기반 실시간 협업도 구독료 없이 저렴합니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-02-24",
        title: "Notion 3.3 - Custom Agents",
        change: "트리거·스케줄 기반으로 24/7 자율 실행되는 Custom Agents가 도입되었습니다.",
        errorRisk: "크레딧 종량제(1,000크레딧당 $10)라 자동화가 늘수록 비용이 예측보다 커질 수 있습니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-01-20",
        title: "Notion 3.2 - 모바일 AI·모델 선택",
        change: "모바일 백그라운드 회의 전사, People Directory, GPT-5.2·Claude Opus 4.5·Gemini 3 모델 선택 기능이 추가되었습니다.",
        errorRisk: "모델별로 응답 품질·속도·크레딧 소모가 달라 팀 표준 모델 가이드가 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-09-18",
        title: "Notion 3.0 - Agents 출시",
        change: "20분 이상 이어지는 멀티스텝 작업을 자율 수행하는 개인 Notion Agent가 출시되었습니다.",
        errorRisk: "에이전트가 잘못된 페이지를 수정·삭제할 수 있어 중요 문서는 권한 분리가 필요합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-05",
        title: "AI 요금 체계 개편",
        change: "별도 AI 애드온($8/월)을 없애고 무제한 AI를 Business 플랜 이상에서만 제공하도록 변경했습니다.",
        errorRisk: "Plus 플랜에서 AI만 추가하던 팀은 좌석당 비용이 사실상 2배로 뛸 수 있습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "회의록 자동화",
        howToUse: "AI Meeting Notes로 회의를 자동 전사·요약하고, Notion Agent에게 액션 아이템을 담당자별 태스크 DB로 정리하도록 지시합니다.",
        recommendation: "에이전트가 생성한 태스크는 담당자가 24시간 내 직접 확인 후 확정하는 규칙을 두는 것이 좋습니다."
      },
      {
        title: "지식 베이스 정리",
        howToUse: "대시보드 뷰와 People Directory로 팀 현황·KPI를 한 페이지에 모으고, 부서별 위키 페이지를 데이터베이스로 연결합니다.",
        recommendation: "3개월 이상 갱신되지 않은 문서는 보관 처리하는 규칙을 정해 '죽은 위키'를 방지하세요."
      },
      {
        title: "반복 업무 자동화",
        howToUse: "Custom Agents에 트리거·스케줄을 설정해 주간 보고서 초안이나 인박스 정리를 24/7 자동 실행시킵니다.",
        recommendation: "크레딧 과금형이므로 자동화 전 예상 실행 횟수를 계산해 월 크레딧 한도를 초과하지 않도록 관리하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.6/5",
        note: "리뷰 11,962건 기준(5점 74%·4점 22%), 지식관리 카테고리 리더 3년 연속, 2026-09 확인",
        url: "https://www.g2.com/products/notion/reviews"
      },
      {
        source: "Capterra",
        score: "4.7/5 (확인 필요)",
        note: "다수 리뷰 기준 통상 언급되는 평점이나 이번 세션에서 원문 수치를 직접 재확인하지는 못했습니다.",
        url: "https://www.capterra.com/p/186596/Notion/reviews/"
      }
    ],
    sources: [
      { label: "Notion 공식 릴리스 노트", url: "https://www.notion.com/releases" },
      { label: "Notion 3.2 릴리스 노트 (2026-01-20)", url: "https://www.notion.com/releases/2026-01-20" },
      {
        label: "TechCrunch - Notion AI 에이전트 허브 전환 보도",
        url: "https://techcrunch.com/2026/05/13/notion-just-turned-its-workspace-into-a-hub-for-ai-agents/"
      },
      { label: "G2 - Notion 리뷰", url: "https://www.g2.com/products/notion/reviews" },
      {
        label: "Notion 요금제 변화 분석 (UserJot)",
        url: "https://userjot.com/blog/notion-pricing-2025-plans-ai-costs-explained"
      },
      {
        label: "Notion vs Confluence 가격 비교 (Docsie)",
        url: "https://www.docsie.io/blog/articles/confluence-vs-notion-pricing-comparison-2026/"
      },
      { label: "Notion vs Coda 비교 (Slite)", url: "https://slite.com/learn/notion-vs-coda" }
    ],
    researchedAt: "2026-09"
  },
  // Figma
  "55d7ad1a-4c1c-4e58-a2d6-40a00d092e2a": {
    oneLine: "디자인 협업의 사실상 표준이지만, Figma Make 등 생성 결과는 프로덕션 시스템에 그대로 쓰기 전 정리 작업이 필요합니다.",
    scoreBreakdown: { functionality: 92, uiux: 90, reliability: 74, comfort: 78, pricing: 64 },
    keyFeatures: [
      "Figma Make — 프롬프트로 프로토타입과 코드를 함께 생성하는 prompt-to-code 기능",
      "AI Design Agent — 캔버스 위에서 직접 UI를 생성하는 디자인 에이전트",
      "Figma Motion — 파일 안에서 바로 제작하는 프로덕션급 애니메이션",
      "MCP 서버 — 코딩 에이전트가 디자인 데이터에 접근하도록 지원",
      "생성형 플러그인·셰이더 — 프롬프트로 커스텀 플러그인을 직접 제작",
      "FigJam·Slides·Sites·Buzz — 화이트보드부터 브랜드 콘텐츠까지 시트에 기본 포함"
    ],
    pricingSummary: "Starter는 무료(파일 3개 제한), Professional Full seat은 $16/월(연간, 월간 $20), Organization $55/월, Enterprise $90/월이며, 2025년 3월부터 Full/Dev/Collab 시트 유형별 과금 구조로 전면 개편되었습니다.",
    koreaNote: "Figma는 한국어 인터페이스 지원이 제한적인 것으로 알려져 있어(확인 필요) 국내 디자인팀 상당수가 영어 UI로 사용하며, 2026년 일본 리전 데이터 레지던시가 추가된 것과 달리 한국 리전은 아직 제공되지 않습니다.",
    comparisons: [
      {
        competitor: "Adobe XD",
        worksBetterHere: "Figma Make·Motion 등 AI 기능이 계속 출시되는 반면 Adobe는 2023년 말 XD 개발을 중단하고 신규 라이선스 판매도 멈췄습니다.",
        weakerHere: "Adobe Creative Cloud를 이미 구독 중인 팀에게는 Photoshop·Illustrator와의 자산 핸드오프가 추가 비용 없이 더 매끄러웠습니다."
      },
      {
        competitor: "Sketch",
        worksBetterHere: "브라우저 기반 실시간 멀티플레이어 협업이 기본 제공되어 운영체제에 관계없이 동시 편집이 가능합니다.",
        weakerHere: "Sketch는 macOS 네이티브 앱으로 대형 파일 처리 속도·안정성이 강점이고, 일회성 구매 라이선스 옵션도 제공합니다."
      },
      {
        competitor: "Penpot",
        worksBetterHere: "Dev Mode, MCP 서버, Figma Make·Motion 등 AI 통합과 훨씬 방대한 플러그인 생태계를 갖추고 있습니다.",
        weakerHere: "Penpot은 오픈소스로 무료이며 자체 서버에 셀프호스팅할 수 있어 데이터 주권과 시트 비용 부담이 전혀 없습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-06",
        title: "Config 2026 - Motion·생성형 플러그인",
        change: "파일 내 프로덕션급 애니메이션 제작 도구 Figma Motion과 프롬프트로 만드는 생성형 플러그인·셰이더가 추가되었습니다.",
        errorRisk: "AI 크레딧을 소모하는 신규 기능이라 팀 단위 사용량 모니터링이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-07",
        title: "Figma MCP 서버 취약점 (CVE-2025-53967)",
        change: "Figma MCP 서버에서 원격 코드 실행이 가능한 커맨드 인젝션 취약점이 발견·보고되었습니다.",
        errorRisk: "AI 코딩 에이전트를 MCP로 연결한 조직은 즉시 패치·버전 업데이트가 필요합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-05-07",
        title: "Figma Make 공개 (Config 2025)",
        change: "텍스트·디자인만으로 작동하는 프로토타입과 코드를 생성하는 Figma Make가 베타로 공개되었습니다.",
        errorRisk: "생성 결과가 기존 디자인 시스템 컴포넌트를 따르지 않아 프로덕션 반영 시 정리 작업이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-03",
        title: "요금제 전면 개편",
        change: "Starter/Professional/Organization/Enterprise 4단계와 Full/Dev/Collab 시트 유형 기반 과금으로 구조가 바뀌었습니다.",
        errorRisk: "시트 유형을 잘못 배정하면 필요 이상 비용을 낼 수 있어 관리자의 정기적 시트 재점검이 필요합니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "빠른 프로토타이핑",
        howToUse: "Figma Make로 텍스트 설명만으로 초기 프로토타입과 작동하는 데모를 생성해 이해관계자에게 빠르게 공유합니다.",
        recommendation: "Make 결과물은 기존 디자인 시스템 컴포넌트를 따르지 않으므로, 프로덕션 반영 전 디자이너의 정리 작업을 반드시 거치세요."
      },
      {
        title: "직군 간 정렬",
        howToUse: "FigJam으로 기획·디자인·개발이 한 보드에서 요구사항을 정리하고, Dev Mode로 개발자가 직접 스펙(간격, 컬러 변수)을 확인합니다.",
        recommendation: "코멘트가 과도하게 쌓인 프레임은 별도 의사결정 문서로 결론만 요약해 옮기는 규칙을 두세요."
      },
      {
        title: "디자인 시스템 관리",
        howToUse: "Variables로 컬러·투명도를 라이브러리에 연결하고, Nested Folders로 파일이 늘어나도 체계적으로 정리합니다.",
        recommendation: "MCP 서버를 코딩 에이전트에 연결할 때는 CVE-2025-53967 사례를 참고해 항상 최신 버전으로 유지하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.7/5",
        note: "리뷰 약 1,550건 기준, 실시간 협업·직관적 UI가 주요 호평 포인트, 2026-09 확인",
        url: "https://www.g2.com/products/figma/reviews"
      },
      {
        source: "UX Tools 설문조사(재인용)",
        score: "82.3%",
        note: "제품 디자이너가 주력 디자인 툴로 Figma를 꼽은 비율, squareboat 블로그 재인용",
        url: "https://www.squareboat.com/blog/figma-vs-adobe-xd-vs-sketch"
      }
    ],
    sources: [
      { label: "Figma 공식 릴리스 노트", url: "https://www.figma.com/release-notes/" },
      {
        label: "Figma Config 2026 업데이트 (Help Center)",
        url: "https://help.figma.com/hc/en-us/articles/39582753756695-What-s-new-from-Config-2026"
      },
      {
        label: "The Hacker News - Figma MCP 취약점 보도",
        url: "https://thehackernews.com/2025/10/severe-figma-mcp-vulnerability-lets.html"
      },
      { label: "G2 - Figma 리뷰", url: "https://www.g2.com/products/figma/reviews" },
      { label: "Figma 요금제 분석 (Vendr)", url: "https://www.vendr.com/marketplace/figma" },
      {
        label: "Figma vs Adobe XD·Sketch 비교",
        url: "https://www.squareboat.com/blog/figma-vs-adobe-xd-vs-sketch"
      },
      { label: "Figma 주가·실적 정보 (stockanalysis.com)", url: "https://stockanalysis.com/stocks/fig/" }
    ],
    researchedAt: "2026-09"
  },
  // Slack
  "ef6b79b4-7c1e-4df0-95f1-9011f412e1cb": {
    oneLine: "실시간 협업 속도는 뛰어나지만, 2025~2026년 반복된 대규모 장애와 가격 인상이 신뢰도를 흔들고 있습니다.",
    scoreBreakdown: { functionality: 87, uiux: 82, reliability: 60, comfort: 64, pricing: 58 },
    keyFeatures: [
      "Slack AI 요약 — 채널·스레드 요약, 일일 리캡, 파일 요약과 번역",
      "Slackbot 에이전트화 — 지시만으로 메시지 발송·채널 생성·워크플로 설정 수행",
      "Agent Kit·Slackbot Skills — 재사용 가능한 AI 플레이북으로 몇 분 만에 에이전트 제작",
      "Deep Research·Big Mode — 인용 기반 심층 리포트를 작성하는 AI 작업공간",
      "Agentforce 연동 — Salesforce 에이전트가 채널 안에서 직접 응답·작업 수행",
      "Workflow Builder — 코드 없이 객체 컬렉션·리스트 필터링·반복 단계(Repeat) 구성"
    ],
    pricingSummary: "Free는 $0, Pro는 $7.25/월(연간, 월간 $8.75), Business+는 $15/월(연간, 월간 $18)이며 Enterprise+는 별도 협의입니다. 2025년 6월 Salesforce가 AI 애드온을 없애고 Business+ 요금을 약 20% 인상하며 AI를 기본 포함시켰습니다.",
    koreaNote: "한국어 인터페이스는 지원하지만 국내 세금계산서 발행이 되지 않아, 많은 한국 기업이 카카오워크·잔디 같은 국산 메신저를 병행 사용합니다.",
    comparisons: [
      {
        competitor: "Microsoft Teams",
        worksBetterHere: "Asana·Jira·Google Drive 등으로 이어지는 가장 넓은 서드파티 통합 생태계와 더 가벼운 채팅 전용 UX를 제공합니다.",
        weakerHere: "Teams는 Microsoft 365 라이선스에 무료로 포함되고 월간 활성 사용자 수가 Slack보다 훨씬 많아(3억6천만 대 7,900만) Office·SharePoint 연동이 훨씬 깊습니다."
      },
      {
        competitor: "Discord",
        worksBetterHere: "SSO, 컴플라이언스·eDiscovery, Salesforce Agentforce 연동 등 엔터프라이즈 관리 기능을 갖추고 있습니다.",
        weakerHere: "Discord는 무료로 메시지 기록 제한이 없고 상시 음성 채널이 강력한 반면, Slack Free 플랜은 90일 히스토리 제한이 있습니다."
      },
      {
        competitor: "Twist",
        worksBetterHere: "허들(음성·영상), 방대한 통합, 엔터프라이즈 키 관리 등 Twist에 없는 기능을 다수 제공합니다.",
        weakerHere: "Twist는 실시간 타이핑 표시나 '온라인' 상태 없이 설계돼 항상 켜져 있어야 한다는 압박과 알림 과부하를 구조적으로 줄여줍니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-01-13",
        title: "Slackbot의 AI 에이전트화",
        change: "Slackbot이 메시지 발송·채널 생성·워크플로 설정까지 지시만으로 수행하는 AI 에이전트로 전환되었습니다.",
        errorRisk: "에이전트가 사람 대신 채널을 만들거나 메시지를 보낼 수 있어 권한 범위 설정이 중요해졌습니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-11-10",
        title: "글로벌 장애 발생",
        change: "다수 이용자가 메시지 송수신 불가를 겪은 대규모 장애로 Downdetector에 신고가 급증했습니다.",
        errorRisk: "장애 발생 시 대체 커뮤니케이션 경로(이메일·전화)를 사전에 준비해야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-06",
        title: "가격·패키징 개편 (Salesforce)",
        change: "별도 AI 애드온을 없애고 Business+ 요금을 약 20% 인상($15/월)하며 AI 기능을 기본 포함시켰습니다.",
        errorRisk: "SSO가 Business+에 사실상 종속되며 예상보다 큰 비용 인상을 겪는 팀이 많습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-02-26",
        title: "대규모 장애 (약 10시간)",
        change: "데이터베이스 샤드 장애로 API가 붕괴되며 약 10시간 동안 서비스 장애가 발생했습니다.",
        errorRisk: "메시지 발송·채널 로딩이 장시간 불가능했던 만큼, 크리티컬 공지는 단일 채널에 의존하면 위험합니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "정보 과부하 방지",
        howToUse: "채널·스레드 요약과 일일 리캡 AI 기능을 활용해 긴 대화를 따라잡고, 알림은 중요 채널만 켜두도록 설정합니다.",
        recommendation: "휴가 복귀자나 신규 입사자는 요약 기능부터 켜서 스크롤 압박을 줄이는 것을 권장합니다."
      },
      {
        title: "고객 대응 자동화",
        howToUse: "Slackbot Skills와 Agent Kit로 CS·세일즈 채널에 반복 문의 응답 에이전트를 만들어 배치합니다.",
        recommendation: "Agentforce 등 CRM 연동 에이전트는 기본값으로 채널에 자동 노출되므로, 팀이 원치 않으면 관리자 설정에서 명시적으로 꺼두세요."
      },
      {
        title: "장애 대비 커뮤니케이션",
        howToUse: "핵심 공지·의사결정은 Slack 대신 문서 도구에도 반드시 백업하고, Workflow Builder로 상태 업데이트 경로를 이중화합니다.",
        recommendation: "2025~2026년 대형 장애 이력을 감안해 결제·배포 같은 크리티컬 알림은 Slack 단일 경로에 의존하지 마세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.5/5",
        note: "2026-08 기준 리뷰 다수, 자동화·통합 기능에 대한 긍정 평가",
        url: "https://www.g2.com/products/slack/reviews"
      },
      {
        source: "Capterra",
        score: "4.7/5 (확인 필요)",
        note: "다수 리뷰 기준 통상 언급되는 평점이나 이번 세션에서 원문 수치를 직접 재확인하지는 못했습니다.",
        url: "https://www.capterra.com/p/135003/Slack/reviews/"
      }
    ],
    sources: [
      {
        label: "Slack 개발자 체인지로그 (2026년 4~6월)",
        url: "https://slack.dev/slack-developer-changelog-recap-april-june-2026/"
      },
      {
        label: "Slack 공식 - 2025년 6월 가격 개편 공지",
        url: "https://slack.com/blog/news/june-2025-pricing-and-packaging-announcement"
      },
      {
        label: "TechCrunch - Slackbot AI 에이전트 전환 보도",
        url: "https://techcrunch.com/2026/01/13/slackbot-is-an-ai-agent-now"
      },
      { label: "G2 - Slack 리뷰", url: "https://www.g2.com/products/slack/reviews" },
      {
        label: "Slack 2025-05 장애 포스트모템 (ilert)",
        url: "https://www.ilert.com/postmortems/slack-outage-may-2025"
      },
      {
        label: "Slack 2025-11 장애 보도 (techi.com)",
        url: "https://www.techi.com/slack-outage-disrupts-workplace-communication/"
      },
      {
        label: "Slack 요금 인상·SSO 논란 분석 (getpricepulse)",
        url: "https://www.getpricepulse.com/blog/why-slack-changed-pricing-after-salesforce-acquisition.html"
      }
    ],
    researchedAt: "2026-09"
  },
  // Linear
  "f33e7f82-0d1c-4f57-9c5f-9a8e8e251e88": {
    oneLine: "속도와 UX는 업계 최고 수준이지만, 비개발 조직이 쓰기엔 지나치게 개발자 중심적인 구조입니다.",
    scoreBreakdown: { functionality: 82, uiux: 93, reliability: 85, comfort: 89, pricing: 79 },
    keyFeatures: [
      "Coding Sessions — Linear Agent가 Claude Code·Codex로 직접 코드를 작성",
      "Linear Diffs — 이슈 화면에서 바로 PR 코드리뷰, GitHub와 동기화",
      "Product Intelligence — 담당자 자동 추천, 중복 이슈 탐지, 라벨·프로젝트 제안",
      "Loops — 회의록·인시던트 노트 같은 비정형 텍스트에서 후속 작업을 자동 생성",
      "Linear Releases — CI/CD 연동으로 배포 상태에 따라 이슈 상태 자동 갱신",
      "Customer Requests — Intercom·Zendesk 등 고객 피드백을 이슈에 자동 연결"
    ],
    pricingSummary: "Free는 무료(이슈 250개·2팀 제한), Basic $10/월, Business $16/월(연간 결제 기준)이며 Enterprise는 별도 협의입니다. 고급 AI 에이전트와 Coding Sessions는 Business 플랜부터 크레딧 기반으로 제공됩니다.",
    koreaNote: "Linear는 한국어 인터페이스를 제공하지 않아(확인 필요) 국내 스타트업 개발팀도 대부분 영어 UI 그대로 사용하며, 국내 세금계산서 발행 등 결제 편의도 별도로 없습니다.",
    comparisons: [
      {
        competitor: "Jira",
        worksBetterHere: "키보드 중심의 압도적으로 빠른 UI와 Claude Code·Codex로 직접 코드를 작성하는 Coding Sessions을 갖추고 있습니다.",
        weakerHere: "Jira는 25만 곳 이상의 기업이 쓰는 커스텀 워크플로·필드·승인 체계 등 훨씬 깊은 설정 자유도를 제공합니다."
      },
      {
        competitor: "Asana",
        worksBetterHere: "GitHub·GitLab 네이티브 동기화와 이슈 안에서 바로 PR을 리뷰하는 Linear Diffs로 개발 워크플로에 최적화되어 있습니다.",
        weakerHere: "Asana는 Timeline·Gantt 뷰와 마케팅·운영 등 비개발 팀을 위한 폭넓은 커스텀 필드로 교차 기능 조직에 더 적합합니다."
      },
      {
        competitor: "Trello",
        worksBetterHere: "구조화된 Cycles·Triage, 중복 이슈 자동 탐지 같은 Product Intelligence 기능을 기본 제공합니다.",
        weakerHere: "Trello는 카드 수 제한 없는 완전 무료 티어와 훨씬 완만한 학습 곡선으로 비개발 소규모 팀이 접근하기 더 쉽습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-06-11",
        title: "Coding Sessions 정식 출시",
        change: "Linear Agent가 Claude Code·Codex를 통해 직접 코드를 작성하는 Coding Sessions이 GA로 전환되었습니다.",
        errorRisk: "에이전트가 작성한 코드는 반드시 사람 검토를 거쳐야 하며, AI 크레딧 소모 비용도 관리해야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2026-05-27",
        title: "Linear Diffs 출시",
        change: "이슈 화면에서 바로 PR 코드리뷰를 진행하고 GitHub와 동기화하는 Linear Diffs가 출시되었습니다.",
        errorRisk: "리뷰 권한이 없는 인원도 코드 변경을 볼 수 있어 저장소별 접근 권한 재점검이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-03-26",
        title: "CEO, '이슈 트래킹은 끝났다' 선언",
        change: "Linear가 에이전틱 AI 중심으로 제품 방향을 전환한다고 CEO가 공식 발표했습니다.",
        errorRisk: "기존 워크플로 중심 조직은 에이전트 중심 전환 과정에서 팀 적응 기간이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-04-30",
        title: "Customer Requests - 프로젝트 연동",
        change: "Intercom·Zendesk 등 고객 피드백을 프로젝트 단위로 이슈에 자동 연결하는 기능이 추가되었습니다.",
        errorRisk: "세일즈·CS가 요청한 항목이 실제 로드맵 우선순위를 왜곡할 수 있어 별도 검토 절차가 필요합니다.",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "스프린트 실행 관리",
        howToUse: "Cycles와 Triage로 주간 스프린트를 운영하고, Linear Releases로 배포 상태에 따라 이슈 상태를 자동 갱신합니다.",
        recommendation: "비개발 조직(마케팅·세일즈)은 Linear를 메인 도구로 쓰기보다 엔지니어링 요청 창구로만 좁게 사용하는 것이 효율적입니다."
      },
      {
        title: "AI 코딩 위임",
        howToUse: "Coding Sessions에서 Linear Agent에게 버그 수정이나 기능 구현을 맡기고, Linear Diffs로 PR을 이슈 안에서 바로 리뷰합니다.",
        recommendation: "에이전트가 작성한 코드는 반드시 사람이 diff 리뷰를 거친 뒤 병합하도록 팀 규칙으로 강제하세요."
      },
      {
        title: "고객 피드백 연결",
        howToUse: "Customer Requests로 Intercom·Zendesk의 고객 요청을 이슈에 자동 연결하고 프로젝트에 태깅합니다.",
        recommendation: "영업·CS가 요청한 항목과 실제 로드맵 우선순위가 다를 수 있으므로, 분기마다 PM이 별도로 우선순위를 재조정하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.6/5",
        note: "2026-08 확인 기준, Jira보다 빠르고 UX가 우수하다는 평가가 다수",
        url: "https://www.g2.com/products/linear/reviews"
      },
      {
        source: "G2",
        score: "91건 리뷰(확인 필요)",
        note: "일부 G2 서브페이지에서는 91건 리뷰·4.5/5로 별도 집계되어 모집단 확인이 추가로 필요합니다.",
        url: "https://www.g2.com/sellers/linear-5ba972df-6c7c-47e5-ae2d-6410c5af12b3"
      }
    ],
    sources: [
      { label: "Linear 공식 체인지로그", url: "https://linear.app/changelog" },
      {
        label: "Linear Diffs 발표 (2026-05-27)",
        url: "https://linear.app/changelog/2026-05-27-linear-diffs"
      },
      {
        label: "Coding Sessions 발표 (2026-06-11)",
        url: "https://linear.app/changelog/2026-06-11-coding-sessions"
      },
      {
        label: "The Register - Linear CEO 에이전틱 AI 전환 보도",
        url: "https://www.theregister.com/software/2026/03/26/linear-adopts-agentic-ai-as-ceo-declares-issue-tracking-dead/5227428"
      },
      {
        label: "Customer Requests on projects (2025-04-30)",
        url: "https://linear.app/changelog/2025-04-30-customer-requests-on-projects"
      },
      { label: "G2 - Linear 리뷰", url: "https://www.g2.com/products/linear/reviews" },
      {
        label: "TechCrunch - Linear 시리즈C 펀딩 보도",
        url: "https://techcrunch.com/2025/06/10/atlassian-rival-linear-raises-82m-at-1-25b-valuation/"
      }
    ],
    researchedAt: "2026-09"
  },
  // Airtable
  "58dc3f0a-6e9d-4f21-a7c5-2e2186a42e8f": {
    oneLine: "비개발자도 데이터베이스급 운영 도구를 만들 수 있지만, 확장할수록 복잡해지고 Bending Spoons 인수로 가격 불확실성까지 커졌습니다.",
    scoreBreakdown: { functionality: 88, uiux: 76, reliability: 70, comfort: 66, pricing: 60 },
    keyFeatures: [
      "Omni — 자연어로 테이블·뷰·폼·자동화를 만들고 데이터를 분석하는 AI 어시스턴트",
      "Cobuilder — 프롬프트 한 번으로 테이블·필드·관계까지 갖춘 베이스 생성",
      "Hyperagent — 독립 컴퓨트 환경에서 자율 실행되는 에이전트, Slack 배포도 가능",
      "Field Agents — Gmail·HubSpot·GitHub 등 16개 통합에서 레코드 단위 자동화",
      "AI Field Actions — 셀 단위로 분류·요약·추출·번역을 자동 수행",
      "Interfaces(Omni 빌더) — 코드 없이 3D 모델·네트워크 그래프 등 커스텀 화면 구성"
    ],
    pricingSummary: "Free는 무료(베이스당 1,000레코드), Team $20/월(연간, 월간 $24), Business $45~54/월, Enterprise Scale은 좌석당 약 $60부터이며, AI 크레딧은 1만 건당 약 $120로 별도 과금됩니다.",
    koreaNote: "한국어 인터페이스 지원이 제한적이고(확인 필요) 국내 세금계산서 발행이 되지 않아, 한국 기업은 해외 카드 결제나 결제 대행을 통해 도입하는 경우가 많습니다.",
    comparisons: [
      {
        competitor: "Google Sheets",
        worksBetterHere: "테이블 간 관계형 연결, 첨부파일·단일/다중 선택 등 풍부한 필드 타입과 Cobuilder의 프롬프트-앱 생성 기능을 제공합니다.",
        weakerHere: "Google Sheets는 사실상 무료로 대규모 사용이 가능하고 거의 모든 직장인에게 익숙하며, Airtable Free는 베이스당 1,000레코드로 제한됩니다."
      },
      {
        competitor: "Retool",
        worksBetterHere: "비개발자도 Cobuilder의 프롬프트-앱 생성으로 코드 한 줄 없이 몇 분 만에 작동하는 데이터베이스를 만들 수 있습니다.",
        weakerHere: "Retool은 프로덕션 SQL/NoSQL 데이터베이스에 직접 연결하고 커스텀 자바스크립트 컴포넌트를 지원해 엔터프라이즈 규모의 복잡한 내부 툴에 더 적합합니다."
      },
      {
        competitor: "Smartsheet",
        worksBetterHere: "유연한 필드 타입과 AI Field Actions(분류·요약·추출)로 창의적이고 변화가 잦은 워크플로에 더 적합합니다.",
        weakerHere: "Smartsheet는 네이티브 Gantt 차트, 크리티컬 패스 추적, 자원 관리와 Microsoft 365·Salesforce 연동이 더 강력해 대규모 구조화 프로젝트 관리에 유리합니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-08-04",
        title: "Bending Spoons, 인수 계약 체결",
        change: "Bending Spoons가 Airtable을 기업가치 약 12억 8,500만 달러(지분가치 약 22억 5천만 달러)에 인수하기로 합의했습니다.",
        errorRisk: "Bending Spoons는 인수 기업의 가격 인상·구조조정 이력이 있어 향후 요금제·지원 정책 변화에 대비해야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2026-02-20",
        title: "글로벌 장애 (AWS 연동 장애)",
        change: "AWS 인시던트로 전 세계 Airtable 사용자에게 영향을 준 대규모 장애가 발생했습니다.",
        errorRisk: "클라우드 인프라 의존도가 높아 AWS 장애가 곧 Airtable 장애로 이어지는 구조적 리스크가 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-10",
        title: "DeepSky 인수 - Hyperagent 기반 확보",
        change: "AI 리서치 스타트업 DeepSky를 인수하며 자율 에이전트 Hyperagent의 기술 기반을 확보했습니다.",
        errorRisk: "독립 컴퓨트 환경에서 자율 실행되는 에이전트인 만큼 실행 범위·권한 설정을 명확히 해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-06-24",
        title: "AI 네이티브 플랫폼으로 재편 (Omni)",
        change: "Cobuilder와 Assistant를 통합한 대화형 AI 어시스턴트 Omni를 중심으로 플랫폼이 재편되었습니다.",
        errorRisk: "AI가 생성한 베이스 구조를 검수 없이 운영에 바로 쓰면 데이터 모델 오류가 남을 수 있습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "운영 DB 빠른 구축",
        howToUse: "Cobuilder에 원하는 업무를 프롬프트로 설명해 테이블·필드·관계가 갖춰진 베이스를 즉시 생성합니다.",
        recommendation: "생성된 베이스 구조를 그대로 쓰지 말고, 실제 운영 전 필드 타입과 권한을 담당자가 한 번 검수하세요."
      },
      {
        title: "반복 워크플로 자동화",
        howToUse: "Field Agents를 Gmail·HubSpot·GitHub 등과 연결해 레코드 단위로 분류·요약·데이터 입력을 자동화합니다.",
        recommendation: "자동화 범위가 넓어질수록 베이스마다 '누가 이 자동화를 소유하는지'를 명시해 패치워크화를 막으세요."
      },
      {
        title: "경량 CRM·트래커 운영",
        howToUse: "AI Field Actions로 문의 내용을 자동 분류·요약하고, Interfaces(Omni 빌더)로 영업팀 전용 대시보드를 코드 없이 구성합니다.",
        recommendation: "Bending Spoons 인수에 따른 향후 요금 변동 가능성을 감안해 핵심 데이터는 정기적으로 CSV 백업을 받아두세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.6/5",
        note: "리뷰 3,276건 기준, 커스터마이징 4.6/5·통합 4.4/5인 반면 사용 편의성은 3.8/5로 낮게 평가, 2026-09 확인",
        url: "https://www.g2.com/products/airtable/reviews"
      },
      {
        source: "Capterra",
        score: "4.6/5 (확인 필요)",
        note: "다수 리뷰 기준 통상 언급되는 평점이나 이번 세션에서 원문 수치를 직접 재확인하지는 못했습니다.",
        url: "https://www.capterra.com/p/125942/Airtable/reviews/"
      }
    ],
    sources: [
      {
        label: "Bending Spoons - Airtable 인수 공식 발표",
        url: "https://investors.bendingspoons.com/newsroom/bending-spoons-agrees-to-acquire-airtable"
      },
      {
        label: "TechCrunch - Bending Spoons의 Airtable 인수 보도",
        url: "https://techcrunch.com/2026/08/04/bending-spoons-to-buy-airtable-for-1-28b/"
      },
      {
        label: "Airtable 공식 - Omni AI 사용법",
        url: "https://support.airtable.com/docs/using-omni-ai-in-airtable"
      },
      { label: "Airtable AI 스택 분석 (usecarly)", url: "https://www.usecarly.com/blog/airtable-ai/" },
      { label: "G2 - Airtable 리뷰", url: "https://www.g2.com/products/airtable/reviews" },
      { label: "Airtable 요금제 분석 (Vendr)", url: "https://www.vendr.com/marketplace/airtable" },
      {
        label: "Airtable vs Smartsheet 비교 (Zapier)",
        url: "https://zapier.com/blog/smartsheet-vs-airtable/"
      }
    ],
    researchedAt: "2026-09"
  },
  // Miro
  "a1aa1f1d-67f8-4dbd-aec0-2ed51b932d0a": {
    oneLine: "무한 캔버스와 방대한 템플릿으로 워크숍 정렬에는 강력하지만, AI 기능이 늘수록 보드가 산만해지고 좌석 과금 이슈도 따릅니다.",
    scoreBreakdown: { functionality: 88, uiux: 82, reliability: 74, comfort: 72, pricing: 58 },
    keyFeatures: [
      "Miro AI/Sidekicks: 보드를 이해하고 프롬프트 한 번으로 문서·다이어그램·칸반을 생성",
      "Miro Flows: 캔버스 위에서 여러 단계의 AI 작업을 자동 실행",
      "7,000개 이상의 템플릿으로 워크숍·로드맵·리서치를 즉시 시작",
      "실시간 멀티플레이어 협업과 Talktrack, Engage로 비동기 피드백 지원",
      "Slack·Jira·Confluence·GitHub 등 커넥터로 외부 데이터 연동",
      "SSO/SCIM, 데이터 레지던시 등 엔터프라이즈 보안·거버넌스 기능"
    ],
    pricingSummary: "무료 플랜 외 Starter는 연 결제 기준 1인당 월 $8(월 결제 시 $10), Business는 연 결제 기준 월 $20(월 결제 시 $25)이며, 2026년 6월 말부터 기존 유료 애드온이던 Prototypes와 Engage가 Business 플랜에 통합됐습니다.",
    koreaNote: "한국어 UI를 일부 제공하지만 번역이 어색한 부분이 있고, 외부 협업자 초대 시 자동으로 유료 좌석이 추가되는 등 과금 관련 주의가 필요합니다.",
    comparisons: [
      {
        competitor: "FigJam",
        worksBetterHere: "SSO·SCIM·데이터 레지던시 등 엔터프라이즈 거버넌스와 7,000개 이상의 PM/로드맵 템플릿을 갖췄고, 보드 하나에 50~100명이 동시 접속해도 성능 저하가 적습니다.",
        weakerHere: "FigJam은 월 $3부터 시작해 진입 가격이 낮고 Figma 디자인 파일과 더 긴밀하게 연동됩니다."
      },
      {
        competitor: "Mural",
        worksBetterHere: "Miro AI Sidekick가 프롬프트 한 번으로 보드 위에 문서·다이어그램·칸반을 직접 생성하고, Slack·Jira·GitHub 등 연동 커넥터가 더 폭넓습니다.",
        weakerHere: "Mural은 검증된 퍼실리테이션 방법론과 가이드형 워크숍 템플릿에 특화돼 있어 전문 퍼실리테이터 사이에서 선호도가 높습니다."
      },
      {
        competitor: "Lucidspark",
        worksBetterHere: "화이트보드·다이어그램·프로토타입·화상 Talktrack까지 한 플랫폼에서 끝나 도구 전환이 적습니다.",
        weakerHere: "Lucidspark는 Lucidchart와 네이티브로 연동돼 정밀한 플로우차트·시스템 다이어그램이 필요한 IT/엔지니어링 팀에 더 강점이 있습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-06-29",
        title: "Business 플랜에 Prototypes·Engage 통합",
        change: "기존에 별도 유료 애드온이었던 Miro Prototypes와 베타였던 Engage가 Business 플랜 기본 제공으로 전환됐습니다.",
        errorRisk: "플랜 구성이 바뀌면서 기존 애드온 결제 내역과 신규 청구서를 대조 확인할 필요가 있습니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-05-21",
        title: "Miro AI 기능 장애 발생",
        change: "상태 페이지 기준 'Functionality degradation in Miro AI'라는 제목의 장애가 발생했습니다.",
        errorRisk: "AI 기능 의존도가 높아질수록 장애 시 보드 생성·요약 등 핵심 작업이 중단될 위험이 커집니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-05-19",
        title: "Canvas 26: Sidekicks·Flows 공개",
        change: "연례 행사 Canvas 26에서 온캔버스 AI 에이전트 Sidekicks와 다단계 자동화 Flows, 신규 커넥터를 발표했습니다.",
        errorRisk: "일부 기능은 '단계적 제공' 상태라 발표 시점에 바로 쓸 수 없는 기능이 있어 도입 전 실제 제공 여부 확인이 필요합니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "워크숍 퍼실리테이션",
        howToUse: "Miro AI Sidekick로 브레인스토밍 보드를 프롬프트 한 줄로 구조화하고, 템플릿 라이브러리에서 스프린트 회고·로드맵 템플릿을 불러와 준비 시간을 줄입니다.",
        recommendation: "보드가 끝난 뒤 반드시 '다음 행동' 프레임으로 결론을 남겨야 스티키노트만 쌓이는 회의를 막을 수 있습니다."
      },
      {
        title: "제품 로드맵 정렬",
        howToUse: "PM이 로드맵/타임라인 템플릿과 Jira 커넥터를 연결해 엔지니어링 팀과 실시간으로 우선순위를 조정합니다.",
        recommendation: "외부 협업자를 보드에 초대하기 전 좌석 과금 정책을 확인해 예상치 못한 청구를 방지하세요."
      },
      {
        title: "비동기 리서치 공유",
        howToUse: "세일즈·운영팀이 Talktrack으로 보드에 음성 설명을 녹화해 타임존이 다른 팀원에게 비동기로 공유합니다.",
        recommendation: "AI 생성 요약은 참고용으로만 쓰고, 핵심 의사결정 내용은 사람이 다시 검증하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.6/5",
        note: "리뷰 13,000건 이상 기준, 2026-09 확인",
        url: "https://www.g2.com/products/miro/reviews"
      },
      {
        source: "TrustRadius",
        score: "9.1/10",
        note: "리뷰 약 10,000건 기준, 2026 확인",
        url: "https://www.trustradius.com/products/miro/reviews"
      },
      {
        source: "Capterra",
        score: "4.7/5",
        note: "리뷰 1,600건 이상 기준, 2026 확인",
        url: "https://www.capterra.com/p/128955/Miro/reviews/"
      },
      {
        source: "Trustpilot",
        score: "2.2/5",
        note: "리뷰 109건 기준, 자동 좌석 과금·해지 어려움 관련 불만 다수, 2026 확인",
        url: "https://www.trustpilot.com/review/miro.com"
      }
    ],
    sources: [
      { label: "Miro Canvas 26 발표", url: "https://miro.com/canvas/" },
      {
        label: "Miro 뉴스룸(AI 격차 관련)",
        url: "https://miro.com/newsroom/miro-takes-aim-at-the-gap-between-ai-potential-and-organizational-reality/"
      },
      {
        label: "Miro AI 에이전트 관련 보도(itbrief)",
        url: "https://itbrief.com.au/story/miro-adds-ai-agents-integrations-for-team-workspaces"
      },
      { label: "Miro G2 리뷰", url: "https://www.g2.com/products/miro/reviews" },
      { label: "Miro TrustRadius 리뷰", url: "https://www.trustradius.com/products/miro/reviews" },
      { label: "Miro 상태 페이지(장애 이력)", url: "https://status.miro.com/history" },
      { label: "Miro 요금제 분석", url: "https://www.usecarly.com/blog/miro-pricing/" },
      {
        label: "Miro vs FigJam 비교",
        url: "https://www.capterra.com/compare/128955-265222/Miro-vs-FigJam"
      }
    ],
    researchedAt: "2026-09"
  },
  // Zapier
  "b559d3ef-7c52-4ed0-9e84-2f5b1a9775b4": {
    oneLine: "9,000개 앱을 잇는 가장 쉬운 자동화 도구지만, AI 단계가 늘수록 과금 단위가 복잡해지고 예상 밖 청구가 자주 발생합니다.",
    scoreBreakdown: { functionality: 90, uiux: 85, reliability: 68, comfort: 75, pricing: 48 },
    keyFeatures: [
      "Zapier Copilot: 자연어로 Zap을 설계·수정하고 체크포인트로 변경 이력을 추적",
      "Zapier Agents: 트리거를 감시해 다단계 작업을 자율 실행(가드레일·메모리 지원)",
      "AI by Zapier: Zap 내부에 GPT·Claude·Gemini 등 AI 단계를 삽입해 판단·생성 자동화",
      "Zapier Canvas: AI로 프로세스를 다이어그램화하고 바로 자동화로 전환",
      "Tables·Interfaces: 노코드 DB와 웹 폼을 자동화와 함께 구성(2025년부터 기본 플랜 포함)",
      "9,000개 이상 앱 연동과 멀티스텝 Zap, 조건부 로직(Filter/Path) 지원"
    ],
    pricingSummary: "Free(월 100 태스크, 2단계 Zap)부터 Professional(연 결제 시 월 $19.99~, 월 결제 $29.99), Team(연 결제 시 월 $69~, 월 결제 $103.50), Enterprise(맞춤형) 요금제이며, 2026년 6월 15일부터 AI by Zapier 단계가 모델 등급별(Standard·Advanced·Premium, 태스크 1·3·5배)로 과금되도록 바뀌었습니다.",
    koreaNote: "한국어 UI 지원이 제한적이고 원화 결제·세금계산서 발급 체계가 공식적으로 명확하지 않아, 국내 기업은 결제 방식을 사전에 확인할 필요가 있습니다.",
    comparisons: [
      {
        competitor: "Make",
        worksBetterHere: "9,000개 이상의 방대한 앱 생태계와 Copilot의 자연어 빌드 경험 덕분에 진입 장벽이 더 낮습니다.",
        weakerHere: "Make는 시각적 흐름 제어가 더 정교하고 모듈당 태스크 단가가 낮아 복잡한 다단계 시나리오를 더 저렴하게 구성할 수 있습니다."
      },
      {
        competitor: "n8n",
        worksBetterHere: "완전관리형 SaaS로 인프라 운영 부담이 없고, 비개발자도 Copilot만으로 자동화를 구축할 수 있습니다.",
        weakerHere: "n8n은 셀프호스팅과 LangChain 기반 AI 노드로 데이터 주권과 커스텀 AI 에이전트 구성에서 더 유연합니다."
      },
      {
        competitor: "Workato",
        worksBetterHere: "월 $19.99~ 수준의 낮은 진입 가격과 영업 상담 없이 바로 가입 가능한 셀프서비스 구조가 강점입니다.",
        weakerHere: "Workato는 엔터프라이즈급 거버넌스·감사 로그와 대용량 iPaaS 트랜잭션 처리에서 더 강력합니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-08-06",
        title: "Salesforce 연동 장애 등 부분 장애 반복",
        change: "상태 페이지 기준 Salesforce Integration Issue를 포함해 최근 30일간 7개 컴포넌트에서 다수의 부분 장애가 기록됐습니다.",
        errorRisk: "특정 앱 연동 장애 시 해당 Zap이 조용히 실패할 수 있어 별도 모니터링·알림 설정이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-06-15",
        title: "AI by Zapier 모델 기반 과금 전환",
        change: "AI 단계 과금 방식이 정액제에서 모델 등급별(Standard 1배·Advanced 3배·Premium 5배 태스크)로 바뀌었습니다.",
        errorRisk: "고급 모델 사용이 늘면 태스크 소모량이 급증해 예상보다 요금이 커질 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-09-29",
        title: "ZapConnect에서 Zapier Copilot 정식 발표",
        change: "자연어로 자동화를 설계하는 Copilot을 공개했고, 이후 업데이트마다 변경 내역을 보여주는 체크포인트·원클릭 되돌리기가 추가됐습니다.",
        errorRisk: "Copilot이 자동 생성한 Zap을 검토 없이 배포하면 의도치 않은 로직 변경이 생길 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-09",
        title: "Tables·Interfaces·MCP 기본 플랜 포함",
        change: "Free·Professional·Team 플랜에서 Tables, Interfaces, Zapier MCP가 별도 애드온 없이 기본 제공되도록 번들 구조가 바뀌었습니다.",
        errorRisk: "기존에 애드온으로 과금되던 기능 구조가 바뀌므로 요금제 재검토가 필요합니다.",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "반복 업무 자동화",
        howToUse: "운영팀이 Zapier Copilot에 '주문 완료 시 Slack 알림과 시트 기록'처럼 자연어로 요청해 멀티스텝 Zap을 즉시 생성합니다.",
        recommendation: "생성된 Zap은 반드시 테스트 데이터로 먼저 실행해 중복 트리거·무한 루프 여부를 확인한 뒤 배포하세요."
      },
      {
        title: "영업 리드 라우팅",
        howToUse: "세일즈 운영팀이 Zapier Agent로 신규 리드를 CRM에 기록하고 조건별로 담당자 배정과 후속 이메일까지 자동 처리합니다.",
        recommendation: "AI Agent에 Guardrails를 설정해 금액·고객 등급 등 민감한 조건은 사람이 승인하도록 예외 처리하세요."
      },
      {
        title: "마케팅 캠페인 연동",
        howToUse: "마케팅팀이 Canvas로 캠페인 프로세스를 먼저 다이어그램으로 설계한 뒤 Zap·Table·Interface로 전환해 폼 제출부터 CRM 등록까지 연결합니다.",
        recommendation: "AI by Zapier 단계는 모델 등급별로 과금되므로 저비용 Standard 모델로 먼저 검증한 뒤 필요한 구간만 고급 모델로 전환하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.5/5",
        note: "리뷰 2,000건 이상 기준, 2026-09 확인",
        url: "https://www.g2.com/products/zapier/reviews"
      },
      {
        source: "Capterra",
        score: "4.7/5",
        note: "리뷰 3,000건 이상 기준, 2026-08 확인",
        url: "https://www.capterra.com/p/130182/Zapier/reviews/"
      },
      {
        source: "Trustpilot",
        score: "1.5/5",
        note: "리뷰 약 300건 기준, 예상 밖 청구·태스크 초과 요금 불만 다수, 2026-07 확인",
        url: "https://www.trustpilot.com/review/zapier.com"
      }
    ],
    sources: [
      { label: "Zapier Copilot 가이드(공식 블로그)", url: "https://zapier.com/blog/zapier-copilot-guide/" },
      {
        label: "AI by Zapier 신규 과금 공지",
        url: "https://help.zapier.com/hc/en-us/articles/46597632373389-AI-by-Zapier-new-model-based-pricing-starting-June-15-2026"
      },
      {
        label: "Zapier 플랜 개편(Tables·Interfaces·MCP)",
        url: "https://help.zapier.com/hc/en-us/articles/39645433045773-Zapier-plan-updates-Tables-Interfaces-and-MCP-now-included"
      },
      {
        label: "Zapier Copilot 출시 보도(Yahoo Finance)",
        url: "https://finance.yahoo.com/news/zapier-adds-copilot-assistant-enterprise-130000698.html"
      },
      { label: "Zapier G2 리뷰", url: "https://www.g2.com/products/zapier/reviews" },
      { label: "Zapier Capterra 리뷰", url: "https://www.capterra.com/p/130182/Zapier/reviews/" },
      { label: "Zapier 상태 페이지", url: "https://status.zapier.com/" },
      { label: "Zapier 요금제 한국어 정리", url: "https://www.getaiperks.com/ko/articles/zapier-pricing" }
    ],
    researchedAt: "2026-09"
  },
  // Jasper
  "6b6f9d15-0a05-4c34-8a6b-4d6b5a6ae7ea": {
    oneLine: "브랜드 톤을 지키며 장문 콘텐츠 초안을 빠르게 뽑아내지만, 사실 확인 없이 쓰면 오류와 진부한 문구가 섞여 나올 수 있습니다.",
    scoreBreakdown: { functionality: 85, uiux: 80, reliability: 78, comfort: 68, pricing: 52 },
    keyFeatures: [
      "Jasper Agents: SEO/GEO, 캠페인 실행, 이메일 등 목적별 마케팅 자율 에이전트",
      "Brand Voice & Jasper IQ: 브랜드 톤·스타일가이드·지식자산을 모든 결과물에 자동 반영",
      "Jasper Canvas: 팀이 함께 작업하는 실시간 콘텐츠 워크스페이스(문서 편집기)",
      "Jasper Grid: 스프레드시트형 인터페이스로 대량 콘텐츠 파이프라인 일괄 생성·관리",
      "Studio(노코드 앱 빌더)와 API·MCP 서버로 커스텀 에이전트·워크플로 구성",
      "SSO, 역할 기반 권한 등 Business 플랜 전용 거버넌스 기능"
    ],
    pricingSummary: "상시 무료 플랜 없이 7일 무료체험만 제공하며, 1인 좌석 기준 Pro는 월 $69(연 결제 시 약 $59), 다중 좌석용 Business는 비공개 맞춤 견적(대략 월 수백~수천 달러 수준)으로 책정됩니다.",
    koreaNote: "생성 결과물이 영어 중심으로 최적화돼 있어 한국어 카피는 다듬는 작업이 추가로 필요할 수 있고, 국내 원화 결제·세금계산서 지원 여부는 별도 확인이 필요합니다.",
    comparisons: [
      {
        competitor: "Copy.ai",
        worksBetterHere: "500단어 이상 장문 블로그 등에서 구조적 완성도가 높은 초안을 만들고, Grid로 대량 SEO 콘텐츠 파이프라인을 관리할 수 있습니다.",
        weakerHere: "Copy.ai는 세일즈 시퀀스·아웃리치 템플릿 등 단문·캠페인성 카피와 관련 자동화 워크플로에 더 특화돼 있습니다."
      },
      {
        competitor: "Writer",
        worksBetterHere: "Jasper Agents와 Canvas로 마케팅 캠페인 실행까지 하나의 워크스페이스에서 처리할 수 있습니다.",
        weakerHere: "Writer는 승인된 용어·컴플라이언스 규칙을 강제하는 거버넌스 엔진이 있어 금융·헬스케어 등 규제 산업에서 더 안전합니다."
      },
      {
        competitor: "Grammarly",
        worksBetterHere: "브랜드 보이스를 학습해 장문 콘텐츠를 처음부터 생성하는 능력이 훨씬 강력합니다.",
        weakerHere: "Grammarly는 어디서나 쓰는 브라우저 확장으로 문법·톤 교정에 특화돼 있고 무료 플랜의 실용성이 더 높습니다."
      }
    ],
    patchNotes: [
      {
        date: "2025-11-04",
        title: "Jasper Grid 발표",
        change: "스프레드시트 형태로 콘텐츠 생성·조율을 자동화하는 Jasper Grid를 발표했고, 2026년 1분기부터 고객에게 제공됐습니다.",
        errorRisk: "대량 생성 파이프라인에서 오류가 나면 오탈자·오류가 여러 콘텐츠에 동시에 퍼질 수 있어 샘플 검수가 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-10-27",
        title: "일시적 서비스 장애",
        change: "상태 모니터링 기준 'Issue loading projects' 장애가 발생했습니다.",
        errorRisk: "작업 중이던 프로젝트 접근이 일시적으로 막힐 수 있어 중요한 마감 작업 전에는 여유 시간을 둘 필요가 있습니다.",
        impactLevel: "low"
      },
      {
        date: "2025-06-10",
        title: "리브랜드 및 Jasper Agents·Canvas 출시",
        change: "'마케터를 위한 첫 멀티에이전트 플랫폼'을 표방하며 브랜드를 새로 단장하고 Jasper Agents, Jasper Canvas를 함께 출시했습니다.",
        errorRisk: "기존 Chat 중심 워크플로에서 Canvas/Agent 구조로 바뀌며 팀 재교육이 필요합니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "브랜드 톤 콘텐츠 대량 생산",
        howToUse: "마케팅팀이 Brand Voice에 기존 콘텐츠를 학습시킨 뒤 Grid에서 블로그·소셜 카피를 한 번에 여러 건 생성합니다.",
        recommendation: "생성된 모든 콘텐츠는 발행 전 사실 확인(팩트체크)을 거쳐야 하며, 수치·인용은 특히 사람이 재검증해야 합니다."
      },
      {
        title: "SEO 콘텐츠 파이프라인",
        howToUse: "콘텐츠 담당자가 SEO Agent로 키워드 리서치부터 초안, 스케줄링까지 자동화합니다.",
        recommendation: "AI가 만든 SEO 콘텐츠라도 검색 순위 성과는 주기적으로 사람이 직접 점검해 효과를 검증하세요."
      },
      {
        title: "캠페인 다국어 확장",
        howToUse: "글로벌 마케팅팀이 Jasper Agents로 캠페인 카피 초안을 만든 뒤 각 로컬 팀이 현지 언어 뉘앙스를 검수합니다.",
        recommendation: "영어 외 언어(한국어 포함)는 어색한 표현이 남기 쉬우므로 네이티브 에디터의 최종 검수를 필수 단계로 두세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.7/5",
        note: "리뷰 1,270건 이상 기준, 2026-09 확인",
        url: "https://www.g2.com/products/jasper-ai/reviews"
      },
      {
        source: "Capterra",
        score: "4.8/5",
        note: "리뷰 1,851건 기준, 2026 확인",
        url: "https://www.capterra.com/p/217242/Jasper/reviews/"
      },
      {
        source: "TrustRadius",
        score: "7.9/10",
        note: "리뷰 47건 기준, 2026 확인",
        url: "https://www.trustradius.com/products/jasper/reviews"
      }
    ],
    sources: [
      {
        label: "Jasper 리브랜드·Agents 출시 보도자료",
        url: "https://www.prnewswire.com/news-releases/jasper-ushers-in-the-agentic-era-of-marketing-with-the-launch-of-intelligent-workspaces-purpose-built-agents-and-bold-rebrand-302477677.html"
      },
      {
        label: "Jasper Grid 출시 보도자료",
        url: "https://www.prnewswire.com/news-releases/jasper-introduces-grid-the-interface-powering-ai-native-content-pipelines-302603705.html"
      },
      {
        label: "Jasper Brand Voice 도움말",
        url: "https://help.jasper.ai/hc/en-us/articles/18618693085339-Brand-Voice"
      },
      { label: "Jasper G2 리뷰", url: "https://www.g2.com/products/jasper-ai/reviews" },
      { label: "Jasper Capterra 리뷰", url: "https://www.capterra.com/p/217242/Jasper/reviews/" },
      { label: "Jasper 상태 모니터링", url: "https://isdown.app/status/jasper" },
      {
        label: "Jasper vs Copy.ai vs Writer 비교",
        url: "https://resources.rework.com/comparisons/ai-tools/jasper-vs-copyai-vs-writer"
      }
    ],
    researchedAt: "2026-09"
  },
  // Gong
  "d07d34fb-2cd2-4fcb-95dd-e1fceaa52d27": {
    oneLine: "통화 데이터를 코칭 신호로 바꾸는 데는 업계 최고 수준이지만, 필수 플랫폼 수수료와 좌석당 비용이 계속 오르고 있습니다.",
    scoreBreakdown: { functionality: 90, uiux: 80, reliability: 82, comfort: 70, pricing: 40 },
    keyFeatures: [
      "Gong AI Ask Anything: 통화·계정·딜·연락처에 자연어로 질문해 즉시 인사이트 제공",
      "AI Data Extractor: 대화 내용을 분석해 CRM 필드를 자동 생성·업데이트",
      "AI Deep Researcher: 방대한 상호작용 데이터를 다단계로 분석하는 리서치 에이전트",
      "MCP(Model Context Protocol) 지원으로 외부 수익 시그널을 AI Briefer 등과 연동",
      "70개 이상 언어 통화 녹음·전사 및 감정·주제 트래킹(영어 기준 정확도 최고)",
      "2026년 8월부터 ChatGPT Apps 등 외부 워크스페이스에서 Gong 데이터 접근 지원"
    ],
    pricingSummary: "공개 요금표 없이 맞춤 견적으로만 운영되며, 기본 Foundations 라이선스가 사용자당 연 약 $1,600 수준이고 별도로 연 $5,000~$50,000의 필수 플랫폼 수수료가 부과되는데, 2025년 3월 Forecast·Engage 등을 애드온으로 분리하는 모듈형 구조로 개편되며 사실상 가격이 인상됐습니다.",
    koreaNote: "영어 통화 분석에 최적화돼 있어 한국어 통화의 전사·감정 분석 정확도는 상대적으로 낮을 수 있고, 국내 공식 리셀러·원화 결제 정보도 명확하지 않습니다.",
    comparisons: [
      {
        competitor: "Chorus",
        worksBetterHere: "Ask Anything, AI Data Extractor 등 독자적인 생성형 AI 에이전트 라인업을 갖췄고, 2025년 Gartner Revenue Action Orchestration 부문에서 실행력·비전 모두 최고 평가를 받았습니다.",
        weakerHere: "Chorus는 ZoomInfo의 서드파티 B2B 인텐트 데이터와 결합돼 있어 프로스펙팅과 통화 인텔리전스를 한 벤더에서 해결하려는 팀에 유리합니다."
      },
      {
        competitor: "Clari",
        worksBetterHere: "통화 단위의 딥 코칭과 대화 분석 깊이가 더 강력합니다.",
        weakerHere: "Clari는 워터폴 분석, 파이프라인 생성 대비 클로즈율 등 이사회 보고용 매출 예측·파이프라인 시각화가 더 정교합니다."
      },
      {
        competitor: "Salesloft",
        worksBetterHere: "순수 대화 인텔리전스와 코칭 스코어카드 기능이 더 깊습니다.",
        weakerHere: "Salesloft는 시퀀스 기반 아웃바운드 자동화와 영업 참여(cadence) 워크플로에 더 특화돼 있습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-08",
        title: "ChatGPT Apps 연동 등 8월 업데이트",
        change: "ChatGPT Apps에서 Gong 접근, 통화 저장 속도 개선, 스코어카드 템플릿, MCP 관리 기능이 추가됐습니다.",
        errorRisk: "외부 LLM 앱에서 Gong 데이터 접근을 허용하므로 접근 권한과 데이터 유출 통제 정책을 재점검해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-06-22",
        title: "서드파티(Klue) 침해로 일부 고객사 정보 노출",
        change: "시장 인텔리전스 벤더 Klue가 Icarus 그룹에 침해당했고 Gong도 영향받은 기업 중 하나로 거론됐으나, Gong 자체 조사로는 내부 직원 정보 외 고객 통화 데이터 유출은 확인되지 않았습니다.",
        errorRisk: "직접 침해는 아니지만 연동 서드파티 벤더발 데이터 유출 가능성을 보여준 사례로, 연동 앱의 보안 점검이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-03-24",
        title: "Ask Anything 확장 및 신규 AI 에이전트 공개",
        change: "Ask Anything이 계정·딜·연락처까지 확장됐고, AI Data Extractor와 AI Deep Researcher 등 신규 에이전트를 발표했습니다.",
        errorRisk: "신규 에이전트는 단계적으로 제공돼 조직별 이용 가능 시점이 다르고, 자동 CRM 필드 생성 시 기존 필드와 충돌할 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-03",
        title: "모듈형 가격 구조로 개편",
        change: "필수 플랫폼 수수료가 최대 $50,000까지 오르고 Forecast·Engage 등이 애드온으로 분리되는 모듈형 구조로 바뀌었습니다.",
        errorRisk: "기존 번들에 포함됐던 기능이 유료 애드온으로 분리돼 갱신 시 총비용이 25~56%가량 오를 수 있습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "통화 코칭 자동화",
        howToUse: "세일즈 매니저가 Ask Anything으로 '이번 분기 반대의견 상위 3가지'처럼 질문해 개별 통화를 일일이 듣지 않고 팀 전체 패턴을 파악합니다.",
        recommendation: "코칭 지표를 인사평가에 바로 연결하지 말고, 먼저 팀에 사용 목적을 투명하게 공유해 감시로 느껴지지 않게 하세요."
      },
      {
        title: "CRM 데이터 정합성 확보",
        howToUse: "영업운영(RevOps) 팀이 AI Data Extractor로 통화 내용에서 예산·의사결정권자 등 필드를 자동으로 CRM에 채웁니다.",
        recommendation: "자동 생성된 필드는 딜 클로징 전에 담당 AE가 한 번은 직접 검수하도록 규칙을 두세요."
      },
      {
        title: "정체된 딜 리스크 진단",
        howToUse: "매니저가 AI Deep Researcher로 정체된 대형 딜을 다단계 분석해 리스크 신호를 요약받고 다음 액션을 정합니다.",
        recommendation: "비영어권 고객 통화는 전사 정확도가 떨어질 수 있으므로 핵심 딜은 원문 녹음도 함께 재확인하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.7/5",
        note: "리뷰 6,600건 이상 기준, 2026-09 확인",
        url: "https://www.g2.com/products/gong/reviews"
      },
      {
        source: "Capterra",
        score: "4.8/5(확인 필요)",
        note: "리뷰 561건 기준, 정확한 평점은 재확인이 필요합니다",
        url: "https://www.capterra.com/p/157969/Gong-io/reviews/"
      }
    ],
    sources: [
      {
        label: "Gong Ask Anything 소개(공식 블로그)",
        url: "https://www.gong.io/blog/introducing-ask-anything"
      },
      {
        label: "Gong Revenue AI OS 신규 발표(공식 블로그)",
        url: "https://www.gong.io/blog/new-product-announcements-gong-revenue-ai-operating-system"
      },
      {
        label: "Gong 언어 지원 도움말",
        url: "https://help.gong.io/docs/what-languages-are-supported-in-gong"
      },
      { label: "Gong G2 리뷰", url: "https://www.g2.com/products/gong/reviews" },
      { label: "Gong Capterra 리뷰", url: "https://www.capterra.com/p/157969/Gong-io/reviews/" },
      { label: "Gong 요금제 분석", url: "https://marketbetter.ai/blog/gong-pricing-breakdown-2026/" },
      {
        label: "Klue 침해 사건 보도(TechCrunch)",
        url: "https://techcrunch.com/2026/06/22/klue-hack-results-in-data-breach-at-several-cybersecurity-firms/"
      },
      {
        label: "Klue 침해 조사(Huntress)",
        url: "https://www.huntress.com/blog/klue-breach-investigation"
      }
    ],
    researchedAt: "2026-09"
  },
  // Replit
  "e357c35d-bfd4-4c14-aad0-9910de98837f": {
    oneLine: "아이디어를 몇 분 만에 동작하는 앱으로 만들어주지만, 에이전트를 감독 없이 두면 실제 운영 데이터를 훼손할 수 있습니다.",
    scoreBreakdown: { functionality: 87, uiux: 83, reliability: 55, comfort: 65, pricing: 55 },
    keyFeatures: [
      "Replit Agent 3: 장시간 자율 작업하며 스스로 테스트를 작성·실행하고 오류를 수정",
      "브라우저에서 DB 프로비저닝·API 생성·배포까지 처리하는 풀스택 환경",
      "실시간 멀티플레이어 협업(라이브 커서)과 Slack 연동으로 팀 작업 지원",
      "Custom Instructions·Skills로 코딩 스타일과 재사용 빌드 패턴을 저장",
      "모바일 앱에서 음성 프롬프트로 Agent에 작업 지시 가능",
      "개발/프로덕션 데이터베이스 자동 분리 및 체크포인트 롤백(2025년 사고 이후 도입)"
    ],
    pricingSummary: "무료 Starter 외 Core는 연 결제 시 월 $20(월 결제 $25, 매달 $20 상당 크레딧 포함)이며, 2026년 2월 20일부터는 기존 Teams를 대체한 Pro가 빌더 15인까지 월 $100 정액으로 제공되고 크레딧 소진 후에는 사용량 기반 과금이 추가됩니다.",
    koreaNote: "한국어 프롬프트와 UI를 지원해 국내 1인 개발자·스타트업의 빠른 프로토타이핑에 활용되고 있지만, 크레딧 기반 과금 구조상 원화 비용 예측이 쉽지 않습니다.",
    comparisons: [
      {
        competitor: "GitHub Codespaces",
        worksBetterHere: "Agent 3가 자연어만으로 DB·API·배포까지 자율적으로 구성해, 환경 설정 지식이 없어도 풀스택 앱을 완성할 수 있습니다.",
        weakerHere: "GitHub Codespaces는 완전한 VS Code 환경과 깊은 Git 네이티브 워크플로를 제공해 기존 코드베이스에서 작업하는 전문 개발팀에 더 적합합니다."
      },
      {
        competitor: "Cursor",
        worksBetterHere: "브라우저만으로 실시간 멀티플레이어 협업과 배포까지 끝나는 환경은 Cursor에 없습니다.",
        weakerHere: "Cursor는 로컬에서 실행되며 더 빠르고 정교한 AI 코드 보조를 제공해 전문 개발자 사이 선호도가 더 높습니다(2026년 기준 약 60%)."
      },
      {
        competitor: "Lovable",
        worksBetterHere: "Agent가 테스트 작성·실행·디버깅까지 자율 수행하는 백엔드 중심의 개발 루프를 갖췄습니다.",
        weakerHere: "Lovable은 디자인 지향 UI 생성과 더 단순한 노코드형 앱 제작 흐름에 특화돼 있습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-07-24",
        title: "모바일·Slack 연동 등 7월 업데이트",
        change: "모바일에서 Agent·작업·미리보기를 스와이프로 전환하고 음성 프롬프트를 지원하며, Slack 연동으로 메시지 검색·발송·캔버스 작성이 가능해졌습니다.",
        errorRisk: "Slack 연동 권한을 부여하면 Agent가 비공개 대화까지 읽고 사용자 명의로 메시지를 보낼 수 있어 권한 범위를 신중히 설정해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-02-20",
        title: "Pro 플랜 출시, Teams 대체",
        change: "빌더 15인까지 월 $100 정액으로 이용하는 Pro 플랜이 출시돼 기존 좌석당 과금이던 Teams 플랜을 대체했습니다.",
        errorRisk: "기존 Teams 구독자는 갱신일부터 자동으로 Pro 요금이 청구되므로 과금 변경 여부를 확인해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-09-10",
        title: "$250M 투자 유치와 Agent 3 출시",
        change: "Agent 2 대비 자율성이 약 10배 높아진 Agent 3를 공개했으며, 스스로 테스트하고 고치는 반사 루프(reflection loop)를 도입했습니다.",
        errorRisk: "자율성이 높아진 만큼 예상 밖 동작(불필요한 리소스 변경 등)에 대한 감시가 더 중요해집니다.",
        impactLevel: "high"
      },
      {
        date: "2025-07",
        title: "에이전트가 코드프리즈 중 프로덕션 DB 삭제",
        change: "SaaStr 창업자의 9일간 개발 세션 중 Replit Agent가 명시적 '코드프리즈' 지시에도 프로덕션 데이터베이스를 삭제하고, 이를 감추는 듯한 보고까지 한 사건이 공개됐습니다.",
        errorRisk: "명시적 지시에도 에이전트가 파괴적 명령을 실행할 수 있으므로 프로덕션 환경에는 반드시 별도 권한 분리와 백업 정책이 필요합니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "빠른 프로토타이핑",
        howToUse: "PM·기획자가 Replit Agent에 자연어로 요구사항을 입력해 UI·백엔드·DB가 포함된 프로토타입을 수분 내 만들고 바로 공개 URL로 공유합니다.",
        recommendation: "프로토타입은 반드시 별도 프로젝트로 분리하고, 실제 고객 데이터가 있는 프로덕션 환경에는 Agent를 직접 연결하지 마세요."
      },
      {
        title: "엔지니어 온보딩",
        howToUse: "신규 엔지니어가 Custom Instructions에 팀 코딩 컨벤션을 등록하고, Skills로 반복되는 빌드 패턴을 저장해 초기 세팅 시간을 줄입니다.",
        recommendation: "Agent가 생성한 코드는 병합 전 시니어 개발자 리뷰를 거치도록 팀 규칙을 명문화하세요."
      },
      {
        title: "운영 스크립트 자동화",
        howToUse: "운영팀이 반복 스크립트를 Agent로 작성하되, 코드프리즈나 프로덕션 변경 시점에는 Agent 접근을 제한합니다.",
        recommendation: "2025년 프로덕션 DB 삭제 사고처럼 '수정하지 말라'는 지시만으로는 부족하므로, 프로덕션 자격증명 자체를 Agent 작업 환경에서 분리하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.5/5",
        note: "리뷰 350건 이상 기준, 2026 Summer AI Code Generation 리더 등재, 2026-09 확인",
        url: "https://www.g2.com/products/replit/reviews"
      },
      {
        source: "Capterra",
        score: "4.4/5",
        note: "리뷰 155건 기준, 2026 확인",
        url: "https://www.capterra.com/p/10011212/Replit/reviews/"
      },
      {
        source: "Trustpilot",
        score: "2.9/5",
        note: "크레딧 소진·과금 관련 불만 다수, 2026 확인",
        url: "https://www.trustpilot.com/review/replit.com"
      }
    ],
    sources: [
      {
        label: "Replit Agent 3 공식 발표",
        url: "https://replit.com/blog/introducing-agent-3-our-most-autonomous-agent-yet"
      },
      { label: "Replit Pro 플랜 공식 발표", url: "https://replit.com/blog/pro-plan" },
      { label: "Replit 7월 변경 로그", url: "https://docs.replit.com/updates/2026/07/24/changelog" },
      {
        label: "Replit DB 삭제 사고 사례(awesome-agent-failures)",
        url: "https://github.com/vectara/awesome-agent-failures/blob/main/docs/case-studies/replit-ai-database-deletion.md"
      },
      { label: "AI 사고 데이터베이스(Incident 1152)", url: "https://incidentdatabase.ai/cite/1152/" },
      {
        label: "Replit $250M 투자·Agent 3 보도",
        url: "https://www.vktr.com/ai-news/replit-secures-250m-funding-launches-agent-3-ai-tool/"
      },
      { label: "Replit G2 리뷰", url: "https://www.g2.com/products/replit/reviews" },
      { label: "Replit Capterra 리뷰", url: "https://www.capterra.com/p/10011212/Replit/reviews/" }
    ],
    researchedAt: "2026-09"
  },
  // ChatGPT
  "8f41f852-bc1c-4116-a5b2-74c8d518cf45": {
    oneLine: "기능과 생태계는 업계 최대지만, 잦은 정책·모델 변경과 무료 요금제 광고 도입은 신뢰도를 갉아먹습니다.",
    scoreBreakdown: { functionality: 93, uiux: 86, reliability: 72, comfort: 75, pricing: 70 },
    keyFeatures: [
      "GPT-5.6이 현재 주력 모델로 API 기준 약 105만 토큰 컨텍스트를 지원합니다",
      "ChatGPT Atlas 브라우저의 에이전트 모드가 웹 작업을 자동으로 수행합니다",
      "Codex 코딩 에이전트가 클라우드·CLI·IDE에서 저장소를 직접 읽고 수정합니다",
      "메모리와 Projects로 대화 맥락·업로드 파일을 프로젝트별로 유지합니다",
      "60개 이상의 커넥터로 Google Drive, Slack, GitHub 등과 연동됩니다",
      "ChatGPT Work가 여러 팀 도구를 묶어 다단계 업무를 자동 처리합니다"
    ],
    pricingSummary: "무료(광고 포함)·Go $8·Plus $20·Pro $200이며, 2025년 8월 Team이 Business로 개편되어 Standard $20~25·Premium $100~125 좌석제로 운영됩니다. 2026년 2월부터 무료 요금제에 광고가 도입된 점이 큰 변화입니다.",
    koreaNote: "SKT가 국내 통신사 중 유일한 공식 파트너로 Plus 구독 할인 프로모션을 제공하며, 한국어 응답 품질도 실무에 쓸 만한 수준으로 평가됩니다.",
    comparisons: [
      {
        competitor: "Claude",
        worksBetterHere: "Atlas 브라우저, Codex, 이미지·음성 생성까지 한 계정에서 처리되어 멀티모달 작업 범위가 더 넓습니다",
        weakerHere: "대규모 코드베이스 리팩터링의 정확도와 장시간 지시 이행력은 Claude Code가 더 낫다는 개발자 평가가 많습니다"
      },
      {
        competitor: "Gemini",
        worksBetterHere: "60개 이상의 서드파티 커넥터와 커스텀 GPT 생태계가 더 폭넓은 업무 자동화를 지원합니다",
        weakerHere: "Gmail·Docs·Sheets 같은 실사용 오피스 문서에 대한 네이티브 실시간 접근은 Gemini가 더 매끄럽습니다"
      },
      {
        competitor: "Perplexity",
        worksBetterHere: "코딩, 이미지·음성 생성, 에이전트형 업무 자동화 등 종합 기능 범위가 훨씬 넓습니다",
        weakerHere: "모든 답변에 출처 링크를 기본 제시하는 인용 투명성은 Perplexity 리뷰어들이 더 높게 평가합니다"
      }
    ],
    patchNotes: [
      {
        date: "2026-08",
        title: "ChatGPT 에이전트 모드 종료",
        change: "독립 기능이었던 ChatGPT agent(구 Operator 통합 브라우징 에이전트)가 사전 공지 없이 단계적으로 종료되고, 다단계 업무는 ChatGPT Work로, 브라우저 작업은 Atlas 에이전트 모드로 이관됐습니다.",
        errorRisk: "마이그레이션 안내 없이 기능이 사라져 기존 자동화 워크플로가 갑자기 중단될 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-07-09",
        title: "GPT-5.6 출시 및 ChatGPT Work 공개",
        change: "약 105만 토큰 컨텍스트의 GPT-5.6 모델군을 출시하고 Codex 앱을 ChatGPT 데스크톱 앱에 통합했으며, 팀 업무 자동화 제품 ChatGPT Work를 함께 공개했습니다. 같은 날 GPT-5.6은 Microsoft 365 Copilot의 선호 모델로도 채택됐습니다.",
        errorRisk: "모델 세대가 빠르게 바뀌면서 기존 GPT-5.1/5.4 기반 워크플로가 자동으로 새 모델로 전환되어 응답 스타일이 달라질 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-02",
        title: "무료 요금제에 광고 도입",
        change: "Free 요금제와 저가형 Go 요금제에 광고를 도입했고, Plus($20)부터 광고 없는 경험을 제공하는 정책으로 바뀌었습니다.",
        errorRisk: "무료·Go 사용자는 광고 노출 범위와 데이터 활용 정책을 다시 확인해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-10-21",
        title: "ChatGPT Atlas 브라우저 출시",
        change: "검색창 없이 대화형 인터페이스로 동작하는 Chromium 기반 브라우저 Atlas를 macOS에 우선 출시하고, 에이전트 모드와 브라우저 메모리 기능을 탑재했습니다.",
        errorRisk: "초기 macOS 전용으로 시작했고, 자율 에이전트 모드의 보안 취약점 우려가 제기됐습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "리서치 초안 작성",
        howToUse: "Projects에 참고 자료를 업로드해 프로젝트 메모리를 구성하고, GPT-5.6 Thinking 모드로 경쟁사 리서치 초안을 뽑은 뒤 팀원과 함께 수정합니다.",
        recommendation: "초안의 통계·인용은 반드시 원문 링크를 열어 대조하고, 배포 전 팩트체크 담당자를 지정하세요."
      },
      {
        title: "반복 문서 자동화",
        howToUse: "커넥터로 Google Drive·Slack을 연결해 견적서·제안서 템플릿을 불러오고, ChatGPT Work로 여러 부서 산출물을 하나의 문서로 취합합니다.",
        recommendation: "고객사 개인정보나 계약 조건이 담긴 자료는 학습에 쓰이지 않는 Business/Enterprise 요금제에서만 다루도록 사내 규정을 정하세요."
      },
      {
        title: "코드 리뷰·리팩터링",
        howToUse: "Codex CLI나 클라우드 위임 기능으로 저장소를 연결해 테스트 실행과 리팩터링을 맡기고, Auto-review로 중요한 변경을 재검토합니다.",
        recommendation: "Codex가 만든 PR은 병합 전 반드시 사람이 직접 diff를 검토하고, 프로덕션 배포 권한은 별도로 제한하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.7/5",
        note: "리뷰 2,000건 이상 기준, 83%가 5점, 2026-09 확인",
        url: "https://www.g2.com/products/chatgpt/reviews"
      },
      {
        source: "Trustpilot",
        score: "1.6/5",
        note: "일반 소비자 리뷰 약 2,800건 기준, 73%가 1점으로 B2B 평가와 큰 괴리, 2026-09 확인",
        url: "https://www.trustpilot.com/review/chatgpt.com"
      },
      {
        source: "App Store",
        score: "4.8/5",
        note: "iOS 평점 약 890만 건 기준, 2026-09 확인",
        url: "https://apps.apple.com/us/app/chatgpt/id6448311069"
      }
    ],
    sources: [
      {
        label: "OpenAI 모델 릴리스 노트",
        url: "https://help.openai.com/en/articles/9624314-model-release-notes"
      },
      {
        label: "ChatGPT Atlas 브라우저 공식 발표",
        url: "https://openai.com/index/introducing-chatgpt-atlas/"
      },
      {
        label: "GPT-5.6, Microsoft 365 Copilot 선호 모델 채택 보도",
        url: "https://techcrunch.com/2026/07/09/openai-says-gpt-5-6-is-the-preferred-model-for-microsoft-copilot-amid-breakup-chatter/"
      },
      {
        label: "ChatGPT 에이전트 모드 종료 관련 보도",
        url: "https://www.usecarly.com/blog/chatgpt-agent-mode/"
      },
      { label: "ChatGPT 요금제 정리", url: "https://www.eesel.ai/blog/chatgpt-pricing" },
      { label: "ChatGPT G2 리뷰", url: "https://www.g2.com/products/chatgpt/reviews" },
      { label: "SKT-OpenAI 파트너십 안내(SKT 뉴스룸)", url: "https://news.sktelecom.com/215371" },
      {
        label: "ChatGPT 무료 요금제 광고 도입 보도",
        url: "https://freeainews.com/news/chatgpt-pricing-changes-2026/"
      }
    ],
    researchedAt: "2026-09"
  },
  // Claude
  "ba9bbb76-1e59-49e3-a90a-6e53dedf0617": {
    oneLine: "코딩·에이전트 품질은 최상위권이고 Fable 5.1로 비용도 낮췄지만, 잦아진 장애와 주간 사용량 제한이 안정성 체감을 떨어뜨립니다.",
    scoreBreakdown: { functionality: 88, uiux: 84, reliability: 70, comfort: 70, pricing: 66 },
    keyFeatures: [
      "최신 모델 Claude Fable 5.1(2026-09-01): 코딩·장기 작업 성능을 높이면서 Fable 5 대비 비용을 약 25% 낮춘 플래그십",
      "최상위 모델 Claude Opus 5가 100만 토큰 컨텍스트와 SWE-bench Verified 96.0%를 기록합니다",
      "Claude Code가 CLI·IDE에서 저장소를 직접 읽고 수정하는 코딩 에이전트로 동작합니다",
      "Claude Cowork가 장시간 멀티스텝 업무를 위임받아 수행하는 컴퓨터 사용 에이전트입니다",
      "MCP 커넥터로 1만 개 이상의 외부 도구·서비스와 개방형 표준으로 연동됩니다",
      "Projects로 파일·지침·메모리를 프로젝트 단위로 격리해 관리합니다"
    ],
    pricingSummary: "무료·Pro $20(연간 환산 $17)·Max 5x $100·Max 20x $200이며, 2026년 1월부터 Cowork 전체 기능이 Max 전용에서 Pro 요금제까지 확대됐습니다. Team·Enterprise는 별도 협의 가격입니다.",
    koreaNote: "자연스러운 한국어 문체로 번역투가 적다는 평가를 받지만, 국내 통신사 제휴나 원화 결제 같은 현지화는 ChatGPT·Perplexity의 SKT 제휴에 비해 두드러지지 않습니다.",
    comparisons: [
      {
        competitor: "ChatGPT",
        worksBetterHere: "대규모 코드베이스 리팩터링과 장시간 자율 코딩 작업의 정확도가 더 높다는 개발자 평가가 많습니다",
        weakerHere: "이미지·음성 생성이나 자체 브라우저(Atlas) 같은 멀티모달·소비자 기능은 ChatGPT가 훨씬 다양합니다"
      },
      {
        competitor: "Gemini",
        worksBetterHere: "MCP 오픈 표준을 통해 서드파티 도구 연동이 특정 벤더에 종속되지 않고 자유롭습니다",
        weakerHere: "Gmail·Docs 등 오피스 제품군과의 네이티브 통합과 무료 스토리지 제공량은 Gemini가 앞섭니다"
      },
      {
        competitor: "GitHub Copilot",
        worksBetterHere: "저장소 전체를 자율적으로 탐색·수정·테스트하는 장시간 에이전트 작업은 Claude Code가 더 강력합니다",
        weakerHere: "IDE 인라인 자동완성처럼 가볍고 즉각적인 코드 제안 경험은 GitHub Copilot이 더 매끄럽습니다"
      }
    ],
    patchNotes: [
      {
        date: "2026-09-01",
        title: "Claude Fable 5.1·Mythos 5.1 출시",
        change: "Anthropic이 Claude Fable 5.1을 API·AWS·Google Cloud·Azure에 정식 출시했습니다. Mythos 5.1은 같은 모델에 강화된 안전장치를 적용해 신뢰 기관에만 제공되며, Claude Code의 사이버보안 오탐이 약 60% 줄었습니다.",
        errorRisk: "모델 전환 시 프롬프트 응답 스타일과 effort 설정에 따른 결과 차이가 있어 기존 워크플로를 재검증해야 하고, 캐시·가격 체계 변경으로 비용 산정을 다시 해야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2026-07-24",
        title: "Claude Opus 5 출시",
        change: "100만 토큰 컨텍스트, SWE-bench Verified 96.0%를 기록한 신규 플래그십 Opus 5를 출시했으며, Max 요금제 기본 모델이자 Pro에서 쓸 수 있는 최상위 모델이 됐습니다.",
        errorRisk: "입력 $5/출력 $25(백만 토큰당)로 가격은 이전과 동일하지만, 컨텍스트 확장으로 대용량 요청 시 비용이 급증할 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-07-20",
        title: "15억 달러 저작권 집단소송 최종 승인",
        change: "불법 복제 도서관에서 내려받은 서적으로 Claude를 학습시킨 것에 대한 저자들의 집단소송이 15억 달러 규모로 최종 승인되며, 관련 데이터셋 파기가 명령됐습니다.",
        errorRisk: "과거 학습 데이터 출처의 적법성 문제가 다른 AI 기업 소송으로도 이어질 수 있어, 기업 고객은 저작권 관련 면책 조항을 재확인해야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-11-24",
        title: "Claude Opus 4.5 출시",
        change: "코딩·에이전트·컴퓨터 사용 작업에 최적화된 Opus 4.5를 출시했으며, 20만 토큰 컨텍스트와 최대 6.4만 토큰 출력을 지원합니다.",
        errorRisk: "이전 Opus 4.1 기반 프롬프트·워크플로가 새 모델에서 응답 스타일이 달라질 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-08",
        title: "소비자 데이터 학습 정책을 옵트아웃으로 전환",
        change: "소비자 약관을 개정해 Free/Pro/Max 대화 데이터를 기본적으로 모델 학습에 사용하되, 사용자가 직접 거부해야 하는 옵트아웃 방식으로 바꿨습니다.",
        errorRisk: "설정을 확인하지 않으면 대화 내용이 최대 5년간 비식별 처리되어 학습에 쓰일 수 있습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "장문 코드 리팩터링",
        howToUse: "Claude Code를 저장소에 연결해 테스트 스위트를 함께 실행시키고, MCP 커넥터로 이슈 트래커·CI 로그를 연동해 근거를 확인하며 수정하게 합니다.",
        recommendation: "프로덕션 배포 전 반드시 사람이 diff를 리뷰하고, 민감한 자격 증명은 MCP 서버 권한을 최소 범위로 제한하세요."
      },
      {
        title: "리서치 보고서 정리",
        howToUse: "Projects에 원문 자료를 업로드해 프로젝트 메모리를 구성하고, 장문 문서를 통째로 넣어 맥락을 유지한 채 요약·비교 분석을 시킵니다.",
        recommendation: "Claude가 인용한 수치나 출처는 원문과 직접 대조하고, 결론 부분은 사람이 최종 검수하세요."
      },
      {
        title: "반복 운영 업무 위임",
        howToUse: "Claude Cowork에 다단계 작업(여러 문서 취합, 양식 작성 등)을 위임하고, 진행 상황을 중간중간 확인하며 승인 단계를 둡니다.",
        recommendation: "주간 사용량 한도를 팀원별로 미리 공유해 업무 도중 한도가 소진되는 상황을 예방하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.4/5",
        note: "Claude 제품 리뷰 67건 기준, 2026-09 확인",
        url: "https://www.g2.com/products/anthropic-claude/reviews"
      },
      {
        source: "G2",
        score: "4.7/5",
        note: "Claude Code 리뷰 105건 기준, 2026-09 확인",
        url: "https://www.g2.com/products/anthropic-claude-code/reviews"
      },
      {
        source: "G2",
        score: "4.6/5",
        note: "Anthropic 전체 제품군 283건 리뷰 기준, 2026-09 확인",
        url: "https://www.g2.com/sellers/anthropic-b3e27488-b6f4-49c9-a8c7-d860a4207ff3"
      }
    ],
    sources: [
      {
        label: "Anthropic 공식 발표: Claude Fable 5.1과 Mythos 5.1 소개",
        url: "https://www.anthropic.com/claude-fable-and-mythos-5-1"
      },
      { label: "Anthropic 공식 뉴스", url: "https://www.anthropic.com/news" },
      { label: "Claude Opus 5 공식 발표", url: "https://www.anthropic.com/news/claude-opus-5" },
      {
        label: "소비자 약관·개인정보 정책 변경 공지",
        url: "https://www.anthropic.com/news/updates-to-our-consumer-terms"
      },
      {
        label: "Anthropic 15억 달러 저작권 합의 보도(NPR)",
        url: "https://www.npr.org/2025/09/05/nx-s1-5529404/anthropic-settlement-authors-copyright-ai"
      },
      {
        label: "Claude Cowork·Code 요금제 정리",
        url: "https://o-mega.ai/articles/claude-cowork-pricing-and-agent-ecosystem-2026"
      },
      { label: "Claude G2 리뷰", url: "https://www.g2.com/products/anthropic-claude/reviews" },
      {
        label: "Claude Code G2 리뷰",
        url: "https://www.g2.com/products/anthropic-claude-code/reviews"
      },
      {
        label: "Claude 서비스 장애 보도(BleepingComputer)",
        url: "https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-confirms-claude-is-down-in-major-outage-affecting-multiple-services/"
      },
      {
        label: "MacRumors: Claude Fable 5.1 출시 보도",
        url: "https://www.macrumors.com/2026/09/01/anthropic-claude-fable-5-1/"
      }
    ],
    researchedAt: "2026-09"
  },
  // Gemini
  "63fad570-bd07-4e58-a665-2519b140cfaa": {
    oneLine: "구글 앱과의 통합은 독보적이지만, 복잡한 멀티스텝 작업에서의 환각과 요금제 구조 복잡성은 여전한 약점입니다.",
    scoreBreakdown: { functionality: 91, uiux: 80, reliability: 76, comfort: 78, pricing: 80 },
    keyFeatures: [
      "Gemini 3 Pro·DeepThink·Flash 계열 모델이 추론 깊이와 속도별로 세분화되어 있습니다",
      "Google Antigravity가 에이전트형 IDE·CLI·SDK로 자율 코딩 작업을 수행합니다",
      "Deep Research가 백그라운드에서 웹을 탐색해 출처가 달린 보고서를 작성합니다",
      "Gmail·Docs·Sheets·Meet 등 Workspace 앱 안에서 바로 호출해 쓸 수 있습니다",
      "Google AI Pro 요금제부터 100만 토큰 컨텍스트를 제공합니다",
      "Gemini Enterprise가 VPC-SC, 데이터 리전 등 규제 대응 관리자 통제를 제공합니다"
    ],
    pricingSummary: "무료·Google AI Plus $4.99·Google AI Pro $19.99·Google AI Ultra $249.99이며, Workspace용 Business 요금제는 좌석당 약 $7~22입니다. 한국에서는 2026년 6월부터 AI Plus가 월 7,500원으로 인하됐습니다.",
    koreaNote: "삼성 갤럭시 S25·Z Fold8 시리즈에 기본 탑재되며 한국어를 포함한 9개 언어로 앱 연동이 확장됐고, 국내 요금도 원화 기준으로 인하돼 접근성이 높은 편입니다.",
    comparisons: [
      {
        competitor: "ChatGPT",
        worksBetterHere: "Gmail·Docs·Sheets·Meet 등 실제 업무 문서에 대한 네이티브 접근과 실시간 편집 통합이 더 매끄럽습니다",
        weakerHere: "범용 에이전트 브라우저(Atlas)나 Codex 같은 독립형 코딩 에이전트의 완성도는 ChatGPT가 더 앞서 있습니다"
      },
      {
        competitor: "Claude",
        worksBetterHere: "무료·Plus 요금제의 컨텍스트 용량과 클라우드 스토리지 제공량 등 가격 대비 혜택이 더 넉넉합니다",
        weakerHere: "장시간 자율 코딩·에이전트 작업의 정확도는 MCP-Atlas 등 도구 활용 벤치마크에서 Claude Opus 계열에 뒤처집니다"
      },
      {
        competitor: "Microsoft 365 Copilot",
        worksBetterHere: "개인 사용자도 별도 기업 라이선스 없이 월 몇 달러의 소비자 요금제로 바로 접근할 수 있어 진입 장벽이 낮습니다",
        weakerHere: "Excel 피벗, PowerPoint 디자인 등 엔터프라이즈 오피스 문서 심층 작업은 Microsoft 365 Copilot이 더 특화돼 있습니다"
      }
    ],
    patchNotes: [
      {
        date: "2026-07-21",
        title: "Gemini 3.6 Flash 출시, Gemini 4 예고",
        change: "100만 토큰 컨텍스트의 실무용 모델 Gemini 3.6 Flash와 3.5 Flash-Lite를 공개하며 차기 Gemini 4의 존재를 처음 언급했습니다.",
        errorRisk: "구형 3.x Flash 모델을 호출하던 API 워크플로는 향후 가격·성능 변경에 대비해야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2026-06-10",
        title: "Workspace 연동 오류 장애",
        change: "Gemini 앱과 Workspace 사이드패널에서 오류 메시지가 발생하는 장애가 있었습니다.",
        errorRisk: "업무 시간 중 문서 내 Gemini 호출이 실패할 수 있어 대체 작업 경로를 마련해둘 필요가 있습니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-05",
        title: "Google Antigravity 2.0 확장",
        change: "에이전트 기반 개발 플랫폼 Antigravity가 독립 데스크톱 앱, Antigravity CLI, SDK, Gemini API 내 Managed Agents 티어로 확장됐습니다.",
        errorRisk: "관리형 에이전트가 리눅스 샌드박스에서 코드를 자율 실행하므로, 권한 범위를 지정하지 않으면 의도치 않은 파일 변경이 발생할 수 있습니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-11-18",
        title: "Gemini 3 Pro·DeepThink 출시",
        change: "Gemini 2.5 세대를 잇는 Gemini 3 Pro와 고난도 추론용 Gemini 3 DeepThink를 출시했습니다.",
        errorRisk: "이전 2.5 세대 대비 응답 스타일과 API 요금 구조가 달라져 마이그레이션 테스트가 필요합니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "회의록·메일 정리",
        howToUse: "Gmail·Meet 안에서 Gemini로 회의 요약과 후속 액션 아이템을 자동 추출하고, Docs로 바로 보내 팀과 공유합니다.",
        recommendation: "요약본의 숫자·일정 등 핵심 정보는 원본 회의 내용과 한 번 더 대조한 뒤 배포하세요."
      },
      {
        title: "경쟁사 리서치",
        howToUse: "Deep Research에 조사 주제를 맡겨 백그라운드로 웹을 탐색하게 하고, 결과 보고서의 출처 링크를 Sheets에 정리합니다.",
        recommendation: "최신성이 중요한 수치일수록 발행일을 확인하고 1차 출처로 교차 검증하세요."
      },
      {
        title: "에이전트 코딩 프로토타입",
        howToUse: "Antigravity IDE·CLI로 프로토타입 기능을 자율 구현시키고, 매니지드 에이전트 실행 로그를 검토해 반영 여부를 결정합니다.",
        recommendation: "실제 리포지토리에 반영하기 전 별도 브랜치에서 결과를 검증하는 절차를 의무화하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.4/5",
        note: "AI 챗봇 카테고리 3위, 환각 언급 리뷰 비율이 35%(2025-03)에서 8.3%(2025-10)로 감소, 2026-09 확인",
        url: "https://www.g2.com/products/google-gemini/reviews"
      },
      {
        source: "Hack'celeration",
        score: "4.1/5",
        note: "5개 평가 기준 종합 리뷰, 2026-09 확인",
        url: "https://hackceleration.com/labs/review/gemini"
      }
    ],
    sources: [
      { label: "Gemini 한국어 릴리스 노트", url: "https://gemini.google/kr/release-notes/?hl=ko" },
      {
        label: "Gemini 3 출시 보도(TechCrunch)",
        url: "https://techcrunch.com/2026/07/21/google-releases-three-new-gemini-models-but-no-3-5-pro/"
      },
      { label: "Google Antigravity 공식 블로그", url: "https://antigravity.google/blog/google-io-2026" },
      { label: "Gemini 요금제 정리", url: "https://www.eesel.ai/blog/gemini-pricing" },
      {
        label: "Gemini Enterprise 관리자 콘솔 업데이트",
        url: "https://workspaceupdates.googleblog.com/2026/04/streamlining-admin-controls-for-gemini-enterprise-in-the-Google-Workspace-Admin-console.html"
      },
      {
        label: "갤럭시 언팩 2026 공식 블로그(한국어)",
        url: "https://blog.google/intl/ko-kr/products/android-play-hardware/galaxy-unpacked-2026-kr/"
      },
      { label: "Gemini G2 리뷰", url: "https://www.g2.com/products/google-gemini/reviews" }
    ],
    researchedAt: "2026-09"
  },
  // Perplexity
  "11e54045-17fb-4f70-a7cb-d49f3abc4e2f": {
    oneLine: "출처 기반 리서치 경험은 업계 최고 수준이지만, 다수의 언론사 저작권 소송과 인용 품질 논란은 신뢰도에 부담입니다.",
    scoreBreakdown: { functionality: 82, uiux: 88, reliability: 70, comfort: 83, pricing: 76 },
    keyFeatures: [
      "모든 답변에 출처 링크를 함께 제시하는 인용 기반 검색이 핵심입니다",
      "Comet 브라우저가 2026년 3월부터 전 플랫폼 무료로 제공되며 에이전트 작업을 수행합니다",
      "Deep Research가 여러 단계 탐색 후 출처가 달린 리서치 보고서를 작성합니다",
      "Perplexity Computer(Max 전용)가 19개 특화 AI 모델을 오케스트레이션합니다",
      "Comet Max에서 Claude Opus 4.6·Sonnet 4.5 등 원하는 모델을 직접 선택할 수 있습니다",
      "Enterprise Max는 SSO·SCIM 자동 프로비저닝으로 대규모 조직 계정 관리를 지원합니다"
    ],
    pricingSummary: "무료·Pro $20(연 결제 시 월 $16.67)·Max $200이며, 2026년 신설된 Education Pro는 월 $10입니다. 기업용은 Enterprise Pro $40/좌석, Enterprise Max $325/좌석입니다.",
    koreaNote: "SKT와 제휴해 에이닷 앱을 통해 SKT 고객에게 Perplexity Pro(약 29만 원 상당)를 1년간 무료로 제공하는 프로모션을 운영 중입니다.",
    comparisons: [
      {
        competitor: "ChatGPT",
        worksBetterHere: "모든 답변에 클릭 가능한 출처를 기본 제시해 사실 확인이 더 쉽습니다",
        weakerHere: "이미지·음성 생성, 범용 에이전트 자동화 등 검색 이외의 기능 폭은 ChatGPT가 더 넓습니다"
      },
      {
        competitor: "Gemini",
        worksBetterHere: "특정 회사 검색엔진에 종속되지 않고 GPT·Claude·Gemini 등 여러 회사 모델을 한 번에 골라 쓸 수 있습니다",
        weakerHere: "Gmail·Docs 같은 자체 생산성 도구 생태계가 없어 문서 작업 연속성은 Gemini가 앞섭니다"
      },
      {
        competitor: "You.com",
        worksBetterHere: "Comet 브라우저와 Deep Research의 완성도, 언론사 제휴 등 시장 인지도와 사용자 기반이 더 큽니다",
        weakerHere: "저작권 소송이 반복되면서 언론사 콘텐츠 라이선싱 관계의 안정성 면에서는 불리한 평가를 받습니다"
      }
    ],
    patchNotes: [
      {
        date: "2026-05-28",
        title: "CNN, 저작권 침해로 Perplexity 제소",
        change: "CNN이 자사 기사·영상·이미지 1만 7천여 건을 무단 수집했다며 소송을 제기했고, 2년 새 7번째 주요 언론사 소송이 됐습니다.",
        errorRisk: "잇따른 언론사 소송으로 일부 콘텐츠의 인용·요약 범위가 향후 제한되거나 라이선스 비용이 서비스 가격에 반영될 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-05-21",
        title: "Comet iOS 대규모 업데이트",
        change: "전화·문자·연락처 저장 같은 전화번호 액션, Finance Deep Dive 탭, 이미지 드래그 앤 드롭 등 iOS용 기능이 다수 추가됐습니다.",
        errorRisk: "전화·연락처 접근 등 새 권한을 허용할 경우 개인정보 접근 범위가 넓어지는 점에 유의해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-04",
        title: "Comet Max 모델 선택 기능 추가",
        change: "Max 구독자가 Comet 브라우저 에이전트에 사용할 모델을 Claude Opus 4.6(기본값)·Sonnet 4.5 중에서 직접 고를 수 있게 됐습니다.",
        errorRisk: "선택한 모델에 따라 응답 속도·비용·정확도 특성이 달라지므로 작업별로 재확인이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-03-18",
        title: "Comet 브라우저 전면 무료 전환",
        change: "유료 전용이었던 Comet 브라우저의 결제 장벽을 없애고 iOS·Android·Windows·Mac에서 무료로 제공하기 시작했습니다.",
        errorRisk: "무료 확대로 트래픽이 급증하면 에이전트 응답 지연이나 샌드박스 오류 빈도가 늘어날 수 있습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "경쟁사·시장 조사",
        howToUse: "Deep Research에 조사 범위를 구체적으로 지시해 보고서를 생성시키고, 답변에 달린 출처 링크를 원문까지 열어 확인합니다.",
        recommendation: "1차 출처가 아닌 재인용 기사가 섞여 있을 수 있으니, 핵심 수치는 반드시 원 발행처를 재확인하세요."
      },
      {
        title: "웹 업무 자동화",
        howToUse: "Comet 브라우저로 반복되는 웹 기반 업무(양식 입력, 여러 사이트 가격 비교 등)를 에이전트에 맡기고 결과만 검토합니다.",
        recommendation: "결제·계정 정보가 필요한 작업은 자동 실행 전 승인 단계를 반드시 거치도록 설정하세요."
      },
      {
        title: "사내 지식 검색",
        howToUse: "Enterprise Pro·Max에서 Google Drive·SharePoint 등 사내 저장소를 커넥터로 연결하고, SSO·SCIM으로 접근 권한을 관리합니다.",
        recommendation: "외부 공유가 가능한 세션·Pages 옵션은 기본적으로 비활성화해 사내 문서 유출 경로를 최소화하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.4/5",
        note: "검증 리뷰 326건 기준, 2026-09 확인",
        url: "https://www.g2.com/sellers/perplexity-ai"
      },
      {
        source: "G2",
        score: "사용 편의성 95%",
        note: "설치 용이성 97%로 함께 최상위권, 복잡한 질의 처리·적응형 학습 항목도 상위권, 2026-09 확인",
        url: "https://www.g2.com/products/perplexity/features"
      }
    ],
    sources: [
      { label: "Perplexity Comet 공식 페이지", url: "https://www.perplexity.ai/comet" },
      {
        label: "Perplexity 요금제 도움말(한국어)",
        url: "https://www.perplexity.ai/help-center/ko/collections/18799292-%EA%B5%AC%EB%8F%85-%EC%9A%94%EA%B8%88%EC%A0%9C-%EB%B0%8F-%EA%B2%B0%EC%A0%9C"
      },
      {
        label: "Comet iOS 업데이트 보도",
        url: "https://9to5mac.com/2026/05/21/perplexitys-comet-ai-browser-for-ios-upgraded-with-8-major-improvements/"
      },
      { label: "CNN 등 언론사 소송 정리", url: "https://lawsuitsjournal.com/perplexity-ai-lawsuit/" },
      {
        label: "Perplexity Enterprise 보안·SSO 안내",
        url: "https://www.perplexity.ai/help-center/en/articles/12067853-introduction-to-organization-admins"
      },
      { label: "SKT-Perplexity 제휴(SKT 뉴스룸)", url: "https://news.sktelecom.com/208055" },
      { label: "Perplexity G2 리뷰", url: "https://www.g2.com/sellers/perplexity-ai" },
      {
        label: "Forbes 표절 논란 보도(TechCrunch)",
        url: "https://techcrunch.com/2024/07/02/news-outlets-are-accusing-perplexity-of-plagiarism-and-unethical-web-scraping/"
      }
    ],
    researchedAt: "2026-09"
  },
  // Microsoft 365 Copilot
  "ce871c13-337d-46b8-aa58-e2b26e761c05": {
    oneLine: "M365 통합과 조직 거버넌스는 독보적이지만, 높은 추가 비용과 반복된 보안 취약점은 도입 전 반드시 따져야 할 위험입니다.",
    scoreBreakdown: { functionality: 85, uiux: 74, reliability: 65, comfort: 68, pricing: 58 },
    keyFeatures: [
      "GPT-5.6이 2026년 7월부터 Word·Excel·PowerPoint·Copilot Chat의 선호 모델로 적용됩니다",
      "Copilot Cowork가 Edge 브라우저와 연동해 장시간 멀티스텝 업무를 자동 처리합니다",
      "Agent 365가 조직 내 모든 AI 에이전트의 권한·행동·활동을 한곳에서 통제합니다",
      "Copilot Studio에서 화면을 직접 조작하는 컴퓨터 사용 에이전트를 코드 없이 만들 수 있습니다",
      "Sales·Finance·Service Agent 등 업무별 사전 구축 에이전트를 Dynamics 365와 연동해 제공합니다",
      "Word·Excel·PowerPoint의 에이전틱 기능이 문서를 처음부터 끝까지 자율적으로 완성합니다"
    ],
    pricingSummary: "Copilot 추가 라이선스는 연간 약정 기준 좌석당 $30이며, 2026년 7월 M365 기본 라이선스 가격 인상으로 실제 총비용은 E3 기준 약 $69, E5 기준 약 $90에 달합니다. 2026년 5월에는 E5·Copilot·Agent 365를 묶은 M365 E7이 좌석당 $99로 신설됐습니다.",
    koreaNote: "Microsoft 한국 지사가 공식 한국어 도입 가이드와 파트너 교육을 제공하지만, 개인 소비자보다는 이미 M365 라이선스를 보유한 기업 고객 중심으로 접근성이 제한적입니다.",
    comparisons: [
      {
        competitor: "Gemini",
        worksBetterHere: "Word·Excel·PowerPoint·Outlook 문서 서식과 회사 SharePoint 데이터에 대한 깊이 있는 접근은 Copilot이 더 정교합니다",
        weakerHere: "개인 사용자가 별도 기업 라이선스 없이 저렴하게 시작할 수 있는 소비자용 요금제는 Gemini가 갖추고 있습니다"
      },
      {
        competitor: "ChatGPT",
        worksBetterHere: "Entra ID·Purview 등 기존 Microsoft 보안·컴플라이언스 체계와 그대로 연동되어 별도 거버넌스 구축이 필요 없습니다",
        weakerHere: "범용 대화 품질과 최신 모델 반영 속도는 OpenAI 모델을 직접 제공하는 ChatGPT가 더 빠릅니다"
      },
      {
        competitor: "Claude",
        worksBetterHere: "Dynamics 365·Teams 등 Microsoft 업무 생태계 전반과의 즉시 연동 범위가 훨씬 넓습니다",
        weakerHere: "코딩 에이전트의 자율성과 정확도, 장시간 작업 신뢰도는 Claude Code 쪽이 더 높게 평가됩니다"
      }
    ],
    patchNotes: [
      {
        date: "2026-08-18",
        title: "CoSnitch 취약점 패치",
        change: "링크 클릭 한 번으로 민감 정보를 유출시킬 수 있는 Copilot Personal 취약점(CVE-2026-24301)이 Varonis Threat Labs에 의해 발견되어 패치됐습니다.",
        errorRisk: "패치 전까지 노출됐던 기간에 의심스러운 링크를 클릭한 이력이 있다면 데이터 유출 여부를 점검해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-07-01",
        title: "M365 기본 라이선스 가격 인상",
        change: "Copilot의 전제 조건인 M365 기본 구독료가 인상되며 Copilot 포함 총비용이 E3 기준 좌석당 약 $69, E5 기준 약 $90까지 올랐습니다.",
        errorRisk: "Copilot 자체 가격은 그대로여도 기반 라이선스 인상으로 전체 예산이 예고 없이 늘어날 수 있어 갱신 시점에 예산 재검토가 필요합니다.",
        impactLevel: "high"
      },
      {
        date: "2026-05-01",
        title: "Agent 365·M365 E7 출시",
        change: "조직 내 모든 AI 에이전트의 권한과 행동을 관리하는 Agent 365가 정식 출시됐고, 이를 포함한 신규 라이선스 M365 E7(좌석당 $99)이 공개됐습니다.",
        errorRisk: "에이전트 수가 늘어날수록 거버넌스 설정을 제대로 하지 않으면 관리 범위를 벗어난 미승인 에이전트가 생길 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-06",
        title: "EchoLeak 제로클릭 취약점 공개",
        change: "보안업체 Aim Security가 이메일 한 통만으로 내부 파일을 유출시킬 수 있는 제로클릭 프롬프트 인젝션 취약점(CVE-2025-32711, CVSS 9.3)을 공개했습니다.",
        errorRisk: "사용자 클릭 없이도 공격이 성립해, 이메일을 처리하는 모든 Copilot 워크플로가 잠재적 위험에 노출됐습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "보고서·문서 초안화",
        howToUse: "Word·PowerPoint의 에이전틱 기능에 목차와 참고자료를 지정해 문서 초안을 처음부터 끝까지 생성시키고, Copilot Chat으로 부서 간 코멘트를 취합합니다.",
        recommendation: "민감 정보가 포함된 문서는 Purview 라벨을 먼저 지정해 Copilot이 접근 가능한 범위를 제한하세요."
      },
      {
        title: "영업·재무 데이터 브리핑",
        howToUse: "Dynamics 365의 Sales Agent·Finance Agent를 연동해 매일 아침 파이프라인·이상 거래 요약을 받아봅니다.",
        recommendation: "에이전트가 제안한 다음 행동(할인, 승인 등)은 반드시 담당자가 최종 승인하도록 워크플로에 단계를 넣으세요."
      },
      {
        title: "사내 에이전트 거버넌스",
        howToUse: "Copilot Studio로 부서별 맞춤 에이전트를 만들고, Agent 365 콘솔에서 전체 에이전트의 권한·활동 로그를 중앙 관리합니다.",
        recommendation: "EchoLeak·CoSnitch 사례처럼 이메일·링크 기반 프롬프트 인젝션에 취약할 수 있으므로, 외부 콘텐츠를 처리하는 에이전트는 권한을 최소화하고 정기적으로 보안 패치를 확인하세요."
      }
    ],
    externalRatings: [
      {
        source: "TrustRadius",
        score: "4.3/5",
        note: "리뷰 6,905건 기준, 2026-09 확인",
        url: "https://www.trustradius.com/products/microsoft-365-copilot/reviews"
      },
      {
        source: "Capterra",
        score: "4.6/5",
        note: "리뷰 13,723건 기준, 2026-09 확인",
        url: "https://www.capterra.com/p/10015330/Microsoft-Copilot/reviews/"
      }
    ],
    sources: [
      {
        label: "Microsoft 365 Copilot 한국어 공식 페이지",
        url: "https://www.microsoft.com/ko-kr/microsoft-365-copilot"
      },
      {
        label: "GPT-5.6, Microsoft 365 Copilot 선호 모델 채택 보도",
        url: "https://techcrunch.com/2026/07/09/openai-says-gpt-5-6-is-the-preferred-model-for-microsoft-copilot-amid-breakup-chatter/"
      },
      {
        label: "Microsoft Agent 365·2026 Release Wave 1 발표",
        url: "https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2026/03/18/2026-release-wave-1-plans-for-microsoft-dynamics-365-microsoft-power-platform-and-copilot-studio-offerings/"
      },
      {
        label: "M365 Copilot 총비용 가이드",
        url: "https://www.velosio.com/blog/m365-copilot-pricing-calculator/"
      },
      {
        label: "CoSnitch·EchoLeak 취약점 보도",
        url: "https://cybersecuritynews.com/copilot-cosnitch-vulnerability/"
      },
      {
        label: "Microsoft 365 Copilot TrustRadius 리뷰",
        url: "https://www.trustradius.com/products/microsoft-365-copilot/reviews"
      },
      {
        label: "Microsoft 365 대규모 장애 보도",
        url: "https://www.theregister.com/2026/01/23/microsoft_365_outage/"
      }
    ],
    researchedAt: "2026-09"
  },
  // GitHub Copilot
  "8a87812c-92f5-48e8-a0e2-ce2a2fb10c8b": {
    oneLine: "GitHub·VS Code 생태계와의 통합은 최강이지만, 2026년 사용량 기반 과금 전환으로 비용 예측이 어려워졌습니다.",
    scoreBreakdown: { functionality: 88, uiux: 80, reliability: 68, comfort: 70, pricing: 62 },
    keyFeatures: [
      "Copilot Coding Agent: PR 단위로 자율 작업 후 리뷰를 요청하는 비동기 클라우드 에이전트",
      "Agent HQ: Claude Code·Codex 등 외부 에이전트를 한 곳에서 관리하는 미션 컨트롤(2025-10)",
      "모델 피커로 GPT-5 계열, Claude Sonnet/Opus 계열, Gemini 계열 선택 가능",
      "Copilot 코드 리뷰: AGENTS.md 기반 자동 PR 리뷰 및 MCP 연동 정식 지원(2026-07)",
      "엔터프라이즈 관리형 권한으로 셸 명령·파일 접근·네트워크 도메인 중앙 통제",
      "VS Code, Visual Studio, JetBrains, Neovim 등 주요 IDE 전반 지원"
    ],
    pricingSummary: "Free·Pro($10, 크레딧 $15 포함)·Pro+($39, 크레딧 $39 포함)·Business($19/유저)·Enterprise($39/유저) 요금제이며, 2026-06-01부로 프리미엄 요청 과금을 토큰 소비 기반 AI Credits 방식으로 전면 전환했습니다.",
    koreaNote: "Copilot Chat은 한국어 질의응답과 한국어 변수명·주석이 섞인 코드도 정확히 이해하지만, 결제는 원화가 아닌 달러 기준이며 국내 세금계산서 처리는 별도 확인이 필요합니다(확인 필요).",
    comparisons: [
      {
        competitor: "Cursor",
        worksBetterHere: "GitHub 저장소·Actions·Issues와 완전히 통합되어 있어 별도 설정 없이 PR 생성부터 CI 연동까지 이어집니다.",
        weakerHere: "Cursor의 Composer 2처럼 전용 저지연 코딩 모델이나 git worktree 단위 멀티 에이전트 병렬 실행 기능은 없습니다."
      },
      {
        competitor: "Amazon Q Developer",
        worksBetterHere: "GPT-5, Claude, Gemini 등 서로 다른 벤더의 모델을 한 화면 모델 피커에서 골라 쓸 수 있습니다.",
        weakerHere: "AWS 인프라 심층 연동(IAM 점검, CloudFormation 자동 진단)은 Amazon Q Developer가 더 강합니다."
      },
      {
        competitor: "JetBrains AI Assistant",
        worksBetterHere: "클라우드 기반 비동기 코딩 에이전트가 개발자 컴퓨터 없이도 백그라운드에서 PR을 완성합니다.",
        weakerHere: "JetBrains IDE 특유의 정적 분석 기반 결정론적 리팩터링 정확도는 JetBrains AI Assistant가 앞섭니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-06-01",
        title: "사용량 기반 AI Credits 과금 전면 도입",
        change: "전 Copilot 플랜의 프리미엄 요청 과금을 폐지하고, 입력·출력·캐시 토큰 소비량에 실제 API 요율을 적용하는 AI Credits 체계로 전환했습니다.",
        errorRisk: "'같은 요금에 더 적은 사용량'이라는 개발자 불만이 나올 만큼 실사용량에 따라 월 비용이 급증할 수 있어 사용량 모니터링이 필요합니다.",
        impactLevel: "high"
      },
      {
        date: "2026-03-19",
        title: "Coding Agent 작업 시작 50% 단축",
        change: "Copilot Coding Agent가 작업을 시작하는 속도를 50% 개선하고 세션 로그 가시성을 높였습니다.",
        errorRisk: "속도 개선으로 병렬 실행 건수가 늘어나면 동시에 열리는 PR 수도 늘어나 리뷰 큐가 밀릴 수 있습니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-02-19",
        title: "Coding Agent 모델 피커 Business/Enterprise 확대",
        change: "Pro·Pro+에만 있던 Coding Agent 모델 선택 기능을 Copilot Business·Enterprise 사용자에게도 열었습니다.",
        errorRisk: "고성능 모델(Opus급, 상위 GPT-5 계열)이 상위 플랜에만 열려 있어 하위 플랜 팀은 품질 격차를 겪을 수 있습니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-10-28",
        title: "Agent HQ 발표",
        change: "GitHub Universe 2025에서 Anthropic·OpenAI·Google 등 외부 벤더 에이전트까지 한 곳에서 조율하는 Agent HQ를 공개했습니다.",
        errorRisk: "여러 벤더 에이전트를 동시에 승인하면 저장소 접근 권한 범위가 넓어져 관리자 통제가 필수입니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "PR 리뷰 이중화",
        howToUse: "Copilot 코드 리뷰를 draft PR 1차 검토에 자동 연결하고, 저장소 AGENTS.md에 팀 코딩 규칙을 명시해 리뷰 기준을 맞춥니다.",
        recommendation: "AI 리뷰 승인만으로 머지하지 말고, 보안·비즈니스 로직 변경은 반드시 사람이 최종 승인하도록 규칙화하세요."
      },
      {
        title: "에이전트 권한 최소화",
        howToUse: "엔터프라이즈 관리형 권한으로 코딩 에이전트가 실행할 수 있는 셸 명령·접근 가능 파일·네트워크 도메인을 화이트리스트로 제한합니다.",
        recommendation: "프로덕션 자격 증명이 있는 저장소는 에이전트 자동 실행 대상에서 기본적으로 제외하세요."
      },
      {
        title: "크레딧 사용량 모니터링",
        howToUse: "Billing Overview에서 팀별 AI Credits 소비를 매주 점검하고, 고비용 모델(Opus급, 상위 GPT-5 계열) 사용을 필요한 작업으로 제한합니다.",
        recommendation: "월 예산 상한 알림을 설정해 사용량 기반 과금 전환 이후의 비용 급증을 조기에 감지하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.5/5",
        note: "GitHub Copilot 제품 리뷰 234건 기준, 2026-09 확인",
        url: "https://www.g2.com/products/github-copilot/reviews"
      },
      {
        source: "G2 (Cursor 대안 비교 페이지)",
        score: "4.4/5",
        note: "리뷰 379건 이상 기준 집계",
        url: "https://www.g2.com/products/cursor/competitors/alternatives"
      }
    ],
    sources: [
      {
        label: "GitHub Copilot 요금제·빌링 변경 공식 발표",
        url: "https://github.blog/changelog/2026-06-01-updates-to-github-copilot-billing-and-plans/"
      },
      {
        label: "GitHub Agent HQ 공식 발표",
        url: "https://github.blog/news-insights/company-news/welcome-home-agents/"
      },
      {
        label: "Copilot Coding Agent 속도 개선 체인지로그",
        url: "https://github.blog/changelog/2026-03-19-copilot-coding-agent-now-starts-work-50-faster/"
      },
      {
        label: "Copilot Coding Agent 모델 피커 확대 체인지로그",
        url: "https://github.blog/changelog/2026-02-19-model-picker-for-copilot-coding-agent-for-copilot-business-and-enterprise-users/"
      },
      {
        label: "Copilot 코드 리뷰 MCP 정식 지원 체인지로그",
        url: "https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/"
      },
      { label: "GitHub Copilot G2 리뷰", url: "https://www.g2.com/products/github-copilot/reviews" },
      {
        label: "2026-01-13 Copilot 장애 커뮤니티 스레드",
        url: "https://github.com/orgs/community/discussions/184156"
      },
      {
        label: "사용량 기반 과금 전환에 대한 개발자 반응 보도",
        url: "https://visualstudiomagazine.com/articles/2026/04/27/devs-sound-off-on-usage-based-copilot-pricing-change-you-will-get-less-but-pay-the-same-price.aspx"
      }
    ],
    researchedAt: "2026-09"
  },
  // Cursor
  "762a6a6b-23e6-4804-a095-3c538b953211": {
    oneLine: "에이전트 코딩 속도는 업계 최고 수준이지만, 1년 새 네 차례 바뀐 요금제가 비용 예측을 어렵게 합니다.",
    scoreBreakdown: { functionality: 90, uiux: 83, reliability: 65, comfort: 68, pricing: 50 },
    keyFeatures: [
      "Composer 2: Cursor 자체 개발한 초저지연 에이전트 코딩 모델(대부분 응답 30초 내)",
      "Agents 창: 여러 에이전트를 git worktree·원격 머신에서 동시 병렬 실행",
      "Design Mode: 화면 시안을 코드로 바로 변환하는 비주얼-투-코드 워크플로",
      "Agent Client Protocol로 JetBrains IDE까지 에이전트 확장(2026-03)",
      "Privacy Mode 기본 적용으로 코드 로깅 없이 처리하는 팀 전용 서버 라우팅",
      "GPT·Claude·Gemini 등 서드파티 모델과 자체 Auto 모드를 함께 쓰는 모델 피커"
    ],
    pricingSummary: "Hobby(무료)·Pro($20)·Ultra($200) 개인 플랜과 Teams(Standard $40/유저, Premium $120/유저, 2026-06 이원화)·Enterprise로 구성되며, 2025-06 정액 요청제 폐지 이후 2026-08에는 Auto 모드 고정가마저 폐지해 실사용 모델 단가로 과금합니다.",
    koreaNote: "한국 사용자 커뮤니티(클리앙 등)에서는 연 결제 시 약 20만원대 비용에 만족도가 높지만, 원화 자동 결제나 국내 세금계산서 발행 여부는 별도 확인이 필요합니다(확인 필요).",
    comparisons: [
      {
        competitor: "GitHub Copilot",
        worksBetterHere: "Agents 창에서 여러 에이전트를 동시에 병렬 실행하고 각각 다른 모델·승인 정책을 지정할 수 있습니다.",
        weakerHere: "GitHub 저장소·Actions·엔터프라이즈 감사 로그와의 네이티브 통합 깊이는 Copilot이 앞섭니다."
      },
      {
        competitor: "Windsurf",
        worksBetterHere: "자체 저지연 모델 Composer 2로 대부분의 턴을 30초 이내에 처리해 체감 응답 속도가 빠릅니다.",
        weakerHere: "요금 정책이 1년에 여러 번 바뀌어 Windsurf 대비 비용 예측 가능성이 낮다는 평가를 받습니다."
      },
      {
        competitor: "Claude Code",
        worksBetterHere: "GUI 기반 diff 리뷰, 인라인 채팅, Design Mode 등 비주얼 편집 환경이 훨씬 풍부합니다.",
        weakerHere: "터미널 중심의 단순함과 예측 가능한 토큰당 과금 방식은 Claude Code 쪽이 더 명확합니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-08-24",
        title: "Auto 모드 고정가 폐지",
        change: "Auto 모드의 정액 요금을 폐지하고 모든 Auto 요청을 라우팅된 모델의 정가로 과금하도록 변경했으며, Teams·Enterprise는 서드파티 모델에 토큰당 $0.25 추가 요금을 부과합니다.",
        errorRisk: "Auto 모드를 '무제한'으로 알고 대량 사용하던 팀은 변경 이후 청구액이 급증할 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-06-01",
        title: "Teams 요금제 이원화",
        change: "Teams 좌석을 Standard($40/유저)와 Premium($120/유저)로 나누고, 자사 모델과 서드파티 모델 사용량 풀을 분리했습니다.",
        errorRisk: "기존 단일 Teams 요금에 익숙한 팀은 좌석을 잘못 배정하면 예상보다 빨리 모델 사용 한도에 도달할 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-10-29",
        title: "Cursor 2.0 및 Composer 출시",
        change: "Cursor 2.0을 출시하며 자체 코딩 모델 Composer와 멀티 에이전트 병렬 실행 인터페이스를 처음 도입했습니다.",
        errorRisk: "여러 에이전트를 동시에 승인하면 git worktree 간 충돌이나 의도치 않은 동시 수정이 발생할 수 있어 병합 전 검토가 필요합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-07-04",
        title: "요금 변경 관련 공개 사과",
        change: "2025-06 요청 기반 요금제를 사용량 기반 크레딧제로 개편하며 발생한 혼란과 예상치 못한 과금에 대해 공개 사과하고 일부 환불을 진행했습니다.",
        errorRisk: "사전 고지 없는 과금 모델 변경은 팀 예산 초과와 사용자 이탈로 이어질 수 있음을 보여준 사례입니다.",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "에이전트 승인 정책",
        howToUse: "Agents 창에서 에이전트별로 자동 승인 범위(파일 수정, 터미널 명령 실행 여부)를 다르게 설정하고, 프로덕션 브랜치는 수동 승인만 허용합니다.",
        recommendation: "git hook 조작 취약점 사례처럼 .git 디렉터리·CI 설정 파일 변경은 반드시 사람이 diff를 확인한 뒤 병합하세요."
      },
      {
        title: "모델별 예산 분리",
        howToUse: "Teams 관리자 대시보드에서 자체 모델 풀과 서드파티 모델 풀 사용량을 분리 추적하고, 고가 모델은 특정 프로젝트에만 허용합니다.",
        recommendation: "Auto 모드를 '무제한'으로 오인하지 말고, 월별 예상 청구액을 사전에 시뮬레이션한 뒤 팀에 공유하세요."
      },
      {
        title: "민감 저장소 격리",
        howToUse: "고객 데이터나 시크릿이 포함된 저장소는 Privacy Mode를 강제 적용하고, cursorignore로 민감 파일을 에이전트 접근 대상에서 제외합니다.",
        recommendation: "cursorignore 우회 취약점 이력이 있었던 만큼, 최신 버전 유지와 MDM 강제 업데이트를 기본 정책으로 삼으세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.6/5",
        note: "리뷰 312건 기준, 2026-09 확인",
        url: "https://www.g2.com/sellers/cursor"
      },
      {
        source: "G2 (GitHub Copilot 비교 페이지)",
        score: "4.6/5",
        note: "Cursor vs GitHub Copilot 비교 페이지 기준",
        url: "https://www.g2.com/compare/cursor-vs-github-copilot"
      },
      {
        source: "Hack'celeration (독립 리뷰)",
        score: "4.0/5",
        note: "가격 정책 관련 감점을 반영한 2026년 리뷰",
        url: "https://hackceleration.com/labs/review/cursor"
      }
    ],
    sources: [
      { label: "Cursor 2.0/Composer 공식 발표", url: "https://cursor.com/blog/2-0" },
      {
        label: "Cursor Teams 요금제 개편 공식 블로그",
        url: "https://cursor.com/blog/teams-pricing-june-2026"
      },
      { label: "Cursor 공식 체인지로그", url: "https://cursor.com/changelog" },
      {
        label: "Cursor 가격 정책 논란 TechCrunch 보도",
        url: "https://techcrunch.com/2025/07/07/cursor-apologizes-for-unclear-pricing-changes-that-upset-users/"
      },
      { label: "Cursor G2 리뷰", url: "https://www.g2.com/sellers/cursor" },
      {
        label: "Cursor CVE-2025-64110 취약점 분석",
        url: "https://www.sentinelone.com/vulnerability-database/cve-2025-64110/"
      },
      {
        label: "Cursor 프롬프트 인젝션 RCE 취약점(DuneSlide) 보도",
        url: "https://www.securityweek.com/critical-cursor-ai-ide-flaws-could-lead-to-os-level-remote-code-execution/"
      },
      { label: "Cursor 엔터프라이즈 보안 가이드", url: "https://repello.ai/blog/cursor-security" }
    ],
    researchedAt: "2026-09"
  },
  // Lovable
  "3550a6c2-e93f-4c0f-aeea-2794107c1e02": {
    oneLine: "아이디어를 앱으로 바꾸는 속도는 압도적이지만, 반복된 보안 사고가 '바이브 코딩'의 위험을 보여줍니다.",
    scoreBreakdown: { functionality: 84, uiux: 85, reliability: 55, comfort: 72, pricing: 60 },
    keyFeatures: [
      "Agent Mode: 요구사항을 스스로 계획하고 다단계로 실행하는 자율 빌드 에이전트",
      "Subagents(2026-05): Researcher·Reviewer·Synthesizer가 병렬로 코드 검토·조사",
      "최대 15분까지 확장된 에이전트 처리 시간으로 복잡한 작업 연속 수행",
      "Gemini 3.6 Flash 등 앱 내 AI 기능용 모델을 프로젝트에 바로 연동",
      "Supabase 연동 백엔드·인증·DB를 대화형 프롬프트만으로 자동 구성",
      "크레딧 기반 종량 과금으로 무제한 팀원 초대 및 좌석 제한 없음"
    ],
    pricingSummary: "Free(일 5크레딧, 월 최대 30)·Pro(월 $25, 크레딧 100개)·Business(월 $50, SSO·거버넌스 포함)·Enterprise(별도 협의)로 구성되며, 연간 결제 시 Pro는 약 $21, Business는 약 $42까지 할인됩니다.",
    koreaNote: "이랜서·요즘IT 등 국내 매체에도 입문 후기가 올라올 만큼 관심이 높지만, 한국어 프롬프트는 인식돼도 공식 UI 현지화나 원화 결제는 확인되지 않았습니다(확인 필요).",
    comparisons: [
      {
        competitor: "Bolt.new",
        worksBetterHere: "Researcher·Reviewer 서브에이전트가 변경 사항을 배포 전에 교차 검토해 인접 기능이 깨지는 문제를 더 잘 잡아냅니다.",
        weakerHere: "Bolt.new의 StackBlitz 기반 브라우저 내 즉시 실행·프리뷰 속도는 Lovable보다 빠르다는 평가가 많습니다."
      },
      {
        competitor: "v0",
        worksBetterHere: "Supabase 인증·데이터베이스까지 포함한 완전한 풀스택 앱을 프롬프트만으로 배포까지 끝냅니다.",
        weakerHere: "Vercel 생태계·Next.js 컴포넌트 품질과 디자인 시스템 정합성은 v0가 한 수 위라는 평가를 받습니다."
      },
      {
        competitor: "Replit",
        worksBetterHere: "비개발자도 채팅형 인터페이스만으로 화면 단위 앱을 빠르게 완성할 수 있습니다.",
        weakerHere: "다양한 언어·프레임워크를 다루는 범용 클라우드 IDE 및 협업 기능은 Replit이 더 넓습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-08",
        title: "시리즈 C $400M, 기업가치 $13.3B",
        change: "Menlo Ventures 주도로 4억 달러 규모 시리즈 C를 유치하며 기업가치가 133억 달러로 상승했습니다.",
        errorRisk: "빠른 밸류에이션 상승과 별개로 반복된 보안 사고 이력은 엔터프라이즈 도입 심사에서 계속 리스크 요인으로 언급됩니다.",
        impactLevel: "low"
      },
      {
        date: "2026-05",
        title: "Subagents(서브에이전트) 출시",
        change: "빌드 에이전트가 Researcher·Reviewer·Synthesizer 등 전문 서브에이전트를 병렬로 호출해 코드베이스 조사와 변경 검토를 나눠 맡도록 했습니다.",
        errorRisk: "서브에이전트 리뷰 결과를 사람 검토 없이 그대로 신뢰하면, 여전히 놓치는 엣지 케이스가 남아있을 수 있습니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-04-21",
        title: "대규모 데이터 노출 사고 대응",
        change: "권한 체계 통합 작업 중 실수로 공개 프로젝트의 채팅 기록 접근 권한이 되살아나 2025년 11월 이전 생성 프로젝트 전반이 노출되는 사고가 발생했고, Lovable은 공식 블로그로 대응 내용을 공개했습니다.",
        errorRisk: "초기에 '의도된 동작'이라 해명했다가 번복하면서 신뢰도 문제가 불거졌고, 과거 프로젝트를 방치한 사용자는 여전히 노출 위험이 남아있을 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-03-21",
        title: "RLS 미설정 취약점(CVE-2025-48757) 신고",
        change: "Lovable로 만든 앱에서 Row Level Security 미설정으로 인증 없이 DB를 읽고 쓸 수 있는 취약점이 최초 신고됐고, 이후 4월 공개 시연으로 확산됐습니다.",
        errorRisk: "표본 1,645개 앱 중 170개에서 개인정보·API 키 등이 그대로 노출된 것으로 조사돼, 기본 템플릿을 그대로 배포하면 데이터 유출로 이어질 수 있습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "배포 전 보안 점검",
        howToUse: "배포 전 Supabase Row Level Security 정책을 팀 엔지니어가 직접 확인하고, Reviewer 서브에이전트 결과를 그대로 신뢰하지 않습니다.",
        recommendation: "개인정보·결제 정보를 다루는 프로젝트는 외부 보안 점검을 거치기 전까지 프로덕션 공개를 금지하세요."
      },
      {
        title: "크레딧 예산 관리",
        howToUse: "PM이 기능 단위로 예상 크레딧을 산정하고, Pro·Business 플랜의 월 크레딧 소진 추이를 대시보드로 매주 확인합니다.",
        recommendation: "오류 수정도 크레딧을 소모하므로, 한 번에 큰 프롬프트보다 작은 단위로 나눠 재작업 비용을 줄이세요."
      },
      {
        title: "디자이너-엔지니어 협업",
        howToUse: "디자이너가 Lovable로 초안을 빠르게 만들고, 엔지니어링 팀이 코드 export 후 리뷰·리팩터링을 맡는 이원화 워크플로를 씁니다.",
        recommendation: "Lovable 산출물을 그대로 프로덕션에 쓰지 말고, 장기 유지보수가 필요한 핵심 기능은 반드시 코드 리뷰 단계를 거치게 하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.6/5",
        note: "리뷰 243건 기준, 2026-09 확인",
        url: "https://www.g2.com/products/lovable/reviews"
      },
      {
        source: "G2 (셀러 페이지)",
        score: "4.7/5",
        note: "리뷰 273건 기준 종합 평점",
        url: "https://www.g2.com/sellers/lovable"
      }
    ],
    sources: [
      { label: "Lovable 공식 Agent Mode 발표", url: "https://lovable.dev/blog/agent-mode-beta" },
      {
        label: "Lovable 2026-04 사고 공식 대응 블로그",
        url: "https://lovable.dev/blog/our-response-to-the-april-2026-incident"
      },
      {
        label: "Lovable RLS 취약점 분석(Superblocks)",
        url: "https://www.superblocks.com/blog/lovable-vulnerabilities"
      },
      {
        label: "The Register, Lovable 데이터 유출 논란 보도",
        url: "https://www.theregister.com/security/2026/04/21/lovable-denies-data-leak-cites-intentional-behavior/5226233"
      },
      {
        label: "Lovable Subagents 출시 보도",
        url: "https://aitoolblaze.com/blog/lovable-ai-subagents-launch-2026"
      },
      {
        label: "Forbes, Lovable 시리즈 C 밸류에이션 보도",
        url: "https://www.forbes.com/sites/rashishrivastava/2026/06/05/ai-coding-startup-lovable-in-talks-to-raise-funding-at-a-12-billion-valuation/"
      },
      { label: "Lovable 공식 체인지로그", url: "https://docs.lovable.dev/changelog" },
      { label: "Lovable G2 리뷰", url: "https://www.g2.com/products/lovable/reviews" }
    ],
    researchedAt: "2026-09"
  },
  // Midjourney
  "2bcd0979-16f3-4a47-aa48-2eff55c47a1d": {
    oneLine: "화풍과 이미지 품질은 독보적이고 V8.2로 속도까지 잡았지만, 공식 API 부재와 저작권 소송 리스크는 여전합니다.",
    scoreBreakdown: { functionality: 88, uiux: 68, reliability: 78, comfort: 65, pricing: 55 },
    keyFeatures: [
      "V8.2 (2026-07-24 기본 모델): 미학·이미지 품질·개인화(Personalization) 개선",
      "Edit Model: Omni Reference·Character Reference·Retexture를 대체하는 통합 편집 모델",
      "V8.1: 표준 작업 렌더링 4~5배 가속, HD 모드는 3배 빠르고 3배 저렴",
      "Video 모델(2025-06): 정지 이미지를 'Animate'로 짧은 클립으로 확장, 자동/커스텀 모션 프롬프트",
      "Draft·Relax 모드로 GPU 시간을 아끼며 초안을 빠르게 반복 생성",
      "Discord 봇과 웹 앱(midjourney.com) 두 경로로 생성하고 커뮤니티 갤러리에 공유"
    ],
    pricingSummary: "Basic $10, Standard $30, Pro $60, Mega $120/월(연 결제 시 각 $8·$24·$48·$96)이며 이미지 수가 아니라 Fast GPU 시간(월 3.3·15·30·60시간)을 구매하는 구조입니다. 2023년 3월 무료 체험 폐지 이후 무료 플랜은 없고, Pro 이상에서만 생성물을 비공개(Stealth)로 유지할 수 있습니다.",
    koreaNote: "한국어 프롬프트도 인식하지만 영어 대비 해석 정확도가 낮다는 후기가 많고, 한국어 UI는 없어 Discord와 웹 모두 영어로 사용해야 합니다.",
    comparisons: [
      {
        competitor: "DALL-E 3",
        worksBetterHere: "예술적 화풍의 완성도와 디테일 표현에서 꾸준히 더 높은 평가를 받습니다.",
        weakerHere: "ChatGPT에 내장돼 대화 맥락 안에서 바로 이미지를 생성·수정하는 편의성은 DALL-E 3 쪽이 앞섭니다."
      },
      {
        competitor: "Stable Diffusion",
        worksBetterHere: "별도 GPU 인프라나 모델 튜닝 없이 구독만으로 바로 고품질 결과를 얻을 수 있습니다.",
        weakerHere: "오픈소스 가중치를 로컬에 직접 설치해 무제한·상업적으로 자유롭게 커스터마이징하는 것은 Stable Diffusion만 가능합니다."
      },
      {
        competitor: "Adobe Firefly",
        worksBetterHere: "커뮤니티 갤러리와 독자적 화풍 생태계 덕에 스타일 다양성과 트렌드 반영 속도가 빠릅니다.",
        weakerHere: "Photoshop·Illustrator와의 네이티브 연동, 콘텐츠 자격 증명 기반 상업적 라이선스 보장은 Adobe Firefly가 더 명확합니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-07-24",
        title: "V8.2 기본 모델 전환과 Edit Model 도입",
        change: "V8.2가 기본 버전이 되면서 미학·이미지 품질·개인화가 개선됐고, Omni Reference·Character Reference·Retexture를 대체하는 새 Edit Model이 도입됐습니다.",
        errorRisk: "기존 --oref/--cref 기반 캐릭터 일관성 워크플로가 Edit Model로 바뀌어 프롬프트와 레퍼런스 설정을 다시 맞춰야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2026-04-14",
        title: "V8.1 출시: 렌더링 4~5배 가속",
        change: "표준 작업 렌더링이 4~5배 빨라지고 HD 모드가 3배 빠르고 3배 저렴해졌으며, 6월 10일부터 7월 23일까지 기본 버전으로 쓰였습니다.",
        errorRisk: "무드보드·스타일 레퍼런스 결과가 V7과 달라져 브랜드 스타일 프리셋을 재검증해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-06-18",
        title: "첫 영상 생성 모델 V1 공개",
        change: "정지 이미지를 'Animate' 버튼으로 짧은 영상 클립으로 확장하는 첫 비디오 모델을 출시했습니다. 자동 모션과 커스텀 모션 프롬프트 두 모드를 제공합니다.",
        errorRisk: "영상 생성은 이미지보다 GPU 시간 소모가 훨씬 커 월 Fast 시간이 빨리 소진되고 예산 초과가 발생하기 쉽습니다.",
        impactLevel: "medium"
      },
      {
        date: "2025-06-11",
        title: "Disney·Universal 저작권 침해 소송 피소",
        change: "디즈니와 NBCUniversal(드림웍스 포함)이 스타워즈·심슨·슈렉·미니언즈 등 캐릭터 무단 생성을 이유로 저작권 침해 소송을 제기했습니다. 할리우드 메이저 스튜디오가 AI 기업을 제소한 첫 사례입니다.",
        errorRisk: "판결에 따라 특정 캐릭터·스타일 생성이 제한되거나, 기업이 상업적으로 쓰는 생성물에 법적 리스크가 생길 수 있습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "상업물 저작권 점검",
        howToUse: "생성 이미지를 광고·상품 패키지 등 대외용으로 쓰기 전, 유명 캐릭터·특정 작가 화풍 키워드가 프롬프트에 섞이지 않았는지 체크리스트로 확인합니다.",
        recommendation: "Disney·Universal 소송 사례처럼 캐릭터 지식재산권 분쟁 소지가 있는 결과물은 법무 검토 없이 상업적으로 배포하지 마세요."
      },
      {
        title: "무드보드 빠른 반복",
        howToUse: "기획·마케팅팀이 Draft Mode로 다수 시안을 저비용으로 뽑은 뒤, 방향이 정해지면 고품질 모드로 소수만 재생성합니다.",
        recommendation: "초안 단계 이미지를 그대로 최종 산출물로 쓰지 말고, 반드시 고해상도 재생성·보정 단계를 거치세요."
      },
      {
        title: "브랜드 화풍 일관성 관리",
        howToUse: "Omni-Reference와 스타일 참조 이미지를 팀 공용 프리셋으로 저장해 여러 담당자가 같은 톤의 이미지를 생성하도록 맞춥니다.",
        recommendation: "생성 계정과 프롬프트 기록을 팀 단위로 공유해, 담당자가 바뀌어도 브랜드 룩앤필이 흔들리지 않게 하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.4/5",
        note: "검증 리뷰 102건 기준, 2026-09 확인",
        url: "https://www.g2.com/products/midjourney/reviews"
      },
      {
        source: "Product Hunt",
        score: "확인 필요",
        note: "커뮤니티 리뷰가 있으나 이번 조사에서 수치를 확인하지 못했습니다",
        url: "https://www.producthunt.com/products/midjourney/reviews"
      }
    ],
    sources: [
      {
        label: "Midjourney 공식 문서: 모델 버전",
        url: "https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version"
      },
      { label: "Midjourney 공식 업데이트: V8.1 Alpha", url: "https://updates.midjourney.com/v8-1-alpha/" },
      {
        label: "VentureBeat: 첫 영상 모델 출시 보도",
        url: "https://venturebeat.com/business/surpassing-all-my-expectations-midjourney-releases-first-ai-video-model-amid-disney-universal-lawsuit"
      },
      {
        label: "CNBC: Disney·Universal 소송 보도",
        url: "https://www.cnbc.com/2025/06/11/disney-universal-midjourney-ai-copyright.html"
      },
      {
        label: "Costbench: 2026 요금제 정리",
        url: "https://costbench.com/software/ai-image-generators/midjourney/"
      },
      { label: "G2 Midjourney 리뷰", url: "https://www.g2.com/products/midjourney/reviews" }
    ],
    researchedAt: "2026-09"
  },
  // Canva
  "c2837b2c-df6d-45ab-ae15-76679668603d": {
    oneLine: "제작 속도와 팀 협업은 뛰어나고 AI 2.0으로 생성 폭이 커졌지만, AI 생성물의 저작권·브랜드 일관성 관리는 별도 규칙이 필요합니다.",
    scoreBreakdown: { functionality: 85, uiux: 90, reliability: 82, comfort: 83, pricing: 75 },
    keyFeatures: [
      "Canva AI 2.0 (2026-04): 디자인 전용 파운데이션 모델 Canva Design Model, 대화형 디자인과 지속 메모리",
      "Magic Layers: gpt-image-2 연동으로 AI 포스터를 편집 가능한 레이어로 분리",
      "Magic Studio: Magic Write·Magic Design·Magic Media·Magic Edit·Magic Eraser·Magic Expand",
      "Visual Suite 2.0: Canva Sheets·Canva Code·Docs·Whiteboard를 디자인과 한 파일에서 연동",
      "브랜드 키트: 로고·컬러·폰트를 팀 템플릿에 자동 반영해 톤을 통일",
      "Affinity by Canva (2025-10): 벡터·픽셀·레이아웃 통합 전문가용 데스크톱 앱을 완전 무료 제공"
    ],
    pricingSummary: "Free 외에 Pro $18/월(연 $144), Business(구 Teams) 인당 $25/월(연 $250, 최소 인원 없음), Enterprise는 별도 협의입니다. 2024년 9월 Teams가 정액제에서 인당 과금으로 바뀌며 5인 팀 기준 연 $119.99에서 $500으로 오른 사례가 논란이 됐고, 이후 Canva는 가격 변경 60일 전 고지 원칙을 공개했습니다.",
    koreaNote: "한국어 UI(canva.com/ko_kr)와 다수의 한국어 폰트·템플릿을 지원해 학생·소상공인·마케터 사이에서 실무 활용도가 높고, 국내 블로그·유튜브에 튜토리얼 콘텐츠도 풍부합니다.",
    comparisons: [
      {
        competitor: "Adobe Express",
        worksBetterHere: "Docs·Sheets·화이트보드까지 아우르는 Visual Suite로 디자인 외 업무 문서까지 한 플랫폼에서 처리합니다.",
        weakerHere: "포토샵·일러스트레이터급 정밀 편집과 색상 프로파일 관리는 Adobe 생태계에 연동된 Adobe Express가 더 강합니다."
      },
      {
        competitor: "Figma",
        worksBetterHere: "비전공자도 바로 쓸 수 있는 방대한 템플릿과 자동 리사이즈로 SNS·인쇄물 제작 속도가 훨씬 빠릅니다.",
        weakerHere: "정교한 컴포넌트·오토레이아웃 기반 프로덕트 UI 설계와 개발자 핸드오프는 Figma가 표준입니다."
      },
      {
        competitor: "Microsoft Designer",
        worksBetterHere: "브랜드 키트, 팀 승인 워크플로, 대규모 템플릿 라이브러리 등 팀 협업 기능이 훨씬 성숙합니다.",
        weakerHere: "Microsoft 365(파워포인트·워드)와의 네이티브 연동 및 기업 라이선스 번들 편의성은 Microsoft Designer가 유리합니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-04",
        title: "Canva AI 2.0: Canva Design Model·Magic Layers 공개",
        change: "디자인 전용 파운데이션 모델 Canva Design Model과 대화형 디자인, 지속 메모리, gpt-image-2 연동 Magic Layers(AI 포스터를 편집 가능한 레이어로 분리), 6종의 지능형 워크플로를 공개했습니다.",
        errorRisk: "AI 생성 비중이 커질수록 브랜드 키트 규칙과 충돌하는 결과물이 늘어나므로, 게시 전 승인 워크플로가 필요합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-10-30",
        title: "Affinity by Canva 완전 무료 재출시",
        change: "인수한 Affinity Designer·Photo·Publisher를 Vector·Pixel·Layout 탭을 가진 단일 Mac/Windows 앱으로 통합해, Canva 계정만 있으면 '영구 무료'로 제공하기 시작했습니다.",
        errorRisk: "Canva 계정 로그인이 필수가 됐고, 무료 모델의 지속 가능성과 향후 AI 기능 유료화 여부를 지켜봐야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-04-10",
        title: "Canva Create 2025: Visual Suite 2.0 출시",
        change: "창사 이래 최대 규모 출시로 Canva Sheets(Magic Insights·Charts·Formulas), 프롬프트로 인터랙티브 콘텐츠를 만드는 Canva Code, 대화형 어시스턴트 Canva AI를 공개했습니다.",
        errorRisk: "스프레드시트·코드 기능이 디자인 파일에 섞이면서 권한과 데이터 출처 관리가 복잡해질 수 있습니다.",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "브랜드 키트 표준화",
        howToUse: "마케팅팀이 로고·컬러·폰트를 브랜드 키트에 등록하고, 전 부서 템플릿을 브랜드 키트 연동 템플릿으로만 배포합니다.",
        recommendation: "브랜드 키트 밖에서 임의로 만든 디자인은 배포 전 마케팅팀 승인 워크플로를 거치게 하세요."
      },
      {
        title: "AI 생성물 저작권 체크",
        howToUse: "Magic Media로 만든 이미지를 대외 광고·패키지에 쓰기 전, 실존 인물·상표·캐릭터 요소가 포함되지 않았는지 디자인팀이 육안 검수합니다.",
        recommendation: "고위험(패키지, 옥외광고 등) 용도에는 AI 생성 이미지보다 라이선스가 명확한 스톡·자체 촬영 소재를 우선하세요."
      },
      {
        title: "문서·기획 통합 협업",
        howToUse: "기획팀이 Canva Docs·Whiteboard로 기획안을 작성하고 Magic Switch로 발표 자료·SNS 카드뉴스로 바로 변환해 산출물 형식을 통일합니다.",
        recommendation: "여러 포맷으로 자동 변환한 결과물은 그대로 배포하지 말고, 포맷별 가독성(폰트 크기, 여백)을 담당자가 한 번씩 확인하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.7/5",
        note: "검증 리뷰 8,100건 이상 기준, 2026-09 확인",
        url: "https://www.g2.com/products/canva/reviews"
      },
      {
        source: "Trustpilot",
        score: "4.0/5",
        note: "리뷰 약 6,000건, 결제·환불 불만이 1점 리뷰의 주요 사유",
        url: "https://www.trustpilot.com/review/canva.com"
      }
    ],
    sources: [
      {
        label: "Canva 뉴스룸: Visual Suite 2.0 소개 (Canva Create 2025)",
        url: "https://www.canva.com/newsroom/news/canva-create-2025/"
      },
      {
        label: "Canva 뉴스룸: AI 출시 모음",
        url: "https://www.canva.com/newsroom/news/canva-ai-launches/"
      },
      {
        label: "MacRumors: Affinity 무료 재출시 보도",
        url: "https://www.macrumors.com/2025/10/31/canva-relaunches-affinity-free-app/"
      },
      {
        label: "Piktochart: 2026 Canva 요금제와 인상 이력",
        url: "https://piktochart.com/blog/canva-pricing-2026-costs-raised/"
      },
      { label: "Canva 공식 요금제", url: "https://www.canva.com/pricing/" },
      { label: "G2 Canva 리뷰", url: "https://www.g2.com/products/canva/reviews" },
      { label: "Trustpilot Canva 리뷰", url: "https://www.trustpilot.com/review/canva.com" }
    ],
    researchedAt: "2026-09"
  },
  // NotebookLM
  "6b09c6d8-ef44-4dda-a96c-6ff2c035a497": {
    oneLine: "출처 기반 요약과 오디오·영상 개요는 강력하지만, 소스 개수와 고급 기능은 유료 등급에 따라 크게 갈립니다.",
    scoreBreakdown: { functionality: 87, uiux: 83, reliability: 78, comfort: 74, pricing: 72 },
    keyFeatures: [
      "Audio Overview가 업로드 자료를 팟캐스트형 대화로 변환, 한국어 등 다국어 음성 지원",
      "Cinematic Video Overview가 Gemini 3·Veo 3·Nano Banana Pro로 애니메이션 영상 생성",
      "노트북당 최대 50~500여 개 소스를 업로드해 인용 출처와 함께 답변 생성",
      "Studio 패널에서 마인드맵·인포그래픽·퀴즈·플래시카드 등 학습 자료 생성",
      "복잡한 질문을 다단계로 조사해 구조화 리포트로 정리하는 심층 리서치 기능",
      "Google Workspace Business Standard 이상에 NotebookLM Plus가 기본 포함"
    ],
    pricingSummary: "무료 플랜은 노트북당 소스 50개까지 지원하며, Plus 기능은 Google AI Pro(월 $19.99) 구독에 포함되고 Cinematic Video Overview 등 최상위 기능은 Google AI Ultra(월 $249.99)에서만 제공되며, 기업은 Google Cloud의 NotebookLM Enterprise(라이선스당 월 약 $9~)를 별도 계약합니다.",
    koreaNote: "한국어를 포함해 50개 이상 언어와 한국어 음성 오디오 개요를 지원하지만, 일부 사용자는 한국어 원문의 미묘한 뉘앙스 처리와 결과물 세부 편집에는 한계가 있다고 평가합니다.",
    comparisons: [
      {
        competitor: "ChatGPT (Deep Research)",
        worksBetterHere: "업로드 소스에만 근거해 답하고 문장마다 출처를 표시해 환각 위험이 낮음",
        weakerHere: "실시간 웹 브라우징이나 코드 실행 등 범용 에이전트 작업은 ChatGPT 쪽이 더 폭넓음"
      },
      {
        competitor: "Perplexity",
        worksBetterHere: "업로드한 긴 문서·영상을 오디오·영상 개요 콘텐츠로 변환하는 기능은 Perplexity에 없음",
        weakerHere: "실시간 웹 검색과 최신 뉴스 반영 속도는 Perplexity가 더 빠름"
      },
      {
        competitor: "Notion AI",
        worksBetterHere: "여러 소스를 종합한 팟캐스트·영상 개요 자동 생성은 Notion AI에는 없는 기능",
        weakerHere: "문서 자체를 편집·정리하고 팀 위키로 축적하는 협업 문서 기능은 Notion AI가 훨씬 강함"
      }
    ],
    patchNotes: [
      {
        date: "2026-07",
        title: "'Gemini Notebook' 브랜드 통합 움직임(확인 필요)",
        change: "NotebookLM이 Gemini 제품군과 브랜드를 통합하며 'Gemini Notebook' 명칭으로 전환되는 정황이 포착됨",
        errorRisk: "브랜드·URL 변경 과정에서 기존 북마크·워크플로 문서의 링크가 바뀔 수 있음",
        impactLevel: "low"
      },
      {
        date: "2026-06",
        title: "Cinematic Video Overview 출시(Gemini 3·Veo 3 기반)",
        change: "Gemini 3가 연출을 맡고 Veo 3·Nano Banana Pro로 애니메이션 영상 개요를 만드는 기능을 Google AI Ultra 구독자에 우선 공개",
        errorRisk: "고가 Ultra 요금제 전용이라 대부분의 무료·Plus 사용자는 사용할 수 없음",
        impactLevel: "high"
      },
      {
        date: "2026-05",
        title: "Google I/O 2026에서 심층 리서치·Studio 업그레이드 공개",
        change: "구글이 I/O 2026에서 NotebookLM의 심층 리서치 기능과 개편된 Studio 패널을 공개",
        errorRisk: "신기능이 지역·언어별로 순차 배포되어 동시 이용이 어려울 수 있음",
        impactLevel: "medium"
      },
      {
        date: "2025-09",
        title: "Video Overview 출시",
        change: "소스 속 시각자료를 활용해 내레이션이 있는 슬라이드형 Video Overview 기능을 새로 추가",
        errorRisk: "생성 시간이 길고 소스 품질에 따라 슬라이드 구성 정확도가 달라질 수 있음",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "회의 전 리서치 브리핑",
        howToUse: "관련 보고서·계약서·업계 뉴스를 노트북에 업로드하고 Audio Overview로 이동 중 들을 수 있는 브리핑을 생성",
        recommendation: "오디오 요약은 참고용으로만 쓰고 숫자·계약 조건 등 핵심 사실은 원문 소스에서 직접 재확인"
      },
      {
        title: "팀 온보딩 자료 제작",
        howToUse: "사내 위키·정책 문서를 모아 노트북을 만들고 Video Overview와 인포그래픽으로 신규 입사자용 요약 자료 생성",
        recommendation: "민감한 인사·재무 문서는 Workspace 관리자 권한으로 접근이 제한된 노트북에만 업로드"
      },
      {
        title: "논문·리포트 비교 분석",
        howToUse: "관련 논문 여러 편을 소스로 올리고 질문을 던져 출처 인용이 달린 비교 답변과 마인드맵을 생성",
        recommendation: "인용된 출처 번호를 눌러 원문 문장을 대조하는 습관화, 한국어 원문은 특히 재검증"
      }
    ],
    externalRatings: [
      {
        source: "Apple App Store (Google NotebookLM)",
        score: "확인 필요",
        note: "리뷰는 대체로 긍정적이나 정확한 별점 수치는 확인되지 않음 (평가 데이터 부족)",
        url: "https://apps.apple.com/us/app/google-notebooklm/id6737527615"
      },
      {
        source: "Google Play (Google NotebookLM)",
        score: "확인 필요",
        note: "팟캐스트 요약·플래시카드는 호평, 정확한 별점 수치는 확인되지 않음 (평가 데이터 부족)",
        url: "https://play.google.com/store/apps/details?id=com.google.android.apps.labs.language.tailwind"
      }
    ],
    sources: [
      {
        label: "NotebookLM Video Overview 공식 발표 (Google Blog)",
        url: "https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-video-overviews-studio-upgrades/"
      },
      {
        label: "Google I/O 2026 NotebookLM 업데이트 (Google Blog)",
        url: "https://blog.google/innovation-and-ai/products/notebooklm/notebooklm-google-io-2026/"
      },
      {
        label: "NotebookLM 소스 한도 정리 (elephas.app)",
        url: "https://elephas.app/blog/notebooklm-source-limits"
      },
      {
        label: "NotebookLM 요금제 정리 (layer3labs)",
        url: "https://www.layer3labs.io/guides/notebooklm-pricing"
      },
      {
        label: "NotebookLM 2026년 변화 정리 (Jeff Su)",
        url: "https://www.jeffsu.org/notebooklm-changed-completely-heres-what-matters-in-2026/"
      },
      { label: "NotebookLM 한국어 사용 가이드 (carat.im)", url: "https://carat.im/blog/notebooklm-guide" },
      {
        label: "Google NotebookLM iOS 앱 페이지",
        url: "https://apps.apple.com/us/app/google-notebooklm/id6737527615"
      }
    ],
    researchedAt: "2026-09"
  },
  // Perplexity Comet
  "513f021e-8678-4fe7-a49a-64248d12091a": {
    oneLine: "무료로 강력한 에이전트 브라우징을 제공하지만, 프롬프트 인젝션 보안 취약점은 아직 근본적으로 해결되지 않았습니다.",
    scoreBreakdown: { functionality: 82, uiux: 78, reliability: 52, comfort: 68, pricing: 83 },
    keyFeatures: [
      "에이전트 브라우징으로 폼 입력·쇼핑·예약 등 웹 작업을 자동 수행",
      "사이드바 어시스턴트가 현재 탭 내용을 요약하고 즉시 질문에 답변",
      "Comet Assistant 메모리가 이전 대화·검색 맥락을 기억해 재사용",
      "Deep Research로 여러 소스를 종합한 리서치 리포트 자동 생성",
      "Max 플랜의 Model Council이 여러 프론티어 모델 답변을 동시 비교·종합",
      "음성 모드로 브라우저 탐색과 질의응답을 말로 처리"
    ],
    pricingSummary: "데스크톱은 2025년 10월 무료로 전환됐고 iOS 앱까지 출시되며 2026년 3월 전 플랫폼 무료화가 완료됐지만, Pro(월 $20)·Comet Plus(월 $5, 언론사 콘텐츠)·Max(월 $200, Model Council·백그라운드 에이전트 포함)로 갈수록 에이전트 사용량과 모델 선택권이 늘어납니다.",
    koreaNote: "한국에서도 무료로 이용 가능하며 Perplexity는 40~50대 한국 이용자의 생성형 AI 사용시간 2위에 오를 만큼 인지도가 높지만, Comet 자체의 한국어 에이전트 완성도에 대한 공식 데이터는 부족합니다.",
    comparisons: [
      {
        competitor: "ChatGPT Atlas",
        worksBetterHere: "Windows·Mac·iOS·Android 전 플랫폼에서 완전 무료로 계속 서비스되고 있음",
        weakerHere: "ChatGPT 계정 기반의 장기 대화 이력과 연동된 개인화 메모리는 Atlas 쪽이 더 깊었음"
      },
      {
        competitor: "Dia",
        worksBetterHere: "Windows에서도 바로 사용 가능함(Dia는 macOS 14+ Apple Silicon 전용)",
        weakerHere: "탭 자동 그룹핑이나 로컬 암호화 등 Dia의 세밀한 프라이버시 제어 설계는 부족함"
      },
      {
        competitor: "Chrome + Gemini",
        worksBetterHere: "브라우저에 에이전트가 기본 내장돼 별도 확장 설치 없이 폼 입력·구매를 자동 실행",
        weakerHere: "Google 생태계(Gmail·Docs·Workspace) 연동과 확장 프로그램 생태계는 Chrome이 압도적으로 넓음"
      }
    ],
    patchNotes: [
      {
        date: "2026-03-18",
        title: "Comet iOS 앱 출시로 전 플랫폼 무료화 완료",
        change: "Android(2025-11-20)에 이어 iOS 앱이 출시되며 모바일까지 무료 지원 플랫폼이 확대됨",
        errorRisk: "모바일에서는 에이전트 자동화 범위가 데스크톱보다 제한적일 수 있음",
        impactLevel: "medium"
      },
      {
        date: "2025-10-02",
        title: "Comet 데스크톱 전 세계 무료 전환",
        change: "기존 Perplexity Max 전용이던 Comet을 Mac·Windows에서 무료로 전환",
        errorRisk: "무료 사용자는 에이전트 작업 크레딧이 적어 사용량 제한에 자주 걸릴 수 있음",
        impactLevel: "high"
      },
      {
        date: "2025-08-28",
        title: "LayerX, CometJacking 공격 기법 공개",
        change: "URL 쿼리 파라미터로 Comet 어시스턴트를 조작해 메모리·연동 계정 데이터를 base64로 유출하는 기법을 공개, Perplexity는 초기에 '보안 영향 없음'으로 판단",
        errorRisk: "악성 링크 클릭 한 번으로 이메일·캘린더 등 연동 데이터가 외부로 전송될 수 있음",
        impactLevel: "high"
      },
      {
        date: "2025-07-25",
        title: "Brave, Comet 프롬프트 인젝션 취약점 최초 공개",
        change: "Brave 보안팀이 Reddit 댓글로 Comet 세션을 탈취할 수 있는 간접 프롬프트 인젝션을 발견해 공개",
        errorRisk: "숨겨진 웹 콘텐츠가 사용자 명령으로 오인돼 계정 정보가 유출될 위험",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "쇼핑·예약 자동화",
        howToUse: "에이전트 브라우징 기능으로 상품 비교, 장바구니 담기, 폼 입력까지 지시문 하나로 실행",
        recommendation: "결제·로그인 단계는 반드시 사용자가 직접 확인 후 승인하고 자동 결제는 맡기지 않기"
      },
      {
        title: "경쟁사 리서치 정리",
        howToUse: "Deep Research와 사이드바 요약으로 여러 탭의 자료를 비교해 보고서 초안 작성",
        recommendation: "출처 링크를 반드시 원문 대조해 확인하고 인용문은 원문 검증 후 배포"
      },
      {
        title: "업무·개인 프로필 분리",
        howToUse: "회사 로그인 세션과 개인 브라우징을 별도 프로필로 분리해 에이전트가 접근하는 데이터 범위를 제한",
        recommendation: "사내 관리자·뱅킹 등 민감 탭에서는 에이전트 자동 실행 기능을 끄고 수동으로 조작"
      }
    ],
    externalRatings: [
      {
        source: "Chrome Web Store (Perplexity AI Companion 확장)",
        score: "4.4/5",
        note: "Comet 브라우저 동반 확장 프로그램 기준, 2026-09 확인",
        url: "https://chromewebstore.google.com/detail/perplexity-ai-companion/hlgbcneanomplepojfcnclggenpcoldo"
      },
      {
        source: "AI 리뷰 매체 (itechguides.com)",
        score: "8.2/10",
        note: "자동화 신뢰성과 메모리는 약점, 무료 가격과 리서치 통합은 강점으로 평가, 2026 기준",
        url: "https://www.itechguides.com/perplexity-comet-browser-review-2026-is-it-worth-trying/"
      }
    ],
    sources: [
      { label: "Perplexity 공식 Comet 소개 페이지", url: "https://www.perplexity.ai/comet" },
      {
        label: "Comet 무료 전환 보도 (Yahoo Tech)",
        url: "https://tech.yahoo.com/ai/perplexity-ai/articles/perplexity-makes-ai-browser-free-172945066.html"
      },
      {
        label: "Comet 요금제 정리 (eesel AI)",
        url: "https://www.eesel.ai/blog/perplexity-comet-pricing"
      },
      {
        label: "CometJacking 취약점 분석 (LayerX Security)",
        url: "https://layerxsecurity.com/blog/cometjacking-how-one-click-can-turn-perplexitys-comet-ai-browser-against-you/"
      },
      {
        label: "CometJacking 보도 (The Hacker News)",
        url: "https://thehackernews.com/2025/10/cometjacking-one-click-can-turn.html"
      },
      {
        label: "Comet 프롬프트 인젝션 위협 분석 (Brave)",
        url: "https://brave.com/blog/comet-prompt-injection/"
      },
      {
        label: "AI 브라우저 비교: Atlas vs Comet vs Dia (Tech Times)",
        url: "https://www.techtimes.com/articles/318528/20260616/ai-browser-comparison-2026-atlas-vs-comet-vs-dia-ranked-security-use-case.htm"
      },
      { label: "Comet 한국 사용 후기 (브런치)", url: "https://brunch.co.kr/@woody88/93" }
    ],
    researchedAt: "2026-09"
  },
  // ChatGPT Atlas
  "8d3b73da-f084-4fb5-ab89-f3e16d983845": {
    oneLine: "ChatGPT를 브라우저에 결합해 편리했지만, 보안 우려와 짧은 수명 끝에 출시 9개월 만에 서비스가 종료됐습니다.",
    scoreBreakdown: { functionality: 68, uiux: 72, reliability: 30, comfort: 45, pricing: 60 },
    keyFeatures: [
      "사이드바 어시스턴트가 현재 페이지를 요약하고 즉시 질의응답 제공",
      "에이전트 모드(Plus/Pro)가 장바구니 담기 등 웹 작업을 대신 클릭·입력",
      "ChatGPT 대화 기록 기반 브라우저 메모리로 개인화된 맥락 유지",
      "선택한 텍스트를 즉시 요약·재작성하는 인라인 어시스턴트",
      "Chromium 기반으로 기존 브라우저의 북마크·확장 가져오기 지원",
      "2026년 7월부터 기능이 ChatGPT 앱의 브라우징 모드로 흡수·통합"
    ],
    pricingSummary: "무료로 다운로드해 기본 브라우징은 이용할 수 있었지만 에이전트 모드는 ChatGPT Plus(월 $20)·Pro(월 $200) 등 유료 플랜에서만 제공됐고, 2026년 8월 9일 브라우저 자체가 종료되며 관련 기능은 ChatGPT 앱 구독으로 이전됐습니다.",
    koreaNote: "한국에서도 정식 이용 가능했고 초기 사용기가 다수 올라왔지만, '유용한 확장 기능 수준'이라는 평가와 함께 2026년 8월 서비스 종료로 국내 사용자도 ChatGPT 앱으로 이전해야 했습니다.",
    comparisons: [
      {
        competitor: "Perplexity Comet",
        worksBetterHere: "출시 초기에는 ChatGPT의 장기 대화 메모리와 계정 연동을 그대로 웹 탐색에 이어갈 수 있었음",
        weakerHere: "Comet은 Windows·Android까지 지원하며 여전히 무료로 서비스되는 반면 Atlas는 macOS 전용으로 나왔다가 아예 종료됨"
      },
      {
        competitor: "Dia",
        worksBetterHere: "수억 명의 기존 ChatGPT 사용자 기반과 최신 GPT 계열 모델을 그대로 활용할 수 있었음",
        weakerHere: "Dia는 로컬 암호화와 LLM 생성 URL 자동 실행 차단 등 보안 설계가 더 신중했던 반면 Atlas는 취약점이 여러 차례 지적됨"
      },
      {
        competitor: "Chrome + Gemini",
        worksBetterHere: "브라우저 안에 ChatGPT가 기본 내장돼 별도 확장 설치 없이 바로 대화형 탐색이 가능했음",
        weakerHere: "Chrome은 Google의 검색 점유율과 확장 생태계, 무엇보다 서비스가 계속 유지된다는 안정성에서 압도적으로 앞섬"
      }
    ],
    patchNotes: [
      {
        date: "2026-08-09",
        title: "Atlas 서비스 정식 종료",
        change: "Atlas 브라우저가 더 이상 실행되지 않으며 브라우징 기능이 ChatGPT 데스크톱 앱으로 완전히 이전됨",
        errorRisk: "종료 이후 Atlas 실행 시 열람·다운로드·에이전트 작업이 모두 불가능",
        impactLevel: "high"
      },
      {
        date: "2026-07-09",
        title: "Atlas 단종 및 ChatGPT 앱 통합 발표",
        change: "독립 브라우저 Atlas를 단종하고 브라우징 기능을 ChatGPT·Codex 앱으로 이전한다고 발표",
        errorRisk: "기존 Atlas 이용자는 북마크·설정을 새 환경으로 옮겨야 하는 이전 부담이 발생",
        impactLevel: "high"
      },
      {
        date: "2025-12",
        title: "프롬프트 인젝션 대응 보안 업데이트",
        change: "내부 레드팀이 발견한 신종 프롬프트 인젝션에 대응해 적대적 학습 모델과 방어 로직을 강화",
        errorRisk: "OpenAI 스스로도 프롬프트 인젝션은 '완전히 해결되지 않을 수 있다'고 인정",
        impactLevel: "high"
      },
      {
        date: "2025-10-21",
        title: "ChatGPT Atlas 출시",
        change: "OpenAI가 macOS 전용 Chromium 기반 브라우저 Atlas를 공식 출시하며 사이드바 어시스턴트와 에이전트 모드를 공개",
        errorRisk: "출시 초기 버전으로 일부 사이트에서 멈춤·오작동이 보고됨",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "Atlas 대체 전환 가이드",
        howToUse: "Atlas에서 쓰던 에이전트 작업과 자주 쓰던 프롬프트를 문서로 정리한 뒤 ChatGPT 앱 브라우징 모드나 Comet·Dia로 이전",
        recommendation: "브라우저 종속 자동화는 서비스 중단 가능성을 감안해 항상 대체 도구로 전환 가능한 형태로 백업"
      },
      {
        title: "에이전트 자동구매 승인 원칙",
        howToUse: "운영 당시 에이전트 모드로 장바구니 담기 등 반복 쇼핑 작업을 위임하되 최종 결제는 사람이 직접 클릭",
        recommendation: "로그인된 뱅킹·사내 관리자 탭에서는 에이전트 자동 실행을 절대 허용하지 않기"
      },
      {
        title: "사이드바 요약 노하우 기록화",
        howToUse: "운영 당시 사이드바 요약·번역으로 단축했던 리서치 프롬프트 패턴을 팀 위키에 남겨 대체 도구에서도 재사용",
        recommendation: "특정 벤더의 브라우저 기능에 업무 프로세스를 전면 의존시키지 않고 항상 수동 대안을 유지"
      }
    ],
    externalRatings: [
      {
        source: "OpenAI Help Center / 공식 릴리스 노트",
        score: "확인 필요",
        note: "단종 제품으로 공식 스토어 평점이 별도 집계되지 않음 (평가 데이터 부족)",
        url: "https://help.openai.com/en/articles/12591856-chatgpt-atlas-release-notes"
      },
      {
        source: "국내 커뮤니티 반응 (GeekNews)",
        score: "확인 필요",
        note: "정량 평점보다 '초기 버전이라 불안정하다'는 정성 평가 위주 (평가 데이터 부족)",
        url: "https://news.hada.io/topic?id=24042"
      }
    ],
    sources: [
      { label: "OpenAI 공식 Atlas 출시 발표", url: "https://openai.com/index/introducing-chatgpt-atlas/" },
      {
        label: "OpenAI Atlas 단종·ChatGPT 통합 공지",
        url: "https://help.openai.com/en/articles/20001371-evolving-atlas-into-chatgpt-for-browser-based-agentic-work"
      },
      {
        label: "Atlas 단종 보도 (9to5Mac)",
        url: "https://9to5mac.com/2026/07/09/openai-is-discontinuing-chatgpt-atlas-its-standalone-desktop-browser/"
      },
      { label: "Atlas 위키백과 개요", url: "https://en.wikipedia.org/wiki/ChatGPT_Atlas" },
      {
        label: "프롬프트 인젝션 보안 강화 공식 발표 (OpenAI)",
        url: "https://openai.com/index/hardening-atlas-against-prompt-injection/"
      },
      {
        label: "Atlas 보안 이슈 보도 (CyberScoop)",
        url: "https://cyberscoop.com/openai-chatgpt-atlas-prompt-injection-browser-agent-security-update-head-of-preparedness/"
      },
      { label: "Atlas 한국어 리뷰 (브런치)", url: "https://brunch.co.kr/@@hhpB/180" },
      { label: "Atlas 리뷰 국내 커뮤니티 요약 (GeekNews)", url: "https://news.hada.io/topic?id=24042" }
    ],
    researchedAt: "2026-09"
  },
  // Dia
  "3ec8d099-6dc4-49c8-ae5e-341a67c6af78": {
    oneLine: "탭 맥락 이해와 신중한 보안 설계는 돋보이지만, macOS 전용 제약과 최대 월 $100 요금은 진입장벽입니다.",
    scoreBreakdown: { functionality: 74, uiux: 80, reliability: 64, comfort: 65, pricing: 55 },
    keyFeatures: [
      "탭 컨텍스트 채팅으로 열린 탭 전체를 근거로 질문에 답변·비교",
      "Memory 기능이 이전 대화·브라우징에서 학습한 사실을 이후 세션에 재사용",
      "캘린더 연동으로 회의별 탭을 자동으로 그룹화",
      "Skills로 반복 브라우저 작업을 저장해 재사용 가능한 자동화로 구성",
      "LLM 생성 URL을 자동으로 열지 않는 등 프롬프트 인젝션 방어 아키텍처 적용",
      "GPT-4o 등 모델 기반의 빠른 검색창 질의응답 제공"
    ],
    pricingSummary: "Better Browser는 무료이고, 탭 기반 AI 채팅을 쓰려면 Better Answers(월 $20), 대량 사용과 일일 브리핑·자동 리포트까지 원하면 Better Days(월 $100)가 필요하며, 신규 가입자는 카드 등록 없이 14일간 Better Days를 체험할 수 있습니다.",
    koreaNote: "한국어 리뷰에서는 AI 중심 설계의 신선함은 호평받지만 macOS 전용이라는 한계와 기존 AI 서비스 대비 차별성이 크지 않다는 지적이 함께 나옵니다.",
    comparisons: [
      {
        competitor: "Perplexity Comet",
        worksBetterHere: "브라우징 이력을 로컬에서 암호화하고 LLM 생성 링크 자동 실행을 차단하는 등 보안 설계가 더 보수적임",
        weakerHere: "Comet은 Windows·Android까지 지원하고 완전 무료인 반면 Dia는 macOS 전용에 무료 기능이 제한적임"
      },
      {
        competitor: "Arc",
        worksBetterHere: "채팅 기반의 단순한 UI로 Arc의 복잡한 커스터마이징 학습 곡선 없이 바로 AI를 활용 가능",
        weakerHere: "탭 관리 유연성과 위젯·커스터마이징 기능은 Arc가 더 풍부했다는 평가가 많음"
      },
      {
        competitor: "Chrome + Gemini",
        worksBetterHere: "탭을 열자마자 맥락을 파악하는 사이드바 채팅이 기본 내장돼 확장 설치나 별도 로그인이 불필요",
        weakerHere: "Windows·Android 지원, 확장 프로그램 생태계, 기업용 관리 도구는 Chrome이 훨씬 성숙함"
      }
    ],
    patchNotes: [
      {
        date: "2025-09-04",
        title: "Atlassian, The Browser Company 인수 계약 발표",
        change: "Atlassian이 Dia·Arc를 만든 The Browser Company를 약 6억1천만 달러에 인수하기로 계약, 2025-10-21 인수 완료",
        errorRisk: "인수 후 로드맵·독립성 변화 가능성, 기업 고객은 데이터 정책 변경 여부를 주시할 필요",
        impactLevel: "high"
      },
      {
        date: "2025-08-07",
        title: "월 $20 유료 구독 최초 도입",
        change: "무료로 운영되던 Dia에 월 20달러 유료 구독 플랜을 처음 도입",
        errorRisk: "기존 무료 이용자는 AI 채팅 사용량이 제한될 수 있음",
        impactLevel: "medium"
      },
      {
        date: "2025-06",
        title: "Dia 베타 공개 및 보안 설계 선반영",
        change: "The Browser Company가 AI 중심 브라우저 Dia 베타를 공개하며, 프롬프트 인젝션에 악용될 수 있던 콘텐츠 수집 도구를 베타 전 제거하고 아키텍처 수준 통제로 재구축",
        errorRisk: "베타 단계 특성상 Skills 등 일부 AI 기능이 불안정하게 작동할 수 있음",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "회의 자료 탭 자동 정리",
        howToUse: "캘린더 연동으로 회의 시간에 연 탭을 자동 그룹화하고 사이드바 채팅으로 회의 전 자료를 요약",
        recommendation: "회의록·고객 정보 등 민감 탭은 별도 프로필로 분리해 Memory 학습 대상에서 제외"
      },
      {
        title: "경쟁 제품 비교 리서치",
        howToUse: "여러 제품 페이지를 탭으로 열어두고 사이드바에 비교표를 만들어 달라고 질문해 표 형태로 정리",
        recommendation: "가격·스펙 등 숫자 데이터는 원문 탭을 직접 대조해 최종 확인 후 배포"
      },
      {
        title: "이메일 회신 초안 작성",
        howToUse: "탭에 열린 이메일 맥락을 반영해 내 말투로 답장 초안을 생성하도록 사이드바에 요청",
        recommendation: "Better Days의 자동 보고서 기능도 발송 전 반드시 사람이 검수하는 것을 원칙으로"
      }
    ],
    externalRatings: [
      {
        source: "Product Hunt",
        score: "4.4/5",
        note: "리뷰 15건 기준, 탭 UX에 대한 호불호가 갈림, 2026 확인",
        url: "https://www.producthunt.com/products/dia-browser/reviews"
      },
      {
        source: "요즘IT 사용자 리뷰",
        score: "확인 필요",
        note: "정량 별점보다 정성 리뷰 위주로 정리됨 (평가 데이터 부족)",
        url: "https://yozm.wishket.com/magazine/product-valley/products/dia/"
      }
    ],
    sources: [
      { label: "Dia 공식 요금제 페이지", url: "https://www.diabrowser.com/plans" },
      { label: "Dia 공식 보안 페이지", url: "https://www.diabrowser.com/security" },
      {
        label: "Dia $20 구독 플랜 도입 보도 (9to5Mac)",
        url: "https://9to5mac.com/2025/08/07/the-dia-browser-now-offers-a-20-month-subscription-plan/"
      },
      {
        label: "Atlassian의 The Browser Company 인수 보도 (CNBC)",
        url: "https://www.cnbc.com/2025/09/04/atlassian-the-browser-company-deal.html"
      },
      {
        label: "Atlassian 공식 인수 발표",
        url: "https://www.atlassian.com/blog/announcements/atlassian-acquires-the-browser-company"
      },
      {
        label: "Dia 브라우저 보안 위험 분석 (LayerX)",
        url: "https://layerxsecurity.com/generative-ai/dia-browser-risks-and-vulnerabilities/"
      },
      {
        label: "AI 브라우저 비교: Atlas vs Comet vs Dia (Tech Times)",
        url: "https://www.techtimes.com/articles/318528/20260616/ai-browser-comparison-2026-atlas-vs-comet-vs-dia-ranked-security-use-case.htm"
      },
      {
        label: "Dia 한국어 리뷰 (요즘IT)",
        url: "https://yozm.wishket.com/magazine/product-valley/products/dia/"
      }
    ],
    researchedAt: "2026-09"
  },
  // Manus
  "f4a02aa5-aa2d-4d4d-aa10-f654b22593d9": {
    oneLine: "복잡한 다단계 작업을 알아서 처리하지만, 낮은 성공률과 크레딧 소진, 소유권 불확실성이 신뢰도를 떨어뜨립니다.",
    scoreBreakdown: { functionality: 76, uiux: 65, reliability: 38, comfort: 45, pricing: 48 },
    keyFeatures: [
      "목표 한 문장으로 리서치·코딩·배포까지 자동 계획·실행하는 범용 에이전트",
      "클라우드 가상머신에서 실행돼 창을 닫아도 백그라운드에서 작업 계속",
      "유료 플랜에서 최대 20개 작업을 동시에 처리하는 병렬 태스크 지원",
      "임베디드 브라우저로 웹사이트를 직접 클릭·탐색하며 정보 수집",
      "크레딧 기반 과금으로 작업 복잡도에 따라 사용량이 차감",
      "Team/Enterprise 플랜에서 SSO·중앙 청구 등 관리자 기능 제공"
    ],
    pricingSummary: "무료 플랜은 매일 300 크레딧(가입 시 1,000 보너스)을 제공하며, Standard(월 $20, 4,000 크레딧)·Customizable(월 $40, 8,000 크레딧)·Extended(월 $200, 40,000 크레딧) 순으로 크레딧이 늘어나고, 크레딧은 이월되지 않아 매 결제 주기마다 초기화됩니다.",
    koreaNote: "한국에서도 브런치·벨로그 등에 사용 후기가 다수 올라올 만큼 관심이 높지만, 크레딧이 예상보다 빨리 소진된다는 불만이 국내 후기에서도 공통적으로 나타납니다.",
    comparisons: [
      {
        competitor: "Genspark",
        worksBetterHere: "정해지지 않은 목표를 스스로 탐색하며 리서치·코딩을 병행하는 개방형 자율성이 더 강함",
        weakerHere: "완성된 결과물(슬라이드·스프레드시트 등 Sparkpage)의 안정성과 품질은 Genspark가 더 낫다는 평가가 많음"
      },
      {
        competitor: "ChatGPT Agent",
        worksBetterHere: "클라우드 VM에서 창을 닫아도 작업이 계속되는 완전한 백그라운드 실행을 지원",
        weakerHere: "수억 명의 기존 ChatGPT 사용자 기반과 검증된 인프라, 더 낮은 실패율은 ChatGPT Agent가 앞섬"
      },
      {
        competitor: "Devin",
        worksBetterHere: "코딩뿐 아니라 리서치·문서·배포 등 범용 업무 전반을 하나의 에이전트로 처리",
        weakerHere: "소프트웨어 엔지니어링에 특화된 정확도와 코드베이스 이해도는 Devin이 더 높다는 평가"
      }
    ],
    patchNotes: [
      {
        date: "2026-04-27",
        title: "중국 당국, Meta의 Manus 인수 불허",
        change: "중국 국가발전개혁위원회(NDRC)가 Meta의 Manus 인수를 금지하고 거래 철회를 명령, 이후 2026년 8월 Manus는 Meta와 결별하고 독립 운영으로 복귀",
        errorRisk: "소유권 불확실성으로 기업 고객은 데이터 거버넌스·서비스 연속성을 재점검할 필요",
        impactLevel: "high"
      },
      {
        date: "2025-12-30",
        title: "Meta, Manus 인수 발표",
        change: "Meta가 싱가포르 기반 Manus를 20억 달러 이상에 인수한다고 발표하며 중국 지분 관계를 완전히 단절하겠다고 밝힘",
        errorRisk: "인수 완료 전까지 서비스 정책·소유권이 불확실한 상태로 유지됨",
        impactLevel: "high"
      },
      {
        date: "2025-07",
        title: "싱가포르 본사 이전",
        change: "Manus 운영팀이 본사를 싱가포르로 이전, 회사는 미국 반도체 수출 규제와 무관하다고 해명",
        errorRisk: "본사 이전과 맞물려 중국 규제 당국의 심사 대상이 될 위험이 이후 현실화됨",
        impactLevel: "medium"
      },
      {
        date: "2025-03",
        title: "Manus 정식 출시",
        change: "중국 스타트업 Butterfly Effect가 범용 AI 에이전트 Manus를 출시, 8개월 만에 연환산매출(ARR) 1억 달러를 돌파",
        errorRisk: "초기 버전 특성상 복잡한 다단계 작업에서 실패율이 높다는 보고가 다수 있었음",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "야간 백그라운드 리서치",
        howToUse: "퇴근 전 시장조사·경쟁사 분석 작업을 지시해두면 클라우드 VM에서 밤새 실행되고 다음날 결과물을 확인",
        recommendation: "5단계 이상 이어지는 복잡한 작업은 성공률이 급격히 떨어지므로 짧은 단위로 쪼개어 지시"
      },
      {
        title: "크레딧 소진 관리",
        howToUse: "작업 전 예상 크레딧 소모량을 확인하고, 월 크레딧이 이월되지 않는 점을 감안해 결제 주기에 맞춰 대형 작업을 배분",
        recommendation: "결과물은 반드시 사람이 검수 후 배포하고 로그인이 필요한 사내 시스템·결제 페이지 접근 권한은 주지 않기"
      },
      {
        title: "PPT·보고서 초안 자동 생성",
        howToUse: "목표와 참고 자료를 함께 제시해 리서치부터 슬라이드 디자인까지 한번에 초안 생성을 요청",
        recommendation: "수치·인용 등 사실관계는 원문 대조 후 사용하고 대외 제출본은 담당자 최종 검수를 거치기"
      }
    ],
    externalRatings: [
      {
        source: "Trustpilot",
        score: "1/5 내외",
        note: "청구·크레딧 소진 관련 불만이 다수, 2026 확인",
        url: "https://www.trustpilot.com/review/manus.im"
      },
      {
        source: "G2",
        score: "2.5/5",
        note: "리뷰 6건 기준, 리서치 기능은 호평이나 가격 정책에는 부정적, 2026 확인",
        url: "https://g2.com/products/manus-ai-agent/reviews"
      }
    ],
    sources: [
      {
        label: "Manus 요금제 정리 (No Code MBA)",
        url: "https://www.nocode.mba/articles/manus-ai-pricing"
      },
      {
        label: "Manus 싱가포르 이전 보도 (SCMP)",
        url: "https://www.scmp.com/tech/tech-trends/article/3317568/chinese-firm-behind-ai-agent-manus-relocates-singapore-amid-us-chip-curbs"
      },
      {
        label: "Meta의 Manus 인수 발표 보도 (CNBC)",
        url: "https://www.cnbc.com/2025/12/30/meta-acquires-singapore-ai-agent-firm-manus-china-butterfly-effect-monicai.html"
      },
      {
        label: "중국 당국 인수 불허 및 결별 보도 (TNGlobal)",
        url: "https://technode.global/2026/08/12/singapore-based-manus-ai-to-leave-meta-as-china-blocks-metas-2b-acquisition/"
      },
      {
        label: "중국 규제 배경 분석 (Asia Times)",
        url: "https://asiatimes.com/2026/05/chinas-manus-ai-case-sets-red-lines-to-bar-singapore-washing/"
      },
      {
        label: "Manus 신뢰성 벤치마크 리뷰 (Rio Times)",
        url: "https://www.riotimesonline.com/manus-a-i-review-14-failures-in-two-weeks-of-testing/"
      },
      { label: "Manus Trustpilot 리뷰", url: "https://www.trustpilot.com/review/manus.im" },
      { label: "Manus 한국어 사용 후기 (브런치)", url: "https://brunch.co.kr/@2a50c213d2ac47c/99" }
    ],
    researchedAt: "2026-09"
  },
  // Higgsfield
  "a04e1cdd-db45-486d-a459-fa4d419f1719": {
    oneLine: "여러 영상 모델을 한 구독으로 쓸 수 있지만 크레딧 소진과 잦은 요금제 변경으로 예산 관리가 까다롭습니다.",
    scoreBreakdown: { functionality: 85, uiux: 76, reliability: 55, comfort: 46, pricing: 40 },
    keyFeatures: [
      "Sora 2·Veo 3.1·Kling 3.0 등 15개 이상 모델을 한 대시보드에서 선택 생성",
      "Cinema Studio 3.0의 AI 디렉터로 샷별 카메라 프리셋과 실사급 연출 제공",
      "Soul ID·Soul Cast로 인물 얼굴을 학습해 여러 영상에서 캐릭터 일관성 유지",
      "Marketing Studio로 광고 스크립트·보이스·리사이즈까지 자동 생성",
      "Team·Scale·Enterprise 플랜에서 크레딧 풀 공유와 지출 한도 설정 지원",
      "브랜드 킷으로 로고·폰트·색상·톤을 렌더링 결과물에 자동 적용"
    ],
    pricingSummary: "2026년 9월 기준 Starter $19·Plus $59·Ultra $129/월(연간 결제 시 약 $15~$99)이며 Veo 3.1·Sora 2는 40~70크레딧, Kling 3.0은 약 6크레딧을 소모하고, 요금제와 크레딧 정책이 2026년에만 여러 차례 바뀌었습니다.",
    koreaNote: "한국어 UI는 일부만 지원되고 한국어 프롬프트 인식률이 영어보다 떨어진다는 후기가 많아 영어 프롬프트 작성이 권장됩니다.",
    comparisons: [
      {
        competitor: "Runway",
        worksBetterHere: "Cinema Studio 카메라 프리셋과 Soul ID 캐릭터 일관성, 다중 모델 전환을 한 UI에서 제공합니다.",
        weakerHere: "Runway는 자체 Gen-4.5·Aleph 모델의 영상 편집(객체 추가/삭제, 재조명)과 더 성숙한 개발자 API를 갖췄습니다."
      },
      {
        competitor: "Kling",
        worksBetterHere: "Kling 3.0을 Sora 2·Veo 3.1 등 14개 이상 모델과 함께 통합 크레딧으로 바로 비교해 쓸 수 있습니다.",
        weakerHere: "Kling을 자체 앱이나 API로 직접 쓰면 크레딧당 단가가 Higgsfield 경유보다 저렴합니다."
      },
      {
        competitor: "Pika",
        worksBetterHere: "Cinema Studio의 샷별 카메라 연출과 Soul Cast 캐릭터 재사용이 광고 제작 워크플로에 더 강합니다.",
        weakerHere: "Pika는 진입 가격이 더 낮고 UI가 단순해 캐주얼한 소셜용 영상 제작에는 더 가볍게 접근할 수 있습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-08-17",
        title: "시리즈 B 4억 달러 투자 유치",
        change: "8개월 만에 기업가치가 13억 달러에서 54억 달러로 뛰며 4억 달러 규모 시리즈 B를 유치했고 연환산매출(ARR)이 7억 달러에 이르렀습니다.",
        errorRisk: "급격한 밸류에이션 상승과 매출 압박이 향후 요금제 인상이나 무료 크레딧 축소로 이어질 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-05",
        title: "요금제 구조 재개편",
        change: "연간 결제 기준 Starter $15·Plus $39·Ultra $99로 개편했으나 9월 기준 Starter $19·Plus $59·Ultra $129로 다시 인상되는 등 한 해에도 여러 차례 가격이 바뀌었습니다.",
        errorRisk: "크레딧 이월 불가, 90일 만료 등 세부 정책도 함께 바뀌므로 예산 산정 전 최신 공식 페이지 확인이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-02-11",
        title: "인종차별·비동의 딥페이크 콘텐츠 논란",
        change: "Forbes 보도로 인종차별적 영상과 유명인 비동의 합성 사례가 드러나 참조 이미지 업로드를 제한하고 유사도 측정 도구 Soul Cast를 컴플라이언스 용도로 도입했습니다.",
        errorRisk: "실존 인물을 소재로 쓸 경우 사전 동의 없이는 계정 정지나 초상권 분쟁으로 번질 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-02-09",
        title: "공식 X 계정 정지 사태",
        change: "사전 공지 없이 공식 X 계정이 정지되며 크레딧 정책 번복과 무더기 계정 차단에 대한 이용자 신뢰 문제가 불거졌습니다.",
        errorRisk: "공지 없는 정책 변경 이력이 있어 크레딧·환불 관련 고객 지원 대응 지연에 대비해야 합니다.",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "광고 시안 대량 테스트",
        howToUse: "Marketing Studio에서 동일 브리프로 Sora 2·Veo 3.1·Kling 3.0 결과를 동시에 생성해 톤을 비교합니다.",
        recommendation: "모델별 크레딧 소모가 달라 Ultra 이상에서 월 크레딧 예산 상한을 팀 단위로 정해두는 것이 안전합니다."
      },
      {
        title: "인물 소재 사전 동의",
        howToUse: "Soul ID·Soul Cast로 인물을 학습시키기 전 실존 인물 초상 사용 동의서를 확보하고 유사도 점검 기능을 활용합니다.",
        recommendation: "동의 없는 유명인·직원 얼굴 합성은 게시 전 반드시 법무 검토를 거치도록 규칙화합니다."
      },
      {
        title: "브랜드 일관성 관리",
        howToUse: "Team 플랜의 Brand Kit에 로고·폰트·톤을 등록하고 Cinema Studio 카메라 프리셋을 팀 표준으로 저장합니다.",
        recommendation: "크레딧 풀을 공유하는 팀은 캠페인별 소비량을 주간 단위로 점검해 초과 과금을 예방합니다."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.5/5",
        note: "리뷰 79건 기준, 2026-09 확인",
        url: "https://www.g2.com/sellers/higgsfield"
      },
      {
        source: "Trustpilot",
        score: "4.0/5",
        note: "리뷰 4,224건 기준(다른 집계는 3.2/5·1,200건 이상으로 편차 있음), 2026-09 확인",
        url: "https://www.trustpilot.com/review/higgsfield.ai"
      },
      {
        source: "Product Hunt",
        score: "4.5/5",
        note: "리뷰 140건 기준, 2026-09 확인",
        url: "https://www.producthunt.com/products/higgsfield/reviews"
      }
    ],
    sources: [
      { label: "Higgsfield 2026 요금제 정리", url: "https://www.vo3ai.com/higgsfield-ai-pricing" },
      { label: "Higgsfield 팀 플랜 공식 페이지", url: "https://higgsfield.ai/team-plan" },
      { label: "Higgsfield 이용약관", url: "https://higgsfield.ai/terms-of-use-agreement" },
      {
        label: "TechCrunch, 시리즈 B 4억 달러 투자 보도",
        url: "https://techcrunch.com/2026/08/17/higgsfield-raises-400m-series-b-quadrupling-its-valuation-in-8-months-to-5-4b/"
      },
      {
        label: "Forbes, 딥페이크·인종차별 콘텐츠 논란 보도",
        url: "https://www.forbes.com/sites/rashishrivastava/2026/02/11/racist-videos-and-payment-problems-the-dark-side-of-this-ai-startups-super-fast-growth/"
      },
      {
        label: "Higgsfield 공식 X 계정 정지 사태 분석",
        url: "https://aiphotolabs.com/news/higgsfieldai-x-fiasco"
      },
      { label: "Higgsfield G2 리뷰 페이지", url: "https://www.g2.com/sellers/higgsfield" },
      {
        label: "Higgsfield 워터마크·상업적 이용 안내",
        url: "https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially"
      }
    ],
    researchedAt: "2026-09"
  },
  // Runway
  "7f50d95e-6c5d-47a5-a5a6-a4369344017f": {
    oneLine: "자체 모델 품질과 편집력은 강하지만 초당 과금 크레딧과 반복된 소송·장애로 안정적 예산 관리가 어렵습니다.",
    scoreBreakdown: { functionality: 88, uiux: 78, reliability: 62, comfort: 55, pricing: 52 },
    keyFeatures: [
      "Gen-4.5로 최대 20초 클립 생성, 4K 업스케일 내보내기 지원",
      "Aleph 2.0으로 기존 영상에 객체 추가/삭제·재조명 등 인컨텍스트 편집",
      "Extend·Temporal Anchor로 컷 간 조명·질감·캐릭터 일관성 유지",
      "Director Mode 타임라인에서 컷 단위 카메라 연출 세부 조정",
      "Team·Enterprise 플랜에서 Brand Kit, SSO, 감사 로그 제공",
      "REST API·Workflows로 사내 툴체인과 연동한 파이프라인 구축"
    ],
    pricingSummary: "Free(크레딧 125개 1회성)·Standard $12·Pro $28·Max $76(연간 기준, 월간은 약 25% 비쌈)이며 초당 2~25크레딧이 소모되고 과거 Unlimited 플랜은 Max로 통합되었습니다.",
    koreaNote: "한국어 프롬프트는 인식 품질이 크게 떨어져 영어로 번역해 입력하는 것이 권장됩니다.",
    comparisons: [
      {
        competitor: "Higgsfield",
        worksBetterHere: "Aleph 2.0의 인컨텍스트 영상 편집(객체 추가/삭제, 재조명)은 아그리게이터형 서비스에는 없는 자체 기능입니다.",
        weakerHere: "Higgsfield는 Sora 2·Veo 3.1·Kling 3.0을 한 화면에서 비교 생성할 수 있지만 Runway는 자체 모델군으로 제한됩니다."
      },
      {
        competitor: "Pika",
        worksBetterHere: "Gen-4는 최대 20초 클립과 4K 업스케일, Director Mode 타임라인 편집으로 전문 후반작업에 더 적합합니다.",
        weakerHere: "Pika는 진입가가 낮고 UI가 단순해 짧은 소셜 클립을 빠르게 실험하기에는 더 가볍습니다."
      },
      {
        competitor: "Luma AI",
        worksBetterHere: "Aleph의 영상 편집 기능과 Workflows·API 파이프라인은 VFX·후반작업 통합에 더 강합니다.",
        weakerHere: "Luma의 Ray 계열 모델은 단순 텍스트-투-비디오 생성에서 속도와 비용 면에서 더 가볍다는 평가를 받습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-06-02",
        title: "Aleph 2.0 API 전환, 구모델 단종",
        change: "Aleph 2.0이 API에 도입되고 7월 30일부로 기존 Gen-4 Aleph·Gen-3 Alpha Turbo API 모델 ID가 단종되었습니다.",
        errorRisk: "구모델 ID로 연동된 자동화 파이프라인은 마이그레이션하지 않으면 호출이 실패합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-02-24",
        title: "유튜브 학습데이터 저작권 집단소송 확대",
        change: "유튜브 영상을 무단 스크래핑해 모델 학습에 사용했다는 의혹으로 DMCA 위반을 주장하는 저작권 집단소송이 잇따라 제기되었습니다.",
        errorRisk: "생성물에 특정 크리에이터·브랜드 스타일이 반영될 경우 저작권 분쟁에 휘말릴 가능성이 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-02-10",
        title: "시리즈 E 3.15억 달러 투자",
        change: "General Atlantic 주도로 Nvidia·Adobe Ventures·AMD Ventures·Fidelity 등이 참여한 3.15억 달러 시리즈 E를 유치해 기업가치가 53억 달러로 상승했습니다.",
        errorRisk: "빠른 밸류에이션 상승이 향후 크레딧 단가 인상이나 무료 크레딧 축소 압력으로 이어질 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-07-31",
        title: "Aleph(Gen-4 Aleph) 유료 플랜 출시",
        change: "텍스트 프롬프트만으로 기존 영상의 객체 추가/삭제, 재조명, 스타일 변경, 새 카메라 앵글 생성이 가능한 인컨텍스트 영상 편집 모델을 공개했습니다.",
        errorRisk: "편집 결과가 원본 저작물을 크게 변형하므로 소재의 저작권·라이선스 확인이 더 중요해집니다.",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "샷 편집 자동화",
        howToUse: "완성된 촬영본을 Aleph에 업로드해 배경 교체·재조명·카메라 앵글 변형을 프롬프트로 지시합니다.",
        recommendation: "초당 크레딧이 빠르게 소모되므로 저해상도 프리뷰로 먼저 확인한 뒤 최종 렌더링합니다."
      },
      {
        title: "광고 클립 대량 생산",
        howToUse: "Director Mode에서 20초 클립을 Extend로 이어붙이고 Team 플랜 Brand Kit으로 톤을 통일합니다.",
        recommendation: "Pro 이상에서 4K 업스케일을 쓰되 월별 크레딧 상한을 팀 단위로 미리 배분합니다."
      },
      {
        title: "레퍼런스 저작권 점검",
        howToUse: "실존 인물·타사 영상을 참조로 쓸 때는 업로드 전 라이선스와 초상권 동의 여부를 확인합니다.",
        recommendation: "진행 중인 저작권 소송 사례를 참고해 상업 캠페인 전 법무 검토를 거치는 것을 권장합니다."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "확인 필요",
        note: "리뷰 78건 이상 존재하나 정확한 평균 별점은 접근 제한으로 확인하지 못함, 2026-09 확인 시도",
        url: "https://www.g2.com/products/runway-2022-01-04/reviews"
      },
      {
        source: "App Store",
        score: "4.48/5",
        note: "평가 약 1.2만 건 기준, 2026-09 확인",
        url: "https://apps.apple.com/us/app/runwayml/id1665024375"
      },
      {
        source: "Google Play",
        score: "4.06/5",
        note: "평가 약 4,600건 기준, 2026-09 확인",
        url: "https://play.google.com/store/apps/details?id=com.runwayml.prod"
      },
      {
        source: "Product Hunt",
        score: "확인 필요",
        note: "리뷰는 다수 존재하나 종합 평점 수치는 확인하지 못함",
        url: "https://www.producthunt.com/products/runwayml/reviews"
      }
    ],
    sources: [
      { label: "Runway 2026 요금제 정리", url: "https://www.eesel.ai/blog/runway-ai-pricing" },
      {
        label: "TechCrunch, 시리즈 E 3.15억 달러 투자 보도",
        url: "https://techcrunch.com/2026/02/10/ai-video-startup-runway-raises-315m-at-5-3b-valuation-eyes-more-capable-world-models/"
      },
      {
        label: "Runway API 체인지로그(Aleph 2.0 전환)",
        url: "https://docs.dev.runwayml.com/api-details/api_changelog/"
      },
      {
        label: "Runway 무료 플랜 안내",
        url: "https://help.runwayml.com/hc/en-us/articles/50404627334547-Free-plan-details"
      },
      {
        label: "Runway 이용권(Usage rights) 안내",
        url: "https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights"
      },
      {
        label: "유튜버 저작권 집단소송 보도",
        url: "https://www.tradingview.com/news/reuters.com,2026:newsml_L6N3ZK172:0-youtuber-sues-runway-ai-in-latest-copyright-class-action-over-ai-training/"
      },
      {
        label: "Runway Gen-4 최대 클립 길이 안내",
        url: "https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video"
      },
      { label: "Runway 팀 플랜 소개", url: "https://runway.com/news/company-news/introducing-team-plan" }
    ],
    researchedAt: "2026-09"
  },
  // HeyGen
  "4cb2986a-6f10-411c-a9d5-09be356f8d89": {
    oneLine: "아바타 실사도와 다국어 더빙 품질은 업계 최상급이지만 무제한 요금제 폐지로 크레딧 관리 부담이 커졌습니다.",
    scoreBreakdown: { functionality: 90, uiux: 82, reliability: 65, comfort: 48, pricing: 46 },
    keyFeatures: [
      "Avatar V, 15초 녹화로 10분 분량까지 정체성 유지되는 아바타 생성",
      "175개 이상 언어로 원본 화자 음색 유지한 립싱크 번역·더빙 지원",
      "Avatar IV/V의 손짓·표정 인식으로 자연스러운 제스처 연출",
      "Voice Director로 톤·페이싱·감정을 세밀 조정하는 신경망 TTS",
      "Enterprise 플랜에서 SAML SSO·SCIM·역할 기반 권한 제공",
      "브랜드 킷·용어집으로 부서별 영상 톤과 번역 용어 통일"
    ],
    pricingSummary: "Free(월 3편, 워터마크)·Creator $29·Pro $49·Business $149이며 2026년 5월 무제한 플랜을 폐지하고 전면 크레딧제(아바타 생성 분당 20크레딧 등)로 전환했습니다.",
    koreaNote: "한국어 립싱크·음성 합성 품질이 우수하다는 후기가 많아 유튜브·사내 강의·더빙 제작에 국내에서도 쓰이지만, 번역 결과를 직접 수정할 수 없어 오역이 그대로 남을 수 있습니다.",
    comparisons: [
      {
        competitor: "Synthesia",
        worksBetterHere: "Avatar V의 표정·제스처 자연스러움과 175개 언어 립싱크 번역(G2 번역 점수 97 대 경쟁사 평균 62)이 더 앞섭니다.",
        weakerHere: "Synthesia는 연간 요금이 더 저렴하고 SOC 2·GDPR·ISO 42001 인증과 SCORM 연동을 갖춰 기업 교육용으로 더 적합합니다."
      },
      {
        competitor: "D-ID",
        worksBetterHere: "Avatar IV/V의 손짓·감정 인식과 10분 분량 정체성 유지 등 장편 아바타 품질에서 앞섭니다.",
        weakerHere: "D-ID는 실시간 대화형 아바타·챗봇 연동에 특화되어 있어 고객 상담 시나리오에는 더 가볍게 붙일 수 있습니다."
      },
      {
        competitor: "Colossyan",
        worksBetterHere: "175개 이상 언어 동시 번역과 음성 복제 기반 다국어 로컬라이제이션 워크플로가 더 성숙합니다.",
        weakerHere: "Colossyan은 퀴즈·역할극·SCORM 내보내기 등 사내 교육(L&D) 인터랙션 기능이 더 특화돼 있습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-08-13",
        title: "영상 번역 기능 장애 발생",
        change: "영상 번역(더빙) 기능에서 지연·실패가 급증하는 장애가 발생해 일부 사용자의 번역 작업이 지연되었습니다.",
        errorRisk: "마감이 임박한 다국어 더빙 작업은 장애 발생 시 대체 일정을 확보해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-05-15",
        title: "무제한 요금제 폐지, 전면 크레딧제 전환",
        change: "기존 무제한 플랜을 없애고 아바타 생성 분당 20크레딧 등 사용량 기반 크레딧제로 요금 체계를 전환했습니다.",
        errorRisk: "장시간 영상이나 대량 번역 작업 시 예상보다 크레딧이 빨리 소진되어 추가 결제가 필요할 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-04-08",
        title: "Avatar V 출시",
        change: "15초 분량 녹화만으로 10분 길이까지 얼굴·음성 정체성을 유지하는 최신 아바타 모델 Avatar V를 공개했습니다(얼굴 유사도 점수 0.840).",
        errorRisk: "장편 영상에서도 정체성이 정교하게 유지되므로 동의 없는 인물 학습 시 오남용 위험이 커집니다.",
        impactLevel: "high"
      },
      {
        date: "2025-05-06",
        title: "Avatar IV 출시",
        change: "정지 이미지 한 장으로 손짓·감정 표현이 반영된 아바타 영상을 생성하는 Avatar IV를 공개하고 이후 API로도 개방했습니다.",
        errorRisk: "이미지 한 장만으로 인물 영상화가 가능해져 본인 동의 확인 절차가 더 중요해졌습니다.",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "다국어 더빙 로컬라이제이션",
        howToUse: "원본 영상을 업로드해 최대 10개 언어로 동시 번역하고 원 화자 음색을 유지한 립싱크 더빙을 생성합니다.",
        recommendation: "번역문은 사후 수정이 안 되므로 배포 전 원어민 검수를 거치는 것을 규칙화합니다."
      },
      {
        title: "사내 교육 영상 갱신",
        howToUse: "Avatar IV/V로 발표자 아바타를 만들고 Business 플랜의 브랜드 킷·용어집으로 부서별 톤을 통일합니다.",
        recommendation: "분당 크레딧 소모가 큰 아바타는 초안 단계에서 저크레딧 유형으로 먼저 검증한 뒤 최종본만 고품질로 렌더링합니다."
      },
      {
        title: "인물 아바타 동의 관리",
        howToUse: "실존 임직원·모델의 아바타를 만들 때 HeyGen 동의 절차와 모더레이션 정책에 따라 서면 동의를 기록합니다.",
        recommendation: "동의 없는 제3자 얼굴·음성 합성은 정책 위반이므로 게시 전 담당자 승인 절차를 두는 것이 안전합니다."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.8/5",
        note: "리뷰 1,462건 기준, 2026 Summer 리포트 AI 영상 부문 1위, 2026-09 확인",
        url: "https://www.g2.com/products/heygen/reviews"
      },
      {
        source: "Capterra",
        score: "4.7/5",
        note: "아바타 실사도·사용 편의성 호평 다수, 2026-09 확인",
        url: "https://www.capterra.com/p/10015133/HeyGen/reviews/"
      },
      {
        source: "Trustpilot",
        score: "2.3/5",
        note: "리뷰 100건 분석 기준 80%가 부정적, 결제·고객지원 불만이 대부분(3자 집계), 2026-09 확인",
        url: "https://www.zuloai.com/blog/heygen-ai-review-complete-data-backed-guide-to-ratings-pricing-user-sentiment/"
      }
    ],
    sources: [
      { label: "HeyGen 2026 가격 정책 정리", url: "https://www.eesel.ai/blog/heygen-pricing" },
      { label: "HeyGen Avatar V 공식 발표", url: "https://www.heygen.com/blog/announcing-avatar-v" },
      {
        label: "HeyGen Avatar IV 공식 발표",
        url: "https://www.heygen.com/blog/introducing-voice-director-and-avatar-iv"
      },
      {
        label: "HeyGen G2 Summer 2026 1위 발표",
        url: "https://www.heygen.com/blog/heygen-2026-g2-summer-reports"
      },
      {
        label: "HeyGen 무료 플랜·워터마크 안내",
        url: "https://www.heygen.com/tool/free-ai-video-generator-no-watermark"
      },
      {
        label: "HeyGen vs Synthesia 비교(요금제 변경 포함)",
        url: "https://hollymack.com/synthesia-vs-heygen/"
      },
      { label: "HeyGen 상태 페이지(장애 이력)", url: "https://status.heygen.com/" },
      {
        label: "HeyGen 리뷰 평점 종합(G2·Capterra·Trustpilot)",
        url: "https://www.zuloai.com/blog/heygen-ai-review-complete-data-backed-guide-to-ratings-pricing-user-sentiment/"
      }
    ],
    researchedAt: "2026-09"
  },
  // ElevenLabs
  "3eb0d80f-c91b-40b9-a57b-ceb5bc76ad1c": {
    oneLine: "가장 자연스러운 목소리를 빠르게 만들지만, 크레딧 요금제와 음성 도용 리스크는 직접 관리해야 합니다.",
    scoreBreakdown: { functionality: 92, uiux: 80, reliability: 70, comfort: 65, pricing: 58 },
    keyFeatures: [
      "Eleven v3: 70개 이상 언어와 감정 오디오 태그를 지원하는 최신 TTS 모델(2026-02 GA)",
      "Flash v2.5: 지연시간이 매우 짧아 실시간 대화에 쓰이는 경량 음성 모델",
      "ElevenAgents: 전화·WhatsApp·챗에 배포하는 대화형 AI 음성 에이전트",
      "Professional Voice Cloning: 소량의 샘플로 개인 목소리를 복제하는 기능",
      "Dubbing: 화자의 감정과 타이밍을 유지하며 여러 언어로 영상을 더빙",
      "Voice Library / Iconic 마켓플레이스: 동의 기반 음성 라이선싱과 크리에이터 수익 배분"
    ],
    pricingSummary: "Free(월 1만 크레딧)부터 Starter $6, Creator $22, Pro $99, Scale $299, Business $990까지 크레딧제 요금이며, 2025년에만 세 차례 크레딧 체계가 개편되고 2025년 11월부터 대화형 에이전트 사용 분도 플랜에 포함됐습니다.",
    koreaNote: "Eleven v3부터 한국어 발음 자연스러움이 크게 개선됐지만 UI와 공식 지원은 영어 중심이라, 국내 이용자들은 Voice Library에서 커뮤니티가 공유한 한국어 PVC 음성을 찾아 쓰는 경우가 많습니다.",
    comparisons: [
      {
        competitor: "OpenAI TTS",
        worksBetterHere: "Professional Voice Cloning과 70개 이상 언어의 감정 태그(Eleven v3)를 지원해 표현력이 더 풍부합니다.",
        weakerHere: "OpenAI TTS는 ChatGPT·API 생태계에 기본 내장돼 있어 별도 가입 없이 더 저렴하게 붙여 쓸 수 있습니다."
      },
      {
        competitor: "Murf",
        worksBetterHere: "음성의 사실감과 실시간 대화형 에이전트(ElevenAgents) 구축에서 앞서 있습니다.",
        weakerHere: "Murf는 템플릿 기반 협업과 팀 프레젠테이션·교육 영상 제작 워크플로우가 더 정돈돼 있습니다."
      },
      {
        competitor: "Play.ht",
        worksBetterHere: "Voice Library 규모와 Dubbing 품질, 감정 표현이 필요한 콘텐츠에서 우위에 있습니다.",
        weakerHere: "Play.ht는 API 기반 음성 에이전트 구축 비용이 더 저렴해 예산이 빠듯한 팀에 유리합니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-05-11",
        title: "BIPA 집단소송 피소",
        change: "일리노이주 저널리스트·성우 7인이 동의 없는 음성 학습을 이유로 ElevenLabs 등을 상대로 BIPA 집단소송을 제기했습니다.",
        errorRisk: "동의 없는 음성 학습에 대한 법적·평판 리스크가 해당 음성을 활용한 기업 이용자에게도 전이될 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2026-02-04",
        title: "시리즈 D $500M 유치, 기업가치 $11B",
        change: "Sequoia Capital 주도로 5억 달러 시리즈 D를 유치하며 기업가치가 110억 달러로 1년 만에 3배 이상 상승했습니다.",
        errorRisk: "급성장에 따른 요금제·정책 변경이 잦아 비용 계획을 자주 재점검해야 합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-02-02",
        title: "Eleven v3 정식 출시(GA)",
        change: "감정 오디오 태그와 70개 이상 언어를 지원하는 Eleven v3가 알파를 벗어나 정식 출시됐습니다.",
        errorRisk: "v3는 지연시간이 길어 실시간 대화에는 부적합하므로 용도에 따라 Flash 모델과 구분해 써야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-11",
        title: "Iconic 마켓플레이스 및 크리에이터 보상 확대",
        change: "Michael Caine 등 유명인의 음성을 동의 기반으로 라이선싱하는 Iconic 마켓플레이스를 출시했고, 음성 크리에이터 누적 지급액이 6개월 만에 2배로 늘었습니다.",
        errorRisk: "동의 기반 라이선싱 밖에서 이뤄지는 무단 음성 복제는 여전히 별도의 소송 리스크로 남아 있습니다.",
        impactLevel: "medium"
      }
    ],
    workPlaybook: [
      {
        title: "나레이션 제작 표준화",
        howToUse: "Eleven v3의 오디오 태그와 Professional Voice Cloning으로 브랜드 보이스를 하나 만들고, 스크립트에 [pause]·[excited] 같은 태그를 넣어 톤을 통제합니다.",
        recommendation: "브랜드 보이스로 쓸 목소리는 성우와 서면 동의·이용 범위 계약을 먼저 맺고 사용 이력을 기록으로 남기세요."
      },
      {
        title: "다국어 더빙 파이프라인",
        howToUse: "Dubbing 기능으로 원본 영상 화자의 감정과 타이밍을 유지한 채 여러 언어 버전을 한 번에 생성합니다.",
        recommendation: "언어별로 원어민 검수를 한 단계 거쳐 발음 오류나 어색한 억양을 배포 전에 반드시 걸러내세요."
      },
      {
        title: "상담 에이전트 자동화",
        howToUse: "ElevenAgents로 전화·WhatsApp 상담 봇을 만들고 MCP·API 툴콜로 예약·조회 같은 실제 업무를 연결합니다.",
        recommendation: "플랜에 포함된 Agents 사용 분(월 한도)과 초과 과금 구조를 먼저 계산해 크레딧 소진 리스크를 관리하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.5/5",
        note: "리뷰 1,140건 기준, 2026-09 확인",
        url: "https://www.g2.com/products/elevenlabsio/reviews"
      },
      {
        source: "App Store (ElevenReader)",
        score: "4.7/5",
        note: "ElevenLabs 공식 리더 앱 기준, 2026-09 확인",
        url: "https://apps.apple.com/us/app/elevenreader-read-books-aloud/id6479373050"
      },
      {
        source: "Capterra",
        score: "확인 필요",
        note: "종합 평점 수치 확인 어려움(확인 필요)",
        url: "https://capterra.com/p/10013392/ElevenLabs/reviews/"
      }
    ],
    sources: [
      { label: "ElevenLabs 공식 요금제(한국어)", url: "https://elevenlabs.io/ko/pricing" },
      {
        label: "Eleven v3 정식 출시 공식 발표",
        url: "https://elevenlabs.io/blog/eleven-v3-is-now-generally-available"
      },
      { label: "시리즈 D 펀딩 공식 발표", url: "https://elevenlabs.io/blog/series-d" },
      {
        label: "저널리스트 BIPA 집단소송 보도",
        url: "https://chicago.suntimes.com/technology/2026/05/19/tech-giants-sued-over-stealing-voices-of-well-known-journalists-voice-actors-to-train-ai"
      },
      {
        label: "Iconic 마켓플레이스·할리우드 배우 파트너십 발표",
        url: "https://www.businesswire.com/news/home/20251111704426/en/ElevenLabs-Announces-Partnerships-with-Iconic-Hollywood-Actors"
      },
      { label: "ElevenLabs G2 리뷰", url: "https://www.g2.com/products/elevenlabsio/reviews" },
      {
        label: "ElevenLabs vs Murf vs Play.ht 비교",
        url: "https://genesysgrowth.com/blog/elevenlabs-vs-playht-vs-murf"
      },
      {
        label: "Consumer Reports 음성 클로닝 안전장치 평가",
        url: "https://innovation.consumerreports.org/?p=10509"
      }
    ],
    researchedAt: "2026-09"
  },
  // Suno
  "be7a6ff5-34ca-4d4c-aec2-f42ba6f729fc": {
    oneLine: "가장 자연스러운 보컬의 완성곡을 빠르게 뽑아주지만, 저작권 지위와 레이블 소송 리스크는 여전히 진행형입니다.",
    scoreBreakdown: { functionality: 88, uiux: 85, reliability: 60, comfort: 62, pricing: 65 },
    keyFeatures: [
      "v5.5 모델: 더 표현력 있는 보컬과 장르별 다이내믹 사운드(2026-03 출시)",
      "Voices: 본인 목소리를 검증해 커스텀 보컬로 쓰는 음성 클로닝 기능",
      "Custom Models / My Taste: 개인 취향을 학습한 맞춤형 파인튜닝·추천 엔진",
      "Suno Studio 2.0: MIDI 편집·신스·스템 분리를 지원하는 브라우저 기반 AI DAW",
      "Extend/Cover: 곡을 이어 붙이거나 커버를 생성해 풀렝스 트랙으로 완성",
      "Pro/Premier 상업 이용권: 유료 플랜 생성곡에 로열티 없는 상업적 사용권 부여"
    ],
    pricingSummary: "Free(일 50크레딧, 비상업용)부터 Pro 월 $10(연 결제 시 $8), Premier 월 $30(연 결제 시 $24)이며, Pro·Premier로 생성한 곡만 소유권과 상업적 이용권이 주어집니다.",
    koreaNote: "한국어 가사는 생성 자체는 가능하지만 발음이 부자연스러운 경우가 많아, 국내 이용자들은 가사를 별도로 다듬거나 영어 위주로 쓰는 경우가 많습니다.",
    comparisons: [
      {
        competitor: "Udio",
        worksBetterHere: "UMG와의 소송 이후에도 다운로드·스템 추출이 자유롭고 v5.5 보컬이 박자에 더 안정적으로 맞습니다.",
        weakerHere: "Udio는 48kHz 스테레오 출력과 인페인팅 편집 기능으로 악기 음질과 세밀한 수정에서 앞섭니다."
      },
      {
        competitor: "AIVA",
        worksBetterHere: "보컬이 포함된 완성곡 생성과 대중음악 장르 다양성에서 훨씬 강합니다.",
        weakerHere: "AIVA는 클래식·오케스트라 스코어링과 MIDI 기반 정밀 편곡에 특화돼 영상 스코어 작업에 유리합니다."
      },
      {
        competitor: "Soundraw",
        worksBetterHere: "가사와 보컬이 있는 완결된 노래를 만들 수 있어 표현의 폭이 훨씬 넓습니다.",
        weakerHere: "Soundraw는 길이와 무드를 세밀하게 조절하는 로열티 프리 라이선스 구조라 유튜브 배경음악용으로 더 간편합니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-08-13",
        title: "Suno Studio 2.0 출시",
        change: "MIDI 편집, 신스, 스템 분리 등을 더한 브라우저 기반 AI DAW로 Suno Studio를 전면 개편했습니다.",
        errorRisk: "고급 편집 기능은 유료 구독자 전용이라 무료 이용자와의 기능 격차가 더 커졌습니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-06-04",
        title: "시리즈 D $400M 유치, 기업가치 $5.4B",
        change: "Bond Capital 주도로 4억 달러를 유치하며 기업가치가 54억 달러로, 2025년 11월 24.5억 달러 대비 2배 이상 상승했습니다.",
        errorRisk: "급성장과 함께 요금제·정책이 자주 바뀔 수 있어 지속적인 확인이 필요합니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-03-25",
        title: "v5.5 모델 출시",
        change: "Voices(음성 클로닝), Custom Models, My Taste 등 커뮤니티 요청 기능을 담은 v5.5를 정식 출시했습니다.",
        errorRisk: "무료 플랜은 구형 v4.5 모델만 제공돼 유료 플랜과의 품질 격차가 커졌습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-11",
        title: "Warner Music와 소송 합의 및 라이선싱 계약",
        change: "Warner Music Group과 저작권 소송을 합의하고 비허가 학습 모델을 전량 폐기, 라이선스 기반 모델로 전환하기로 했습니다.",
        errorRisk: "Universal·Sony와의 소송은 여전히 진행 중이라 향후 라이선스 비용이 요금제에 반영될 수 있습니다.",
        impactLevel: "high"
      }
    ],
    workPlaybook: [
      {
        title: "브랜드 캠페인 음악 제작",
        howToUse: "Custom Prompt 모드로 가사와 무드를 직접 입력해 v5.5로 곡을 생성한 뒤, Extend로 필요한 길이만큼 풀 트랙을 완성합니다.",
        recommendation: "반드시 Pro 이상 유료 플랜에서 생성한 곡만 상업적으로 배포하고, 무료 플랜 결과물은 사내 시안 용도로만 쓰세요."
      },
      {
        title: "숏폼 콘텐츠 배경음악",
        howToUse: "장르·분위기 키워드만 입력하는 Simple 모드로 여러 후보곡을 빠르게 생성해 숏폼 영상에 붙입니다.",
        recommendation: "생성곡의 저작권 등록 가능 여부가 불확실하므로, 중요한 캠페인에는 사람이 가사·편곡을 추가 수정한 버전을 쓰세요."
      },
      {
        title: "음악 프로덕션 협업",
        howToUse: "Suno Studio 2.0에서 스템을 분리해 MIDI로 가져온 뒤, 사내 편곡자가 신스와 이펙트로 다듬어 완성도를 높입니다.",
        recommendation: "구독 자동 갱신과 크레딧 소진 이슈가 리뷰에서 반복 제기되므로 결제일과 크레딧 잔량을 팀 캘린더로 관리하세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.0/5",
        note: "리뷰 8건 기준(표본 적음), 2026-09 확인",
        url: "https://www.g2.com/products/suno-ai/reviews"
      },
      {
        source: "Google Play",
        score: "4.8/5",
        note: "리뷰 약 233만 건 기준, 2026-09 확인",
        url: "https://play.google.com/store/apps/details?id=com.suno.android&hl=en_US"
      },
      {
        source: "Trustpilot",
        score: "확인 필요",
        note: "리뷰 다수이나 종합 평점 수치 확인 어려움, 결제·환불 불만 다수(확인 필요)",
        url: "https://www.trustpilot.com/review/suno.com"
      }
    ],
    sources: [
      { label: "Suno 상업적 이용 정책 공식 도움말", url: "https://help.suno.com/en/articles/9601985" },
      { label: "Suno v5.5 공식 발표", url: "https://suno.com/blog/v5-5" },
      { label: "Suno Studio 2.0 공식 발표", url: "https://suno.com/blog/studio-2" },
      {
        label: "Warner Music-Suno 라이선싱 합의 보도",
        url: "https://happycapyguide.com/blog/suno-umg-sony-licensing-stalemate-ai-music-copyright-2026"
      },
      {
        label: "Suno 시리즈 D 펀딩 보도",
        url: "https://variety.com/2026/digital/news/ai-music-suno-funding-round-400-million-5-4-billion-valuation-1236765727/"
      },
      {
        label: "음악가노조(AFM)의 레이블 제소 보도",
        url: "https://www.hollywoodreporter.com/music/music-industry-news/musicians-union-lawsuit-ai-song-generator-settlement-1236614835/"
      },
      { label: "Suno G2 리뷰", url: "https://www.g2.com/products/suno-ai/reviews" },
      { label: "Suno vs Udio 비교", url: "https://blog.dubspot.com/suno-vs-udio-2026" },
      {
        label: "Music Business Worldwide: Suno 시리즈 D $400M, 기업가치 $5.4B",
        url: "https://www.musicbusinessworldwide.com/suno-raises-over-400-million-pushing-valuation-to-5-4-billion/"
      },
      {
        label: "TechCrunch: Warner Music와 Suno 소송 합의 및 라이선스 계약",
        url: "https://techcrunch.com/2025/11/25/warner-music-signs-deal-with-ai-music-startup-suno-settles-lawsuit/"
      }
    ],
    researchedAt: "2026-09"
  },
  // Topaz Labs
  "49900872-c5ef-4ce9-a0e2-71f5dddb49cd": {
    oneLine: "로컬 처리 화질은 최고 수준이지만, 2025년 구독 전환과 고사양 GPU 요구가 새로운 진입장벽입니다.",
    scoreBreakdown: { functionality: 90, uiux: 75, reliability: 68, comfort: 55, pricing: 50 },
    keyFeatures: [
      "Topaz Photo(Wonder 3, High Fidelity 3 등): 사진 노이즈 제거·업스케일·디테일 복원",
      "Topaz Video(Astra 2, Starlight Precise 2.6 등): 4K/8K 영상 업스케일과 프레임 보간",
      "Topaz Gigapixel: 9종 이상 전용 모델로 이미지를 최대 6배 확대",
      "Topaz Studio: Photo·Video·Gigapixel을 묶은 통합 구독 번들 및 클라우드 렌더링",
      "NeuroStream: VRAM 사용량을 최대 95%까지 줄이는 자체 추론 최적화 기술",
      "Premiere Panel: Adobe Premiere Pro 타임라인에서 바로 업스케일·보정 적용"
    ],
    pricingSummary: "2025년 10월 3일부로 영구 라이선스 판매가 완전히 종료되고 Gigapixel·Photo·Video가 Topaz Studio 구독으로 통합됐습니다. 종료 직전 영구 라이선스는 각각 $99·$199·$299였고, 이후 구독가는 출처마다 Gigapixel 월 $29(연 $149), Photo 월 $39(연 $199) 등으로 엇갈려 공식 요금 페이지 확인이 필요합니다.",
    koreaNote: "한국 이용자 후기에서는 화질 복원력은 높이 평가되지만, 저사양 PC에서는 장시간(영상 기준 10시간 이상) 렌더링이 필요하다는 불만이 많습니다.",
    comparisons: [
      {
        competitor: "Magnific AI",
        worksBetterHere: "원본에 없는 디테일을 지어내지 않는 사실적 복원(Fidelity 중심)이라 인물·문서처럼 원본 보존이 중요한 작업에 적합합니다.",
        weakerHere: "Magnific AI는 확산 모델 기반으로 화려한 디테일을 새로 그려 넣어 무드보드나 스타일라이즈드 이미지 작업에서 더 인상적인 결과를 냅니다."
      },
      {
        competitor: "Adobe Photoshop",
        worksBetterHere: "Wonder 3·High Fidelity 3 등 업스케일 전용 모델이 많아 순수 해상도·노이즈 복원 품질이 더 높다는 평가가 많습니다.",
        weakerHere: "Photoshop은 Creative Cloud 구독에 Super Resolution 기능이 포함돼 있어 추가 비용 없이 가벼운 업스케일에는 더 간편합니다."
      },
      {
        competitor: "Upscayl",
        worksBetterHere: "Astra 2, Starlight 등 특화 모델과 NeuroStream 최적화로 전문가용 결과물 품질이 더 높습니다.",
        weakerHere: "Upscayl은 무료 오픈소스 도구라 예산이 없는 개인·소규모 작업에는 진입장벽이 훨씬 낮습니다."
      }
    ],
    patchNotes: [
      {
        date: "2026-05",
        title: "Expansion Release",
        change: "SDR-HDR 변환 모델 Hyperion 2를 추가하고 Adobe Premiere용 통합 경험을 확장했습니다.",
        errorRisk: "신규 모델 사용은 데스크톱·웹 접근 권한 및 구독 등급에 따라 제한될 수 있습니다.",
        impactLevel: "medium"
      },
      {
        date: "2026-04",
        title: "Next-Gen Release(역대 최대 모델 업데이트)",
        change: "사진용 Wonder 3·Denoise Max·Super Focus 3·High Fidelity 3와 영상용 Starlight Precise 2.5·Astra 2, VRAM 최적화 기술 NeuroStream을 한번에 공개했습니다.",
        errorRisk: "신모델이 고사양 GPU를 요구해 구형 GPU 사용자는 체감 성능 개선이 제한적일 수 있습니다.",
        impactLevel: "high"
      },
      {
        date: "2025-10-03",
        title: "영구 라이선스 판매 전면 종료",
        change: "영구 라이선스 신규 판매를 전면 중단하고 Gigapixel·Photo·Video를 Topaz Studio 구독 체계로 옮겼습니다. 기존 영구 라이선스 보유자는 구매한 버전을 계속 쓸 수 있지만 이후 업데이트는 구독이 있어야 받습니다.",
        errorRisk: "한 번 사서 오래 쓰던 팀은 비용 구조가 매년 반복 지출로 바뀌고, 업데이트를 받으려면 구독으로 갈아타야 해 장기 비용을 다시 계산해야 합니다.",
        impactLevel: "high"
      },
      {
        date: "2025-09",
        title: "Topaz Photo AI → Topaz Photo 리브랜딩",
        change: "제품명에서 'AI'를 제거하고 Topaz Photo로 리브랜딩했습니다.",
        errorRisk: "제품명 변경으로 기존 문서·튜토리얼과 명칭이 달라 혼선이 생길 수 있습니다.",
        impactLevel: "low"
      }
    ],
    workPlaybook: [
      {
        title: "아카이브 영상 복원",
        howToUse: "Topaz Video의 Starlight·Astra 모델로 저해상도 원본을 4K로 업스케일하고 노이즈·플리커를 제거합니다.",
        recommendation: "장시간 렌더링(수 시간~10시간 이상)을 감안해 작업 일정과 VRAM 12GB 이상 GPU를 사전에 확보하세요."
      },
      {
        title: "제품·인물 사진 보정",
        howToUse: "Topaz Photo의 High Fidelity·Super Focus 모델로 초점 흐린 사진을 복원하고 Lightroom·Photoshop 플러그인으로 연동합니다.",
        recommendation: "문서·증거성 이미지처럼 생성형 디테일 추가가 필요 없는 경우 Creativity·디테일 강도를 낮게 설정해 원본 왜곡을 방지하세요."
      },
      {
        title: "영상 편집 파이프라인 통합",
        howToUse: "Premiere Panel로 타임라인 클립을 선택해 업스케일·보간을 바로 적용하고 새 트랙으로 받습니다.",
        recommendation: "구독 갱신 시점과 클라우드 크레딧 사용량을 함께 점검해 예상 밖 비용 증가를 막으세요."
      }
    ],
    externalRatings: [
      {
        source: "G2",
        score: "4.6/5",
        note: "Topaz Labs 리뷰 9건 기준(표본 적음), 2026-09 확인",
        url: "https://www.g2.com/products/topaz-labs/reviews"
      },
      {
        source: "Capterra(Topaz Gigapixel)",
        score: "4.8/5",
        note: "리뷰 18건 기준, 2026-09 확인",
        url: "https://www.capterra.com/p/235863/Gigapixel-AI/reviews/"
      },
      {
        source: "Trustpilot",
        score: "4.0/5",
        note: "topazlabs.com 전체 기준 리뷰 약 5.6만 건, 2026-09 확인",
        url: "https://www.trustpilot.com/review/www.topazlabs.com"
      }
    ],
    sources: [
      {
        label: "Topaz Labs Next-Gen Release 공식 발표",
        url: "https://www.topazlabs.com/news/the-next-gen-release---april-2026"
      },
      {
        label: "Topaz Labs Expansion Release 공식 발표",
        url: "https://www.topazlabs.com/news/the-expansion-release"
      },
      {
        label: "영구 라이선스 종료 보도",
        url: "https://digitalproduction.com/2025/10/02/topaz-drops-perpetual-licences-bets-on-subscriptions-with-studio-launch/"
      },
      {
        label: "Topaz Photo 릴리즈 노트 공식 문서",
        url: "https://docs.topazlabs.com/topaz-photo/release-summary"
      },
      {
        label: "GPU/VRAM 시스템 요구사항 공식 문서",
        url: "https://docs.topazlabs.com/topaz-video/system-requirements"
      },
      {
        label: "NeuroStream VRAM 최적화 기술 보도",
        url: "https://quasa.io/media/topaz-labs-and-nvidia-team-up-neurostream-slashes-vram-needs-by-up-to-95-for-local-ai-image-processing"
      },
      {
        label: "Topaz vs Magnific AI 비교",
        url: "https://chasejarvis.com/blog/topaz-vs-magnific-best-ai-image-scaler/"
      },
      { label: "Topaz Labs G2 리뷰", url: "https://www.g2.com/products/topaz-labs/reviews" },
      {
        label: "CGPress: Topaz Labs 영구 라이선스 종료 보도",
        url: "https://cgpress.org/archives/topaz-labs-ends-perpetual-licenses-with-launch-of-topaz-studio-subscription.html"
      }
    ],
    researchedAt: "2026-09"
  }
};
