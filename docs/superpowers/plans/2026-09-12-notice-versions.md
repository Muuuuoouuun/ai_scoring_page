# Notice Versions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Root owns Site writes and publishing; agents independently review source facts, tests, and races.

**Goal:** Keep one current, auditable offer card and send only a qualified meaningful version or relevant correction.

**Architecture:** Immutable notifications and email deliveries remain; stable cards and monotonic source heads protect current state. Shared pure promotion facts determine expiry, constraints and eligibility fingerprints.

**Tech Stack:** TypeScript, React, SQLite/D1, existing Node VM integration harness, Sites.

---

- [x] Preserve initial RED and fixed expectations in docs/audits/v15-notice-versions; add memory JSON fixtures to tests/api-harness.mjs without modifying product source fixtures.
- [x] Add tests/notice-versions.test.mjs for same checkedAt, same-day price revision, withdrawn/absolute expiry, unknown-zone hold boundaries, max price/min months/features, stale eligibility fingerprint, legacy adoption and later correction, stable read/hide card, privacy/delete, old generation race.
- [x] Run `node --test tests/notice-versions.test.mjs` before implementation and retain failures.
- [x] Implement lib/promotion-facts.ts for normalized material facts, eligibility token, price/feature constraint outcomes and deadline state. Add explicit reviewed revision and structured verified facts to data/promotions.json; update official US URL. Add explicit announcement id/revision to catalog latestUpdate.
- [x] Extend db/schema.ts and generate a new migration with notifications.metadata, notification_cards and notice_source_heads. Keep prior migrations immutable. Backfill lazily under a current owned setting and preserve all historical rows.
- [x] Implement source descriptor/current candidate logic in lib/notice-candidates.ts and stable material cards/guarded queue in lib/notifications.ts. Every mutation checks source head and setting revision; card advances only on expected prior version.
- [x] Add card/head validity to lib/email-delivery.ts plan and attempt SQL. Preserve payload and provider receipt semantics. Re-run existing tests/email-delivery.test.mjs after changes.
- [x] Extend lib/validation.ts and workspace-settings.ts with fingerprint-bound explicit eligibility, neededFeatures, minBenefitMonths and price ceiling validation. Build components/PromotionPreferences.tsx and mount in Preferences; add safe hold/correction status to Notifications and public promotion facts to app/promotions/page.tsx.
- [x] Update notifications GET/read/hide for stable cards, retain existing-card corrections when new app alerts are disabled; include own cards/version references in export and whole-account deletion.
- [x] Run `node --test tests/*.test.mjs`, required Home RSC checks, `npx tsc --noEmit`, literal Sites build and diffcheck. Read independent review and fix material issues, keeping test expectations unchanged.
- [x] Verify local UI actual viewport, settings display/roundtrip and promotion facts without sending real mail. Check production private access; commit/push/package immutable archive and deploy exact source SHA. Verify terminal deployment, current public UI and errors; no artificial score promotion.
- [x] Record tests, review boundaries, archive SHA, deployment receipt and fixed scores in V15 audit; mark only completed plan steps.

The design spec contains the decision rules and frozen behavior. Use literal existing tool paths and the established single-writer Site checkout; do not introduce a second source checkout or alter unrelated parent files.

실행 완료: 소스 b8d35c036f0541446fafa746652406a81b19f0a6, Sites17 비공개 성공. 233회귀+별도Home4, 타입·빌드 통과. 체크는 이 계획의 구현/검증 작업 완료이며 전체88점 또는 모든 원문 운영요건 달성 판정이 아니다. 2026-09-13-v15-notice-verification.md의 경계를 따른다.
