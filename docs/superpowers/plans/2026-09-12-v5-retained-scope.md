# V5 Retained Scope Implementation Plan

> For agentic workers: apply superpowers:executing-plans. Only root edits the Site; agents audit sources and behavior read-only.

**Goal:** Complete retained home discovery, notification controls and a coherent billing reporting increment.
**Architecture:** Keep D1 per-account JSON records and the original UI. Extract BillingReport from MyWorkspace. Link actual charges to explicit contract occurrence dates; do not guess matching payments from similar amounts. Unknown amounts remain separate.
**Tech Stack:** Vinext, React, TypeScript, D1, Zod; node:test with actual SQLite harness.

Approved references: product-plan-v0.6, subscription-optimization-design, cancellation-promotion-alerts-design. Existing user approval applies.

- [x] Home: upcoming official events and latest published root discussions, with honest empty/error states.
- [x] Notification controls: an owned notice ID determines a hidden topic server-side. GET excludes hidden or stale notices; settings restores topics. Test ownership, persistence and cancelled pending delivery.
- [x] Billing: preserve an anchor date; custom N-month/manual cycles; report custom dates, confirmed charges/refunds, unpaid future and unconfirmed past separately. Use a shared bundle/date identity for matching. Validate duplicate matches and currency server-side.
- [x] Personal share: separate contract share arithmetic; never imply that it is actual personal expenditure.
- [x] Savings: explicit transition and overlapping contract costs, confirmed refunds; unknown terms keep recommendations conditional.
- [x] Run meaningful regression tests red before implementation, then API/billing suite, TypeScript and Sites build. Browser checks cover desktop/mobile changed flows.
- [x] Root reviews independent audits, commits verified source and publishes the same private Site; retain unearned scoring gates.

Further retained scope: versioned conditions with effective dates, full operational feedback/cadence, measured performance and complete guide reproduction remain tracked. This increment does not remove them. Real email remains dependent on a verified sender and provider secret; no actual delivery is claimed.

Completed increment: V5 + V6 source-permalink correction deployed. Evidence in docs/2026-09-12-site-quality-review.md. Further retained scope above remains open; this plan completion is not goal completion.
