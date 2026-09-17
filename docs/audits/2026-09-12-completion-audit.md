# AIs independent completion audit — 2026-09-12

Read-only review of `/Users/bigmac_moon/dev/ai_score/site` against v0.6, page structure, subscription/alert specifications, and the build requirements. No Sites operations, browser actions, Git changes, or site edits were performed. Existing tests freshly passed: `node --test tests/api.test.mjs tests/billing.test.mjs` — **21 passed, 0 failed**. Reproductions below used an in-memory SQLite harness and mocked email transport; no email was sent.

## Findings requiring correction

### P1 — Common search does not search common/public content

- Requirement: `docs/2026-09-12-product-plan-v0.6.md:88-94` says the default search covers tools, comparisons, guides, news, updates, events and public experiences, grouped by type. The page-structure specification also requires this scope and distinguishes private toolbox search.
- Evidence: `site/app/search/page.tsx:1-2` only renders `Explore`; `site/components/Explore.tsx:3,8` only calls `searchCatalog`; `site/lib/catalog.ts:10-16` only searches catalog tool text. No guide/event/community/news result path exists. Searching a guide or event title can therefore report no tools even though matching public content exists.
- Smallest faithful fix: keep `/explore` specialized for tools; make `/search` query existing guide, update, event and published-community content as well as tools and available comparison content. Display independently labelled groups/types, relevant links, query and active filters. Use the same explicit no-results behavior without relaxing requirements. Do not invent comparison articles when none exist.
- Minimum verification: exact guide title returns its guide; event title returns the event with ended/upcoming state; update title returns the update; a published discussion title/body is searchable, hidden/deleted/private text is excluded; tool name still works anonymously; no-results and type filters work. At least one browser task should search a piece of information rather than a purchase candidate.

### P1 — Unknown remaining charges become zero; service termination erases explicit residual bills

- Requirement: `docs/superpowers/specs/2026-09-11-subscription-optimization-design.md:42,57-59` requires retaining committed payments after renewal cancellation, showing incomplete information, and displaying zero only when absence of remaining bills is confirmed. Cancellation specification `:53,118` separates renewal, access ending, and remaining commitments. Build requirements `:17-18` retains residual-charge recording.
- Evidence: `site/lib/billing.ts:41` skips ended/access-expired contracts; `:43-44` converts `remainingPayments:null` to zero and skips; `:50` discards bills after the access end date. `site/components/MyWorkspace.tsx:17` then displays no expected payments, with no residual uncertainty warning.
- Reproduced for the window 2026-09-12 through 2026-12-11: (a) cancelled, next bill September 15, residual count unknown; (b) ended, September 10 access end, two explicit remaining bills; (c) cancelled, September 10 access end, two explicit remaining bills. **All return `{currencies:{},unknown:0,schedule:[]}`.**
- Smallest faithful fix: distinguish `null`/unknown from explicit `0`; add a separate residual-uncertainty count/status and show it beside expected totals. Preserve explicit residual billing independently of the access end date and ended use state; use the known next payment date/count for these bills. Do not invent amounts/dates/counts for unknown obligations. The confirmation form should allow the customer to specify unknown, none, or N residual payments.
- Minimum verification: unknown count produces an uncertainty warning rather than confirmed zero; explicit 0 produces no future bills; explicit 2 produces two dated bills and notifications even if access ended; bundles still count once; cancel-requested keeps renewal; correction from confirmed to requested updates both state and dates correctly.

### P1 — Unknown cancellation payment path is treated as web billing

- Requirement: cancellation specification `:15,39,115` says unknown payment source must route to receipt/merchant/account recovery, not an assumed payment channel.
- Evidence: `site/components/CancellationHelp.tsx:7` selects Apple, Google, otherwise web help. For a known tool with a web guide, choosing `route='unknown'` still produces `h`, so the unknown-source explanation in the fallback is never shown.
- Smallest fix: only look up web help when `route==='web'`; unknown returns no selected path and shows receipt/merchant/account recovery. Test known ChatGPT + unknown, web, Apple and Google independently. This is a real path-selection defect, not merely missing QA.

### P1 before enabling email — Queued messages ignore removed interests, expiry and eligibility

- Requirement: cancellation/alerts specification `:68-70,86,94,120-122` excludes ineligible personalized offers, restricts unknown eligibility to clearly conditional app content, and rechecks validity, interests, features and channel consent immediately before send/retry.
- Evidence: `site/lib/notifications.ts:9` matches offers by tool/category only; there is no eligibility state. `:13-16` checks email opt-in/address, but sends queued text without rechecking its source, current interests or promotion expiry. `site/lib/validation.ts:13` has no eligibility or requested delivery schedule. `site/app/api/notifications/route.ts:6` is the only delivery trigger.
- Reproduction: generate notices for Gemini with email on; save settings with **no interests** while email stays on; call delivery. It reports `sent:2` and mocked subjects are `Gemini 업데이트` and `미국 대학생 Google AI Pro 12개월 무료`. The latter was never matched to confirmed US-student eligibility.
- Smallest safe fix before enabling transport: keep structured source/type/version metadata, cancel queued messages when topic/eligibility/validity is no longer satisfied, revalidate on every send/retry, and keep unconfirmed eligibility in the app only. Test topic removal, expiry before first send/retry, eligibility unknown/ineligible, opt-out and provider uncertainty. Existing transport-disabled behavior is honest, but does not fulfill the explicit first-release email feature (`v0.6:156` and alert spec `:110`). Actual configured delivery requires a verified sender/provider and observed receipt; mocks cannot supply this evidence. Background delivery/schedule is also not implemented, so do not promise a daily digest or unattended delivery.

### P2 — Savings result ignores the user's ability to prepay

- Requirement: build requirements `:18`; subscription spec `:83-88,119` explicitly gives the example that a 100,000-won prepayment limit disqualifies a 192,000-won annual plan.
- Evidence: `site/components/Savings.tsx:4` takes monthly price, annual price, duration and a feature checkbox only. `site/lib/billing.ts:54-57` recommends the lower total without any prepayment limit/unknown condition. Mentioning the amount after selecting the winner does not apply the constraint.
- Smallest fix: collect an optional prepayment limit with unknown state, label pure cost comparison separately, and only declare a feasible recommendation if features and the prepayment condition are satisfied. For 20,000/month, 192,000/year, 12 months and 100,000 limit, display the annual cost difference but mark annual as outside the limit. Preserve the existing 8-month calculation.

### P2 — Saved comparisons and private outcome records have no user flow

- Requirement: v0.6 `:144` names saving tools/comparisons/guides/news/events, choice reasons and use outcomes; build requirements `:16` retains content records.
- Evidence: `site/app/compare/page.tsx:5` has per-tool `SaveTool` only. `savedSchema` (`site/lib/validation.ts:11`) accepts comparison but no component writes it; `site/components/MyWorkspace.tsx:17` contains a comparison reader only. There is no activity/result record kind in `recordSchemas` (`validation.ts:14`) and no content choice-reason/result form. Session comparison storage is not account persistence (`Provider.tsx:8,11`).
- Smallest fix: add a comparison `SaveContent` action using normalized selected IDs and a readable title. Add private optional note/reason/outcome fields to saved items with editing from My Workspace; keep outcomes self-reported, not proof of success. Test login return, refreshed persisted comparison, edits, account isolation, export and deletion.

## Other explicit scope gaps to track rather than silently score as complete

- **Public cancellation information is gated by a private record.** v0.6 `:152` makes general cancellation help publicly discoverable. The only `CancellationHelp` invocation is inside authenticated `MyWorkspace` (`MyWorkspace.tsx:17`), and its tool choice comes from personal subscription records. Add a public tool/payment-route selector or link appropriate tool details to the existing help data; personal records remain optional.
- **Maintained detailed billing cases are broader than the current model.** The detailed spec is explicitly retained by v0.6 `:154`; its `:35-40,51-59,142` includes limited-period prices/renewal prices, refunds, unknown tax, usage-priced contracts, and incomplete next-payment dates. `subscriptionSchema` (`validation.ts:8`) only models fixed monthly/quarterly/annual amounts and requires a date; `paymentSchema` (`:10`) accepts nonnegative payments only. These cases cannot be marked verified or fully implemented by the existing fixed-price tests. An audit should explicitly trace these requirements to implementation, or leave them outstanding rather than assume they were deferred.
- **Editorial/source review is detection, not content refresh completion.** `source-sync.ts:9-16` refreshes logo data/feed entries and flags changed pages. Tool facts/update summaries remain static in `catalog.json`; `api/admin/route.ts:5-6` has no source-review acceptance/content-update workflow. This behavior is honestly described on `/sources`. Do not award factual-update completion solely because a URL fetch returns 200; verify researched facts separately and record how reviewed edits are published.

## Score interpretation and remaining evidence

The current report correctly says the all-88 goal is **not achieved** (`docs/2026-09-12-site-quality-review.md:43`). It should not be converted into an all-pass report merely after browser deletion/moderation succeeds. Its identity 95 (`:33`), usefulness 91 (`:38`), and private functions 89 with **24/25 for costs/savings** (`:40`) do not account for the verified search, billing, savings, and persistence gaps above. The report's cost result is particularly overstated for the maintained detailed specification. Recompute from an atomic requirement/evidence checklist; do not invent replacement scores to target 88.

The supplied rubric says unverified items earn no points and broken core flows cap the relevant area at 60 (`site-build-requirements.md:25`). Whether these defects qualify for that cap must be applied consistently and documented; a passing unit suite alone cannot remove the cap. No new numeric score is assigned by this read-only audit.

Critical validation still needed after fixes: deployed login return and guest→save intent; account boundaries under real Sites authentication; search across public types; unknown/ended residual-bill UI; payment-path unknown handling; comparison save/edit/export/delete; full keyboard modal cancellation/confirmation and focus return; moderation report→hide→restore; expired offers; and real email delivery only after transport, eligibility, cancellation and timing behavior are ready. Root is already handling the browser/deployment checks; this audit did not independently verify those surfaces.

Reproduction harness: `/private/tmp/ais-audit-repro.mjs` (read-only source loading, in-memory database, mocked fetch).
