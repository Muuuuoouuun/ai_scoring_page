# V9 dated subscription comparison — verification

## Scope and implementation

Retained requirement8.3.4 is assessed using its original wording: reconciliation/custom-period/history/transition-cost comparison cases are implemented. No criterion, weight or threshold was changed. One existing billing identity (including bundle members) and one proposed plan are compared over the same explicit dates. This is a hypothetical private calculation, not a contract/cancellation/refund execution.

- Original canonical condition histories, remaining N, pauses and dated amounts remain authoritative. Matched actual invoices are not charged again. A candidate has a different billing identity and calendar.
- First charge, anchored monthly/quarterly/annual/custom/manual cycles, dated normal price after discount, tax/seat/usage uncertainty, existing final bill inclusive, and separate access-overlap days are represented.
- Dated fees, additional proration and confirmed refunds have scenario/currency/source/date. Already recorded refunds use owned payment IDs; duplicate same-date/amount manual refunds are held for confirmation rather than subtracted again.
- Costs remain currency vectors. Unknowns block a final cheaper claim. A daily gross future outflow peak is compared with each currency's available preparation amount; a later refund cannot fund an earlier bill. Required outlays before the displayed comparison period block a final savings/recommendation claim until the range is expanded.
- Feature/usage/full-period access, eligibility and willingness are separate constraints. A confirmed existing contract end before the horizon makes keeping it infeasible for that full period. Future-dated actual ledger records require reconciliation.
- Save recomputes on the server from owned data, captures conditions/result/source revision, and atomically checks financial authority identity/revision plus parent existence. It does not modify the contract, payment, cancellation or authority rows. Annotation/deletion remain owner scoped; snapshot history is exported/erased with account data.
- Readable saved conditions, decision/reason/outcome, explicit fresh recalculation, and stale-source indication are available. Incoming source revisions invalidate an unsaved preview. Four currency budget fields include future-history currencies. Existing quick monthly/annual calculator remains available separately.

## Automated and independent checks

- New pure engine19 tests and private API7 tests:26 passed. Entire existing+new suite109 passed; type checks and Sites build passed.
- Tests cover date anchors/boundaries, unknown prices/tax/usage, mixed currencies, shared bundles, paid future occurrence matching, residual N across changed prices, overlap without imaginary prorating, dated refunds, gross preparation, source revision/UUID races, ownership, cross-origin/authentication, server-owned output, unchanged financial bytes, annotation, export and deletion.
- An injected source mutation after calculation but before snapshot insertion produces409 and no stored snapshot. Existing financial rollback/concurrency tests remain included.
- Independent review files: `v9-transition-cases`, `v9-transition-design-review`, `v9-engine-audit`, `v9-workflow-audit`, and `v9-gate-834-recheck` in this directory. Reviewers did not edit Site or deploy. Their source fixtures/VM tests are distinguished from root browser observations.
- Root addressed the independently reproduced cadence mismatch, before-period upfront claim, future ledger cash bypass, manual duplicate refund, ended coverage, future-currency budget UI and stale preview cases.

## Local browser observations

All monetary values below are explicit disposable QA data, not real service prices.

- Created monthly20,000KRW from10/1. For10/1–12/31, candidate annual30,000 from10/1 and confirmed old billing stop: keep60,000/change30,000. Overlap10/1–10/31 displayed31 days without adding another expense.
- Saved conditions/result/reason; reopened correct totals; loaded inputs for fresh comparison with dates and checks restored. Changed decision todefer and outcome text; whole-page reload preserved both.
- Candidate120,000 on10/1 + fee10,000 on10/1 − refund100,000 on11/1: change net30,000, but gross preparation130,000 exceeds125,000 budget. Keep60,000 is feasible and selected; lower net amount is not confused with available cash.
-1440px desktop rendered.390px viewport document client/scroll375/375.320px initially had3px page overflow from grid minimum sizing; fixed child min-width. Recheck client/scroll305/305, table269px viewport/290px content. Table Tab moved to the next named region. These are bounded responsive/keyboard observations, not200% browser zoom or actual screen-reader evidence.
- Local console errors0 at observation. Deleted only the created comparison and subscription; empty state observed.

## Production observations before the navigation correction

Initial source48645e656d39ad8b14c76d9dca2b58b6a5309a31 deployed successfully2026-09-12T10:20:40.885466Z, same owner-private site, environment revision2.

- Created monthly20,000KRW from10/1. Compare10/1–12/31, candidate annual30,000 from10/1, old final bill10/1 inclusive: keep60,000/change50,000; same-date gross preparation50,000 and31 access-overlap days. Saved and whole-page reload preserved the result/reason.
- Changed existing future terms to30,000 from10/1. Saved result stayed60,000/50,000 with source-change notice. Explicit current recalculation became90,000/60,000. The original snapshot remained visible.
-390px viewport client/scroll375/375 with correct original and newly recalculated dated rows.
- Late production console inspection found4 Vinext RSC prefetch setup TypeErrors (10:21:04,10:22:09,10:22:44,10:24:34). The errors are retained as a real regression, not reported as0. Calculation/persistence paths above continued to work.
- Root traced the failing getPrefetchInterceptionContext call in the compiled MyWorkspace chunk to the new Savings import ofnext/link, the only component using it. Existing project Link intentionally uses a native anchor for Worker navigation. Changed only this import to the established wrapper; type/build passed again and rebuilt MyWorkspace chunk no longer contains the failing prefetch setup code. Engine/API code is unchanged by this correction;109-test result precedes this import-only fix.

## Publication records

- First V9 artifact:2,969,600 bytes/216 files, sha2560abfd50aa5e8bbcce634c25dfba0b8c1a9cf475886b9fc025e9d4fb344bfc7f0; version9.
- Corrected source0188f74e26d93f9f7073ea0030ecdd4399c58738, artifact2,816,000 bytes/203 files, sha2568a71a24432a390659281fe43cd1dd31169ed68492ae751a9aa1f201abaa0fb0d; version10. Source push succeeded before full SHA read and packaging. Exact archive-backed version used; no source mutation during packaging/saving.
- Owner/custom/accounts1/external0/workspace groups0/tenant groups0 reverified for the corrected publication. No access expansion or environment/DB schema change.

## Limits

This work closes one retained implementation gate. It does not verify real email receipt, unattended scheduling, independent real accounts/devices, actual screen readers, a full screen/zoom matrix, useful guide reproduction or the outstanding initial-latency budgets. Overall goal remains incomplete. Saved quoted amounts are user-entered, not automatically certified current service prices.

## Corrected deployment final verification

- Corrected version succeeded2026-09-12T10:28:50.029667Z, source0188f74e26d93f9f7073ea0030ecdd4399c58738, environment revision2.
- Opened a fresh production browser tab after the correction. The existing-conditions link navigated to the actual subscription management page; no prefetch setup error recurred. Reopened saved comparison and explicitly recalculated current conditions to90,000/60,000 again.
- Final new-tab console error list was empty after navigation, recalculation, deletion and reload. This supersedes the error observation for the corrected version only; initial four errors remain documented above.
- Deleted only the disposable V9 comparison and its subscription/condition history. After whole-page reload, the comparison area showed no subscription and0 saved comparisons. No real records or account-wide erase was used.
- Recent15-minute Worker errors-only query returned0 events (limit30). This is a bounded observation, not a long-running reliability guarantee.
- Temporary verification tabs closed; viewport override reset; existing single deliverable tab remains on the deployed home. Development server remains available for the still-active goal.
- Independent fixed-score arithmetic: [V9 score delta](2026-09-12-v9-score-delta.md). Exactly8.3.4 gains6.25; all other151 states/earned scores unchanged. Four ofnine areas remain≥88, overall incomplete.
