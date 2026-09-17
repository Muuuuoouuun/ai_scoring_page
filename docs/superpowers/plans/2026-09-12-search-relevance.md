# V11 Search Relevance Implementation Plan

> **For agentic workers:** Execute locally with independent read-only reviews. Root owns Site changes and publishing; reviewers own only temporary reports.

**Goal:** Correct observed natural-language omissions and exclusion inversion, and show the actual matching feature conditions.

**Architecture:** A pure catalog search module parses positive tokens and explicit exclusions, applies unchanged hard filters and scores source-backed feature/use-case matches. Existing callers retain searchCatalog; recommendation renders match evidence and exclusions.

**Tech Stack:** Existing TypeScript/React/Vinext, Node test runner; no new dependencies.

- [x] Write `tests/catalog-search.test.mjs`: compile current catalog module in the existing test style; assert long writing/prototype/task/form descriptions return appropriate candidates; exclusions remove only named targets; original hard filters/empty queries/name aliases remain valid; feature evidence keeps source conditions. Run `node --test tests/catalog-search.test.mjs` and preserve initial failures.
- [x] Implement `lib/catalog-search.ts` and adapt `lib/catalog.ts`. Tokenize normalized terms, use generic concept families, score direct name/feature/use-case evidence, parse explicit product/category/type exclusions without guessing unconfirmed capabilities. Preserve all catalog values and API fields.
- [x] Update `components/Recommend.tsx` with evidence blocks, interpreted exclusions and loading/error-safe owned filters. Update `components/Explore.tsx` to show interpreted exclusions. Reuse existing Link/ToolCard/CSS conventions.
- [x] Run frozen20-case benchmark and independent holdout; reviewers assess actual outputs and unsupported claims. Address failures with general rules, not expected-output rewrites.
- [x] Run `npx tsc --noEmit` and `node --experimental-strip-types --test tests/*.test.mjs`. Inspect desktop/mobile local UI, exclusion text, conditional/free disclosure, empty state and existing compare action.
- [x] Run literal Sites build helper, commit exact changed files, push, read full HEAD, package/save/deploy privately. Recheck production search/recommendation and worker/console errors. Preserve owner-only audience.
- [x] Write exact evidence and independent fixed-gate assessment; retain all152 criteria/weights. Keep goal active unless the entire requested state is proved.

Completed V11 2026-09-12; see `docs/audits/2026-09-12-v11-search-verification.md`. Independent worksheet arithmetic verification passed (152 criteria unchanged, only6.2.4 changed); the broader goal is active.
