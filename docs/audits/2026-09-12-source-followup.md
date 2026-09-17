# Source-sync follow-up

Verified 2026-09-12 against the existing `lib/source-sync.ts`, its in-memory SQLite test harness, source status UI, and the live official RSS feed. No site edits, Git actions, deployments, browser UI, or subagent actions were performed.

## Confirmed review-state loss

The current implementation loses pending editorial review across a fetch error and recovery. I executed the actual TypeScript module through the repository's existing VM/D1 harness with an in-memory SQLite database and controlled HTTP responses. It produced:

| Response / step | Stored status | `payload.needsReview` |
| --- | --- | --- |
| First page HTTP 200 | `current` | `false` |
| Changed page HTTP 200 | `review_needed` | `true` |
| HTTP 503 | `error` | `true` |
| HTTP 304 recovery | `current` | `true` |
| Next unchanged HTTP 200 | `current` | `false` |

An alternative recovery sequence directly from HTTP 503 to unchanged HTTP 200 also produced `current` / `false`.

The catch branch correctly preserves the old payload, hash, and ETag, but overwrites `status` with `error`. The 304 SQL tests only whether current status equals `review_needed`, so an error recovery becomes `current`. The 200 branch also considers only `isChanged` and `old.status`, then overwrites the retained payload with `needsReview:false`. `SourceStatus.tsx` bases its badge on `status`, so the review badge disappears immediately on the 304 recovery even while the payload initially retains the marker.

The existing test at `tests/api.test.mjs:37` covers review → unchanged 200 → 304, but no intervening error, so it misses both failing sequences.

### Smallest durable correction

Decode the prior payload defensively, once, and derive:

```ts
const reviewPending = old?.status === 'review_needed'
  || previousPayload?.needsReview === true;
```

Use that same value in both recovery paths:

```ts
// 304: keep old payload/hash/ETag; restore status from persisted review state.
const recoveredStatus = reviewPending ? 'review_needed' : 'current';

// 200: page changes create review work; prior unresolved review stays pending.
const needsReview = type === 'content'
  && (reviewPending || (!t.feedUrl && isChanged));
```

The second expression also prevents changing a tool from page monitoring to a feed from silently acknowledging an outstanding editorial review. Clear the review marker only through an explicit editorial acknowledgement, not a successful fetch. Keep failures as `status:error` while retaining the marker; optionally expose the pending marker separately if both failure and review must be visible simultaneously.

Add regressions for changed 200 → error → 304 and changed 200 → error → unchanged 200, asserting both status and marker. Also check repeated errors and the existing direct-304 case. An unchanged 200 after the 304 recovery should still remain pending. If a 304 arrives without a previous successful snapshot/hash, treat it as an invalid cache response or retry without a conditional header rather than reporting a new source as current.

When changing source URLs, load `old.url` and send the previous ETag only when it belongs to the same configured source URL. This matters when the ChatGPT entry moves from Help Center HTML to RSS. A source URL migration should establish its own transport baseline without automatically acknowledging unrelated editorial review.

## Live official RSS: exact schema

Source: [ChatGPT and Codex changelog RSS](https://learn.chatgpt.com/docs/changelog/rss.xml), advertised by the official [changelog page](https://learn.chatgpt.com/docs/changelog).

Normal request with `User-Agent: AIs source checker/1.0` returned HTTP 200, `Content-Type: application/xml`, 1,236,881 bytes, 128 items, ETag `"bea9b89c1942ef2068c9731658c3b5f0"`. An immediate request with that `If-None-Match` returned HTTP 304, zero response-body bytes, and no ETag response header. The cached ETag therefore needs to survive a 304, as the current code already does.

The three representative entries inspected in detail have these child fields, in this order:

```text
title
link
guid
description
pubDate
{http://purl.org/rss/1.0/modules/content/}encoded
```

There are no item-level `category` elements. Every observed `guid` equals its corresponding `link`, and the sampled GUID elements have no attributes. Every observed link has host `developers.openai.com` and pathname `/codex/changelog/`.

Three representative entries (not the whole feed):

| Field | Desktop entry | Mobile entry | CLI entry to exclude |
| --- | --- | --- | --- |
| `title` | `Quick chats with Pets and Appshots on Windows` | `ChatGPT for iOS` | `Codex CLI Release: Python SDK 0.154.0` |
| `link` and `guid` fragment | `#codex-2026-09-11-app` | `#codex-2026-09-08-mobile` | `#github-release-386577294` |
| `pubDate` | `Fri, 11 Sep 2026 00:00:00 GMT` | `Tue, 08 Sep 2026 00:00:00 GMT` | `Thu, 10 Sep 2026 00:00:00 GMT` |
| `description` | Same as title | Same as title | `Python SDK 0.154.0` |

The `content:encoded` values are mixed formats: the sampled desktop/mobile entries contain Markdown; the sampled CLI entry contains HTML. Do not assume that field is always HTML or use it as unsanitized rendered content. Existing title/link/date-only ingestion does not require parsing it.

The existing raw item-block regex finds 128 blocks, agreeing with a real XML parser for this live response. The immediate correctness problem is its `blocks.slice(0,15)` before product filtering, not a demonstrated block-count parsing failure in this feed.

## Matching desktop/mobile entries

Use the parsed URL, verified publisher/path, and the structural fragment, rather than title keywords:

```ts
const u = new URL(item.url);
const pathname = u.pathname.replace(/\/$/, '');
const knownChangelog =
  (u.hostname === 'developers.openai.com' && pathname === '/codex/changelog')
  || (u.hostname === 'learn.chatgpt.com' && pathname === '/docs/changelog');
const isChatGPTAppItem = u.protocol === 'https:' && knownChangelog
  && /^#codex-\d{4}-\d{2}-\d{2}-(app|mobile)$/.test(u.hash);
```

The legacy developer-host URL is the actual current item schema; the canonical learn-host path is the published redirect destination. The structural predicate matches 62 of the 128 current entries; only 3 matches appear in the first 15 raw entries. Parse the bounded feed, filter, sort by actual `pubDate`, then keep 15 matches. Do not extract the publication date from the fragment: one observed mobile entry has a September 2 anchor but a September 1 `pubDate`.

This is a deliberately precise desktop/mobile scope, not exhaustive ChatGPT coverage. Three titles containing `ChatGPT` have general, unsuffixed anchors: Sign in with ChatGPT, credits, and the old Codex-in-iOS launch. A title-only fallback would blur this scope. Unknown future anchor shapes should be excluded or surfaced for review rather than silently attached to the wrong product.

The 1.5 MB input bound accepts this RSS today with approximately 263 KB headroom. Keep explicit size failure reporting and the last good payload. Do not replace the feed with the full HTML changelog; the HTML exceeds this limit. Preserve Help Center editorial sources separately because this feed does not include every ChatGPT web-product announcement.

## Related freshness issue already present

`liveFeed()` labels retained items with `source_snapshots.checked_at` even after an error updates that timestamp. A failed fetch therefore makes an old cached item appear newly checked. The smallest honest display change is to expose error/stale status with the attempt timestamp. If the UI needs a successful-verification timestamp, store `last_success_at` separately and update it only for successful 200/304 responses. Do not discard the cached content solely because an attempt failed.
