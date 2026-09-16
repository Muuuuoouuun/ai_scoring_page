# V23 현재 사용자 목표 — 한정 읽기 전용 감사

2026-09-15. 구체적 개선 사항 **2개**다. 사용자 목표를 예전 88점·이메일 게이트로 재정의하지 않았다. 사용자가 보류한 실제 외부 OAuth 계정 연결은 미구현 결함으로 세지 않는다. root가 전달한 기준은 HEAD `5e645626b5dde2a28f27fab07dcc20603bec70e4`, V22 소유자 비공개 배포이며, 검토자가 Git/Sites로 이를 새로 조회한 것은 아니다.

현재 34개 카탈로그, 기능·최신 업데이트 구조, 로컬 로고 파일, 참여 API, 개인 등록/정보 연결, 유사 기능 추천/관련 혜택 경로를 읽었다. Site·원본 문서·브라우저·운영 데이터·외부 계정은 수정하거나 연결하지 않았다. 새 시각 렌더링이나 공식 웹 출처의 최신 재검수를 수행한 감사는 아니다.

## 1. P2 — Canva에 이미 등록된 이미지 편집 근거가 유사 기능 추천에서 전부 누락된다

- 발생 위치: [tool-similarity.ts:10](/Users/bigmac_moon/dev/ai_score/site/lib/tool-similarity.ts:10), 기능 추출 [같은 파일:27](/Users/bigmac_moon/dev/ai_score/site/lib/tool-similarity.ts:27).
- 현재 입력 근거: [catalog.json:1056](/Users/bigmac_moon/dev/ai_score/site/data/catalog.json:1056)의 Canva `AI 편집과 브랜드 관리`는 설명에 **배경 제거**를 명시하고 조건부 상태·공식 sourceUrl을 가진다. [Microsoft Copilot:1562](/Users/bigmac_moon/dev/ai_score/site/data/catalog.json:1562)에는 `이미지 생성·편집`과 업로드한 이미지 수정 근거가 있다.
- 실제 실행: 현재 `similarTools(findTool('canva'), catalog)`는 `[]`; Canva→Microsoft Copilot의 매치도0개다. 직접 Canva를 기준으로 선택하거나 내 도구함에 등록하면 [SimilarRecommendations.tsx:25](/Users/bigmac_moon/dev/ai_score/site/components/SimilarRecommendations.tsx:25)와 [ServiceInsights.tsx:27](/Users/bigmac_moon/dev/ai_score/site/components/ServiceInsights.tsx:27)의 ‘근거가 충분하지 않음/대안을 찾지 못함’ 경로가 된다.
- 원인: 이미지 편집의 `matches`는 기능명 `n`만 보고 설명 `d`를 무시한다. 명시적인 편집 근거가 설명에 있어도 해당 기능명이 정규식 표현을 포함하지 않으면 빠진다. ‘어떤 서비스든 대안이 반드시 있어야 한다’는 새 요구가 아니라 현재 등록 근거의 실제 누락이다.
- 최소 수정: 이미지 편집 관련 제목과 설명의 `배경 제거`처럼 명시적인 편집 동작을 함께 확인하는 좁은 규칙을 추가하거나 이 기능에 명시적 capability ID를 둔다. 전체 설명에서 ‘이미지’만 찾거나 Canva의 모든 기능을 다른 앱과 동등하다고 취급하지 않는다. 조건부 플랜·범위·출처는 그대로 표시한다.
- 필요한 회귀: 현 Canva↔Microsoft Copilot(또는 근거가 있는 이미지 편집 후보)에 `image-editing` 매치가 생기고, 이미지 입력만 있는 기능·브랜드 관리만 있는 기능은 이 매치가 없어야 한다. 이미지 생성까지 자동 가산하지 않는다.

## 2. P2 — ‘해당하지 않음’으로 저장한 혜택이 개인 화면에서 ‘조건 확인 필요’로 되돌아간다

- 발생 위치: [ServiceInsights.tsx:18](/Users/bigmac_moon/dev/ai_score/site/components/ServiceInsights.tsx:18)의 offers 선택과 [같은 파일:29](/Users/bigmac_moon/dev/ai_score/site/components/ServiceInsights.tsx:29)의 배지; [promotion-facts.ts:33](/Users/bigmac_moon/dev/ai_score/site/lib/promotion-facts.ts:33)가 `ineligible`과 `unknown`을 같은 사유로 합친다.
- 입력 경로는 실제 [PromotionPreferences.tsx:8](/Users/bigmac_moon/dev/ai_score/site/components/PromotionPreferences.tsx:8)의 **‘해당하지 않음’** 선택이다. 저장된 예시는 `promotionEligibility['notion-individual-education']='ineligible'`이다.
- 재현: 실제 `ServiceInsights` TSX를 React 정적 렌더링하여 Notion 도구 기록1건과 위 설정을 제공했다. 결과에는 해당 교육 혜택이 ‘연결된 혜택’으로 계속 포함되고, 배지는 **‘조건 확인 필요’**, title은 **‘현재 자격 조건 재확인 필요’**다. ‘해당하지 않음’ 표시가 없다. API나 운영 설정을 변경한 재현이 아니다.
- 영향: 사용자가 이미 제외한 자격을 모르는 상태로 취급하여 개인 혜택 확인 작업을 반복하게 한다. 현재 녹색 ‘일치’나 이메일 발송으로 잘못 승인된다는 뜻은 아니며, 개인화된 혜택 표시의 상태 구분 오류다. 공개 전체 혜택 목록에 해당 혜택을 남겨 두는 것 자체는 결함이 아니다.
- 최소 수정: 개인 ‘연결된 혜택’에서 명시적 `ineligible`을 제외하거나 **‘내 조건에 해당하지 않음’**으로 구분하고 추천 수에 포함하지 않는 정책을 일관되게 적용한다. `unknown`·조건 개정 후 stale·명시적 비해당을 서로 구분한다. 중요한 이전 안내의 정정 이력을 없애는 변경은 필요하지 않다.
- 필요한 회귀: 같은 Notion 혜택에 대해 `unknown`은 확인 필요, `ineligible`은 비해당/개인 후보 제외, 현재 지문이 일치하는 `eligible`만 나머지 조건 검사로 진행해야 한다. UI의 사용자 선택→저장→개인 목록 재조회에서도 같은 의미가 유지돼야 한다.

## 검증과 한계

- 기존 `service-linking`, `tool-similarity`, `ongoing-promotions` 테스트를 현재 코드에서 실행해 **20/20 PASS**를 확인했다. 충돌 저장·소유권 격리·메모 보존·구독 이력/결제 행 보존·이미지 입력 오탐 방지·혜택 시간 경계 등의 기존 회귀는 통과한다. 위 두 사례는 그 테스트에 없다.
- 34개 항목이 실제 catalog에 있으며 참조하는 로컬 로고 파일34개가 모두 존재한다. 파일 존재를 실제 이미지 decode/시각 배치 또는 현재 공식 로고의 진위 재검수로 바꾸지 않았다.
- 참여 API에는 후기/평점·글·답글·기능 제안 입력과 수정/삭제 경로가 있다. 이번 한정 검토에서 추가로 입증한 참여 입력 결함은 없다. 이것이 새 운영 사용자 검증이나 모든 흐름의 재실행 성공을 뜻하지 않는다.
- 이번 소스 감사로 디자인·모바일 배치를 새로 PASS 판정하지 않았다. 실제 외부 OAuth 연결은 사용자 보류이며, 이번 두 문제의 수정·재현에 외부 연결은 필요 없다.
- 억지로3개를 채우지 않았다. 실제 카탈로그의 다른0결과를 전부 결함으로 취급하지 않는다. 보조 재현의 Supabase→Notion0매치는 기반 서비스/업무 도구의 기능 경계를 추가로 검토해야 하므로 별도 확정 지적으로 채택하지 않았다.

재현 파일:

- [독립 실행 스크립트](/private/tmp/ais-v23-goal-repro.mjs)
- [실제 결과 JSON](/private/tmp/ais-v23-goal-repro.json)

스크립트는 실제 catalog/similarity/promotion 모듈과 실제 ServiceInsights 본문을 사용한다. 정적 렌더링에서 로고·아이콘만 빈 컴포넌트로 대체했으므로 그 시각 요소를 검증하지 않는다. 실행 메모리 SQLite 외 DB를 사용하지 않고 외부 fetch는 하네스에서 금지했다.
