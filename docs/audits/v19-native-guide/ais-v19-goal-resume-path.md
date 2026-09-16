# V19 목표 수동 재개 경로 한정 확인

확인일: 2026-09-14 (Asia/Seoul). 범위: 공식 문서·설치된 openai-docs 스킬·현재 callable 도구 계약 읽기. Site/문서/상태 파일, 설정, 앱 UI를 수정하지 않았고 목표 변경 도구를 호출하지 않았다.

## 결론

공식 문서상 사용자가 기존 작업의 **입력창 바로 위 목표 진행 행(goal progress row)** 에서 목표를 재개하는 경로가 있다. 사용자가 해당 작업을 열어 그 행의 재개 컨트롤을 직접 사용하는 것이 이번 환경에서 설명할 정상 경로다. [Long-running work — Steer a running goal](https://learn.chatgpt.com/docs/long-running-work#steer-a-running-goal)

문서는 현재 제품을 ChatGPT desktop app이라고 표기한다. 이 설치의 com.openai.codex UI에서 정확한 버튼 이름, 아이콘, 메뉴 깊이 및 blocked 상태에 보이는 항목은 독립 관찰하지 않았다. 따라서 “오른쪽 ▶ 버튼” 등 구체 배치나 한국어 레이블을 만들어 안내하지 않는다. 문서는 일반 resume 경로를 확인해 주지만 이 설치의 blocked→active 전환 성공 증거는 아니다.

## 확인 근거

- 설치 스킬 [openai-docs SKILL.md](/Users/bigmac_moon/.codex/skills/.system/openai-docs/SKILL.md)를 읽었다. 좁은 Goals 질문의 공식 자료 검색·실제 페이지 열기 지침에 따라 공식 도메인에서 검색하고 영문 원문 2개를 실제 열었다. 스킬 자료에서 별도의 목표 재개 UI 설명은 확인되지 않았다. 로컬 Codex 앱을 예상한 /Applications/Codex.app/Contents/Resources 경로는 존재하지 않았으며, 내부 구현·비공개 상태 탐색으로 확장하지 않았다.
- 공식 [Long-running work](https://learn.chatgpt.com/docs/long-running-work) 본문은 목표 진행 행이 composer 위에 있고 여기서 재개/일시중지·목표 편집/삭제를 한다고 설명한다. 같은 작업에 후속 메시지를 보내 조건이나 문맥을 보완하는 것과 목표 제어를 구분한다. 목표 시작은 기존 접근 권한을 넓히지 않는다고 명시한다.
- 공식 [Follow a goal](https://learn.chatgpt.com/use-cases/follow-goals) 본문은 `/goal` 조회와 `/goal resume` 사용자 명령도 문서화한다. 그러나 이는 이번 앱의 안전 거절을 대신할 실행 경로가 아니다. 새 CLI 세션을 열거나 해당 명령을 도구로 전송해 현재 앱 목표를 바꾸자는 제안은 하지 않는다.
- 현재 제공된 도구 계약을 확인했다. `get_goal`은 조회, `create_goal`은 새 목표 생성이며 미완료 목표가 있으면 실패한다. `update_goal`은 `complete` 또는 `blocked`만 허용하고 resume은 사용자/시스템 제어라고 명시한다. 새 목표를 만들거나 완료로 위장한 뒤 재생성하는 방법은 정상 재개가 아니다.

## 현재 상태와 경계

Root의 직접 관찰에 따르면 `cua.getApp('com.openai.codex')`는 “Computer Use is not allowed to use the app com.openai.codex for safety reasons.”로 거절됐다. 이 사실은 root의 실제 도구 결과 전달이며 본 검토자가 UI를 추가로 열어 재현한 것은 아니다. 다른 앱·키보드·CLI·내부 API·상태 파일을 통해 이 거절을 우회하지 않는다.

사용자는 2026-09-14에 작업 및 목표 재개를 명시했고, root는 실제 작업을 재개했다. 목표 도구상 `blocked`는 root가 전달한 현재 값이며 아직 `active` 변경을 확인하지 않았다. 사용자에게 “목표 재개 완료”라고 보고할 수 없다. 수동 재개 뒤 root가 기존 `get_goal` 조회로 상태를 확인하면 된다. 일반 작업을 계속하는 것과 목표의 자동 반복 상태 전환은 별도다.

## 사용자에게 설명할 최소 문장

작업은 이어서 진행하고 있습니다. 목표의 자동 실행도 재개하려면 이 작업의 입력창 위 목표 진행 행에서 재개를 직접 선택해주세요. 공식 문서가 안내하는 수동 제어 경로입니다. [공식 안내](https://learn.chatgpt.com/docs/long-running-work#steer-a-running-goal)

Codex 앱 제어가 컴퓨터 사용 도구의 안전 규칙으로 거절되어 제가 대신 누를 수는 없습니다. 목표 상태는 아직 blocked로 확인된 상태입니다.
