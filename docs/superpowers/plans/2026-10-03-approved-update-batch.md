# AIs October update batch implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development and verification-before-completion. The user approved the first batch on 2026-10-03 and requested simultaneous subagent work. File ownership below keeps concurrent edits independent. Root reviews specification compliance before code quality, integrates, commits and publishes.

**Goal:** Publish five verified information updates, clearer tool review context and robust score loading, and deterministic regression checks with a site-specific CI job.

**Architecture:** Retain the existing catalog/latestUpdate model, API and D1 schema. Place one client review component beneath the tool introduction so the summary and detailed scores share a request and filter context. Keep GitHub source work separate from the Sites source checkout; only root operates Sites tools and publishing. Preserve the existing access mode.

**Tech Stack:** TypeScript, React 19, vinext/Next 16, Cloudflare Workers/D1, Node 24 node:test, GitHub Actions, Sites.

## Task 1 — Official information updates

**Owner:** content implementer. **Files:** `site/data/catalog.json`; optionally a focused content contract test if changed metadata introduces behavior. Read the prior verified candidate report at `/Users/bigmac_moon/dev/ai_score/docs/reviews/2026-10-03-ai-update-candidates.md`.

- [ ] Recheck official sources for Gemini Skills, ChatGPT Space/Pages, Claude unified conversations, Notion team Skills and Sonnet 4.5 retirement.
- [ ] Update only the existing Gemini, ChatGPT, Claude, Notion and Claude Sonnet 5.5 catalog objects. New notices get stable IDs; changed facts in an existing notice increment its revision. Preserve all 43 IDs and the nine September 30 additions.
- [ ] Add supported/conditional features, current account/plan/device/rollout limits and source links. Set confirmation dates only for rechecked facts; never label documentation review as an executed trial. Space mobile editing and collaborative slides/sheets remain upcoming; Claude templates are not declared free; Sonnet 4.5 retirement is November 30, not already retired.
- [ ] Check JSON shape, unique IDs, source URLs, future-date handling and existing catalog/notice regressions. Do not create invented tools to represent a retirement notice.

## Task 2 — Review summary and state handling

**Owner:** UI implementer. **Files:** `site/components/ToolReviews.tsx`, `site/app/tools/[id]/page.tsx`, optional dedicated review hook/component, focused React behavior tests. Root owns shared `globals.css` unless explicit additions are supplied as a patch.

- [ ] Add meaningful tests for selected-filter loading, a late old response, retry without navigation, and zero/one/few axis responses.
- [ ] Mount the same review component directly after the tool introduction, remove the duplicate lower mount and retain `#reviews` navigation.
- [ ] Display user experience type, selected task/plan, total eligible review count, each axis response count and `latest` as review update date. Direct editorial testing stays explicitly unassessed. Do not infer distribution, latest usage date, rank or representative performance.
- [ ] Show response counts 1–4 as a small-response average and 0 as unassessed. Do not claim five responses establish statistical confidence.
- [ ] Keep filter options and entered selection available during retries, but do not display old numbers under a new selection while loading. Use request identity/cleanup to reject late results. An error retries the score request only, without `location.reload()`.
- [ ] Provide textual state announcements, named controls and readable wrapping at 320/390px and 200% zoom. Preserve review-writing and related-community links.

## Task 3 — Deterministic regression and site CI

**Owner:** test/CI implementer. **Files:** `site/tests/api.test.mjs`, `site/tests/history-api.test.mjs`, `site/tests/cost-comparison-api.test.mjs`, `.github/workflows/site-ci.yml`, optional narrowly scoped test-clock helper.

- [ ] Reproduce the documented 12 failures. Fix scenario clocks explicitly using existing `harness(undefined,{now:()=>"2026-09-15T12:00:00.000Z"})` where September/October fixtures require it. Preserve explicit date-specific cases and real production validation. Do not globally change the harness's default or hide failing assertions.
- [ ] Run the three changed files under the normal command and under externally shifted clocks to show stable outcomes.
- [ ] Add a read-only-permission GitHub Actions job, Node 24 pinned, npm cache using `site/package-lock.json`, `working-directory: site`, lockfile installation, TypeScript, all node:test regressions, separate React-server streaming check and actual vinext build.
- [ ] Trigger checks for pull requests and pushes to main and codex branches with `site/**` or workflow changes. Avoid assuming root npm test validates the deployed app. Name the site check uniquely.

## Task 4 — Root integration and first-release status cards

**Files:** `site/app/page.tsx`, `site/app/news/page.tsx`, `site/components/ToolUI.tsx` only if needed, `site/app/globals.css`; release documentation.

- [ ] Add concise confirmation date and actual `latestUpdate.rollout`/audience status to update previews without inventing a beta state. Keep information-first home and existing event phase handling.
- [ ] Review each delegated task against approved scope, then request independent code-quality review. Correct important issues before release.
- [ ] Run standard full regression, streaming test, TypeScript and the build from the exact integrated candidate. Validate tool detail loading/filter/retry and home/news cards at desktop, 320/390px and 200% where feasible, capturing temporary QA evidence outside committed source.
- [ ] Commit approved changes on `codex/ais-october-update`, push the review branch and create a draft PR based on `codex.09bigmac`. The old main/integration PR remains a separate migration decision.

## Task 5 — Root publication and handoff

- [ ] Open the existing Sites project through the official workflow into its own source checkout; preserve the v24 restoration candidate, audience and binding manifest. Copy the reviewed `site/` tree into that checkout with generated/dependency output excluded.
- [ ] Confirm equal source trees, perform necessary checks/build through site-workflow, save the returned pushed commit/archive and deploy that saved version. Record GitHub commit/tree, Sites commit/tree, version, deployment ID and success URL.
- [ ] Verify deployment reaches succeeded. Report completed content/UI/CI, test counts and actual new version; preserve review worktree and original uncommitted documents. Branch-protection settings and recurring scheduling are separate operational steps and are not silently changed.

## Release boundaries

No new D1 migrations, global score/rank, feature hub, three-step composer, scheduling, provider purchase, email setup, access-policy change or wholesale PR #2 merge. The approval covers the first batch and publication after checks. Existing failing tests are a diagnosed baseline issue the user approved fixing.
