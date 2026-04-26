# TOPAI Judgment MVP

A judgment-driven review and curation platform for SaaS and AI tools. This MVP emphasizes human impact, cognitive trade-offs, and problem-first discovery.

## What's included
- **Next.js UI** with landing, search, tool review, and about pages.
- **Judgment-first data model** with human impact scores and verdict badges.
- **API routes** for tools, search, and admin creation with validation.
- **Genre filters** for AI, IT, GitHub Project, and SaaS discovery.
- **Reddit-style community surfaces** with votes, comments, sorting, and genre boards.
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
