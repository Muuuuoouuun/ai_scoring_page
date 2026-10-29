# AIs 브랜치·업데이트·UI·배포 검토

확인일: 2026-10-03 KST. 로컬 Git, 원격 전체 브랜치, GitHub PR·CI·브랜치 보호 상태, Sites 버전·배포 상태, 공식 제공사 문서와 현재 `site/` 코드를 대조했다. 서브 에이전트 3개가 콘텐츠, UI, 배포 운영을 병렬 검토했다. 이 문서는 적용 여부를 결정하기 위한 검토 결과이며 코드·콘텐츠 반영 또는 배포 완료 기록이 아니다.

## 권장 결정

현재 `codex.09bigmac`의 `site/`를 기준으로 **검증 안정화 → 공식 기능 소식 5건 → 평가 이해 UI → 모바일 비교·후기 작성** 순서로 진행한다. Sites v24 운영을 유지하고 GitHub 개발 원본과 배포 원본의 대응을 정리한다. 최신 원격 통합 PR #2를 그대로 병합하는 안은 보류한다.

선택 가능한 접근은 세 가지다.

| 접근 | 이점 | 비용·한계 | 판단 |
|---|---|---|---|
| 현재 사이트 유지, 검증·콘텐츠·상세 UI부터 개선 | 현재 9/30 데이터와 배포 동작 보존, 변경 범위 작음 | main 정합성은 후속으로 해결 | 첫 적용 묶음으로 권장 |
| PR #2 통합 브랜치를 그대로 기준으로 전환 | 카탈로그 11개, 참고 사이트 디렉터리, 평가 UI 재사용 | 9/30 콘텐츠·행사 상태가 뒤로 돌아가며 평가 집계 정책 충돌 | 그대로 적용 보류, 필요한 부분만 재검수 |
| 프레임워크·호스팅과 전체 UI를 함께 재구축 | 운영 인프라를 직접 통제 가능 | 인증·D1·R2 이전, 검증·운영 부담 증가 | 무방문 정기 처리·운영 요구가 구체화된 후 비교 |

## 1. 최신 브랜치와 배포 원본

원격 `origin`의 기본 fetch 설정은 `main`, `codex.09bigmac`만 가져오고 있었다. 이번에 모든 원격 heads를 명시적으로 fetch하여 날짜와 변경을 비교했다. checkout·rebase·merge·push는 수행하지 않았다.

| 범위 | 브랜치 / SHA | 최신 시점 | 의미 |
|---|---|---|---|
| 현재 개발 checkout | `codex.09bigmac` / `c7f4658` | 9/30 10:03 KST | Claude·DevDay·Grok 소식, 카탈로그 43개. origin보다 1커밋 ahead |
| 최신 GitHub 원격 브랜치 | `claude/project-status-development-plan-vox4au` / `43b489a` | 9/17 09:51 KST | 여러 브랜치 통합, 열린 PR #2 |
| GitHub 현재 작업 원격 | `origin/codex.09bigmac` / `1e0b7a5` | 9/16 18:52 KST | 9/30 로컬 콘텐츠 커밋 미포함 |
| GitHub 기본 브랜치 | `origin/main` / `9c9fbbc` | 4/26 00:13 KST | 이전 Next.js MVP. 현재 Sites 앱과 다름 |
| 실제 배포 원본 | `sites-publication` / `2d50110` | 9/30 10:05 KST | `site/`를 루트에 펼친 별도 Git 이력. Sites v24의 source SHA |

Sites에서 v24 배포 성공과 현재 URL을 확인했다: [AIs 현재 사이트](https://ais-discovery-hub.aaahaaah19.chatgpt.site). 접근 모드는 `custom`, 현재 사용자는 owner다. 공개 범위를 바꾸지 않았다. 연결된 예약은 `[]`, 별도 도메인도 `[]`였다.

로컬 `HEAD:site`와 v24 원본 트리는 실행 코드·콘텐츠가 같다. 유일한 차이는 `tests/history-api.test.mjs`의 1줄 시간 고정이다. 따라서 로컬 commit SHA와 배포 SHA를 같은 값으로 기록하지 말고, GitHub commit·site tree·배포 source commit·버전을 각각 남겨야 한다.

사용자 기존 변경인 `docs/README.md`, 9/30 스코어·참여 기획은 보존했다. 이번 작업은 `docs/reviews/`에 검토 문서와 검증 로그만 추가했다.

## 2. 기존 PR에서 적용할 것과 보류할 것

[PR #2](https://github.com/Muuuuoouuun/ai_scoring_page/pull/2), [#5](https://github.com/Muuuuoouuun/ai_scoring_page/pull/5), [#4](https://github.com/Muuuuoouuun/ai_scoring_page/pull/4), [#3](https://github.com/Muuuuoouuun/ai_scoring_page/pull/3), [#1](https://github.com/Muuuuoouuun/ai_scoring_page/pull/1)은 모두 열려 있다. PR #2는 GitHub에서 mergeable이고 9/17 CI 성공이지만, 그 검사는 저장소 루트 앱을 대상으로 한다. 실제 배포 앱인 `site/`의 회귀 통과를 증명하지 않는다.

통합 브랜치 카탈로그는 45개, 현재는 43개다. 공통 34개는 내용이 같고, 통합 브랜치 전용 11개와 현재 전용 9개가 있다. 통합 브랜치로 데이터를 덮어쓰면 이미 배포한 9/30 발표 9개와 DevDay 행사, 진행 중/종료 상태 개선을 잃는다.

| 변경 | 판단 | 이유 |
|---|---|---|
| Comet·Dia·Manus·Higgsfield·HeyGen·Suno·Topaz·Jasper·Gong·Replit·Lovable 11개 | 개별 재검수 후 추가 | 기존 9/30 항목 보존, 현재 플랜·제공 상태·출처 재확인 필요 |
| 참고 사이트 디렉터리 | 후속 검토 | 별도 검수·메뉴 우선순위·유지 작업 필요 |
| 편집 70% + 외부 30% 종합점수·전체 순위 | 보류 | 업무·플랜·표본·평가 종류를 나누는 기존 제품 원칙과 충돌 |
| 외부 평점 환산 | 현재 구현을 그대로 가져오지 않음 | `4.7/5 (확인 필요)`도 합산. Figma의 82.3% 사용/선호 비율도 평점으로 환산됨 |
| PR #3 CI | `site/`를 검사하도록 재작성 | 루트의 npm test/build만으로 배포앱 검증 불가 |
| PR #4 Next 14 보안 변경 | 레거시 앱 유지 여부와 함께 판단 | 현재 배포는 별도 `site/`의 Next 16·vinext 기반. 해당 PR만으로 현재 운영앱 보안 검증 완료가 되지 않음 |

## 3. AI·SaaS 소식 후보

‘적용’은 AIs에 기능·소식 정보를 반영하자는 권고다. 유료 제품 구매나 저장소 운영 도구 도입을 뜻하지 않는다. 이미 반영된 9/30 모델·DevDay·Grok 발표는 중복 제외했다.

| 후보 / 발표일 | 적용 판단 | 콘텐츠에 남길 조건 |
|---|---|---|
| [Gemini Skills](https://gemini.google/release-notes/) / 9/30 | 첫 묶음 | 현재 18세 이상 개인 계정, Gems 전환 일정, Canvas·Deep Research 사용 제한 |
| [ChatGPT Space·Pages](https://chatgpt.com/features/space/) / 9/29 | 첫 묶음 | Pro·Business·Enterprise. 모바일 편집·협업 슬라이드/시트는 예정 |
| [Claude 통합 대화](https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude) / 9/16 | 첫 묶음 | Pro·Max 순차 제공. 로컬 작업은 Desktop 실행 필요. Docs·Slides 무료 제공은 출처 충돌로 확정하지 않음 |
| [Notion 팀 Skills](https://www.notion.com/releases/2026-09-15) / 9/15 | 첫 묶음 | 공유 지침·SKILL.md 다운로드. 일반 Skills와 유료 베타 MCP 연결 조건 구분 |
| [Sonnet 4.5 API 종료 공지](https://platform.claude.com/docs/en/release-notes/overview) / 9/30 | 첫 묶음의 개발자 공지 | 11/30 종료 예정. 기존 Sonnet 5.5 카드에 이전 조건 보강 |
| [Copilot 컴퓨터 사용](https://github.blog/changelog/2026-10-01-github-copilot-can-now-interact-with-desktop-apps/) / 10/1 | 조건부 반영 | 공개 미리보기·OS·권한·조직 설정 표시 |
| [Cursor Rollouts·Security Review](https://cursor.com/changelog/rollouts-and-security-reviewer) / 9/23 | 조건부 반영 | Teams·Enterprise. 연결 조건 명시, 자동 롤백으로 설명하지 않음. 기간 경계의 시험 크레딧은 보류 |
| [Gemini 4 Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) / 9/30 | 일반 이용 추천 보류 | Fairwind 제한 제공. 일반 이용 가능 모델처럼 추천하지 않음 |

현재 뉴스는 서비스당 `latestUpdate` 하나에서 생성한다. 첫 묶음에서는 이 구조를 유지하되, 다른 발표에는 새 ID를 쓰고 같은 발표의 정정은 기존 ID와 revision을 올린다. Sonnet 종료 공지는 5.5 기존 항목의 조건을 보강하며 소식 이력 구조를 별도 후속 설계한다. 공식 문서 확인을 직접 실행 성공으로 표시하지 않는다.

## 4. UI 적용 범위

기존 정보 중심 홈과 색감은 유지한다. 새 메뉴·전체 디자인 변경보다 아래 흐름을 순서대로 다듬는다.

**첫 UI 묶음:** 상세 소개 아래에 작은 사용자 경험 요약을 배치한다. 업무·플랜, 집계 후기 건수, 항목별 응답 건수, 후기 갱신일을 구분한다. 미평가는 0점으로 표시하지 않는다. 조건 변경 중 이전 점수를 새 결과처럼 보여주지 않고, 실패 시 평가 영역만 다시 요청한다. 소식 카드에는 확인일과 베타·순차 제공 등 핵심 상태를 붙인다.

**다음 UI 묶음:** 모바일 비교는 ‘비교 기준 → 도구 A/B/C의 값·조건’ 순서로 세로로 읽게 한다. 공통 기능은 검수된 ID 대응이 있을 때만 정규화한다. 후기 작성은 사용 맥락 → 경험·선택 점수 → 공개 미리보기의 3단계로 나누고 기존 초안·로그인 복귀·동의 재확인을 보존한다. 안전한 재시도를 약속하려면 계정에 묶인 `submissionId`와 게시 결과 조회를 먼저 마련한다.

**후속:** 기능 발견 허브, 점수 분포·집계 원문, 뉴스 이력 저장. 현재 구현에 없는 데이터가 필요하므로 기존 평균에서 분포를 추정하거나 도구 기능명을 임의로 합치지 않는다.

첫 UI 검증 범위는 0/소수/충분 응답, 조건 변경·응답 지연·실패, 320/390px·200% 확대·키보드·화면 읽기다. 새 UI는 이번에 구현하거나 브라우저 검증하지 않았다. 기존 QA 기록은 회귀 기준으로만 재사용한다.

## 5. 배포와 운영 권장안

당장은 Sites를 유지한다. GitHub `main`을 앞으로 개발 원본으로 정리하되 승인된 변경만 모은 PR로 진행하고, Sites에는 검증한 `site/` 트리를 대응시킨다. 현재 원격 통합 브랜치를 자동 승격하지 않는다.

릴리스 순서는 **변경 PR → site/ 타입·회귀·빌드 → 저장된 버전의 실제 배포 → 배포 성공 및 source SHA 확인 → 기록**이다. 현재 main은 보호되지 않았고 필수 검사도 설정돼 있지 않다. 새 `site/` 검사를 만든 뒤 병합 필수 검사로 연결한다. [GitHub 브랜치 보호 문서](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

초기 콘텐츠 운영은 주 1회 공식 소식 검수 묶음을 권장한다. 출시 중단·요금·지원 종료 같은 영향 큰 공지는 확인 후 별도로 처리한다. 자동 수집은 원문 변화와 검토 대기 항목을 모으고, 기능 사실·점수·혜택 자격은 검수를 거쳐 확정한다. 이는 제안 일정이며 예약은 생성하지 않았다.

현재 방문 기반 출처 갱신·개인 알림 처리는 방문이 없는 동안 실행을 보장하지 않는다. Sites의 연결 cloud 작업과 앱 내부의 개인 알림·메일 실행은 별도로 설계해야 한다. [Workers Cron](https://developers.cloudflare.com/workers/configuration/cron-triggers/) 도입은 호스팅의 지원 범위·인증·작업 선점·중복 처리 계약을 확인한 후 결정한다. 실제 메일 수신, 환경 값, D1 복구 가능 상태는 이번에 재검증하지 않았다.

스키마 변경 없는 첫 묶음은 기존 버전으로 앱 코드를 되돌리는 계획을 기록한다. 후기 제출 ID·뉴스 이력 등 D1 변경 전에는 백업/복구 경로와 이전 코드 호환성을 별도로 확인한다. 앱 버전 복귀를 DB 복구와 같다고 취급하지 않는다. 더 상세한 운영 대안은 배포 운영 문서에 정리한다.

## 6. 새 검증 결과와 출시 전 조건

| 검사 | 이번 결과 | 해석 |
|---|---|---|
| `site/`의 `npx tsc --noEmit` | 통과 | 현재 소스 타입 검사 |
| `node --experimental-strip-types --test tests/*.test.mjs` | 294개 중 282 통과 / 12 실패 | 표준 회귀는 아직 통과 상태가 아님 |
| `node --conditions=react-server --test tests/home-streaming.mjs` | 4 / 4 통과 | 홈의 스트리밍 의존성·순서 검사. 실제 지연시간·사용성 측정 아님 |
| 실패한 3파일의 날짜 고정 진단 | 48 / 48 통과 | 9/15 시계를 외부 import로 고정한 진단. 정상 CI 통과로 대체하지 않음 |
| 최신 빌드·새 UI 실기기·메일 수신 | 이번 미실행 | 통과 또는 연결 완료라고 보고하지 않음 |

12개 실패는 API 1개, 비용 비교 4개, 조건 이력 7개다. 기본 harness가 실제 Date를 사용하면서 fixtures의 9/15·10/1이 현재 10/3보다 과거가 됐다. 전환일이 오늘보다 이전인 비용 비교 차단, 기록 시작 이전 조건 추가 차단, 이미 적용된 이력 삭제 차단이 테스트의 미래 날짜 가정과 충돌한다. 같은 파일을 9/15 시계에서 실행하면 48개가 통과했다. 앱의 날짜 검증을 약화시키지 않고 **해당 시나리오별 테스트 시계를 명시적으로 고정**하는 안을 권장한다.

로그: [표준 회귀](2026-10-03-regression-tests.log), [시간 고정 진단](2026-10-03-frozen-clock-diagnostic.log). 원인 진단은 완료했지만 테스트 파일은 아직 수정하지 않았다. 새 배포는 정상 명령으로 회귀·타입·빌드를 통과한 뒤 진행한다.

## 상세 검토 문서

- [AI·SaaS 후보](2026-10-03-ai-update-candidates.md): 공식 출처·제공 조건·반영 위치·중복 제외.
- [UI·제품 검토](2026-10-03-ui-product-review.md): 현재 구현과 기획 구분, 화면 변경·검증 기준.
- [배포·운영 검토](2026-10-03-deployment-operations.md): 현재 배포·운영 대안·배포 원본 대응·정기 처리 경계.

권장 첫 적용 묶음은 테스트 날짜 안정화, site CI 작성, 공식 콘텐츠 5건, 상세 평가 요약·조건 변경 상태·소식 확인 상태다. main 병합과 필수 검사 설정, 배포 승격, 정기 실행 연결은 각각 실제 결과를 확인하며 진행한다. UI 구현 전에는 제시한 범위에 대한 디자인 승인이 필요하며, 본 검토를 승인된 새 설계나 적용 완료로 취급하지 않는다.
