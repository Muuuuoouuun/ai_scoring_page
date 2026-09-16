# V11 최종 고정 회귀 2 — 36/36 최소 기준 충족

2026-09-12, KST 20:59:58 소스 스냅샷. **기존 20개와 공개된 추가 16개 모두 사전 고정 기준을 충족했다.** 기대 문장·후보·제외 목록·조건 기준은 변경하지 않았다. 초기 32/36과 다음 35/36 관찰은 별도 파일로 보존했다.

## 6.2.4 원문

> A varied set of realistic purpose/condition queries has evaluated relevance.

이 문항은 서로 다른 현실 목적·조건 질의에 대한 관련성 평가가 수행됐는지를 묻는다. 이번 보고서는 그 문항의 증거에 관한 의견만 제공하며 게이트 점수나 상태 파일을 수정하지 않는다.

## 6.2.4에 연결할 증거와 의견

**평가 수행 요건을 충족했다고 기록할 근거가 있다.** 문서·리서치·디자인·개발·개인정리·자동화의 다양한 목적, 명확한 부정 및 제품명 제외, 긍정 이미지 문맥, 무료·한국어·합성 도구함 조건, 기능별 요금 충돌, 미확인 오프라인·기기 내 처리, 미등록 목적을 포함한 36개를 평가했다. 최초 기대를 출력 전에 고정했고 실패를 공개·보존한 후 동일 기준으로 회귀했다. 이번 스냅샷은 그 고정 최소 기준 36개를 모두 충족한다.

근거 파일:

- [기존 20개 고정 사례](/private/tmp/ais-v10-purpose-query-cases.json), SHA-256 `322fb90697148e6b77a53e8de2ca720f4cfd3041433bfb882113aacca294bd9c`.
- [추가 16개 고정 사례](/private/tmp/ais-v11-relevance-holdout-cases.json), SHA-256 `d0103236ed0b9f064c5fefa919034f777926ddbb952b40e2e79d973b05e9ce64`.
- [이번 전체 결과 JSON](/private/tmp/ais-v11-relevance-final-regression-2.json): 질의 해석, 전체 함수 결과, 추천 상위 6개, matchedFeatures, unverifiedRequirements, 원래 기대 및 체크별 판정.
- [실제 소스 스냅샷](/private/tmp/ais-v11-relevance-final-regression-2-source-snapshot.json), [회귀 실행기](/private/tmp/ais-v11-relevance-final-regression-2-runner.cjs), [고정 기준 판정기](/private/tmp/ais-v11-relevance-final-regression-2-evaluate.cjs).
- [초기 32/36 보고서](/private/tmp/ais-v11-relevance-initial-observations.md), [35/36 보고서](/private/tmp/ais-v11-relevance-final-regression.md). 두 버전의 원본 JSON과 보고서를 이번 실행 전후 해시로 확인해 보존했다.

실제 모듈·JSON을 먼저 읽고 그 스냅샷만 재귀 TypeScript 로더에서 메모리로 실행했다. 스냅샷 시각은 `2026-09-12T11:59:58.701Z`이며 실행 전후 소스 6개의 해시가 동일했다. 사이트 소스·브라우저·DB·계정·운영 데이터 변경은 없고 네트워크 또는 외부 도구 작업 호출도 없었다. 실제 카탈로그에 연결된 공식 feature 조건을 사용했고 외부 제품 기능을 새로 추정하지 않았다.

## 한계 — 게이트 의견과 구별

이것은 **에이전트가 고정한 회귀 벤치마크**다. 추가 16개도 이미 구현자에게 공개됐으므로 이번 통과를 새로운 홀드아웃의 일반화 성능으로 설명할 수 없다. 실제 사용자 연구·사용자 성공률·실제 외부 제품 작업 완료 검증이 아니다. 36/36을 추천 정확도 100%로 표현하지 않는다.

고정 긍정 기준은 적절한 후보 하나가 상위 3개에 있는지 보는 최소 기준이다. 상위 6개 전체의 정밀도에는 다음 한계가 실제로 남아 있다.

- I1 `SNS 콘텐츠`는 Canva가 1위지만 Vercel도 2위다. 콘텐츠 전송과 콘텐츠 제작의 차이가 남는다.
- P1 `개인 업무 정리`에는 Vercel이 4위로 남는다. 개인 프로젝트의 무료 플랜이라는 문구와 개인 업무 정리는 다른 목적이다.
- H03 `이미지가 필요해요`는 이미지 생성 앱이 상위 3개지만 뒤에는 이미지 입력·분석 근거의 모델도 남는다.
- H10 Midjourney 제외 이미지 생성에는 Gemini·ChatGPT 다음에 Perplexity·Claude·Fable·Notebook이 이어진다. 긍정 대상과 행동이 함께 있는 문장의 하위 후보 정밀도는 완전하지 않다.
- H07 조건별 처리 흐름은 Make 1위지만 Figma도 2위다. 자동화 흐름과 화면 프로토타입의 흐름이 어휘상 겹친다.

조건의 미확인 안내는 실제 기능 지원을 검증한 것이 아니다. 새 소스의 모든 부정·비필수 정규식 경계를 이번 고정 36개가 전수 검증하는 것도 아니다. 이번 평가에서는 새 홀드아웃을 추가하지 않았다. 계정 관련 항목은 합성 owned 범위 필터이며 실제 로그인 전환·세션 격리 테스트를 대신하지 않는다.

## 마지막 실패의 수정 및 조건 표시 근거

**H11**에서 `코딩 도구는 원하지 않아요. 팀 프로젝트의 이슈와 개발 주기를 관리`를 코딩 중심 목적 제외로 해석한다. 실제 결과는 Linear → Figma → Claude이며, 고정 제외 ID인 Cursor·GitHub Copilot·GPT-6 Astra·Claude Fable·Gemini Flash는 전체 함수 결과에도 없다. 이전 35/36에서 Astra가 4위로 노출되던 실패를 해결한 관찰이다. Linear 1위를 유지해 긍정적인 개발 주기 관리 목적도 남겼다.

**C5**의 무료 그룹 허들 요청은 Slack 하나만 반환한다. 실제 matchedFeatures에 허들의 유료 그룹 조건과 공식 URL이 있고 Recommend는 feature condition/sourceUrl을 표시하는 분기를 유지한다. 해당 구체적 조건을 보여준다는 기존 기준을 충족하며 무료로 그룹 허들을 쓸 수 있다고 확인한 것은 아니다.

**H14**는 Zapier와 Make 각각 `네 단계 처리의 무료 플랜 이용 범위`를 unverifiedRequirements로 반환한다. Zapier의 무료 2단계 제한도 matchedFeatures에 포함된다. **H15**는 모든 표시 후보에 `오프라인 사용`과 `기기 내부에서만 처리`를 반환한다. Recommend의 스냅샷은 이 필드를 `요구 조건 확인 필요`와 `등록 근거만으로는 충족 여부를 확인하지 못했습니다`라는 문구에 직접 연결한다. **H16** 미등록 방문 예약 확정 목적은 빈 결과다.

이 조건 표시 판정은 실제 반환 데이터와 렌더링 코드의 연결에 대한 관찰이다. 브라우저에서 문구가 보이는지, 모바일 가시성·읽기 순서가 적절한지는 이번 에이전트가 확인하지 않았다.

## 결과 변화

| 관찰 | 기존 20개 | 공개된 추가 16개 | 합계 | 남은 고정 실패 |
| --- | --- | --- | --- | --- |
| 초기 구현 | 20/20 | 12/16 | 32/36 | H09·H14·H15·H16 |
| 보완 1 | 20/20 | 15/16 | 35/36 | H11 |
| 보완 2 — 이번 | 20/20 | 16/16 | 36/36 | 없음 |

## 고정 36개 관찰

표는 추천 최대 6개 전체 순서다. 세부 기대는 변하지 않은 두 고정 사례 파일과 결과 JSON에 보존했다.

### 기존 20개

| ID | 질의·조건 | 이번 추천 순서 | 이전 | 이번 |
| --- | --- | --- | --- | --- |
| D1 | 고객에게 보낼 제안서 초안을 작성하고 문장을 다듬고 싶어요 | Claude → Gemini → Claude Fable 5.1 → ChatGPT → Gemini Notebook → Perplexity | PASS | PASS |
| D2 | 보고서 작성 | Claude → Perplexity → Gemini → Gemini Notebook → Claude Fable 5.1 → ChatGPT | PASS | PASS |
| R1 | 논문 여러 편을 비교하고 출처를 확인하면서 요약 | Perplexity → Gemini Notebook → ChatGPT → Claude → Gemini 3.8 Flash → GitHub Copilot | PASS | PASS |
| R2 | 웹 리서치 | Perplexity → Claude → ChatGPT → Gemini Notebook → GPT-6 Astra → Gemini 3.8 Flash | PASS | PASS |
| I1 | SNS 콘텐츠 | Canva → Vercel → Gemini | PASS | PASS |
| I2 | 앱 화면 프로토타입을 만들고 팀과 디자인 검토 | Figma | PASS | PASS |
| V1 | 코딩 | Claude Fable 5.1 → GPT-6 Astra → GitHub Copilot → Claude → Cursor → Figma | PASS | PASS |
| V2 | 회원가입과 로그인 | Supabase | PASS | PASS |
| P1 | 개인 업무 정리 | Notion → ChatGPT → Gemini Notebook → Vercel → Linear → Slack | PASS | PASS |
| P2 | 할 일의 상태와 마감일을 관리하고 캘린더로 보고 싶어요 | Notion | PASS | PASS |
| A1 | 자동화 | Zapier → Make → GPT-6 Astra | PASS | PASS |
| A2 | 폼에 새 문의가 들어오면 다른 앱으로 데이터를 옮기고 알림을 보내기 | Zapier → Make → GPT-6 Astra | PASS | PASS |
| N1 | 이미지 생성 말고 보고서 작성 | Claude → Perplexity → Gemini → Gemini Notebook → Claude Fable 5.1 → ChatGPT | PASS | PASS |
| N2 | 코딩 도구는 제외하고 개인 업무 정리 | Notion → ChatGPT → Gemini Notebook → Linear → Slack → Perplexity | PASS | PASS |
| C1 | 자동화 / 무료, 한국어 | 0개 | PASS | PASS |
| C2 | Midjourney / 무료 | 0개 | PASS | PASS |
| C3 | 이미지 생성 / 무료, 한국어 | Gemini → ChatGPT | PASS | PASS |
| C4 | 코딩 / 무료, 합성 도구함 | GitHub Copilot → Cursor | PASS | PASS |
| C5 | 무료로 그룹 허들 회의를 하고 싶어요 / 무료, 한국어 | Slack | PASS | PASS |
| C6 | API 모델 말고 논문 자료를 읽는 앱 | Gemini Notebook → ChatGPT → Claude → Perplexity → Gemini → GitHub Copilot | PASS | PASS |

### 공개된 추가 16개

| ID | 질의·조건 | 이번 추천 순서 | 이전 | 이번 |
| --- | --- | --- | --- | --- |
| H01 | 팀에 보낼 안내문을 쓰고 딱딱한 표현을 부드럽게 고쳐 주세요 | Claude → Gemini → Claude Fable 5.1 → Gemini Notebook → Perplexity → ChatGPT | PASS | PASS |
| H02 | 업로드한 PDF만 근거로 답을 찾고 인용된 위치를 보고 싶어요 | Gemini Notebook → Perplexity → Gemini 3.8 Flash → ChatGPT → Claude → GitHub Copilot | PASS | PASS |
| H03 | 발표 슬라이드에 넣을 이미지가 필요해요 | Midjourney → Gemini → ChatGPT → GPT-6 Astra → Gemini 3.8 Flash → Perplexity | PASS | PASS |
| H04 | 동료에게 클릭 흐름을 보여줄 화면 시안을 연결하려고 해요 | Figma | PASS | PASS |
| H05 | 편집기에서 다음 코드를 제안받으면서 개발하고 싶어요 | GitHub Copilot → Claude → Cursor → Figma → Linear → Claude Fable 5.1 | PASS | PASS |
| H06 | 업무 목록을 보드와 달력으로 번갈아 보며 마감 날짜를 정리 | Notion | PASS | PASS |
| H07 | 입력된 정보를 조건별로 나눠 다른 처리 단계로 보내는 흐름 | Make → Figma | PASS | PASS |
| H08 | 이미지 제작 말고 업무 문서의 표현을 고치는 도구 | Gemini → Claude → Claude Fable 5.1 → Gemini Notebook → Perplexity → ChatGPT | PASS | PASS |
| H09 | Notion 제외하고 팀 대화를 채널별로 모으고 싶어요 | Slack | PASS | PASS |
| H10 | Midjourney 빼고 글로 설명해서 이미지를 생성하고 싶어요 | Gemini → ChatGPT → Perplexity → Claude → Claude Fable 5.1 → Gemini Notebook | PASS | PASS |
| H11 | 코딩 도구는 원하지 않아요. 팀 프로젝트의 이슈와 개발 주기를 관리 | Linear → Figma → Claude | FAIL | PASS |
| H12 | Figma 말고 SNS용 카드뉴스 템플릿을 편집 | Canva | PASS | PASS |
| H13 | 무료로 상업용 쇼핑몰 웹 앱을 배포할 서비스 / 무료 | 0개 | PASS | PASS |
| H14 | 무료 플랜에서 한 번의 입력으로 네 단계 자동화 / 무료 | Zapier → Make | PASS | PASS |
| H15 | 인터넷 연결 없이 기기 안에서만 문서를 요약 | Gemini → Claude Fable 5.1 → Claude → Gemini Notebook → Perplexity → ChatGPT | PASS | PASS |
| H16 | 집 근처 자전거 수리점의 방문 예약을 대신 확정해 주는 서비스 | 0개 | PASS | PASS |

