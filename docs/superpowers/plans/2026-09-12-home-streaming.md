# V13 Home rendering dependency and latency

Previous goal turn was progress: V12 optional feedback is deployed as source368effb0ab5929188c885d271509c815d74019d6. Full scope and all152 fixed gates remain unchanged. This work addresses the documented initial-latency defect; it does not assume any new gate credit.

## Cause and intended behavior

Current Home awaits a D1 query for three recent public top-level posts before returning the hero, search, featured tools, guides and events. These regions use local catalog/content and do not depend on posts. This is a verified dependency, not proof that all measured TTFB is database time. Request-local authentication and background sync remain intact.

Move only recent-post loading/rendering into an async server component within a lower-page Suspense boundary. Preserve query conditions/order/limit and distinct pending, empty, failed and populated states. A stable minimum area should limit movement when data resolves; longer real content remains readable. No shared cache of user-dependent layout, artificial fast records, removed community feature or framework/vendor edits.

React Suspense documentation: https://react.dev/reference/react/Suspense . Installed React/ReactDOM19.2.6 and Vinext1.0.0-beta.5 source are authoritative for the implementation. Upstream buffering is not assumed absent.

## Fixed before/after protocol

Before changing source, use one fresh QA tab, same in-app browser/account, viewport1440×900; retain actual reported dimensions. Alternate full document loads /?diagnostics=1 and /explore?diagnostics=1 three times each (six per version). /explore is an unchanged route sharing layout/runtime. Cache/network remain uncontrolled and unthrottled. Capture the existing automatic10-second-target DOM diagnostic JSON, actual elapsed time and visibility, all samples including misses. A manual diagnostic-button interaction may finalize LCP; these are app-document lab observations, not field p75, cold-cache tests or exact server spans.

Repeat identically after deploying validated source; compare per-route medians and every sample without pooling routes. Existing budgets remain TTFB≤800ms,FCP≤1800ms,LCP≤2500ms,CLS≤0.10. Missing is unknown. A speed improvement claim needs observations; streaming dependency correctness is verified separately with controlled pending query and actual RSC output. A regression or hosting buffering requires investigation, not a declared win.

- [x] Inspect authoritative current source and installed streaming behavior; retain independent review.
- [x] Record six baseline observations before the mutation.
- [x] Run a controlled pending-query test and observe current hero blocked; implement the isolated boundary and preserve query/empty/error behavior.
- [x] Verify controlled streaming/content/filtering, all139 existing tests plus4 streaming checks, types and actual resolved layout; preserve the RED. Pending/final states are proved in Flight, but an actual browser transition capture remains unverified below.
- [x] Build/publish exact source privately with current access unchanged.
- [x] Record six after observations, inspect errors and actual UI, report measured results and limitations. Preserve evidence and unchanged gate scores unless independently proved.
- [ ] Additional evidence still unavailable: actual browser pending→resolved transition at desktop/narrow widths with controlled late data. Existing Flight tests and final-state screenshots do not prove that transition or every CLS case.

Measurement environment correction recorded during setup: the viewport capability did not affect the new QA tab. Its actual diagnostic viewport is1280×720, consistently recorded. Retain the first sample and use this actual size for every before/after run; do not describe the1440 request as observed. The first setup navigation preceded the measured reload and is not a cold-cache baseline. Browser locator waits may time out before the automatic10-second snapshot; resume the same document and read its finished snapshot rather than restarting a sample.

Published source ac64bc580e198ca8e7a3f7342752a5e28a6b097e, Sites version15, succeeded2026-09-12T13:13:28.082461Z, owner-private. Home FCP median4616→520ms; unchanged explore4560→4296ms and3/3 after loads still exceed budgets. Results and limitations: docs/audits/2026-09-12-v13-performance-verification.md. All152 gate states/weights and9 scores remain unchanged. Overall goal remains active.
