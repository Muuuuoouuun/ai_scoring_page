# AIs independent regression review of current fixes — 2026-09-12

Read-only, bounded review of billing, validation, RecordForm, MyWorkspace, notifications and global search. No checkout edits, Sites/Git/browser actions or agents. Existing suite freshly ran: `node --test tests/api.test.mjs tests/billing.test.mjs` — **35 passed, 0 failed**. New reproductions used in-memory SQLite; no external calls were made. Scope here is introduced correctness, not the retained-scope inventory.

## Findings and final recheck

Root fixed the refunded-charge conversion and legacy-bundle normalization during this review. A fresh rerun of `/private/tmp/ais-fix-repro.mjs` confirmed the conversion now returns **400** with original/child intact and net **₩18,000**, and the equivalent legacy-bundle addition now returns **200**. Those two findings are resolved. No additional critical regression was identified in this bounded review. The two remaining P2 items concern cancellation-field initialization and uncertainty wording.

### Resolved — [P1] Reject converting a refunded charge into a refund

**Location:** `/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:45` (branches at 46–53); the visible type selector is `/Users/bigmac_moon/dev/ai_score/site/components/RecordForm.tsx:9`.

The dependent-refund guard only runs when the submitted item remains a `charge`. Editing an existing charge into a `refund` enters the other branch and bypasses the guard, leaving its child refunds linked to an item that is itself now a refund.

**Reproduced:** create charges A/B at ₩10,000 each; create a ₩2,000 refund referencing A; edit A to be a ₩10,000 refund of B. The API returns **200**, the child still references A while A is a refund, and `actualTotals` returns **−₩2,000**. This violates the API's own invariant that refunds must reference a charge and can no longer be represented coherently by the editor.

**Smallest fix:** before either payment branch, check whether the existing payment is referenced by refunds. If it is, reject changing its entry type to refund (as well as the already protected currency/contract/date and too-small-amount changes). Do not silently rewrite dependent records. Add the above edit sequence as a regression; expected status 400/409 and A/child records unchanged.

### [P2] Populate known residual charges when selecting a cancellation's contract

**Location:** `/Users/bigmac_moon/dev/ai_score/site/components/RecordForm.tsx:9`, contract selector and `remainingPayments` conversion; `/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:69`.

New cancellation defaults omit `remainingPayments`; selecting an existing contract copies its payment route only. Submit converts the untouched field to `null`, and the server copies that null onto the subscription. Therefore an existing confirmed residual count is lost when a customer records cancellation status without re-entering the known count.

**Reproduced:** subscription has `remainingPayments:2`; the normal new-form payload for confirmed cancellation contains `remainingPayments:null`; save returns **200**, and the subscription count becomes **null**. Its two planned bills disappear into an uncertainty warning.

**Smallest fix:** populate the selected contract's current residual count into the form (and appropriate known access-end context), allowing the user to intentionally clear it to unknown. Alternatively track untouched versus explicitly cleared state and omit untouched values from the update. Test that untouched new cancellation preserves `2`, explicit clearing produces `null`, and explicit zero remains `0`.

### Resolved — [P2] Normalize legacy bundle fields before comparing them with new defaults

**Location:** `/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:39–42`; new defaults in `/Users/bigmac_moon/dev/ai_score/site/lib/validation.ts:8`.

Pre-upgrade subscription JSON has no `amountBasis`, `taxStatus` or `pricingMode`. Newly saved equivalent records get defaults `total`, `unknown`, `fixed`. Bundle compatibility compares old missing values as `''` against these new defaults, rejecting an otherwise identical bundle addition. Existing installations need no unusual or malformed input to hit this.

**Reproduced:** insert a legacy-format subscription with only the former fields and bundle ID; add a second tool with the same amount/currency/cycle/date/status/bundle. API returns **400**, “same bundle payment conditions differ.”

**Smallest fix:** normalize existing peer/previous subscription data with the same backward-compatible defaults before comparison and synchronization, or migrate them once with equivalent values. Test one legacy bundle peer plus one new-format peer, and preserve rejection of an actual tax/seat/renewal-price conflict.

### [P2] Distinguish uncomputable totals from an unentered price

**Location:** `/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:47–50,69–73`; `/Users/bigmac_moon/dev/ai_score/site/components/MyWorkspace.tsx:17` (`totals.unknown` and null scheduled amounts).

The newly broadened `contractAmount` returns null for pure usage pricing, unknown amount basis, missing seat count and unknown renewed price—even when a base amount was entered. MyWorkspace labels every such count/event **“금액 미입력”**. A customer entering ₩10,000 per seat with the seat count unknown is incorrectly told their amount was not entered; a usage-priced contract is similarly conflated with a missing fixed price.

**Smallest fix:** either return structured reasons (`amount`, `seats`, `basis`, `usage`, `renewal`) or use an accurate generic label such as “총액 산정에 필요한 조건 미확인” and keep the existing reason warnings. The supplied price should remain visible with its per-seat/basis label. This is primarily recovery/interpretation correctness; do not treat it as another missing-scope request.

## Checks with no new blocker found

- The suite covers anonymous global search for existing guides/news/events and community, exclusion of hidden posts/private records, literal `%` handling, and type filtering. Read-only inspection found no additional critical search authorization/link defect. Browser submission/filter/history behavior remains root's QA responsibility.
- New price-transition, missing-date, residual-obligation, per-seat/tax, usage-budget and refund-date arithmetic tests pass.
- `personalShare` and `usageBudget` are explicitly shown separately; neither is erroneously summed into contract costs. `feeAmount` is labelled as included-fee metadata and is correctly not added again to the supplied settlement total. These are deliberate distinctions, not disconnected arithmetic bugs.
- Email delivery now re-reads current interests, eligible source version and consent before each send; the interest-removal/unknown-eligibility test passes. No real delivery/provider receipt was tested or claimed.

Reproductions are available at `/private/tmp/ais-fix-repro.mjs`. The three API reproductions printed the statuses and persisted outcomes above. Tests prove those API/data results; cancellation form payload derivation is from code inspection, not a browser action.
