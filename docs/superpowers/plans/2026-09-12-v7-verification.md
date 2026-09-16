# V7 Performance and Accessibility Verification Plan

> For agentic workers: use executing-plans. Root alone edits the Site and performs browser/Sites work; agents provide read-only evidence reviews.

**Goal:** Replace missing performance evidence with actual measurements, complete a principal-screen visual/accessibility sweep and fix demonstrated defects.
**Architecture:** Add an explicitly enabled `?diagnostics=1` first-party diagnostic panel. Use the installed Google web-vitals4.2.4 implementation for vital metrics, native observer entries for long tasks and resources, and actual DOM image/reflow/semantic counts. Metrics stay in this page and are never transmitted or stored. The panel does not load observers for ordinary visitors. Diagnostic UI is fixed out of document flow and can collapse during work.
**Tech Stack:** Existing Vinext/React/TypeScript; web-vitals4.2.4; CUA UI for observations.

- [x] Pin the already installed metrics package as a direct dependency; load it only after the explicit query opt-in.
- [x] Implement vitals callbacks without inventing missing readings, disclose iframe/visibility/viewport and late-observation limits, and report sampled resource bytes versus unavailable sizes. Show decoded image outcomes and document width for the actual application frame.
- [ ] Validate with real local and deployed UI interactions. Use representative home/search/detail/community/personal flows at desktop/mobile, including a keyboard task. Record measured numbers and conditions separately from field data or real-user percentiles.
- [x] Review official collection guidance and fixed lab budgets from the independent agent; repair implementation if observations are misleading.
- [ ] Address concrete accessibility findings and verify focus, semantics and reflow in the same matrix. Do not claim native screen-reader testing from AX text alone.
- [x] Run TypeScript, relevant API/calculation checks and build, publish the exact validated source to the existing owner-private Site, and update evidence/scoring without changing weights.

This advances existing approved performance/accessibility requirements. Contract condition history, unattended operations and actual email still remain in the overall goal; this plan does not remove them.

## V7 outcome

Implemented and privately deployed commit123de1697a5a6c40a8d7666fd08df80ffbb6c9dc. Evidence: ../../audits/2026-09-12-v7-browser-evidence.md. Representative production home/explore/my measurements and named keyboard/search/comparison/modal tasks are now recorded. Full design/reflow/200%zoom/screen-reader matrix remains open; no completed full-screen-matrix claim. Several initial load samples miss budgets and need investigation. Independent latency review identifies a narrow blocking Home D1 path, but does not establish it as the common cause of all page delays.

The dedicated comparison choices created in QA were cleared; no account records were submitted in this increment. Diagnostic query removed from the stable deliverable tab; viewport override reset. Current URL restored to production home; open-in-app request queued because the task is hidden. Browser console error query returned0.
