import type { ToolCapabilityProfile } from "@/lib/types";

/**
 * 도구 이름 → 기능 지원 매트릭스(지원/부분 지원/미지원), 적합 직군, 적합 팀 규모.
 * 공식 가격/도움말 페이지와 외부 리뷰를 참고해 채웠습니다. scripts/merge-research.js 로 생성됩니다. 조사 기준: 2026-09
 */
export const capabilityProfiles: Record<string, ToolCapabilityProfile> = {
  "Notion": {
    capabilities: {
      freePlan: { level: "full" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full", note: "Business 플랜 이상 무제한 AI" },
      agentAutomation: { level: "full", note: "Notion Agent 자동화" },
      apiIntegrations: { level: "full" },
      teamAdmin: { level: "full" },
      dataExport: { level: "full", note: "Markdown/CSV/HTML/PDF" },
      ssoSecurity: { level: "full", note: "Business 이상 SAML, Enterprise SCIM" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "partial", note: "다운로드한 페이지만 오프라인" }
    },
    roles: ["pm", "ops", "marketing"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://www.notion.com/help/guides/working-offline-in-notion-everything-you-need-to-know",
      "https://www.notion.com/releases/2025-08-19",
      "https://www.gend.co/blog/notion-pricing",
      "https://www.asiae.co.kr/en/article/2026042116305123495"
    ]
  },
  "Figma": {
    capabilities: {
      freePlan: { level: "partial", note: "파일 3개, FigJam 3개로 제한" },
      koreanSupport: { level: "partial", note: "UI는 한국어, AI 기능은 영어 위주" },
      aiAssistant: { level: "full", note: "유료 플랜 중심 Figma AI" },
      agentAutomation: { level: "partial", note: "Figma Make 등 제한적" },
      apiIntegrations: { level: "full" },
      teamAdmin: { level: "full", note: "Organization 이상" },
      dataExport: { level: "full", note: "PNG/SVG/PDF/코드" },
      ssoSecurity: { level: "full", note: "Organization 이상 SAML SSO" },
      mobileApp: { level: "partial", note: "모바일은 열람/코멘트 중심" },
      offlineLocal: { level: "partial", note: "이미 연 파일만 제한적 오프라인" }
    },
    roles: ["design", "pm", "engineering"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://help.figma.com/hc/en-us/articles/6956360971415-Change-your-language-preference",
      "https://help.figma.com/hc/en-us/articles/360040328553-What-can-I-do-offline-in-Figma",
      "https://www.banani.co/blog/figma-pricing-and-credits",
      "https://costbench.com/software/design/figma/"
    ]
  },
  "Slack": {
    capabilities: {
      freePlan: { level: "partial", note: "메시지 기록 90일, 연동 10개 제한" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full", note: "Business+ 이상 Slack AI" },
      agentAutomation: { level: "partial", note: "Workflow Builder 규칙 기반" },
      apiIntegrations: { level: "full" },
      teamAdmin: { level: "full" },
      dataExport: { level: "partial", note: "Business+ 이상 전체 내보내기" },
      ssoSecurity: { level: "full", note: "Business+ 이상 SAML SSO" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["pm", "ops", "sales"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://slack.com/help/articles/203772216-Set-up-SAML-single-sign-on-for-Slack",
      "https://slack.com/help/articles/201658943-Export-your-workspace-data",
      "https://slack.com/intl/ko-kr/blog/collaboration/이제-한국어로-제공되는-slack",
      "https://userjot.com/blog/slack-pricing-2025-plans-costs-hidden-fees"
    ]
  },
  "Linear": {
    capabilities: {
      freePlan: { level: "partial", note: "이슈 250개, 팀 2개로 제한" },
      koreanSupport: { level: "partial", note: "UI 영어만, AI는 한국어 응답 가능" },
      aiAssistant: { level: "full", note: "Business 이상 Linear Agent" },
      agentAutomation: { level: "full", note: "Business 이상 Triage/Agent" },
      apiIntegrations: { level: "full", note: "무료 플랜도 API 포함" },
      teamAdmin: { level: "full", note: "Enterprise 이상 고급 관리" },
      dataExport: { level: "full", note: "CSV/API 내보내기" },
      ssoSecurity: { level: "partial", note: "Enterprise 플랜에서만 SAML/SCIM" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["engineering", "pm"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://www.temperstack.com/plans/linear/",
      "https://quackback.io/blog/linear-pricing",
      "https://github.com/MilesHan/LinearApp-Locale-Extension",
      "https://apps.apple.com/app/id1645587184"
    ]
  },
  "Airtable": {
    capabilities: {
      freePlan: { level: "partial", note: "베이스당 레코드 1,000개 제한" },
      koreanSupport: { level: "partial", note: "인터페이스 한국어 미지원" },
      aiAssistant: { level: "full", note: "플랜별 AI 크레딧 차등" },
      agentAutomation: { level: "partial", note: "규칙 기반 자동화 중심" },
      apiIntegrations: { level: "full" },
      teamAdmin: { level: "full", note: "Business 이상" },
      dataExport: { level: "partial", note: "테이블별 CSV, 전체 내보내기 불가" },
      ssoSecurity: { level: "full", note: "Business 이상 SAML SSO" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["ops", "pm", "marketing"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://support.airtable.com/docs/differences-between-the-desktop-and-mobile-versions",
      "https://community.airtable.com/legacy-product-ideas-75/airtable-regional-and-language-options-41960",
      "https://community.airtable.com/show-and-tell-15/export-my-base-download-all-the-tables-from-a-base-at-once-2164",
      "https://www.usecarly.com/blog/airtable-pricing/"
    ]
  },
  "Miro": {
    capabilities: {
      freePlan: { level: "partial", note: "보드 3개, AI 크레딧 10개 제한" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "partial", note: "Business 이상 캔버스 AI" },
      apiIntegrations: { level: "full" },
      teamAdmin: { level: "full", note: "Business 이상" },
      dataExport: { level: "full", note: "PDF/이미지/CSV" },
      ssoSecurity: { level: "full", note: "Business 이상 SSO, Enterprise SCIM" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["design", "pm", "ops"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://help.miro.com/hc/en-us/articles/4957762934802-Language-settings",
      "https://www.g2.com/products/miro/pricing",
      "https://www.usecarly.com/blog/miro-pricing/"
    ]
  },
  "Zapier": {
    capabilities: {
      freePlan: { level: "partial", note: "월 100 작업, 2단계 Zap만" },
      koreanSupport: { level: "none", note: "인터페이스 영어만 지원" },
      aiAssistant: { level: "full", note: "Zapier Agents/Central" },
      agentAutomation: { level: "full", note: "자율 AI 에이전트 실행" },
      apiIntegrations: { level: "full", note: "8000+ 앱 연동" },
      teamAdmin: { level: "full", note: "Team 이상" },
      dataExport: { level: "partial", note: "작업 데이터 내보내기 제한적" },
      ssoSecurity: { level: "full", note: "Team 이상 SAML SSO" },
      mobileApp: { level: "none" },
      offlineLocal: { level: "none" }
    },
    roles: ["ops", "marketing", "sales"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://help.zapier.com/hc/en-us/articles/35201074788877-Can-I-change-Zapier-s-interface-language",
      "https://www.nocode.mba/articles/zapier-pricing-2026",
      "https://www.lindy.ai/blog/zapier-pricing",
      "https://community.zapier.com/how-do-i-3/zapier-ios-and-android-mobile-apps-3239"
    ]
  },
  "Jasper": {
    capabilities: {
      freePlan: { level: "none", note: "7일 무료체험만 제공" },
      koreanSupport: { level: "partial", note: "UI 영어, 출력은 한국어 가능" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Business 플랜 Jasper Agents" },
      apiIntegrations: { level: "partial", note: "API는 Business 플랜에서만" },
      teamAdmin: { level: "partial", note: "Business 플랜 협업 기능" },
      dataExport: { level: "partial", note: "텍스트/문서 내보내기 위주" },
      ssoSecurity: { level: "full", note: "Business 플랜 SSO" },
      mobileApp: { level: "none" },
      offlineLocal: { level: "none" }
    },
    roles: ["marketing", "sales"],
    teamFit: ["small", "mid", "large"],
    sources: [
      "https://help.jasper.ai/hc/en-us/articles/40683069658907-Language-Localization-and-Translation",
      "https://www.jasper.ai/free-trial",
      "https://www.eesel.ai/blog/jasper-ai-pricing"
    ]
  },
  "Gong": {
    capabilities: {
      freePlan: { level: "none", note: "무료체험 없음, 영업 데모만" },
      koreanSupport: { level: "partial", note: "(확인 필요)" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Gong Agents, Forecast AI" },
      apiIntegrations: { level: "full", note: "Salesforce/HubSpot 연동" },
      teamAdmin: { level: "full" },
      dataExport: { level: "partial", note: "(확인 필요)" },
      ssoSecurity: { level: "full", note: "SAML SSO, SCIM은 Enterprise" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["sales", "ops"],
    teamFit: ["mid", "large"],
    sources: [
      "https://help.gong.io/docs/summary-of-security-features",
      "https://www.g2.com/products/gong/reviews",
      "https://tldv.io/blog/gong-pricing/"
    ]
  },
  "Replit": {
    capabilities: {
      freePlan: { level: "partial", note: "Agent 크레딧/시간 제한" },
      koreanSupport: { level: "full", note: "공식 한국어 문서 제공" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Replit Agent 자율 코딩" },
      apiIntegrations: { level: "partial", note: "제한적 공개 API" },
      teamAdmin: { level: "full", note: "Pro/Enterprise" },
      dataExport: { level: "full", note: "코드/Git 내보내기" },
      ssoSecurity: { level: "full", note: "Enterprise SSO/SCIM" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none", note: "브라우저 기반 클라우드 IDE" }
    },
    roles: ["engineering", "pm"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://docs.replit.com/ko/features/agent/overview",
      "https://www.nocode.mba/articles/replit-pricing",
      "https://www.softr.io/blog/replit-pricing"
    ]
  },
  "ChatGPT": {
    capabilities: {
      freePlan: { level: "full" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Agent Mode (Plus 이상)" },
      apiIntegrations: { level: "full", note: "GPTs/API/60+ 커넥터" },
      teamAdmin: { level: "full", note: "Business 이상" },
      dataExport: { level: "full", note: "JSON 전체 대화 내보내기" },
      ssoSecurity: { level: "full", note: "Business 이상 SAML SSO" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["marketing", "research", "engineering", "pm"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://help.openai.com/en/articles/9106926-transfer-exported-conversations-between-chatgpt-accounts",
      "https://tldv.io/blog/chatgpt-pricing/",
      "https://www.layer3labs.io/guides/chatgpt-pricing"
    ]
  },
  "Claude": {
    capabilities: {
      freePlan: { level: "full" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Claude Code, Agent SDK" },
      apiIntegrations: { level: "full", note: "API/MCP 지원" },
      teamAdmin: { level: "full", note: "Team/Enterprise" },
      dataExport: { level: "full", note: "대화 JSON 내보내기" },
      ssoSecurity: { level: "full", note: "Enterprise SAML/SCIM" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["engineering", "research", "pm", "marketing"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://support.claude.com/en/articles/10769299-how-to-use-claude-in-your-preferred-language",
      "https://www.cloudzero.com/blog/claude-pricing/",
      "https://codingscape.com/blog/how-to-choose-claude-team-vs-claude-enterprise"
    ]
  },
  "Gemini": {
    capabilities: {
      freePlan: { level: "full" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Deep Research, Agent 기능" },
      apiIntegrations: { level: "full", note: "Gemini API/Workspace 연동" },
      teamAdmin: { level: "full", note: "Workspace 관리 콘솔" },
      dataExport: { level: "full", note: "Google Takeout" },
      ssoSecurity: { level: "full", note: "Workspace Business 이상 SSO" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["research", "marketing", "pm", "engineering"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://support.google.com/gemini/answer/15984485?hl=ko",
      "https://www.cloudzero.com/blog/gemini-pricing/",
      "https://knowledge.workspace.google.com/admin/getting-started/editions/compare-enterprise-editions"
    ]
  },
  "Perplexity": {
    capabilities: {
      freePlan: { level: "partial", note: "일 5회 Pro Search 제한" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Deep Research, Tasks" },
      apiIntegrations: { level: "full", note: "Sonar API 별도 과금" },
      teamAdmin: { level: "full", note: "Enterprise Pro/Max" },
      dataExport: { level: "full", note: "PDF/Markdown/DOCX 내보내기" },
      ssoSecurity: { level: "full", note: "Enterprise Pro 이상 SSO" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "none" }
    },
    roles: ["research", "marketing", "sales"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://www.eesel.ai/blog/perplexity-pricing",
      "https://www.perplexity.ai/ko/hub/getting-started",
      "https://suprmind.ai/hub/perplexity/pricing/"
    ]
  },
  "Microsoft 365 Copilot": {
    capabilities: {
      freePlan: { level: "partial", note: "Copilot Chat 무료, 전체기능 유료" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Researcher/Analyst 에이전트" },
      apiIntegrations: { level: "full", note: "Graph API/Copilot Studio" },
      teamAdmin: { level: "full", note: "Microsoft 365 관리센터" },
      dataExport: { level: "full", note: "Office 표준 파일 형식" },
      ssoSecurity: { level: "full", note: "Entra ID 통합" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "partial", note: "Office는 오프라인, AI는 온라인 필요" }
    },
    roles: ["pm", "ops", "marketing", "sales"],
    teamFit: ["small", "mid", "large"],
    sources: [
      "https://www.microsoft.com/ko-kr/microsoft-365-copilot/business",
      "https://support.microsoft.com/en-us/microsoft-365-copilot/what-s-the-difference-between-microsoft-copilot-free-and-copilot-in-microsoft-365",
      "https://www.gosearch.ai/blog/microsoft-copilot-pricing/"
    ]
  },
  "GitHub Copilot": {
    capabilities: {
      freePlan: { level: "partial", note: "완성/채팅 월 사용량 제한" },
      koreanSupport: { level: "partial", note: "한국어 응답 품질 영어보다 낮음" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Coding Agent, Agent 모드" },
      apiIntegrations: { level: "full", note: "IDE/CLI 광범위 통합" },
      teamAdmin: { level: "full", note: "Business/Enterprise" },
      dataExport: { level: "full", note: "코드는 사용자 소유" },
      ssoSecurity: { level: "full", note: "Business 이상 SSO" },
      mobileApp: { level: "partial", note: "GitHub 모바일 앱 내 제한적" },
      offlineLocal: { level: "partial", note: "에디터는 로컬, AI는 온라인 필요" }
    },
    roles: ["engineering"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/",
      "https://docs.github.com/ko/copilot/using-github-copilot/ai-models/choosing-the-right-ai-model-for-your-task",
      "https://costbench.com/software/ai-coding-assistants/github-copilot/"
    ]
  },
  "Cursor": {
    capabilities: {
      freePlan: { level: "partial", note: "Hobby 플랜 사용량 매우 제한" },
      koreanSupport: { level: "partial", note: "UI 영어, AI는 한국어 가능" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "다중 에이전트 병렬 실행" },
      apiIntegrations: { level: "full", note: "MCP 지원" },
      teamAdmin: { level: "full", note: "Teams 이상 SSO/관리자" },
      dataExport: { level: "full", note: "코드는 사용자 소유" },
      ssoSecurity: { level: "full", note: "Teams 이상 SSO" },
      mobileApp: { level: "partial", note: "iOS 베타만, Android 미지원" },
      offlineLocal: { level: "partial", note: "기본 편집만 오프라인" }
    },
    roles: ["engineering"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://cursor.com/mobile",
      "https://www.eesel.ai/blog/cursor-pricing",
      "https://www.learncursor.dev/guides/cursor-android"
    ]
  },
  "Lovable": {
    capabilities: {
      freePlan: { level: "partial", note: "일 5크레딧, 월 30 제한" },
      koreanSupport: { level: "partial", note: "AI 출력은 한국어 가능" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "풀스택 앱 자동 빌드" },
      apiIntegrations: { level: "partial", note: "Supabase 등 제한적 연동" },
      teamAdmin: { level: "full", note: "Business 이상 SSO" },
      dataExport: { level: "full", note: "GitHub 코드 내보내기" },
      ssoSecurity: { level: "full", note: "Business 이상 SSO" },
      mobileApp: { level: "none" },
      offlineLocal: { level: "none" }
    },
    roles: ["engineering", "design", "pm"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://www.nocode.mba/articles/lovable-pricing",
      "https://www.jetadmin.io/blog/lovable-pricing-how-credits-plans-and-total-cost-really-work-and-when-to-pick-jet-admin-instead/",
      "https://docs.lovable-korea.com/"
    ]
  },
  "Midjourney": {
    capabilities: {
      freePlan: { level: "none", note: "무료 플랜 없음(2023년 폐지)" },
      koreanSupport: { level: "none", note: "한글 프롬프트 인식 취약" },
      aiAssistant: { level: "partial", note: "프롬프트 기반, 대화형 아님" },
      agentAutomation: { level: "none" },
      apiIntegrations: { level: "none", note: "공식 API 없음" },
      teamAdmin: { level: "partial", note: "Pro/Mega 팀 기능 제한적" },
      dataExport: { level: "full", note: "이미지 다운로드" },
      ssoSecurity: { level: "none" },
      mobileApp: { level: "none", note: "공식 앱 없음(Discord 접속)" },
      offlineLocal: { level: "none" }
    },
    roles: ["design", "marketing"],
    teamFit: ["solo", "small", "mid"],
    sources: [
      "https://docs.midjourney.com/",
      "https://costbench.com/software/ai-image-generators/midjourney/",
      "https://www.eesel.ai/blog/midjourney-pricing"
    ]
  },
  "Canva": {
    capabilities: {
      freePlan: { level: "full" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full", note: "Magic Studio" },
      agentAutomation: { level: "partial", note: "Bulk Create 등 규칙 기반" },
      apiIntegrations: { level: "full", note: "Canva API/Connect 앱" },
      teamAdmin: { level: "full", note: "Business 이상" },
      dataExport: { level: "full", note: "PDF/PNG/MP4 등" },
      ssoSecurity: { level: "full", note: "Enterprise SSO/SCIM" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "partial", note: "모바일 앱 일부만 오프라인" }
    },
    roles: ["design", "marketing", "pm"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://apps.apple.com/KR/app/id897446215",
      "https://www.usecarly.com/blog/canva-pricing/",
      "https://www.capterra.com/p/168956/Canva/pricing/"
    ]
  },
  "NotebookLM": {
    capabilities: {
      freePlan: { level: "full" },
      koreanSupport: { level: "full", note: "오디오 개요 한국어 지원" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "none", note: "자료 기반 요약/응답 중심" },
      apiIntegrations: { level: "partial", note: "Enterprise는 Cloud API 연동" },
      teamAdmin: { level: "partial", note: "Workspace/Enterprise 결합 시" },
      dataExport: { level: "partial", note: "노트/오디오 내보내기 제한적" },
      ssoSecurity: { level: "full", note: "Workspace/Enterprise 결합 시" },
      mobileApp: { level: "full" },
      offlineLocal: { level: "partial", note: "오디오 개요만 오프라인 재생" }
    },
    roles: ["research", "pm", "marketing"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://blog.google/innovation-and-ai/products/notebooklm-app/",
      "https://elephas.app/blog/notebooklm-free-vs-plus",
      "https://www.itworld.co.kr/article/3974261/추임새까지-자연스럽다구글-노트북lm-음성-개요-기능에-한국어-지원-추가.html"
    ]
  },
  "Perplexity Comet": {
    capabilities: {
      freePlan: { level: "full" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "Background Assistant(Max)" },
      apiIntegrations: { level: "partial", note: "확장 프로그램 중심" },
      teamAdmin: { level: "partial", note: "Enterprise Pro 연동 시" },
      dataExport: { level: "partial", note: "브라우저 데이터 내보내기" },
      ssoSecurity: { level: "partial", note: "Enterprise Pro 연동 시" },
      mobileApp: { level: "full", note: "iOS/Android 정식 지원(2026)" },
      offlineLocal: { level: "none" }
    },
    roles: ["research", "marketing", "sales"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://www.eesel.ai/blog/perplexity-comet-pricing",
      "https://www.engadget.com/apps/perplexitys-comet-ai-browser-is-now-available-for-iphones-183947569.html",
      "https://www.perplexity.ai/help-center/comet/en/articles/11734737-comet-mobile-app"
    ]
  },
  "ChatGPT Atlas": {
    capabilities: {
      freePlan: { level: "none", note: "2026.8.9 서비스 종료(단종)" },
      koreanSupport: { level: "none", note: "서비스 종료로 확인 불가" },
      aiAssistant: { level: "none", note: "기능은 ChatGPT 앱으로 통합" },
      agentAutomation: { level: "none", note: "Agent Mode는 ChatGPT로 이관" },
      apiIntegrations: { level: "none" },
      teamAdmin: { level: "none" },
      dataExport: { level: "none", note: "종료 전 데이터 백업 안내됨" },
      ssoSecurity: { level: "none" },
      mobileApp: { level: "none", note: "모바일 앱 출시 전 종료" },
      offlineLocal: { level: "none" }
    },
    roles: ["research", "marketing"],
    teamFit: ["solo", "small"],
    sources: [
      "https://help.openai.com/en/articles/20001371-evolving-atlas-into-chatgpt-for-browser-based-agentic-work",
      "https://techcrunch.com/2026/07/09/openai-is-shutting-down-atlas-but-its-ai-browser-ambitions-are-still-growing/",
      "https://www.digitaltrends.com/computing/chatgpt-atlas-is-shutting-down-and-it-has-some-homework-left-before-you-migrate/"
    ]
  },
  "Dia": {
    capabilities: {
      freePlan: { level: "full", note: "기본 AI 사용량 포함" },
      koreanSupport: { level: "none", note: "영어 중심, 한국어 미지원" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "partial", note: "Skills 단축 작업 중심" },
      apiIntegrations: { level: "partial", note: "Chromium 확장 프로그램" },
      teamAdmin: { level: "none", note: "팀/기업 플랜 없음" },
      dataExport: { level: "partial", note: "브라우저 데이터 내보내기" },
      ssoSecurity: { level: "none" },
      mobileApp: { level: "none", note: "모바일 앱 개발 중" },
      offlineLocal: { level: "partial", note: "일반 브라우징은 캐시로 가능" }
    },
    roles: ["research", "marketing"],
    teamFit: ["solo", "small"],
    sources: [
      "https://www.diabrowser.com/",
      "https://efficient.app/apps/dia",
      "https://piunikaweb.com/2026/07/30/dia-windows-slated-officially-launch-fall-2026/"
    ]
  },
  "Manus": {
    capabilities: {
      freePlan: { level: "partial", note: "일 300 크레딧으로 제한" },
      koreanSupport: { level: "full" },
      aiAssistant: { level: "full" },
      agentAutomation: { level: "full", note: "완전 자율 실행 AI 에이전트" },
      apiIntegrations: { level: "partial", note: "제한적 공개 API" },
      teamAdmin: { level: "full", note: "Team/Enterprise SSO" },
      dataExport: { level: "full", note: "생성 파일/보고서 다운로드" },
      ssoSecurity: { level: "full", note: "Team/Enterprise 플랜" },
      mobileApp: { level: "full", note: "iOS/Android" },
      offlineLocal: { level: "none", note: "클라우드 실행 전용" }
    },
    roles: ["research", "ops", "engineering", "marketing"],
    teamFit: ["solo", "small", "mid", "large"],
    sources: [
      "https://manus.im/ko",
      "https://www.nocode.mba/articles/manus-ai-pricing",
      "https://play.google.com/store/apps/details?id=tech.butterfly.app"
    ]
  }
};
