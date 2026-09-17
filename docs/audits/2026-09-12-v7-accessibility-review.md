# V7 bounded accessibility and reflow source review

Date: 2026-09-12. Scope: current working-tree React/CSS source, read only. Parent is changing this tree concurrently; this report includes a final reread after the first fixes appeared. No browser, rendered viewport, screen-reader, contrast, or performance test was run by this reviewer. No source, Git, or Sites state was changed.

The strongest initial focus and billing-overflow risks have now been addressed in source. Six remaining bounded improvements are listed below. They are source findings or specific rendering risks, not a claim that an assistive-technology or viewport test failed.

## Fixed worksheet boundaries

The existing 152-gate worksheet and its weights remain unchanged. This review is relevant to:

- **3.1** shared theme/tokens/type; **3.2** title/section/action/data hierarchy; **3.4** shared shell/forms/responsive treatments.
- **5.1** responsive/reflow behavior; **5.2** reading, contrast, textual status meaning.
- **3.1.4, 3.2.4, 3.4.4:** a source inspection cannot establish the required complete rendered visual assessments.
- **5.1.4:** a source inspection cannot establish the required measured zoom/reflow and complete screen matrix.
- **5.2.4:** labels and live-region code are useful prerequisites, but cannot establish the required observed screen-reader run.

No new points are awarded here. Existing representative runtime evidence remains valid only for the screens and dimensions it actually exercised.

## Remaining findings

### P2 · Comparison criteria are visually row headers but semantically data cells

Source: `/Users/bigmac_moon/dev/ai_score/site/app/compare/page.tsx:6`.

The comparison matrix has tool names in header cells, but every first-column criterion (`적합한 업무`, `요금 구조`, `주요 기능`, `검수 평가`, etc.) is a `<td>`, often containing only `<strong>`. This omits the intended row-header relationship from the table structure. The `.compare-scroll` wrapper also has no accessible name or explicit keyboard focusability, unlike the newly fixed billing wrappers. CSS at `site/app/globals.css:3` deliberately gives this table a 650px minimum width, making the scrolling case relevant on mobile.

Smallest fix: use `<th scope="row">` for criterion cells and `scope="col"` on column headings; add a concise caption (visually hidden is sufficient if the visible heading already provides the same information). Give the scrolling wrapper a name and keyboard access, matching the billing pattern. Preserve a visible focus outline. Verify actual horizontal keyboard scrolling on the supported browser; do not assume `tabIndex` alone proves it.

Worksheet relevance: 3.2.3, 5.1.4, 5.2.4. This is a code-confirmed missing table relationship; the actual screen-reader effect remains untested.

### P2 · Ranking and administration tables still lack the new overflow containment

Sources: `/Users/bigmac_moon/dev/ai_score/site/components/Ranking.tsx:7`; `/Users/bigmac_moon/dev/ai_score/site/components/Admin.tsx:4`; shared wrapper at `/Users/bigmac_moon/dev/ai_score/site/app/globals.css:18`.

Ranking renders four columns, including a logo/name and a nonwrapping comparison button; the operations table renders five columns including a localized timestamp. Both render the table directly, without `.table-scroll`. The new billing fix therefore does not cover these principal table paths. Their intrinsic minimum width can exceed a narrow content area or the content width remaining under zoom.

Smallest fix: reuse the bounded, named scroll region for these tables, retain normal text wrapping inside cells, and verify with populated data at the narrow viewport and zoom level. Do not apply `overflow-x:hidden` to the document, because that would conceal unreachable content. The ranking empty state does not exercise this risk.

Worksheet relevance: 3.4.3, 3.4.4, 5.1.4. Overflow is a concrete source risk; no document overflow was measured by this reviewer.

### P2 · Current navigation state differs between visible and accessible markup

Sources: `/Users/bigmac_moon/dev/ai_score/site/components/Shell.tsx:8`; `/Users/bigmac_moon/dev/ai_score/site/app/news/page.tsx:8`.

On `/tools/...`, Header gives “도구 탐색” its active visual class, but its separate `aria-current` predicate does not include the `/tools` case. On `/news`, the active update/event/feed links and active category use only visual classes. The local navigation is also unnamed, so it is harder to distinguish from “주 메뉴” by landmark navigation.

Smallest fix: calculate the Header active predicate once and use it for both styling and `aria-current`. Add an accessible label to the local news navigation and `aria-current="page"` to the selected destination/category link. These are ordinary navigation links; adding ARIA tab roles would introduce an unnecessary keyboard contract.

Worksheet relevance: 3.4.1, 5.2.4. This is a code-confirmed mismatch in current-state exposure.

### P3 · Repeated tool actions have indistinguishable accessible names

Sources: `/Users/bigmac_moon/dev/ai_score/site/components/ToolUI.tsx:8` and `:9`; saved-content edit buttons also appear repeatedly in `/Users/bigmac_moon/dev/ai_score/site/components/MyWorkspace.tsx:18`.

Each card/table cell exposes the same “비교” / “비교에 담김” or “도구함에 저장” / “저장됨” name. A user navigating only buttons receives the action without its target. These controls are labelled; the problem is missing target context, not absent names. The existing `aria-pressed` on comparison controls is good.

Smallest fix: include the tool name in the accessible name while preserving the visible action wording, for example `ChatGPT 비교` / `ChatGPT 비교에 담김` and `ChatGPT 도구함에 저장`. Apply the same small pattern to repeated “기록 수정” actions using the saved item title. Avoid putting long bodies or notes in labels.

Worksheet relevance: 5.2.4.

### P3 · Some in-place result changes lack concise status feedback

Sources: `/Users/bigmac_moon/dev/ai_score/site/components/BillingReport.tsx:11`–`:15`; `/Users/bigmac_moon/dev/ai_score/site/components/Ranking.tsx:7`; `/Users/bigmac_moon/dev/ai_score/site/components/ToolReviews.tsx:9`; `/Users/bigmac_moon/dev/ai_score/site/components/Community.tsx:16`; `/Users/bigmac_moon/dev/ai_score/site/components/Admin.tsx:4`.

Applying a billing period updates totals and rows below the focused button without a status region. Ranking/review/community filter requests likewise have no concise completion announcement; several initial loading strings are plain paragraphs. Ranking and initial Admin errors lack `role="alert"`. ToolReviews retains the previous scores while a new filter request is pending without exposing a pending state. These are gaps in programmatically exposed state, not evidence from a screen-reader run.

Smallest fix: add one concise polite status message per changing result area (applied period and schedule count; loading/completed result count), and `aria-busy` during asynchronous refresh where appropriate. Give dynamically inserted blocking errors an alert role. Keep the whole table/list outside live regions to avoid excessive announcements. Existing `GlobalSearch.tsx:12`, `Explore.tsx:8`, and the shared toast at `Provider.tsx:13` already provide status feedback and should not be replaced wholesale.

Worksheet relevance: 3.2, 5.2.3, 5.2.4.

### P3 · Guide sample surfaces reference undefined theme tokens

Source: `/Users/bigmac_moon/dev/ai_score/site/app/globals.css:15`, with declared tokens at `:3`.

`.sample-input` uses `var(--border)` and `var(--surface)`, but the stylesheet defines `--line`, `--soft`, and `--paper`, not those two names. Without a fallback, the intended border/background declarations do not resolve. This undermines the intended visual distinction of sample content even though whitespace and long-text wrapping are set correctly.

Smallest fix: use the existing `--line` and the intended existing surface token (`--soft` or `--paper`), or define the two tokens deliberately. Confirm the intended sample-vs-body hierarchy in the rendered guide.

Worksheet relevance: 3.1.1, 3.2.1, 3.4.3. No rendered appearance claim is made.

## Initial risks now addressed in current source

| Initial risk | Source present at final reread | Remaining verification |
|---|---|---|
| Mobile nav opens before its trigger in DOM, leaving forward keyboard users after the links | `Shell.tsx:8` now focuses the first nav link, supplies `aria-controls`, handles Escape with trigger restoration, and closes when focus leaves the header | Actual mobile Tab/Shift+Tab/Escape and reading-order run |
| Community edit/reply form mounts above its initiating control | `Community.tsx:14` now focuses the first enabled field and restores the previous connected element on unmount; form has an accessible name | Actual reply/edit/close/save focus behavior, including refresh that replaces a trigger |
| Billing `.table-scroll` had no CSS rule or named keyboard region | `globals.css:18`, `:21` now contain width/overflow rules; `BillingReport.tsx:18`–`:19` now have named focusable regions | Populated table containment and keyboard scrolling at narrow/zoomed sizes |
| Long personal/public titles and flexible row content could retain excessive minimum width | `globals.css:19`–`:20` add `min-width:0` and wrapping; `:23` adds mobile actions/badges/footer wrapping | Long unbroken title/name/URL/amount stress cases and document width measurement |

Other useful existing prerequisites: shared visible focus outline and reduced-motion rules (`globals.css:3`, `:5`); native labelled dialog with Escape handling and focus restoration (`Modal.tsx:4`); native wrapped form labels and mobile input sizing; `lang="ko"` in the document; textual uncertainty and error labels. These are source evidence, not substitutes for the outstanding observed-run gates.

## Minimal bounded verification for the parent

1. At the existing narrow viewport and at 200% zoom, use populated billing, comparison, ranking, and administration tables; measure document width separately from each intentional table scroller.
2. With keyboard only, open/close mobile navigation, open reply/edit from below the form, close/save it, and verify focus remains visible and returns to a sensible connected target.
3. For the still-open screen-reader gate, record the actual reader/browser and demonstrate main/local navigation state, one comparison table row/column relationship, repeated action target names, and one filter/period result announcement. A DOM inspection alone does not close that gate.

No new features, billing scope, or score weights are proposed by this review.
