# V19 최종 채택 후보 — 5.1.4와6.3.4만 변경

2026-09-14. root 채택 전 독립 제안이다. [전체 JSON](/private/tmp/ais-v19-score-zoom-candidate.json). 원본 문서·Site·Git·브라우저·데이터는 변경하지 않았다.

기존5.1.4 “Zoom/reflow and the complete screen matrix are measured.”와6.3.4 “A complete representative guide is reproduced and its result checked.”만 UNVERIFIED→PASS, 각각0→6.25로 제안한다. 전자는 실제 native200%의 원래28개 주 화면/현재 중요한 확장 몸체·표 양끝·말단·공통 초점 관찰, 후자는 기존 Notion 가이드1건의 실제 UI 재현과 원래3결과 확인에 근거한다. [확대 완전성 판독](/private/tmp/ais-v19-zoom-completeness-review.md) · [Notion 판독](/Users/bigmac_moon/dev/ai_score/docs/audits/v19-native-guide/ais-v19-notion-evidence-review.md).

| 영역 | V17 | V19 후보 | 88 이상 |
|---|---:|---:|---|
| 정체성·기획 일치 | 86.25 | 86.25 | 미달 |
| 내용·최신성 | 100 | 100 | 통과 |
| 디자인 | 100 | 100 | 통과 |
| 사용성 | 100 | 100 | 통과 |
| 쾌적성·접근성 | 87.5 | 93.75 | 통과 |
| 유용성 | 86.25 | 92.5 | 통과 |
| 커뮤니티 | 100 | 100 | 통과 |
| 개인 기능 | 81.25 | 81.25 | 미달 |
| 배포·운영 | 93.75 | 93.75 | 통과 |

**PASS143/GAP4/UNVERIFIED5, 88이상7/9. 전체 목표 미완료.** 원래9영역/38그룹/152개ID·문구·가중치·이진 채점·method/caps를 유지한다. 다른150개 게이트는 evidence까지 완전히 동일하다. 직전 guide-only 후보와 비교하면5.1.4 하나만 바뀌었다.

현재 source `d5efa3e11997e4a6d19cf28029246546e3a2a5bc` / Sites21 / 환경2, versionID `appgprj_6aa42f3ab3ec81919d0048d508baa661~appgver_775a2c15a3cc8191bb0de212dc42bfa8`, deployment `appgdep_6aa806e7e530819183a877eae9421c27`, succeeded `2026-09-14T14:39:07.129272+00:00`. 실제 root 보존 영수증과 일치한다. 소유자 비공개 접근은 그대로다. Sites20의79afc174 및 초기 pending 제안은 역사 필드에 보존했다.

실제200%가 완료됐다고 실제 screen-reader까지 완료한 것이 아니다.5.2.4는 실제 발화/자막 없이 GUI ON/processfalse/getApp timeout 후OFF 복원되어U다. 없는 운영 데이터·동일 구조의 내용 변형·미실행 오류는 확대 관찰 한계로 기록했으며 관찰된 것으로 바꾸지 않았다. 원문에 없는400%/모든계정×데이터×폭/추가 가이드 수를 새 조건으로 만들지 않았다.

현재 남은 고정 기준은 아래와 같다. V18실제685byte 다운로드는8.5.4부분 증거이며 전체 계정 삭제는 미실행이다. 메일 제공사/발신자·동의 수신/도착과 방문에 독립적인 운영 실행, 실제 외부 과업·독립 운영 세션·대표 비교 이해는 여전히 미완료다. 목표 도구는root보고상blocked지만 사용자 명시 재개 후 실제 작업은 진행했고, Codex UI 거절을 우회하지 않았다.

| ID | 상태 | 원래 기준 |
|---|---|---|
| 1.2.4 | GAP | The retained private/operational minimum, including email, is implemented. |
| 1.3.4 | UNVERIFIED | An external anonymous visitor completes a deployed public-information task. |
| 5.2.4 | UNVERIFIED | Screen-reader reading order, descriptions and status announcements have an observed run. |
| 6.1.4 | UNVERIFIED | A representative person/task demonstrates choosing between candidates from the comparison evidence. |
| 8.1.4 | UNVERIFIED | Cross-device/account isolation is observed with independent real production sessions. |
| 8.4.3 | GAP | Customer-facing topic hide/not-interested and offered notification timing are complete. |
| 8.4.4 | GAP | Consented actual email delivery and unattended processing operate. |
| 8.5.4 | UNVERIFIED | Complete deployed export/download verification and full-account destructive flow are observed. |
| 9.4.4 | GAP | Required unattended/email operations and operating feedback/cadence are complete. |

## 고정152개 게이트

### 정체성·기획 일치

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 1.1.1 | Service copy leads with AI/SaaS discovery and learning. | PASS | 6.25 | 6.25 |
| 1.1.2 | The root route remains information-first after authentication. | PASS | 6.25 | 6.25 |
| 1.1.3 | The discovery home itself exposes current changes, tools, learning and people/event discovery. | PASS | 6.25 | 6.25 |
| 1.1.4 | Personal management is opt-in from a separate route. | PASS | 6.25 | 6.25 |
| 1.2.1 | Tool discovery/detail/comparison has a usable public path. | PASS | 8.75 | 8.75 |
| 1.2.2 | Guide/news/event routes exist with substantive content. | PASS | 8.75 | 8.75 |
| 1.2.3 | Public contributions and moderation have a working path. | PASS | 8.75 | 8.75 |
| 1.2.4 | The retained private/operational minimum, including email, is implemented. | GAP | 8.75 | 0 |
| 1.3.1 | Application-level public reading/search works without personal records. | PASS | 5 | 5 |
| 1.3.2 | Application-level comparison works without account persistence. | PASS | 5 | 5 |
| 1.3.3 | General cancellation information is public at application level. | PASS | 5 | 5 |
| 1.3.4 | An external anonymous visitor completes a deployed public-information task. | UNVERIFIED | 5 | 0 |
| 1.4.1 | My Workspace has a separate entry and authenticated content boundary. | PASS | 5 | 5 |
| 1.4.2 | Private records are excluded from public search. | PASS | 5 | 5 |
| 1.4.3 | Public contribution requires an explicit public-content choice. | PASS | 5 | 5 |
| 1.4.4 | Private/public data meanings are explained in the product. | PASS | 5 | 5 |

### 내용·최신성

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 2.1.1 | Catalog/content include relevant official source URLs. | PASS | 7.5 | 7.5 |
| 2.1.2 | Model identities and principal specification claims have independent official verification. | PASS | 7.5 | 7.5 |
| 2.1.3 | A sampled current product change has independent official verification and correction. | PASS | 7.5 | 7.5 |
| 2.1.4 | Remaining catalog claim/source pairs have a complete current audit trail. | PASS | 7.5 | 7.5 |
| 2.2.1 | Named tools use actual logo asset files rather than invented initial avatars. | PASS | 3.75 | 3.75 |
| 2.2.2 | Logo origin links are retained alongside catalog entries. | PASS | 3.75 | 3.75 |
| 2.2.3 | Representative rendered logos load without failures. | PASS | 3.75 | 3.75 |
| 2.2.4 | All current deployed logo assets have individually verified provenance/render outcomes. | PASS | 3.75 | 3.75 |
| 2.3.1 | Tool details show structured supported/conditional/unknown functions. | PASS | 6.25 | 6.25 |
| 2.3.2 | Curated updates state a concrete change and link its source. | PASS | 6.25 | 6.25 |
| 2.3.3 | Feed ingestion has defined product scope and retained-error/review behavior. | PASS | 6.25 | 6.25 |
| 2.3.4 | V4's new live feed path is observed end-to-end on the deployment. | PASS | 6.25 | 6.25 |
| 2.4.1 | Source check dates are separate from publication dates. | PASS | 5 | 5 |
| 2.4.2 | Absent publication dates, plans or support remain explicitly unknown. | PASS | 5 | 5 |
| 2.4.3 | Changed/failed source state is not silently promoted to verified fact. | PASS | 5 | 5 |
| 2.4.4 | Past opportunities are marked ended and unchecked conditions remain conditional. | PASS | 5 | 5 |
| 2.5.1 | Data model distinguishes model, AI app and SaaS. | PASS | 2.5 | 2.5 |
| 2.5.2 | Visible labels expose the distinction. | PASS | 2.5 | 2.5 |
| 2.5.3 | Model identities are independently confirmed against official specifications. | PASS | 2.5 | 2.5 |
| 2.5.4 | User app experience is not represented as a model benchmark. | PASS | 2.5 | 2.5 |

### 디자인

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 3.1.1 | Shared palette and surface tokens establish a restrained theme. | PASS | 6.25 | 6.25 |
| 3.1.2 | Shared Korean typography and heading scale are defined. | PASS | 6.25 | 6.25 |
| 3.1.3 | Brand/copy/layout are adapted to AIs rather than represented as copied references. | PASS | 6.25 | 6.25 |
| 3.1.4 | The complete rendered V4 theme has a documented visual critique. | PASS | 6.25 | 6.25 |
| 3.2.1 | Pages use consistent title/summary/section hierarchy. | PASS | 6.25 | 6.25 |
| 3.2.2 | Principal actions are visually distinguished from secondary actions. | PASS | 6.25 | 6.25 |
| 3.2.3 | Dense tool/billing data are grouped into tables, sections and disclosures. | PASS | 6.25 | 6.25 |
| 3.2.4 | Current desktop/mobile information hierarchy is visually checked across every principal screen. | PASS | 6.25 | 6.25 |
| 3.3.1 | Reading widths, line heights and spacing rules constrain text density. | PASS | 6.25 | 6.25 |
| 3.3.2 | Representative 390px detail/modal screens have no horizontal overflow. | PASS | 6.25 | 6.25 |
| 3.3.3 | Mobile controls use explicit readable input sizes and adequate target dimensions. | PASS | 6.25 | 6.25 |
| 3.3.4 | Representative desktop private screen fits a 1440px viewport. | PASS | 6.25 | 6.25 |
| 3.4.1 | Public pages share shell and navigation components. | PASS | 6.25 | 6.25 |
| 3.4.2 | Personal forms/dialogs share styling and interaction primitives. | PASS | 6.25 | 6.25 |
| 3.4.3 | Responsive styles and state labels are reused across views. | PASS | 6.25 | 6.25 |
| 3.4.4 | New guide/search/admin/expanded-billing screens have a complete cross-screen visual comparison. | PASS | 6.25 | 6.25 |

### 사용성

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 4.1.1 | Public search leads to a useful content result on the deployment. | PASS | 10 | 10 |
| 4.1.2 | Personal billing/refund/cancellation tasks work in representative local UI. | PASS | 10 | 10 |
| 4.1.3 | Author/report/moderation actions work in deployed UI. | PASS | 10 | 10 |
| 4.1.4 | V4 comparison save, private edit and full reload work in deployed UI. | PASS | 10 | 10 |
| 4.2.1 | Five primary destinations and contextual links are available. | PASS | 5 | 5 |
| 4.2.2 | Global search spans existing public content types. | PASS | 5 | 5 |
| 4.2.3 | Specialized tool filters and no-results preserve declared scope. | PASS | 5 | 5 |
| 4.2.4 | Search result types and active state are visible and adjustable. | PASS | 5 | 5 |
| 4.3.1 | Save operations expose pending/success/failure state and do not treat failed HTTP as saved. | PASS | 5 | 5 |
| 4.3.2 | Failed reads/searches expose a retry path. | PASS | 5 | 5 |
| 4.3.3 | Guest draft→authentication→restore and network interruption are observed end-to-end in the current UI. | PASS | 5 | 5 |
| 4.3.4 | Missing resources, invalid input and forbidden writes have explicit error paths. | PASS | 5 | 5 |
| 4.4.1 | Forms use labelled native controls and bounded inputs. | PASS | 5 | 5 |
| 4.4.2 | A skip link and visible keyboard focus styling exist. | PASS | 5 | 5 |
| 4.4.3 | A completed save restores focus to the originating control. | PASS | 5 | 5 |
| 4.4.4 | V4 delete dialog cycles Tab/Shift+Tab, closes with Escape, restores focus and preserves data on cancel. | PASS | 5 | 5 |

### 쾌적성·접근성

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 5.1.1 | Representative public 390px detail/search screens fit and operate. | PASS | 6.25 | 6.25 |
| 5.1.2 | Representative new private 390px billing/refund forms fit and operate. | PASS | 6.25 | 6.25 |
| 5.1.3 | Representative desktop 1440px private screen has matching viewport/document width. | PASS | 6.25 | 6.25 |
| 5.1.4 | Zoom/reflow and the complete screen matrix are measured. | PASS | 6.25 | 6.25 |
| 5.2.1 | Measured primary text/button contrast meets the documented thresholds. | PASS | 6.25 | 6.25 |
| 5.2.2 | Korean font sizing and line height, including mobile inputs, are explicit. | PASS | 6.25 | 6.25 |
| 5.2.3 | Support/uncertainty/error meaning is expressed in text, not color alone. | PASS | 6.25 | 6.25 |
| 5.2.4 | Screen-reader reading order, descriptions and status announcements have an observed run. | UNVERIFIED | 6.25 | 0 |
| 5.3.1 | Representative load/render timing is measured with method and environment. | PASS | 6.25 | 6.25 |
| 5.3.2 | Interaction responsiveness is measured on a principal task. | PASS | 6.25 | 6.25 |
| 5.3.3 | Layout stability is measured during initial/async rendering. | PASS | 6.25 | 6.25 |
| 5.3.4 | Resource/long-task costs are measured under a stated budget. | PASS | 6.25 | 6.25 |
| 5.4.1 | Current complete build/type validation is reported successful. | PASS | 6.25 | 6.25 |
| 5.4.2 | API/calculation suite passes freshly. | PASS | 6.25 | 6.25 |
| 5.4.3 | Observed navigation and deployed author flows no longer exhibit the prior link error. | PASS | 6.25 | 6.25 |
| 5.4.4 | Source failure recovery and critical data-edit regressions have passing checks. | PASS | 6.25 | 6.25 |

### 유용성

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 6.1.1 | Details explain use, constraints, environment and source-backed functions. | PASS | 7.5 | 7.5 |
| 6.1.2 | Side-by-side comparison exposes relevant differences and source links. | PASS | 7.5 | 7.5 |
| 6.1.3 | Unassessed editorial evidence is distinguished from available user evidence. | PASS | 7.5 | 7.5 |
| 6.1.4 | A representative person/task demonstrates choosing between candidates from the comparison evidence. | UNVERIFIED | 7.5 | 0 |
| 6.2.1 | Anonymous application-level query retrieves relevant available content. | PASS | 6.25 | 6.25 |
| 6.2.2 | Explicit required conditions do not treat unknown as supported. | PASS | 6.25 | 6.25 |
| 6.2.3 | Recommendations state work/function reasons rather than invented fitness percentages. | PASS | 6.25 | 6.25 |
| 6.2.4 | A varied set of realistic purpose/condition queries has evaluated relevance. | PASS | 6.25 | 6.25 |
| 6.3.1 | Guides include concrete practice inputs and prerequisites. | PASS | 6.25 | 6.25 |
| 6.3.2 | Guides explain steps, output checks and likely failure recovery. | PASS | 6.25 | 6.25 |
| 6.3.3 | Guides link official sources and label direct-execution status honestly. | PASS | 6.25 | 6.25 |
| 6.3.4 | A complete representative guide is reproduced and its result checked. | PASS | 6.25 | 6.25 |
| 6.4.1 | Update meaning/affected conditions and source dates are available. | PASS | 5 | 5 |
| 6.4.2 | Events/promotions expose audience, time and eligibility conditions. | PASS | 5 | 5 |
| 6.4.3 | Cost comparison distinguishes cheaper price from prepayment feasibility. | PASS | 5 | 5 |
| 6.4.4 | Unknown conditions and source failures are visible rather than silently assumed satisfied. | PASS | 5 | 5 |

### 커뮤니티

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 7.1.1 | Reviews require work, plan, use date and relationship disclosure. | PASS | 7.5 | 7.5 |
| 7.1.2 | Rating aggregation deduplicates latest account/tool reviews and excludes missing axes. | PASS | 7.5 | 7.5 |
| 7.1.3 | Feature proposals remain distinguishable from verified official facts. | PASS | 7.5 | 7.5 |
| 7.1.4 | Review author/edit/reply behavior has representative UI evidence. | PASS | 7.5 | 7.5 |
| 7.2.1 | Question submission exists without a personal tool/subscription prerequisite. | PASS | 6.25 | 6.25 |
| 7.2.2 | A reply links to the published parent with server validation. | PASS | 6.25 | 6.25 |
| 7.2.3 | Threads expose answers and author controls. | PASS | 6.25 | 6.25 |
| 7.2.4 | A deleted/hidden parent with other authors' replies has an observed readable UI task. | PASS | 6.25 | 6.25 |
| 7.3.1 | Server account identity governs contribution mutation. | PASS | 6.25 | 6.25 |
| 7.3.2 | Other-account edit/delete attempts are rejected. | PASS | 6.25 | 6.25 |
| 7.3.3 | Deployed author edits survive a new read and deletion is observed. | PASS | 6.25 | 6.25 |
| 7.3.4 | Account deletion removes own content/ratings while preserving other users' reply data. | PASS | 6.25 | 6.25 |
| 7.4.1 | A deployed report is accepted. | PASS | 5 | 5 |
| 7.4.2 | Moderation requires the configured administrator. | PASS | 5 | 5 |
| 7.4.3 | Hide, nonvisibility, restore and resolve work in deployed UI. | PASS | 5 | 5 |
| 7.4.4 | Relationship, proposal and experience/official-fact distinctions are visible. | PASS | 5 | 5 |

### 개인 기능

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 8.1.1 | Real Sites account identity is observed in the deployment. | PASS | 6.25 | 6.25 |
| 8.1.2 | Read/update/delete/export scope is account-isolated in API tests. | PASS | 6.25 | 6.25 |
| 8.1.3 | Forged identity and cross-origin writes are rejected in recorded checks. | PASS | 6.25 | 6.25 |
| 8.1.4 | Cross-device/account isolation is observed with independent real production sessions. | UNVERIFIED | 6.25 | 0 |
| 8.2.1 | Tool quick-save persists without overwriting existing private notes/status. | PASS | 5 | 5 |
| 8.2.2 | Custom tool and collection CRUD paths use owned server records. | PASS | 5 | 5 |
| 8.2.3 | Selected comparison is saved into the account. | PASS | 5 | 5 |
| 8.2.4 | Private reason/outcome edits survive a full production reload. | PASS | 5 | 5 |
| 8.3.1 | Fixed billing, currencies, bundle dedupe and period boundaries pass checks. | PASS | 6.25 | 6.25 |
| 8.3.2 | Missing dates, new prices, seats/tax, usage budgets and refund dates pass focused checks. | PASS | 6.25 | 6.25 |
| 8.3.3 | Savings applies known features/duration/prepayment and labels uncertainty. | PASS | 6.25 | 6.25 |
| 8.3.4 | Retained reconciliation/custom-period/history/transition-cost comparison cases are implemented. | PASS | 6.25 | 6.25 |
| 8.4.1 | Public payment-path help and residual-obligation behavior are observed. | PASS | 5 | 5 |
| 8.4.2 | App notice matching/dedupe and email eligibility/consent guards are implemented/tested. | PASS | 5 | 5 |
| 8.4.3 | Customer-facing topic hide/not-interested and offered notification timing are complete. | GAP | 5 | 0 |
| 8.4.4 | Consented actual email delivery and unattended processing operate. | GAP | 5 | 0 |
| 8.5.1 | Export includes owned records, contributions and new saved fields. | PASS | 2.5 | 2.5 |
| 8.5.2 | Deletion rejects wrong confirmation and removes owned private data. | PASS | 2.5 | 2.5 |
| 8.5.3 | Deletion preserves other users' reply data and removes own rating identity. | PASS | 2.5 | 2.5 |
| 8.5.4 | Complete deployed export/download verification and full-account destructive flow are observed. | UNVERIFIED | 2.5 | 0 |

### 배포·운영

| ID | 고정 기준 | 상태 | 배점 | 획득 |
|---|---|---|---:|---:|
| 9.1.1 | V4 deployment success is reported for the exact source ID. | PASS | 6.25 | 6.25 |
| 9.1.2 | The real site URL serves the new application. | PASS | 6.25 | 6.25 |
| 9.1.3 | Hosting access scope and operator identity are explicitly checked. | PASS | 6.25 | 6.25 |
| 9.1.4 | Build source/runtime setup and secret separation are documented and checked. | PASS | 6.25 | 6.25 |
| 9.2.1 | Public navigation/search works on the deployed build. | PASS | 6.25 | 6.25 |
| 9.2.2 | Owned tool save/reload works in real deployment. | PASS | 6.25 | 6.25 |
| 9.2.3 | Deployed contribution/moderation/delete flow works. | PASS | 6.25 | 6.25 |
| 9.2.4 | New comparison/private-edit/full-reload flow works on V4. | PASS | 6.25 | 6.25 |
| 9.3.1 | D1 schema/owned storage implementation is connected rather than local-only. | PASS | 6.25 | 6.25 |
| 9.3.2 | Real private tool records survive reload. | PASS | 6.25 | 6.25 |
| 9.3.3 | Real public contributions survive write/edit/new-read. | PASS | 6.25 | 6.25 |
| 9.3.4 | New nested private saved fields survive a full V4 reload. | PASS | 6.25 | 6.25 |
| 9.4.1 | A real source-sync run and partial-failure state have been recorded. | PASS | 6.25 | 6.25 |
| 9.4.2 | Authorized operations exposes moderation, sync and delivery-state data. | PASS | 6.25 | 6.25 |
| 9.4.3 | New feed scopes are observed through the deployed sync→display path. | PASS | 6.25 | 6.25 |
| 9.4.4 | Required unattended/email operations and operating feedback/cadence are complete. | GAP | 6.25 | 0 |

원본V17 SHA256 `895aad1891a618b309f0ed1ee600ede5b45cfd93aa21062e5b4033796eac3859`. 후보 JSON SHA256 `b672e955b2949fd01c0aa73afbc0e0d4df030b10ad4a678ff5fe074cc6046042`. 채택 전 상태이며 최종 원본 변경권은root에게 있다.
