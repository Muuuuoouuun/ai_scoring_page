# AIs — 랭킹·정보·커뮤니티·추천 페이지 3장

2026-09-12. 생성 방식: 내장 Image Gen.

‘3장 버전’은 동일한 네 페이지를 한 장에 담은 구성안 3개로 해석했습니다. 각 장은 하나의 공통 레이아웃 방향이며, 왼쪽 위 랭킹 / 오른쪽 위 정보 / 왼쪽 아래 커뮤니티 / 오른쪽 아래 추천 순서입니다.

- 직접 첨부한 스타일 참고: [선택된 노랑·파랑 테마](../2026-09-12-themes/04-sunny-studio.png)
- 제품 기획: [v0.5](../../docs/2026-09-11-product-plan-v0.5.md)
- 랭킹 기준 참고: [제품 방향 명세](../../docs/superpowers/specs/2026-09-11-ai-score-product-direction-design.md)
- 모든 순위·횟수·서비스명·글·추천은 가상 데모 데이터입니다. 실제 통계, 사용자 후기, 검증된 제품 성능을 주장하지 않습니다.

## Open Portal

```text
Use case: ui-mockup. Create one high-resolution coherent PRODUCT PAGE FAMILY DESIGN BOARD for Korean AIs / AI Score. It contains FOUR DISTINCT PAGE SCREENS of ONE unified layout direction, arranged in a precise 2x2 grid. This is one design system extended to four pages, NOT multiple style options on a sheet. The user requested exactly three boards, each showing all four pages; this call produces just one board. Target output 3072 x 2304 pixels or similarly high natural 4:3 resolution. Use a cream presentation background, narrow clean gutters, minimal outside labels "랭킹", "정보", "커뮤니티", "추천". Each of four desktop page viewports should be almost 1440 x 1000, comfortably readable. No tilted screens, browser chrome, device bezels, dramatic shadows, collage overlaps, explanatory paragraphs outside the screens, or giant board title. Four equally sized full front-facing screens, do not crop any.
The attached existing AIs image is a STYLE REFERENCE. Preserve its selected sunny visual identity across ALL four pages: warm yellow surfaces, rich cobalt blue AIs logo and primary controls, ivory base, deep navy text, subtly rounded heavy Korean sans-serif, crisp rounded rectangles, thin outlines and simple clean icons. Large clear Korean headings, body text readable at native resolution (approx 24-28px on this board, equivalent to 14-16px product text). At most 2 font families. No dark theme, no serif type, no purple redesign, no robot or 3D mascot. Do not repeat the reference toolbox page as content; extend its language to the requested new pages.
Product source: /Users/bigmac_moon/dev/ai_score/docs/2026-09-11-product-plan-v0.5.md and its product-direction spec. Knowledge workers in Korean discover, understand, compare and use AI/SaaS tools and keep personal records. Keep global navigation labels "발견", "도구 찾기", "경험 나누기", "내 도구함". Page breadcrumbs expose these four NEW destinations: "도구 찾기 / 랭킹", "발견 / 정보", "경험 나누기 / 커뮤니티", "도구 찾기 / 추천". Match the active main destination appropriately in each screen. Use a small common natural-language search field with placeholder "하고 싶은 일로 찾기". Reference assets are fictional D / N / C monogram app icons named Draft, Note, Canvas. All lists, ranks, titles and community content are fictional mock data; visibly mark EACH screen "데모 데이터". No real vendor facts, real endorsements, actual logged-in user data or claim of actual live recommendations.
Date anchor: current date 2026-09-12 Asia/Seoul. Any seven-day mock ranking period is exactly "9.6–9.12"; do not invent future updates or mismatched weekdays.

CONTENT OF THE FOUR SCREENS, same content model across this board:
TOP LEFT — RANKING. Title "업무별 랭킹". Subline "같은 일을 하는 도구를 비교해보세요." One purpose selector, "보고서 작성"; period "최근 7일 · 9.6–9.12"; sort "저장 많은 순". A simple rank list of exactly THREE services: "1 Draft — 128회 저장", "2 Note — 96회 저장", "3 Canvas — 72회 저장", each with a small app icon and quiet compare checkbox. Primary button "선택한 도구 비교". Plain readable note "저장 수 기준 · 성능 순위가 아니에요". Link "집계 기준". No overall AI score, fake suitability percentage, trophy podium or unsupported performance rating. This is transparently a mock interest ranking for the selected task.
TOP RIGHT — INFORMATION. Title "알아두면 좋은 AI 정보". Subline "새 소식부터 바로 써보는 활용법까지." Two modest category choices "소식" and "활용 가이드". One featured editorial guide with a compact friendly blue/yellow DOCUMENT illustration appropriate to the reference theme, title "보고서 초안, 이렇게 시작해요", small label "활용 가이드". One supporting update row title "업데이트를 볼 때 확인할 세 가지", small label "소식". One primary "가이드 읽기" action and a quiet "출처·확인일 보기" link. Any date 9.11 or 9.12. No photoreal stock image, no fake news claims about actual vendors.
BOTTOM LEFT — COMMUNITY. Title "경험을 나누면, 선택이 쉬워져요". Two small content tabs "사용 후기", "선택 질문". Readable two- or three-row discussion list, no dense social dashboard. Main example titles: "회의 메모, 어떤 도구로 정리하세요?" with category "선택 질문"; "보고서 초안을 다듬어 본 과정" with category "사용 후기". Show small app/work tags and neutral author identities such as "예시 작성자", visible "예시 글"; no actual member testimonial or big fake engagement counts. Primary button "질문 남기기". Small link "커뮤니티 이용 안내". Subordinate label "작성 전 공개 범위를 확인하세요".
BOTTOM RIGHT — RECOMMENDATIONS. Title "나에게 맞는 방법 찾기". Current explicit interest strip "관심 업무: 보고서 작성" with small "조건 수정". Show at most THREE different methods, first visually primary: "지금 쓰는 Draft로 시작하기" / reason "등록한 사용 목적: 초안 작성" / caution "요금제 확인 필요" / primary "활용 안내 보기"; second "비슷한 도구 비교하기" / "Note · 작업 조건을 나란히 확인해요"; third "함께 쓰는 방법 살펴보기" / "Draft + Canvas · 복사해서 옮기는 방식". Do not imply automatic integration or verified capabilities; all visibly illustrative. Quiet feedback "관심 없음" and "추천 이유". No 97% match, guaranteed savings, auto-subscribe or unverified eligibility.

DESIGN DISCIPLINE:
Each page has one clear primary action and only one or two supporting areas. Do not showcase every product feature. Favor alignment, spacing, typographic grouping, separators; avoid nested cards or every text block in a box. Row-based lists should remain grouped. Keep the shared navigation and theme consistent across all four screens. Page titles, buttons and sample content must be readable accurate Korean. Simplify content instead of squeezing text. Board should look like four realistic polished product screenshots a designer can compare, not marketing artwork. Do not print the design direction name, board version or option number.

ONE SHARED LAYOUT DIRECTION FOR THIS ENTIRE BOARD: OPEN PORTAL.
In all four page viewports, use a bright warm yellow horizontal top navigation bar with cobalt AIs logo at left and four text navigation items at right, selected item cobalt pill. There is NO left sidebar. Below header, a slender shared search line sits at top-right, breadcrumb left. Main white/ivory content spans a centered generous-width column, with heading near the top and lots of whitespace.
Ranking uses a large horizontal rank table in the middle, with tool icon/name left and save-count right, three spacious rows and compare action bottom-right. Information uses an editorial feature in a 60/40 split: larger blue/yellow illustrated guide at left and a compact text update column at right, the art feels like the reference app's icons enlarged into a tasteful flat document scene. Community uses an open full-width forum list with big readable titles, small author/category lines and a clearly aligned question button at top-right; no left or right social widgets. Recommendation uses three horizontal solution objects stacked with thin dividers; the first gets pale yellow tint and prominent blue CTA, the next two are quieter. Do not force every page into exactly the same content boxes, but all share this TOPBAR + WIDE CONTENT scaffold.
This direction is spacious, immediately understandable, and content-forward. Four screens remain visually cohesive.
```

## Sidebar Workspace

```text
undefined
```

## Guided Split Pages

```text
undefined
```

