# V10 rendered screen audit

Status: principal D/M audit and V10 improvements published; complete expanded-state/zoom/reader matrix remains in progress. The overall 9-area goal remains active.

Reference: selected ivory/cobalt/pale-yellow images are inspiration, not a pixel-copy target. Preserve mature copy and retained routes/features. Site base HEAD 0188f74e26d93f9f7073ea0030ecdd4399c58738.

1. Inventory principal pages and expanded private/admin states independently from source.
2. Capture and inspect actual desktop/mobile screens; store exact screenshot bytes plus DOM-backed overflow measurements. Keep production and local fixture observations separate. Existing `.png` names may contain JPEG/JFIF screenshot bytes.
3. Fix reproducible issues. Initial production observations: long unbroken Explore query produces 1120px scroll width at 375px client width; overview anchor begins above its 64px sticky header.
4. Check corrected states locally, complete available visual matrix, run applicable checks and publish exact source privately if changed.
5. Obtain independent frozen-gate review. Change only criteria supported by actual evidence. Do not equate screenshots/narrow viewport with a real screen-reader or 200% browser zoom run.

Screens: docs/audits/v10-screens/. Native macOS surface is locked; in-app browser works. No source or user data deletion, access expansion, or external notification is needed for this audit.

Execution:28 principal screens paired and independently critiqued; invalid full-page captures replaced; local edge-case fixes and production checks recorded in docs/audits/2026-09-12-v10-visual-verification.md. Final source308f4d944d3e1e765292f34b0c7ac5730443a30a privately published as Sites version12 at2026-09-12T11:26:55.039392Z. Two frozen visual-observation gates earn6.25 each; all other statuses unchanged. Expanded comparison fine print, full state matrix, real browser zoom and screen-reader remain incomplete. A new independent20-query relevance benchmark found8 failures; it is a follow-up issue list, not additional score credit.
