# V13 성능 독립 계산 — before 기준선

계산 시각: 2026-09-12T13:18:25.555551+00:00 (UTC). 원시 JSON을 읽어 계산했으며 사이트·배포·브라우저·운영 데이터를 변경하지 않았다.

근거: [사전 V13 측정 계획](/Users/bigmac_moon/dev/ai_score/docs/superpowers/plans/2026-09-12-home-streaming.md), [기존 예산·측정 방법](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v7-performance-method.md). 고정 예산은 TTFB ≤800 ms, FCP ≤1800 ms, LCP ≤2500 ms, CLS ≤0.10이다. 초과는 엄격히 `>`로 계산하며 미관측을 0 또는 통과로 채우지 않는다.

표본은 동일 IAB/계정을 사용하는 계획에 따른 앱 문서 실험 관측이다. JSON에는 인증 상태·캐시 냉온·네트워크 제어·서버 내부 시간이 없다. 비로그인·필드 p75·냉캐시·물리 기기·D1 조회 시간의 증거로 해석하지 않는다. /와 /explore를 합쳐 중앙값을 만들지 않는다. /explore는 공유 레이아웃·런타임 조건을 보는 독립 대조이며 무작위 실험의 통제군은 아니다.

문서의 실제 viewport를 사용한다. 1440×900은 최초 요청값이며, 계획의 정정대로 실제 JSON의 1280×720을 기준으로 비교한다. elapsedMs는 관측기 등록 뒤의 길이가 아닌 문서 시간 원점부터 스냅샷까지의 경과시간이다. 초기 10초는 목표이며 실제 편차를 표에 보존한다. 늦은 관측기 등록은 buffered 항목을 회수할 수 있으나 과거 가시성 전체를 복원하지 않는다.

## 파일·조건 검사

예상 파일 6개를 모두 읽었다. 중복 수치라도 삭제하지 않았으며 느린 표본을 포함해 모든 원시 파일의 SHA-256과 수치를 JSON에 보존한다. 별도 샘플 제외·재가중·이상치 절삭은 없다.

| 표본 | 캡처 UTC | 실제 viewport | 문서/스크롤 폭 | elapsed ms | 관측기 시작 ms | 초기/현재/변화 | 프레임 | navigation |
|---|---|---|---|---:|---:|---|---|---|
| before-home-1 | 2026-09-12T12:57:47.756Z | 1280 × 720 | 1265/1265 | 10002 | 1127 | visible/visible/0 | False | reload |
| before-explore-1 | 2026-09-12T12:58:53.994Z | 1280 × 720 | 1265/1265 | 10003 | 4794 | visible/visible/0 | False | navigate |
| before-home-2 | 2026-09-12T12:59:42.829Z | 1280 × 720 | 1265/1265 | 10005 | 5747 | visible/visible/0 | False | navigate |
| before-explore-2 | 2026-09-12T12:59:52.958Z | 1280 × 720 | 1265/1265 | 10003 | 479 | visible/visible/0 | False | navigate |
| before-home-3 | 2026-09-12T13:00:35.372Z | 1280 × 720 | 1265/1265 | 10002 | 5693 | visible/visible/0 | False | navigate |
| before-explore-3 | 2026-09-12T13:06:03.511Z | 1280 × 720 | 1265/1265 | 10002 | 4584 | visible/visible/0 | False | navigate |

검사 결과: 요청한 환경 필드와 네 지표에 누락·무효값이 없고 경로·실제 viewport·프레임·기록된 가시성 조건이 일치한다.

navigation 종류와 관측기 시작 시각은 위 표처럼 그대로 남긴다. visible/변화 0은 등록 이후 기록이며 관측기 시작 전 모든 가시성 이력을 보증하지 않는다. 진단 버튼 등 수동 입력이 LCP 관측 종료에 영향을 줄 수 있으므로 마지막 평생 LCP라고 부르지 않는다.

## 모든 표본과 예산 초과

| 표본 | TTFB ms | FCP ms | LCP ms | CLS | 초과 지표 | 이미지 완료 | 크기 미관측 리소스 |
|---|---:|---:|---:|---:|---|---|---:|
| before-home-1 | 431.1 | 1152.0 | 1152.0 | 0 | 없음 | 9/9 | 24 |
| before-explore-1 | 2383.9 | 4780.0 | 4780.0 | 0 | TTFB, FCP, LCP | 20/20 | 24 |
| before-home-2 | 2581.5 | 4616.0 | 4616.0 | 0 | TTFB, FCP, LCP | 9/9 | 24 |
| before-explore-2 | 85.5 | 500.0 | 500.0 | 0 | 없음 | 20/20 | 26 |
| before-home-3 | 3159.7 | 5436.0 | 5436.0 | 0 | TTFB, FCP, LCP | 9/9 | 24 |
| before-explore-3 | 4215.8 | 4560.0 | 4560.0 | 0 | TTFB, FCP, LCP | 20/20 | 26 |

이미지 완료 수는 캡처 시 DOM의 이미지 결과다. 모든 비동기 콘텐츠의 완성이나 hydration 완료 증거는 아니다. 크기 0/미제공 리소스가 있으면 전체 전송 비용을 확정하지 않는다. 이번 계산은 INP나 라이브러리 good 등급을 새 합격 기준으로 사용하지 않는다.

## 경로별 중앙값·최악값

| 버전·경로 | 지표 | 중앙값 | 최악값 | 최소값 | 예산 초과/관측 | 미관측 |
|---|---|---:|---:|---:|---:|---:|
| before / | TTFB ms | 2581.5 | 3159.7 | 431.1 | 2/3 | 0 |
| before / | FCP ms | 4616.0 | 5436.0 | 1152.0 | 2/3 | 0 |
| before / | LCP ms | 4616.0 | 5436.0 | 1152.0 | 2/3 | 0 |
| before / | CLS | 0 | 0 | 0 | 0/3 | 0 |
| before /explore | TTFB ms | 2383.9 | 4215.8 | 85.5 | 2/3 | 0 |
| before /explore | FCP ms | 4560.0 | 4780.0 | 500.0 | 2/3 | 0 |
| before /explore | LCP ms | 4560.0 | 4780.0 | 500.0 | 2/3 | 0 |
| before /explore | CLS | 0 | 0 | 0 | 0/3 | 0 |

after 수집은 진행 중이다. 이 기준선 보고서는 after 파일을 읽지 않았으며 최종 비교와 개선 판정을 보류한다. 완료 통보 뒤 동일 계산과 원본 해시 검사를 적용한다.

## 재현

스크립트: [ais-v13-performance-independent.py](/private/tmp/ais-v13-performance-independent.py). 원시 파일은 읽기만 하며 출력은 `/private/tmp/ais-v13-performance-independent.*`로 제한한다.

```sh
python3 /private/tmp/ais-v13-performance-independent.py --mode before
```

중앙값은 관측된 유효 수치에 대한 Python statistics.median, 최악값은 max다. 기계 판독 JSON에는 반올림하지 않은 수치·누락 개수·파일 해시가 있다. 화면 표의 ms는 소수점 한 자리, CLS는 소수점 여덟 자리 이내로 표시한다. 고정 게이트·점수는 변경하지 않았다.
