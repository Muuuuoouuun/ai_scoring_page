# Community Recovery Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Root alone edits Site and controls browser/publishing; agents independently inspect requirements and evidence.

**Goal:** Restore the same unsent community draft and context after authentication, and observe failure/recovery without fabricating a post.

**Architecture:** Stable context-based draft storage, explicit internal auth return route and separate form lifetime per context. Keep existing API/content ownership and the rule that login is not publication.

**Tech Stack:** React/Vinext, TypeScript, current Node tests, CUA actual UI, Sites.

- [x] Reproduce normal-path guest login loss before editing; preserve before/after screenshots and URL/form/filter evidence.
- [x] Add tests/community-draft.test.mjs for safe top-level/reply return targets, stable storage identity and unavailable/malformed storage handling; run RED.
- [x] Implement lib/community-draft.ts and connect components/Community.tsx, app/community/[id]/page.tsx. Keep content out of URLs; restore same context and require fresh consent; block a lossy navigation if storage fails.
- [x] Re-run normal-path login UI, direct review and reply; check exact restored fields and unchecked consent. Observe distinct context draft isolation.
- [x] Stop only the verified local dev handle, submit a controlled local draft while unavailable, inspect retained values/error, restart after confirmed termination and complete retry safely in local fixture scope.
- [x] Inspect deleted/hidden-parent replies with controlled local multi-author records; assess exact original7.2.4 evidence.
- [x] Reconcile expanded-screen inventory against actual visual observations without claiming200%/reader from resizing or AX text.
- [x] Run appropriate regression, Home, type and Sites build checks; independently review changed paths and fix proven failures.
- [x] Commit/push/save/deploy approved owner-private Site if source changed, inspect terminal result and final UI; preserve fixed score definitions and only update states with scoped authoritative evidence.

## V16 outcome

Completed the bounded source/UI recovery plan and privately deployed source 2d54809d51bc2cacd096bd403e187afadcda078a as Sites18. 259 regression +4 Home checks, type/build passed. Reconciliation of the expanded-screen inventory is complete; gate3.4.4 itself remains UNVERIFIED and its actual full cross-screen task is deferred, not marked done. Mac unlock/actual zoom/reader remain pending. The overall fixed 9-area goal remains incomplete at5/9≥88. See docs/audits/2026-09-13-v16-community-verification.md.
