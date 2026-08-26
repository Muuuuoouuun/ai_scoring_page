import type { Tool } from "@/lib/types";
import { reviews } from "@/data/reviews";
import { problemAngles } from "@/data/problem-angles";

/** 도구의 기본 사실. 리뷰 본문은 data/reviews.ts에서 id로 붙입니다. */
const toolFacts: Omit<Tool, "review">[] = [
  {
    id: "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a",
    name: "Notion",
    description: "문서, 업무, 가벼운 데이터베이스를 통합하는 모듈형 워크스페이스입니다.",
    problemTagIds: [
      "info-scattered",
      "meetings-without-decisions",
      "unclear-priority",
      "slow-onboarding"
    ],
    whyExist: "공유 폴더만으로는 한계가 생기면서, 노트와 업무, 지식을 함께 관리하는 운영 시스템이 필요해졌습니다.",
    bestCase: "우선순위와 의사결정 이력이 투명하게 보이는 공통 작업 맥락을 빠르게 만들 수 있습니다.",
    worstCase: "문서는 많아지지만 결론이 쌓이지 않는 거대한 위키로 변질될 수 있습니다.",
    verdictBadges: {
      timeSaver: true,
      thinkCarefully: true,
      lockinRisk: true
    },
    alternatives: ["Linear + Google Docs", "Plain markdown + Git"],
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z"
  },
  {
    id: "55d7ad1a-4c1c-4e58-a2d6-40a00d092e2a",
    name: "Figma",
    description: "디자인 협업과 프로토타이핑을 위한 협업 플랫폼입니다.",
    problemTagIds: [
      "meetings-without-decisions",
      "slow-feedback-loop",
      "cross-role-misalignment",
      "validate-before-building"
    ],
    whyExist: "디자인 작업이 개인 PC에 고립되지 않고, 팀 단위 협업 프로세스로 돌아가야 했기 때문입니다.",
    bestCase: "디자인을 공통 대화로 바꿔 제품, 개발, 리더십 간 해석 차이를 크게 줄일 수 있습니다.",
    worstCase: "소유권 없는 피드백이 과도하게 쌓이면 의사결정이 댓글 뒤에 묻힐 수 있습니다.",
    verdictBadges: {
      timeSaver: true,
      thinkCarefully: false,
      lockinRisk: true
    },
    alternatives: ["Pen + paper workshops", "Adobe XD"],
    createdAt: "2024-02-02T10:00:00Z",
    updatedAt: "2024-02-02T10:00:00Z"
  },
  {
    id: "ef6b79b4-7c1e-4df0-95f1-9011f412e1cb",
    name: "Slack",
    description: "실시간 팀 커뮤니케이션 허브입니다.",
    problemTagIds: [
      "info-scattered",
      "meetings-without-decisions",
      "fragmented-focus",
      "slow-onboarding"
    ],
    whyExist: "이메일만으로는 속도를 따라가기 어려워, 빠른 조율과 맥락 공유를 위한 실시간 공간이 필요해졌습니다.",
    bestCase: "신호를 눈에 보이게 유지해 대기 시간을 줄이고 정렬 속도를 높일 수 있습니다.",
    worstCase: "알림 중심 흐름이 과해지면 깊은 사고와 몰입 업무를 방해할 수 있습니다.",
    verdictBadges: {
      timeSaver: true,
      thinkCarefully: true,
      lockinRisk: true
    },
    alternatives: ["Twist", "Async standups + email"],
    createdAt: "2024-02-03T10:00:00Z",
    updatedAt: "2024-02-03T10:00:00Z"
  },
  {
    id: "f33e7f82-0d1c-4f57-9c5f-9a8e8e251e88",
    name: "Linear",
    description: "빠른 제품 팀을 위한 이슈 트래킹 도구입니다.",
    problemTagIds: [
      "fragmented-focus",
      "unclear-priority",
      "uneven-output-quality",
      "gut-feel-decisions"
    ],
    whyExist: "기존 티켓 시스템이 현대 팀의 속도를 따라가지 못하면서, 선명한 실행 관리가 경쟁력이 되었기 때문입니다.",
    bestCase: "무엇을 왜 출시하는지 모두가 같은 기준으로 볼 수 있는 선명한 실행 체계를 만듭니다.",
    worstCase: "처리량은 늘어나지만 제품의 본질적 불확실성을 가리는 방향으로 흐를 수 있습니다.",
    verdictBadges: {
      timeSaver: true,
      thinkCarefully: false,
      lockinRisk: false
    },
    alternatives: ["Trello", "Shortcut"],
    createdAt: "2024-02-04T10:00:00Z",
    updatedAt: "2024-02-04T10:00:00Z"
  },
  {
    id: "58dc3f0a-6e9d-4f21-a7c5-2e2186a42e8f",
    name: "Airtable",
    description: "운영 데이터와 지식 관리를 위한 유연한 데이터베이스-스프레드시트 하이브리드입니다.",
    problemTagIds: [
      "info-scattered",
      "manual-repetition",
      "no-eng-resource",
      "gut-feel-decisions"
    ],
    whyExist: "엔지니어링 리소스 없이도 데이터베이스 수준의 구조를 쓰고 싶어하는 팀 수요가 커졌기 때문입니다.",
    bestCase: "비개발자도 빠르게 구조화된 워크플로우를 만들고 운영할 수 있습니다.",
    worstCase: "통제가 없는 상태로 확장되면 취약한 패치워크가 되어 유지보수가 어려워집니다.",
    verdictBadges: {
      timeSaver: true,
      thinkCarefully: true,
      lockinRisk: true
    },
    alternatives: ["Google Sheets + AppScript", "Retool"],
    createdAt: "2024-02-05T10:00:00Z",
    updatedAt: "2024-02-05T10:00:00Z"
  },
  {
    id: "a1aa1f1d-67f8-4dbd-aec0-2ed51b932d0a",
    name: "Miro",
    description: "워크숍과 아이데이션을 위한 협업 화이트보드입니다.",
    problemTagIds: [
      "meetings-without-decisions",
      "unclear-priority",
      "cross-role-misalignment",
      "validate-before-building"
    ],
    whyExist: "원격 팀이 실시간으로 시각 사고를 공유하고 공동 제작할 수 있는 공간이 필요했기 때문입니다.",
    bestCase: "추상적인 논의를 시각화해 실행 전에 정렬 품질을 높일 수 있습니다.",
    worstCase: "결론 없이 스티키 노트만 늘어나는 회의 보드가 될 위험이 있습니다.",
    verdictBadges: {
      timeSaver: false,
      thinkCarefully: true,
      lockinRisk: false
    },
    alternatives: ["Physical workshops", "FigJam"],
    createdAt: "2024-02-06T10:00:00Z",
    updatedAt: "2024-02-06T10:00:00Z"
  },
  {
    id: "b559d3ef-7c52-4ed0-9e84-2f5b1a9775b4",
    name: "Zapier",
    description: "코드 없이 여러 앱을 연결해 자동화하는 플랫폼입니다.",
    problemTagIds: [
      "fragmented-focus",
      "manual-repetition",
      "no-eng-resource"
    ],
    whyExist: "개발자 대기열을 기다리지 않고도 현업이 직접 자동화를 구축할 필요가 커졌기 때문입니다.",
    bestCase: "저부가가치 업무를 줄여 병목 없이 운영 흐름을 유지할 수 있습니다.",
    worstCase: "소유권 없는 자동화 체인이 늘어나면 장애 시 복구가 어려워질 수 있습니다.",
    verdictBadges: {
      timeSaver: true,
      thinkCarefully: true,
      lockinRisk: true
    },
    alternatives: ["Make", "n8n"],
    createdAt: "2024-02-07T10:00:00Z",
    updatedAt: "2024-02-07T10:00:00Z"
  },
  {
    id: "6b6f9d15-0a05-4c34-8a6b-4d6b5a6ae7ea",
    name: "Jasper",
    description: "마케팅/콘텐츠 팀을 위한 AI 글쓰기 보조 도구입니다.",
    problemTagIds: [
      "slow-feedback-loop",
      "manual-repetition",
      "uneven-output-quality"
    ],
    whyExist: "마케팅 팀이 속도를 유지하면서도 더 많은 콘텐츠를 생산해야 했기 때문입니다.",
    bestCase: "초안 작성 시간을 줄여 사람이 전략적 편집과 메시지 완성도에 집중할 수 있습니다.",
    worstCase: "표준화된 문구가 늘어나 브랜드의 미묘한 톤이 약해질 수 있습니다.",
    verdictBadges: {
      timeSaver: true,
      thinkCarefully: true,
      lockinRisk: false
    },
    alternatives: ["Human editorial sprints", "Grammarly"],
    createdAt: "2024-02-08T10:00:00Z",
    updatedAt: "2024-02-08T10:00:00Z"
  },
  {
    id: "d07d34fb-2cd2-4fcb-95dd-e1fceaa52d27",
    name: "Gong",
    description: "영업 대화 분석 기반의 수익 인텔리전스 플랫폼입니다.",
    problemTagIds: [
      "slow-onboarding",
      "uneven-output-quality",
      "gut-feel-decisions",
      "cross-role-misalignment"
    ],
    whyExist: "CRM 메모만으로는 한계가 있어, 데이터 기반 코칭과 영업 대화 가시성이 필요했기 때문입니다.",
    bestCase: "정성적 대화를 코칭 신호로 전환해 딜 성과 개선에 직접 기여할 수 있습니다.",
    worstCase: "감시받는 느낌이 강해지면 팀 신뢰와 진정성이 훼손될 수 있습니다.",
    verdictBadges: {
      timeSaver: false,
      thinkCarefully: true,
      lockinRisk: true
    },
    alternatives: ["Manual call reviews", "Chorus"],
    createdAt: "2024-02-09T10:00:00Z",
    updatedAt: "2024-02-09T10:00:00Z"
  },
  {
    id: "e357c35d-bfd4-4c14-aad0-9910de98837f",
    name: "Replit",
    description: "AI 코파일럿을 포함한 브라우저 기반 개발 환경입니다.",
    problemTagIds: [
      "slow-feedback-loop",
      "no-eng-resource",
      "slow-onboarding",
      "validate-before-building"
    ],
    whyExist: "환경 설정 부담 없이 즉시 개발을 시작하고, AI 보조를 함께 활용하려는 요구가 커졌기 때문입니다.",
    bestCase: "개발 환경 준비 시간을 줄여 아이디어를 수분 내 검증할 수 있습니다.",
    worstCase: "기반 아키텍처 이해 없이 데모 중심 개발로 흐를 위험이 있습니다.",
    verdictBadges: {
      timeSaver: true,
      thinkCarefully: true,
      lockinRisk: false
    },
    alternatives: ["Local dev environments", "GitHub Codespaces"],
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-02-10T10:00:00Z"
  }
];

/**
 * 리뷰가 없는 도구는 화면에 올리지 않습니다.
 * 조용히 빈 값으로 넘어가면 예전처럼 "내용 없는 리뷰"가 다시 생기므로 빌드 시점에 실패시킵니다.
 */
export const tools: Tool[] = toolFacts.map((fact) => {
  const review = reviews[fact.id];
  if (!review) {
    throw new Error(
      `[data/tools] "${fact.name}"(${fact.id})의 리뷰가 없습니다. data/reviews.ts에 먼저 작성하세요.`
    );
  }
  return { ...fact, review };
});
