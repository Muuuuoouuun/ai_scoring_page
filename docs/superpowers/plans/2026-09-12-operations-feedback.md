# Operations Feedback Implementation Plan

> Root owns Site code and publication. Independent agents review requirements, security/data boundaries and observed UI; they do not modify the Site.

**Goal:** Complete the required optional information/personal feedback paths and clearly defined operating metrics without claiming scheduled/email operations are complete.

**Architecture:** Shared question definitions, one per-session/actor/scope/version database record, same-origin API, optional footer modal and admin aggregates. Reuse Provider, Modal, D1/Drizzle, export and account deletion.

**Tech Stack:** Existing React/TypeScript/Vinext, D1 SQLite, Drizzle and Node test harness. No new dependencies or external analytics.

- [x] Add real API regression tests in `tests/feedback.test.mjs` for guest/personal authentication, duplicate starts and response replacement, actor/session isolation, invalid origin/fields, question version, pending/not-tried/undecided denominators, export and erasure. Run them and capture expected failures before implementing handlers.
- [x] Add `feedback_sessions` to `db/schema.ts` and generate migration with `npm run db:generate`. Store hashed session+server actor, scope/version, page kind, response/comment, start/answer/update times. Unique session/scope/version; no raw session token, query or private record snapshot.
- [x] Implement shared definitions in `lib/feedback-config.ts`, record operations/aggregates in `lib/feedback.ts`, and POST start/answer/delete in `app/api/feedback/route.ts`. Existing `input` validates Origin/size; personal scope calls authenticated server identity. Use parameterized SQL and idempotent start.
- [x] Integrate export/whole-account deletion and administrator-only feedback summary/recent answers. Every query uses current actor or administrator boundary; guest feedback never appears in another user's export.
- [x] Implement `components/Feedback.tsx`, footer entry and `components/FeedbackReport.tsx` in Admin. Preserve fields on errors, safely cancel stale completion, present truthful denominators and empty data. Update privacy/README to state exact collection and anonymous-tab recovery limits.
- [x] Run `node --experimental-strip-types --test tests/*.test.mjs`, `npx tsc --noEmit` and independent API review. Use local browser for actual save/reopen/edit/delete and narrow-screen/focus paths; no invented production user feedback.
- [x] Build with the literal Sites helper, commit/push exact validated Site source, package/save/deploy privately with unchanged audience. Observe production entry/admin state and errors, preserve the existing Site tab, and record scheduling/email gaps separately.
- [x] Update durable audits and fixed worksheet evidence only where proved. No current umbrella gate is presumed PASS solely from this feedback feature.

Evidence: `docs/audits/2026-09-12-v12-feedback-verification.md`. No fixed score increase or whole-goal completion claimed.
