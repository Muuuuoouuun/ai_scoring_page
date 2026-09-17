# V12 운영 정기 실행 지원 경로 조사

확인일: 2026-09-12, 마지막 설정 확인 12:22:07 UTC. 설치된 Sites 플러그인 0.1.66의 문서·스크립트와 현재 로컬 Site 구성·설치 의존성만 읽었다. Sites 도구, 배포, 자격 증명 발급, 브라우저, 환경·소스 변경은 하지 않았다. 이 보고서 이외의 파일은 작성하지 않았다. 운영 제어면의 실제 트리거 목록을 조회한 결과가 아니다.

**결론: 현재 소스에는 방문 없는 정기 실행 경로가 구성되어 있지 않다. 설치된 Sites 문서·스크립트에서도 이를 등록하는 지원 경로를 확인하지 못했다.** 일반 Cloudflare Workers/Wrangler가 Cron Trigger를 지원한다는 근거는 있으나, Sites가 해당 설정을 받아 실제 운영 Worker에 등록한다는 근거와는 구분해야 한다. 따라서 이번 조사만으로 ‘Sites 자체 cron 지원 불가’라고 단정할 수는 없지만, ‘wrangler에 crons를 넣으면 현재 Sites에서 작동한다’고 구현·완료 처리할 근거도 없다.

## 1. 현재 앱의 실행 경로

| 경로 | 실제 확인 | 방문이 없을 때의 의미 |
|---|---|---|
| 페이지 요청 | [layout.tsx:24](/Users/bigmac_moon/dev/ai_score/site/app/layout.tsx:24)에서 사용자 조회 후 `waitUntil(syncBatch())` 호출 | 이 코드에 진입하는 요청이 먼저 필요하다. `waitUntil` 호출 자체가 다음 시간의 실행을 등록하지 않는다. |
| 소스 API | [sources/route.ts:7](/Users/bigmac_moon/dev/ai_score/site/app/api/sources/route.ts:7) GET이 동일 작업을 시작하고, POST는 인증된 `refresh` 요청에서 `syncBatch(true)` 실행 | 현재는 요청에 반응하는 두 진입점이다. |
| 동기화 주기 제한 | [source-sync.ts:15](/Users/bigmac_moon/dev/ai_score/site/lib/source-sync.ts:15)는 최근 실행 후 일반 1시간/강제 1분 이내면 생략, 60초 lease, 오래된 순서로 도구 3개 처리 | ‘1시간 경과 후 자동 실행’이 아니라 ‘다음 호출을 받아도 너무 이르면 생략’이다. 20개 전체 확인에도 최소 여러 번의 호출이 필요하다. |
| 알림 생성·이메일 발송 | [notifications/route.ts:12](/Users/bigmac_moon/dev/ai_score/site/app/api/notifications/route.ts:12)의 인증된 POST `refresh`에서 현재 `userId`에 대해 `generateNotifications`와 `deliverEmailForUser` 호출 | 현재 소스에는 모든 대상 계정을 순회하는 예약 진입점이 없다. 소스 동기화만 예약해도 개인 알림 발송까지 자동으로 연결되지는 않는다. |

위 함수들의 앱 내 호출 위치를 `rg`로 전수 확인했다. 알림 GET은 기존 표시 대상을 읽으며, POST refresh의 생성·발송 경로를 대신하지 않는다. 이 평가는 호출 경로에 대한 소스 판독이며, 실제 이메일 발송 시험은 수행하지 않았다.

## 2. 현재 Worker와 Sites 배포 계약의 근거

1. [vite.config.ts:14](/Users/bigmac_moon/dev/ai_score/site/vite.config.ts:14)의 `localBindingConfig`는 `main: "vinext/server/fetch-handler"`, Node 호환 플래그, 로컬 D1/R2 바인딩만 구성한다. `.openai/hosting.json`의 키는 `d1`, `r2`, `project_id`뿐이다. 예약 트리거 선언은 없다.
2. 현재 [생성 Wrangler 설정](/Users/bigmac_moon/dev/ai_score/site/dist/server/wrangler.json)의 선택 필드를 읽은 결과는 `main: "index.js"`, `triggers: {}`, 빈 queue producer/consumer 배열, 빈 Durable Object bindings다. 이는 로컬 생성 산출물의 상태이며 운영 제어면 설정 조회를 대체하지 않는다.
3. [Vinext fetch-handler:1](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/fetch-handler.js:1)은 가상 Worker 엔트리를 위임한다. 현재 App Router용 [app-router-entry.js:18](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-router-entry.js:18)의 default 객체는 `fetch`만 구현한다. Pages Router 엔트리도 같은 형태다. fetch-handler의 커스텀 Worker 위임 예제는 추가 엔트리 작성 가능성의 근거이지, Sites에서 예약을 등록해 준다는 근거가 아니다.
4. 설치된 [sites-building/SKILL.md:207](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-building/SKILL.md:207)는 Worker ESM의 default callable `fetch(request, env, ctx)`를 요구한다. [같은 문서:218](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-building/SKILL.md:218)는 실제 Cloudflare 자원과 배포 연결을 Sites가 소유한다고 명시한다.
5. [sites-hosting/SKILL.md:26](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-hosting/SKILL.md:26)는 `.openai/hosting.json`에 project ID, 선택적 static 설정, 논리 D1/R2, 요청한 **지원 capabilities**만 저장하도록 한다. 열람한 문서에는 cron capability 이름·선언 형태·등록 API가 없다. 임의의 `cron` capability 또는 `triggers` 키를 이 파일에 추가하는 것을 지원된 경로로 볼 수 없다.
6. [build-site.mjs:12](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/scripts/build-site.mjs:12)는 패키지 build 스크립트를 실행한다. [Site의 sites-vite-plugin.ts:172](/Users/bigmac_moon/dev/ai_score/site/build/sites-vite-plugin.ts:172)는 빌드 후 hosting 메타데이터와 migration을 복사한다. [package-site.sh:13](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-hosting/scripts/package-site.sh:13)는 staging과 tar 포장을 수행한다. 여기에는 시간 트리거 등록 코드가 없다.
7. [prepare-site-build.cjs:139](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-hosting/scripts/prepare-site-build.cjs:139)는 dist를 재귀 복사하므로 생성 Wrangler 파일이 archive에 들어갈 수는 있다. **파일이 포장된다는 사실만으로 Sites 서버가 그 파일의 cron 설정을 운영에 적용한다고 추론하면 안 된다.**

범위 확인: 플러그인의 `scripts/`, `skills/sites-hosting/`, `skills/sites-building/references/`, starter의 `build/`와 `scripts/`를 대상으로 `cron|scheduled|scheduler|triggers|alarms|queues` 검색을 수행했다. 이 범위에서는 예약 기능 관련 문서·등록 구현을 찾지 못했다. 실행하지 않고 소스만 읽었다. 비공개 서비스 내부나 향후 플랫폼 기능의 부재를 증명하는 검색은 아니다.

## 3. 일반 Cloudflare 기능과 현재 Sites의 차이

설치된 Wrangler 4.92.0의 [config-schema.json:116](/Users/bigmac_moon/dev/ai_score/site/node_modules/wrangler/config-schema.json:116)은 `triggers.crons: string[]`를 정의하고 Worker의 `scheduled` 함수를 주기적으로 호출하는 설정이라고 설명한다. 설치된 [Workers 타입:533](/Users/bigmac_moon/dev/ai_score/site/node_modules/@cloudflare/workers-types/index.d.ts:533)도 `scheduled?: ExportedHandlerScheduledHandler`를 정의한다. 따라서 일반 Workers에는 해당 런타임 이벤트와 설정 모델이 존재한다.

현재 앱에 이를 적용하려면 최소한 **런타임 scheduled handler**, **Sites 운영 제어면이 트리거를 등록하는 지원 계약**, **그 handler에서 현재 D1/R2에 접근하는 바인딩**이 함께 확인되어야 한다. 지금 확인한 것은 첫 요소를 작성할 때 참고할 일반 타입·설정 모델까지다. 예약 등록 또는 실제 예약 호출은 확인되지 않았다. 현재 generated config를 수동 수정하거나 장기 `setInterval`을 시작하는 것만으로 운영 정기 실행을 달성했다고 볼 수 없다.

## 4. 대안의 실행 호스트·인증 의존성

| 대안 | 실행 호스트 | 현재 확인된 한계 |
|---|---|---|
| Sites가 공식 제공하는 예약 기능 | Sites 관리 런타임 | 이번 패키지 조사에서는 등록 경로가 미확인. 지원 문서·capability/제어면 계약 확보 전 적용 가능하다고 표현하지 않는다. |
| 별도 관리형 스케줄러가 Site의 HTTP 작업 엔드포인트 호출 | 별도 클라우드/CI 서비스 | 로컬 Mac 상시 실행은 피할 수 있으나 별도 서비스 설정·실행 기록·인증이 필요하다. 현재 개인 알림 API는 방문자 ID에 연결되어 있어 별도 운영용 계약도 필요하다. |
| 별도 Cloudflare Worker의 Cron Trigger가 직접 작업 수행 | 별도 Cloudflare 관리 런타임 | 일반 지원 모델은 설치 schema로 확인된다. 그러나 Sites 소유 D1/R2를 다른 Worker에서 자동으로 사용할 수 있다는 근거는 없다. 명시적인 자원 접근·바인딩 또는 인증된 앱 호출 경로가 필요하다. |
| 로컬 cron/launchd 또는 Codex 로컬 자동화 | 사용자 컴퓨터/로컬 실행 호스트 | 호스트의 실행 가능 상태와 네트워크에 의존한다. Codex 자동화의 제공된 도구 계약도 로컬 실행을 명시하며, Sites 런타임 자체 예약의 증거가 아니다. 이번 조사에서 생성·실행하지 않았다. |
| 현재 방문 시 동기화·수동 알림 새로고침 | 방문 요청을 처리하는 Site | 현 구현은 이 방식이다. 방문 없는 상태의 자동 실행 요구를 충족하지 않는다. |

외부 HTTP 스케줄러의 특히 중요한 경계: 설치된 [authentication.md:12](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-building/references/authentication.md:12)는 private Sites의 모든 방문자에게 로그인을 요구한다고 명시한다. [같은 문서:35](/Users/bigmac_moon/.codex/plugins/cache/openai-bundled/sites/0.1.66/skills/sites-building/references/authentication.md:35)는 로그인 시작을 dispatch 소유 경로로 제한하며, API는 서버에서 사용자 신원을 검사하도록 한다. **private 배포에는 앱의 `CRON_SECRET` 검사만 추가한다고 외부 호출이 dispatch 인증을 통과하는 것이 아니다.** 정식 machine identity/서비스 호출 경로가 별도로 확인되어야 한다. 로컬 개발 플러그인의 테스트 사용자 헤더 주입은 운영 인증 경로가 아니다. 이번 조사에서는 운영 access policy 자체를 다시 조회하지 않았으므로 이 제약은 private 배포에 대한 조건부 판단이다.

## 5. 이번 V12에서 사실대로 말할 수 있는 범위

현 구현은 ‘요청 시 조건부 소스 확인, 인증된 새로고침 시 해당 사용자 알림 생성·발송’이다. ‘방문 없는 정기 동기화·알림’은 아직 운영 지원 경로와 실행 증거가 확보되지 않았다. 다음 설계의 선행 조건은 코드 추가량이 아니라 지원된 예약 등록 방식 또는 외부 실행자의 정식 인증·자원 접근 방식 확인이다. 이 중 하나가 확인된 뒤 실제 예약 시각·실행 결과·중복 방지·계정별 동의 확인 기록으로 무방문 동작을 입증해야 한다. 이번 읽기 조사로 해당 요구나 품질 게이트를 완료 처리할 근거는 없다.
