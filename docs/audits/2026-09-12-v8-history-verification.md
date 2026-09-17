# V8 contract history and personal ledger verification

Status: source implemented and privately deployed; local and deployed task checks complete within the stated limits. Overall 9-area objective remains active. This increment does not close the initial-latency work, dated transition/overlap model, genuine email delivery, full visual/200%/reader matrix, or independent production multi-account/device evidence.

## Behavior and storage

- One owner-scoped internal `billing_terms` record per stable contract/bundle identity. Full condition snapshots have server timestamps, effective/observed basis, revision and opaque authority ID. Ordinary private-record input cannot mutate internal history.
- New subscriptions preserve the recording-day observation as the known baseline. Prior dates remain unknown until the user explicitly corrects the first effective date. Legacy original payload is retained when current conditions are initialized. Raw legacy records without history retain clearly labeled current-condition estimates.
- Future/confirmed/date-unknown conditions, correction chains and withdrawals preserve their prior audit entries. Date-aware scheduling handles currency, cycle, seats, tax, pause/resume and a stable residual-count basis. Future amounts never overwrite historical matched invoice snapshots.
- Payment/refund personal amounts are explicit per-entry values in their recorded currencies/dates. Null remains unknown; zero is known. Matched unknown personal amounts never regenerate predicted spending. Personal refund bounds/currencies are checked against known originals/refunds.
- Subscription metadata, payments/refunds, cancellation notes/effects, membership additions/deletions and history edits participate in one revision guard. All business writes are guarded; the last history mutation is the commit marker. Legacy seed requires the parent still exist. Last unreferenced member deletion also removes the authority; a recreated bundle receives a new UUID.
- New cancellation conditions propagate to reserved future snapshots without reviving billing. A backdated cancellation encountering already-effective later decisions requires explicit history correction. Previously applied confirmation dates are corrected in condition history, not silently moved through a note edit.
- Workspace and notice calculations hydrate the same canonical history. Export includes internal histories and account erasure includes them. In-place bundle identity migration remains explicit new-contract work, not a silent reassignment.

## Independent review

Read-only reviewers supplied independent fixtures (14 fixtures, 25 independently summed query cases), a CAS design review and source/API reproductions. Root integrated fixes for captured/current personal-share mixing, later tax/usage warnings, JSON order and legacy bundle conflicts, supersedes chains, deletion/bootstrap races, future-price cancellation revival and personal refund currency corrections. See accompanying V8 review copies. These are in-memory SQL/API tests, not live cross-isolate D1 or two real account/device testing.

## Automated checks

Fresh full run after source changes: 83/83 tests passed (24 existing API,17 new history API,24 existing billing,18 new history billing). `npx tsc --noEmit` exit0. Sites build helper exit0, all five build stages complete including `/api/billing-terms`. The deliberately injected SQLite trigger failure logs an expected request failure in the rollback test; no test failure occurred.

Tests cover owner isolation, stale shared revisions, same-revision races, rollback after business writes, deletion/recreation identity, legacy deletion-before-seed, export/erasure, currency/cycle history, chained draft corrections, residual budget preservation, unknown-vs-zero personal data, refund caps and historical cancellations.

## Local browser observations

CUA tab6, local5173, disposable `V8 검증용 구독`, no existing subscription records modified.

1. A native date input value disappeared during another field rerender. Changed date inputs to preserve entered DOM values and read form values for preview/save; repeated date-first, text-after, preview/save succeeded.
2. Confirmed first conditions from2026-09-01, monthly30,000KRW and expected personal10,000KRW, first bill9/15. 12-month preview360,000KRW.
3. Added10/1 effective45,000KRW. Preview9/15 at30,000 then10/15 onward45,000;12-month sum525,000. Saved current headline remained30,000. Period9/1–12/11 showed9/15:30,000,10/15:45,000,11/15:45,000.
4. Linked disposable actual payment29,000KRW dated9/16 to9/15 bill, actual personal7,000KRW. Report displayed actual29,000 + remaining90,000 =119,000; personal actual7,000 + remaining20,000 =27,000. Matched bill showed captured30,000 and difference−1,000; no duplication.
5. Desktop1440×900 and narrow390×844 requested responsive audit. Narrow document client/scroll width375/375; dialog351px. Timeline showed original observation as corrected, explicit9/1 conditions and10/1 future change. No horizontal clipping observed in this narrow history view. Escape restored focus to the specific history opener.
6. Full-page screenshot included sticky navigation at the current scroll position; it is not evidence of a misplaced normal-flow header. Actual reader/200% zoom checks are not claimed.
7. Only the disposable payment and subscription were deleted through the UI; empty-state confirmation follows below. No user record was removed.

## Remaining verification

Exact-source publication and deployed task checks are recorded below. Broader gates remain open, particularly the dated transition/overlap comparison. No numerical score is changed by this document alone.

## Exact-source publication

- Commit `2c1ccc2f9134b225ef84693f58065afe2bb93742`, clean Site checkout after publish.
- Version `appgprj_6aa42f3ab3ec81919d0048d508baa661~appgver_4d0b8ed6a17081918741cd9d2c94353b` (8).
- Deployment `appgdep_6aa51e5424ec8191939991990b3cfa8a` succeeded2026-09-12T09:42:06.373845Z; envrevision2.
- Archive `/private/tmp/ais-site-v8.tar.gz`,2,600,960bytes,202files;sha256:44d6879a2c8c761af893eaad3a3cd2bf4858c00c8c3f101f12c46ac974a236e5.
- Owner role/custom access/one allowed account/zero external viewers/zero tenant or workspace groups reverified; access unchanged.
- URL: https://ais-discovery-hub.aaahaaah19.chatgpt.site
- Local test payment/subscription removed through UI; subsequent empty subscription/payment states and console-error list0 confirmed.

## Initial deployed task evidence

Started with no subscription/payment records. Created only clearly named disposable `V8 배포 검증용 · 삭제 예정`. Entered9/15 date before opening extra fields and changing personal share/tax; date survived and saved.10/1 amount45,000 preview yielded525,000 over12months, with9/15 at30,000 and later dates45,000. Unknown-date checkbox correctly disappeared after date entry. Saved, reloaded deployed page:9/15:30,000,10/15:45,000,11/15:45,000 persisted. Then recorded disposable29,000 actual payment dated9/12 and personal7,000 linked to9/15 planned occurrence. Final report checks and cleanup below.

## Final deployed task observations

- After9/12 actual29,000/personal7,000 linked to9/15 bill: period actual29,000,remaining90,000,combined119,000. Personal actual7,000,remaining20,000,combined27,000. Headline monthly contract30,000 remained unchanged.
- Added explicit disposable refund2,000/personal1,000 dated9/12 against the original charge. Actual became27,000,remaining stayed90,000,combined117,000. Personal actual became6,000,remaining stayed20,000,combined26,000.9/15 stayed matched with original planned30,000 and captured difference−1,000; refund did not recreate a predicted charge.
- At390×844, actual document clientWidth/scrollWidth375/375. Mobile and desktop local history view were checked as above; this is not the complete visual matrix or200%zoom evidence.
- Deployed15-minute Worker error query returned0 events. UI console/cleanup final confirmation recorded in the completion note.
- Deleted only the disposable refund, then payment, then subscription through their UI actions. Exact source remains unchanged after the verified build/publication.

## Fixed-gate interpretation

Independent review retains8.3.4 as GAP: its frozen criterion combines reconciliation/custom-period/history/transition-cost comparison. Dates and history are now implemented, but the retained detailed dated transition/overlap model is still required. No gate status or weight changes, no score rounding, no target-driven score increase. Existing passing calculation/storage gates gain stronger evidence. Overall objective remains active.

Final UI cleanup confirmation: deployed page reloaded after the three deletes and showed no subscription or payment records; console errors0. Temporary QA tab6 closed, viewport reset, stable deliverable tab1 returned to production Home. The Sites view request may queue in Codex and is not asserted to have brought a locked native window to foreground.
