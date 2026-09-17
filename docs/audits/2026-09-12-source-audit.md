# AI Score source audit

Checked 2026-09-12. Read-only audit of `/Users/bigmac_moon/dev/ai_score/site/data/catalog.json` and `lib/source-sync.ts`. No site, Git, deployment, or browser UI changes. Official source pages were independently retrieved with web browsing. HTTP tests used ordinary requests with the existing `AIs source checker/1.0` user agent; no challenge bypass, alternate identity, or anti-bot workaround was used.

## Verified models

All three model names and IDs currently in the catalog are supported by official sources; do not replace them based on older remembered model lineups.

| Catalog model | Verification | Result |
| --- | --- | --- |
| GPT-6 Astra / `gpt-6-astra` | [Official model specification](https://developers.openai.com/api/docs/models/gpt-6-astra) | Correct. Official specification supports low/medium/high/xhigh/max reasoning, 1,050,000 context tokens, text/image input and text output, and the listed connected tools. |
| Claude Fable 5.1 / `claude-fable-5-1` | [Official model specification](https://platform.claude.com/docs/en/models/fable-5-1/overview) | Correct. Release date September 1, 2026; long-running coding/research and document work are supported claims. Cache read cost is one quarter of Fable 5's. |
| Gemini 3.8 Flash / `gemini-3.8-flash` | [Official model specification](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash) and [lifecycle table](https://ai.google.dev/gemini-api/docs/deprecations) | Correct stable model and September 2, 2026 release date. Input/output modalities and the catalog's preview computer use, unavailable Live/audio/image output, and unsupported minimal thinking claims agree with the model specification. |

GPT-6 Astra's September 3 announcement and restricted initial rollout are independently present in [ChatGPT release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes). Its API documentation can be monitored as an official, compact [Markdown representation](https://developers.openai.com/api/docs/models/gpt-6-astra.md): normal GET returned HTTP 200, `text/markdown`, 3,812 bytes. This is a supported format advertised by the documentation itself.

For Fable's release citation, the direct [announcement](https://www.anthropic.com/claude-fable-and-mythos-5-1) or specification is more precise than the mutable `/claude/fable` landing page. The landing page also confirms September 1, so the current date is not erroneous. Adding the specification URL to `sourceUrls` improves provenance for the actual API ID and platform claims.

## One concrete freshness discrepancy

ChatGPT's current September 10 Data plugin / Library update is accurately summarized from the [Help Center release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes). However, [the official ChatGPT and Codex changelog](https://learn.chatgpt.com/docs/changelog#codex-2026-09-11-app) has a newer ChatGPT desktop update dated September 11, 2026. It adds quick chat through floating Pets controls on macOS/Windows and Appshots on Windows. The release is desktop version 26.908.

If the catalog intends `latestUpdate` to mean the latest across all supported ChatGPT app platforms, update the curated item to that September 11 desktop release. Suggested Korean fields:

```json
{
  "title": "데스크톱 빠른 대화와 Windows Appshots",
  "summary": "macOS·Windows 데스크톱 앱에서 Pets의 플로팅 컨트롤로 빠른 대화를 시작하고, Windows에서 Appshots를 사용할 수 있게 되었습니다.",
  "publishedAt": "2026-09-11",
  "sourceUrl": "https://learn.chatgpt.com/docs/changelog#codex-2026-09-11-app"
}
```

## Supported machine-readable sync sources and HTTP evidence

| URL | Ordinary request result | Suitable use |
| --- | --- | --- |
| `https://help.openai.com/en/articles/6825453-chatgpt-release-notes` | HTTP 403 | Preserve as editorial evidence; do not claim a successful automated fetch. |
| `https://openai.com/products/release-notes/` | HTTP 403 | Official page advertises “Copy RSS feed URL”, but normal HTML fetching fails here. |
| `https://openai.com/products/release-notes/rss.xml` | HTTP 403 locally; web fetch recognizes XML but cannot render its content type | Not verified as operational for this runtime; do not use as a confirmed fix. |
| `https://learn.chatgpt.com/docs/changelog/rss.xml` | HTTP 200, `application/xml`, 1,236,881 bytes, 128 RSS items; ETag `"bea9b89c1942ef2068c9731658c3b5f0"` | Working official ChatGPT/Codex release feed; filter product scope before displaying under ChatGPT. |
| `https://openai.com/news/rss.xml` | HTTP 200, `text/xml`, 724,821 bytes, 1,192 items | General OpenAI company news, not a complete ChatGPT release feed. |
| `https://developers.openai.com/rss.xml` | HTTP 200, `application/xml`, 53,837 bytes, 138 items | Documentation pages, not a reliable release-news list; first entries are not chronological. |

The working changelog RSS is officially discoverable from the HTML of `https://learn.chatgpt.com/docs/changelog`: `<link rel="alternate" type="application/rss+xml" title="ChatGPT &#38; Codex changelog RSS feed" href="/codex/changelog/rss.xml">`. That relative URL returns 308 to `/docs/changelog/rss.xml`. The old `https://developers.openai.com/codex/changelog/rss.xml` also returns 308 to the same canonical feed. Following those documented redirects is ordinary supported access.

The feed's newest entry is September 11's quick chats/Appshots release. Items immediately after it include Codex Python SDK, Cygwin packages, and CLI releases; September 8's `ChatGPT for iOS` appears fifth. It has no category elements, so adding `feedUrl` without filtering would mislabel Codex CLI releases as ChatGPT updates.

## Minimal source-sync improvements

1. Add a narrowly scoped filter for the ChatGPT entry if adopting the working official changelog feed. Current stable app/mobile item URLs end with `#codex-YYYY-MM-DD-app` or `#codex-YYYY-MM-DD-mobile`. Those can identify desktop/mobile updates without ingesting `#github-release-...` CLI releases. Explicitly label the coverage as ChatGPT desktop/mobile; this feed does not replace every web-product Help Center update.
2. Apply product filtering and date sorting before retaining 15 items. `parseFeed` currently takes the first 15 raw blocks, so a burst of unrelated CLI items could hide app updates. Keep a bounded maximum input and item count.
3. Keep the Help Center URL in `sourceUrls` even if a separate feed drives live items. A blocked check should preserve the last verified editorial content, show the sync error, and retain its actual checked date. Do not label a different successfully fetched source as verification of all Help Center facts.
4. Use a separate content-monitor URL for compact model documentation when useful. For Astra, the official `.md` specification is operational and avoids whole-navigation hash noise. A single release landing page cannot reliably detect new API model capabilities or pricing changes.
5. The current 1.5 MB limit accepts the official changelog feed today, but with only about 263 KB of headroom. Make size-limit failures clear and retain the last successful payload. Do not assume the HTML changelog will fit: a normal HTML request exceeded 1.5 MB in this audit.

The current page-hash plus `review_needed` design detects source changes for editorial review; it does not automatically rewrite catalog features or Korean summaries. That is the accurate description of its current capability. No other critical factual discrepancy was established within this bounded model/ChatGPT audit.
