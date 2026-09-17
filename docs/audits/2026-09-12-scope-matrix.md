# AIs atomic completion matrix and minimum retained billing scope

Read-only specification inventory, 2026-09-12. No site edits, Sites tools, Git changes, browser actions or agent dispatch. Root is implementing the six findings in `/private/tmp/ais-completion-audit.md`; this document does not repeat their diagnosis. Code references describe the snapshot read before those changes and must be refreshed before scoring.

## How to use this checklist

Every checkbox is an **evidence gate**, not a claim that the feature is absent. Check it only after recording the implementation location, an appropriate automated/UI check, the observed result, and whether it ran locally or on the deployment. A code/API-only check cannot prove browser usability or provider delivery.

Source abbreviations (all under `/Users/bigmac_moon/dev/ai_score/docs/`):

- **V**: `2026-09-12-product-plan-v0.6.md`.
- **B**: `superpowers/specs/2026-09-11-subscription-optimization-design.md`.
- **A**: `superpowers/specs/2026-09-11-cancellation-promotion-alerts-design.md`.
- **P**: `superpowers/specs/2026-09-12-page-structure-design.md`.
- **R**: `2026-09-12-site-build-requirements.md`.

`L` means explicit launch/core behavior. `S` means retained detailed scope: implement the smallest faithful manual/unknown-state support, rather than silently claiming full support. `O` means optional input or presentation—the truthfulness/uncertainty rule still applies when used. `D` means explicitly deferred or a proposal, not an invented launch blocker. V:154–156 explicitly retains B/A; V:215 allows reducing complexity/content breadth while preserving the two minimum experiences. It does not authorize displaying unsupported cases as handled.

## Atomic billing and contract gates

| ID | Scope | Completion gate | Source |
|---|---|---|---|
| B01 | L | [ ] Save two independent contracts for the same service without overwriting or merging them. | V:150; B:33 |
| B02 | L | [ ] A bundle with several included tools contributes its contract cost once. | V:150; B:44 |
| B03 | S | [ ] Included tool rows identify the bundle; account alias and personal/work context can be recorded without exposing them publicly. | B:33,44 |
| B04 | L | [ ] Changing a tool's usage state to stopped does not silently cancel its billing contract. | B:42 |
| B05 | S | [ ] Plan, known seats, limits and required features can be recorded without requiring unknown values. | B:34,40 |
| B06 | S | [ ] Distinguish contract total from per-seat quote; unknown seat count/basis produces an incomplete amount, not an assumed one-seat total. | B:35,59 |
| B07 | S | [ ] Contract total and personal share are separate figures/views; unknown personal liability is not treated as zero/free. | B:35,44 |
| B08 | L | [ ] Monetary input uses integer minor units, known currency precision, consistent rounding and server bounds. | B:61 |
| B09 | L | [ ] Missing amount persists as unknown and its excluded count is visible beside totals. | V:150; B:27,59 |
| B10 | L | [ ] Missing next-payment date persists as a draft/unknown; it does not default silently to today and does not invent payment events. | B:27,59 |
| B11 | S | [ ] Fixed monthly, annual and N-month calendar cycles are representable; unusual cycles can use explicitly entered planned dates. | B:36 |
| B12 | S | [ ] Billing anchor and contract timezone are retained or marked assumed; month-end/leap-year handling is consistent and editable. | B:36,63 |
| B13 | S | [ ] Commitment length/remaining bills and billing cadence are distinct. | B:36,42 |
| B14 | L | [ ] Renewal request, confirmed renewal stop, access end and residual obligation remain distinct. | V:147; A:51–53 |
| B15 | S | [ ] Paused/unknown renewal information is representable; unconfirmed pause does not imply no further charges. | B:38,42 |
| B16 | S | [ ] A known cancellation deadline can be recorded separately from next billing and access end. | B:38,130 |
| B17 | L | [ ] Remaining charge count distinguishes unknown, confirmed none and N; it is not erased solely because access ended. | B:57; A:53 |
| B18 | L | [ ] Month-equivalent fixed cost is visibly different from charges actually paid in the selected period. | B:50–51 |
| B19 | L | [ ] Expected cost is the sum of dated future events, rather than monthly equivalent multiplied by duration. | B:52,61 |
| B20 | S | [ ] Confirmed transactions carry their own date, original currency amount and a manual/source indication. | B:39,51,134 |
| B21 | S | [ ] A refund links to an owned original payment, retains a positive refund amount/type, and reduces actual cash flow on its posting date. | B:39,51,142 |
| B22 | S | [ ] A refund in a different month does not rewrite the original month's payment total. | B:51 |
| B23 | S | [ ] Confirmed payment can link to its planned event; selected-period outlook counts it once. | B:53,79,142 |
| B24 | S | [ ] A manual record is not labelled a complete bank/card expenditure history. | B:51,134 |
| B25 | S | [ ] A temporary price has a boundary and separately known/unknown renewal price. | B:37,54 |
| B26 | S | [ ] Future events change to the recorded renewal price at the specified boundary; unknown renewal amounts are not repeated at the discount price. | B:52,54,59 |
| B27 | S | [ ] Free trial is separate from a current paid recurring amount; confirmed first paid date/amount appears as a future event. | B:37,57 |
| B28 | S | [ ] Tax-inclusive, tax-exclusive and unknown-tax prices are distinguishable; unknown additions make totals visibly incomplete. | B:35,55,59 |
| B29 | L | [ ] Different currencies have separate totals and are never silently added. | B:55 |
| B30 | O | [ ] If converted totals are offered, exchange rate, rate date and uncertainty are visible; original records remain unchanged. | B:55,61 |
| B31 | S | [ ] Actual settled KRW amount/fees may be recorded separately from a foreign-currency payment; neither is added twice to the same total. | B:39,55 |
| B32 | S | [ ] Usage-based billing is identified and excluded from fixed recurring totals unless a distinct known base fee applies. | B:59,142 |
| B33 | S | [ ] Usage budget, usage forecast and confirmed usage expenditure are labelled separately; a budget never becomes a predicted/confirmed bill. | B:59 |
| B34 | S | [ ] Current contract price is preserved when public pricing news changes. | B:59,134 |
| B35 | S | [ ] Manual plan/price change retains previous recorded conditions and effective date; future events use the new conditions only when applicable. | B:61,126,134 |
| B36 | S | [ ] Same-period comparison includes known transition costs, overlap and confirmed refunds; unknown proration/refund does not become zero or guaranteed savings. | B:65,86,92 |
| B37 | L | [ ] Savings feasibility applies required features, selected duration and prepayment limit. | R:18; B:83–88,119 |
| B38 | S | [ ] The initial comparison can attach to one existing contract and a small set of verified/manual candidates; it need not optimize all subscriptions jointly. | B:25,83–94 |
| B39 | S | [ ] Show comparison assumption/source/date, required change, lost features and the option to retain current configuration or defer. | B:85–90 |
| B40 | S | [ ] 3-month, 12-month and custom start/end dates affect actual/expected period totals consistently; a dated schedule and monthly grouping/bar view expose when money moves. | B:21–23 |
| B41 | L | [ ] Saving edits/failures preserves inputs; a successful reload shows server-persisted data under the correct account. | V:150; R:14,16 |
| B42 | L | [ ] All extra billing fields/transactions remain private and participate in export/delete. | V:152; B:134; R:20 |

## Smallest faithful data model for the remaining billing scope

The current storage (`site/db/schema.ts:3–5`) already stores validated per-account JSON. Most additions can remain JSON payload extensions; a wholesale database redesign is unnecessary. Existing schema boundaries are `site/lib/validation.ts:8–10,14–16`. Optional/defaulted fields should make existing records readable. Preserve server ownership checks for every linked record. Names below are suggestions, not changes already made.

| Case | Minimum structured fields | Minimum UI/behavior |
|---|---|---|
| Incomplete contract | `nextDate: string|null`; `amount: integer|null`; reason-specific completeness flags derived from data | Allow a blank date/amount; save; display “금액 미확인” / “다음 결제일 미확인”. A missing date prevents scheduled events only, not storing the contract or a known fixed month-equivalent amount. Show counts beside affected totals. |
| Total/seat/personal share | `amountBasis: total|perSeat|unknown`, `seats: integer|null`, `personalShare: integer|null`, optional `accountAlias`, `context`, `requiredFeatures` | A compact “추가 계약 조건” disclosure. Never multiply an unknown number of seats. Keep total and personal-share totals in distinct views. Generic notes can supplement, but cannot drive arithmetic. |
| Calendar/manual cadence | Keep existing cycle values; add `intervalMonths` for N-month cycles and `manual` mode; retain `anchorDate` and `timeZone`; manual planned events reference the contract | Default known regular cycles remain simple. Manual mode lets the user add known dates/amounts; unknown future events stay unknown. No automatic bank integration is needed. |
| Tax/fee information | `taxStatus: included|excluded|unknown`; optional known `taxAmount`; `feesIncluded`/known fee metadata where relevant | Three-way tax choice. If tax is already included, never add it again. If excluded and unknown, display the known subtotal and “세금 별도·총액 미확정”. Do not infer a jurisdiction/rate. |
| One temporary-price transition | Existing current `amount`; optional `introEndsAt` (explicit boundary semantics), `renewalAmount: integer|null`, `priceSource`, `priceCheckedAt`; optional `trialEndsAt`/`firstPaidDate` | A single “할인·체험 기간” disclosure is enough for the initial scope. At/after the clearly defined effective renewal event, use known normal price; otherwise create unknown-price expected events. More than one future promotional phase can remain a later expansion if the supported scope is explicit. |
| Usage-priced contract | `pricingMode: fixed|usage|hybrid`, optional known fixed base amount, `usageBudget`, `usageEstimate`, estimate period/as-of/source | Show fixed base, budget/estimate and actual manual payments separately. No usage meter/provider API required. An estimate is explicitly user-entered and cannot be promoted to actual spend. |
| Charge/refund | Existing payment plus `entryType: charge|refund`, `refundOfId` for refund, positive minor-unit amount, actual posting date, original currency, `source: manual`/note | “결제 / 환불” switch and original-payment selector limited to the current account. Refund appears on its own date. Validate ownership and compatible currency; prevent accidental over-refund/duplicate processing or make exceptional adjustments an explicitly different entry. No card/bank execution. |
| FX settlement/fees | On a confirmed charge/refund, optional `settledCurrency`, `settledAmount`, actual `feeAmount` and explicit “fee already included” state | Record what was actually charged in KRW without overwriting original USD/EUR/etc. Display either original-currency total or settlement view; never sum both representations. Offering an estimated FX conversion is optional. |
| Planned-event reconciliation | Stable `scheduledEventKey` based on the billing contract/group and occurrence; optional matching key on a confirmed transaction | When recording a payment, offer “이 예정 결제의 실제 내역”. Period outlook includes confirmed net cash flow plus unmatched planned events. Do not guess matches from equal amounts/dates alone. Define behavior for correcting/deleting a matched payment. |
| Price/history update | Append a compact condition revision or preserve `previousConditions` with effective date and change reason | Editing a future price must not rewrite historical payments or old comparison assumptions. One visible change-history list can suffice; no event-sourcing framework required. |
| Unknown suspension/access | Root's residual-billing changes plus distinct renewal/access data and optional `pauseBilling: continues|stopped|unknown` | “일시 정지” must not silently stop billing. Retain prior estimate with uncertainty until the billing effect is confirmed. |
| Comparison outcome | Root's saved-record work plus structured target contract/candidate IDs, same-period assumptions, reason, self-reported decision/result date | Reopen/edit from My Workspace; label as customer record. Do not count a click, saved comparison or a claimed saving as verified financial success. |

Simple computation order: **normalize recorded contract conditions → generate dated planned events → apply only recorded price transitions → reconcile explicitly linked confirmed transactions → sum by currency/view and time window → attach completeness/assumption flags**. Keep the pure arithmetic reusable by summary, schedule, alerts and comparison; do not separately reimplement arithmetic in each screen.

The minimal scope does **not** require automated taxes/FX, automatic prorations, bank/card import, checking private provider accounts, charging/cancelling subscriptions, or a universal pricing optimizer. Unknown states/manual confirmed records are faithful where the specifications permit them. They are not a substitute for actually supporting a refund record or price transition when those cases are listed for launch validation.

## Decisive billing oracles

| Scenario | Expected result |
|---|---|
| September 15 payment ₩20,000; October 2 refund ₩5,000 linked to it | September confirmed net ₩20,000; October confirmed net −₩5,000; combined net ₩15,000. Do not revise September to ₩15,000. |
| Monthly ₩10,000 through September; normal October amount ₩20,000; next date September 15; query Sep–Nov | Events Sep 15 ₩10,000, Oct 15 ₩20,000, Nov 15 ₩20,000; expected ₩50,000. Boundary is explicit. |
| Same introductory period, normal price unknown | September known ₩10,000 plus two unknown-price future events; display incomplete total, not ₩30,000 or a complete ₩10,000 forecast. |
| ₩10,000 excludes tax, tax unknown | Known subtotal ₩10,000, tax unknown; no invented gross amount. A known ₩1,000 tax yields ₩11,000 only in the exclusive-tax case. |
| Pure usage plan; monthly budget ₩50,000; confirmed payment ₩23,000 | Fixed monthly fee is absent/0 with usage mode visible; budget ₩50,000 is separate; confirmed record is ₩23,000. Budget is not summed into expected or actual bills. |
| Known monthly ₩20,000, next payment date unknown | Record survives reload. Known monthly equivalent may display; schedule/period projection flags missing date rather than creating today's bill. |
| Planned October annual bill ₩120,000 explicitly matched to a confirmed ₩120,000 transaction | Period outlook contains ₩120,000 once, not ₩240,000. Unmatched bills remain projected. |
| USD $20 payment, actual card settlement ₩28,000 inclusive of a ₩500 fee | Original view $20; actual settlement view ₩28,000, not ₩28,500 and not a sum of both currencies. |
| Annual access still active after renewal stop | Show access end/renewal stop distinctly; retained-period monthly-equivalent display, if offered, is labelled as a cost allocation, not a renewed bill. Residual billing follows root's independent residual state. |

Run the decisive oracles as pure tests plus account/API round trips for new fields, and at least one browser task that creates each newly exposed record type, reloads, edits and deletes it. Bundle, currency and ownership cases must also exercise the new record links.

## Atomic public information, community and personal gates

These cover retained V requirements outside detailed billing. Root's six remediations are referenced only as completion gates.

| ID | Scope | Completion gate | Source |
|---|---|---|---|
| V01 | L | [ ] The default home remains public information discovery before and after login. | V:3,19–24,65–76 |
| V02 | L | [ ] The five top-level menus distinguish discovery, exploration, news/events, community and the private page on desktop/mobile. | V:51–61 |
| V03 | L | [ ] New-information, comparison, learning and event-discovery tasks complete without personal records/account creation. | V:173–183 |
| V04 | L | [ ] Home gives meaningful routes to categories, comparisons/guides, current changes/events and actual public experiences; no fabricated popularity/activity. | V:67–78 |
| V05 | L | [ ] Every tool is real and identifies app/model/SaaS and its provider without mixing model performance with app evaluation. | R:10; V:98 |
| V06 | L | [ ] Each tool's function, suited work and major constraints are understandable from its detail page. | V:82; P:49–61 |
| V07 | S | [ ] Platform, Korean support, input/output, integration and price/free-range claims are sourced or explicitly unknown. | V:82–84 |
| V08 | L | [ ] Logos and feature/update claims have relevant official provenance and separate content-check dates. | R:10; V:84,105,121 |
| V09 | L | [ ] Global public search covers actual available content types with grouped results; hidden/deleted/private text is excluded. | V:88–94 |
| V10 | L | [ ] Tool filters preserve explicit required conditions; unknown is not satisfied and no-results does not silently relax them. | V:90,94 |
| V11 | L | [ ] Recommendations state contextual relevance/conditions; optional ownership does not become a prerequisite for public search. | V:23,90–94 |
| V12 | L | [ ] Untested editorial axes show unassessed, not zero or fabricated score. | V:98–108 |
| V13 | L | [ ] User ratings expose sample/axis response counts, task/plan/use date and self-report status; deduplication agrees with published method. | V:104–108,135 |
| V14 | S | [ ] Any direct evaluation shown includes task/input, plan/version, date, method, result, strengths and limitations. If none exist, say so. | V:98–108 |
| V15 | L | [ ] Up to three comparison candidates can be read anonymously under comparable criteria with source/condition differences. | R:11; V:106–108 |
| V16 | L | [ ] A guide states the target result, prerequisites/plan, usable input example, steps, output checks and likely failure recovery. | V:112–114 |
| V17 | S | [ ] Where a guide combines tools, automatic integration is distinguished from manual transfer. Unreproduced guides are not labelled tested. | V:112; V:193 |
| V18 | L | [ ] News/update pages explain the change, relevance/affected users, rollout status and official source; published and checked dates are not conflated. | V:120–121,129 |
| V19 | L | [ ] Event information gives topic, intended audience, organizer, time/timezone, delivery mode, cost, registration condition and known deadline. Unknown deadline stays unknown. | V:125,129 |
| V20 | L | [ ] Expired events/promotions are visibly ended and not presented as currently available opportunities. | V:129; P:85–86 |
| V21 | L | [ ] Reviews/questions/contributions do not require a personal subscription or tool record. | V:133–137 |
| V22 | L | [ ] Reviews require task, plan and use date; maker/sponsored relationships are visible. | V:135 |
| V23 | L | [ ] Questions can be received; answer viewing, content correction/reporting and own contribution management work. | V:135; R:15 |
| V24 | L | [ ] Official facts, source-verified editorial material and unreviewed user contributions remain distinguishable. | V:135–137 |
| V25 | L | [ ] No-review/no-community state honestly links to useful official information/guides. | V:137,183 |
| V26 | L | [ ] My tools supports use/trial/interested/stopped, purpose, private notes, collections and user-defined services. | V:143,150 |
| V27 | L | [ ] Saved tools/comparisons/guides/news/events reopen after account reload; choice reasons/outcomes are optional private records. | V:144,150,217 |
| V28 | L | [ ] Authentication restores the pending action/draft and failures preserve input without claiming success. | V:150; P:80–88; R:16 |
| V29 | L | [ ] Generic cancellation help is available publicly without requiring a stored personal contract. | V:152 |
| V30 | L | [ ] Personal records use authenticated account ownership, remain private, export completely and delete according to the visible promise. | V:150–152; R:14,20 |
| V31 | S | [ ] Public content operating plan names responsibility, cadence/time allocation, reviewed scope and how changed facts are edited/published. | V:189–200 |
| V32 | L | [ ] Source-sync status distinguishes connectivity, discovered document changes, editorial fact verification and actual content publishing. | V:191–194; R:19 |
| V33 | S | [ ] Optional feedback separates information-understanding responses from personal-management responses and accepts the guest information route. | V:231–233 |
| V34 | S | [ ] Operations displays each feedback question, period, denominator, nonresponse/not-attempted handling and repeated-response rule; no combined invented benefit score. Empty data is labelled empty. | V:231–233 |
| V35 | L | [ ] AI QA is labelled AI QA; clicking, copying, self-report and estimated savings are not represented as proven learning or financial results. | V:114,171,228,233; R:39 |
| V36 | L | [ ] Keyboard/forms, errors/retry, mobile detail/compare/private screens and principal deployed flows have observed checks. | P:108; R:20–21,32–37 |

V31–V34 are documented product/operating requirements; the specification does **not** demand a nonzero amount of real survey data at first deployment. A working optional collection flow and honest empty dashboard can satisfy implementation. QA-generated samples must not masquerade as real customer research. At the reviewed snapshot, `site/components/Admin.tsx:4` shows reports, proposals, sync and email counts only; benefit-feedback collection/display was not present in `site/db/schema.ts` or `site/lib/validation.ts`.

## Atomic cancellation, notification and email/provider gates

| ID | Scope | Completion gate | Source |
|---|---|---|---|
| A01 | L | [ ] Customer-selected actual payment channel controls help; unknown invokes recovery rather than inferred web/app-store routing. | A:15–17,114–115 |
| A02 | L | [ ] Supported help includes official URL, menu sequence, account/permission condition, scope and check date; reading it does not change contract state. | A:21–35,108,117 |
| A03 | S | [ ] Missing service, missing button, changed screen and insufficient permission lead to relevant official support/correction route and preserved progress. | A:37–47,116 |
| A04 | L | [ ] Request, confirmation time/source, access end and remaining bills can be recorded separately; external link clicks never assert cancellation success. | A:49–53,103 |
| A05 | S | [ ] Alert entry points support selected service/comparison candidates; choosing a tool does not implicitly opt into all alternatives. | A:59–66 |
| A06 | L | [ ] Alternative matching explains overlapping work/features; category overlap alone is not proof of suitability. | A:68 |
| A07 | L | [ ] Region/customer/student/channel eligibility is explicit; unknown/ineligible promotions are not presented as applicable personalized email. | A:68–70,120–121 |
| A08 | S | [ ] Alert gives matching reason, benefit period, renewal terms, conditions, deadline/timezone when known and source/check date. | A:74 |
| A09 | L | [ ] Customer can hide/not-interested, modify topic conditions and disable each channel; channel cancellation preserves app history. | A:82,94 |
| A10 | L | [ ] Same offer/customer/meaningful-version is deduplicated across matching relationships and email modes. | A:90–92,119,123 |
| A11 | L | [ ] Every send/retry rechecks source validity, interests, eligibility/features and consent; expiry/opt-out cancels waiting delivery. | A:94,122 |
| A12 | S | [ ] Corrected price/eligibility updates the original card and only meaningful permitted corrections trigger a new message. | A:92,96 |
| A13 | L | [ ] Email starts off; opting in identifies the account address and delivery mode/timezone/time. | A:88; R:19 |
| A14 | S | [ ] Digest and condition-matched timing can actually be delivered according to the offered settings, including without the customer opening notifications. | A:86,88–90 |
| A15 | L | [ ] A real authorized email provider with a verified sender is configured in runtime, with secrets outside source/export/client payloads. Missing configuration disables sending and displays unavailable status. | R:19–21; maintained actual-delivery requirement |
| A16 | L | [ ] An authorized test recipient actually receives a consented message; provider acceptance, delivery/receipt, failure and retry records are not conflated. | A:86,94,106,110; R:21,25 |
| A17 | L | [ ] Provider ambiguity/retry uses the same delivery identity; no duplicates after uncertain acceptance or beyond the provider's supported idempotency window. | A:94 |
| A18 | L | [ ] Real unsubscribe/settings change prevents queued/retried delivery and its effect survives reload. | A:94,122 |
| A19 | L | [ ] The email link returns to the corresponding app item and current terms/status, not stale copied claims alone. | A:88,92,96 |
| A20 | L | [ ] Runtime operational records expose queued/sent/failed/cancelled/needs-review states and provide a real recovery path. | A:86,94,106; R:37 |

The reviewed implementation has an outbox and provider adapter (`site/lib/notifications.ts:13–17`), but actual provider configuration and autonomous delivery are distinct completion gates. Only `site/app/api/notifications/route.ts:6` invokes delivery in the reviewed snapshot; waiting for the user to open the app is not evidence of a functioning unattended digest. A provider key cannot be synthesized, a mock cannot prove receipt, and a disabled feature remains outstanding even when its unavailable-state UX is correct.

The smallest operational version may use a real scheduled server worker or a trusted administrative dispatch that follows the offered processing schedule and recorded preferences. The UI must describe the schedule actually implemented. Do not promise a daily digest with only visitor-triggered processing. Use already authorized infrastructure/recipient configuration; this matrix does not request new third-party purchases or messages.

## Explicitly deferred, optional or proposed — do not invent blockers

| Item | Classification and source |
|---|---|
| Bank/card/receipt import, automatic billing connections | Deferred expansion: B:15–17,136–140; V:211. Manual records are sufficient. |
| Executing payment, cancellation or refund on the customer's behalf | Not first-release scope: B:126; A:35,55. |
| Optimizing many subscriptions as one configuration | Iterative/future depth: V:210; B:94,139. Start with one contract and a few candidates. |
| Automatic market-wide promotion collection | Deferred; manual verified offers permitted: B:107–109; A:86,110. |
| Push/SMS/other external channels | Deferred; first external channel is email: A:88,110; V:211. |
| Renewal/trial-ending external reminders and optional promotion deadline re-alert | Deferred beyond in-app schedule: B:130; A:92,110. |
| Exact “15–20 tools / about 6 deeply evaluated tools / about 6 guides / at most 3 tasks” counts | V:204 explicitly calls these a pre-validation operating proposal. Do not fill missing assessments with invented scores to hit the count. |
| Three-times-daily conditional-email cap / one daily general digest as immutable numeric service guarantees | A:90 explicitly says these numeric defaults are proposals adjustable with feedback. The offered delivery mode, truthfulness, consent, dedupe and timing behavior are still required. |
| A precise 50/50 screen/time split between information and personal management | Explicitly rejected interpretation: V:27. Evaluate independent useful paths and priority instead. |
| Compulsory actual user studies or minimum positive survey responses before any AI QA score | Not specified. R:39 allows labelled AI criteria review; V:231–233 prohibits inventing customer outcomes. |
| New database subsystem, generalized event sourcing, automated proration/tax engines | Not specified. Manual known values and explicit unknowns are permitted; preserve historical records and arithmetic. |

## Exact score rubric and completion gates

The authoritative text is **R:25**:

> 각 영역을 100점 만점으로 따로 평가하고 모두 88점 이상이어야 완료한다. 점수는 검증한 기준의 획득점 합계이며 목표에 맞춰 역산하지 않는다. 미검증은 미획득, 실제 기능이 없는 목업·로컬 전용 저장·허위 최신 정보는 구현으로 인정하지 않는다. 보안·개인정보 중대 결함, 깨진 핵심 흐름, 배포 실패가 있으면 해당 영역은 최대 60점이다.

**R:53 adds an independent gate:**

> 88점 미달 또는 명시 요구사항 미구현이 남으면 목표를 완료로 표시하지 않는다.

This yields the following exact application:

1. Score each of the nine areas separately. **Every area must be ≥88.** A high mean or improvements elsewhere cannot compensate for one area below 88.
2. Earn only points supported by verified criteria. Unverified portions receive no earned points. A mock, accountless local storage or false latest-content claim does not count as implementation.
3. Apply **max 60** to each **affected** area when there is a **major security/privacy flaw, a broken core flow, or deployment failure**. Do not automatically cap every category because one unrelated area has a defect. State the actual observed trigger and affected area(s).
4. Missing features without one of those severity triggers are not automatically a 60-cap event; they receive no implementation credit for their affected criteria and still block overall completion under R:53 while explicit requirements remain unimplemented.
5. A disabled email adapter with honest messaging is evidence for unavailable-state handling, **not** for real email delivery. It does not by itself prove a major security flaw or trigger an automatic global cap.
6. No specification supplies an additional universal 80/85 cap, an arbitrary per-bug deduction, or permission to round 87.x to 88. Do not invent them.
7. The fixed rubric defines subcategory totals but **does not define atomic weights inside each subcategory**. Allocate/record a defensible checklist under the fixed totals before assigning completion scores; do not backfill weights to reach 88. A checkbox count is not automatically a point count.
8. With a cap trigger, area score is `min(sum of verified earned points, 60)`. Without one it is the verified earned sum. If an entire subcategory worth W is unverified, even otherwise perfect evidence cannot exceed `100-W`; do not presume an entire subcategory is unverified merely because one specific test is missing.
9. Preserve a separate explicit-requirement checklist. Passing numerical criteria cannot override R:53's unimplemented-requirement gate.

| Area | Fixed subcategory weights (R:29–37) | Main evidence |
|---|---|---|
| Identity/plan | Information first 25; full scope 35; guest value 20; separate personal space 20 | V01–V04, public vs private user tasks, scope matrix |
| Content/currentness | Official provenance 30; actual logos 15; features/updates 25; uncertainty/dates 20; app/model distinction 10 | V05–V08,V18–V20,V31–V32; official-content spot checks, sync outcome |
| Design | Mature theme 25; hierarchy 25; density/spacing 25; whole-screen consistency 25 | Actual desktop/mobile reviews, including new forms |
| Usability | Principal tasks 40; navigation/search 20; status/recovery 20; keyboard/forms 20 | Browser tasks, failure recovery and keyboard observations |
| Comfort/accessibility | Responsive 25; reading/contrast 25; rendering performance 25; errors/stability 25 | Screen/contrast, appropriate measured performance, error checks |
| Usefulness | Detail/compare 30; search/recommend 25; content/guides 25; conditions/reasons 20 | Anonymous information tasks and understandable conclusions |
| Community | Ratings/reviews/proposals 30; Q&A 25; persistence/ownership 25; reporting/labels 20 | V21–V25; API boundaries and deployed author/moderator paths |
| Personal functions | Login/isolation 25; tools/save/collections 20; cost/savings 25; cancellation/alerts 20; export/delete 10 | B/A gates, account boundary tests, actual new-field round trips |
| Deployment/operations | Actual deploy 25; deployed core flows 25; persistence 25; sync/operational state 25 | Production URL/runtime, database round trips, real sync and provider status |

No updated score is assigned here. The root should attach new evidence to this matrix after its fixes, record remaining external dependencies plainly, and only then recompute the nine scores without target-driven adjustments.
