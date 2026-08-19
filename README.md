# g2 Judgment MVP

A judgment-driven review and curation platform for SaaS and AI tools. This MVP emphasizes human impact, cognitive trade-offs, and problem-first discovery.

## What's included
- **Next.js UI** with landing, search, tool review, and about pages.
- **Judgment-first data model** with human impact scores and verdict badges.
- **API routes** for tools, search, and admin creation with validation.
- **PostgreSQL schema** for production persistence.
- **Integration tests** for API endpoints.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:4001](http://localhost:4001).

## Tests

```bash
npm test
```

## Design system
디자인 토큰, 타이포그래피 스케일, 테마 규칙은 `docs/design-system.md`에 정리되어 있습니다.
색상·간격을 바꿀 때는 컴포넌트 CSS가 아니라 `app/globals.css` 상단의 토큰을 수정하세요.

## Database schema
The PostgreSQL schema lives in `db/schema.sql`. Wire this up with your preferred ORM or query layer for production.

## API Endpoints
- `GET /api/tools`
- `GET /api/tool/:id`
- `GET /api/search?query=&problem=&badges=`
- `POST /api/tool` (admin)

## Admin
Use the seeded admin ID for admin-only actions:
`admin-9e9b87f3-7b17-4ab9-9c3a-15359e0a2f95`
