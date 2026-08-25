# g2 — 도구 도입 판단을 위한 리뷰

SaaS와 AI 도구를 사람의 판단 관점에서 리뷰합니다.
점수마다 근거를, 비교마다 되는 것과 안 되는 것을 함께 적습니다.

## 핵심 동선

```
문제 상황 고르기  →  후보 3~5개  →  2~3개 나란히 비교  →  결정
```

문제 상황은 **공유 태그**입니다. 모든 태그가 3개 이상 도구에 걸리므로
한 문제를 눌렀을 때 항상 비교할 후보가 나옵니다(`tests/problem-tags.test.ts`가 강제).

## 시작하기

```bash
npm install
npm run dev          # http://localhost:4001
```

DB 없이도 전부 동작합니다. 커뮤니티 기여만 메모리에 저장되어 재시작 시 사라집니다.

### 커뮤니티 기여를 영구 저장하려면

```bash
cp .env.example .env.local     # DATABASE_URL, G2_AUTHOR_SECRET 채우기
npm run db:setup               # db/community.sql 적용 (여러 번 실행해도 안전)
npm run dev
```

## 테스트

```bash
npm test         # 메모리 저장소로
npm run test:db  # DATABASE_URL을 붙여 Postgres 어댑터까지
```

`tests/community-store.test.ts`는 **메모리와 Postgres 두 구현에 같은 테스트를 돌립니다.**
어댑터를 바꿔도 화면 동작이 달라지지 않는다는 것을 이걸로 보장합니다.

## 이 저장소가 지키는 규칙

리뷰 사이트에서 가장 쉽게 무너지는 건 "그럴듯한 가짜"입니다.
아래는 코드와 테스트로 강제하고 있는 규칙입니다.

| 규칙 | 강제하는 곳 |
| --- | --- |
| 점수에는 근거가 반드시 붙는다 | `ScoreFacet` 타입, `lib/validators.ts`, 화면 노출 |
| 어떤 문장도 도구 간에 공유되지 않는다 | `tests/review-integrity.test.ts` |
| 확인되지 않은 변경 이력은 지어내지 않는다 | 빈 배열 + "확인된 변경 이력 없음" 표시 |
| 확인 시점을 적었다면 확인한 사람도 있어야 한다 | `tests/review-integrity.test.ts` |
| 표본 3 미만에서는 평균을 만들지 않는다 | `lib/community/consensus.ts`, `db/community.sql`의 뷰 |
| 반박에는 20자 이상 근거가 필요하다 | 타입 상수 하나를 API·메모리·DB 세 곳이 공유 |
| 리뷰가 없는 도구는 화면에 올라가지 않는다 | `data/tools.ts`가 빌드 시점에 실패 |

> ⚠️ 현재 리뷰 본문은 **검수 전 초안**입니다. 모든 도구 화면에 그렇게 표시됩니다.
> 공개 전 확인이 필요한 항목은 `docs/review-verification-queue.md`에 정리되어 있습니다.

## 구조

```
data/
  tools.ts           도구 기본 사실 (리뷰가 없으면 빌드 실패)
  reviews.ts         도구별 리뷰 본문 — 편집 콘텐츠의 진실 출처
  problem-tags.ts    공유 문제 태그
  problem-angles.ts  도구 × 태그별 되는 것 / 안 되는 것
lib/
  problems.ts        태그 조회
  tools.ts           검색 (클라이언트·서버가 같은 함수를 씁니다)
  insights.ts        총점 계산만 — 파생 로직 없음
  community/         저장소 인터페이스 · 메모리/Postgres 어댑터 · 집계 · 익명 저자
db/community.sql     커뮤니티 스키마
```

도구와 리뷰는 **git이 진실의 출처**이고, DB는 사용자 기여만 소유합니다.
그래서 커뮤니티 테이블은 `tools`에 외래키를 걸지 않습니다.

## API

| | |
| --- | --- |
| `GET /api/tools` | 전체 도구 |
| `GET /api/tool/:id` | 도구 하나 |
| `GET /api/search?tag=&query=&badges=&teamSize=` | 검색. 태그로 찾으면 매칭 이유가 함께 옵니다 |
| `POST /api/tool` | 도구 생성 (검증만, 저장 없음) |
| `GET/POST /api/tools/:id/dissent` | 항목별 반박 |
| `GET/POST /api/tools/:id/decisions` | 도입 결정 기록 |
| `GET/POST /api/tools/:id/breakage` | 고장 제보 (검수 전까지 비공개) |
| `POST /api/decisions/:id/recheck` | "지금도 쓰나요" 갱신 (본인만) |
