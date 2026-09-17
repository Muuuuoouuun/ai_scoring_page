# Database Setup

The app uses PostgreSQL when `DATABASE_URL` is configured. Without it, review and patch APIs fall back to an in-memory store for local development and tests.

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

The API seeds a tool row on first review or patch write, using the curated data from `data/tools.ts`. The schema still needs to be applied before those writes can persist.
