# V8 API design review: shared billing_terms CAS

Checked2026-09-12. Read-only review of current workspace/export/cancellation paths, validation/schema, billing identities and test adapter. Root is implementing concurrently; cited lines describe the inspected pre-V8 route. No checkout/Git/Sites/browser edits or sub-agents. One isolated in-memory SQLite experiment tested the proposed guard shape; it was not a production/D1 concurrency test.

## Answer: feasible for one stable billing identity, with strict conditions

Using `private_records(kind='billing_terms', target=billingIdentity)` as a shared revision authority can protect a bundle atomically. For an existing authorityH at revisionR:

1. Every affected business INSERT/UPDATE/DELETE must be conditional on the same owner-scoped H revisionR.
2. No statement may modify/remove H or its revision before those business writes.
3. The last statement updates H's snapshot/history and revision toR+1, conditionally on revisionR.
4. Return success only if the final revision write changed exactly1row. A stale request should have changed0 business rows and0 history rows, then return409.

[D1 batch documentation](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) states that statements execute sequentially and the batch is a SQL transaction rolled back on a statement error. **An UPDATE affecting0rows is not an SQL error.** An HTTP409 thrown after `batch()` resolves cannot roll back writes already committed. Therefore guarding only the final history UPDATE is unsafe.

This is a concurrency strategy, not automatic enforcement of every business invariant. It is correct only when all relevant mutations participate and the set of affected rows is stable under that revision. Partial zero-row business operations, membership changes outside the revision protocol, or predicates invalidated by an earlier statement can break the reasoning.

## Suggested SQL shape

For one stable authority, bind all inputs, including server-authenticated userId. Illustrative names only:

```sql
-- G: same predicate on each business mutation.
EXISTS (
  SELECT 1 FROM private_records h
  WHERE h.id = :historyId
    AND h.user_id = :userId
    AND h.kind = 'billing_terms'
    AND h.target = :billingIdentity
    AND json_extract(h.payload, '$.revision') = :expectedRevision
)

UPDATE private_records
SET payload = :newPayload, updated_at = :stamp
WHERE id = :recordId AND user_id = :userId AND kind = 'subscription'
  AND G;

-- New business record: VALUES cannot have a WHERE; use SELECT.
INSERT INTO private_records(id,user_id,kind,target,payload,created_at,updated_at)
SELECT :id,:userId,:kind,:target,:payload,:stamp,:stamp
WHERE G;

-- Last statement only. newHistory has server-built revisionR+1 and history.
UPDATE private_records
SET payload = :newHistory, updated_at = :stamp
WHERE id = :historyId AND user_id = :userId
  AND kind = 'billing_terms' AND target = :billingIdentity
  AND json_extract(payload, '$.revision') = :expectedRevision;
```

`G` is a repeated bound SQL fragment, not literal supported SQL syntax. Prefer a helper that emits this fragment and its matching parameters consistently. Keep unique-constraint failures as transaction errors; do not blanket-ignore business INSERT conflicts. Classify expected planned-payment duplicate conflicts separately from other integrity failures.

Validated JSON revision must be a nonnegative safe integer; reject corrupt authority data instead of treating malformed/missing stored revision as0. Validate `expectedRevision` explicitly at the request envelope. Current [recordInput:16](/Users/bigmac_moon/dev/ai_score/site/lib/validation.ts:16) does not contain it, so Zod would currently strip a supplied field. Missing revision on an existing billing edit must not silently mean “use the server's current revision”; that defeats stale-client detection. Non-billing kinds can retain their current input requirements.

The final `meta.changes` is the success marker, but checking per-business statement changes is useful to catch violated assumptions. Such a check after commit detects an implementation defect; it does not retroactively restore atomicity. Ensure ownership/existence/member-set preconditions are tied to the revision protocol, or perform a genuine transactional assertion that fails before writes. Do not add a business-row existence clause blindly toG if the batch itself inserts/deletes that row: later predicates could become true/false halfway through the batch.

## Minimal SQL proof observed

An isolated in-memory SQLite transaction with authorityH and two bundle members produced:

| Batch | BusinessA changes | BusinessB changes | Final history changes | Final member amounts |
| --- | ---: | ---: | ---: | --- |
| Valid expected0, all writes guarded |1|1|1|20/20, revision1|
| Stale expected0, all writes guarded |0|0|0|20/20, revision1|
| Stale expected0, only history guarded |1|1|0|99/99, revision1|

The last row demonstrates why throwing409 after the final0 cannot protect earlier unguarded writes. This proves the SQL mechanism in a simplified SQLite transaction, not cross-isolate D1 deployment behavior or every route invariant.

## New records and legacy histories

- Resolve the actual target/upsert recordId **before** deriving identity/history. Current [workspace:86–93](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:86) resolves target-based existing records late; earlier subscription validation checks only `data.id`. Do not misclassify a target-upsert as a new contract and create a different `contract:undefined`/fresh identity.
- Allocate a new standalone subscription UUID before computing [billingIdentity](/Users/bigmac_moon/dev/ai_score/site/lib/billing.ts:90). Its authority is `contract:<that UUID>`. A new row joining an existing bundle must use that bundle's existing revision, not0 just because the member is new.
- For a genuinely absent authority with expected0, bootstrap a server-built revision0 row **inside the same batch**, then guarded business writes, then final revision1. Use owner/kind/target's existing unique constraint to prevent duplicate authorities. A targeted `ON CONFLICT(user_id,kind,target) DO NOTHING` is preferable to ignoring all business constraints. If a competing batch has already created/advanced H, this request's guards must fail and return409.
- For existing records with expectedRevision>0, never recreate an absent authority as0. That can resurrect state after deletion or turn a stale edit into a new history. For legacy records lacking H, allow the explicit initial0 transition only if the owned parent/member still exists and represents the baseline being initialized.
- A seed outside the batch can leave orphan authority/history rows on validation or later write failure. Keep it after validation and in the same transaction. If a failed0-row path can still insert a seed, it is not a true no-write conflict; tighten initialization preconditions.
- Distinguish concurrency revision from term-history entry count. A member addition or metadata write can require revision advancement without claiming that price/terms changed. Baseline history for legacy data should state when it was recorded and that earlier effective dates may be unknown; do not invent a historical effective date from the new save time.
- Keep history identity/incarnation stable. Retaining an authority after individual member deletion avoids resetting its revision when a bundle label is reused. If authorities are deleted/recreated, an opaque ETag including authority UUID+revision prevents an old revision number from accidentally matching a new incarnation. Numeric expectedRevision alone cannot detect that ABA case.

## Bundle compatibility and critical races

Current [subscription update:94](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:94) reads peers, edits shared fields in JavaScript, and writes each **entire old payload** back. Shared history must serialize not only the initiating row, but every peer update and any operation that changes membership or overwritten payload content.

- Two tabs editing different members of the same bundle need the same authority/expected revision. Only one batch may succeed; the losing batch must not update either member or append history.
- New joins/deletes must advance the shared revision, even when shared price is unchanged. Otherwise a peer set read before the batch can omit a newly joined member and leave it with old shared terms.
- A metadata-only edit can be lost if it bypasses the shared revision while another batch writes a full stale peer payload. Either include those edits in the shared revision or update only the intended shared JSON keys against the row's current payload. Do not claim that a “terms-only CAS” protects every whole-payload overwrite.
- Store one canonical shared-terms snapshot/event per aggregate operation, not one duplicate event per member. Preserve member-specific names/tool IDs/notes. Include source record/operation kind for provenance where useful, with server-owned timestamps/revision.
- Current new-member compatibility checks permit unknown amount on one side. Be explicit about the resulting canonical shared snapshot when some amounts are unknown; never fill unknown values with an arbitrary member's amount without a stated rule.

**Identity changes are the major limit.** Current API allows some `bundleId` changes when no planned payment blocks them. Moving from bundleA toB or standalone to/from bundle changes the revision authority. A single condition on the new identity does not protect old-group membership/history. Such moves require an explicit two-aggregate operation with both expected revisions and atomic success/rollback, or an explicit current-scope rule preventing in-place identity migration once history is established and directing the user to record a new contract. Do not silently introduce the latter restriction if retained requirements need transfers.

Naively usingG=(oldH=R AND newH=S), then updating oldH toR+1, then final-updating newH with the originalG will make the second history write0 after business writes have run. Two-holder CAS needs carefully staged operation-token/transactional-assertion semantics. Do not generalize the simple “one last history UPDATE” proof to multiple authorities.

Current restrictions preventing changes to paid occurrence identity/anchor/currency must remain unless a separately designed migration preserves those links: [workspace:39–41](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:39), [tests:109–115](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:109). Stored `plannedKey`/`plannedAmount` on unchanged matched payments must remain historical snapshots rather than being recalculated from new terms.

## Cancellation-derived changes

The public [cancellation page](/Users/bigmac_moon/dev/ai_score/site/app/cancellation/page.tsx) and [CancellationHelp](/Users/bigmac_moon/dev/ai_score/site/components/CancellationHelp.tsx) only explain external cancellation. Actual private mutations happen through workspace POST. The UI must continue to distinguish recording a request/confirmation from canceling at the provider.

Current [workspace:95–99](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:95) changes all bundle siblings' `status`, `endDate`, and optionally `remainingPayments` when stage is not `prepare`.

- Derive the authority from the **owned parent subscription**, not a client-supplied billingIdentity/history target. Guard the initial cancellation INSERT/UPDATE at92–93 as well as each derived subscription write and final history update. Guarding only the subscription writes can leave a saved cancellation whose effects/history never happened.
- Include effective status/end/remaining changes in the shared terms event. Preserve explicit empty endDate correction and distinguish omitted remainingPayments (keep existing) from null (unknown) and0 (none).
- A cancellation note-only edit should not automatically replay an old stage over a later independently changed contract state. Decide which changed fields trigger derivation and apply the revision guard to that operation; the current route replays every non-prepare save.
- `confirmed/requested → prepare`, changing an existing cancellation's `subscriptionId`, and deleting a cancellation currently do not undo effects on the former parent. Do not silently claim history makes these reversals correct. Keep parent identity immutable for an existing cancellation or explicitly model both sides; make prepare/delete semantics clear. A provider-confirmed cancellation should not be automatically reversed merely because its note record was deleted.
- Two cancellation records for the same bundle also share one revision. A stale save of either must return409 without orphan note/history/member changes.

## Payment, refund and deletion boundaries

CAS protects only participating writers. Current payment processing reads parent terms to assign `plannedKey/plannedAmount` before the final batch. A concurrent terms update can make that snapshot stale. Either include payment linkage in the shared revision protocol or atomically guard the parent revision used for calculation. Persist the captured revision/effective snapshot if the ledger needs to explain the calculation later.

The planned-occurrence unique index already prevents duplicate linked charges; retain it. Refund caps and parent/reference checks are read-before-write validations. If concurrent refunds/parent deletion must be serialized, all corresponding writes need to advance the aggregate revision or repeat sufficient invariant checks inside the transaction. Merely adding history CAS to subscription edits does not fix these existing races.

[Workspace delete:11–27](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:11) currently returns before the main batch. Route subscription/member deletion through the same revision strategy if it can change history membership. Existing prechecks for linked payment/cancellation rows must remain; their race with a concurrent insertion is only closed when participating insertions and deletion are serialized/atomically checked. Do not delete an authority prematurely while other bundle members still use it.

## Export, GET and account deletion

- Schema already uses an unrestricted text `kind` and a unique `(user_id,kind,target)` index. A new internal billing_terms kind can fit without changing table shape. Its target must be non-null, server-derived and owner-scoped.
- Keep billing_terms **out of client-writable recordSchemas/recordInput.kind**. Current Zod allowlist blocks direct arbitrary-kind save/delete. Expose it read-only in returned data or as a separate history map; clients must not author history entries/revisions.
- [Workspace GET:8](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:8) currently includes all kinds under a shared LIMIT2000 ordered by updated_at. Internal history rows consume that limit and can push ordinary records out of the response. Ensure UI histories and their corresponding subscriptions are not independently truncated; a separate history query/map or explicit pagination avoids an apparently missing ledger. Current tab filters generally select known kinds, but form/type definitions and totals should not treat history as a user-created editable record.
- [Export:3](/Users/bigmac_moon/dev/ai_score/site/app/api/export/route.ts:3) already exports all private_records for the authenticated user without the2000 limit and JSON-parses payloads. Internal histories will be included automatically. Preserve no-store and owner scoping; document the kind so export consumers know it is history. Corrupt history JSON could currently fail the whole export, so server validation matters.
- [Account DELETE:104–111](/Users/bigmac_moon/dev/ai_score/site/app/api/workspace/route.ts:104) already deletes **all** owner private_records in its batch; billing_terms is covered automatically. No separate table cleanup is needed for this design.
- A racing existing edit should not recreate a deleted history. Expected>0 requires the existing authority; late new/expected0 creates can still occur after account data deletion because current deletion does not revoke already-authenticated requests. An absolute “nothing can reappear after erasure under concurrent writes” guarantee requires an account-generation/deletion barrier beyond a per-contract history row. This is an existing concurrency boundary to disclose, not an assertion that ordinary deletion is broken.

## Test adapter: useful SQL check, not faithful concurrent D1 scheduling

[tests/api.test.mjs:14–15](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:14) uses one synchronous in-memory SQLite connection, BEGIN/COMMIT/ROLLBACK around batch, but `await s.run()` yields after each statement. Two concurrently invoked batch functions can therefore attempt nested BEGIN, or other helper calls can run on the same connection inside the first transaction. This is a harness artifact, not a valid simulation of separate D1 atomic batches.

For these SQL tests, make each transaction's SQLite execution synchronous/non-yielding internally and resolve the batch promise after COMMIT, or serialize access to the adapter's transaction while allowing request validation reads before it. Do not weaken production CAS to make a nested-BEGIN artifact pass. An explicit test hook that pauses both requests **before** batch can put both on the same stale revision, then execute their batches serially to reproduce the relevant race deterministically.

Other relevant adapter limits: `batch` invokes `.run()` for everything and does not return SELECT/RETURNING result rows; `.all()` omits normal D1 metadata. The proposed UPDATE/INSERT+`meta.changes` design fits the current adapter; SELECT-in-batch assertions or RETURNING-based code need matching adapter behavior. Existing save helper at20 does not pass expectedRevision. Update ordinary convenience calls without letting stale/conflict tests silently fetch a fresh revision; explicit concurrency tests must retain a fixed captured revision.

## Necessary bounded verification cases for root

1. Existing standalone valid save advances once; stale same revision returns409 with byte-identical business/history state.
2. Two members of one bundle submit the same revision: one success, one409; all shared fields and one shared event agree. Include a member join and a metadata-only race if full payloads are replaced.
3. New standalone and new bundle create exactly one correct authority; join existing bundle uses its current revision. Legacy no-history first edit preserves an honest baseline; duplicate bootstrap cannot create orphan histories.
4. Inject a statement failure after an earlier business write: all business/history changes roll back. Separately test the stale0-row path, which must not rely on rollback by HTTP error.
5. Stale cancellation create/update leaves no note or derived status/history write. Valid confirmed→requested endDate clearing and remainingPayments0/null/omitted stay correct. Note-only/prepare/delete/retarget semantics are explicit.
6. Existing paid occurrence and plannedAmount preservation tests continue passing; duplicate planned charge index remains effective. Exercise parent term/link/delete races under the selected protocol rather than claiming all are fixed by subscription CAS.
7. Direct client billing_terms mutation is rejected; two accounts cannot read/edit each other's authority even with matching bundle text. Export includes the owner's history; account DELETE removes it and later stale existing edits do not recreate it.
8. If identity migration is supported, test both-authority conflict/no-partial-write cases explicitly. If it is deferred, reject it transparently without silently modifying one side.

These cases test actual failure modes rather than mirroring implementation details. No new test or source file was added by this audit.
