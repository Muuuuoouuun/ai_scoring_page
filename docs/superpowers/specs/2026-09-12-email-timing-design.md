# V14 Email timing and delivery correctness

Continuation of the user-approved cancellation/promotion alert design (2026-09-11, lines86–98), product planv0.6 and full active goal. Previous V13 was progress: Home dependency correction deployed and measured. Current authoritative Site source is ac64bc580e198ca8e7a3f7342752a5e28a6b097e, clean at start. No new Site source mutation when this spec was written. Root owns Site; agents only review and write /private/tmp.

## Scope and authority

Implement the offered daily digest/condition mode, named time zone, receiving time and actual server dispatch decision. Complete this as a connected workflow, not just preference fields: pending candidate selection, batches, quota, no empty email, validity recheck, retries, cancellation, private receipt/export/deletion and clear UI. The user's approval of all recommended goal work persists; do not ask again for routine design/implementation decisions.

Retain separate unfinished requirements: supported unattended scheduler registration/execution, verified sender/provider setup and consented real receipt. Current Sites capability review found no supported native scheduler binding; production RESEND_API_KEY/EMAIL_FROM were absent at last verified configuration. Do not invent scheduled execution or send real email without its required recipient/sender configuration. The current authenticated refresh entry will call the same actual decision pipeline. UI must say that this is the first processing opportunity after the chosen time and that unattended operation is not connected.

## Alternatives and choice

1. Preference-only additions would expose controls without honoring them and are rejected.
2. Extending each notice's mutable retry row cannot represent one immutable digest or preserve a provider key after eligibility/content changes; rejected as the delivery model.
3. Choose immutable delivery batches plus a per-user persisted dispatch state/claim. Keep email_outbox as per-notice dedup/queue history, connect its entries to a delivery record, and keep existing app notifications independent. This costs a small schema migration but directly covers concurrency, grouping, quotas and receipts.

## User-visible contract

- Email stays off by default and cannot be enabled without configured transport. Timing preferences can be saved while off; defaults are daily digest, Asia/Seoul,09:00 and are visible before enabling.
- Legacy email=true without an explicit confirmation of all three timing fields stays on hold. The confirmation flag and settings revision are server-owned. First activation or an unconsumed timing change after today's due may catch up at the next authenticated refresh on that same date; saving preferences itself never sends.
- Daily digest: evaluate one local-date slot at/after the selected HH:mm when processing runs; send one batch of new valid candidates. No candidates means no email and the slot is recorded as evaluated. New candidates wait for the next local-date opportunity.
- Condition mode: at/after selected HH:mm until local midnight, the next processing run may send new matching candidates in a batch. Limit to3 delivery batches in a rolling24-hour window, including accepted or uncertain attempted batches. This makes the original adjustable 'daily max3' operating proposal explicit and prevents a time-zone change from resetting the cap. Retrying the same immutable batch is not a new quota slot.
- Excess or newly arriving candidates stay in the app/queue and are rechecked for the next eligible batch. Already sent notice versions are never added to another digest. Empty processing never generates an email.
- DST missing HH:mm uses the first valid minute later on the same local date; a fully missing date is skipped. Repeated HH:mm uses the earlier instant once. A completed digest slot stores its next permitted instant under the then-current zone/time. Moving zone/time/mode does not move that consumed slot's guard earlier. A clock change can postpone, not duplicate, its replacement.
- These are selection/dispatch rules, not a promise that an external scheduler or email inbox will run at that minute. Provider acceptance and actual inbox delivery remain different states.

## Persistence and delivery

Keep notice identity and privacy boundaries. Add email_deliveries for immutable ordered notice snapshots and provider request payload, user, schedule snapshot, quota slot, state, created/first-attempt/last-attempt/acceptance times, attempts, provider ID and bounded error. Add a delivery reference and provider receipt ID to email_outbox. Add per-user email_dispatch_state with a conditional lock/lease and next digest guard; all tables are private to the account and erased with it. Export useful owned schedule/receipt history, excluding claim tokens and API credentials.

A batch fixes recipient/from/body/subject and its item keys before its first external attempt. Use a stable provider idempotency key derived from that batch ID. Re-read consent, current notice versions, validity and qualification immediately before every attempt. Never shrink or rewrite the payload under an already-used key. If a never-attempted batch becomes stale, cancel/replan the still-valid items. If it was attempted and the result could be uncertain, hold it for review; do not create a second delivery for its surviving items.

Atomic per-user claim prevents parallel dispatch and protects quota reservation. Claim/attempt writes are conditional on current claim token and settings revision; failed-attempt writes are conditional on the same attempt claim. A late failure must not overwrite acceptance. A verified successful response is monotonic evidence about the existing exact user/batch/payload and is retained even if its lease was replaced. If acceptance storage fails but a provider ID is known, retain the ID in needs_review using that same immutable identity. Neither path creates rows after account deletion. Attempt limit3 and the provider-safe retry window start at first actual attempt, not candidate creation. Expired ambiguous attempts become needs_review. Existing sent rows remain sent; legacy attempted unsent rows without an immutable payload become needs_review instead of being retried with guessed old content.

Settings changes use a server-owned delivery revision. Consent-off and cancellation of queued/failed unsent work are one D1 transaction, so a cancellation write failure rolls back the preference change. Hide/current-condition changes invalidate prepared batches. Active network calls may already have left the service; keep actual receipts and explain that already-transmitting mail cannot be recalled. Changing profile metadata must not create a new delivery or reset quota. Stale planning based on an older settings revision cannot create/send a new batch after a newer save.

The current source key uses dates for some content. Meaningful-change versioning and corrections remain part of the broader operating workflow; this change must not relabel ordinary recheck dates as meaningful changes or claim that remaining editorial/version requirements are complete.

## Verification and release

Before implementation preserve current REDs from actual API/D1 SQLite harness: opt-out immediate/atomic cancellation, missing provider receipt, parallel duplicate, attempt ceiling and late failure overwrite. Timing vectors are frozen independently, including Seoul midnight, New York DST gap/fold, Lord Howe half-hour shift, skipped date, time-zone/mode changes and rolling cap.

Test actual routes/source and migrations with controlled clock and provider responses; never call real provider in tests. Cover group contents, empty slot, next day, cap overflow, eligibility/expiry/consent changes, identical retry payload/key, lease expiry, source revision race, account isolation and export/delete. Add real browser settings save/reopen and current on-refresh decision UI. Keep local QA separate from real email/unattended proof. Run existing139+4 checks, new meaningful tests, types/build and independent review, then root privately publishes exact source to the same owner-only Site. No gate/weight manipulation: 1.2.4/8.4.3/8.4.4/9.4.4 remain GAP until their full runtime requirements are proved.
