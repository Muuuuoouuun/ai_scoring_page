# TOPAI Judgment MVP

같은 문제를 겪는 팀들이 어떤 도구를 놓고 무엇을 포기했는지, 근거와 함께 나란히 봅니다.
점수마다 근거를, 비교마다 되는 것과 안 되는 것을, 그리고 쓰지 말아야 할 조건을 함께 적습니다.

## What's included
- **Next.js UI** with landing, search, tool review, and about pages.
- **Judgment-first data model** with human impact scores and verdict badges.
- **API routes** for tools, search, and admin creation with validation.
- **Genre filters** for AI, IT, GitHub Project, and SaaS discovery.
- **Reddit-style community surfaces** with votes, comments, sorting, and genre boards.
- **PostgreSQL schema** for production persistence.
- **Integration tests** for API endpoints.

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
cp .env.example .env.local     # DATABASE_URL, AIS_AUTHOR_SECRET 채우기
npm run db:setup               # db/community.sql 적용 (여러 번 실행해도 안전)
npm run dev
```

## 테스트

```bash
npm test         # 메모리 저장소로
npm run test:db  # DATABASE_URL을 붙여 Postgres 어댑터까지
```

## Design system
디자인 토큰, 타이포그래피 스케일, 테마 규칙은 `docs/design-system.md`에 정리되어 있습니다.
색상·간격을 바꿀 때는 컴포넌트 CSS가 아니라 `app/globals.css` 상단의 토큰을 수정하세요.

## Database schema
The PostgreSQL schema lives in `db/schema.sql`. Set `DATABASE_URL` to persist reviews, patch updates, and audit logs in Postgres. Without `DATABASE_URL`, the API uses an in-memory local fallback.

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

## API Endpoints
- `GET /api/tools`
- `GET /api/tool/:id`
- `GET /api/search?query=&problem=&badges=`
- `GET /api/search?genres=ai,it,githubProject,saas`
- `POST /api/tool` (admin)
- `GET /api/tool/:id/reviews`
- `POST /api/tool/:id/reviews`
- `GET /api/tool/:id/patches`
- `POST /api/tool/:id/patches` (admin)
- `GET /api/audit?toolId=` (admin)

## Admin
Use the seeded admin ID for admin-only actions:
`00000000-0000-0000-0000-000000000001`
