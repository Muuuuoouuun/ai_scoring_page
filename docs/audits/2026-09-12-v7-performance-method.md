# V7 performance evidence method

Checked 2026-09-12 (Asia/Seoul). Bounded read-only review of installed `web-vitals` **4.2.4**, its README/source, official GoogleChrome/web-vitals documentation and Web Performance API specifications. No checkout, Git, Sites or browser edits. This proposes an evidence method; no performance run was performed and no score is awarded by this report.

## Decision

A query-enabled component running **inside the app document** can produce useful local lab evidence for all four existing rendering-performance gates. The diagnostic must report its frame/document scope, initialization time, observation cutoff, environment, support/coverage and actual task. Results are single-session observations, even when the library labels a value `good`; they are not field p75, CrUX, a Lighthouse score or certification. No external telemetry is necessary for these worksheet gates.

The score worksheet does not demand Lighthouse, RUM infrastructure or a minimum number of real users. It demands measured load/render timing, principal-task responsiveness, initial/async layout stability, and resource/long-task costs against a stated budget. Instrumentation code alone satisfies none of these gates. Existing wording is in [V6 worksheet](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-score-worksheet-v6.md:251).

## Source version and interpretation

- Local authoritative implementation: [package.json](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/package.json), [README](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/README.md:53), and `src/` below. The installed package declares 4.2.4 and GoogleChrome/web-vitals repository ownership.
- The live [official repository](https://github.com/GoogleChrome/web-vitals) documents newer behavior too, including soft-navigation APIs. Do not copy those expectations into 4.2.4. The tagged GitHub URL failed in the web fetch, so exact version conclusions here come from the installed source, not an asserted successful tagged-page fetch.
- The official [Web Vitals overview](https://web.dev/articles/vitals) distinguishes Core Web Vitals LCP/INP/CLS from diagnostic FCP/TTFB. Its overall field assessment uses the 75th percentile of real visits, segmented by mobile/desktop. Repeated local runs can be summarized as median/range/worst, but do not become that population measure.

## Iframe scope

Label the result **“앱 문서의 단일 방문 관측값”** and display `window.top !== window`, initial document URL/path, current route, `performance.timeOrigin`, navigation type, viewport/client width, initial/current visibility and observation timestamp.

An observer in the wrapper does not see its iframe's LCP/INP/layout-shift entries. An observer inside the app sees that document's entries, but not wrapper loading, sibling frames or nested-frame internals. Child navigation clocks also exclude time spent loading the wrapper before the child navigation starts. The browser's whole-page experience and CrUX can include frames; this component must not claim that scope. Combining child metrics is not a simple sum/max of five numbers: geometry, timing origins and interactions matter. No parent aggregation is required for this bounded app-document lab. This distinction is explicit in [Google's iframe explanation](https://web.dev/articles/crux-and-rum-differences#iframes) and installed [README limitations](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/README.md:1103).

**Frame eligibility caveat:** the [Paint Timing draft](https://w3c.github.io/paint-timing/#sec-terminology) permits user agents to report paint timing only for selected nested contexts, including disabling it in cross-origin frames. Thus `supportedEntryTypes.includes('paint')` does not guarantee a FCP entry inside this actual iframe. Confirm observed entries. In installed4.2.4, `onCLS` starts only inside a successful `onFCP` callback, so missing frame FCP can also leave library CLS unreported even if raw layout-shift support exists. Do not fill either with0. Where raw shift entries are available, a separately labelled document-shift observation/session-window diagnostic can provide equivalent stability evidence; explicitly disclose that it is not the library CLS result. If actual paint timing remains unavailable, use a permitted standalone app-document environment or an honestly named custom rendering observation, and leave unmeasured standard metrics unknown. Do not assume all five functions will emit simply because the component is inside the app.

For layout shifts, the documented per-document quantity is DCLS when a document contains frames. Treat the app's number as document-scoped even if the label retains familiar `CLS`. A child observer cannot tell that the wrapper moved or occluded the whole iframe. Frame visibility is not proof that the app is unobscured on screen.

## Late hydration and registration

The package's [observe helper](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/src/lib/observe.ts:38) registers supported types with `buffered:true`. Therefore a normally deferred import can recover retained pre-registration paint/shift/event entries; late hydration does not automatically invalidate all metrics. It does not recreate missing entries or full historic visibility, and different browser entry buffers/thresholds have limits.

A particularly relevant 4.2.4 behavior is [getVisibilityWatcher](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/src/lib/getVisibilityWatcher.ts:21): if registration occurs while hidden, it assumes the document was hidden since navigation start; if registration occurs visible, prior hidden history may be unknowable. This can suppress or qualify FCP/LCP and, through FCP, CLS. Run initial loads in a foreground visible app with the diagnostic query already enabled. Record registration milliseconds, initial visibility, and any visibility transitions; do not open the diagnostic much later after backgrounding and call it a clean initial-load test.

Call each `on*` once per document lifecycle. Public 4.2.4 APIs do not return a cleanup function. A React mount guard/singleton should keep observers alive across panel open/close and root-route renders; prevent repeated subscriptions on remount/HMR, and measure production builds rather than development Strict Mode. Store mutable raw state outside hot render paths, update the visible diagnostic at a modest rate, and take a frozen copy for evidence.

The package does **not** start fresh LCP/FCP/TTFB at a Next client-side route change. Capture `initialDocumentPath` separately from `currentPath`. Reload each initial-load test route as a new document; use explicitly named custom task/route timings for SPA transitions. Do not reset metrics manually at arbitrary times and continue calling them standard Web Vitals. bfcache restores receive new metric IDs/values; record `metric.id` and `navigationType` to avoid mixing visits.

## Metric collection table

| Function | Accurate meaning / collection | Missing or misleading result to avoid |
| --- | --- | --- |
| `onLCP(report,{reportAllChanges:true})` | Current largest-content paint candidate for this document. In 4.2.4 it reads buffered candidates, uses entry startTime minus prerender activation, and stops its normal observer on relevant input or hidden. Candidate may change until the browser/library closes observation. Source: [onLCP](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/src/onLCP.ts:46). | A fixed early screenshot is an observation cutoff, not guaranteed lifetime-final LCP. Initial click on the diagnostic can end observation. Pending/unsupported/hidden must not become 0. LCP is not the time when all data, logos or hydration completed. |
| `onINP(report,{reportAllChanges:true,durationThreshold:16})` | Per-visit near-worst interaction latency to the next visual response, aggregating logical interactions. Source checks `PerformanceEventTiming` and `interactionId`, observes `event` plus `first-input`, and reports through idle/hidden handling. Source: [onINP](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/src/onINP.ts:68). | Requires actual click/tap/keyboard interaction in the measured document. No callback is **미관측**, never zero. Scrolling alone is insufficient. Default library threshold is 40ms; 16ms is browser minimum, with 8ms duration rounding. First-input can report below the event threshold. Do not equate numeric 0 with literally zero processing time. |
| `onCLS(report,{reportAllChanges:true})` | Largest eligible layout-shift session: gaps under 1s and session duration under 5s, excluding entries with recent input. Continues after initial load, so retain it through async data/images and task windows. It waits for FCP before setting up the shift observer. Source: [onCLS](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/src/onCLS.ts:51). | Initial CLS=0 is only the current value. No FCP/unsupported shift API can mean no CLS report. A total sum of all shifts is not CLS. Deliberate recent-input shifts are excluded; visual usability still needs observation. |
| `onFCP(report)` | First contentful paint from buffered paint entry; excludes hidden-before-paint according to the visibility watcher, corrects prerender activation. Source: [onFCP](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/src/onFCP.ts:39). | Does not prove meaningful content, logos or async data are ready. No report is distinct from 0 and from unsupported browser. |
| `onTTFB(report)` | Navigation responseStart relative to activation/time origin. Reports after document load so navigation fields are populated; includes DNS/connection/latency/server time, not just backend execution. Source: [onTTFB](/Users/bigmac_moon/dev/ai_score/site/node_modules/web-vitals/src/onTTFB.ts:32). | Missing/invalid navigation timing must remain unavailable. The callback's arrival time is not the TTFB value. Child TTFB excludes earlier wrapper delay; SPA fetch latency is not this navigation TTFB. |

`reportAllChanges` reports changes in the aggregate metric, **not every input/shift**. Keep the latest absolute `metric.value`, not the sum of repeated callbacks/deltas. Report support from actual APIs, not a hard-coded browser-name table. Distinguish `unsupported`, `waiting for eligible entry/interaction`, `observed`, and `incomplete/hidden/late coverage` where possible.

The installed `whenIdle` runs on an idle callback or hidden, without an explicit idle timeout. Do not assume the new INP is available synchronously inside a click/capture handler. Let entries/callbacks settle and then freeze. Clicking the capture button itself is an interaction, so record the principal task beforehand and, if available, the INP candidate's event/target/startTime to avoid attributing a slow diagnostic click to search. Do not artificially block the thread to force an INP result.

The distinction between single-visit near-worst INP and population p75, the 16ms floor, `first-input` exception, and frame boundary are documented in [official INP guidance](https://web.dev/articles/inp#measure_inp_in_javascript). INP measures initial responsiveness; an async search may promptly paint a spinner but finish much later. If task completion matters, additionally record an explicitly named custom `검색 실행→결과 DOM 반영` duration and describe the exact endpoints. A requestAnimationFrame estimate is not a guaranteed physical paint timestamp or INP substitute.

## Long-task diagnostics

Use a feature-detected `PerformanceObserver` for `{type:'longtask',buffered:true}`. Retain numeric start/duration and bounded coarse attribution, plus count, maximum duration, total duration, and `sum(max(0,duration-50))` for a **named observation window**. Flush `takeRecords()` before a snapshot and deduplicate entries if combining existing and future sources. Record unsupported, buffer gaps or observation-start limitations instead of claiming no long tasks.

Long tasks represent roughly 50ms-or-longer main-thread work and can include limited/coarse cross-context attribution. The entries delivered to an iframe are not automatically proof that all work originated in app code. Keep `entry.name`/safe attribution or label it “이 문서에 전달된 긴 작업 관측”. Do not call this a CPU profile, memory measure, or all-thread cost. Source: [Long Tasks API specification](https://www.w3.org/TR/longtasks-1/).

The excess-over-50ms sum over an arbitrary session window is **not Lighthouse TBT**. Lighthouse TBT uses a defined loading interval from FCP to Time to Interactive; report our chosen sum by its formula/window instead. A slow interaction may also arise without one >50ms task, so long tasks do not substitute for INP. Source: [Chrome TBT definition](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time).

## Resource-byte diagnostics

Report `encodedBodySize` (compressed body), `decodedBodySize` (uncompressed body), browser-reported `transferSize`, request count and groups separately. Resource entries omit the document navigation; add navigation timing once or label the total “subresources only”. Zero sizes can mean restricted cross-origin timing, cache, or empty responses; never turn all zeros into a verified zero-cost page. Modern transferSize uses approximate header accounting rather than exact wire bytes. Record coverage/zero-size count and cache protocol. Resource timing has finite buffering; request a larger buffer early, observe continuously, and record buffer-full events. An increased late buffer cannot recover entries already lost. These semantics/limits are in the [Resource Timing specification](https://www.w3.org/TR/resource-timing/), currently a candidate draft.

Suggested categories: document, script, CSS, font, image, fetch/XHR, other. Keep modulepreload/preload initiator ambiguity visible or classify same-origin `.js` paths consistently. Include the diagnostic bundle in observed costs, optionally identifying it separately. Do not mix compressed body size and transferred size in one budget, infer bytes from Content-Length alone, or silently omit responses whose size is unavailable. The [Chrome resource diagnostic](https://developer.chrome.com/docs/lighthouse/performance/resource-summary/) likewise treats counts/sizes as diagnostics, not an independent Lighthouse performance score.

Implementation suggestion: use one continuous resource observer with buffered history and a bounded list/aggregate. A one-time `getEntriesByType('resource')` snapshot is adequate for a small documented window if no buffer loss is known, but not proof of unbounded complete navigation history. All reports remain local; avoid serializing query strings, user inputs, complete DOM nodes or secrets into the shareable evidence JSON.

## Current component observations passed to root

Inspected `/Users/bigmac_moon/dev/ai_score/site/components/PerformanceDiagnostics.tsx` while root was editing; line references may move.

- Existing query gate, local-only wording, `reportAllChanges`, INP threshold16, `미관측`, iframe caveat, resource-zero caveat and non-TBT wording are appropriate.
- Its `capture()` initially froze resources/long tasks but used live `readings` in later JSON output. Freeze a copied readings object with the same snapshot time.
- Its initial path was not stored. Current capture path can differ from the document that produced FCP/LCP/TTFB; add the initial path/document ID and navigation type.
- Initial resource count excludes HTML navigation, and long-task aggregates have no fixed end/window/max duration yet. Add these or label the limited scope precisely before comparing budgets.
- The expandable fixed panel can become a paint candidate or affect measured work. Keep it compact during initial-load/task observation; freeze before expanding and exclude diagnostic-only actions from task interpretation. This overhead is part of the instrumented run, not a zero-cost observer claim.

These are read-only observations, not a demand for more telemetry or an assertion that root's latest implementation still has them.

## Proposed fixed lab protocol and budgets

These are **project lab budgets selected in advance**, not official Google certification and not new worksheet criteria. Freeze them before viewing results; never relax them to convert a measured failure into a pass. Keep all valid samples, including slow ones. Three repeats are a modest stability recommendation, not a pre-existing scoring requirement.

### Representative matrix

| Profile | Routes / task | Conditions and evidence |
| --- | --- | --- |
| Desktop app viewport | Fresh-document loads of `/`, `/explore`, `/my` | Aim 1440×900, record actual app `innerWidth/innerHeight`, client width, DPR, browser/version/OS and production deployment revision. Keep foreground, same cache/network policy and authenticated state appropriate to `/my`. |
| Narrow app viewport | Same routes; filter search and open/read loaded tool list | Aim390×844, report actual measured dimensions (395px is not390px). A resized desktop browser is a narrow-viewport desktop CPU test, not a physical-mobile benchmark. |
| Principal task, both profiles | On `/explore`, enter a fixed query (e.g. `문서`), change a category filter, add two tools to comparison, open `/compare`; include `/my` async loading | List exact actions/results and interaction timestamps. Standard vitals remain document-scoped across SPA steps. Capture before and after async completion and note errors/timeouts. Use a safe existing test account and temporary data already authorized by root. |

Use three repetitions per selected load profile/route if practical; report each result plus median and worst, never just the best. If the browser tools cannot control network/CPU/cache, state `unthrottled / cache not controlled` and record repeat order; do not claim cold or simulated-mobile conditions. A first visit is not proof of empty caches. A verified cache-disabled network profile is useful additional evidence, not a prerequisite silently added to the worksheet. Real low-end mobile/slow-network evidence remains a separate scope if not run.

Define **load window** as navigation start through10s, with a snapshot at the cutoff. If async content is still pending, mark that explicitly and fail the ready-within-window target; do not quietly extend only slow samples. Define a **task window** from its first interaction through completion plus2s, capped at15s with timeout recorded. Session CLS/INP can include earlier work; display window-specific long-task/resource totals alongside document-level vitals. These fixed windows are lab observations, not final lifetime field metrics.

| Budget | Proposed target / unit |
| --- | --- |
| LCP / FCP / TTFB | ≤2500ms / ≤1800ms / ≤800ms in each declared load observation. These borrow the installed library's good boundaries as lab targets only. Missing value is unknown, not pass. |
| Principal-task responsiveness | Observed INP candidate ≤200ms; record actual actions and candidate attribution if available. Additional async result completion ≤1500ms is a separate proposed product-task target, not INP. |
| Document layout stability | CLS≤0.10 at initial cutoff and after the fixed async/task sequence; record initial and later value. |
| Initial app-document transfer | ≤1.5MiB browser-reported transfer including navigation, with unknown-size coverage disclosed. If only subresources are available, do not call it this complete budget. |
| Initial script payload | ≤500KiB encoded body for documented script grouping. |
| Initial requests | ≤80 documented document+subresource entries within the fixed window, showing unknown/buffer-loss status. |
| Long-task load window | Max duration≤200ms; excess-over50ms sum≤200ms. Also report count and full-duration sum. |
| Long-task principal-task window | Max duration≤200ms; excess-over50ms sum≤100ms. Scope is observed work, not Lighthouse TBT. |

MiB=1,048,576bytes; KiB=1024bytes. Treat inaccessible byte sizes as incomplete coverage, not zero. A budget miss is a measured result to investigate, not evidence absence. Browser-scope/iframe limits do not prevent useful app-level measurements when stated clearly.

## Existing25-point gate mapping

| Existing gate |6.25-point evidence required | What does not suffice |
| --- | --- | --- |
|5.3.1 Representative load/render timing measured with method/environment | Actual production samples on representative routes, actual viewport/browser/cache/network/frame conditions, initialization/cutoff, FCP/LCP/TTFB or explicitly justified timing alternatives, result/unknown distinctions. | Component exists, build succeeds, empty Performance API output, or wrapper timing labelled app timing. |
|5.3.2 Interaction responsiveness measured on principal task | Exact performed principal task, successful observable outcome, an INP/event timing observation attributable to that work or clearly named measured interaction alternative, cutoff and environment. | INP pending, synthetic `.click()` with no eligible Event Timing, merely counting clicks, or only measuring the diagnostic button. |
|5.3.3 Layout stability measured during initial/async rendering | Supported continuous shift observation through initial and named async/task windows, actual CLS values/cutoffs and frame/recent-input caveats. | A static screenshot, initial0 before content arrives, unsupported metric coerced to0, or CSS rules alone. |
|5.3.4 Resource/long-task costs measured under stated budget | Fixed window/category/unit budgets declared in advance, actual byte/count/long-task results, coverage/unknown flags, comparison and recorded remediation or explicit misses. | Bundle file size alone, zero cross-origin sizes called free, arbitrary-session excess time called TBT, or no numerical budget. |

The current gate wording rewards adequate **measurement evidence**, not a newly invented requirement that every numerical target be green. A valid over-budget sample may establish that measurement occurred while requiring a visible performance finding and improvement work. Do not automatically convert a red lab result to green quality, and do not rewrite gate definitions retrospectively. The worksheet owner should record the gate evidence/status and any demonstrated defect consistently with its existing rules; this report awards no points.

All four can be supported by local first-party lab observations without external analytics, provided the actual runs are complete and transparent. Their maximum is25points. A single session does not establish user-population p75, every device, full hosting-wrapper performance or all future interactions; retain these boundaries even if the measured lab gates pass.
