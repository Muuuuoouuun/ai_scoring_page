# AIs V4 auditable provisional scoring worksheet

Prepared 2026-09-12 for source `8b8611b95c9461082638f455177b3a5fe9b7cea9`, deployed at https://ais-discovery-hub.aaahaaah19.chatgpt.site. Read-only independent criteria review; no source/Git/Sites/browser changes. This is AI QA based on the evidence below, not a user-research score or external certification.

## Outcome

| Area | Verified earned points / 100 | ≥88? |
|---|---:|---|
| 정체성·기획 일치 | 80.00 | No |
| 내용·최신성 | 82.50 | No |
| 디자인 | 81.25 | No |
| 사용성 | 95.00 | Yes |
| 쾌적성·접근성 | 62.50 | No |
| 유용성 | 80.00 | No |
| 커뮤니티 | 93.75 | Yes |
| 개인 기능 | 75.00 | No |
| 배포·운영 | 87.50 | No |

**Overall: incomplete.** Two areas currently meet the numeric threshold; seven do not. Do not average the areas or round 87.50 up to 88. Explicit unimplemented requirements independently block completion even if every number later reaches 88.

The comfort/accessibility score includes **0/25 earned for measured rendering performance** because no timing/stability/interaction measurements were supplied. That is missing evidence, not a finding that performance is slow. Other unknowns likewise earn no points without asserting that the implementation is broken.

## Locked method

The nine areas and each subcategory's maximum come directly from `docs/2026-09-12-site-build-requirements.md:29–37`. The existing rubric does not specify atomic weights. This worksheet makes that choice explicit and uniform: **four stated binary gates per subcategory, each worth exactly one quarter of that subcategory's fixed weight**. There are 38 subcategories and 152 gates. A gate is PASS, UNVERIFIED or GAP; only PASS earns points. There is no partial credit, reassignment of failed-gate points, or inherited prior score.

This is a transparent evaluator convention, not a claim that the original specification supplied these 152 weights. Gate definitions should be retained for subsequent checks; change weights only by publishing a reasoned new worksheet version, not to meet a target. The threshold is applied after sums are calculated. Qualitative design gates include observable implementation properties and leave full rendered critique unearned where absent. Passing an implementation gate does not substitute for a separate browser-task gate.

Current gate counts: 125 PASS, 21 UNVERIFIED, 6 GAP. Current cap: **none demonstrated by the supplied current evidence**. The previously found data-edit defects were repaired and independently rechecked. This does not certify absence of all security flaws.

Exact cap rule (`site-build-requirements.md:25`): a major security/privacy defect, broken core flow, or failed deployment caps each affected area at **60**, even if its earned sum is higher. Apply it when a current trigger is demonstrated, state which areas are affected, and compute `min(earned sum,60)`. Missing/unverified features do not automatically trigger an unrelated/global 60 cap; they earn zero and explicit omissions still block completion under `:53`.

## Evidence register

All repository paths below are relative to `/Users/bigmac_moon/dev/ai_score`.

- **Q:** `docs/2026-09-12-site-quality-review.md`, particularly :13–22 (implemented improvements), :26–34 (observed checks) and :47–50 (outstanding requirements/evidence). These are root's recorded observations, accepted provisionally; this reviewer did not rerun the browser. Q:7 and :46 still say V4 deployment is pending, but the later V4a message below supersedes that stale status.
- **T:** Fresh reviewer run of `node --test tests/api.test.mjs tests/billing.test.mjs` in `site/`: **35 tests, 35 passed, 0 failed**. Relevant sources: `site/tests/api.test.mjs:26–86` and `site/tests/billing.test.mjs:6–100`. This is in-memory DB/route arithmetic evidence, not a substitute for real authentication/provider/browser behavior.
- **V4a:** Root's latest dispatch reports successful V4 deployment of the source above and observed production global guide search plus account comparison save. Accepted as reported production evidence; no direct reviewer browser reproduction.
- **V4b:** Root's subsequent observed production report: comparison save → My/Saved → reason/outcome edit → save → full reload preserved fields. Delete dialog Tab from final Cancel cycles to Close, Shift+Tab from Close cycles to Cancel, Escape closes/restores the originating delete control, and data remains present. Representative desktop DOM clientWidth/scrollWidth both 1440. These observations are confined to the stated flow/screen.
- **OQ:** `docs/audits/2026-09-12-quality-before-v4.md`. Only its concrete observations (local review/edit/reply, contrast/overflow, actual first-three-source sync, navigation fix and environment checks) are used. **Its numeric scores are not used.** Prior flow evidence is retained only where the reviewed core remains applicable; new V4 functionality needs new evidence.
- **SA:** `docs/audits/2026-09-12-source-audit.md`: independent official verification of the three models, sampled ChatGPT release correction and ordinary official-source/feed HTTP results. It explicitly does not establish a complete audit of every feature/claim across all 20 entries.
- **SF:** `docs/audits/2026-09-12-source-followup.md`: reproducible source-recovery defect and verified official feed schema; repaired source-recovery tests in T and Q:21 are the current evidence.
- **C1:** Current inspected `site/app/page.tsx:6`, `site/components/Shell.tsx:7–10`, `site/app/layout.tsx:23–27`: application identity, home/navigation and auth-independent root layout.
- **C2:** Current inspected `site/data/catalog.json`, `site/data/guides.json`, `site/lib/catalog.ts`, `site/lib/content.ts`, `site/components/ToolUI.tsx`, `ToolReviews.tsx`, `Explore.tsx`, `Recommend.tsx`, `GlobalSearch.tsx`, `site/app/api/search/route.ts:8–26`, and detail/news/guide/compare pages. Code proves rendered intent/structured behavior, not every visual or empirical content-quality claim.
- **C3:** Current inspected `site/lib/validation.ts`, `billing.ts`, `notifications.ts`, `site/app/api/workspace/route.ts`, contribution/notification/operations routes, and `RecordForm.tsx`, `MyWorkspace.tsx`, `Preferences.tsx`, `Community.tsx`, `CancellationHelp.tsx`, `Modal.tsx`; `site/app/privacy/page.tsx:1`, `about/page.tsx:2`, and `site/db/schema.ts`.
- **C4:** Current inspected `site/app/globals.css:3–15`: theme, typography, layout, breakpoints, focus, reduced motion and native-dialog rules. Static CSS is not proof of complete visual rendering or runtime performance.
- **V/B/A:** Specifications `docs/2026-09-12-product-plan-v0.6.md`, `docs/superpowers/specs/2026-09-11-subscription-optimization-design.md`, and `2026-09-11-cancellation-promotion-alerts-design.md`. These define scope; their existence does not establish implementation.

## Atomic worksheet

Each row has a stable ID. PASS earns the shown gate weight; UNVERIFIED and GAP earn 0. Keep these IDs and definitions when attaching further evidence.

### 1. 정체성·기획 일치 — 80.00/100

**정보 중심: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 1.1.1 | Service copy leads with AI/SaaS discovery and learning. | PASS | 6.25 | C1; Q:9 |
| 1.1.2 | The root route remains information-first after authentication. | PASS | 6.25 | C1; Q:9 |
| 1.1.3 | The discovery home itself exposes current changes, tools, learning and people/event discovery. | GAP | 0 | C1: home has updates/tools/guides but no people or event section; V:67–74 |
| 1.1.4 | Personal management is opt-in from a separate route. | PASS | 6.25 | C1 |

**전체 범위: 26.25/35; each gate 8.75 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 1.2.1 | Tool discovery/detail/comparison has a usable public path. | PASS | 8.75 | T; V4a |
| 1.2.2 | Guide/news/event routes exist with substantive content. | PASS | 8.75 | C2; Q:13,22,27 |
| 1.2.3 | Public contributions and moderation have a working path. | PASS | 8.75 | Q:28; T |
| 1.2.4 | The retained private/operational minimum, including email, is implemented. | GAP | 0 | Q:47–49; retained reconciliation/history/timing/feedback gaps |

**비회원 가치: 15.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 1.3.1 | Application-level public reading/search works without personal records. | PASS | 5 | T; Q:27 |
| 1.3.2 | Application-level comparison works without account persistence. | PASS | 5 | C2; local public route checks |
| 1.3.3 | General cancellation information is public at application level. | PASS | 5 | Q:15,30; C3 |
| 1.3.4 | An external anonymous visitor completes a deployed public-information task. | UNVERIFIED | 0 | Hosting remains owner-only; no anonymous external-visitor observation |

**개인 영역 분리: 20.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 1.4.1 | My Workspace has a separate entry and authenticated content boundary. | PASS | 5 | C1; C3 |
| 1.4.2 | Private records are excluded from public search. | PASS | 5 | T: global search/private-record test |
| 1.4.3 | Public contribution requires an explicit public-content choice. | PASS | 5 | C3; community form |
| 1.4.4 | Private/public data meanings are explained in the product. | PASS | 5 | C3: privacy/about; Q:14 |

### 2. 내용·최신성 — 82.50/100

**공식 출처: 22.50/30; each gate 7.5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 2.1.1 | Catalog/content include relevant official source URLs. | PASS | 7.5 | C2; SA |
| 2.1.2 | Model identities and principal specification claims have independent official verification. | PASS | 7.5 | SA: all three models |
| 2.1.3 | A sampled current product change has independent official verification and correction. | PASS | 7.5 | SA: ChatGPT September 11; Q:21 |
| 2.1.4 | Remaining catalog claim/source pairs have a complete current audit trail. | UNVERIFIED | 0 | SA expressly bounded to models/ChatGPT; no full claim-by-claim artifact for all entries |

**실제 로고: 11.25/15; each gate 3.75 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 2.2.1 | Named tools use actual logo asset files rather than invented initial avatars. | PASS | 3.75 | C2: public/logos and ToolLogo |
| 2.2.2 | Logo origin links are retained alongside catalog entries. | PASS | 3.75 | C2: logoSource; source page |
| 2.2.3 | Representative rendered logos load without failures. | PASS | 3.75 | Q:33; OQ: mobile image loading checks |
| 2.2.4 | All current deployed logo assets have individually verified provenance/render outcomes. | UNVERIFIED | 0 | No complete current per-logo record; representative success does not prove all |

**기능/업데이트: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 2.3.1 | Tool details show structured supported/conditional/unknown functions. | PASS | 6.25 | C2 |
| 2.3.2 | Curated updates state a concrete change and link its source. | PASS | 6.25 | C2; SA; Q:21 |
| 2.3.3 | Feed ingestion has defined product scope and retained-error/review behavior. | PASS | 6.25 | SA/SF; T; Q:21 |
| 2.3.4 | V4's new live feed path is observed end-to-end on the deployment. | UNVERIFIED | 0 | Existing real sync evidence predates the new feed configuration |

**불확실성·날짜: 20.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 2.4.1 | Source check dates are separate from publication dates. | PASS | 5 | C2; Q:21 |
| 2.4.2 | Absent publication dates, plans or support remain explicitly unknown. | PASS | 5 | C2; about/detail |
| 2.4.3 | Changed/failed source state is not silently promoted to verified fact. | PASS | 5 | T: source recovery regressions; SF correction |
| 2.4.4 | Past opportunities are marked ended and unchecked conditions remain conditional. | PASS | 5 | C2; event/promotion date logic |

**모델/앱 구분: 10.00/10; each gate 2.5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 2.5.1 | Data model distinguishes model, AI app and SaaS. | PASS | 2.5 | C2: catalog types |
| 2.5.2 | Visible labels expose the distinction. | PASS | 2.5 | C2: ToolUI/detail |
| 2.5.3 | Model identities are independently confirmed against official specifications. | PASS | 2.5 | SA |
| 2.5.4 | User app experience is not represented as a model benchmark. | PASS | 2.5 | C3: about; ToolReviews |

### 3. 디자인 — 81.25/100

**성숙한 테마: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 3.1.1 | Shared palette and surface tokens establish a restrained theme. | PASS | 6.25 | C4: CSS variables |
| 3.1.2 | Shared Korean typography and heading scale are defined. | PASS | 6.25 | C4 |
| 3.1.3 | Brand/copy/layout are adapted to AIs rather than represented as copied references. | PASS | 6.25 | Q:9; C1 |
| 3.1.4 | The complete rendered V4 theme has a documented visual critique. | UNVERIFIED | 0 | No complete current screenshot-based visual assessment supplied |

**정보 계층: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 3.2.1 | Pages use consistent title/summary/section hierarchy. | PASS | 6.25 | C1/C2/C3 |
| 3.2.2 | Principal actions are visually distinguished from secondary actions. | PASS | 6.25 | C4: shared button treatments; source components |
| 3.2.3 | Dense tool/billing data are grouped into tables, sections and disclosures. | PASS | 6.25 | C2/C3 |
| 3.2.4 | Current desktop/mobile information hierarchy is visually checked across every principal screen. | UNVERIFIED | 0 | Q:50 remains open; representative task observations are narrower |

**밀도/여백: 25.00/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 3.3.1 | Reading widths, line heights and spacing rules constrain text density. | PASS | 6.25 | C4 |
| 3.3.2 | Representative 390px detail/modal screens have no horizontal overflow. | PASS | 6.25 | Q:33 |
| 3.3.3 | Mobile controls use explicit readable input sizes and adequate target dimensions. | PASS | 6.25 | C4: mobile font/target rules |
| 3.3.4 | Representative desktop private screen fits a 1440px viewport. | PASS | 6.25 | V4b: clientWidth/scrollWidth both 1440; limited to observed screen |

**전 화면 일관성: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 3.4.1 | Public pages share shell and navigation components. | PASS | 6.25 | C1 |
| 3.4.2 | Personal forms/dialogs share styling and interaction primitives. | PASS | 6.25 | C3/C4 |
| 3.4.3 | Responsive styles and state labels are reused across views. | PASS | 6.25 | C3/C4 |
| 3.4.4 | New guide/search/admin/expanded-billing screens have a complete cross-screen visual comparison. | UNVERIFIED | 0 | Q:50; no complete current visual comparison artifact |

### 4. 사용성 — 95.00/100

**주요 과제: 40.00/40; each gate 10 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 4.1.1 | Public search leads to a useful content result on the deployment. | PASS | 10 | V4a: guide search |
| 4.1.2 | Personal billing/refund/cancellation tasks work in representative local UI. | PASS | 10 | Q:31–32 |
| 4.1.3 | Author/report/moderation actions work in deployed UI. | PASS | 10 | Q:28 |
| 4.1.4 | V4 comparison save, private edit and full reload work in deployed UI. | PASS | 10 | V4b |

**탐색/검색: 20.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 4.2.1 | Five primary destinations and contextual links are available. | PASS | 5 | C1; Q:9,33 |
| 4.2.2 | Global search spans existing public content types. | PASS | 5 | T; V4a |
| 4.2.3 | Specialized tool filters and no-results preserve declared scope. | PASS | 5 | C2: Explore/searchCatalog; code inspection |
| 4.2.4 | Search result types and active state are visible and adjustable. | PASS | 5 | C2: GlobalSearch; V4a |

**상태/복구: 15.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 4.3.1 | Save operations expose pending/success/failure state and do not treat failed HTTP as saved. | PASS | 5 | C3; Q:29; API helper |
| 4.3.2 | Failed reads/searches expose a retry path. | PASS | 5 | C2/C3 |
| 4.3.3 | Guest draft→authentication→restore and network interruption are observed end-to-end in the current UI. | UNVERIFIED | 0 | Draft code exists, but no complete current browser recovery observation |
| 4.3.4 | Missing resources, invalid input and forbidden writes have explicit error paths. | PASS | 5 | T; Q:27 |

**키보드/폼: 20.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 4.4.1 | Forms use labelled native controls and bounded inputs. | PASS | 5 | C3 |
| 4.4.2 | A skip link and visible keyboard focus styling exist. | PASS | 5 | C1/C4 |
| 4.4.3 | A completed save restores focus to the originating control. | PASS | 5 | Q:31 |
| 4.4.4 | V4 delete dialog cycles Tab/Shift+Tab, closes with Escape, restores focus and preserves data on cancel. | PASS | 5 | V4b |

### 5. 쾌적성·접근성 — 62.50/100

**반응형: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 5.1.1 | Representative public 390px detail/search screens fit and operate. | PASS | 6.25 | Q:30,33 |
| 5.1.2 | Representative new private 390px billing/refund forms fit and operate. | PASS | 6.25 | Q:31–32 |
| 5.1.3 | Representative desktop 1440px private screen has matching viewport/document width. | PASS | 6.25 | V4b |
| 5.1.4 | Zoom/reflow and the complete screen matrix are measured. | UNVERIFIED | 0 | No 200% zoom/reflow or complete viewport sweep evidence |

**읽기/대비: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 5.2.1 | Measured primary text/button contrast meets the documented thresholds. | PASS | 6.25 | Q:33; OQ contrasts |
| 5.2.2 | Korean font sizing and line height, including mobile inputs, are explicit. | PASS | 6.25 | C4 |
| 5.2.3 | Support/uncertainty/error meaning is expressed in text, not color alone. | PASS | 6.25 | C2/C3 |
| 5.2.4 | Screen-reader reading order, descriptions and status announcements have an observed run. | UNVERIFIED | 0 | No screen-reader run supplied |

**렌더 성능: 0.00/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 5.3.1 | Representative load/render timing is measured with method and environment. | UNVERIFIED | 0 | Root: Performance API unavailable; no substitute measurement supplied |
| 5.3.2 | Interaction responsiveness is measured on a principal task. | UNVERIFIED | 0 | No INP/lab interaction timing evidence |
| 5.3.3 | Layout stability is measured during initial/async rendering. | UNVERIFIED | 0 | No CLS or equivalent observed stability measurement |
| 5.3.4 | Resource/long-task costs are measured under a stated budget. | UNVERIFIED | 0 | No measured resource/long-task budget evidence |

**오류/안정성: 25.00/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 5.4.1 | Current complete build/type validation is reported successful. | PASS | 6.25 | Q:26; V4 source/deploy evidence |
| 5.4.2 | API/calculation suite passes freshly. | PASS | 6.25 | T: 35/35 |
| 5.4.3 | Observed navigation and deployed author flows no longer exhibit the prior link error. | PASS | 6.25 | Q:28–29,33 |
| 5.4.4 | Source failure recovery and critical data-edit regressions have passing checks. | PASS | 6.25 | T; independent fix review |

### 6. 유용성 — 80.00/100

**상세/비교: 22.50/30; each gate 7.5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 6.1.1 | Details explain use, constraints, environment and source-backed functions. | PASS | 7.5 | C2 |
| 6.1.2 | Side-by-side comparison exposes relevant differences and source links. | PASS | 7.5 | C2; V4a comparison screen/save |
| 6.1.3 | Unassessed editorial evidence is distinguished from available user evidence. | PASS | 7.5 | C2/C3 |
| 6.1.4 | A representative person/task demonstrates choosing between candidates from the comparison evidence. | UNVERIFIED | 0 | No observed comparison-understanding task; saving is not understanding |

**검색/추천: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 6.2.1 | Anonymous application-level query retrieves relevant available content. | PASS | 6.25 | T; V4a |
| 6.2.2 | Explicit required conditions do not treat unknown as supported. | PASS | 6.25 | C2 |
| 6.2.3 | Recommendations state work/function reasons rather than invented fitness percentages. | PASS | 6.25 | C2: Recommend/about |
| 6.2.4 | A varied set of realistic purpose/condition queries has evaluated relevance. | UNVERIFIED | 0 | Current tests emphasize exact titles/selected tasks, not broad relevance evaluation |

**콘텐츠/활용법: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 6.3.1 | Guides include concrete practice inputs and prerequisites. | PASS | 6.25 | C2; Q:22 |
| 6.3.2 | Guides explain steps, output checks and likely failure recovery. | PASS | 6.25 | C2; Q:22 |
| 6.3.3 | Guides link official sources and label direct-execution status honestly. | PASS | 6.25 | C2; Q:22 |
| 6.3.4 | A complete representative guide is reproduced and its result checked. | UNVERIFIED | 0 | Direct execution results are explicitly unregistered |

**조건/근거: 20.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 6.4.1 | Update meaning/affected conditions and source dates are available. | PASS | 5 | C2; SA |
| 6.4.2 | Events/promotions expose audience, time and eligibility conditions. | PASS | 5 | C2 |
| 6.4.3 | Cost comparison distinguishes cheaper price from prepayment feasibility. | PASS | 5 | T; Q:19 |
| 6.4.4 | Unknown conditions and source failures are visible rather than silently assumed satisfied. | PASS | 5 | C2/C3; T |

### 7. 커뮤니티 — 93.75/100

**평가/후기/제안: 30.00/30; each gate 7.5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 7.1.1 | Reviews require work, plan, use date and relationship disclosure. | PASS | 7.5 | C3; T |
| 7.1.2 | Rating aggregation deduplicates latest account/tool reviews and excludes missing axes. | PASS | 7.5 | T |
| 7.1.3 | Feature proposals remain distinguishable from verified official facts. | PASS | 7.5 | C3 |
| 7.1.4 | Review author/edit/reply behavior has representative UI evidence. | PASS | 7.5 | OQ: local review/edit/reply; unchanged core retained and API checks current |

**질문/답변: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 7.2.1 | Question submission exists without a personal tool/subscription prerequisite. | PASS | 6.25 | C3: postSchema/community form/route |
| 7.2.2 | A reply links to the published parent with server validation. | PASS | 6.25 | T; C3 |
| 7.2.3 | Threads expose answers and author controls. | PASS | 6.25 | C3; OQ local reply task |
| 7.2.4 | A deleted/hidden parent with other authors' replies has an observed readable UI task. | UNVERIFIED | 0 | Database preservation test passes, but no corresponding browser reading observation |

**영속성/소유권: 25.00/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 7.3.1 | Server account identity governs contribution mutation. | PASS | 6.25 | T |
| 7.3.2 | Other-account edit/delete attempts are rejected. | PASS | 6.25 | T |
| 7.3.3 | Deployed author edits survive a new read and deletion is observed. | PASS | 6.25 | Q:28 |
| 7.3.4 | Account deletion removes own content/ratings while preserving other users' reply data. | PASS | 6.25 | T |

**신고/표시: 20.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 7.4.1 | A deployed report is accepted. | PASS | 5 | Q:28 |
| 7.4.2 | Moderation requires the configured administrator. | PASS | 5 | T; Q:28–29 |
| 7.4.3 | Hide, nonvisibility, restore and resolve work in deployed UI. | PASS | 5 | Q:28 |
| 7.4.4 | Relationship, proposal and experience/official-fact distinctions are visible. | PASS | 5 | C3 |

### 8. 개인 기능 — 75.00/100

**로그인/계정격리: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 8.1.1 | Real Sites account identity is observed in the deployment. | PASS | 6.25 | Q:29 |
| 8.1.2 | Read/update/delete/export scope is account-isolated in API tests. | PASS | 6.25 | T |
| 8.1.3 | Forged identity and cross-origin writes are rejected in recorded checks. | PASS | 6.25 | T; Q:27 |
| 8.1.4 | Cross-device/account isolation is observed with independent real production sessions. | UNVERIFIED | 0 | No independent second-account/device observation supplied |

**도구/저장/모음: 20.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 8.2.1 | Tool quick-save persists without overwriting existing private notes/status. | PASS | 5 | T; Q:29 |
| 8.2.2 | Custom tool and collection CRUD paths use owned server records. | PASS | 5 | C3; API ownership structure |
| 8.2.3 | Selected comparison is saved into the account. | PASS | 5 | V4a/V4b; T |
| 8.2.4 | Private reason/outcome edits survive a full production reload. | PASS | 5 | V4b |

**비용/절약: 18.75/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 8.3.1 | Fixed billing, currencies, bundle dedupe and period boundaries pass checks. | PASS | 6.25 | T |
| 8.3.2 | Missing dates, new prices, seats/tax, usage budgets and refund dates pass focused checks. | PASS | 6.25 | T; Q:17–18,31–32 |
| 8.3.3 | Savings applies known features/duration/prepayment and labels uncertainty. | PASS | 6.25 | T; Q:19 |
| 8.3.4 | Retained reconciliation/custom-period/history/transition-cost comparison cases are implemented. | GAP | 0 | Q:49; B retained scope |

**해지/알림: 10.00/20; each gate 5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 8.4.1 | Public payment-path help and residual-obligation behavior are observed. | PASS | 5 | Q:30–31; T |
| 8.4.2 | App notice matching/dedupe and email eligibility/consent guards are implemented/tested. | PASS | 5 | T; C3 |
| 8.4.3 | Customer-facing topic hide/not-interested and offered notification timing are complete. | GAP | 0 | Q:48–49; hiddenTopics schema alone is not a user flow |
| 8.4.4 | Consented actual email delivery and unattended processing operate. | GAP | 0 | Q:47–48 |

**내보내기/삭제: 7.50/10; each gate 2.5 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 8.5.1 | Export includes owned records, contributions and new saved fields. | PASS | 2.5 | T |
| 8.5.2 | Deletion rejects wrong confirmation and removes owned private data. | PASS | 2.5 | T |
| 8.5.3 | Deletion preserves other users' reply data and removes own rating identity. | PASS | 2.5 | T |
| 8.5.4 | Complete deployed export/download verification and full-account destructive flow are observed. | UNVERIFIED | 0 | Production author-post deletion is not full-account export/delete |

### 9. 배포·운영 — 87.50/100

**실제 배포: 25.00/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 9.1.1 | V4 deployment success is reported for the exact source ID. | PASS | 6.25 | V4a |
| 9.1.2 | The real site URL serves the new application. | PASS | 6.25 | V4a/V4b |
| 9.1.3 | Hosting access scope and operator identity are explicitly checked. | PASS | 6.25 | Q:6,29; owner-only preview |
| 9.1.4 | Build source/runtime setup and secret separation are documented and checked. | PASS | 6.25 | Q:26; OQ environment/security notes; C3 runtime config |

**배포 후 핵심동작: 25.00/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 9.2.1 | Public navigation/search works on the deployed build. | PASS | 6.25 | V4a; Q:33 |
| 9.2.2 | Owned tool save/reload works in real deployment. | PASS | 6.25 | Q:29 |
| 9.2.3 | Deployed contribution/moderation/delete flow works. | PASS | 6.25 | Q:28 |
| 9.2.4 | New comparison/private-edit/full-reload flow works on V4. | PASS | 6.25 | V4b |

**데이터 영속성: 25.00/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 9.3.1 | D1 schema/owned storage implementation is connected rather than local-only. | PASS | 6.25 | C3; Q:29 |
| 9.3.2 | Real private tool records survive reload. | PASS | 6.25 | Q:29 |
| 9.3.3 | Real public contributions survive write/edit/new-read. | PASS | 6.25 | Q:28 |
| 9.3.4 | New nested private saved fields survive a full V4 reload. | PASS | 6.25 | V4b |

**동기화/운영상태: 12.50/25; each gate 6.25 points.**

| ID | Gate | Status | Earned | Evidence / precise remaining limitation |
|---|---|---|---:|---|
| 9.4.1 | A real source-sync run and partial-failure state have been recorded. | PASS | 6.25 | OQ: deployed first-three source check; SA |
| 9.4.2 | Authorized operations exposes moderation, sync and delivery-state data. | PASS | 6.25 | C3; Q:28–29 |
| 9.4.3 | New feed scopes are observed through the deployed sync→display path. | UNVERIFIED | 0 | New parsing/filter logic has no supplied deployed end-to-end run |
| 9.4.4 | Required unattended/email operations and operating feedback/cadence are complete. | GAP | 0 | Q:47–49; V:198,231–233 |

## Actual omissions and unknowns are different

**Actual missing behavior that remains in the retained scope:** real consented email/provider receipt; functioning offered unattended delivery/timing; customer-facing hide/not-interested topic controls; planned-versus-confirmed payment linkage/reconciliation; custom billing periods/nonstandard cadence, condition history and transition-cost/refund-aware comparisons; public operations ownership/cadence and separate optional information-versus-personal benefit feedback. See Q:47–49, V:154–156/198/231–233, B:23/36/53/65/86/126/142 and A:82/88/94/110. The home also lacks its own people/event discovery section (C1 versus V:67–74); navigation alone is not that home section. They must not be relabelled complete because adjacent functions work.

**Unknown/unobserved quality evidence:** complete current screen consistency, zoom/reflow and screen-reader behavior, measured rendering performance, varied-purpose search relevance, explicit comparison-understanding/guide-reproduction tasks, new feed processing on the deployment, real independent account/device integration, and complete deployed export/account deletion. A documented AI/criterion-based task can satisfy appropriate understanding/reproduction QA; no minimum amount of human research or positive responses is invented here. Do not claim actual customer learning/savings from the resulting QA score.

**Deliberately not treated as mandatory launch omissions:** bank/card integration, automatic cancellation/payment/refund execution, whole-market real-time promotion/news ingestion, universal automatic tax/FX/proration engines, global multi-subscription optimization, push/SMS, and future external renewal/deadline re-alerts. Manual known values plus explicit unknowns are permissible. Optional FX conversion is not mandatory merely because settlement metadata exists. About six evaluated tools/guides and fixed daily email-count defaults were proposed quantities, not a reason to invent scores/content. Zero real-user feedback data and no editorial direct assessments are acceptable when labelled honestly; missing implemented feedback collection/display and missing evidence for claimed guide utility are separate questions.

**Hosting interpretation:** owner-only Sites deployment is a successful preview with known access restrictions, not an anonymous public launch. Application guest endpoints can earn application-level gates; they do not prove that an external anonymous visitor can access the deployed owner-only site. This worksheet does not change hosting visibility or infer authorization to expand it.

## Next revision rules

Attach new observations to gate IDs and flip only gates the new evidence actually satisfies. Do not alter the weights to make 87.50 become 88.00, count provider acceptance as receipt, count click/save as understanding, or treat a mock email as actual delivery. Keep outstanding explicit requirements separate from numeric totals. If a new critical defect appears, apply the 60 cap to affected areas even if previously earned gates remain recorded.

Machine-readable gate weights/statuses are retained in the companion `/private/tmp/ais-score-worksheet-v4.json` so arithmetic can be independently recomputed. No completion claim is made by this worksheet.



Final bounded evidence addendum: root subsequently confirmed the temporary production comparison was deleted and saved count returned to zero; the latest 20-minute worker-error window contained zero events. These corroborate already credited persistence/deletion/stability gates and change no points. A clean bounded log window does not establish rendering performance or unattended email delivery.
