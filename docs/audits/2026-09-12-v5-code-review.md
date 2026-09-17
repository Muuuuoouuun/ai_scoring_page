# V5 partial implementation: independent critical review

Read-only review, 2026-09-12. Findings apply to the source snapshot inspected during the parent's ongoing edits. Full condition history and a full dated transition model are explicitly deferred; their absence is not reported as a new regression. No source, Git, Sites, or browser changes were made.

**Validation:** a fresh run of `node --test --test-reporter=dot tests/api.test.mjs tests/billing.test.mjs` passed **42/42** after the parent corrected the migration and upfront-cost calculation. The additional cases below use current handlers and billing functions through an isolated in-memory SQLite/D1 harness, with all external fetches forbidden. Reproduction script: [ais-v5-repro.mjs](/private/tmp/ais-v5-repro.mjs). Its first version substituted corrected index SQL only inside its own in-memory database while the parent fixed the generated migration; this was not a site mutation. Source observations accompany UI paths; I did not perform browser interactions.

## P1 — Changing an anchor silently turns a paid occurrence into a new unpaid occurrence

Sources: [workspace API:32–38](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:32), [workspace API:87](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:87), [billing.ts:89–101](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:89).

Reproduced: create a monthly KRW 30,000 contract due September 15, explicitly link a KRW 30,000 September 15 payment, then edit both anchorDate and nextDate to September 16. Save returns 200. The old key ends in `@2026-09-15`; the regenerated key ends in `@2026-09-16`. The September report becomes **actual 30,000 + remaining 30,000 = forecast 60,000**, with no warning that a linked occurrence was invalidated. Cycle edits have the same identity hazard. Changes made through a bundle peer propagate to the linked contract without checking the peer's other members' matches.

Smallest safe fix for this partial implementation: reject schedule/cadence/anchor edits that invalidate existing linked occurrences until the customer explicitly resolves those links. Check **all contracts sharing the billing identity**, not only payments whose subscriptionId equals the edited row. Alternatively preserve a stable occurrence ID through a deliberate date correction. Merely changing the report range or description must not affect identity. Add save→reload→report regression for the exact 30,000→60,000 example and an edit through the unlinked bundle member.

## P1 — A successful next-payment-date edit can generate a different date

Sources: [workspace API:36–37](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:36), [billing.ts:30–35](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:30), [RecordForm.tsx:9](/Users/bigmac_moon/dev/ai_score/site/components/RecordForm.tsx:9).

Reproduced: new contract September 15 gets anchorDate September 15. Edit only nextDate to October 1, using the ordinary visible “다음 결제일” field. Save returns 200 and the record displays October 1, but October's generated schedule contains **October 15**. `paymentDates` treats nextDate as a lower bound and silently chooses the next anchor-aligned date. This can undercount a chosen range ending October 14 and omit the actual deadline from reminders.

Smallest fix: an entered nextDate must be a valid occurrence under the anchor, or the save must explain that the anchor needs correction. For an unlinked contract, an explicit date/cadence correction can reset the anchor with a clear rule; for linked records use the safeguard above. Preserve month-end behavior when advancing January 31→February 28: March must remain March 31. Do not silently substitute an unentered date after successful save.

## P1 — Actual payment currency is taken from the edited contract

Sources: [billing.ts:96–101](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:96), [BillingReport.tsx:18](/Users/bigmac_moon/dev/ai_score/site/components/BillingReport.tsx:18).

Reproduced: save and match an actual **KRW 30,000** payment; edit the subscription currency to USD. This edit is accepted. The schedule result contains `actualAmount:30000` and `currency:'USD'` but no actualCurrency. The UI formats the historic actual as **US$300.00** although its persisted payment currency is KRW. The actual-total card correctly remains KRW, so two parts of the same report disagree.

Smallest fix: return `actualCurrency:p.currency`, display actualAmount using that currency, and preserve variance only when the original planned and actual units match. The existing difference guard already avoids subtraction across currencies. This fix does not depend on implementing full historical repricing.

## P2 — Hiding a notification is undone by a normal settings save in the same session

Sources: [Notifications.tsx:8](/Users/bigmac_moon/dev/ai_score/site/components/Notifications.tsx:8), [MyWorkspace.tsx:17](/Users/bigmac_moon/dev/ai_score/site/components/MyWorkspace.tsx:17), [Preferences.tsx:8](/Users/bigmac_moon/dev/ai_score/site/components/Preferences.tsx:8), [notification API:19–23](/Users/bigmac_moon/dev/ai_score/site/app/api/notifications/route.ts:19).

The hide endpoint correctly writes hiddenTopics, and the notification list correctly refetches itself. But MyWorkspace still holds its old private-records snapshot; `<Notifications/>` has no callback to refresh it. Navigating to Settings creates Preferences from those stale records. The newly hidden topic is absent from the “다시 받기” list, and saving any setting writes the old/empty hiddenTopics over the server value. The notice returns, and eligible email topics may become eligible for sending again.

The API sequence was reproduced with a workspace read before hide, hide returning 200 and persisting the topic, then the unchanged settings payload that the current UI would hold: hiddenTopics becomes `[]`, and the notice is visible again.

Smallest fix: refresh the parent's records after hide and ensure Preferences receives fresh settings before permitting a full save. A dedicated settings patch for fields being edited can avoid overwriting hiddenTopics that the form never loaded. Test hide→navigate to Settings without reload→change display name→save→reload; the hidden topic must remain hidden and be available for explicit restoration.

## P2 — Bundle personal-share totals depend on arbitrary record-ID order

Sources: [workspace API:51,87](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:51), [billing.ts:43,50,99](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:43), [BillingReport.tsx:19](/Users/bigmac_moon/dev/ai_score/site/components/BillingReport.tsx:19).

New bundle members may have different personalShare values because that field is omitted from both shared-condition validation and synchronization. The new report counts only the first UUID-sorted bundle member's share. Reproduced peers with identical billing terms and shares **5,000 / 9,000** both save successfully; the report is **5,000 or 9,000 depending solely on which payload has the earlier ID**. Editing the other member's visible share can leave the reported total unchanged.

Smallest fix: treat personalShare as shared contract-level data, normalize it in bundle validation and synchronize it with the other shared financial fields. If existing bundle shares conflict, mark the share unknown/conflicted rather than picking an arbitrary member or adding them. Test both record orders and editing the nonrepresentative member. This is a correctness bug in the newly displayed reference total even though actual personal cash remains explicitly outside this partial implementation.

## P2 — Existing V4 bundles reject an otherwise identical new member

Sources: [workspace API:36,51](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:36), [validation.ts:8](/Users/bigmac_moon/dev/ai_score/site/lib/validation.ts:8).

V4 records have no anchorDate. Saving a new matching bundle member initializes anchorDate from nextDate. Existing peers are parsed, but parsing does not derive their legacy anchor; the comparison therefore sees `undefined` versus September 15 and returns 400 “같은 번들의 결제 조건이 다릅니다.” Reproduced by inserting a V4-shaped bundle record into the isolated DB and adding a new member with identical amount, cycle and date. No financial difference exists.

Smallest fix: use one legacy-aware normalized calculation/comparison shape on **both** sides, with missing anchorDate interpreted as that legacy record's nextDate. Preserve the stored old payload unless migrating it deliberately. Test V4→V5 data, not just two new V5 records. Also consider the intentional month-end uncertainty if a legacy nextDate was already clamped.

## P2 — Fully linked payments continue generating “payment expected” reminders

Sources: [notifications.ts:9,22–24](/Users/bigmac_moon/dev/ai_score/site/lib/notifications.ts:9), [billing.ts:91–107](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:91).

Reproduced: create today's due contract, explicitly link its full payment, then call currentNotices. It still returns “결제 예정” for the fulfilled occurrence. Notification generation reads only settings/subscriptions and calls summarizeContracts, ignoring the payment reconciliation now used by BillingReport. Thus the cost report says “결제 연결됨” while the reminder says it is still upcoming.

Smallest fix: load relevant payments and use the same billing report/fulfilled-key filter for billing notices. Use the bundle occurrence identity for deduplication so changing its representative cannot reissue the reminder. Existing notices should disappear when the corresponding actual charge completes the occurrence; deleting/unlinking that charge may restore eligibility. Refunds must not restore eligibility.

## P2 — New unknown states discard separately known residual obligations

Source: [billing.ts:44–47](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:44).

Reproduced a contract with remainingPayments 2, nextDate September 15 and amount 30,000: status unknown or paused+unknown returns an empty schedule immediately, so its two retained known payments contribute nothing. The uncertainty counter is honest about renewal/pause status, but it does not preserve the separately supplied committed obligations. A contract can have known remaining installments while whether it will renew afterward is unknown.

Smallest fix: distinguish the finite known committed-payment schedule from uncertain future renewal. Preserve the two known obligations; mark only the unresolved future portion conditional. If a pause makes even those payment dates/amounts uncertain, retain them as conditional known obligations rather than silently routing all information to an empty schedule. Do not infer additional unlimited renewals from a positive remaining count. This is the new status branch affecting already-supported residual data, not a request to implement full history.

## Resolved during this review / checks that did not produce a new finding

- **Resolved migration blocker:** the first generated 0001 SQL quoted JSON-expression fragments as column names, and 20 API tests failed with `no such column: json_extract("payload"`. Parent replaced it with the literal SQLite expression index. Fresh tests now construct the DB and pass. The present expression index is scoped by user_id and a nonempty plannedKey; it supports atomic duplicate rejection. The drizzle-kit comma-parser regeneration limitation remains documented by the parent; retain that safeguard for future migrations.
- **Resolved upfront arithmetic test:** the initial snapshot failed the new 120→170 upfront fixture. Parent corrected it; fresh 42 tests pass. Savings UI was still being changed, so no final browser/layout verdict is made.
- Cross-account notification hiding is rejected in the existing tests. The read path and pre-send revalidation honor persisted hidden topics; the finding above is stale UI state overwriting that persisted preference.
- Billing matching correctly considers payments outside the selected date range and ignores refunds as completion records. The existing cross-period and refund tests pass.
- Source-sync review-needed state survives failures, 304 and unchanged recovery in passing tests. The public source-status endpoint returns source/run records rather than private payment records. I found no new harmful source-report regression in this bounded source review; I did not independently verify new live provider fetches or production database migration.
- The new personal-share reference is labeled as current-contract schedule arithmetic, not actual personal cash. The absence of full payment-level share history is therefore retained incomplete scope, not the issue reported here; nondeterministic bundle aggregation is the issue.

## Minimal release checks after fixes

Run the current 42 tests plus persisted reproductions for the three P1 cases. Also verify hide→Settings without full-page reload, a legacy bundle join, nonrepresentative bundle-share edit, and a completed occurrence disappearing from billing reminders. Then perform the parent's production migration/save/reload QA. Existing passing tests alone do not cover these cases.
