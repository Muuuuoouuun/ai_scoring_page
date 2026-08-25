import type { ProblemTag } from "@/lib/types";

/**
 * 문제 상황 태그.
 *
 * 이전에는 도구마다 자유 문장으로 문제 상황을 적었고, 30개 문장이 전부 유니크해서
 * 2개 이상 도구가 공유하는 문제가 하나도 없었습니다. 그래서 문제로 검색하면
 * 항상 도구 1개만 나왔고, "후보를 놓고 고른다"는 이 제품의 핵심 동선이
 * 구조적으로 불가능했습니다.
 *
 * 이제 태그는 공유되며, 모든 태그가 3개 이상의 도구에 걸립니다(tests에서 강제).
 * id는 언어와 무관한 안정 식별자라 영어 화면에서도 같은 결과가 나옵니다.
 */
export const problemTags: ProblemTag[] = [
  {
    id: "info-scattered",
    ko: "필요한 자료가 흩어져 찾는 데 시간을 쓴다",
    en: "Finding what we need takes too long",
    description: "같은 정보가 문서·시트·대화에 나뉘어 있어, 일을 시작하기 전에 자료 수집부터 해야 하는 상황."
  },
  {
    id: "meetings-without-decisions",
    ko: "회의는 계속 하는데 결정이 남지 않는다",
    en: "We meet a lot but decisions don't stick",
    description: "논의는 활발한데 무엇을 왜 그렇게 정했는지 2주 뒤에 아무도 설명하지 못하는 상황."
  },
  {
    id: "slow-feedback-loop",
    ko: "피드백 한 바퀴 도는 데 며칠이 걸린다",
    en: "One round of feedback takes days",
    description: "보여줄 것을 만드는 단계와 의견을 받는 단계가 매번 막혀서 반복 주기가 늘어지는 상황."
  },
  {
    id: "fragmented-focus",
    ko: "알림과 끼어들기로 하루가 조각난다",
    en: "Notifications chop the day into pieces",
    description: "응답과 확인에 하루가 다 쓰여, 두 시간 이상 이어서 몰입할 블록이 남지 않는 상황."
  },
  {
    id: "manual-repetition",
    ko: "같은 일을 사람이 매번 손으로 반복한다",
    en: "The same work is redone by hand every time",
    description: "복붙, 재입력, 수작업 인수인계가 주 단위로 반복되면서 실수와 지연이 함께 쌓이는 상황."
  },
  {
    id: "no-eng-resource",
    ko: "개발 리소스를 기다리느라 일이 멈춘다",
    en: "Work stalls waiting for engineering",
    description: "필요한 건 작은 도구인데 개발 우선순위에서 계속 밀려 몇 주씩 대기하는 상황."
  },
  {
    id: "unclear-priority",
    ko: "지금 뭐부터 해야 할지 매번 흐려진다",
    en: "What to do first keeps getting blurry",
    description: "할 일 목록은 있는데 이번 주에 실제로 손댈 것이 무엇인지 사람마다 다르게 아는 상황."
  },
  {
    id: "slow-onboarding",
    ko: "새로 온 사람이 스스로 따라잡지 못한다",
    en: "New joiners can't catch up on their own",
    description: "신규 입사자가 매번 사람을 붙잡고 물어야 해서, 받는 쪽과 주는 쪽 시간이 같이 나가는 상황."
  },
  {
    id: "uneven-output-quality",
    ko: "사람마다 결과물 편차가 너무 크다",
    en: "Output quality swings by person",
    description: "같은 일을 누가 하느냐에 따라 결과 수준이 달라지는데, 기준을 말로만 공유하고 있는 상황."
  },
  {
    id: "gut-feel-decisions",
    ko: "판단이 감과 경험담에 의존한다",
    en: "Decisions rest on gut feel and anecdotes",
    description: "근거로 쓸 기록이 남지 않아, 목소리 큰 사람의 인상이 결론이 되는 상황."
  },
  {
    id: "cross-role-misalignment",
    ko: "직군마다 서로 다른 그림을 보고 있다",
    en: "Each role is looking at a different picture",
    description: "기획·디자인·개발·영업이 같은 단어를 쓰면서 다른 것을 떠올려, 뒤늦게 되돌리는 상황."
  },
  {
    id: "validate-before-building",
    ko: "만들기 전에 되는 아이디어인지 확인하고 싶다",
    en: "We want proof it works before building it",
    description: "확신 없이 개발을 시작했다가 몇 주를 버린 경험이 있어, 착수 전 검증 수단이 필요한 상황."
  }
];

export const problemTagMap = new Map(problemTags.map((tag) => [tag.id, tag]));
