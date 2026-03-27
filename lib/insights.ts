import type { Tool } from "@/lib/types";

export type ScoreBreakdown = {
  functionality: number;
  uiux: number;
  reliability: number;
  comfort: number;
  pricing: number;
};

export type CapabilityComparison = {
  competitor: string;
  worksBetterHere: string;
  weakerHere: string;
};

export type PatchNote = {
  date: string;
  title: string;
  change: string;
  errorRisk: string;
  impact?: "high" | "medium" | "low";
  isOutage?: boolean;
};

export type WorkPlaybook = {
  title: string;
  howToUse: string;
  recommendation: string;
};

export type FeatureStatus = "supported" | "partial" | "unsupported";

export type FeatureCheckItem = {
  name: string;
  status: FeatureStatus;
  note?: string;
};

export type FeatureChecklist = {
  coreFeatures: FeatureCheckItem[];
  limitations: FeatureCheckItem[];
};

export type ToolMeta = {
  teamSize: "1-10" | "10-100" | "100+" | "any";
  workType: "engineering" | "design" | "marketing" | "operations" | "sales" | "any";
  onboardingDifficulty: "easy" | "medium" | "hard";
  shortDiff: string;
};

export type ToolInsight = {
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  oneLine: string;
  comparisons: CapabilityComparison[];
  patchNotes: PatchNote[];
  workPlaybook: WorkPlaybook[];
  featureChecklist: FeatureChecklist;
};

// --- Feature Checklists ---

const featureChecklists: Record<string, FeatureChecklist> = {
  "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a": { // Notion
    coreFeatures: [
      { name: "문서·위키 편집", status: "supported" },
      { name: "데이터베이스 (표·칸반·갤러리)", status: "supported" },
      { name: "팀 협업 & 코멘트", status: "supported" },
      { name: "다양한 블록 임베드", status: "supported" },
      { name: "페이지 권한 관리", status: "partial", note: "세부 역할 제어 제한" }
    ],
    limitations: [
      { name: "실시간 공동편집 속도", status: "partial", note: "동시편집 시 렉 발생 가능" },
      { name: "복잡한 자동화", status: "unsupported", note: "Zapier 연동 필요" },
      { name: "대용량 데이터 처리", status: "unsupported", note: "수만 행 이상 느려짐" },
      { name: "오프라인 모드", status: "partial", note: "읽기만 가능, 편집 제한" }
    ]
  },
  "55d7ad1a-4c1c-4e58-a2d6-40a00d092e2a": { // Figma
    coreFeatures: [
      { name: "벡터 디자인", status: "supported" },
      { name: "실시간 협업 & 커서 공유", status: "supported" },
      { name: "인터랙티브 프로토타이핑", status: "supported" },
      { name: "컴포넌트 & 디자인 시스템", status: "supported" }
    ],
    limitations: [
      { name: "복잡한 애니메이션", status: "partial", note: "After Effects 수준 불가" },
      { name: "코드 익스포트 정밀도", status: "partial", note: "CSS 변환 시 수동 조정 필요" },
      { name: "오프라인 작업", status: "unsupported", note: "인터넷 연결 필수" },
      { name: "3D 디자인", status: "unsupported" }
    ]
  },
  "ef6b79b4-7c1e-4df0-95f1-9011f412e1cb": { // Slack
    coreFeatures: [
      { name: "채널 기반 메시징", status: "supported" },
      { name: "앱 통합 (2,000+ 연동)", status: "supported" },
      { name: "파일 공유 & 검색", status: "supported" },
      { name: "허들 음성/영상 통화", status: "supported" }
    ],
    limitations: [
      { name: "비동기 집중 지원", status: "partial", note: "알림 과다 시 몰입 방해" },
      { name: "스레드 정리·요약", status: "partial", note: "긴 스레드 파악 어려움" },
      { name: "무료 플랜 메시지 이력", status: "unsupported", note: "90일 제한" }
    ]
  },
  "f33e7f82-0d1c-4f57-9c5f-9a8e8e251e88": { // Linear
    coreFeatures: [
      { name: "이슈 트래킹", status: "supported" },
      { name: "스프린트·사이클 관리", status: "supported" },
      { name: "로드맵 뷰", status: "supported" },
      { name: "빠른 키보드 단축키", status: "supported" }
    ],
    limitations: [
      { name: "복잡한 종속성 관리", status: "partial", note: "대형 프로젝트엔 Jira 수준 필요" },
      { name: "비개발팀 적합성", status: "partial", note: "UI가 엔지니어 중심" },
      { name: "고급 보고서·대시보드", status: "unsupported", note: "별도 BI 도구 필요" }
    ]
  },
  "58dc3f0a-6e9d-4f21-a7c5-2e2186a42e8f": { // Airtable
    coreFeatures: [
      { name: "구조화된 데이터베이스·뷰", status: "supported" },
      { name: "다양한 뷰 (그리드·칸반·갤러리)", status: "supported" },
      { name: "자동화 & 스크립트", status: "supported" },
      { name: "폼 기반 데이터 수집", status: "supported" }
    ],
    limitations: [
      { name: "대용량 데이터 처리", status: "partial", note: "수십만 행 이상 느려짐" },
      { name: "고급 SQL 쿼리", status: "unsupported", note: "복잡한 조인 불가" },
      { name: "복잡한 계산·수식", status: "partial", note: "엑셀 대비 제한적" }
    ]
  },
  "a1aa1f1d-67f8-4dbd-aec0-2ed51b932d0a": { // Miro
    coreFeatures: [
      { name: "실시간 협업 화이트보드", status: "supported" },
      { name: "스티키 노트·다이어그램", status: "supported" },
      { name: "워크숍 템플릿 (200+)", status: "supported" },
      { name: "비디오 & 화면 공유 연동", status: "supported" }
    ],
    limitations: [
      { name: "텍스트 콘텐츠 검색", status: "partial", note: "노트 내 텍스트 검색 불완전" },
      { name: "대형 보드 성능", status: "partial", note: "요소 많을 시 느려짐" },
      { name: "오프라인 사용", status: "unsupported" }
    ]
  },
  "b559d3ef-7c52-4ed0-9e84-2f5b1a9775b4": { // Zapier
    coreFeatures: [
      { name: "앱 자동화 연결 (6,000+)", status: "supported" },
      { name: "멀티스텝 워크플로우", status: "supported" },
      { name: "필터·조건 분기", status: "supported" },
      { name: "웹훅 지원", status: "supported" }
    ],
    limitations: [
      { name: "복잡한 데이터 변환", status: "partial", note: "Make 대비 코드 제어 제한" },
      { name: "오류 자동 복구", status: "partial", note: "실패 시 수동 확인 필요" },
      { name: "대용량 데이터 배치 처리", status: "unsupported", note: "행 한도 제한 있음" }
    ]
  },
  "6b6f9d15-0a05-4c34-8a6b-4d6b5a6ae7ea": { // Jasper
    coreFeatures: [
      { name: "AI 초안 생성 (마케팅 특화)", status: "supported" },
      { name: "브랜드 보이스 설정", status: "supported" },
      { name: "다국어 콘텐츠 생성", status: "supported" },
      { name: "콘텐츠 템플릿", status: "supported" }
    ],
    limitations: [
      { name: "사실 정확도", status: "partial", note: "환각 발생 가능, 검수 필수" },
      { name: "독창적 창의성", status: "partial", note: "인간 편집자 마무리 필요" },
      { name: "코드 생성", status: "unsupported" },
      { name: "이미지 생성 (기본 제공)", status: "unsupported", note: "별도 플러그인 필요" }
    ]
  },
  "d07d34fb-2cd2-4fcb-95dd-e1fceaa52d27": { // Gong
    coreFeatures: [
      { name: "영업 통화 녹음·전사", status: "supported" },
      { name: "AI 대화 요약·인사이트", status: "supported" },
      { name: "딜 인텔리전스", status: "supported" },
      { name: "코칭 피드백 루프", status: "supported" }
    ],
    limitations: [
      { name: "CRM 완전 대체", status: "unsupported", note: "Salesforce 등과 병행 필요" },
      { name: "개인정보 규정 대응", status: "partial", note: "녹음 동의 절차 별도 운영" },
      { name: "소규모팀 ROI", status: "partial", note: "팀 10명 미만엔 과비용" }
    ]
  },
  "e357c35d-bfd4-4c14-aad0-9910de98837f": { // Replit
    coreFeatures: [
      { name: "브라우저 기반 코딩 환경", status: "supported" },
      { name: "즉시 실행·공유", status: "supported" },
      { name: "AI 코파일럿", status: "supported" },
      { name: "실시간 협업 코딩", status: "supported" }
    ],
    limitations: [
      { name: "복잡한 대형 프로젝트", status: "partial", note: "로컬 IDE 대비 성능 제한" },
      { name: "프로덕션 배포 안정성", status: "partial", note: "엔터프라이즈급 SLA 미지원" },
      { name: "고성능 연산·GPU", status: "unsupported" }
    ]
  }
};

// --- Tool Meta (검색 필터용) ---

const toolMetaMap: Record<string, ToolMeta> = {
  "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a": {
    teamSize: "any", workType: "operations", onboardingDifficulty: "medium",
    shortDiff: "스프레드시트보다 맥락 풍부, 단순 할일 관리보다 무거움"
  },
  "55d7ad1a-4c1c-4e58-a2d6-40a00d092e2a": {
    teamSize: "any", workType: "design", onboardingDifficulty: "medium",
    shortDiff: "Adobe XD보다 협업에 강하고, Sketch보다 빠른 피드백 루프"
  },
  "ef6b79b4-7c1e-4df0-95f1-9011f412e1cb": {
    teamSize: "any", workType: "any", onboardingDifficulty: "easy",
    shortDiff: "이메일보다 빠르고, 비동기 도구보다 실시간 우선"
  },
  "f33e7f82-0d1c-4f57-9c5f-9a8e8e251e88": {
    teamSize: "10-100", workType: "engineering", onboardingDifficulty: "easy",
    shortDiff: "Jira보다 빠르고 가볍고, Trello보다 제품 실행 중심"
  },
  "58dc3f0a-6e9d-4f21-a7c5-2e2186a42e8f": {
    teamSize: "any", workType: "operations", onboardingDifficulty: "medium",
    shortDiff: "스프레드시트보다 구조화됐고, 코드 없이 DB 수준 운영 가능"
  },
  "a1aa1f1d-67f8-4dbd-aec0-2ed51b932d0a": {
    teamSize: "any", workType: "design", onboardingDifficulty: "easy",
    shortDiff: "PPT보다 협업적이고, 물리 보드보다 원격 친화적"
  },
  "b559d3ef-7c52-4ed0-9e84-2f5b1a9775b4": {
    teamSize: "1-10", workType: "operations", onboardingDifficulty: "medium",
    shortDiff: "개발 없이 자동화, Make보다 빠른 시작이지만 제어는 적음"
  },
  "6b6f9d15-0a05-4c34-8a6b-4d6b5a6ae7ea": {
    teamSize: "1-100", workType: "marketing", onboardingDifficulty: "easy",
    shortDiff: "초안 속도는 빠르지만, 브랜드 색깔은 사람이 마무리 필요"
  },
  "d07d34fb-2cd2-4fcb-95dd-e1fceaa52d27": {
    teamSize: "10-100", workType: "sales", onboardingDifficulty: "hard",
    shortDiff: "영업 대화를 데이터로 전환, CRM 노트를 대체하는 실적 분석"
  },
  "e357c35d-bfd4-4c14-aad0-9910de98837f": {
    teamSize: "1-10", workType: "engineering", onboardingDifficulty: "easy",
    shortDiff: "환경 설치 없이 즉시 시작, 협업·학습 코딩에 특화"
  }
};

export const getToolMeta = (toolId: string): ToolMeta | undefined =>
  toolMetaMap[toolId];

// --- Score derivation ---

const overrides: Record<string, Partial<ToolInsight>> = {
  "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a": {
    oneLine: "팀의 작업 체계를 한 곳으로 통합할 때 강력하지만, 운영 원칙이 약하면 빠르게 복잡해집니다."
  },
  "ef6b79b4-7c1e-4df0-95f1-9011f412e1cb": {
    oneLine: "빠른 협업에는 강하지만, 비동기 원칙이 없으면 깊은 몰입을 해치기 쉽습니다."
  }
};

const clamp = (score: number) => Math.max(0, Math.min(100, score));

const deriveScoreBreakdown = (tool: Tool): ScoreBreakdown => ({
  functionality: clamp(tool.impact.executionDensity * 10 + 10),
  uiux: clamp(tool.impact.collaborationClarity * 10),
  reliability: clamp((10 - (tool.verdictBadges.lockinRisk ? 2 : 0)) * 8),
  comfort: clamp(tool.impact.thinkingDepth * 10),
  pricing: clamp(tool.verdictBadges.lockinRisk ? 55 : 72)
});

const deriveComparisons = (tool: Tool): CapabilityComparison[] => [
  {
    competitor: tool.alternatives[0] ?? "수작업 워크플로우",
    worksBetterHere: `${tool.name}는 "${tool.problemContexts[0] ?? "팀 운영"}" 같은 문제에서 맥락을 더 빠르게 모읍니다.`,
    weakerHere: `팀이 단순 체크리스트만 필요하다면 ${tool.name}는 다소 무겁게 느껴질 수 있습니다.`
  },
  {
    competitor: tool.alternatives[1] ?? "스프레드시트 + 문서",
    worksBetterHere: `${tool.name}는 이해관계자가 많을 때 단일 기준점(SSOT) 확보에 유리합니다.`,
    weakerHere: `더 단순한 조합 대비 ${tool.name}는 데이터 이식성이 떨어질 수 있습니다.`
  }
];

const derivePatchNotes = (tool: Tool): PatchNote[] => [
  {
    date: "2026-01-15",
    title: "워크스페이스 탐색 업데이트",
    change: "프로젝트 뷰와 저장 필터를 개선해 필요한 정보를 더 빠르게 찾을 수 있게 했습니다.",
    errorRisk: "기존 북마크 링크는 업데이트 전 화면을 열 수 있어 재저장이 필요할 수 있습니다.",
    impact: "medium",
    isOutage: false
  },
  {
    date: "2025-11-02",
    title: "권한 및 정책 변경",
    change: "감사 로그와 공유 경계 관리를 위한 관리자 제어 항목을 확장했습니다.",
    errorRisk: "권한 설정이 잘못되면 협업자가 핵심 페이지에 일시적으로 접근하지 못할 수 있습니다.",
    impact: "high",
    isOutage: true
  }
];

const deriveWorkPlaybook = (tool: Tool): WorkPlaybook[] => [
  {
    title: "주간 의사결정 리뷰",
    howToUse: `${tool.name}에 제품/운영/고객 대응 팀의 핵심 결정을 주간 로그로 모아 기록하세요.`,
    recommendation: "매주 금요일 의사결정 요약 담당자를 고정하면 맥락 단절을 크게 줄일 수 있습니다."
  },
  {
    title: "실행 계획 리듬",
    howToUse: `${tool.name}에 우선순위, 담당자, 블로커를 연결한 반복 계획 보드를 운영하세요.`,
    recommendation: "활성 항목을 15개 이하로 유지하고, 완료 항목은 빠르게 아카이브해야 선명도가 유지됩니다."
  }
];

const deriveFeatureChecklist = (toolId: string): FeatureChecklist =>
  featureChecklists[toolId] ?? { coreFeatures: [], limitations: [] };

export const getToolInsight = (tool: Tool): ToolInsight => {
  const scoreBreakdown = deriveScoreBreakdown(tool);
  const totalScore = Math.round(
    (scoreBreakdown.functionality +
      scoreBreakdown.uiux +
      scoreBreakdown.reliability +
      scoreBreakdown.comfort +
      scoreBreakdown.pricing) /
      5
  );

  return {
    totalScore,
    scoreBreakdown,
    oneLine: `${tool.name}는 팀의 실행 속도를 높이지만, 인지 과부하를 막기 위한 사용 원칙이 반드시 필요합니다.`,
    comparisons: deriveComparisons(tool),
    patchNotes: derivePatchNotes(tool),
    workPlaybook: deriveWorkPlaybook(tool),
    featureChecklist: deriveFeatureChecklist(tool.id),
    ...overrides[tool.id]
  };
};
