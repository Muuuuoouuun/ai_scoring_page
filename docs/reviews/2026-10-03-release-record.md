# AIs 2026-10-03 적용 및 배포 기록

사용자가 승인한 첫 업데이트 묶음을 구현하고 기존 Sites 프로젝트의 버전 25로 게시했다. 배포 도구가 2026-10-03 19:42:37 KST에 `succeeded`를 반환했다.

- 운영 주소: [AIs](https://ais-discovery-hub.aaahaaah19.chatgpt.site)
- 검토 PR: [#6 공식 AI 소식 5건·후기 응답 맥락·사이트 CI 업데이트](https://github.com/Muuuuoouuun/ai_scoring_page/pull/6), draft, mergeable
- 구현 브랜치: `codex/ais-october-update`, 대상 브랜치 `codex.09bigmac`
- 개발 체크아웃: `/Users/bigmac_moon/.codex/worktrees/ais-october-update/ai_score`
- 배포 체크아웃: `/Users/bigmac_moon/.codex/worktrees/ais-publication/ai_score`

## 적용한 내용

| 영역 | 결과 |
| --- | --- |
| 공식 소식 | Gemini Skills/Gems, ChatGPT Space/Pages, Claude 통합 대화, Notion 팀 Skills, Sonnet 4.5 API 종료 예정의 5개 기존 도구 항목을 업데이트했다. 계정·플랜·기기·순차 제공과 예정 기능을 구분했다. |
| 콘텐츠 보존 | 43개 도구 ID, 9월 30일 신규 9개 항목과 기존 가격을 보존했다. 새 공지는 revision 1, 기존 Sonnet 발표 보강은 revision 2다. |
| 상세 평가 | 소개 다음에 평가 영역을 한 번 배치했다. 후기 총수와 항목별 응답 수·후기 갱신일을 분리했다. 직접 평가는 미평가, 항목 응답 0건은 미평가, 1–4건은 소수 응답 평균으로 표시한다. |
| 조회 상태 | 조건 변경 직후 이전 점수·날짜를 숨긴다. A→B→A도 새 요청을 기다리고 늦은 응답은 무시한다. 오류 재시도는 선택·옵션을 유지하며 점수만 다시 조회한다. |
| 소식 미리보기 | 게시일과 공식 자료 확인일, 확인된 제공 상태 라벨을 홈·소식 목록에 표시한다. |
| 회귀·CI | 시나리오별 시계로 기존 날짜 의존 실패 12개를 수정했다. Node 24.18.0과 action SHA를 고정한 사이트 전용 설치·타입·회귀·스트리밍·빌드 워크플로를 등록했다. |

공식 문서를 확인한 날짜는 10월 3일이다. 제공사별 실제 계정 실행이나 성능 비교를 새로 수행한 것은 아니다. 출처와 제공 조건은 각 항목에 저장되어 있으며 [후보 검토](2026-10-03-ai-update-candidates.md)에 근거가 정리되어 있다.

## 검증 결과

- 표준 `node --experimental-strip-types --test tests/*.test.mjs`: **303/303 PASS**. 임시 전역 날짜 주입 없이 실행했다.
- React server Home streaming: **4/4 PASS**. TypeScript PASS. 변경 UI 파일 ESLint 오류 0; 홈의 기존 미사용 `BookOpen` 경고 1은 남아 있다.
- 날짜 변경 대상 48개: 정상 실행과 2027/2040 외부 시각 진단 모두 **48/48 PASS**. 실제 운영 날짜 검증은 유지했다.
- 독립 코드 리뷰: 출시를 막는 P0/P1/P2 결함 없음. 마지막 요청 revision 보완을 추가 검토하고 UI 행동 테스트 **9/9 PASS**를 확인했다.
- 공식 Sites workflow에서 vinext 빌드와 검증된 archive 패키징 성공. 최종 체크아웃은 clean이다.
- 최종 로컬 빌드의 브라우저 QA: 실제 빈 후기 응답, 합성 0/1/4/5 항목 응답, 이전 값 숨김, 늦은 응답 무시, 페이지 이동 없는 재시도, 키보드 필터·재시도, 검색 동작, 홈·소식 모바일 표시 PASS. 브라우저 page error 0.
- 1280·390·320·640 CSS px에서 가로 넘침 없음. 640 CSS px는 1280 화면의 200% 확대에 해당하는 가용 폭으로 reflow를 검사한 것으로, 운영체제 화면 읽기나 실제 브라우저 확대 설정 실험은 아니다.
- Vite 개발 인증 미들웨어에서 HTTP smoke: 공개 20경로·404·비로그인 및 위조 헤더 차단·로그인 복귀·로컬 CRUD·교차 출처 차단 PASS. 직접 Wrangler Worker는 Sites 앞단을 우회하므로 그 경로의 위조 헤더 검사를 운영 게이트웨이 검증으로 해석하지 않았다.
- GitHub [push CI](https://github.com/Muuuuoouuun/ai_scoring_page/actions/runs/37117192603)와 [PR CI](https://github.com/Muuuuoouuun/ai_scoring_page/actions/runs/37117213083) 모두 **success**. Git OAuth의 workflow scope 거절은 연결된 GitHub Contents API 등록으로 해결했다.

QA에서 사용한 후기 점수는 로컬 합성 응답이며 운영 DB에 등록하지 않았다. 기존 migration 5개는 임시 로컬 D1에만 적용했고 이번 릴리스에 새 migration은 없다.

## 소스와 배포의 연결

| 항목 | 값 |
| --- | --- |
| GitHub HEAD | `32595b0162bb3b47f2d3be9380924b2f0e0cdb08` |
| GitHub `site/` tree | `c10df4a3fb2f511c52485f1b23492d4d46c2202b` |
| Sites source commit | `7f2f063a6d3fdc6f1d5602f446865a3f846f7bda` |
| Sites root tree | `c10df4a3fb2f511c52485f1b23492d4d46c2202b` — GitHub 사이트 소스와 동일 |
| 프로젝트 | `appgprj_6aa42f3ab3ec81919d0048d508baa661` |
| 버전 25 ID | `appgprj_6aa42f3ab3ec81919d0048d508baa661~appgver_4750d95bad588191932df83dd1baf656` |
| 배포 ID | `appgdep_6ac0dc0b8d188191a4280662b1a0c568` |
| 결과 | `succeeded`, runtime env revision 2, custom 접근 |
| archive hash | `sha256:485528214c879925bab4db2952fc9968649bf1471bb208fc8082c442c13a5d60` |

## 다음 운영 기준

당장은 `site/` PR 검토 → 사이트 CI 통과 → 검증한 동일 소스 버전 게시 → 배포 결과 기록의 흐름을 권장한다. 첫 릴리스에서 이 흐름을 실행했다. CI 워크플로 등록과 브랜치 보호의 필수 체크 지정은 별개이며, 후자는 아직 설정하지 않았다.

오래된 `main`과 기존 PR #2 통합은 별도로 검토해야 한다. PR #2 전체 병합에는 9월 30일 내용 손실과 미확인 종합 점수 문제가 있어 그대로 합치지 않았다. 다음 단계는 운영 `site/`를 기준으로 main을 정리한 뒤 필수 CI와 리뷰 규칙을 설정하는 것이다.

접근 범위는 현재 custom이다. 예약 작업·이메일·새 외부 비용은 이번 범위에 포함되지 않았으며 별도 설정 검토가 필요하다. 이 주제의 선택지와 확인 범위는 [배포 운영 검토](2026-10-03-deployment-operations.md)에 정리했다.

직전 정상 버전 24는 복구 후보로 기록했다: `appgprj_6aa42f3ab3ec81919d0048d508baa661~appgver_00561c2630348191919f090725df51f6`, source `2d501103e6e6270de1063fe8df5706e0e715a7e7`. 코드 복구 시 해당 저장 버전을 재배포하고 성공 상태를 확인한다. 버전 재배포는 D1 데이터 복구를 의미하지 않는다.

원본 체크아웃은 `codex.09bigmac` / `c7f4658` 그대로이며 사용자의 미커밋 `docs/README.md`와 9월 30일 스펙 문서를 보존했다. 구현과 배포 worktree는 후속 검토를 위해 유지했다.
