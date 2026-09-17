# V11 고정 36개 회귀 평가 — 35/36 스냅샷 보존

검토일 2026-09-12. **기존 20개는 20개 충족, 공개된 추가 16개는 15개 충족·1개 실패로 총 35/36**이다. 남은 실패는 H11의 코딩 도구 제외이며 GPT-6 Astra가 추천 4위에 들어왔다. 초기 32/36 기록을 보존했고 이 파일 역시 후속 보완 결과로 덮어쓰지 않는다.

이제 추가 16개도 구현자에게 공개된 회귀 표본이다. 이번 결과는 새로운 홀드아웃에 대한 일반화 성능이나 실제 사용자 연구가 아니다. 기대를 출력 뒤 바꾸지 않았고, 새로운 질의를 만들어 반복 평가하지 않았다.

## 고정 게이트 6.2.4 의견

원문은 **“A varied set of realistic purpose/condition queries has evaluated relevance.”**이다. 이 문항의 **다양한 현실 목적·조건 질의에 대한 관련성 평가 수행 증거는 충족 가능하며, 검증 완료로 기록할 근거가 있다고 판단한다.** 문서·리서치·디자인·개발·개인정리·자동화, 명확한 부정·제품명 제외, 긍정 이미지 문맥, 무료·한국어·합성 도구함 조건, 미확인 실행 조건, 미등록 목적을 고정 36개로 평가했다. 기대가 최초 출력보다 앞서 고정됐고 초기 실패·회귀 실패를 모두 남겼다.

이는 해당 문항의 평가 수행 여부에 관한 의견이다. H11 제외 실패가 사라졌다는 뜻이나 추천 전체 정밀도가 완성됐다는 뜻으로 확대할 수 없다. 게이트 점수·상태 파일은 수정하지 않았다. 조건 경고 표시는 실행 데이터와 렌더링 코드 연결로 확인했으며 실제 브라우저 UI 가시성은 별도 검증 범위다.

## 실행과 보존 증거

- 소스 스냅샷: `2026-09-12T11:56:18.257Z` (KST 20:56:18). 현재 `catalog.ts`·`catalog-search.ts`·카탈로그 JSON을 먼저 읽고 해당 스냅샷만 메모리 TypeScript 로더에서 실행했다.
- [새 회귀 실행기](/private/tmp/ais-v11-relevance-final-regression-runner.cjs), [판정기](/private/tmp/ais-v11-relevance-final-regression-evaluate.cjs), [전체 결과 JSON](/private/tmp/ais-v11-relevance-final-regression.json), [소스 스냅샷](/private/tmp/ais-v11-relevance-final-regression-source-snapshot.json).
- 사이트 소스·브라우저·DB·계정·운영 데이터는 수정하거나 호출하지 않았다. 실제 외부 제품 기능도 실행하지 않았다.
- 실행 전후 소스 6개 해시가 동일했고 기존 V10 실행기·두 고정 표본·초기 JSON/MD의 해시도 동일했다. JSON에 보호 파일의 전후 해시를 보존했다.
- 기존 20개 고정 SHA-256: `322fb90697148e6b77a53e8de2ca720f4cfd3041433bfb882113aacca294bd9c`.
- 추가 16개 고정 SHA-256: `d0103236ed0b9f064c5fefa919034f777926ddbb952b40e2e79d973b05e9ce64`.
- [초기 32/36 보고서](/private/tmp/ais-v11-relevance-initial-observations.md)와 [초기 원본](/private/tmp/ais-v11-relevance-initial-observations.json)은 그대로 유지했다.

## H11 실패와 이전 실패의 변화

**H11은 이전에 잠재 범위 위험이었고 이번에는 실제 표시 범위 실패가 됐다.** 질의는 `코딩 도구는 원하지 않아요. 팀 프로젝트의 이슈와 개발 주기를 관리`이며, 고정 기준은 Linear 상위 3개와 지정 코딩 도구·모델의 추천 제외다. 이번 순서는 Linear → Figma → Claude → GPT-6 Astra다. 초기에는 Astra가 전체 함수 결과 8위라 표시 최대 6개 밖에 있었으나, 다른 후보가 줄면서 4위로 올라왔다. 제외 해석은 여전히 development 분야이며 Astra의 주 분야는 productivity라 제외되지 않았다. Linear 1위만 보고 이 사례를 PASS로 바꾸지 않았다.

초기 FAIL 네 사례는 다음과 같이 고정 기준을 충족했다.

- **H09:** Notion 제품 제외 후 Slack 하나만 반환됐다. 팀 채널 목적에 맞는 후보가 상위 3개에 있고 제외한 Notion도 없다.
- **H14:** Zapier·Make만 반환됐으며 두 후보 모두 `네 단계 처리의 무료 플랜 이용 범위`를 `unverifiedRequirements`로 반환한다. Zapier의 무료 2단계 조건·공식 URL도 matchedFeatures에 남아 있다.
- **H15:** 모든 표시 후보가 `오프라인 사용`과 `기기 내부에서만 처리`를 확인 필요 필드로 반환한다. 해당 필수 조건이 지원된다고 추정하지 않게 했다.
- **H16:** 자전거 수리점 방문 예약 확정 목적은 빈 결과다. 시나리오 예약 실행을 방문 예약 근거로 제시하지 않았다.

Recommend의 캡처한 소스는 `t.unverifiedRequirements.join`을 `요구 조건 확인 필요` 제목 및 `등록 근거만으로는 충족 여부를 확인하지 못했습니다` 문구에 연결한다. C5 Slack 허들 조건은 actual matchedFeatures의 condition/sourceUrl이 동일한 feature 렌더링 분기에 연결됨을 다시 확인했다. 모두 데이터·소스 관찰에 따른 판정이며 실제 렌더링 화면을 봤다고 표현하지 않는다.

## 남은 정밀도 한계 — 고정 최소 기준과 별개

고정 긍정 기준은 적절한 후보 하나가 상위 3개에 있어야 한다는 최소 기준이다. 따라서 아래 사례도 전체 PASS 안에 포함될 수 있다.

- `SNS 콘텐츠`(I1)에 Canva 뒤로 Vercel이 2위다. CDN의 콘텐츠 전송 근거와 SNS 제작 목적은 다르다.
- `개인 업무 정리`(P1)에 Vercel이 4위로 남는다. 개인 프로젝트의 무료 플랜이라는 어휘가 개인 업무 정리와 섞인다.
- `이미지가 필요해요`(H03)는 실제 이미지 생성 앱이 상위 3개여서 긍정 문맥 기준을 충족하지만, 뒤에는 이미지 입력·분석 근거의 모델도 남는다. 이미지를 얻는 행동과 입력으로 받는 능력의 경계는 완전하지 않다.
- Midjourney 제외 이미지 생성(H10)은 Gemini·ChatGPT가 앞에 있지만 Perplexity·Claude·Fable·Notebook이 이어진다. 긍정 대상과 행동을 여러 개 포함한 문장의 하위 후보 정밀도에는 한계가 있다.
- 조건별 처리 흐름(H07)은 Make 1위라 최소 기준을 충족하지만 Figma도 2위다. 흐름이라는 공통어가 실제 자동화와 화면 프로토타입 양쪽에 걸친다.
- 무료 그룹 허들(C5)은 Slack의 유료 그룹 조건이 표시 경로에 연결돼 기준을 충족하지만 Gemini도 2위에 남아 있어 그룹 회의 서비스와 일반 음성 대화의 차이를 별도로 볼 필요가 있다.

위 제한 때문에 35/36을 추천 정확도 97.2% 또는 사용자 성공률로 표현하지 않는다. 요구 조건 확인 필요를 표시하는 것은 기능 지원을 검증한 것과 다르다. 이 고정 회귀를 넘어선 범위의 동작까지 통과로 추정하지 않는다.

## 고정 36개 결과

각 표의 순서는 표시 추천 최대 6개 전체다. 초기 판정은 보존된 32/36 결과, 이번 판정은 KST 20:56:18 스냅샷이다. 상세 사전 기대·전체 함수 결과·확인 필요 필드·체크별 판정은 원본 JSON에 보존했다.

### 기존 20개

| ID | 질의·조건 | 이번 추천 순서 | 초기 | 이번 |
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
| C5 | 무료로 그룹 허들 회의를 하고 싶어요 / 무료, 한국어 | Slack → Gemini | PASS | PASS |
| C6 | API 모델 말고 논문 자료를 읽는 앱 | Gemini Notebook → ChatGPT → Claude → Perplexity → Gemini → GitHub Copilot | PASS | PASS |

### 공개된 추가 16개

| ID | 질의·조건 | 이번 추천 순서 | 초기 | 이번 |
| --- | --- | --- | --- | --- |
| H01 | 팀에 보낼 안내문을 쓰고 딱딱한 표현을 부드럽게 고쳐 주세요 | Claude → Gemini → Claude Fable 5.1 → Gemini Notebook → Perplexity → ChatGPT | PASS | PASS |
| H02 | 업로드한 PDF만 근거로 답을 찾고 인용된 위치를 보고 싶어요 | Gemini Notebook → Perplexity → Gemini 3.8 Flash → ChatGPT → Claude → GitHub Copilot | PASS | PASS |
| H03 | 발표 슬라이드에 넣을 이미지가 필요해요 | Midjourney → Gemini → ChatGPT → GPT-6 Astra → Gemini 3.8 Flash → Perplexity | PASS | PASS |
| H04 | 동료에게 클릭 흐름을 보여줄 화면 시안을 연결하려고 해요 | Figma | PASS | PASS |
| H05 | 편집기에서 다음 코드를 제안받으면서 개발하고 싶어요 | GitHub Copilot → Claude → Cursor → Figma → Linear → Claude Fable 5.1 | PASS | PASS |
| H06 | 업무 목록을 보드와 달력으로 번갈아 보며 마감 날짜를 정리 | Notion | PASS | PASS |
| H07 | 입력된 정보를 조건별로 나눠 다른 처리 단계로 보내는 흐름 | Make → Figma | PASS | PASS |
| H08 | 이미지 제작 말고 업무 문서의 표현을 고치는 도구 | Gemini → Claude → Claude Fable 5.1 → Gemini Notebook → Perplexity → ChatGPT | PASS | PASS |
| H09 | Notion 제외하고 팀 대화를 채널별로 모으고 싶어요 | Slack | FAIL | PASS |
| H10 | Midjourney 빼고 글로 설명해서 이미지를 생성하고 싶어요 | Gemini → ChatGPT → Perplexity → Claude → Claude Fable 5.1 → Gemini Notebook | PASS | PASS |
| H11 | 코딩 도구는 원하지 않아요. 팀 프로젝트의 이슈와 개발 주기를 관리 | Linear → Figma → Claude → GPT-6 Astra | PASS | FAIL |
| H12 | Figma 말고 SNS용 카드뉴스 템플릿을 편집 | Canva | PASS | PASS |
| H13 | 무료로 상업용 쇼핑몰 웹 앱을 배포할 서비스 / 무료 | 0개 | PASS | PASS |
| H14 | 무료 플랜에서 한 번의 입력으로 네 단계 자동화 / 무료 | Zapier → Make | FAIL | PASS |
| H15 | 인터넷 연결 없이 기기 안에서만 문서를 요약 | Gemini → Claude Fable 5.1 → Claude → Gemini Notebook → Perplexity → ChatGPT | FAIL | PASS |
| H16 | 집 근처 자전거 수리점의 방문 예약을 대신 확정해 주는 서비스 | 0개 | FAIL | PASS |

