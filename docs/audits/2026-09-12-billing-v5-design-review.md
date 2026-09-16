# V5 retained billing design review

Read-only review, 2026-09-12. Scope: retained requirements and the V4 implementation of billing, validation, RecordForm, MyWorkspace, workspace API, and Savings. This is a proposed implementation design, not a claim that V5 exists or passes. No source, Git, Sites, or browser changes were made.

## 1. What is actually required

Authority: [v0.6:139–158](/Users/bigmac_moon/dev/ai_score/docs/2026-09-12-product-plan-v0.6.md:139) explicitly retains the detailed billing specification; [build requirements:17–18](/Users/bigmac_moon/dev/ai_score/docs/2026-09-12-site-build-requirements.md:17) summarize rather than remove it. Below, **B** means [subscription specification](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-subscription-optimization-design.md), **C** means [cancellation specification](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-cancellation-promotion-alerts-design.md). Field names and numeric implementation limits proposed here are engineering choices, not quotations from those requirements.

| Retained behavior | Exact authority | Smallest faithful completion |
|---|---|---|
| Confirmed + outstanding planned period forecast without double counting | B:51–53,79; launch cases B:142 | Explicitly link a confirmed charge to its planned occurrence, preserve the link, and remove that occurrence from outstanding forecast. A refund is separate. |
| Customer-selected reporting dates and 3/12-month presets | B:21–23,51–53,86; v0.6:154 | Shared inclusive start/end controls for actual, scheduled, outstanding, total forecast, and monthly cost bars with labeled amounts. |
| N-month calendar billing; other cycles via manual schedules | B:36,63 | Positive integer calendar-month interval; manual dated events for unsupported cycles. Preserve the original day anchor, expose estimated versus provider-confirmed schedule rules. |
| Conditions/effective dates and earlier records preserved | B:37,59,61,126,134 | Append dated financial-condition versions when the customer confirms a change; do not overwrite old cash records or infer a user's renewal price from public news. |
| Paused and unknown renewal; access ending independent from remaining bills | B:38,42,57; C:53 | Store uncertainty explicitly, retain known obligations, and never interpret an unknown pause as confirmed no-billing. |
| Current/alternative costs over the same period, including overlaps, transition fees and evidenced refunds | B:65,83–94 | One-contract comparison with dated current/candidate charge events and dated adjustment events; unknown conditions block a definitive feasible savings recommendation. |
| Contract total and personal contribution as separate views | B:34–35,44 | A scope switch changes every corresponding aggregate; explicit zero differs from missing. Do not add the two scopes. |
| Currency/date/precision consistent, missing inputs disclosed | B:55,59,61,63 | Integer minor units, currency-separated sums, date semantics and incomplete counts stated consistently. |

Optional/deferred: customer bank/receipt import, executing payment/cancellation/refund, deriving provider-specific proration automatically, global multi-subscription optimization, team administration, automatic FX, and external renewal reminders/push. B:94 explicitly permits first-version comparison of one contract and a small reviewed candidate set; B:126,130,138–140 distinguish later scope. A full double-entry ledger, arbitrary recurrence-language parser, live exchange-rate integration, and split-payment allocation are not required. A manually entered unknown value is allowed, but a visible field whose value never affects the stated calculation is not completion.

## 2. Current seams and hazards

| Current source | Consequence for V5 |
|---|---|
| [billing.ts:1–3,29–33](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:1) | Only 1/3/12-month cycles. `nextDate` doubles as an anchor; advancing January 31 to February 28 loses the original 31-day anchor if regenerated from the new value. |
| [billing.ts:35–57](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:35) | Schedule contains contract ID/date/amount only; no immutable occurrence identity, payment link, or condition revision. Bundle representative is whichever known-price member sorts first, which is unsuitable as an occurrence identity. |
| [billing.ts:41–55](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:41) | Renewal inference is the two statuses active/requested. Adding `paused` or `unknown` to the enum alone would route them through the cancellation residual logic and can lose information. |
| [billing.ts:69–75](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:69) | Only one current-to-renewal amount transition; all dates share current seats/tax/currency/pricing mode. This cannot preserve multiple confirmed condition changes. |
| [billing.ts:77–81](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:77) | Actual cash by posting date exists; there is no personal-share cash record or forecast reconciliation. Refunds correctly affect their own period. |
| [validation.ts:8–10](/Users/bigmac_moon/dev/ai_score/site/lib/validation.ts:8) | Extend and normalize schemas once; form-only fields would be stripped. Current fields distinguish amount-null and unknown residuals, which must survive migration. |
| [RecordForm.tsx:9](/Users/bigmac_moon/dev/ai_score/site/components/RecordForm.tsx:9) | Existing advanced values are copied and converted individually. New money fields need correct currency scaling, blank/null semantics and edit hydration; raw JSON-only additions are insufficient. |
| [MyWorkspace.tsx:17](/Users/bigmac_moon/dev/ai_score/site/components/MyWorkspace.tsx:17) | Forecast uses today + preset, actual is fixed month-to-date, and personalShare is text only. All three need a shared reporting/scope state and shared computation result. Do not silently `catch {}` an invalid custom range. |
| [workspace API:39–42,65](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:39) | Bundle validation/synchronization enumerates financial fields. All new shared billing fields/history/identity must participate. Personal share is contract-level, so differing values across bundled tools must not become whichever member sorts first. |
| [workspace API:45–55](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:45) | Existing refund ownership, currency, chronology, balance and original-charge preservation checks must remain effective with planned matching and payment editing. |
| [workspace API:66–70](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:66) | Cancellation mutates subscription conditions through a second path. This path must create the same history/state update as ordinary subscription editing. |
| [Savings.tsx:4](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:4), [billing.ts:59–66](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:59) | Existing calculator assumes cycle-start usage, constant monthly/annual price and no transition costs. Keep it as a clearly labeled simple comparison or replace its arithmetic with the dated scenario engine; adding fee fields beside unchanged multiplication is insufficient. |

## 3. Minimal coherent JSON design

Keep the existing account-owned `private_records` and their public/private separation. Introduce additive JSON fields and normalize old records at read/calculation time. The following is one coherent shape; equivalent simpler names are fine if the invariants below hold.

```ts
type DateOnly = string; // Valid YYYY-MM-DD, inclusive calendar date.
type Minor = number;   // Nonnegative safe integer in the adjacent currency.

// Stored on a subscription. All members of one bundle share billingId.
type BillingExtension = {
  billingId: string; // Server-owned stable contract identity, not editable bundle label.
  cycleMonths?: number | null; // Used with cycle:'custom'; e.g. 2, 6, 18.
  billingTimeZone?: string | null;
  scheduleRule?: 'confirmed_anchor_clamp' | 'estimated_anchor_clamp' | 'manual';
  series?: Array<{
    id: string; anchorDate: DateOnly; everyMonths: number;
    from: DateOnly; until: DateOnly | null;
    // A date correction keeps the same occurrence identity.
    overrides?: Array<{index:number; date:DateOnly}>;
  }>;
  manualEvents?: Array<{
    id:string; date:DateOnly; amount:Minor|null; currency:string;
    personalAmount?:Minor|null;
  }>;
  conditionHistory?: Array<{
    id:string; effectiveFrom:DateOnly|null; recordedAt:string;
    source:string; checkedAt:DateOnly|null;
    // Full financial snapshot, not an ambiguous partial patch.
    terms:{amount:Minor|null; currency:string; amountBasis:string; seats:number|null;
      taxStatus:string; taxAmount:Minor|null; pricingMode:string;
      personalShare:Minor|null; cycleMonths:number|null;
      renewalState:string; pauseBilling:string|null;
      accessStart:DateOnly|null; accessEnd:DateOnly|null;
      remainingPayments:number|null};
  }>;
  // Existing status can be extended instead of adding a second mutable status.
  // If two fields exist, one must be derived to prevent disagreement.
  pauseBilling?: 'continues' | 'stopped_confirmed' | 'unknown';
};

// Add to a confirmed payment; absence means an unlinked actual record.
type PaymentExtension = {
  plannedEventId?: string | null;
  personalAmount?: Minor | null; // Actual personal charge/refund, NOT current plan share.
  personalSettledAmount?: Minor | null; // Only if offering personal settlement totals.
};

type ReportingPeriod = {from:DateOnly; until:DateOnly};
type AmountScope = 'contract' | 'personal';

type CostAdjustment = {
  id:string; kind:'transition_fee'|'refund'; date:DateOnly|null;
  amount:Minor|null; currency:string;
  certainty:'confirmed'|'unknown'|'not_applicable';
  source:string; checkedAt:DateOnly|null; originalPaymentId?:string|null;
};
```

The complete snapshot can reuse current subscription fields rather than declaring another unrelated price type. `series` is necessary only when cadence changes; one immutable series is enough for an unchanged contract. `manualEvents` covers other billing cycles without implementing arbitrary recurrence. Numeric list/date limits should reject unsupported ranges with a useful error, never silently truncate a report.

Suggested small bounds are cycleMonths 1–120, at most 1200 months per report, and bounded arrays for manual events/history; these are implementation choices. Calculate worst-case sums with `Number.isSafeInteger`, since today's maximum amount × maximum seats × many events can exceed safe integer precision even though every individual input passes validation. A lower documented limit or BigInt-backed summation is acceptable.

Migration: generate a stable billingId for each existing standalone subscription and one shared value for every existing bundle. Preserve legacy IDs and linked payments. Normalize old monthly/quarterly/annual cycles to 1/3/12 internally. Preserve existing nextDate as the initial anchor and label unverified provider calendar behavior as estimated. Do not manufacture historical effective dates: an initial snapshot can say earlier history is unavailable. Preserve the legacy top-level current conditions as the forward-looking baseline captured at migration, clearly separating its observation date from an unknown original effective date; historical reports before that supported baseline must disclose unavailable history rather than applying today’s terms backward. Convert the existing priceChangesAt/renewalAmount pair into a future condition version without losing the original amount. Do not initialize personalShare to zero or the total.

## 4. Planned versus actual: identity and exact arithmetic

**Immutable key.** Generated occurrence ID is `billingId + ':' + series.id + ':' + occurrenceIndex`. The index is measured from the immutable original anchor, not from the selected report start, the current `nextDate`, or an array position after filtering. Manual events use `billingId + ':manual:' + event.id`. Names, amount, currency, editable bundle labels and displayed due dates are not identities.

**Edits.** A price/tax/share change preserves the occurrence ID and changes its dated expected conditions. A correction to one due date preserves its key through an override. A genuine new cadence closes the old series and starts a new one; it must not silently discard/remap linked charges. Block conflicting cadence edits with instructions to resolve affected linked occurrences. Do not create a new series for a mere rename. Merely recording a payment must not reset the anchor. Derive “next unconfirmed bill” from the series + links.

**Small first-version matching rule.** One confirmed charge may mark one planned event fully paid. Provide an optional “연결할 예정 청구” selector with “별도 결제 / 연결 안 함”. Choosing an event explicitly means “this occurrence is fully confirmed”, even if the actual amount differs from the estimate; show expected-versus-actual variance. Partial settlement allocation is not a retained requirement, so do not offer it silently. Refund records cannot carry plannedEventId and do not reopen planned events.

Server validates ownership, charge kind, billingId membership, event existence and compatible original currency. A charge from an included bundle tool may match the same single bundle event. A second charge cannot complete the same event; return 409 and offer the existing record. This uniqueness must be atomic under concurrent requests—an application read-then-write check alone is insufficient. A small unique projection/index or transactional conditional insert is acceptable if JSON alone cannot enforce it. Editing a linked charge's subscription/currency or an event identity requires validated unlink/relink, never stale linkage. Existing refund constraints remain in force.

For each currency and amount scope:

```text
confirmedNet = charges posted in [from, until] - refunds posted in [from, until]
plannedAll = all calculated scheduled charges due in [from, until]
outstanding = plannedAll whose keys are not completed by any actual charge
periodOutlook = confirmedNet + outstanding
```

Build the completion-key set from **all relevant actual records**, then filter actual cash by the selected period. An early September 30 charge completing an October 1 occurrence must suppress October's schedule even though that actual charge is outside October. A refund in October for a September charge changes October confirmedNet, not September, and never adds the September scheduled bill back. A confirmed actual charge outside the range can therefore suppress a planned event inside it without itself entering periodOutlook; that is correct cash timing.

Keep confirmed, original planned and still-outstanding values visually distinct. Monthly bars use the same per-currency buckets, with confirmed and outstanding values distinguishable and their amounts available as text; do not stack original planned on top of already matched actual cash. Display incomplete counts for unknown actual personal shares, planned price/date/tax/renewal, unmatched obligations and unrecorded history. An unlinked charge is included in actual cash but never guessed to match a planned event from similar date/amount; show “예정 청구 연결 안 됨” so the customer can prevent apparent duplication. Never add settlement currency totals to original-currency totals.

If a linked charge's actual personal amount is unknown, the planned event is still fulfilled; do not restore its planned personal share as actual. Mark the personal cash/outlook subtotal incomplete. Deleted charge: its planned occurrence becomes outstanding again; refund-linked originals remain undeletable under current safeguards. Known residual count is anchored to its original remaining series; matching a payment does not both decrement the count and remove the matched event, which would erase an additional obligation.

## 5. Dates, histories, pause, and personal scope

### Reporting and recurrence

- One validated `[from, until]` drives actual, planned, outstanding, outlook and monthly buckets. Presets compute the same inclusive interval currently used by horizonEndDate. Reject inverted/invalid ranges visibly; never retain a previous period's number under new labels.
- Generate dates as `monthAfter(originalAnchor, index * cycleMonths)`. Do not repeatedly add months to the previous clamped date. Preserve the provider's confirmed rule; when unconfirmed, label the dates estimated and allow an override/manual schedule. Changing the report start must not change event IDs or dates.
- `cycle:'manual'` has no invented monthly equivalent. Show “월 환산 미지원 — 수동 일정 기준” unless the customer supplies an evidenced coverage period. Manual events are included exactly once on their own date.
- Dates are date-only in the stored contract billing timezone. A minimal date-based product can clearly state that each event is grouped by the provider-local billing date; it must not claim cross-timezone instant precision. If the UI promises one Korea-time calendar, capture a real timestamp/zone or mark conversion unknown instead of shifting a date-only value. Timezone text alone is not complete conversion support.

### Conditions and effective dates

- `termsAt(date)` selects the latest confirmed snapshot with effectiveFrom ≤ date. All dated fields—price, seats, tax, currency, cycle, personal share and renewal state—must use that snapshot. Do not apply today's seats to an old forecast or reinterpret an old USD amount as KRW.
- A change that occurs between bill dates affects the next actual due event at or after that effective date. Do not invent a new mid-cycle charge or refund. Such charges must be explicit manual/adjustment events backed by the customer or provider.
- Effective date is required to apply a changed condition to forecasts, but an unknown-date draft may be saved. Keep it pending with an incomplete warning instead of defaulting it backward to the start of time. Saving metadata alone must not fabricate a price change.
- Server appends previous/new snapshots and recordedAt; the ordinary save form must not accept client rewriting of historical snapshots. A deliberate correction can append a correction version while preserving the replaced record and its reason. Same-date conflicting changes need an explicit deterministic latest-version rule or rejection.
- Future effective terms must not become the “current price” before their date. Do not retroactively rewrite payment amounts. Cancellation saves and bundle propagation follow the same history path. Keep one shared bundle history and identity rather than independent, diverging copies.
- Monthly equivalent uses the current paid coverage and current fixed terms, separate from cash forecast. A confirmed canceled annual contract may still have known prepaid access; representing that coverage is supported by B:57. If paid coverage is unknown, do not invent it from an access-end date alone. Trial/usage budgets remain separate.

### Pause and unknown renewal

Use active/requested/stopped/paused/ended/unknown states or a derived equivalent. `cancel_requested` is not cancellation confirmation. An unknown renewal means there may be future renewal obligations: show existing dates as conditional if useful and exclude their uncertain total from a “confirmed conditions” total while counting the uncertainty. Explicitly known remaining contractual payments continue even after access ends.

Paused is not automatically zero. With provider-confirmed billing continuation, preserve scheduled charges. With provider-confirmed billing suspension, suppress only charges within the confirmed pause interval; resumption date and cadence must be known before inventing later dates. With unknown pause billing, retain known committed obligations and mark the rest conditional. A known resume date alone does not prove whether the billing anchor shifted. Do not route every non-active status through a single `remainingPayments===0` branch.

### Personal-share view

Define existing personalShare as **the user's total contribution per contract billing occurrence**, tax-inclusive if known, never per-seat unless a separate explicit basis exists. The selector changes monthly equivalent, planned amounts, outstanding amounts, actual amounts and outlook together. Contract total and personal total remain separate—not added.

At each planned event use the effective share snapshot; null means unknown, zero means confirmed no personal burden. For actual entries, use payment.personalAmount (and refund.personalAmount) recorded for that entry; today's contract share or a prorated ratio is not evidence of past personal cash. If offering a quick prefill from expected share, label it as a suggestion requiring confirmation. Do not derive personal refund automatically from contract refund when allocation is unknown.

Count a bundle once and share its contract-level personal share across members. Validation should prevent a personal amount larger than a known same-currency gross charge unless the product explicitly supports documented additional personal fees. Never block saving an unknown gross/share just to force a number. Mixed-currency personal totals remain separate.

## 6. Transition/overlap comparison: one event engine

The smallest faithful extension is a one-contract **dated scenario** comparison, reusing schedule generation rather than a separate fee calculator:

1. Customer selects start/end, current contract or explicit current conditions, alternative conditions/start date, feature sufficiency and known eligibility.
2. Current scenario keeps current scheduled future payments through the selected end, including known price transitions and remaining obligations.
3. Alternative scenario includes current payments that remain committed until the confirmed stop/change date, the new plan's payments from its actual start, and dated transition fees/refunds.
4. Sum each scenario's future charges + confirmed fees − confirmed expected refunds in the same interval. Any applicable unknown charge/fee/refund/date/feature/eligibility keeps the result provisional. Show known components and missing conditions, not a definitive eligible winner.
5. `expectedNetSaving = currentScenarioNet - alternativeScenarioNet`. Negative means the change costs more. Show first payment/combined upfront cash separately from total. Compare the prepayment ceiling against actual due-together required outlay, including transition fees, not only annual sticker price.

Overlap is a consequence of having both contracts' charge events during the period. Do not add an “overlap cost” again if those events are already present. Already-paid subscription coverage that overlaps the candidate is a time/use tradeoff, not a new cash expense. Past prepayments stay in past actual records unless an evidenced future refund is entered. Do not invent an amortized refund or charge annual price prorata for an eight-month project.

A provider-confirmed future refund can be included in **forecast** as an adjustment with expected posting date/source; it is not confirmed actual cash until the customer records its real posting date. Missing refund information means no credited refund and an explicit uncertainty. Known no refund is an affirmative `not_applicable`/zero state, different from an empty field. Unknown transition fee must likewise not default to zero. Deduplicate an adjustment linked to an actual refund when the actual record later replaces it in the same scenario.

Current Savings may stay as a separate “cycle-start, unchanged-price” quick calculation if these assumptions remain prominent. It cannot be presented as covering real transitions merely by adding warning text. A stored comparison should preserve inputs, period, price-source/checkedAt and unresolved conditions; “expected saving”, “customer changed plan”, and “cash-confirmed change” remain distinct.

## 7. Precise regression cases

Expected values below are synthetic test fixtures, not real provider prices. API tests must exercise save→reload→recompute as well as pure functions.

| ID | Fixture/action | Required result |
|---|---|---|
| M1 | One Oct 1 planned KRW 120,000; actual Oct 1 KRW 118,000 explicitly completes it | Actual 118,000; original planned 120,000; outstanding 0; outlook 118,000; variance −2,000. |
| M2 | Same planned Oct 1 event; actual Sep 30 linked; view October | Actual 0; outstanding 0; outlook 0. Filtering actual before building the link set fails this case. |
| M3 | Sep charge 20,000 linked; refund Oct 2 5,000; inspect September and October | September actual 20,000; October actual −5,000; refund never reopens September's plan. |
| M4 | Two equal charges on same day, only one explicitly linked | Both actual entries retained; no automatic merge; one plan completion; second entry visibly unlinked. |
| M5 | Concurrent submissions complete one event twice | Exactly one accepted completion, the other conflicts; no duplicate fulfillment state. |
| M6 | Two tools in same bundle; charge linked through the second member | One planned bill, one actual, one completion independent of input/sort order and tool rename. |
| M7 | Edit amount, plan name, bundle display name, report start | Existing occurrence keys and links unchanged. Different standalone contracts with the same name remain distinct. |
| M8 | Correct linked event due date; then genuinely change cadence | Date correction preserves its key. Cadence change preserves prior records and rejects or explicitly resolves a conflicting linked event; never silently duplicates it. |
| M9 | Cancelled contract has two original remaining dates Sep 15/Oct 15; confirm Sep payment | October still has exactly one obligation; matching must not decrement twice or invent November. |
| M10 | Linked charge's personal amount unknown | Event stays fulfilled; personal actual/outlook flagged incomplete, not filled from expected share. |
| D1 | Jan 31, 2026 anchor; every 2 months; through Jul 31 | Jan 31, Mar 31, May 31, Jul 31; stable index/key across report windows. |
| D2 | Jan 31 monthly through Mar; leap/nonleap fixtures | 2026 Jan 31/Feb 28/Mar 31; 2028 Jan 31/Feb 29/Mar 31. Confirming February must not move March to 28/29. |
| D3 | Custom Sep 15–Oct 14 range; bills Sep 14/15 and Oct 14/15 | Include Sep 15 and Oct 14 only; actual/refund/forecast/chart use identical boundaries. |
| D4 | Manual Sep 18 KRW 8,000 and Nov 7 amount unknown | Sept includes 8,000; November shows a dated unknown event; no invented monthly equivalent. |
| D5 | Inverted date range, invalid date, zero/fractional/too-large cycle, overflowing total | Visible validation failure; no stale result/no silent truncation/no unsafe floating-point integer. |
| H1 | Price 10,000 through Sep 30; 20,000 Oct 1 onward; 15,000 Nov 1 onward | Sep/Oct/Nov events 10,000/20,000/15,000. Earlier actual payment unchanged after both edits/reload. |
| H2 | Tax/seat/currency/share changes effective Oct 1 | September uses September's full snapshot; October uses new terms. No cross-currency reinterpretation. |
| H3 | New price amount unknown or effective date unknown | Preserve draft/history; affected forecast shows unknown/pending instead of applying old price forever or replacing past prices. |
| H4 | Price change Oct 10 between Oct 1 and Nov 1 due dates | Oct 1 uses old price; Nov 1 new price; no invented Oct 10 proration/charge. |
| H5 | Cancellation update through cancellation form; same bundled contract | One effective history/state change for all members; previous conditions retained; changing notes alone adds no financial version. |
| R1 | Paused with billing policy unknown and next Oct 1 known | Not “no remaining charges”; conditional bill/unknown counter. Known committed installments still count. |
| R2 | Confirmed billing pause Oct–Nov with known resume policy Dec 1 | Suppress only confirmed pause dates; Dec resumes according to confirmed anchor. Unknown resume policy produces uncertainty. |
| R3 | Ended access Sep 10, two committed bills Sep 15/Oct 15 at 12,000 | Planned 24,000 even though access ended. Residual null and zero remain different. |
| R4 | Unknown renewal versus requested cancellation | Unknown is conditional; requested remains renewing until actual confirmation. Library “stopped” changes neither. |
| P1 | Contract bill 120,000 annual, personal share 30,000 | Contract monthly 10,000 vs personal monthly 2,500; forecast respective 120,000/30,000; never total 150,000. |
| P2 | Personal shares zero, null, and changed from 10,000 to 8,000 effective Oct 1 | Zero counted as confirmed zero; null contributes an incomplete count; dated forecasts use 10,000/8,000. |
| P3 | Actual gross 20,000 with personal 6,000; later refund gross 5,000 personal unknown | Gross net 15,000; personal known subtotal 6,000 but incomplete; never infer personal refund 1,500. |
| S1 | Current monthly 20,000 Jan–Dec vs annual 192,000 Jan 1 | 240,000 vs 192,000; expected difference 48,000. Eight-month horizon gives 160,000 vs 192,000. |
| S2 | Sep 1–Nov 30; retain old 20,000 bills Sep 1/Oct 1; new 15,000 bills Sep 15/Oct 15/Nov 15; fee 5,000 Sep 15; confirmed expected refund 10,000 Oct 2 | Alternative 40,000 + 45,000 + 5,000 − 10,000 = 80,000. Current three bills = 60,000; saving −20,000. Do not add overlap twice. |
| S3 | Same S2 but refund/fee unknown | Show known charge component 85,000 and unresolved adjustments; no definitive feasible saving. Unknown is not “none”. |
| S4 | Annual prepaid amount before comparison starts, no evidenced refund | Do not subtract old prepayment from alternative cost or add it again as overlap cash. |
| S5 | Annual 192,000 plus same-day transition fee 10,000, cash ceiling 200,000 | 202,000 upfront fails ceiling even though annual sticker price alone passes. |
| S6 | One candidate cheaper but mandatory feature/eligibility unknown; expired source | Remains confirmation-needed, not feasible winner. No fake percentage fit or realized savings. |
| U1 | Change reporting range/scope, then record/edit/refund/delete and full reload | Labels, cards, monthly buckets and rows agree; values persist correctly; failure retains inputs and does not display saved success. |
| U2 | Another account supplies someone else's billingId/event ID/payment ID/history | Reject access/mutation; no ability to infer another account's amount/existence from returned data. |

## 8. Implementation order and completion evidence

1. Normalize schema and create shared pure functions for billing identity, dated terms, occurrence generation and reporting. Preserve old data before adding UI.
2. Add atomic server matching/invariants and history append logic, including bundle/cancellation paths. Verify M1–M10/H1–H5/U2 before connecting buttons.
3. Add period/scope controls, planned-event selection, history display, custom/manual cycle inputs and uncertainty controls. Test saved state and failure/retry hydration.
4. Extend Savings using the same dated schedule functions and explicit adjustment certainty; verify the numerical fixtures.
5. Perform actual browser examples of custom range→linked payment→reload, personal scope, condition change→old history, unknown pause, and transition comparison. A pure-function test alone does not prove the visible fields are connected.

This design closes the requested retained billing scope only when the implemented, persisted UI and calculations exhibit these behaviors. It does not change the fixed nine-area score weights or by itself earn any scoring points.
