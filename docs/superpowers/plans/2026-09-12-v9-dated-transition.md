# V9 dated single-contract transition comparison

Existing user-approved scope; previous turn was verified progress: V8 source2c1ccc2f9134b225ef84693f58065afe2bb93742 deployed and all83 tests passed. Fixed152-gate objective remains intact;8.3.4 currently GAP until the retained dated comparison is implemented. Root alone owns Site edits/Git/Sites/browser. Independent reviewers provide math fixtures and design/source review outside Site.

## Product and calculation contract

- Compare one owned billing identity (including bundle members) over the same explicit from/until dates. Decision date is today; switch date must be today or later and no later than comparison end. The comparison start can precede today (actual records remain common) or follow the switch date (show earlier future preparation costs separately).
- Keep uses canonical contract history and existing payment occurrence matching. Change preserves immutable recorded actuals and pre-switch planned bills, then applies explicit old-billing policy: no further bills confirmed, last charge date confirmed (inclusive), current billing continues, or unknown. Existing canonical remaining-count/pause/price conditions remain authoritative; an inconsistent/missing old schedule is flagged, never fabricated.
- New candidate begins using the tool at the switch date and bills from an independently supplied first charge/anchor/calendar cycle. Its temporary price and later renewal price have a dated boundary. Same-date new charges have a different scenario identity and cannot be consumed by an existing matched payment.
- Old service access ending and old charge ending are separate inputs. Display overlap dates/days without inventing proration or charging again for already-paid access.
- Dated fees/proration and confirmed refund amounts are explicit scenario adjustments. Unknown amounts/dates/quote or unconfirmed future fees/refunds block a final savings claim. Already-recorded refunds are selected by their payment ID and not counted twice. Past actuals remain common; a refund is never manufactured from a prepaid balance.
- Currency totals and differences remain vectors. Mixed currencies do not produce a scalar savings winner. Upfront is the maximum same-date future gross outflow per currency, including old+new bills and fees, without netting refunds. Consider future charges between today and the selected end even if before the comparison start. Compare user cash limits per currency; unknown limit/expense cannot become feasible.
- Show cost equality/cheaper only when both cost models are complete in one currency. Recommendation additionally requires feature/usage/access fit, discount eligibility, willingness to change and confirmed preparation limits. A cheaper plan losing required features is not an equivalent recommendation.
- Preserve quick monthly/annual comparison as a secondary view. Primary view connects selected subscription context to candidate terms, dates, source/checked date, costs, comparison table and clear unresolved conditions.
- Save private comparison inputs plus server-built result/source snapshot and user disposition (consider/stay/change/defer/not interested), reason and outcome. Saving is hypothetical and never mutates contract/payment/cancellation state. Recomputing an old comparison uses current records explicitly; original result is retained until the user saves another version. Owned source revision guard rejects a stale save. Export/delete includes comparisons.

## Work sequence and verification

1. Meaningful failing pure dated-comparison tests from independent fixtures; implement common-actual, date/currency/cost/unknown/affordability model. Keep V8 billing calculator stable except justified shared helpers.
2. Server validation/save snapshot and ownership/stale comparison tests; build new input/result/saved-comparison UI with progressive details, readable mobile tables and existing visual tone.
3. Test baseline and errors; type/build. Local and deployed complete task: same-date maintain/change amounts, dated fee/refund, unknown vs0, preserved actuals, private saved comparison/reload, only disposable data cleanup. Narrow/desktop and keyboard checks.
4. Exact-source owner-private Sites publication; independent fixed-gate evidence review. No new numerical pass before original criterion is met. Overall actual-email/unattended/visual/reader and initial-latency requirements remain open.


## Execution result

Implemented and published as source0188f74e26d93f9f7073ea0030ecdd4399c58738,2026-09-12T10:28:50.029667Z.109 tests, type/build, local and deployed browser evidence in docs/audits/2026-09-12-v9-transition-verification.md. Independent frozen8.3.4 passes; overall9-area goal is still incomplete. Retained initial latency, actual email/unattended operations, full visual/zoom/reader and other unverified tasks remain for subsequent work.
