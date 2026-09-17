# V13 Home streaming 독립 최종 검토

검토일: 2026-09-12. Site 파일·Git·브라우저·배포·운영 데이터는 변경하지 않았다. 현재 Home, 이식된 테스트, README 및 V13 계획을 읽고 실제 React RSC 검사를 실행했다. 이 보고서는 서버 스트림 의존성 검증이며 속도 점수나 운영 배포 성공 판정이 아니다.

## 결론

**이식된 테스트 4/4 GREEN, 원본 독립 fixture 4/4 GREEN, 두 명령 모두 exit 0.** 확인 범위에서 새 데이터 누락이나 뜻하지 않은 기능 변경을 발견하지 않았다. 유지할 기능을 제거하지 않고 최근 공개 글의 D1 대기만 하단 Suspense 경계로 분리했다.

```sh
cd /Users/bigmac_moon/dev/ai_score/site
node --conditions=react-server --test tests/home-streaming.mjs
node --conditions=react-server /private/tmp/ais-v13-streaming-test-proposal.mjs
```

실행 환경: Node v24.18.0, React 19.2.6, `react-server-dom-webpack/server.node`의 실제 `renderToReadableStream` 및 `registerClientReference`. 실제 Home/Link/catalog/content/billing/db 소스를 TypeScript react-jsx로 VM 로드했다. 실제 전체 SQLite 마이그레이션을 메모리에 적용하고 D1 read promise만 명시적으로 보류했다. ToolUI·Icons만 RSC client reference로 대체했다.

## RED → GREEN 및 상태 검증

| D1 미완료 상태의 관찰 | 변경 전 RED | 변경 후 GREEN |
|---|---|---|
| 히어로 본문 | 미출력 | 출력 |
| `/search` form action | 미출력 | 출력 |
| 실제 Link의 보고서 작성 검색 href | 미출력 | 출력 |
| 조회 대상 게시글 | 미출력 | 미출력 |
| D1 해제 후 실제 게시글 | 출력 | 출력 |

변경 전 Home SHA256은 `810663475dc2a83450390f37a7104df83ef389a2ea46bc29542ccf45d8083782`였다. 변경 전에는 3 PASS / 1 의도된 assertion FAIL, exit 1이었으며, 변경 후 동일 조건에서 모두 통과했다. 각각 실제 recent-posts SELECT는 1회였다.

기존 네 검사는 다음을 확인한다.

1. 게시글 조회가 미완료여도 히어로·검색이 먼저 스트림에 나오고 해제 후 실제 공개 글이 뒤따른다.
2. 실제 SQL이 최신 published 최상위 글 3개를 내림차순으로 반환하고, 네 번째 글·hidden·deleted·draft·reply를 제외한다. 실제 `/community/public-first` 링크가 유지된다.
3. 빈 결과는 `첫 사용 경험을 남겨보세요.`와 경험 나누기 링크를 출력한다. 임의 게시글이나 실패 안내로 바꾸지 않는다.
4. D1 실패는 히어로를 유지하면서 `지금은 최근 글을 불러오지 못했습니다.`와 커뮤니티 링크를 출력한다. 빈 상태와 구분되며 처리되지 않은 RSC 오류가 없다.

추가 독립 검사도 소스 파일을 수정하지 않고 원본 fixture에 메모리로 붙여 실행했다(기존 네 검사 + 추가 한 검사 = 5 PASS, exit 0). 추가 검사는 빈 결과와 D1 실패 두 경우 모두 pending 단계에서 로딩 문구 및 `role="status"`가 출력되고, 빈/실패 최종 문구는 아직 없음을 확인했다. 조회 완료 후에는 해당하는 빈/실패 문구만 출력되며 각각 SELECT 1회였다. 이 추가 pending-state assertion은 현재 Site 테스트 네 개에 포함된 항목이라고 주장하지 않는다.

## 소스·문서 검토

- `site/app/page.tsx:10`: 기존 SELECT 조건·정렬·LIMIT 3, title/author/kind 표시, 실제 게시글 링크, 빈 상태와 catch 안내를 `RecentDiscussions`로 그대로 옮겼다. 공개/비공개 경계의 변경이나 쿼리 복제는 확인되지 않았다.
- `site/app/page.tsx:13`: Home 자체는 동기 서버 컴포넌트이며, 최근 사용 경험 제목·커뮤니티 링크는 Suspense 밖에 있다. 경계 안에는 `RecentDiscussions`만 있고 fallback은 실제 조회 진행 안내다. 조회가 즉시 끝나는 환경에서 fallback이 눈에 보이지 않을 수 있으며, 이는 조건부 표시의 정상 범위다.
- 같은 줄의 히어로·업무별 탐색·공식 업데이트·추천 도구·가이드·개인 도구함·다가오는 행사의 데이터와 링크는 보존되었다. `dynamic='force-dynamic'`도 유지된다. 변경으로 공유 캐시나 가공된 운영 기록이 추가되지는 않았다.
- 새 `minHeight:224`는 하단 커뮤니티 영역에만 있으며 실제 글이 길면 늘어날 수 있다. 이것만으로 CLS 예산 통과나 모든 줄바꿈/뷰포트에서 안정된 높이를 보장하지 않는다.
- `site/tests/home-streaming.mjs:21`: root를 `import.meta.url` 기준으로 구해 테스트의 절대 작업 경로 의존성을 없앴다. 실제 Site 소스/마이그레이션을 계속 읽는다. React 19.2.6 고정 assertion은 런타임 변경 시 재검토를 요구하는 명시적 경계다.
- `site/README.md:39`: 일반 회귀와 별도로 `--conditions=react-server --test tests/home-streaming.mjs` 실행법을 명시하며 이를 서버 스트리밍 **의존성 검사**라고 부른다. 관찰 범위를 속도 측정이나 운영 성공으로 확대하지 않는다.

## 남겨둔 검증 경계

Flight 스트림 바이트는 브라우저 HTML 페인트나 hydration 결과가 아니다. 누적 스트림에는 초기 fallback 레코드도 남으므로, 바이트 문자열만으로 화면에서 로딩 패널이 제거되는 것을 판정하지 않았다. 실제 로딩→공개 글/빈 상태의 교체, 최소 높이의 효과, 모바일 줄바꿈, 키보드·스크린리더 동작, Vinext/호스팅의 버퍼링, TTFB/FCP/LCP/CLS는 root의 실제 브라우저·배포 측정으로 별도 확인해야 한다. 테스트 실행기의 ms 및 5초 harness watchdog은 성능 기준이 아니다. 전체 회귀·타입 검사·빌드는 이 독립 검토에서 중복 실행하지 않았다.

## 검토한 파일 해시

| 파일 | SHA256 |
|---|---|
| `site/app/page.tsx` | `e3f58bf33d02bb1ae0cbc8dcfc7b708820fa066f15781b3d862e5792a6f14e71` |
| `site/tests/home-streaming.mjs` | `782b55d8d6014e5cf2d75d64a39f48927e70303472bf69064e865394311adc3d` |
| `site/README.md` | `64e7f785566446ef79a2be032a529754080ac709b70f801aeb4a1a3c5a5b6832` |
| `/private/tmp/ais-v13-streaming-test-proposal.mjs` | `7e056da54d7aa5b1bcc4321465b45e63bd98c9ee5386404d00fe1e86ddfc431a` |

고정 게이트·가중치·점수는 평가하거나 변경하지 않았다.
