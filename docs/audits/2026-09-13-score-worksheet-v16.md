# AIs 고정 점수표 — V16 / 2026-09-13

소스 `2d54809d51bc2cacd096bd403e187afadcda078a` · Sites18 · owner-private 배포 성공. 고정152게이트/38그룹/9영역의 원문과 가중치를 유지한다. 두 실제 UI 관찰 게이트만 PASS로 변경했다.

[상세 검증](2026-09-13-v16-community-verification.md) · [전체 JSON](2026-09-13-score-worksheet-v16.json) · [독립 평가](v16-ui-recovery/ais-v16-gate-assessment.md)

| 영역 | 점수 | 88점 이상 |
|---|---:|:---:|
| 정체성·기획 일치 | 86.25 | 아니오 |
| 내용·최신성 | 100 | 예 |
| 디자인 | 93.75 | 예 |
| 사용성 | 100 | 예 |
| 쾌적성·접근성 | 87.5 | 아니오 |
| 유용성 | 86.25 | 아니오 |
| 커뮤니티 | 100 | 예 |
| 개인 기능 | 81.25 | 아니오 |
| 배포·운영 | 93.75 | 예 |

PASS140 / GAP4 / UNVERIFIED8. **88점 이상5/9이며 전체 목표는 미완료다.** 사용성95→100, 커뮤니티93.75→100; 나머지 영역은 동일하다.

개발 인증·합성 로컬 답글의 실제 UI 관찰은 외부 ChatGPT 인증·두 실제 사람·운영 계정 격리·실사용 성과의 대체물이 아니다. 전체 확장 화면 비교, 실제 확대/화면 읽기, 이메일·무인 실행 및 운영주기, 대표 사용자의 과업, 운영 전체 내보내기/삭제는 별도 미완료다.

## 1. 정체성·기획 일치

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 1.1.1 | Service copy leads with AI/SaaS discovery and learning. | PASS | 6.25 | 6.25 | C1; Q:9 |
| 1.1.2 | The root route remains information-first after authentication. | PASS | 6.25 | 6.25 | C1; Q:9 |
| 1.1.3 | The discovery home itself exposes current changes, tools, learning and people/event discovery. | PASS | 6.25 | 6.25 | H5; P5:5 — Home now contains upcoming verified events and real published top-level community entries, with honest empty/error states; source and local rendered task observed. |
| 1.1.4 | Personal management is opt-in from a separate route. | PASS | 6.25 | 6.25 | C1 |
| 1.2.1 | Tool discovery/detail/comparison has a usable public path. | PASS | 8.75 | 8.75 | T; V4a |
| 1.2.2 | Guide/news/event routes exist with substantive content. | PASS | 8.75 | 8.75 | C2; Q:13,22,27 |
| 1.2.3 | Public contributions and moderation have a working path. | PASS | 8.75 | 8.75 | Q:28; T |
| 1.2.4 | The retained private/operational minimum, including email, is implemented. | GAP | 8.75 | 0 | E9/D9 — Dated condition history, actual personal amounts and dated transition/refund/overlap comparison are implemented. Actual email, unattended timing and operating feedback/cadence remain incomplete; umbrella gate remains GAP. E14/D14: V14 timing, immutable batching and owned receipt workflow improve implementation; actual email/unattended operation and cadence remain incomplete, GAP retained. |
| 1.3.1 | Application-level public reading/search works without personal records. | PASS | 5 | 5 | T; Q:27 |
| 1.3.2 | Application-level comparison works without account persistence. | PASS | 5 | 5 | C2; local public route checks |
| 1.3.3 | General cancellation information is public at application level. | PASS | 5 | 5 | Q:15,30; C3 |
| 1.3.4 | An external anonymous visitor completes a deployed public-information task. | UNVERIFIED | 5 | 0 | Hosting remains owner-only; no anonymous external-visitor observation |
| 1.4.1 | My Workspace has a separate entry and authenticated content boundary. | PASS | 5 | 5 | C1; C3 |
| 1.4.2 | Private records are excluded from public search. | PASS | 5 | 5 | T: global search/private-record test |
| 1.4.3 | Public contribution requires an explicit public-content choice. | PASS | 5 | 5 | C3; community form |
| 1.4.4 | Private/public data meanings are explained in the product. | PASS | 5 | 5 | C3: privacy/about; Q:14 |

## 2. 내용·최신성

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 2.1.1 | Catalog/content include relevant official source URLs. | PASS | 7.5 | 7.5 | C2; SA |
| 2.1.2 | Model identities and principal specification claims have independent official verification. | PASS | 7.5 | 7.5 | SA: all three models |
| 2.1.3 | A sampled current product change has independent official verification and correction. | PASS | 7.5 | 7.5 | SA: ChatGPT September 11; Q:21 |
| 2.1.4 | Remaining catalog claim/source pairs have a complete current audit trail. | PASS | 7.5 | 7.5 | CA5:3,14,20–43; CV5:9–15,26–55; L6 — All20 entries/75 feature-source pairs audited, required corrections checked, last obsolete Midjourney supplementary source link corrected in current source. V6P confirms publication of the locally checked correction; this gate credits the complete documentary/source audit, not hands-on product testing. |
| 2.2.1 | Named tools use actual logo asset files rather than invented initial avatars. | PASS | 3.75 | 3.75 | C2: public/logos and ToolLogo |
| 2.2.2 | Logo origin links are retained alongside catalog entries. | PASS | 3.75 | 3.75 | C2: logoSource; source page |
| 2.2.3 | Representative rendered logos load without failures. | PASS | 3.75 | 3.75 | Q:33; OQ: mobile image loading checks |
| 2.2.4 | All current deployed logo assets have individually verified provenance/render outcomes. | PASS | 3.75 | 3.75 | E7 — All20 deployed /explore images individually complete && naturalWidth>0, IDs recorded; full-page screenshot shows each logo beside its label. Combines with inherited CA5/CV5 provenance receipts. Narrow initial lazy loading11/20 is separately disclosed. |
| 2.3.1 | Tool details show structured supported/conditional/unknown functions. | PASS | 6.25 | 6.25 | C2 |
| 2.3.2 | Curated updates state a concrete change and link its source. | PASS | 6.25 | 6.25 | C2; SA; Q:21 |
| 2.3.3 | Feed ingestion has defined product scope and retained-error/review behavior. | PASS | 6.25 | 6.25 | SA/SF; T; Q:21 |
| 2.3.4 | V4's new live feed path is observed end-to-end on the deployment. | PASS | 6.25 | 6.25 | P5:11–12 — Production Copilot content/logo and Midjourney content checks succeeded; /news?tab=feed rendered10 Copilot and15 Midjourney items with last-success dates. Bounded to this observed path, not all providers. |
| 2.4.1 | Source check dates are separate from publication dates. | PASS | 5 | 5 | C2; Q:21 |
| 2.4.2 | Absent publication dates, plans or support remain explicitly unknown. | PASS | 5 | 5 | C2; about/detail |
| 2.4.3 | Changed/failed source state is not silently promoted to verified fact. | PASS | 5 | 5 | T: source recovery regressions; SF correction |
| 2.4.4 | Past opportunities are marked ended and unchecked conditions remain conditional. | PASS | 5 | 5 | C2; event/promotion date logic |
| 2.5.1 | Data model distinguishes model, AI app and SaaS. | PASS | 2.5 | 2.5 | C2: catalog types |
| 2.5.2 | Visible labels expose the distinction. | PASS | 2.5 | 2.5 | C2: ToolUI/detail |
| 2.5.3 | Model identities are independently confirmed against official specifications. | PASS | 2.5 | 2.5 | SA |
| 2.5.4 | User app experience is not represented as a model benchmark. | PASS | 2.5 | 2.5 | C3: about; ToolReviews |

## 3. 디자인

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 3.1.1 | Shared palette and surface tokens establish a restrained theme. | PASS | 6.25 | 6.25 | C4: CSS variables |
| 3.1.2 | Shared Korean typography and heading scale are defined. | PASS | 6.25 | 6.25 | C4 |
| 3.1.3 | Brand/copy/layout are adapted to AIs rather than represented as copied references. | PASS | 6.25 | 6.25 | Q:9; C1 |
| 3.1.4 | The complete rendered V4 theme has a documented visual critique. | PASS | 6.25 | 6.25 | E10/D10 — Independent documented critique across the complete shared theme in28 principal D/M screens; references are inspiration, not clones. Critique completion does not imply all issues resolved. |
| 3.2.1 | Pages use consistent title/summary/section hierarchy. | PASS | 6.25 | 6.25 | C1/C2/C3 |
| 3.2.2 | Principal actions are visually distinguished from secondary actions. | PASS | 6.25 | 6.25 | C4: shared button treatments; source components |
| 3.2.3 | Dense tool/billing data are grouped into tables, sections and disclosures. | PASS | 6.25 | 6.25 | C2/C3 |
| 3.2.4 | Current desktop/mobile information hierarchy is visually checked across every principal screen. | PASS | 6.25 | 6.25 | E10/D10 — All28 pre-inventoried principal screens have actual D/M hierarchy critique. Invalid46/77 captures replaced by87/86; filled and empty QA states and local/production boundaries retained. Expanded-state/zoom/reader gaps remain separate. |
| 3.3.1 | Reading widths, line heights and spacing rules constrain text density. | PASS | 6.25 | 6.25 | C4 |
| 3.3.2 | Representative 390px detail/modal screens have no horizontal overflow. | PASS | 6.25 | 6.25 | Q:33 |
| 3.3.3 | Mobile controls use explicit readable input sizes and adequate target dimensions. | PASS | 6.25 | 6.25 | C4: mobile font/target rules |
| 3.3.4 | Representative desktop private screen fits a 1440px viewport. | PASS | 6.25 | 6.25 | V4b: clientWidth/scrollWidth both 1440; limited to observed screen |
| 3.4.1 | Public pages share shell and navigation components. | PASS | 6.25 | 6.25 | C1 |
| 3.4.2 | Personal forms/dialogs share styling and interaction primitives. | PASS | 6.25 | 6.25 | C3/C4 |
| 3.4.3 | Responsive styles and state labels are reused across views. | PASS | 6.25 | 6.25 | C3/C4 |
| 3.4.4 | New guide/search/admin/expanded-billing screens have a complete cross-screen visual comparison. | UNVERIFIED | 6.25 | 0 | Q:50; no complete current visual comparison artifact E10:99–113 later supplement settlement, monthly/admin table right columns and normal term preview. Saved comparison fine-print83 and complete expanded-state cross-screen coverage still incomplete; no additional point. |

## 4. 사용성

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 4.1.1 | Public search leads to a useful content result on the deployment. | PASS | 10 | 10 | V4a: guide search |
| 4.1.2 | Personal billing/refund/cancellation tasks work in representative local UI. | PASS | 10 | 10 | Q:31–32; P5:6,8–9 adds local linked billing/date-filter/hide/restore/Savings interactions.; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 4.1.3 | Author/report/moderation actions work in deployed UI. | PASS | 10 | 10 | Q:28 |
| 4.1.4 | V4 comparison save, private edit and full reload work in deployed UI. | PASS | 10 | 10 | V4b |
| 4.2.1 | Five primary destinations and contextual links are available. | PASS | 5 | 5 | C1; Q:9,33 |
| 4.2.2 | Global search spans existing public content types. | PASS | 5 | 5 | T; V4a |
| 4.2.3 | Specialized tool filters and no-results preserve declared scope. | PASS | 5 | 5 | C2: Explore/searchCatalog; code inspection |
| 4.2.4 | Search result types and active state are visible and adjustable. | PASS | 5 | 5 | C2: GlobalSearch; V4a |
| 4.3.1 | Save operations expose pending/success/failure state and do not treat failed HTTP as saved. | PASS | 5 | 5 | C3; Q:29; API helper; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 4.3.2 | Failed reads/searches expose a retry path. | PASS | 5 | 5 | C2/C3 |
| 4.3.3 | Guest draft→authentication→restore and network interruption are observed end-to-end in the current UI. | PASS | 5 | 5 | E16R: Root-observed current local React UI: ordinary guest community→Claude question draft→development authentication→same open form/context/values restored with consent unchecked; Claude/Figma drafts isolated; reply retains parent/body and a new submitted reply has the correct Claude parent context. Final review-before-login-final.json→review-after-login-final.json preserves all 14 non-consent fields, including usedAt=2026-09-11; consent true→false. Actual local dev-server stop→submit connection error with draft retained→restart→one local question saved. Final screenshots and DB receipts preserved; earlier date-13 review-login-green.json is superseded and earns no final restoration credit. No real external ChatGPT authentication, expired-session edit recovery, or accepted-response-loss/idempotency claim. |
| 4.3.4 | Missing resources, invalid input and forbidden writes have explicit error paths. | PASS | 5 | 5 | T; Q:27 |
| 4.4.1 | Forms use labelled native controls and bounded inputs. | PASS | 5 | 5 | C3 |
| 4.4.2 | A skip link and visible keyboard focus styling exist. | PASS | 5 | 5 | C1/C4 |
| 4.4.3 | A completed save restores focus to the originating control. | PASS | 5 | 5 | Q:31; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 4.4.4 | V4 delete dialog cycles Tab/Shift+Tab, closes with Escape, restores focus and preserves data on cancel. | PASS | 5 | 5 | V4b |

## 5. 쾌적성·접근성

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 5.1.1 | Representative public 390px detail/search screens fit and operate. | PASS | 6.25 | 6.25 | Q:30,33 |
| 5.1.2 | Representative new private 390px billing/refund forms fit and operate. | PASS | 6.25 | 6.25 | Q:31–32; P5:7 requested390×844 but observed document395px; containers fit395px. This corroborates representative narrow-screen behavior without claiming a complete390px or zoom matrix. |
| 5.1.3 | Representative desktop 1440px private screen has matching viewport/document width. | PASS | 6.25 | 6.25 | V4b |
| 5.1.4 | Zoom/reflow and the complete screen matrix are measured. | UNVERIFIED | 6.25 | 0 | No 200% zoom/reflow or complete viewport sweep evidence |
| 5.2.1 | Measured primary text/button contrast meets the documented thresholds. | PASS | 6.25 | 6.25 | Q:33; OQ contrasts |
| 5.2.2 | Korean font sizing and line height, including mobile inputs, are explicit. | PASS | 6.25 | 6.25 | C4 |
| 5.2.3 | Support/uncertainty/error meaning is expressed in text, not color alone. | PASS | 6.25 | 6.25 | C2/C3 |
| 5.2.4 | Screen-reader reading order, descriptions and status announcements have an observed run. | UNVERIFIED | 6.25 | 0 | No screen-reader run supplied |
| 5.3.1 | Representative load/render timing is measured with method and environment. | PASS | 6.25 | 6.25 | E7/M7 — Eight production load observations across home/explore/my at actual desktop/narrow widths, timestamps/visibility/document scope/late start/cache limits. Seven miss fixed load budgets; measurement credit does not mark latency resolved. |
| 5.3.2 | Interaction responsiveness is measured on a principal task. | PASS | 6.25 | 6.25 | E7 strict timed exploration — sequential document query plus writing filter, one result observed;93ms host wall time including automation dispatch,2476ms capture window including2100ms Event Timing wait. Document INP56ms includes diagnostic controls and is not isolated per-action latency. Earlier delayed samples retained. |
| 5.3.3 | Layout stability is measured during initial/async rendering. | PASS | 6.25 | 6.25 | E7/M7 — Initial and later async/task CLS/raw document shift values observed. Narrow/my CLS0.034716, other recorded values0..0.0012545; strict task unchanged. Document/input-exclusion/cutoff limits preserved. |
| 5.3.4 | Resource/long-task costs are measured under a stated budget. | PASS | 6.25 | 6.25 | E7/M7 — Prior fixed unit/window/count/byte/long-task budgets compared with actual production navigation/resources/script/long-task observations. Uncontrolled cache and unknown byte coverage preserved; known-zero script bytes not treated as free. |
| 5.4.1 | Current complete build/type validation is reported successful. | PASS | 6.25 | 6.25 | Q:26; V4 source/deploy evidence; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 5.4.2 | API/calculation suite passes freshly. | PASS | 6.25 | 6.25 | T: 35/35; T5 fresh independent48/48 API/billing tests passed during final V5 recheck; V6 changes only one catalog source URL.; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 5.4.3 | Observed navigation and deployed author flows no longer exhibit the prior link error. | PASS | 6.25 | 6.25 | Q:28–29,33 |
| 5.4.4 | Source failure recovery and critical data-edit regressions have passing checks. | PASS | 6.25 | 6.25 | T; independent fix review; R5 final independently verifies all8 original V5 review findings resolved; T5 covers targeted regressions.; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |

## 6. 유용성

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 6.1.1 | Details explain use, constraints, environment and source-backed functions. | PASS | 7.5 | 7.5 | C2 |
| 6.1.2 | Side-by-side comparison exposes relevant differences and source links. | PASS | 7.5 | 7.5 | C2; V4a comparison screen/save |
| 6.1.3 | Unassessed editorial evidence is distinguished from available user evidence. | PASS | 7.5 | 7.5 | C2/C3 |
| 6.1.4 | A representative person/task demonstrates choosing between candidates from the comparison evidence. | UNVERIFIED | 7.5 | 0 | No observed comparison-understanding task; saving is not understanding |
| 6.2.1 | Anonymous application-level query retrieves relevant available content. | PASS | 6.25 | 6.25 | T; V4a |
| 6.2.2 | Explicit required conditions do not treat unknown as supported. | PASS | 6.25 | 6.25 | C2 |
| 6.2.3 | Recommendations state work/function reasons rather than invented fitness percentages. | PASS | 6.25 | 6.25 | C2: Recommend/about |
| 6.2.4 | A varied set of realistic purpose/condition queries has evaluated relevance. | PASS | 6.25 | 6.25 | E11/R11 — Frozen20 plus independently frozen16 evaluated against real catalog output; initial32/36 and intermediate35/36 preserved, final36/36 minimum criteria after correction. Exposed16 are regression cases, not fresh holdout. Partial lower-rank precision limitations remain; this is evaluation completion, not universal relevance or real-user outcome proof. |
| 6.3.1 | Guides include concrete practice inputs and prerequisites. | PASS | 6.25 | 6.25 | C2; Q:22 |
| 6.3.2 | Guides explain steps, output checks and likely failure recovery. | PASS | 6.25 | 6.25 | C2; Q:22 |
| 6.3.3 | Guides link official sources and label direct-execution status honestly. | PASS | 6.25 | 6.25 | C2; Q:22 |
| 6.3.4 | A complete representative guide is reproduced and its result checked. | UNVERIFIED | 6.25 | 0 | Direct execution results are explicitly unregistered |
| 6.4.1 | Update meaning/affected conditions and source dates are available. | PASS | 5 | 5 | C2; SA |
| 6.4.2 | Events/promotions expose audience, time and eligibility conditions. | PASS | 5 | 5 | C2 |
| 6.4.3 | Cost comparison distinguishes cheaper price from prepayment feasibility. | PASS | 5 | 5 | T; Q:19 |
| 6.4.4 | Unknown conditions and source failures are visible rather than silently assumed satisfied. | PASS | 5 | 5 | C2/C3; T |

## 7. 커뮤니티

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 7.1.1 | Reviews require work, plan, use date and relationship disclosure. | PASS | 7.5 | 7.5 | C3; T |
| 7.1.2 | Rating aggregation deduplicates latest account/tool reviews and excludes missing axes. | PASS | 7.5 | 7.5 | T |
| 7.1.3 | Feature proposals remain distinguishable from verified official facts. | PASS | 7.5 | 7.5 | C3 |
| 7.1.4 | Review author/edit/reply behavior has representative UI evidence. | PASS | 7.5 | 7.5 | OQ: local review/edit/reply; unchanged core retained and API checks current |
| 7.2.1 | Question submission exists without a personal tool/subscription prerequisite. | PASS | 6.25 | 6.25 | C3: postSchema/community form/route |
| 7.2.2 | A reply links to the published parent with server validation. | PASS | 6.25 | 6.25 | T; C3 |
| 7.2.3 | Threads expose answers and author controls. | PASS | 6.25 | 6.25 | C3; OQ local reply task |
| 7.2.4 | A deleted/hidden parent with other authors' replies has an observed readable UI task. | PASS | 6.25 | 6.25 | E16P: Root-observed actual local React UI with two explicitly synthetic, different user_id parent/reply records: published baseline→hidden parent→deleted parent→reply B full body/author/date readable→return to list; reviewer directly read all three original captures, including both hidden/deleted fallback states. Fixture cleanup recorded. This proves the fixed readable UI task, not two real people/accounts, production identity isolation, or execution of the actual author/admin mutation controls. |
| 7.3.1 | Server account identity governs contribution mutation. | PASS | 6.25 | 6.25 | T |
| 7.3.2 | Other-account edit/delete attempts are rejected. | PASS | 6.25 | 6.25 | T |
| 7.3.3 | Deployed author edits survive a new read and deletion is observed. | PASS | 6.25 | 6.25 | Q:28 |
| 7.3.4 | Account deletion removes own content/ratings while preserving other users' reply data. | PASS | 6.25 | 6.25 | T |
| 7.4.1 | A deployed report is accepted. | PASS | 5 | 5 | Q:28 |
| 7.4.2 | Moderation requires the configured administrator. | PASS | 5 | 5 | T; Q:28–29 |
| 7.4.3 | Hide, nonvisibility, restore and resolve work in deployed UI. | PASS | 5 | 5 | Q:28 |
| 7.4.4 | Relationship, proposal and experience/official-fact distinctions are visible. | PASS | 5 | 5 | C3 |

## 8. 개인 기능

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 8.1.1 | Real Sites account identity is observed in the deployment. | PASS | 6.25 | 6.25 | Q:29 |
| 8.1.2 | Read/update/delete/export scope is account-isolated in API tests. | PASS | 6.25 | 6.25 | T; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 8.1.3 | Forged identity and cross-origin writes are rejected in recorded checks. | PASS | 6.25 | 6.25 | T; Q:27 |
| 8.1.4 | Cross-device/account isolation is observed with independent real production sessions. | UNVERIFIED | 6.25 | 0 | No independent second-account/device observation supplied |
| 8.2.1 | Tool quick-save persists without overwriting existing private notes/status. | PASS | 5 | 5 | T; Q:29 |
| 8.2.2 | Custom tool and collection CRUD paths use owned server records. | PASS | 5 | 5 | C3; API ownership structure |
| 8.2.3 | Selected comparison is saved into the account. | PASS | 5 | 5 | V4a/V4b; T |
| 8.2.4 | Private reason/outcome edits survive a full production reload. | PASS | 5 | 5 | V4b |
| 8.3.1 | Fixed billing, currencies, bundle dedupe and period boundaries pass checks. | PASS | 6.25 | 6.25 | T; T5/R5; P5:15 production linked payment fullreload: actual3000+remaining6000=forecast9000; confirmed Sep15, expected Oct15/Nov15; cleanup complete.; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 8.3.2 | Missing dates, new prices, seats/tax, usage budgets and refund dates pass focused checks. | PASS | 6.25 | 6.25 | T; Q:17–18,31–32; R5 confirms anchor/currency/legacy bundle/share/known residual handling fixes; T5 passes.; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 8.3.3 | Savings applies known features/duration/prepayment and labels uncertainty. | PASS | 6.25 | 6.25 | T; Q:19; P5:9 rendered local Savings fixture: monthly240000 vs switched260000, monthly cheaper20000; conservative upfront270000 exceeds250000 ceiling. Full dated scenario modeling is not claimed. |
| 8.3.4 | Retained reconciliation/custom-period/history/transition-cost comparison cases are implemented. | PASS | 6.25 | 6.25 | E8/E9/D9/W9 — Retained reconciliation, custom periods and dated history preserved. Canonical existing invoices and a separately dated candidate are compared over the same period; remaining charges, access overlap, dated fees/proration/confirmed refunds, actual matching, currency vectors, gross upfront limits and unknown holds are implemented. Private server-computed snapshots preserve original inputs/source; recalculation is explicit.26 new engine/API tests,109 total; local and deployed browser paths verified. |
| 8.4.1 | Public payment-path help and residual-obligation behavior are observed. | PASS | 5 | 5 | Q:30–31; T |
| 8.4.2 | App notice matching/dedupe and email eligibility/consent guards are implemented/tested. | PASS | 5 | 5 | T; C3; R5 final stale settings protection and explicit topic restoration tested; no provider delivery credit. |
| 8.4.3 | Customer-facing topic hide/not-interested and offered notification timing are complete. | GAP | 5 | 0 | P5:8; R5 final; T5 verify hide→unrelated settings save→explicit restoration, including stale-payload protection. Offered unattended timing remains incomplete; binary conjunction remains GAP. E14/D14: V14 timing, immutable batching and owned receipt workflow improve implementation; actual email/unattended operation and cadence remain incomplete, GAP retained. |
| 8.4.4 | Consented actual email delivery and unattended processing operate. | GAP | 5 | 0 | No actual configured email/provider receipt or unattended processing evidence. Guard/unit tests and app visibility do not substitute; GAP unchanged. E14/D14: V14 timing, immutable batching and owned receipt workflow improve implementation; actual email/unattended operation and cadence remain incomplete, GAP retained. |
| 8.5.1 | Export includes owned records, contributions and new saved fields. | PASS | 2.5 | 2.5 | T; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 8.5.2 | Deletion rejects wrong confirmation and removes owned private data. | PASS | 2.5 | 2.5 | T; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 8.5.3 | Deletion preserves other users' reply data and removes own rating identity. | PASS | 2.5 | 2.5 | T |
| 8.5.4 | Complete deployed export/download verification and full-account destructive flow are observed. | UNVERIFIED | 2.5 | 0 | Production author-post deletion is not full-account export/delete |

## 9. 배포·운영

| ID | 고정 기준 원문 | 상태 | 가중치 | 획득 | 증거 |
|---|---|---|---:|---:|---|
| 9.1.1 | V4 deployment success is reported for the exact source ID. | PASS | 6.25 | 6.25 | V4a; P5:3 also records V5 success source beeb02a1e58ecdab6864d5206885b4d14d2d7ba7 at2026-09-12T08:17:24Z. V6P also confirms single-link correction publication; literal original V4 gate name retained.; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 9.1.2 | The real site URL serves the new application. | PASS | 6.25 | 6.25 | V4a/V4b |
| 9.1.3 | Hosting access scope and operator identity are explicitly checked. | PASS | 6.25 | 6.25 | Q:6,29; owner-only preview |
| 9.1.4 | Build source/runtime setup and secret separation are documented and checked. | PASS | 6.25 | 6.25 | Q:26; OQ environment/security notes; C3 runtime config |
| 9.2.1 | Public navigation/search works on the deployed build. | PASS | 6.25 | 6.25 | V4a; Q:33 |
| 9.2.2 | Owned tool save/reload works in real deployment. | PASS | 6.25 | 6.25 | Q:29; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 9.2.3 | Deployed contribution/moderation/delete flow works. | PASS | 6.25 | 6.25 | Q:28 |
| 9.2.4 | New comparison/private-edit/full-reload flow works on V4. | PASS | 6.25 | 6.25 | V4b |
| 9.3.1 | D1 schema/owned storage implementation is connected rather than local-only. | PASS | 6.25 | 6.25 | C3; Q:29; P5:15 additionally proves deployed linked-payment persistence and cleanup; current literal expression-index migration exercised in T5/R5.; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 9.3.2 | Real private tool records survive reload. | PASS | 6.25 | 6.25 | Q:29; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 9.3.3 | Real public contributions survive write/edit/new-read. | PASS | 6.25 | 6.25 | Q:28 |
| 9.3.4 | New nested private saved fields survive a full V4 reload. | PASS | 6.25 | 6.25 | V4b; E8/D8 — V8 date-aware history/personal ledger/API and deployed task verification strengthens this existing PASS; no additional earned points. |
| 9.4.1 | A real source-sync run and partial-failure state have been recorded. | PASS | 6.25 | 6.25 | OQ: deployed first-three source check; SA; P5:11 additionally observes Copilot/Midjourney success and OpenAI403 retained as failure. |
| 9.4.2 | Authorized operations exposes moderation, sync and delivery-state data. | PASS | 6.25 | 6.25 | C3; Q:28–29 |
| 9.4.3 | New feed scopes are observed through the deployed sync→display path. | PASS | 6.25 | 6.25 | P5:11–12 — Deployed source check→stored feed→visible feed observed for Copilot and Midjourney. OpenAI403 remains reported as failure, not verified freshness. |
| 9.4.4 | Required unattended/email operations and operating feedback/cadence are complete. | GAP | 6.25 | 0 | Actual feed-sync display now independently credited at9.4.3. Required unattended email/sync cadence and operating feedback remain incomplete; GAP unchanged. E14/D14: V14 timing, immutable batching and owned receipt workflow improve implementation; actual email/unattended operation and cadence remain incomplete, GAP retained. |

