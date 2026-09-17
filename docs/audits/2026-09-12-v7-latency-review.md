# V7 initial latency: bounded read-only code review

Checked2026-09-12. Evidence: current app source and `docs/audits/2026-09-12-v7-browser-evidence.md`, whose deployed commit is `123de1697a5a6c40a8d7666fd08df80ffbb6c9dc`. No code/Git/Sites/browser changes, no production request, no point award. Root is independently collecting same-deployment comparisons. Conclusions below separate inspected control flow from unproven latency causes.

## Result

**The home page explicitly waits for a D1 recent-post query before returning any of its JSX.** Moving only that secondary section behind an async component/Suspense boundary is the smallest plausible change that removes a known dependency from hero rendering. It is not yet proven that this query caused the observed2.7–4.7s TTFB, or that the deployed hosting path will forward an early streamed shell.

`getChatGPTUser()` contains no external authentication request. `waitUntil(syncBatch())` does not await source-sync completion. Neither should be described as a proven multi-second blocking network call based on its function name.

## What the two browser observations establish

| Observation | TTFB | FCP=LCP | FCP−TTFB | TTFB share of FCP | responseEnd−responseStart |
| --- | ---: | ---: | ---: | ---: | ---: |
| First navigation |4724.2ms|5376ms|651.8ms|87.9%|0.9ms|
| Reload |2690.4ms|2944ms|253.6ms|91.4%|1.2ms|

Most measured time elapsed before the first response byte; the body then arrived in a short measured interval. This focuses the next investigation on request/response preparation and the path before response delivery, while leaving a253–652ms post-first-byte gap to investigate separately. It does not identify the database, Worker, hosting proxy/authentication, network/connection or buffering as the cause. TTFB includes more than server compute. Near-zero body-transfer duration alone does not prove server-side buffering or streaming behavior.

CLS0 and observed long-task0 describe the captured client observations. They do not measure server work and cannot rule out unobserved client work before registration. The observations used uncontrolled cache/network conditions, and the first/reload discrepancy cannot be called a confirmed cold-start penalty.

Source: [browser evidence](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v7-browser-evidence.md).

## Actual await paths

| Location | Inspected work | Relationship to initial rendering |
| --- | --- | --- |
| [Home page:8–9](/Users/bigmac_moon/dev/ai_score/site/app/page.tsx:9) | `dynamic='force-dynamic'`; `await rows(SELECT…posts…status='published' AND parent_id IS NULL ORDER BY created_at DESC LIMIT3)` occurs before `return <main>`. The catch only sets a fallback after the promise rejects. | Direct home-content dependency: all hero/catalog/guides/events markup returned by this component waits for the query. There is no local Suspense boundary or loading component isolating this section. No explicit app-level timeout bounds this await. |
| [db.ts:6](/Users/bigmac_moon/dev/ai_score/site/lib/db.ts:6) | `db().prepare(sql).bind(...params).all()` against `env.DB`, then extracts `results`. | One actual remote binding/query promise on the home path. No additional API fetch or per-row lookup in this helper. Duration unknown; need measurement. |
| [Root layout:24](/Users/bigmac_moon/dev/ai_score/site/app/layout.tsx:24) | `await getChatGPTUser()` before layout JSX and sync launch. | An explicit layout dependency, but inspect its implementation before assuming I/O. Layout/page durations must not simply be added: renderer scheduling/overlap is not measured. |
| [chatgpt-auth.ts:21–39](/Users/bigmac_moon/dev/ai_score/site/app/chatgpt-auth.ts:21) | `await headers()`, `.get()` for trusted injected headers, optional safe URI decoding, return small user object/null. No `fetch`, D1, JWT network verification, sign-in request or session lookup. | Reads an already-available request context. Upstream host authentication could still contribute before app handling, but this function does not expose its timing or prove it happened. Removing auth would not be a justified latency fix. |
| Installed vinext [headers.js:605](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/shims/headers.js:605), [promise helper:476](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/shims/headers.js:476) | `headers()` normally wraps readonly request-context headers via `Promise.resolve(target)`. Special static/PPR scope errors/suspensions exist, but this is the force-dynamic live home path. | Confirms that ordinary `await headers()` is not an app-owned external auth round trip. |
| [Root layout:25](/Users/bigmac_moon/dev/ai_score/site/app/layout.tsx:25) | `waitUntil(syncBatch().catch(...))` launches a promise without awaiting its completion, then returns JSX. | Background work, not a dependency on successful completion before response. Invocation executes the async function's synchronous prefix and starts its first D1 query. Shared-resource contention remains a hypothesis, not an awaited7s delay. |
| [source-sync.ts:15](/Users/bigmac_moon/dev/ai_score/site/lib/source-sync.ts:15) | First await checks latest `sync_runs`. A recent run skips. If due, further D1 lease/run/snapshot operations precede a3-tool concurrent batch; each tool processes content/logo and persists results. | Even a skip starts one D1 read per layout invocation. When due it performs more D1/I/O/CPU work concurrently. The1-hour persisted gate and60-second lease already bound due work. No code path here changes the layout call into `await syncBatch`. |
| [source-sync.ts:7–13](/Users/bigmac_moon/dev/ai_score/site/lib/source-sync.ts:7) | Source fetches have a7s timeout per fetch/redirect, bounded bodies, hashing/parsing and D1/R2 writes. | These can extend background work; they are not7s timers directly added to TTFB. No need to weaken source checks to obtain an artificial speed win. |

[Cloudflare documents waitUntil](https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil) as keeping promise work alive without requiring response return to wait for completion. It does not promise the work has zero CPU/I/O cost or that it starts only after response delivery. This distinction matches the inspected call.

Catalog, guide and event lists on Home are imported local JSON and small in-memory filtering/mapping. `Provider` initializes comparison state from sessionStorage in a client effect; it makes no initial user-fetch request. None is an additional server-side awaited network dependency on this inspected path.

## Streaming: supported mechanism, unproven deployed effect

The app uses vinext1.0.0-beta.5/Vite/React19, not an untouched stock Next server. Installed [SSR entry:253–255](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-ssr-entry.js:253) awaits `renderToReadableStream` and only awaits `.allReady` when `waitForAllReady===true`. Installed [app-page-render:361](/Users/bigmac_moon/dev/ai_score/site/node_modules/vinext/dist/server/app-page-render.js:361) sets that flag for non-speculative prerendering. This supports trying a local Suspense boundary; it is not proof that every deployment/proxy/browser will expose the earlier shell.

Do not edit framework/vendor files or hosting/auth configuration as the first step. Do not infer the production response mode from a local dev-server test.

## Smallest useful measurement

Use the existing diagnostic mode and fixed before/after protocol. Add only enough timing to split the currently unknown path:

1. **Same-request server spans:** elapsed around `getChatGPTUser()` and elapsed around the home `rows()` query, with success/error and returned-row count. Preserve the actual async operation and error behavior. Use coarse numerical timings and a request/run correlation ID; do not log identity headers, user details or post text. Either render query-gated diagnostic metadata locally or emit a concise existing server log entry. A generic D1 probe endpoint is less direct evidence than this actual query.
2. **Browser navigation phases:** add requestStart, responseStart, fetchStart, redirectStart/End, DNS/connect boundaries and TLS start when available. This separates visible connection/redirect phases from requestStart→responseStart. The latter still includes network and upstream host work; do not call it database time. Preserve unavailable/zero timing semantics.
3. **Background correlation only if needed:** retain whether that request's sync call skipped or actually ran and its duration in a background diagnostic result/log. Do not `await` it for measurement or block the HTML response to expose its final status. If home latency remains high after the obvious dependency is removed, this gives a small next comparison.

A Server-Timing response header would also work if the existing response plumbing safely supports it; adding a custom framework/hosting wrapper solely for these two spans is unnecessary scope. Client-only timing cannot partition D1 and upstream request waiting.

Root's ongoing `/` vs `/explore` comparison is a useful control: `/explore` shares RootLayout but only awaits request-local searchParams in its page and has no inspected page-level D1 query. Keep same deployment/account/browser/viewport/cache protocol and preserve all runs. A route difference is suggestive, not a randomized causal estimate. A broad shared delay on both routes shifts attention toward the shared request/runtime/network path; a large measured home-query span would directly identify a home dependency worth removing.

## Smallest improvement candidate

Move the existing recent-post query and its success/empty/error rendering into `async RecentDiscussions()`, rendered only at that lower section inside `<Suspense fallback={...}>`. Keep Home's hero/catalog/guides/events outside the awaited component and make Home itself return its shell without waiting for posts. Use a compact fallback that reserves the section's space to avoid introducing a layout shift. Preserve `status='published'`, `parent_id IS NULL`, limit/order and current error fallback.

Then verify on the same production hosting path:

- hero appears while recent posts are still pending, and posts subsequently resolve;
- query errors still show the existing honest unavailable state;
- TTFB/FCP/LCP measurements and raw stability are recorded under the same conditions;
- improvement is reported only if repeat observations support it; retain the earlier slow samples.

Do not remove the recent-post feature, remove authentication, mark the whole personalized layout static, or introduce shared caching of user-dependent HTML. Do not replace a real query with a fake fast value solely for a better timing result. Client-side loading is a fallback option if production buffering defeats streaming, but it adds a request/loading path and is not the smallest first change.

There is no perfect index for this recent-post filter/order in the inspected migrations: existing posts indexes are `(tool_id,created_at)`, `(parent_id)` and `(user_id)`. This is not evidence of an expensive scan at the current data size. Only if the measured query cost is material, inspect its query plan and then consider an index aligned with published/top-level/created_at ordering. Likewise, an in-memory sync pre-gate might reduce per-render D1 reads but changes operational timing across isolates; defer it until measurements identify meaningful contention. Neither is needed to test the narrower Suspense change.

## Conclusions that remain unsupported

The observations do not establish that D1 is slow, the host has a cold-start regression, `headers()` contacts an identity service, all source-sync requests block rendering, or client code is cheap merely because observed long-task count is0. The established defect is excessive initial latency in the two recorded conditions; the established removable dependency is the home-level await on lower-priority recent posts. The proposed small measurements distinguish those facts from an eventual root-cause claim.
