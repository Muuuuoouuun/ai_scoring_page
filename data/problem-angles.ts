import type { ToolProblemAngle } from "@/lib/types";

/**
 * 도구 × 문제 태그별 "이 문제에서 되는 것 / 안 되는 것".
 *
 * 검색 결과 카드에 그대로 노출됩니다. 상세 페이지에 들어가지 않아도
 * 후보를 좁힐 수 있게 하는 것이 목적입니다.
 * 도구마다, 태그마다 문장이 전부 다릅니다.
 */
export const problemAngles: Record<string, ToolProblemAngle[]> = {
  // Notion
  "d41f50a2-3b7c-4f7e-8c73-1b8d0b0fe21a": [
    {
      tagId: "info-scattered",
      angle: "문서·회의록·가벼운 DB가 한 링크 체계로 묶여 출처가 하나로 정리된다.",
      limitation: "페이지가 수백 개를 넘으면 검색으로만 접근하게 되고, 다시 못 찾는 문서가 쌓인다."
    },
    {
      tagId: "meetings-without-decisions",
      angle: "회의록에서 배경 문서와 실행 항목까지 클릭 한 번으로 이어 붙일 수 있다.",
      limitation: "결정 페이지를 관리할 사람이 없으면 회의록만 쌓이는 거대한 위키로 굳는다."
    },
    {
      tagId: "unclear-priority",
      angle: "프로젝트 DB에 담당·기한과 배경 문서를 함께 두고 순서를 정할 수 있다.",
      limitation: "상태 관리 규율이 약해, 스프린트를 굴리면 며칠 만에 우선순위가 느슨해진다."
    },
    {
      tagId: "slow-onboarding",
      angle: "핸드북과 실제 업무 페이지가 같은 공간에 있어 신입이 맥락째 읽어 나간다.",
      limitation: "정리 담당이 없으면 신입이 최신 문서와 폐기된 문서를 구분하지 못한다."
    }
  ],
  // Figma
  "55d7ad1a-4c1c-4e58-a2d6-40a00d092e2a": [
    {
      tagId: "meetings-without-decisions",
      angle: "화면을 같이 보며 '결정 요청'과 '참고 의견'을 코멘트에서 분리해 남길 수 있다.",
      limitation: "소유자 없는 코멘트가 쌓이면 결정이 스레드 뒤로 묻히고 아무도 닫지 않는다."
    },
    {
      tagId: "slow-feedback-loop",
      angle: "설치 없이 링크만으로 리뷰가 돌고 파일 버전이 하나로 유지된다.",
      limitation: "리뷰 대상이 계속 살아 움직여서, 페이지를 잠그지 않으면 스펙 불일치가 생긴다."
    },
    {
      tagId: "cross-role-misalignment",
      angle: "기획·개발·리더십이 같은 화면을 근거로 말해 해석 차이가 눈에 띄게 줄어든다.",
      limitation: "열람용·개발자 시트가 나뉘어, 볼 사람을 다 넣으면 비용이 가파르게 오른다."
    },
    {
      tagId: "validate-before-building",
      angle: "클릭되는 프로토타입으로 개발 착수 전에 흐름의 빈틈을 먼저 확인한다.",
      limitation: "격자와 정렬이 먼저 걸려서, 방향을 흔드는 초기 발산에는 오히려 답답하다."
    }
  ],
  // Slack
  "ef6b79b4-7c1e-4df0-95f1-9011f412e1cb": [
    {
      tagId: "info-scattered",
      angle: "대화가 채널에 남아 검색되고, 늦게 합류해도 스스로 맥락을 따라잡는다.",
      limitation: "무료 플랜은 90일 이전 대화가 보이지 않아 아카이브로는 신뢰할 수 없다."
    },
    {
      tagId: "meetings-without-decisions",
      angle: "결정이 필요한 순간에 관련자를 즉시 불러 그 자리에서 닫을 수 있다.",
      limitation: "결론이 스레드 안에 흩어져, 문서로 옮기지 않으면 사실상 사라진 것과 같다."
    },
    {
      tagId: "fragmented-focus",
      angle: "분 단위 조율이 되기 때문에 정기 회의 하나를 통째로 없앨 수 있다.",
      limitation: "기본 설정 그대로 쓰면 알림이 몰입 시간을 구조적으로 잠식한다. 쾌적도 40점의 이유다."
    },
    {
      tagId: "slow-onboarding",
      angle: "지난 논의를 읽으며 신입이 팀의 판단 기준과 말투까지 같이 익힌다.",
      limitation: "채널이 통제 없이 늘면 신입은 '어디를 봐야 하는지'부터 다시 물어야 한다."
    }
  ],
  // Linear
  "f33e7f82-0d1c-4f57-9c5f-9a8e8e251e88": [
    {
      tagId: "fragmented-focus",
      angle: "화면이 '이번 사이클에 볼 것'만 남겨, 백로그가 커져도 시야가 흐려지지 않는다.",
      limitation: "끼어들기 자체를 막지는 못한다. 알림이 실제로 오는 곳은 대개 다른 도구다."
    },
    {
      tagId: "unclear-priority",
      angle: "사이클과 우선순위가 제품에 내장돼 이번 주에 손댈 것이 강제로 좁혀진다.",
      limitation: "제품팀 리듬에 맞춰 좁게 설계돼, 여러 팀 로드맵을 위에서 굴리기엔 답답하다."
    },
    {
      tagId: "uneven-output-quality",
      angle: "등록 마찰이 거의 0이라 완료 기준을 제목에 적어두는 습관이 붙는다.",
      limitation: "제목·설명 품질을 강제하는 장치는 없어, 규칙을 안 정하면 한 줄 이슈가 늘어난다."
    },
    {
      tagId: "gut-feel-decisions",
      angle: "사이클별 처리량과 지연이 그대로 쌓여, 일정 추정이 데이터 위에서 이뤄진다.",
      limitation: "쌓이는 건 실행 데이터뿐이다. 왜 그걸 만드는지에 대한 근거는 여전히 밖에 있다."
    }
  ],
  // Airtable
  "58dc3f0a-6e9d-4f21-a7c5-2e2186a42e8f": [
    {
      tagId: "info-scattered",
      angle: "부서마다 흩어진 스프레드시트를 관계형 테이블 하나로 합쳐 원장을 만든다.",
      limitation: "뷰와 필터가 늘면 어떤 뷰가 진실인지 헷갈려, 팀마다 다른 숫자를 말하게 된다."
    },
    {
      tagId: "manual-repetition",
      angle: "폼으로 입력을 받고 자동화로 상태를 바꿔 취합·복붙 단계를 통째로 없앤다.",
      limitation: "자동화가 조용히 실패하는 경우가 있어, 모니터링을 안 걸면 며칠 뒤에 알게 된다."
    },
    {
      tagId: "no-eng-resource",
      angle: "현업이 며칠 만에 내부 운영 도구를 세우고, 요구가 바뀌면 직접 고친다.",
      limitation: "레코드·시트 기준 과금이라, 정착에 성공할수록 비용이 기능보다 빠르게 오른다."
    },
    {
      tagId: "gut-feel-decisions",
      angle: "운영 기록이 구조화된 데이터로 남아, 월말에 세는 대신 뷰로 바로 확인한다.",
      limitation: "레코드가 수만 건대로 가면 뷰 전환이 느려져 분석 용도로는 한계가 온다."
    }
  ],
  // Miro
  "a1aa1f1d-67f8-4dbd-aec0-2ed51b932d0a": [
    {
      tagId: "meetings-without-decisions",
      angle: "보드 우측에 '오늘의 결정' 프레임을 비워두면 진행자가 수렴을 강제하게 된다.",
      limitation: "수렴을 강제하는 기능은 제품에 없다. 결론 칸을 안 만들면 스티키 노트만 남는다."
    },
    {
      tagId: "unclear-priority",
      angle: "임팩트·노력 매트릭스로 후보를 늘어놓고 순서를 눈앞에서 합의한다.",
      limitation: "합의한 순서를 지키게 하는 장치가 없어, 24시간 안에 옮기지 않으면 무효가 된다."
    },
    {
      tagId: "cross-role-misalignment",
      angle: "말로 어긋나던 전략을 한 캔버스에 그려, 직군별 해석 차이가 그 자리에서 드러난다.",
      limitation: "보드가 커지면 위치 파악이 어려워, 지난 워크숍의 합의를 다시 찾는 비용이 크다."
    },
    {
      tagId: "validate-before-building",
      angle: "손으로 그린 흐름만으로 아이디어의 빈틈을 워크숍 한 번에 확인한다.",
      limitation: "돌아가는 산출물은 나오지 않는다. 검증 결과는 참석자들의 합의 수준까지가 한계다."
    }
  ],
  // Zapier
  "b559d3ef-7c52-4ed0-9e84-2f5b1a9775b4": [
    {
      tagId: "fragmented-focus",
      angle: "사람이 손대야만 넘어가던 인수인계를 없애 하루를 끊는 요청 자체를 줄인다.",
      limitation: "실패 알림을 안 걸면, 조용히 멈춘 자동화가 나중에 더 큰 끼어들기로 돌아온다."
    },
    {
      tagId: "manual-repetition",
      angle: "웬만한 SaaS 조합이 코드 없이 붙어 반복 입력을 며칠 만에 걷어낸다.",
      limitation: "실행 건수 과금이라 반복이 많을수록 비싸진다. 자체 구현이 더 싼 지점이 온다."
    },
    {
      tagId: "no-eng-resource",
      angle: "개발 대기열을 건너뛰고 현업이 직접 연결을 만들어 운영을 굴린다.",
      limitation: "분기가 3개를 넘으면 아무도 로직을 설명 못 하는 상태가 되고 이관도 어려워진다."
    }
  ],
  // Jasper
  "6b6f9d15-0a05-4c34-8a6b-4d6b5a6ae7ea": [
    {
      tagId: "slow-feedback-loop",
      angle: "빈 화면에서 초안이 당일에 나와, 리뷰 라운드를 며칠 앞당길 수 있다.",
      limitation: "브랜드 톤에 맞추는 재작업이 길어지면 앞당긴 시간을 그대로 되돌려주기도 한다."
    },
    {
      tagId: "manual-repetition",
      angle: "템플릿과 캠페인 단위 관리로 매번 처음부터 쓰던 반복 문구를 찍어낸다.",
      limitation: "글쓰기 품질 자체의 우위는 범용 AI 대비 뚜렷하지 않아, 몇 배의 차액을 정당화하기 어렵다."
    },
    {
      tagId: "uneven-output-quality",
      angle: "브랜드 보이스를 제품 안에 박아둬 담당자가 바뀌어도 문장 결이 크게 튀지 않는다.",
      limitation: "사실 확인이 필요한 문장을 자신 있게 쓴다. 검수 담당자를 지정하지 않으면 위험하다."
    }
  ],
  // Gong
  "d07d34fb-2cd2-4fcb-95dd-e1fceaa52d27": [
    {
      tagId: "slow-onboarding",
      angle: "잘된 통화를 그대로 교재로 삼아, 신입 영업이 선배 대화를 들으며 램프업한다.",
      limitation: "이 목록에서 가장 비싸다. 영업 인원이 10명 이하면 검토 대상에 올리기도 어렵다."
    },
    {
      tagId: "uneven-output-quality",
      angle: "샘플 몇 건이 아니라 전 통화에서 패턴을 뽑아 편차가 큰 구간을 지목한다.",
      limitation: "분석 품질은 전사 품질을 넘지 못한다. 한국어 정확도는 자사 통화로 먼저 검증해야 한다."
    },
    {
      tagId: "gut-feel-decisions",
      angle: "코칭이 경험담 대신 실제 대화 데이터 위에서 이뤄지고 딜 리스크 신호가 붙는다.",
      limitation: "감시로 받아들여지는 순간 통화에서 솔직함이 사라져 데이터 자체가 왜곡된다."
    },
    {
      tagId: "cross-role-misalignment",
      angle: "영업이 현장에서 실제로 들은 말을 제품·마케팅이 원문 그대로 확인한다.",
      limitation: "정보 밀도가 높은 매니저용 화면이라, 현장 담당자가 일상적으로 열어보진 않는다."
    }
  ],
  // Replit
  "e357c35d-bfd4-4c14-aad0-9910de98837f": [
    {
      tagId: "slow-feedback-loop",
      angle: "돌아가는 실행 링크를 바로 공유해, 설명 대신 실물로 피드백을 받는다.",
      limitation: "컨테이너 슬립과 재시작이 있어, 리뷰어가 열었을 때 안 돌아가 있는 일이 생긴다."
    },
    {
      tagId: "no-eng-resource",
      angle: "환경 설정 없이 브라우저에서 바로 만들어, 착수 대기 시간 자체가 사라진다.",
      limitation: "AI가 만든 코드를 사람이 읽지 않으면 설명 못 하는 코드만 빠르게 쌓인다."
    },
    {
      tagId: "slow-onboarding",
      angle: "설치 0으로 첫날부터 코드를 돌려봐, 신입과 비개발 직군의 준비 시간이 없어진다.",
      limitation: "로컬 편집기의 단축키와 확장은 포기해야 해서, 숙련자에겐 오히려 느려진다."
    },
    {
      tagId: "validate-before-building",
      angle: "아이디어를 몇 분 만에 실제로 돌아가는 형태로 만들어 사용자에게 붙여본다.",
      limitation: "안정성 58점이다. 졸업 기준을 미리 안 정하면 데모가 그대로 운영이 되어버린다."
    }
  ]
};
