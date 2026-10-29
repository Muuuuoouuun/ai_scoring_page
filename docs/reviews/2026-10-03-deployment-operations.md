# AIs 배포와 운영 검토

검토일: 2026-10-03, Asia/Seoul. 저장소와 공식 문서, 이번 병렬 검토의 주 담당 에이전트가 전달한 Sites 읽기 전용 조회 결과를 근거로 작성했다. 서비스 코드·DB·환경값·접근 범위·예약 작업·배포·원격 브랜치를 변경하지 않았다.

**추천: 당장은 현재 Sites 24를 유지하고 새 배포를 보류한다. 날짜 의존 테스트를 안정화해 표준 회귀를 통과시킨 뒤, `site/`의 필수 검증과 GitHub 소스→Sites 배포 소스의 대응 기록을 갖추고 작은 릴리스로 승격한다.** 무방문 개인 알림·이메일을 반드시 제공해야 할 때 실행 호스트를 별도로 결정하는 것이 현재 가장 적은 운영 변경으로 진행할 수 있는 순서다.

## 1. 실제 배포와 브랜치의 관계

### 현재 상태: 이번 Sites 조회로 확인

| 항목 | 확인 결과 | 근거 |
|---|---|---|
| 서비스 | active, 조회 계정 owner, 접근 모드 `custom` | `sites_get_site` |
| 운영 주소 | [현재 서비스](https://ais-discovery-hub.aaahaaah19.chatgpt.site) | `get_site.current_live_url`, 성공 배포의 URL 일치 |
| 최신 및 현재 성공 배포 | Sites 24, 2026-09-30T01:07:34Z에 사이트 갱신 | `get_site`, `get_site_version`, `get_deployment_status` |
| 운영 소스 | `2d501103e6e6270de1063fe8df5706e0e715a7e7` | 버전 24의 `source.commit_sha` |
| 배포 식별자 | `appgdep_6abc609e09e4819195f090993de45857`, `succeeded` | 배포 상태 조회 |
| 배포 환경 | revision 2, MCP 없음 | `env_set_revision:2`, `has_mcp:false` |
| 연결된 예약 작업 | 없음, `automations:[]` | `get_site` |
| 별도 도메인 | 없음, `items:[]` | `list_custom_domains` |
| 이전 저장 버전 | Sites 23, 소스 `d0bbda59dcd38cbd782bbbbe3d3f2701de36d16f` | 버전 23 조회 |

주소가 존재하고 배포가 성공했다는 사실은 누구나 방문할 수 있다는 뜻이 아니다. 현재 접근 모드가 `custom`이므로 공개 전환이나 협업자 추가는 배포와 별도의 제품 결정이다. 이번 검토에서는 그 접근 범위를 보존했다.

프로젝트 ID는 [hosting.json](/Users/bigmac_moon/dev/ai_score/site/.openai/hosting.json)에 있는 `appgprj_6aa42f3ab3ec81919d0048d508baa661`이다. 여기에는 논리 바인딩 `DB`, `BUCKET`만 있고 실제 운영 DB 식별자나 인증값은 없다. [vite.config.ts](/Users/bigmac_moon/dev/ai_score/site/vite.config.ts)의 DB UUID는 로컬 실행용 placeholder이며 실제 운영 DB로 간주하면 안 된다.

### GitHub의 최신 브랜치와 운영 소스는 다르다

| 소스 | 현재 확인한 커밋 | 의미 |
|---|---|---|
| 로컬 개발 `codex.09bigmac` | `c7f4658` | 9월 30일 콘텐츠 변경, `origin/codex.09bigmac`보다 1 ahead |
| 로컬 `sites-publication` | `2d50110` | 실제 Sites 24 소스와 일치, `site/` 내용을 저장소 루트로 펼친 별도 이력 |
| 로컬 원격 추적 `sites/main` | `d0bbda5` | Sites 23의 소스와 일치하지만 과거 로컬 ref이며 현재 원격 HEAD 확인값은 아님 |
| GitHub `main` | `9c9fbbc` | 현재 `site/` 개발·운영 변경이 모두 승격된 기준은 아님 |
| GitHub 통합 후보 / PR #2 | `43b489a` | 9월 17일 여러 브랜치 병합, 검토와 승격 대기 |

관련 원격: [저장소](https://github.com/Muuuuoouuun/ai_scoring_page), [통합 PR #2](https://github.com/Muuuuoouuun/ai_scoring_page/pull/2), [카탈로그 확장 PR #5](https://github.com/Muuuuoouuun/ai_scoring_page/pull/5). 현재 `.git/config`의 설정된 remote는 GitHub `origin` 하나다. 로컬 `sites/main` ref가 남아 있다는 사실만으로 Sites 원격 연결이나 최신성까지 확정할 수 없다.

`git diff HEAD:site sites-publication^{tree}`는 `tests/history-api.test.mjs`의 날짜 고정 1줄 차이만 보여 준다. GitHub 개발 소스는 해당 테스트에서 `2026-09-15T12:00:00.000Z`를 고정하고, 실제 Sites 24 소스는 실행 당일 시각을 쓰는 `harness()`다. **운영 런타임 파일은 일치하지만 검증 소스까지 완전히 같은 상태는 아니다.** 이후에는 개발 커밋, `site/` tree hash, Sites 원격 커밋, archive hash, saved version, deployment ID를 릴리스 한 줄에 묶어 기록해야 한다.

통합 후보는 현재 운영보다 도구·평가·자료 페이지 등 다른 변경을 포함하고, 현 로컬 9월 30일 콘텐츠와 차이가 있다. 최신 커밋 날짜나 병합 완료만으로 배포 후보로 선택하지 말고 두 소스의 보존할 변경을 명시해 재검증해야 한다. 이 문서는 특정 PR 전체의 기능 정확성 승인을 대신하지 않는다.

## 2. 지금의 CI 공백

[CI PR #3](https://github.com/Muuuuoouuun/ai_scoring_page/pull/3) 및 통합 후보의 `.github/workflows/ci.yml`은 루트에서 `npm ci`, `npx tsc --noEmit`, `npm test`, `npm run build`만 수행한다. 통합 후보의 루트 `tsconfig.json`은 `site/`를 제외하고, `vitest.config.ts`도 루트 `tests/**/*.test.ts`로 제한한다. 따라서 PR #2의 9월 17일 CI 성공은 **운영 `site/` 앱 검증 성공을 뜻하지 않는다.**

이번 GitHub API 조회에서 `main.protected:false`, classic protection은 `404 Branch not protected`, `rules/branches/main:[]`, `rulesets:[]`였다. 현재 `main`에는 필수 검사나 ruleset이 설정됐다는 근거가 없다. CI 파일을 추가하는 것과 통과를 병합 조건으로 강제하는 것은 별도 작업이다.

추천하는 다음 gate:

1. `site/` 전용 CI job을 추가하고 `working-directory: site`를 고정한다. 현재 성공한 런타임과 호환되는 Node 버전을 pin하고 lockfile 기반 설치를 수행한다.
2. `npx tsc --noEmit`, `node --experimental-strip-types --test tests/*.test.mjs`, 별도의 `node --conditions=react-server --test tests/home-streaming.mjs`, 실제 Sites/Worker 빌드를 같은 후보 소스에서 수행한다. 날짜를 넘겨 실행하는 회귀는 controlled clock으로 안정화한다.
3. 카탈로그·콘텐츠 검증과 기존 계정 격리·알림·결제·이메일 회귀를 유지한다. 전체 통합 후보가 추가한 별도 평가 규칙도 선택한 데이터에 맞춰 검사한다.
4. 필수 status check를 `main` 또는 실제 릴리스 브랜치의 병합 규칙으로 설정한다. 현재 진행 중인 검토만으로 운영 설정을 바꾸지는 않는다.
5. 배포에서는 검증한 `site/` tree와 Sites source checkout의 tree가 동일한지 확인하고, 그 소스에서 만든 archive만 저장한다. GitHub CI의 SHA를 다른 Sites source SHA의 빌드 증거로 그대로 대체하지 않는다.

현재 타입 검사와 Home streaming 4건은 주 담당 에이전트가 통과를 확인했다. 표준 회귀는 **294건 중 282 PASS / 12 FAIL**이다. 실패는 API 1·cost comparison 4·history 7건이며, 9월 15일/10월 1일 fixture가 실행일 10월 3일에 이미 과거가 된 관계다. 실패한 3개 파일에 global clock만 9월 15일로 동결한 진단에서는 48/48이 통과했다. 원래의 과거 전환일·과거 계약 조건·이미 적용된 이력 취소 차단은 정상 보호로 분석됐으며, 운영 결제 데이터 손상으로 단정하지 않는다. 원본 표준 suite가 통과한 상태는 아니므로 **fixture를 controlled clock으로 고친 뒤 전체 표준 회귀와 실제 배포 소스 일치를 확인하기 전까지 새 배포를 보류**한다. [표준 회귀 로그](/Users/bigmac_moon/dev/ai_score/docs/reviews/2026-10-03-regression-tests.log), [시각 동결 진단](/Users/bigmac_moon/dev/ai_score/docs/reviews/2026-10-03-frozen-clock-diagnostic.log)

통합 후보의 별도 검증은 주 검토 보고서에 기록한다. 이 운영 조사에서는 테스트나 빌드를 중복 실행하지 않았다.

## 3. 승격과 복구 절차

### 승격

현재 Sites 프로젝트를 유지하고, [Sites hosting 스킬](/Users/bigmac_moon/.codex/plugins/cache/openai-curated-remote/sites/0.1.75/skills/sites-hosting/SKILL.md)의 기존 Site workflow를 사용한다. 이 workflow는 Site 원격 이력과 checkout 정합성, 지정된 검사·빌드 순서, 소스 push, archive 검증을 담당한다. 분기된 이력은 덮어쓰지 않고 재조정을 요구한다.

실제 승격 순서는 다음과 같다.

1. 운영 버전·접근 범위·source commit과 이전 복구 후보를 읽고 release 기록을 시작한다.
2. 사용자의 미커밋 문서를 보존한 별도 검토 소스에서 후보를 확정하고 필요한 변경만 통합한다. 기존 프로젝트 ID와 DB/R2 논리 바인딩을 유지한다.
3. D1 schema가 바뀌면 migration을 먼저 생성하고 로컬/격리 DB에서 검증한다. [Sites Vite plugin](/Users/bigmac_moon/dev/ai_score/site/build/sites-vite-plugin.ts:176)은 `dist/.openai`에 manifest와 `drizzle/`을 복사한다. 파일 포함은 실제 운영 migration 적용이나 복구 보장의 증거와 구분한다.
4. 위 CI gate와 변경 화면의 필요한 확인을 마친 뒤 Site-owning 에이전트가 공식 `site-workflow.mjs`에서 검증한 소스와 archive를 확보한다.
5. 정확한 saved version ID로 기존 audience에 배포한다. 성공 상태, source SHA, URL, 환경 revision을 기록한다. 환경값 변경은 새 revision을 만들어 saved version 재배포로 적용하므로 코드 배포 기록과 함께 관리한다.

Sites의 배포 URL은 production URL이다. 같은 서비스에 임시 UI를 올리고 preview라고 취급하지 않는다. 테스트용 DB/사용자와 운영 DB/실제 계정을 구분하며, 별도 staging이 필요하면 격리된 대상과 audience를 별도로 정한다.

### 코드 복구와 데이터 복구

콘텐츠/UI 회귀이고 DB schema나 바인딩이 그대로면 이전 archive-backed saved version을 다시 배포하는 방식이 우선이다. Sites 23은 현재 확인한 이전 저장 버전 후보이며, 이번 Sites 24 변경과의 diff는 콘텐츠/뉴스/테스트 7개 파일이다. D1 migration·schema·manifest 변경은 없다. 다만 날짜가 지난 콘텐츠로 돌아가는 제품 영향은 함께 평가한다.

복구할 때는 `list_site_versions`/`get_site_version`에서 **실제 saved version ID를 그대로 복사**하고 source provenance와 archive를 확인한다. SHA, version number, deployment ID를 `version_id` 대신 넣거나 과거 ref 이름만으로 운영 상태를 추정하지 않는다. 새 배포에는 현재 환경 revision이 적용될 수 있으므로 코드 복구가 환경값까지 과거 상태로 되돌린다고 가정하지 않는다.

**D1/R2 데이터는 코드 archive와 별개다.** 삭제된 바인딩이나 변경된 리소스 때문에 일반 Workers rollback도 제약을 받을 수 있다. Sites에 Cloudflare의 모든 복구 관리 기능이 동일하게 노출된다고 가정하지 않는다. [Cloudflare rollback 문서](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

추천 DB 원칙:

- migration은 추가→호환 코드 배포→후속 제거 순서로 설계하고, 기존 saved version이 새 schema에서 읽고 쓸 수 있는지 확인한다. 파괴적 변경은 복구 계획 없이 한 배포에 묶지 않는다.
- schema 변경 전 실제 운영 DB와 플랜, 복구 권한·방식, 복구 지점을 확인한다. 현재 placeholder UUID나 로컬 SQLite backup을 운영 복구 증거로 쓰지 않는다.
- Cloudflare D1 Time Travel은 production storage backend에서 자동 제공되고 Free 7일/Paid 30일의 복구 구간이 있다. 현재 관리형 Sites DB의 적용 플랜과 사용자 접근 권한은 확인되지 않았다. 장기 보관이 필요하면 공식 export 경로와 저장소 권한·보존 주기를 따로 검증한다. [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- Time Travel restore는 DB 전체를 해당 시점으로 덮어쓰고 진행 중인 query를 취소한다. 코드 오류를 고치려다 배포 이후의 정상 사용자 기록까지 잃지 않게 코드 복구와 데이터 복구를 따로 판단한다. 실제 데이터 복구는 별도 승인·작업 기록이 필요한 운영 행위다. [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- 현재 migration journal은 `0000`–`0004`이고 이메일 원장·notice source head 등을 포함한다. 운영 적용 이력과 실제 DB schema/backup·restore drill은 이번 검토에서 조회하지 않았다. 공식 D1 migration 체계는 적용 이력을 별도 테이블에서 관리하므로 파일 journal만으로 적용 완료를 판정하지 않는다. [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)

## 4. 예약 실행과 이메일의 현재 경계

현재 [layout](/Users/bigmac_moon/dev/ai_score/site/app/layout.tsx:25)과 [sources API](/Users/bigmac_moon/dev/ai_score/site/app/api/sources/route.ts:7)는 요청을 계기로 `syncBatch()`를 실행한다. 시간당 최대 한 묶음, 오래된 서비스 3개를 처리한다. [notifications API](/Users/bigmac_moon/dev/ai_score/site/app/api/notifications/route.ts:34)는 로그인한 사용자의 새로고침에서 `generateNotifications(userId)` 다음 `deliverEmailForUser(userId)`를 호출한다. 방문 없이 전체 계정의 알림을 처리하는 실행 루프는 확인되지 않았다.

현재 소스의 Worker 진입은 `vinext/server/fetch-handler`이고 로컬 생성 Wrangler의 `triggers`는 `{}`다. 일반 Cloudflare 예약 실행에는 `scheduled()` handler와 Cron Trigger 등록이 모두 필요하며 시각은 UTC, 등록 변경은 최대 15분 반영 시간이 있다. 이 일반 지원 사실은 관리형 Sites에 현재 cron이 연결됐다는 증거를 대신하지 않는다. [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

9월 15일 [운영 확인](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-15-v20-operational-readiness.md)에서는 `RESEND_API_KEY`와 `EMAIL_FROM` 항목이 없었다. 이번 검토에서는 런타임 환경값을 조회하지 않았으므로 **현재 메일 설정은 재확인되지 않았다.** [이메일 구현](/Users/bigmac_moon/dev/ai_score/site/lib/email-delivery.ts:14)은 두 값과 `SITE_URL`이 모두 있어야 활성화되며, 제공사 접수와 실제 수신함 도착은 별도 검증이다. 배포 환경 revision이 2라는 사실만으로 현재 실제 수신 성공을 주장하지 않는다.

과거 audit 이후 현재 Sites 0.1.75의 도구 표면은 바뀌었다.

| 현재 노출 도구 | 제공하는 경로 | 여전히 확인할 사항 |
|---|---|---|
| `sites_create_schedule` | 게시된 Site에 연결되는 cloud task, 반복 자료/소스 업데이트를 지시할 수 있음 | 현재 `automations:[]`; 사용자 요청과 실제 실행·출처 접근이 필요. Worker cron이나 전체 계정 이메일 dispatcher 등록과 동일하지 않음 |
| `sites_generate_siwc_bypass_token` | identity-less 요청이 Sign in with ChatGPT gate를 통과하는 토큰 생성/rotation | 명시적으로 bypass token을 요청한 경우에만 호출 가능. 사용자 계정 신원을 부여하는 API가 아니며 앱의 기계 인증·계정 처리 권한을 대신하지 않음 |

따라서 과거 “Sites 도구에 schedule 경로가 없다”는 문장을 현재 전체 기능 판정으로 복사하지 않는다. 지금도 개인 이메일 무방문 실행을 완료했다고 볼 근거는 없다. 정기 콘텐츠 갱신을 원할 때는 Sites cloud task가 후보이며, 개인 알림은 지원되는 실제 실행 adapter·기계 인증·운영 DB 바인딩·작업 관측을 확보해야 한다.

메일 연결 단계에서는 [기존 실행 조사](/Users/bigmac_moon/dev/ai_score/docs/audits/v20-operational-readiness/ais-v20-scheduler-code-research.md)의 공용 생성→발송 함수, 사용자 수신 동의·확인한 시간대/시각, 계정별 lease, 고정 payload/같은 idempotency key, 제한된 재시도, 동의 철회 처리를 유지한다. RSS 수집 항목은 검수된 이메일 후보와 별도이므로 RSS 갱신만으로 자동 메일을 완성했다고 표시하지 않는다.

## 5. 운영 방향 3안

| 안 | 적용할 상황 | 장점 | 비용·조건 | 판단 |
|---|---|---|---|---|
| A. 현재 Sites 유지, 작은 수동 릴리스 | UI/탐색과 콘텐츠 검증이 먼저이고 방문 시 갱신이 허용됨 | 현재 인증·D1/R2·접근 범위·URL을 유지, 이전 saved version 활용, 변경 범위가 작음 | `site/` CI와 release 매핑 필요. 무방문 메일은 별도 작업. 현재 Sites 실청구/할당량은 미확인 | **지금 권장** |
| B. GitHub `main`을 단일 개발 원본으로 정리하고 Sites에 승격 | 병렬 개발/PR 증가로 소스 혼동이 반복됨 | 필수 검사·리뷰·문서의 기준을 통일, GitHub commit→Site commit 대응을 자동 기록 가능 | 통합 후보와 9월 30일 변경을 조정, 루트 앱 유지/보관 정책 결정, `site/` 전용 CI와 branch rules 설정 | A의 다음 단계로 권장 |
| C. 자체 Cloudflare Workers/D1 운영 또는 지원되는 별도 실행 호스트 | 무방문 메일, 복구 권한, 작업량/SLA가 제품 요건임 | cron·실행 제한·작업 로그·DB 복구를 직접 관리할 수 있음 | Sites 인증을 대체/연동할 계획, 실제 DB 이관/권한·메일 sender·도메인·모니터링 필요. 별도 Worker에서 Sites 운영 DB를 바로 쓸 수 있다고 가정하지 않음 | 요건 확정 뒤 선택 |

A→B는 이어서 적용할 수 있다. C로 옮겨도 콘텐츠 검수·계정 격리·릴리스 검증 공백이 자동으로 해결되지는 않는다. 현재 기능을 보존한 작은 릴리스로 진행하고, 무방문 동작을 필요로 하는 사용자 요구가 명확할 때 인프라 변경 범위를 정한다.

### 비용의 판단 기준

현재 Sites 사용자의 요금·할당량·운영 트래픽을 확인하지 않았으므로 “무료” 또는 일정 월 요금으로 단정할 수 없다. 아래 수치는 자체 Cloudflare 계정으로 운영할 때의 공식 기본 조건이며 현재 Sites 청구 추정치가 아니다.

- Workers Free는 하루 100,000 요청과 invocation당 10ms CPU, Paid Standard는 월 최소 $5에 1,000만 요청과 3,000만 CPU ms를 포함한다. 이후 요청·CPU 사용량에 따라 과금된다. cron 실행도 요청/CPU 사용량이므로 낮은 주기보다 실제 처리량·검색/직렬화 비용을 함께 측정해야 한다. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- D1 Free는 하루 500만 row read·10만 row write 및 총 5GB storage다. Paid 포함량/초과 과금은 row scan과 write·저장량 기준이며 대기 시간 자체에 대한 DB compute 과금은 없다. 2026년 9월부터 Free의 일일 query 제한 초과 시 reset까지 query가 실패한다. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 changelog](https://developers.cloudflare.com/changelog/product/d1/)
- 이메일 제공사, 도메인, 장기 backup, 알림/관측 비용은 별도다. 실제 사용량이 없으므로 현재 월 합계를 계산하지 않는다. 예약 실행을 열 때는 처리 계정 수·상한·배치와 이어가기·실패 로그·예산 경계를 먼저 정한다.

## 6. 아직 확정할 수 없는 것

- Sites의 현재 환경 키 존재와 실제 이메일 접수/수신, 발신 도메인 인증 상태.
- 운영 DB의 실제 Cloudflare 플랜·식별자·Time Travel 접근권한, backup 보존과 restore 성공 기록.
- 관리형 Sites가 이 앱의 custom `scheduled` handler/cron을 배포·등록·조회하는 지원 계약.
- 별도 실행 호스트가 운영 DB/R2·검수된 같은 콘텐츠 버전을 정상 권한으로 사용하는 경로.
- 현재 서비스의 실제 이용량·장애율·청구와 가용성 목표.
- 날짜 fixture를 고친 이후의 전체 표준 회귀·화면 검증 결과와 통합 후보 검증. 과거 audit의 PASS 수나 시각 동결 진단을 현재 후보 전체의 성공 증거로 재사용하지 않는다.

이번 검토가 확인한 것은 **Sites 24의 실제 배포 provenance, GitHub/운영 소스 차이, site CI와 branch gate의 공백, 현재 예약 부재, 공식 복구·비용 조건**이다. 운영 변경은 수행하지 않았다.
