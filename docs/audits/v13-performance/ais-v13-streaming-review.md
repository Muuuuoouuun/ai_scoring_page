# V13 Home 최근글 분리·SSR 스트리밍 읽기 검토

확인일: 2026-09-12. 수정 전 현재 `app/page.tsx`, 설치 React/React DOM 19.2.6·Vinext 1.0.0-beta.5, V7 latency/performance-method 기록을 대조했다. Site·환경·운영·브라우저 변경 없이 소스를 읽었고, 설치 React DOM의 격리된 메모리 스트림 시험만 수행했다. 실제 D1 시간이나 운영 스트리밍 성공을 측정한 보고서가 아니다.

**현재 Home은 하단 최근글 조회가 끝나야 자체 JSX 전체를 반환한다. 최근글만 async Server Component로 옮겨 국소 Suspense 경계 안에 두는 변경은 설치 런타임의 일반 동적 HTML 경로와 맞는다.** 운영 호스트가 그 초기 청크를 바로 전달하고 실제 화면이 먼저 나타나는지는 root의 배포 시험으로 확인해야 한다.

## 현재 기다리는 작업

[page.tsx:9](/Users/bigmac_moon/dev/ai_score/site/app/page.tsx:9)의 `Home`은 아래 SELECT를 `await rows()`한 뒤에야 상단 검색·업데이트·업무 분류·추천 도구·활용법·행사·최근글 전체 `<main>`을 반환한다.

```sql
SELECT id,title,author,kind FROM posts
WHERE status='published' AND parent_id IS NULL
ORDER BY created_at DESC LIMIT 3
```

[db.ts:6](/Users/bigmac_moon/dev/ai_score/site/lib/db.ts:6)는 D1의 `prepare().bind().all()`을 기다린 뒤 `results`를 반환한다. 조회 소요 시간은 미측정이다. 성공한 빈 목록과 조회 예외는 현재 서로 다른 문구로 처리한다. 예외도 거부될 때까지 기다리므로 빠른 오류 fallback이라는 보장은 없다.

[layout.tsx:24](/Users/bigmac_moon/dev/ai_score/site/app/layout.tsx:24)의 사용자 조회는 유지할 별도 의존성이다. [chatgpt-auth.ts:21](/Users/bigmac_moon/dev/ai_score/site/app/chatgpt-auth.ts:21)은 요청 헤더를 읽으며 외부 인증 fetch를 하지 않는다. 뒤의 `waitUntil(syncBatch())`는 완료를 await하지 않는다. 따라서 이번 변경으로 D1·전체 서버 지연의 원인을 확정하거나 인증/동기화 시간을 제거했다고 말할 수 없다.

## 설치된 스트리밍 경로의 실제 근거

| 근거 | 확인한 의미 |
|---|---|
| [React DOM edge 구현:7328](/Users/bigmac_moon/dev/ai_score/site/node_modules/react-dom/cjs/react-dom-server.edge.production.js:7328) | `renderToReadableStream`이 스트림을 반환하는 단계와 `.allReady` promise가 분리되어 있다. 전체 완료 전 shell을 소비할 수 있는 모델이다. |
| [Vinext app-ssr-entry:253](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-ssr-entry.js:253) | React DOM `renderToReadableStream`을 사용하며 `waitForAllReady === true`인 경우만 전체 완료를 await한다. |
| [app-page-render:361](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-page-render.js:361) | 해당 옵션은 비추측 prerender에서 true다. 현재 Home은 `force-dynamic`이고 일반 HTML 방문은 이 전체 완료 대기 조건과 다르다. |
| [app-ssr-entry:285](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-ssr-entry.js:285)와 [app-ssr-stream:376](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-ssr-stream.js:376) | 초기 React 작업 한 번을 기다리고 tick 단위 변환·청크 묶기를 수행한다. 따라서 ‘즉시 0ms 전송’은 아니지만, 이것이 모든 콘텐츠 완료를 기다리는 일반 버퍼링 코드는 아니다. |
| [app-page-response:144](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-page-response.js:144) | HTML body stream을 `new Response(body, ...)`로 반환한다. 일반 경로에서 전체 HTML 문자열을 먼저 만들도록 강제하지 않는다. |

보조 실행: 설치된 `react`와 `react-dom/server.edge`를 Node 메모리에 직접 로드해 `React.use(pendingPromise)`를 Suspense 안에 놓았다. Promise를 해제하기 전에 읽은 첫 청크에 shell과 fallback이 있었고 최종 내용은 없었다. 해제 후 뒤의 청크에 최종 내용이 들어왔다. `shellBeforeRelease=true`, `resolvedAfterRelease=true`였다. 이는 React DOM 경계의 실행 검증이며, Vinext RSC 통합·D1·Sites 프록시·브라우저 페인트 검증은 아니다. 생성 파일은 없다.

프레임워크 RSC 탐색의 범위: [app-page-dispatch:561](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-page-dispatch.js:561)는 RSC 요청에서 pre-render probe를 켠다. [app-page-probe:159](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-page-probe.js:159)는 반환 subtree를 순회하며 내부 async 서버 컴포넌트도 기다릴 수 있다. 로컬 Suspense만으로 이 경로까지 같은 정도로 빨라진다고 확대하지 않는다. **다만 현재 [components/Link.tsx:3](/Users/bigmac_moon/dev/ai_score/site/components/Link.tsx:3)는 plain `<a>`를 반환한다. 일반 프로젝트 링크 클릭은 새 문서 탐색이므로 이를 모두 RSC soft navigation으로 취급하면 틀리다.** 앞선 중간 전달의 ‘내부 링크 탐색 주의’는 실제 router 기반 RSC 요청에 한정한다.

## 가장 작은 변경 경계와 보존 조건

Home은 상단·정적 섹션 JSX를 즉시 반환하게 하고, 최근글 조회 및 성공/빈/오류 분기만 `async RecentDiscussions()`로 이동한다. 해당 JSX를 `<Suspense fallback={...}>` 내부에 두되 `<RecentDiscussions />` 요소로 렌더한다. Home에서 `await RecentDiscussions()` 하거나 SQL promise를 먼저 await하면 목적을 달성하지 못한다.

- **공개 범위:** `published`이며 `parent_id IS NULL`인 원글만, 최신 순서 최대 3개. 숨김·삭제/미공개 글과 답글을 노출하면 안 된다. 기존 조회 필드·글 링크·작성자·글 종류 표시를 유지한다.
- **데이터가 있을 때:** 최근글 제목과 `/community/{id}` 링크를 유지한다. 사용자 입력 제목·작성자를 HTML 문자열로 삽입하지 않고 기존 React text 출력으로 유지한다.
- **성공한 빈 목록:** ‘첫 사용 경험을 남겨보세요.’와 기존 안내·경험 나누기 링크를 유지한다.
- **조회 실패:** ‘커뮤니티에서 경험을 확인하세요.’ / ‘지금은 최근 글을 불러오지 못했습니다.’와 기존 커뮤니티 링크를 유지한다. DB 예외는 async 자식 안에서 잡아 이 상태로 끝낸다. Suspense 자체가 실패 UI를 대신해 주지는 않는다.
- **대기 중:** 위 빈/실패 문구를 미리 보여주지 않는다. ‘최근 사용 경험을 불러오는 중입니다.’처럼 실제 대기 상태를 표시한다. 섹션 제목과 커뮤니티 이동 링크는 경계 밖에 두면 대기 중에도 탐색할 수 있다.
- **시각 안정성:** 최근글 영역의 fallback에 기존 패널/목록과 비슷한 공간을 확보하되 최종 목록·긴 제목을 고정 높이로 잘라서는 안 된다. 좁은 화면에서 대기→목록/빈/오류 전환과 뒤 footer 이동을 관찰한다. status 안내가 반복 전체 낭독을 유발하지 않도록 작은 영역으로 제한한다.
- **나머지 기능:** 홈 검색 GET과 업무 바로가기, 공식 업데이트·도구·활용법·행사 표시 및 행사 빈 상태, 저장/내 도구함 링크, 문서 `main` 앵커와 제목 위계를 그대로 둔다. `force-dynamic`, 인증·권한·소스 확인을 제거하거나 공유 HTML 캐시를 새로 넣는 변경은 필요하지 않다.

## 회귀·효과 검증의 최소 구체안

1. **실제 분리 컴포넌트로 pending→결과 시험:** D1 helper의 완료를 통제하는 로컬 fixture를 연결한 동일 SSR 경로에서, release 이전 HTML 청크에 홈 h1·검색·정적 섹션·대기 안내가 있고 최근글은 없는지 확인한다. release 후 그 글이 들어오는지 확인한다. 인위 지연은 ‘스트리밍 순서 시험용’으로만 기록하고 운영 D1 지연의 근거로 쓰지 않는다. 단순 `<Suspense>` 소스 문자열 검사는 이 동작을 검증하지 못한다.
2. **실제 결과 분기·공개 필터 시험:** published 원글 여러 개, published 답글, hidden 원글을 섞은 fixture로 최신 원글 3개만 나오는지 확인한다. 별도로 0건과 reject를 주어 기존 빈/실패 문구 및 커뮤니티 링크가 유지되는지 본다. 오류를 일부러 만든 시험은 로컬에만 한정한다. 기존 API 권한·moderation 테스트도 관련 회귀 확인에 재사용한다.
3. **현재 배포 기준 전후 비교:** 동일 계정·브라우저·실제 앱 문서 viewport·진단 query·캐시/네트워크 정책으로 새 문서 로드를 반복하고 모든 유효 표본을 보존한다. 첫 바이트만 일찍 왔는지에 더해 상단 검색이 실제 먼저 보이고 사용할 수 있는지, 하단 최종 상태가 나타나는지를 관찰한다. 브라우저의 내부 링크도 현재 plain anchor 경로로 다시 확인한다.
4. **지표 해석:** V7 [latency-review](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v7-latency-review.md)와 [performance-method](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v7-performance-method.md)의 범위를 유지한다. TTFB는 DB 시간이나 hero 표시 시간이 아니며, 스트리밍 후 responseEnd/DOM 완료는 FCP보다 훨씬 늦을 수 있다. iframe에서 제공되지 않는 paint/CLS는 미관측으로 남기고 대체 관찰의 실제 명칭을 쓴다. 초기 10초 목표 시점에 하단이 미완료면 그대로 기록하고, 별도 완료 이후 안정성 관찰을 초기 표본으로 바꾸지 않는다.
5. **전체 경계 확인:** 1440px급/375–390px급 실제 viewport에서 하단 대기→최종 전환의 문서 이동·가로 overflow·긴 제목 줄바꿈, 검색 제출·최근글·커뮤니티 링크, 콘솔/Worker 오류를 확인한다. build/TSC와 해당 기능 테스트 성공은 기본 검증이며 운영 프록시의 조기 청크 전달을 증명하지는 않는다.

결과 보고는 ‘하단 조회를 첫 홈 JSX의 필수 대기에서 분리했다’와 실제 전후 관측을 구분한다. V7의 2.7–4.7초 TTFB를 이번 D1 조회 탓으로 확정하거나, 격리된 React 시험을 운영 성능 개선 수치로 제시할 근거는 없다. 현재 상태에서 작은 Suspense 변경은 타당한 후보이며, 실제 개선 정도와 전체 완료 시각은 root의 운영 전후 기록으로 결정해야 한다.
