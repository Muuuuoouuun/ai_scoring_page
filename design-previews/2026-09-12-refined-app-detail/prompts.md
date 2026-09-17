# AIs — 앱 상세 디자인 프롬프트

2026-09-12. 내장 Image Gen. 이전 노랑·파랑 테마를 각 호출에 직접 첨부하고, 사용자의 최신 피드백에 따라 글꼴·장식·문구·정보 밀도를 성숙한 방향으로 재조정했습니다.

[시각 참고](../2026-09-12-themes/04-sunny-studio.png) · [제품 기획 v0.5](../../docs/2026-09-11-product-plan-v0.5.md)

## Balanced Product Detail

```text
Use case: ui-mockup. Create ONE full-size, single-screen Korean desktop app detail page for AIs, target 1536 x 1152 pixels, natural 4:3 ratio, front-facing edge-to-edge application screenshot. No multi-page board, no collage, no device frame, no marketing poster. The attached image is the PRIOR SELECTED COLOR THEME REFERENCE ONLY. The user's latest correction is authoritative: the previous designs look too childish. Keep the recognizable warm yellow + cobalt + ivory identity, but substantially refine the typography, copy, density and spacing into an adult professional product used by knowledge workers.
MANDATORY DESIGN CORRECTION:
Use restrained Korean neo-grotesk sans-serif, Pretendard-like, normal 400/500 and semibold 600 weights. Main title 30-34px, section titles 18-21px, body 14-16px. NO inflated round display font, no bubbly ultra-bold headings, no handwritten yellow underlines, no doodles, starbursts, celebration marks, chunky monograms, sticker pills, cartoon illustrations, 3D icons, thick card outlines or giant buttons. The logo is a small clean "AIs" wordmark in cobalt, without playful rays or tagline. App icon is a modest 48px flat cobalt tile with a simple D, never oversized.
Palette retains warm yellow as a purposeful selected marker or restrained surface accent, cobalt #2450D5 for primary action/links, very warm off-white #FCFBF7, deep slate #202838, fine neutral gray rules. Warm yellow can be #F1D865 and pale #FAF5DE. Not beige-only: cobalt and yellow must still clearly identify the brand. Use mostly base surfaces, fine row separators, minimal light neutral borders and 6-8px corners. No shadows except a whisper if needed. Section gaps about 28-36px, row heights about 40-48px, overall main margin about 40-52px. This is moderate information density with good grouping, not empty oversized hero space and not a crammed analytics cockpit.
COPY TONE: concise objective Korean product nouns and verbs. Headlines exactly "Draft", "업무별 평가", "주요 기능", "유사 앱". Buttons "서비스 열기", "도구함에 저장", "비교". No motivational slogans, conversational hero copy, "더 쉬워져요", "좋은 일을", "만들어볼까요" or forced friendliness.
Product source: /Users/bigmac_moon/dev/ai_score/docs/2026-09-11-product-plan-v0.5.md and /Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-ai-score-product-direction-design.md. User explicitly requests app details with scores, features, similar apps and useful supporting information. All displayed data is fictional demo material, NOT a real vendor evaluation. Display one clear small label near app title "가상 앱 · 평가·기능 예시". The dates are anchored to 2026-09-12 Asia/Seoul.
GLOBAL NAV: exactly four destinations "발견", "도구 찾기", "경험 나누기", "내 도구함"; "도구 찾기" active. Shared compact search placeholder "서비스·기능 검색". Breadcrumb "도구 찾기 / 문서 작성 / Draft". No duplicated headings, no repeated table-of-contents navigation unless useful for this layout.
APP OVERVIEW: title "Draft"; one factual short description "AI 문서 작성 도구"; small metadata "웹 · 한국어 · Free / Pro" (fictional). Primary blue action "서비스 열기 ↗", secondary outline "도구함에 저장". No enormous hero, no full app screenshot decoration.
EVALUATION DATA: Section "업무별 평가"; selected task "보고서 작성"; FIVE named dimension scores, measured out of 5, compact readable values and optional plain horizontal blue bars: "결과 품질 4.3", "작업 효율 4.1", "한국어 4.5", "비용 효용 3.8", "작업 연결 4.0". These are dimension scores, do NOT average into an invented total or 100-point score. Include scope metadata readable near the scores: "Pro v2.1 · 2026.09.11" and "3개 과제 × 3회 · 검토자 1명", with link "평가 기준·결과". Label "예시 평가" next to this section. Short evaluation interpretation, if space permits: "강점: 초안 구성" and "확인: 출처 정확성". Avoid stars, giant circular gauges, radars, trophies, percent match scores or AI hype.
FEATURES: Section "주요 기능"; structured table or compact grouped rows, with headers "기능", "지원 범위", "조건". Four rows EXACT content:
"문서 초안" | "지원" | "Free 이상"
"PDF 요약" | "제한 있음" | "Pro · 파일당 20MB"
"문서 내보내기" | "지원" | "DOCX · Markdown"
"외부 앱 연동" | "확인 필요" | "공식 문서 확인"
Use textual states, not color alone. Show simple muted status icons only if helpful. Footer link "기능 출처·확인일". These are mock features clearly covered by demo labeling.
SIMILAR APPS: Section "유사 앱"; exactly two candidates, small flat icons and concise relational differences:
"Note" / "문서 작성 · 자료 정리 중심"
"Outline" / "문서 작성 · 목차 구성 중심"
Each has a small "비교" action, no ratings invented for candidates, no three huge marketing cards. State the overlap implicitly via shared "문서 작성". Preserve feature differences instead of claiming universally better. Keep comparisons limited to current app plus these two.
OPTIONAL useful compact supporting area if the layout requires it: "요금제" with "Free / Pro", "세부 가격은 공식 사이트에서 확인", or plain links "공식 문서", "업데이트". Do not add unrelated feed, community engagement, fake reviews, usage metrics, promotions or financial charts.
Fit evaluation, features and similar apps visibly within the one desktop frame. Information dense enough for real product decisions with deliberate breathing room between sections. Prioritize typography and rules over card ornament. Accurate readable Korean. No concept label or option number inside the image.

LAYOUT DIRECTION: BALANCED PRODUCT DETAIL.
Compact 72px horizontal off-white global header, a thin warm-yellow brand strip at its top, cobalt AIs at left, four nav destinations, search at right. Active "도구 찾기" has a narrow cobalt underline, not a large pill. Centered full-width content with about 64px horizontal margins.
App identity and two actions form one compact horizontal header beneath breadcrumb, height about 115px. A fine rule ends the app overview. No hero headline or navigation sidebar.
Main middle region: LEFT ~48% width is "업무별 평가", with task selector and five beautifully aligned thin horizontal score bars/values, followed by scope and method link. RIGHT ~48% width is "주요 기능", a restrained four-row table with three columns, feature names visually primary, conditions secondary. Align the top and bottom of these two sections, separating them only with generous gutter or a fine vertical rule. Use tiny pale-yellow highlight only behind the selected task or evaluation header, keeping the rest ivory.
Below a full-width rule, "유사 앱" is a compact horizontal two-column comparison shelf; each app is a flat ROW with small icon, name, difference and compact compare button at far end. It must NOT become large cards. Bottom thin footer row "공식 문서" and "기능 출처·확인일". Moderate information density, about 65-75% of viewport actively used, remaining whitespace deliberately distributed. Design feels analytical and premium, not youthful, not overfilled.
```

## Compact Reference Workspace

```text
Use case: ui-mockup. Create ONE full-size, single-screen Korean desktop app detail page for AIs, target 1536 x 1152 pixels, natural 4:3 ratio, front-facing edge-to-edge application screenshot. No multi-page board, no collage, no device frame, no marketing poster. The attached image is the PRIOR SELECTED COLOR THEME REFERENCE ONLY. The user's latest correction is authoritative: the previous designs look too childish. Keep the recognizable warm yellow + cobalt + ivory identity, but substantially refine the typography, copy, density and spacing into an adult professional product used by knowledge workers.
MANDATORY DESIGN CORRECTION:
Use restrained Korean neo-grotesk sans-serif, Pretendard-like, normal 400/500 and semibold 600 weights. Main title 30-34px, section titles 18-21px, body 14-16px. NO inflated round display font, no bubbly ultra-bold headings, no handwritten yellow underlines, no doodles, starbursts, celebration marks, chunky monograms, sticker pills, cartoon illustrations, 3D icons, thick card outlines or giant buttons. The logo is a small clean "AIs" wordmark in cobalt, without playful rays or tagline. App icon is a modest 48px flat cobalt tile with a simple D, never oversized.
Palette retains warm yellow as a purposeful selected marker or restrained surface accent, cobalt #2450D5 for primary action/links, very warm off-white #FCFBF7, deep slate #202838, fine neutral gray rules. Warm yellow can be #F1D865 and pale #FAF5DE. Not beige-only: cobalt and yellow must still clearly identify the brand. Use mostly base surfaces, fine row separators, minimal light neutral borders and 6-8px corners. No shadows except a whisper if needed. Section gaps about 28-36px, row heights about 40-48px, overall main margin about 40-52px. This is moderate information density with good grouping, not empty oversized hero space and not a crammed analytics cockpit.
COPY TONE: concise objective Korean product nouns and verbs. Headlines exactly "Draft", "업무별 평가", "주요 기능", "유사 앱". Buttons "서비스 열기", "도구함에 저장", "비교". No motivational slogans, conversational hero copy, "더 쉬워져요", "좋은 일을", "만들어볼까요" or forced friendliness.
Product source: /Users/bigmac_moon/dev/ai_score/docs/2026-09-11-product-plan-v0.5.md and /Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-11-ai-score-product-direction-design.md. User explicitly requests app details with scores, features, similar apps and useful supporting information. All displayed data is fictional demo material, NOT a real vendor evaluation. Display one clear small label near app title "가상 앱 · 평가·기능 예시". The dates are anchored to 2026-09-12 Asia/Seoul.
GLOBAL NAV: exactly four destinations "발견", "도구 찾기", "경험 나누기", "내 도구함"; "도구 찾기" active. Shared compact search placeholder "서비스·기능 검색". Breadcrumb "도구 찾기 / 문서 작성 / Draft". No duplicated headings, no repeated table-of-contents navigation unless useful for this layout.
APP OVERVIEW: title "Draft"; one factual short description "AI 문서 작성 도구"; small metadata "웹 · 한국어 · Free / Pro" (fictional). Primary blue action "서비스 열기 ↗", secondary outline "도구함에 저장". No enormous hero, no full app screenshot decoration.
EVALUATION DATA: Section "업무별 평가"; selected task "보고서 작성"; FIVE named dimension scores, measured out of 5, compact readable values and optional plain horizontal blue bars: "결과 품질 4.3", "작업 효율 4.1", "한국어 4.5", "비용 효용 3.8", "작업 연결 4.0". These are dimension scores, do NOT average into an invented total or 100-point score. Include scope metadata readable near the scores: "Pro v2.1 · 2026.09.11" and "3개 과제 × 3회 · 검토자 1명", with link "평가 기준·결과". Label "예시 평가" next to this section. Short evaluation interpretation, if space permits: "강점: 초안 구성" and "확인: 출처 정확성". Avoid stars, giant circular gauges, radars, trophies, percent match scores or AI hype.
FEATURES: Section "주요 기능"; structured table or compact grouped rows, with headers "기능", "지원 범위", "조건". Four rows EXACT content:
"문서 초안" | "지원" | "Free 이상"
"PDF 요약" | "제한 있음" | "Pro · 파일당 20MB"
"문서 내보내기" | "지원" | "DOCX · Markdown"
"외부 앱 연동" | "확인 필요" | "공식 문서 확인"
Use textual states, not color alone. Show simple muted status icons only if helpful. Footer link "기능 출처·확인일". These are mock features clearly covered by demo labeling.
SIMILAR APPS: Section "유사 앱"; exactly two candidates, small flat icons and concise relational differences:
"Note" / "문서 작성 · 자료 정리 중심"
"Outline" / "문서 작성 · 목차 구성 중심"
Each has a small "비교" action, no ratings invented for candidates, no three huge marketing cards. State the overlap implicitly via shared "문서 작성". Preserve feature differences instead of claiming universally better. Keep comparisons limited to current app plus these two.
OPTIONAL useful compact supporting area if the layout requires it: "요금제" with "Free / Pro", "세부 가격은 공식 사이트에서 확인", or plain links "공식 문서", "업데이트". Do not add unrelated feed, community engagement, fake reviews, usage metrics, promotions or financial charts.
Fit evaluation, features and similar apps visibly within the one desktop frame. Information dense enough for real product decisions with deliberate breathing room between sections. Prioritize typography and rules over card ornament. Accurate readable Korean. No concept label or option number inside the image.

LAYOUT DIRECTION: COMPACT REFERENCE WORKSPACE.
A narrow 180px left navigation sidebar with extremely pale warm yellow #FAF5DE background, small cobalt AIs wordmark. FOUR global nav links with regular 14-15px text, no childish icons. Active "도구 찾기" is indicated by a thin cobalt left marker and subtle tint. Bottom "도움말". Sidebar must look calm, grown-up, understated.
The remaining main app surface uses a compact search toolbar across the top. Content has 42px main margins. Breadcrumb then compact app identity: 48px D icon, "Draft" 32px, factual description and metadata beneath; actions aligned right. Fine separator.
Two-column information structure below: MAIN CONTENT about 72% and a RIGHT COMPARISON RAIL about 25%, separated by one vertical hairline. At the top of main content, "업무별 평가" and selected task "보고서 작성". Show the five scores as a refined COMPACT HORIZONTAL SCORE STRIP: five evenly spaced groups label over value like "4.3 / 5", with thin vertical dividers, no large metric cards. Each score label fits on one or two lines. Metadata and "평가 기준·결과" placed directly beneath so score scope is not hidden.
Then "주요 기능" fills main content as a four-row reference table with clean column alignment and restrained row rules. Mild zebra tint optional, not heavy. Bottom main content has a short two-line "평가 요약": "강점: 초안 구성" / "확인: 출처 정확성". These are short usable reference notes, no paragraphs.
Right comparison rail starts with "유사 앱", two vertically stacked COMPACT APP ENTRIES separated by lines, small name/icon and difference, "비교" buttons. Below these, quiet "요금제" with "Free / Pro" and "세부 가격은 공식 사이트에서 확인". One understated "공식 문서" link. No giant sidebar cards.
Optimize for returning users scanning scores, features, and alternatives without scrolling. This is the densest of the directions, but preserve 14-16px body, obvious column grouping and 28px space between major sections. Do not imitate the reference's exaggerated rounded typography, slogan or excessive saturated yellow.
```

## Evaluation Dossier

```text
undefined
```

