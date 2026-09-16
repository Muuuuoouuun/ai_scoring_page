# V5 catalog correction verification — scoring gate 2.1.4

Checked: 2026-09-12 (Asia/Seoul). Compared the current `/Users/bigmac_moon/dev/ai_score/site/data/catalog.json` against `/private/tmp/ais-catalog-complete-audit-v5.md`. Parent identified the implementation commit as `beeb02a1e58ecdab6864d5206885b4d14d2d7ba7`; this check reads the working file and does not independently inspect Git. No web search, checkout modification, Sites action or browser action was performed.

Snapshot SHA256: `ba1fc5b97b553869b5d164762bbacaf081e3798b21a4e2ae8209605e233f0f24`.

## Finding

The factual corrections and principal source/audience/platform changes are incorporated exactly. One previously flagged source URL remains in the supplementary source list: Midjourney's old `www.midjourney.com/updates/version-8-2` link. The replacement latestUpdate is correct, so this does not undermine the newly selected Alpha release's date or scope; it is a source-list cleanup still needed for a fully resolved audit.

Current catalog contains all 20 products and 75 feature/source pairs. Comparison found no newly unsupported feature or contradictory plan/platform claim relative to the V5 report. All 20 configured logoSource URLs and local logo SHA256 hashes match the audited receipts. Fresh remote logo availability was not rechecked; the prior report's 403/provenance limitations continue to apply.

## Precise remaining source correction

- `site/data/catalog.json:615`, `midjourney.sourceUrls`: replace `https://www.midjourney.com/updates/version-8-2` with `https://updates.midjourney.com/version-8-2/`, or remove the obsolete supplementary link. The V5 audit already verified the latter official article and its 2026-07-24 date. The existing `latestUpdate.sourceUrl=https://updates.midjourney.com/alpha-changelog-9-2-26/` is correct and should remain.

## Recommendations not incorporated (not previously classified as factual failures)

1. **Make credit limitation, line 1248 and sourceUrls.** Current text still says `작업과 AI 처리에 크레딧이 소모되며 소진 시 실행이 멈출 수 있습니다.` The V5 report recommended the closer direct-source wording `작업과 AI 처리에 크레딧이 소모되며, 소진되면 업그레이드나 추가 크레딧 구매가 필요할 수 있습니다.` and adding `https://help.make.com/credits`. The current possibility statement was not classified as a factual error, but the recommendation remains unapplied.
2. **Make update scope, lines 1262–1263.** Generic audience/rollout placeholders remain. Prior verified optional replacements: audience `해당 앱 모듈을 이용하는 사용자`; rollout `변경 기록에 반영됨 · 개별 연결 조건 확인`.
3. **Supabase update scope, lines 1402–1403.** Generic placeholders remain. Prior verified optional replacements: audience `읽기 복제본을 관리하는 사용자`; rollout `대시보드 반영됨`.
4. **Figma mobile scope, optional.** The optional limitation/help link distinguishing mobile viewing/comments/prototype execution/mirroring from full desktop editing was not added. The current platform list is accurate and does not claim feature parity, so this is not a required correction. Previously verified link: `https://help.figma.com/hc/en-us/articles/1500007537281-Guide-to-the-Figma-mobile-app`.

Cursor's Projects feature still uses the general changelog URL while latestUpdate uses the specific Projects permalink. The V5 report specifically requested the latestUpdate permalink, which is incorporated; the feature source is not counted as a missed required correction.

## Per-product comparison

| Product | Result against V5 report |
| --- | --- |
| ChatGPT | PASS. September 11 desktop 26.908/app scope, platforms, feature conditions and exact source retained. Product icon unchanged. |
| Claude | PASS. Enterprise audience and beta rollout exactly incorporated. |
| Gemini | PASS. Windows 10+ audience and account/connection condition exactly incorporated. |
| Gemini Notebook | PASS. Consumer web/mobile audience and September 2 rollout exactly incorporated. Mobile setup, FAQ, and English import-help URLs all added. |
| Perplexity | PASS. macOS/Windows added, About the App source added, August 24 Computer in Email title/summary/date/source/audience/rollout all exactly match suggested correction. No unqualified Windows installed-app control claim added. |
| Cursor | PASS. Specific Projects latestUpdate URL, beta and September 10 gradual rollout exactly incorporated. |
| Midjourney | PASS latestUpdate. September 3 actual publication, Alpha audience, experimental scope, four-image/V8.2 summary and official permalink exactly incorporated. Supplementary old V8.2 URL still needs cleanup as above. |
| GPT-6 Astra | PASS. Direct launch URL, supported-account audience and gradual-access conditions exactly incorporated. |
| Claude Fable 5.1 | PASS. Paid-plan/API audience and protective conditions exactly incorporated. |
| Gemini 3.8 Flash | PASS. GA/free-paid scope exactly incorporated; grounding feature now cites pricing; logoNote now identifies Gemini family brand. |
| Notion | PASS. Notion Agent vs Custom Agents distinction, Business/Enterprise workspace-owner audience and provided status exactly incorporated. |
| Figma | PASS. Supported feature/price/platform claims retained. No invented update audience; optional mobile clarification noted above. |
| Canva | PASS. Collaboration feature source now directly points to pricing. Undated update remains null. |
| Slack | PASS. Big-mode gradual rollout now specified. August month-level update retains null day and avoids asserting every feature's full rollout. |
| Zapier | PASS. Feature/plan conditions and undated update retained. |
| Make | PASS existing broad claims; optional limitation/source and update scope recommendations remain as above. |
| Linear | PASS. September 3 Priority inbox retained; only third-party app approval has the documented paid-plan condition. |
| Supabase | PASS existing broad claims/update; optional audience/rollout clarification remains as above. |
| Vercel | PASS. Exact body-based 32→64GB summary includes image and legacy runtime creation; Sandbox audience and provided status incorporated. |
| GitHub Copilot | PASS. Exact September 11 usage-metrics title/summary/date/source and permission/policy audience incorporated. Copilot-scoped RSS and `GitHub Copilot 변경 소식` label agree. Vendor logo note retained. |

## Verification evidence and scope

The local comparison script checked 171 explicit predicates: entry/feature counts, requested exact correction strings, added source URLs, retained null dates/check dates, presence of feature source URLs, and all 20 local logo-source/hash matches. All tested predicates passed; the known supplementary-link and optional-copy findings above are reported separately and must not be obscured by that pass count. Machine-readable result: `/private/tmp/ais-catalog-v5-correction-check.json`.

Logo comparison used `/private/tmp/ais-ai-logo-receipts-v5.json` and `/private/tmp/ais-saas-logo-receipts-v5.json`. This is an implementation-to-audit verification, not another round of official-source research or hands-on product testing. No new factual claim or broader search was introduced.
