# V16 Sites 무인 스케줄러 지원 조사

확인일: **2026-09-13 Asia/Seoul**, 공식 문서/로컬 스냅샷 확인 시각 약 **2026-09-12T15:18Z**. 범위는 현재 노출된 Sites 도구 설명, 설치된 Sites 0.1.66 스킬·패키징 코드, 현재 Site의 Vite/Worker 출력 및 호출 경로, OpenAI·Cloudflare 공식 공개 문서다.

**결론: 현재 도구·배포 계약으로 이 Sites 배포에 실제 예약 트리거를 연결할 수 있다는 근거를 확인하지 못했다. 현재 소스와 빌드에는 예약 처리기/트리거가 없으며, 이를 배포 플랫폼에 등록하고 확인할 지원 경로도 노출되지 않는다.** Cloudflare 일반 Workers의 예약 실행 가능성과 Sites에서의 실제 연결 가능성은 분리해야 한다. Sites 백엔드 구현 전체를 읽은 것은 아니므로 “Cloudflare 또는 모든 Sites에서 영구적으로 불가능”이라고 단정하지 않는다.

Site·설정·배포·운영 데이터는 변경하지 않았다. Sites API 호출, 실제 Worker 실행, 로컬 서버/빌드 실행, 비밀값 조회, 발송, 새 자동화·OS cron·외부 대체 스케줄러 생성도 하지 않았다. 사용자가 provider key와 검증된 sender를 제공하지 않은 현재 전제는 유지했다. 런타임 비밀값을 조회해 재확인한 것으로 서술하지 않는다.

## 세 단계의 지원 여부

| 단계 | 실제 근거 | 판정 |
|---|---|---|
| Cloudflare 일반 Workers 예약 실행 | 공식 문서는 Worker의 `scheduled()`와 Cron Trigger 등록을 요구한다. | 플랫폼 일반 기능은 지원 |
| 현재 앱의 예약 처리기 | Vite의 main은 `vinext/server/fetch-handler`, 생성된 기본 export는 fetch 객체, `scheduled` 단어 0개, 생성 Wrangler `triggers:{}`. | 현재 미구현/미연결 |
| Sites를 통한 실제 trigger 배포·등록·조회 | 24개 도구 설명에 cron/scheduling 0건, 저장/배포 스키마에 trigger 인자 없음. 설치된 manifest 계약과 packager에도 등록 경로 없음. | **현 지원 표면에서 연결 경로 미확인 — 실제 무인 실행 완료는 막힘** |

Cloudflare는 `scheduled(controller, env, ctx)`를 이벤트로 호출하고 Cron Trigger는 UTC를 사용한다. 코드와 별도로 프로젝트 설정의 `triggers.crons` 또는 관리 화면에서 트리거를 등록해야 하며, 변경 반영에는 시간이 걸릴 수 있다. **처리기 함수가 파일에 존재하거나 빌드가 성공하는 것만으로 트리거 등록이 되지는 않는다.** [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [Scheduled Handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)

## 도구와 Sites 배포 계약

`ALL_TOOLS`의 이름이 `mcp__codex_apps__sites_`로 시작하는 항목 24개를 확인했다. 그 24개 설명에서 `/\bcron\b|\bschedul/i` 일치는 **0개**다. 일반 도구 설명의 “websites” 같은 단어를 Sites 기능으로 세지 않았다. 실제 도구는 호출하지 않았다.

- `sites_save_site_version`: 입력은 `project_id`, `commit_sha`, 선택적 `archive`. 아카이브는 Worker 진입점과 `.openai/hosting.json`을 포함해야 한다. 예약 등록 인자는 없다.
- `sites_deploy_private_site_version`: 입력은 `project_id`, `version_id`, 선택적 `tunnel_bindings`. HTTP tunnel binding은 예약 이벤트 등록이 아니다.
- 나머지 이름은 생성/메타데이터/접근/환경값/버전/배포 상태/Worker 로그/DB 읽기/도메인 관리다. cron 또는 trigger 생성·조회 도구는 노출되지 않았다. 로그 조회 도구가 있다는 사실은 예약 실행 주체가 있다는 증거가 아니다.

[Sites hosting 규칙](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-hosting/SKILL.md:26)은 `.openai/hosting.json`에 `project_id`, 선택적 `static`, 논리 `d1`/`r2`, 지원되는 `capabilities`만 저장하도록 명시한다. `triggers` 또는 `cron` capability는 읽은 문서에서 정의되지 않았다. 문서의 `capabilities`라는 일반 필드만 보고 임의 `cron` 값을 넣는 것은 지원 근거가 아니다.

[공식 Sites 개발자 안내](https://learn.chatgpt.com/docs/sites)의 기능·제한 부분에서도 예약 트리거 계약을 찾지 못했다. 문서는 일부 background service와 hosting pattern이 지원되지 않을 수 있음을 밝히지만, **특정 scheduled handler를 명시적으로 금지한다는 문장은 확인하지 못했다.** 따라서 문서의 일반 제한을 절대적인 cron 금지로 바꾸지 않는다. 이 URL은 공식 도움말의 개발자 가이드 링크 `https://developers.openai.com/codex/sites`에서 리디렉션되어 확인했다. [공식 도움말](https://help.openai.com/en/articles/20001339)

## 실제 파일과 패키징 동작

| 파일 | 관찰 내용 | 의미 |
|---|---|---|
| [vite.config.ts](/Users/bigmac_moon/dev/ai_score/site/vite.config.ts:14) | `localBindingConfig.main`은 `vinext/server/fetch-handler`. `@cloudflare/vite-plugin`에 이 config를 넘긴다. D1/R2는 로컬 논리 바인딩과 placeholder 리소스다. | 현재 custom scheduled entry가 없으며 로컬 config를 실제 관리형 Cloudflare 리소스 설정으로 간주할 수 없다. |
| [package.json](/Users/bigmac_moon/dev/ai_score/site/package.json:10) | build는 `vinext build`, start는 생성 Wrangler config로 `wrangler dev --local`. vinext 1.0.0-beta.5, Cloudflare Vite plugin 1.37.1, Wrangler 4.92.0. | start는 로컬 실행이고 Sites production trigger를 등록하지 않는다. |
| [Sites Vite plugin](/Users/bigmac_moon/dev/ai_score/site/build/sites-vite-plugin.ts:172) | closeBundle은 hosting manifest와 Drizzle migration을 `dist/.openai`로 복사한다. | trigger API 호출/등록 로직 없음. |
| [현재 manifest](/Users/bigmac_moon/dev/ai_score/site/.openai/hosting.json)와 dist 사본 | 최상위 키는 `d1`, `r2`, `project_id`뿐. DB/BUCKET 논리 바인딩. | 예약 선언 없음. 비밀값은 읽지 않았다. |
| [생성 Wrangler config](/Users/bigmac_moon/dev/ai_score/site/dist/server/wrangler.json) | `main:'index.js'`, `triggers:{}`. | 현재 빌드에 crons가 없다. 이 파일은 로컬 생성물이며 production 적용 결과를 조회한 것은 아니다. |
| [생성 Worker](/Users/bigmac_moon/dev/ai_score/site/dist/server/index.js) | 끝부분에서 fetch만 가진 객체를 기본 export. 전체 파일 `scheduled` 단어 0개. | 현재 출력에 예약 event handler가 없다. `scheduleBackgroundRegeneration` 같은 HTTP 후속 재생성은 cron handler가 아니다. |
| [vinext fetch handler](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/fetch-handler.js:4) | custom worker가 handler를 import해 `handler.fetch(request,env,ctx)`로 위임할 수 있다고 설명한다. | wrapper 작성 가능성의 로컬 근거다. Sites scheduler 등록까지 보장하지 않는다. |

[package-site.mjs](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/scripts/package-site.mjs)는 [package-site.sh](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-hosting/scripts/package-site.sh)를 실행하도록 연결되어 있다. 후자는 [prepare-site-build.cjs](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-hosting/scripts/prepare-site-build.cjs:66)로 출력 트리를 검증/복사하고 manifest·migration을 포함해 tar를 만든다. 읽은 경로에는 Wrangler deploy나 Cloudflare schedules API 호출이 없다. `dist/server/wrangler.json`이 복사될 수 있다는 것은 **그 설정을 Sites 백엔드가 배포 시 적용한다는 증거가 아니다.** 백엔드가 그 파일을 무시한다고 직접 확인한 것도 아니다.

공식 [openai/sites 저장소](https://github.com/openai/sites)는 프로젝트 생성 및 배포 메타데이터/migration을 포장하는 TypeScript 패키지를 소개한다. 공개 README는 trigger 등록 백엔드의 계약을 제공하지 않았다. 개별 package 링크 한 번은 웹 도구 내부 오류로 열리지 않았고, 설치된 실제 vendored plugin을 근거로 읽었다.

Cloudflare Workers for Platforms의 [공식 limits 문서](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/limits/)에도 cron 금지의 명시 문구를 찾지 못했다. 이 Site의 관리형 배포 아키텍처 전체를 검증하지 않았으므로, “dispatch 기반이니 scheduled를 지원하지 않는다”는 추가 추정은 하지 않는다.

## 현재 작업의 호출 경로

- [notifications API](/Users/bigmac_moon/dev/ai_score/site/app/api/notifications/route.ts:14)는 실제 로그인 사용자 확인 후 `refresh`에서 `generateNotifications(userId)`와 `deliverEmailForUser(userId)`를 호출한다. 무인 호출용 인증 경로 또는 전체 대상자 순회 작업은 이 경로에 없다.
- [sources API](/Users/bigmac_moon/dev/ai_score/site/app/api/sources/route.ts:7)는 GET 요청 중 `waitUntil(syncBatch())`, 인증된 POST는 수동 sync를 수행한다. 요청에 딸린 후속 작업은 방문 없는 예약 실행의 증거가 아니다.
- [email-status](/Users/bigmac_moon/dev/ai_score/site/lib/email-status.ts:17)는 `processing:'on_refresh'`를 반환한다. [README](/Users/bigmac_moon/dev/ai_score/site/README.md:26) 역시 무방문 스케줄러가 포함되지 않았다고 설명한다.
- [email-delivery](/Users/bigmac_moon/dev/ai_score/site/lib/email-delivery.ts:14)는 `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL`이 있어야 configured가 되며, 미설정이면 전달 함수가 `configured:false`로 종료한다. 해당 키들의 런타임 실제 값은 조회하지 않았다. 예약 실행 연결과 provider/sender 연결은 서로 독립된 미완료 항목이다.

## 막힘을 해소할 최소 선행 정보

다음 정보는 현재 도구/문서에서 확인되지 않았다. 단순 함수 작성 대신 **Sites 플랫폼 담당 경로의 명시적 지원 확인**이 먼저 필요하다.

1. 관리되는 동일 Site Worker에 `scheduled` export를 보존·호출하는지, 그리고 예약을 선언하는 정확한 지원 manifest/schema 또는 공식 관리 도구가 무엇인지.
2. 그 선언이 실제 배포에 반영되는지, 동일 Site의 트리거를 읽고 수정할 권한 있는 관리 경로가 무엇인지. 로컬 placeholder DB/Worker 이름이나 source repository 쓰기 자격은 Cloudflare 예약 관리 권한이 아니다.
3. 적용된 트리거·배포 버전·실제 실행 시각/성공·실패를 확인할 기록 경로. source-only 설정과 로컬 수동 이벤트 성공은 이 증거를 대신하지 못한다.

현재 지원 경로가 없다면 앱 코드 변경만으로 이 막힘을 해결할 수 없다. 새 provider key를 받아도 trigger 등록 경로는 별도로 필요하고, trigger 지원이 생겨도 검증된 sender와 동의한 실제 수신자 증거 없이는 실메일 완료가 아니다. 이 조사에서 우회 자동화나 다른 인프라를 생성하지 않았다.

## 지원이 확인된 뒤의 최소 구현·검증

아래는 후속 작업 범위 제안이며 구현/실행 결과가 아니다.

1. 기존 vinext fetch를 유지하는 custom Worker wrapper에 scheduled entry를 추가하고 Vite main을 해당 entry로 연결한다. 공식 지원 경로로 UTC 트리거를 등록한다. 사용자별 IANA timezone/HH:mm·동의·상한은 기존 email timing 로직에서 처리한다.
2. HTTP 로그인 헤더를 위조하거나 공개 refresh endpoint를 인증 없이 여는 방식 대신, 서버 내부 함수에 연결한다. 저장된 활성 대상자를 제한된 batch/cursor로 순회하고 기존 계정 격리·삭제·source revision·lease·중복·동의 철회·만료 보호를 재사용한다. 소스 sync도 명시한 실행 주기로 연결하고 오류 기록을 남긴다.
3. 로컬 scheduled event 검사는 handler 연결만 입증한다. Cloudflare가 문서화한 로컬 `/cdn-cgi/local/scheduled` 또는 테스트 harness 호출은 **실제 무인 시간 경과 시험과 분리**한다. [로컬 예약 검사 문서](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
4. 최종 배포에서 공식 트리거 등록을 읽어 확인하고, 브라우저 방문/refresh 없이 최소 두 실행 경계를 지나 실제 실행 기록을 보존한다. 중복 호출·재시도·변경된 동의·time/DST 경계는 기존 정책과 함께 검사한다. `scheduledTime`은 예정 시각이고 실제 처리 시각과 구별해 기록한다. [ScheduledController](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/)
5. 승인된 provider 설정과 sender가 별도로 준비되면 실제 접수 및 수신을 구분해 검증한다. 그 전에는 이메일 미연결 안내와 고정 운영 GAP를 유지한다.

따라서 V16에서 지금 입증할 수 있는 것은 **예약 함수 작성의 기술적 여지와 현재 연결 부재**다. 실제 unattended 운영 지원·등록·실행은 미입증이며, 현 상태를 지원 완료나 게이트 PASS로 바꾸는 근거가 없다.

## 읽은 출력의 SHA-256

아래는 로컬 파일 스냅샷이다. 생산 환경의 trigger 조회 결과 또는 배포 버전 동일성 증거로 사용하지 않는다.

```text
d1975642d60fe15972c0f25feaa958da5716a5a018f5578d7c8612827ea8f61d  site/vite.config.ts
623e419866144fae44f316db72751492b55c8ef59f4874e6afca3577116844d2  site/package.json
8d88a27f56a081e1a4a5b9b2ad2ff519fb66f83b913c576a24a543ef525513d0  site/build/sites-vite-plugin.ts
aa3a9a5b2eb92d139bc75ed280bd049f934f3fc704fc9749212286763cd73666  site/.openai/hosting.json
e6d4e4561517d52837d2b0ea8f86b936ff462e564d22bf099087b06f6f914739  site/dist/server/wrangler.json
c96235ea644a275b642f4ddb139881ae35a2412ccd33e1548575e64f443ea7fc  site/dist/server/index.js
f2be656298e7216f4379a47afeaf900946337276089ceb14a46b4da383d96f91  site/lib/email-status.ts
```
