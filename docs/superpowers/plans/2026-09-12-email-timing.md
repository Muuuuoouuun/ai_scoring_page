# Email Timing and Delivery Implementation Plan

> **For agentic workers:** Use the reviewed spec and test-first execution with independent subagent review. Only root writes the Sites checkout or publishes it; reviewers write /private/tmp. This respects the established Sites ownership rule and the user's standing approval.

**Goal:** Make saved email mode/time/zone actually determine grouped dispatch, while preserving consent, exact retries, quotas and private history.

**Architecture:** A pure Intl calendar module determines receiving windows. A private D1 delivery module plans immutable batches under a per-user lease and settings revision, while email_outbox retains per-notice identity. Existing authenticated refresh calls the same pipeline; missing production scheduler/provider remains explicit.

**Tech Stack:** Installed TypeScript5.9, React19.2.6/Vinext, D1 SQLite/Drizzle, Intl and Resend HTTP contract; no additional dependency.

Reference: ../specs/2026-09-12-email-timing-design.md. Current source ac64bc580e198ca8e7a3f7342752a5e28a6b097e. Preserve V13 source/test performance evidence.

## 1. Freeze behavior and RED evidence

- [x] Read independent timing vectors and architecture review; resolve ambiguous transition/empty-slot behavior in the spec before implementing it.
- [x] Preserve /private/tmp/ais-v14-email-red.test.mjs/.json/.tap/.md in docs/audits/v14-email-timing. Root reruns current reproduction with its output retained before source changes.
- [x] Add tests/email-delivery.test.mjs for real settings route behavior. First assertions: saving `{emailMode:'digest',emailTimeZone:'Asia/Seoul',emailTime:'09:00'}` returns the same values; bad zone or `24:00` returns400; consent-off changes own queued/failed to cancelled atomically, leaving others/sent/review rows alone.
- [x] Run `node --test tests/email-delivery.test.mjs`; require intended assertions to fail before production edits. Keep an independently controlled fetch mock with network forbidden.
- [x] Extend tests/api-harness.mjs with optional clock factory for VM Date; preserve the default real clock and existing API. Freeze dates in new time-sensitive tests instead of using the wall clock.

## 2. Calendar decisions

Files: new lib/email-timing.ts and tests/email-timing.test.mjs; lib/validation.ts.

- [ ] Write independent vectors as failing tests before implementation. API: `emailSchedule(settings)`, `emailLocalParts(instant,timeZone)`, `emailDueOnDate(date,schedule)`, `emailWindow(instant,schedule,guard?)`.
- [x] Canonicalize a valid named zone through Intl.DateTimeFormat; validate HH:mm exactly, enum digest/matched. The schedule defaults remain visible and all three values round-trip.
- [x] Resolve normal/fold wall time using sampled surrounding UTC offsets, verify candidate round-trip and choose earliest match. For a gap inspect the bounded candidate interval minute-by-minute and choose the first valid later minute on that date. If no instant belongs to the date, return null and advance to the next existing date. Avoid a long minute scan on normal calls.
- [x] For a digest record a consumed local slot and its next allowed UTC instant under that schedule. Later zone/time edits do not move that guard earlier. Matched windows require selected time to have arrived and respect the rolling24h3-batch cap.
- [x] Run calendar tests; include non-integer zone offsets, DST gap/fold, skipped date and settings-transition guards. Invalid dates/zones stay errors rather than silently becoming UTC.

## 3. Durable queue and cancellation

Files: db/schema.ts, generated drizzle migration/meta, app/api/workspace/route.ts, app/api/notifications/route.ts, new lib/email-delivery.ts, tests/email-delivery.test.mjs.

- [x] Test migration preservation: sent remains sent; attempted legacy queued/failed without immutable payload goes to needs_review; ordinary unattempted queue remains eligible. Never invent a receipt for historical sent rows.
- [x] Add email_deliveries and email_dispatch_state, plus delivery_id/provider_id on email_outbox. Use generated Drizzle SQL/meta, inspected before packaging. No production credential belongs in the payload.
- [x] Settings save generates server-owned delivery revision and writes consent plus cancellation in one D1.batch. Preserve omitted new timing fields on legacy saves and existing hidden-topic protection. Rollback fixture must leave both settings/queue unchanged.
- [x] Conditional per-user lease acquisition checks lease expiry, with a unique token. All plan/claim writes also require that token and current delivery revision. Settings changes cannot resurrect canceled work from a stale planner. Claim release must be token-specific.
- [x] Hide/settings mutations invalidate affected queued/prepared work while preserving actual accepted and ambiguous attempt history. Active network requests cannot be recalled; UI wording must match this boundary.

## 4. Immutable grouped delivery

Files: lib/email-delivery.ts, lib/notifications.ts, tests/email-delivery.test.mjs.

- [x] RED tests: one digest contains multiple valid notice keys once; empty slot sends none; new item after consumed digest waits; matched fourth batch waits; no repeated item when switching modes.
- [ ] Under the claim read actual current notices/settings and queue, discard ineligible/expired/hidden candidates, plan one immutable ordered batch for a permitted slot, attach the items atomically, and reserve quota. Record empty digest evaluation without provider request.
- [ ] Before each send/retry recheck current settings revision and every item. Never rewrite an attempted payload. Never-attempted stale batch may be canceled/replanned; attempted stale/expired/old ambiguous batch is held for review and its items do not form a second send.
- [x] Persist firstAttemptAt only on actual attempt. Enforce attempts<3 in the conditional write, use stable batch idempotency key and identical serialized provider body for retries. Respect safe provider retry window from firstAttemptAt.
- [x] RED race tests: two concurrent calls cannot enter provider for the same claim; late failure cannot overwrite accepted result; stale planning after opt-out cannot requeue; failed receipt write is kept as uncertain and does not resend with a new key.
- [x] Persist provider ID and acceptance timestamp without claiming inbox delivery. Keep compatibility `{sent,configured}` response field meaning provider-accepted delivery batches and explain the unit where displayed.

## 5. Private status and UI

Files: components/Preferences.tsx, components/Notifications.tsx, app/api/notifications/route.ts, app/api/export/route.ts, app/api/workspace/route.ts DELETE, README.md/privacy if storage explanation changes.

- [x] Add labeled mode, named zone and time inputs, defaults/restore and clear conditional-processing copy. Transport-unconfigured users may save scheduling preferences but cannot opt into email.
- [x] Show configured/off state, current processing limitation, next eligible opportunity/held quota and recent private acceptance/failure/review state through an authenticated read. Do not call it a scheduled delivery guarantee.
- [x] Export owned timing/receipt history; erase new private tables with existing account deletion. Tests must prove cross-account isolation and exclude claim tokens/API credentials.
- [ ] Browser: local save→reload/restore, invalid zone/time error, empty/current queue status and narrow keyboard flow. Use controlled in-memory provider/clock tests for dispatch rules; do not label them actual email or unattended proof.

## 6. Verification and private publication

- [x] Run new targeted tests and existing `node --experimental-strip-types --test tests/*.test.mjs`, `node --conditions=react-server --test tests/home-streaming.mjs`, and `tsc --noEmit`. Review actual coverage and every failure rather than just totals.
- [x] Independent final source/edge-case review. Resolve failures with RED→GREEN; preserve supplied frozen vectors.
- [x] Root runs literal Sites build helper, commits exact validated files, pushes and resolves full HEAD, packages/validates archive, verifies current owner-only access, saves and privately deploys exact source. Use tool-returned IDs only.
- [x] Verify deployed settings/status/read paths and errors. No real email QA absent configured sender and controlled consented recipient. Restore result tab, reset viewport, remove temporary QA tabs.
- [x] Retain requirement-by-requirement evidence and fixed152-gate scores. Do not close timing/unattended/email umbrella gates while real runtime requirements remain missing.

## V14 execution boundary

Private deployment succeeded at source `a0d353c7577805b5616f608409f0f1a00936e6cc` (Sites version16). See ../../audits/2026-09-12-v14-email-verification.md. Calendar inputs were written first, but only the missing API assertion ran before implementation; no claim that every vector individually ran RED. Existing candidate validity is rechecked on every attempt, but the full original material-version/correction and exact official expiry/additional qualification workflow remains open. Local browser save/reload and invalid-zone recovery passed; native time invalid-input and complete segmented keyboard/zoom/screen-reader coverage remains partial. These four unchecked lines preserve those limitations. Actual unattended dispatch and actual consented email receipt remain separate unfinished requirements; all152 gate states are unchanged.
