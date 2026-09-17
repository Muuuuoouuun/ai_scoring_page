# V7 deployment and browser evidence

Date: 2026-09-12. Goal remains active; score weights unchanged.

## Exact deployed state

- Site: https://ais-discovery-hub.aaahaaah19.chatgpt.site
- Commit: `123de1697a5a6c40a8d7666fd08df80ffbb6c9dc`
- Version: `appgprj_6aa42f3ab3ec81919d0048d508baa661~appgver_062b212a553c8191a2e6edebd22e69af`
- Deployment: `appgdep_6aa5112658208191b7d73eaad163a43c`
- Succeeded: `2026-09-12T08:45:51.734799Z`, environment revision2.
- Owner-only unchanged: owner/custom, one account, zero external visitors and groups.
- TypeScript, build, git whitespace check passed. Existing HTTP smoke:20 public pages,404,anonymous/spoofed auth rejection,signin,persisted create/edit/delete,CSRF rejection passed. Temporary smoke record cleaned up.

## Local functional verification (development server; no production speed claims)

CUA IAB Chromium, visible document, native Mac apps locked. Browser controls remain available. No native screen-reader or actual browser zoom test claimed.

- Viewport390x844; actual app client width375. Compare document scroll width375. Menu Enter focuses first navigation link 발견; Escape closes menu and restores menu button. Visible focus ring observed.
- Viewport320x900; actual app client width305. Compare document scroll width305; named table scroller has650px content and stays inside document. ArrowRight on focused comparison region moved scrollLeft from0 to40. Row/column semantics exposed; nine row headers verified in DOM.
- Community existing local test thread: at305px client/scroll width, answer/edit buttons focus first enabled nickname input. Closing returns to exact 답글 작성 or 수정 trigger. Screenshot confirms long title wraps and actions remain reachable. No public production content created.
- Diagnostic code check: visible standalone local doc automatically froze at10003ms; actual elapsed timestamp retained, unknown INP left absent, raw shift and loaded image coverage shown.9/9 images decoded. Development timings/resources are not used as production scores.

## Measurement protocol

Fixed before production results: [performance method](2026-09-12-v7-performance-method.md). Production samples below are app-document lab observations, unthrottled; cache policy not controlled. Frame timings exclude hosting wrapper; no field percentiles or physical-mobile claims. Missing FCP/LCP/CLS remain unknown. Automatic cutoff targets10000ms and reports actual elapsedMs. Raw document layout session values are explicitly distinct from library CLS.

Production observations pending below.

### Production home first two observations

Both production top-level documents report visible at initialization and capture, zero visibility changes, viewport410x783, actual client/scroll395/395. The attempted1440 setting was bound to the separate local tab, so these samples are explicitly narrow; no desktop claim. Normal CUA browser events, no throttling/cache control.

| Sample / capture UTC | Window ms | Observer start ms | TTFB ms | FCP/LCP ms | CLS/raw shift | Document bytes | Resource count / transfer bytes / unknown-size count | Script encoded bytes | Long tasks | Decoded images |
|---|---:|---:|---:|---:|---|---:|---|---:|---|---|
|navigate08:46:09.228|10001|5399|4724.2|5376|0/0|14709|48 /95871 /16|67366|0|9/9|
|reload08:47:43.746|10003|2934|2690.4|2944|0/0|14252|51 /8400 /23|0 reported, incomplete|0|9/9|

INP absent before a principal task, not0. Navigation responseEnd4725.1/2691.6ms, domInteractive5348.4/2914.2ms, domComplete5369.8/2930.1ms. Both observations miss the fixed TTFB/FCP/LCP budgets; initial latency is a demonstrated issue, not marked green. Cache/unknown-sized scripts prevent treating repeat zero script bytes as free. Observed count/known transfer/long-task budgets are below limits with coverage limitations. Repeat results are retained rather than selecting only the faster result.

### Representative production observations, existing extra QA tab

The browser viewport override applies to the separate agent-created QA tab. This tab loaded the identical production URL and visibly rendered desktop at1440x900. Stable deliverable tab retained its410x783 dimensions. Treat tab/environment differences as uncontrolled; do not infer the cause of latency from these samples.

| Page /capture UTC | Window ms | Actual viewport | TTFB ms | FCP/LCP ms | CLS | Nav transfer B | Resources count/transfer B/unknown | Known script body B | Long tasks |
|---|---:|---|---:|---:|---:|---:|---|---:|---|
|home08:49:21.281|10001|1440x900 client1425|284.9|472|0.0012545|14252|32/7800/0|145753|0|
|explore08:50:12.266|10002|1440x900 client1425|2229.2|4408|0.0001419|6635|61/44908/23|2356,partial|0|
|explore stable tab08:48:59.362|10002|410x783|2439.8|4076|0|6635|53/50098/23|2356,partial|0|
|my08:51:34.374|10003|1440x900 client1440|4209.6|4464|0|4571|45/30848/23|22621,partial|0|

All recorded document scroll widths equal measured client width. All initial/current visibility states visible, no recorded visibility transitions; component reports top-level document. Raw layout maximum matches CLS for these observations. The screenshot after immediate navigation to/my showed loading text; subsequent reading after the10s window showed the account's empty library, then working subscription tab and modal. No temporary subscription or payment was submitted.

Principal operations observed: home ChatGPT+Claude comparison selections produce2/3 dock; explore query문서+writing filter produces1 Claude result, compare navigation opens exact ChatGPT/Claude matrix; my subscription tab opens구독 추가 modal, Escape closes and restores invoking button. After tasks, document INP candidates56ms(home),56ms(explore),72ms(my); raw layout values unchanged and zero observed long tasks. These are document-session candidates including diagnostic-button interactions; they are not per-action attribution. Manual post-task captures occurred later than the proposed15s task cap, so a strictly timed isolated task-window run remains pending. No fabricated async completion duration is supplied.

### All20 deployed logo decode outcomes

At desktop/explore initial capture08:50:12.266 every individual image reported complete && naturalWidth>0. Paths `/api/logos/`: canva,chatgpt,claude,claude-fable-5-1,cursor,figma,gemini,gemini-3-8-flash,notebooklm,github-copilot,gpt-6-astra,linear,make,midjourney,notion,perplexity,slack,supabase,vercel,zapier. This adds actual deployed per-asset decode outcomes to the V5/V6 official provenance receipts. Narrow initial viewport loaded11/20 due lazy images; this is separately retained rather than called a complete narrow render check. Full visual logo placement sweep remains a separate visual assessment.

### Fixed-budget interpretation

Only the fast desktop-home sample met all three load targets; other measured loads missed TTFB/FCP/LCP budgets. CLS observations stay below0.10; document-session INP candidates below200ms. Known transfer bytes/counts/long tasks are below fixed limits, but unknown resource sizes prevent complete byte-cost certification on those samples. No median/p75 computed from mismatched page/tab profiles, no cold-cache or physical-device claim. The issue remains open and is not hidden by measurement-gate credit.

V7 recent production Worker error-only log query (15min,limit30) returned0 events. Checkout clean after publish.

### Narrow private page

/my initial snapshot08:52:24.180Z:10001ms window, viewport390x844, client/scroll375/375. TTFB1925.8ms,FCP3940ms,LCP4992ms,CLS/raw shift0.0347160; navigation4571B,45 subresources8440B transfer with27 unknown-size entries,script body0 reported/incomplete,zero observed long tasks. Screenshot shows horizontally scrollable private tabs contained inside page, wrapped heading/actions and reachable empty-library action. Initial load budgets missed; layout shift stays below0.10. No new account records submitted.

### Strict timed exploration follow-up

Same deployed code, QA tab1440x900. Full-page screenshot showed all20 recognizable logo marks beside their corresponding tool/model labels, consistent spacing and uncut card actions across seven rows. Before the task, fresh initial observation at08:54:13.751Z: TTFB2318.8ms,FCP/LCP4736ms,CLS0.0001419; nav6635B,61 resources10800B transfer,24 unknown-sized entries; known script body0/incomplete. This additional slow sample is retained.

One continuous CUA call then closed diagnostics, started a host monotonic wall-time interval, typed문서 with pressSequentially, selectedwriting, and read1개 결과 · “문서”. Actions plus observed result took93ms including automation dispatch; this is wall-time to visible result, not a browser per-event metric. Waited2100ms for Event Timing delivery, captured diagnostics at2476ms total window, within the predeclared15s cap. The document INP candidate was56ms; CLS/raw remained0.0001419 and document long-task count/max/excess stayed0. This resolves the earlier manually delayed task-window gap for this one exploration task. INP still includes earlier diagnostic interactions; do not call56ms the isolated latency of either specific filter action. Initial snapshot before this task had no INP reading.
