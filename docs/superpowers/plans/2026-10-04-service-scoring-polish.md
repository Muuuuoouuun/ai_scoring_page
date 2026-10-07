# Service and scoring clarity implementation plan

> **For agentic workers:** Use the existing September 30 scoring experience design as context; implement the bounded tasks below with independent ownership and review before handoff.

**Goal:** Help a public visitor explain a service's use, a condition to check, and the meaning and sample behind its user scores.

**Architecture:** Extend the current score API without a schema migration; keep latest public review per account/tool, then filter. Following the user's layout refinement, render a prominent direct-assessment tier state, all five visible user sub scores, official feature overview and visible review cards from the same sample. Keep distributions and methodology expandable. Reorganize existing official catalog fields on service detail and compare pages without adding vendor claims or unsupported feature equivalence.

**Tech stack:** React 19, TypeScript, Vinext, D1, Node test runner, existing CSS tokens.

**Baseline:** `32595b0` / v25 source. Preserve its request revision gating, per-section retry, official content updates and scenario-specific test clocks. The original checkout remains untouched.

- [x] Scoring API: add valid scored-review count, five-bin per-axis distributions, sample use-date range and newest five included reviews. Skip malformed or invalid ratings, retain `sample` and `latest` semantics. Test genuine zero/missing ratings, invalid values, distribution counts, dedup-before-filter, hidden/deleted exclusions and date/source linkage using the real SQLite harness.
- [x] Score UI: retain request guards and filter choices; show all five sub scores directly below the tier, with expandable descriptions and textual distribution counts. The catalog has no vetted tier results, so direct assessment remains explicitly unassessed. Distinguish review totals, scored reviews, use dates and update dates. Empty scores show no numerical tracks. Preserve a related-community link; included-review cards identify exact aggregate sources.
- [x] Service information: group existing purposes, pricing, platforms, Korean and checked-at provenance. Keep original descriptions, every condition/source and one review mount. Make long feature rows readable on narrow screens. Add direct paired compare links to existing related choices.
- [x] Compare: desktop common-field table; mobile criterion-first groups with repeated service names. Show individual official features in independent expandable sections. One selected service remains visible with a way to add a second. Preserve maximum three tools and saved comparisons.
- [x] Explainability: update `/about` with five-axis interpretation, averaging/dedup/filter/distribution semantics and limits. Write a third-party review distinguishing code/screenshot observations from user-research hypotheses and content freshness.
- [x] Verification: run site typecheck, complete regression tests, server streaming checks, targeted lint and production build. Inspect desktop, 390px and 320px detail/compare; test filters, retry/late-response behavior, disclosure and direct compare flow. Run independent review and fix material findings.

The scope excludes deployed changes, new vendor facts, universal performance rankings, inferred feature matching, rewritten historical rating standards and new review-submission contracts. Those remain separate decisions in the existing design.

Validation completed: site regression 325/325; React-server streaming 4/4; TypeScript and targeted lint passed; desktop/390px/320px browser flow verified. Review evidence and remaining research limits are saved at `/tmp/ai-score-review-2026-10-04/review.md`. Local preview uses this worktree; no deployment was performed.

User-requested layout refinement completed on October 4: tier → five sub scores → feature overview → user reviews. A single review component shares the request/filter state across these sections and renders server-provided official information between score and review sections. Recent included reviews now carry public nickname, at most 180 code points of original text, and maker/sponsor disclosures. Desktop uses two-column cards; mobile uses one column. Original source links, use/update dates, partial ratings, zero/error states, and all existing feature evidence remain available. Feature links reveal the native disclosure on initial hash navigation, repeated activation, and keyboard activation.

Final refinement validation: regression 330/330, TypeScript, scoped ESLint, production build and diff checks passed. In-app browser checks covered desktop, 390px, 320px, no horizontal overflow, filters updating scores and cards together, original-review navigation, direct/repeated/keyboard feature links, six 44px source controls, and no console errors or warnings. Four explicitly labeled synthetic local review fixtures were removed after validation; the local scores API again returned zero reviews. Screenshots at `/tmp/ais-tier-layout-2026-10-04/` distinguish synthetic populated-card QA from the live empty state. Real tiers still require vetted direct-evaluation data; no new score-to-tier policy was invented.
