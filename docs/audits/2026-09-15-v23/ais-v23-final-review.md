# V23 변경본 최종 독립 검토

2026-09-15. **기존 지적 두 건은 같은 재현에서 해결됐으며, 이번 변경 범위에서 새 고위험 회귀는 발견하지 못했다. 코드 검토상 승인 가능하다.** 실제 브라우저·Sites·외부 계정·운영 데이터를 조작하지 않았다. 기준 HEAD는 root가 전달한 이전 V22 `5e645626b5dde2a28f27fab07dcc20603bec70e4`이며, 이 검토는 그 뒤 현재 작업 파일을 읽은 것이다. 새 커밋·빌드 성공·배포 완료를 이 보고서가 확인한 것은 아니다.

## 기존 두 재현의 수정 확인

| 지적 | 최초 실제 결과 | 현재 같은 입력의 실제 결과 | 판정 |
|---|---|---|---|
| Canva의 설명에 있는 이미지 편집 근거 누락 | 전체 대안0, Microsoft Copilot 매치0 | Adobe Firefly/Microsoft Copilot 두 후보에 이미지 편집 매치. 이미지 생성은 가산하지 않음. 원 기능의 조건·출처를 유지 | 해결 |
| Notion 혜택 자격 `ineligible`을 확인 필요로 표시 | hold=`현재 자격 조건 재확인 필요`, 개인 배지=`조건 확인 필요` | hold=`내 설정에서 해당하지 않음`, 실제 ServiceInsights 정적 렌더 배지=`내 설정: 해당하지 않음` | 해결 |

[tool-similarity.ts:10](/Users/bigmac_moon/dev/ai_score/site/lib/tool-similarity.ts:10)는 편집·디자인·사진·이미지라는 관련 제목 아래 설명의 명시적인 배경 제거/편집 동작을 확인한다. 일반 이미지 입력이나 브랜드 색·글꼴 관리만으로 편집을 인정하지 않는 독립 부정 대조 사례도 통과했다.

[ServiceInsights.tsx:29](/Users/bigmac_moon/dev/ai_score/site/components/ServiceInsights.tsx:29)는 명시적 비해당 상태를 별도 배지로 표시하고 [promotion-facts.ts:33](/Users/bigmac_moon/dev/ai_score/site/lib/promotion-facts.ts:33)도 사유를 분리한다. 혜택 자체는 ‘연결된 혜택’ 목록에 남지만 자격 일치로 표시하지 않으므로 원래 문제였던 사용자 선택의 의미 손실은 해소됐다. 공개 전체 목록을 숨기거나 이전 정정 이력을 지울 필요는 없다.

기존 재현 스크립트를 복사하여 **출력 경로만 바꿔 실행**했다. 최초 `/private/tmp/ais-v23-goal-repro.mjs` 및 `.json`은 기존 해시 기록과 동일하다. 초기 RED를 최종 결과로 덮지 않았다.

## 작성·요약 변경의 한정 검토

[작성 목적 판별](/Users/bigmac_moon/dev/ai_score/site/lib/catalog-search.ts:83)은 보고서/문서라는 대상에 작성 동작과 요약 동작의 근거를 각각 요구한다. 다음 현행 결과와 연결 근거를 확인했다.

- `보고서 작성`·`문서 작성`에서 ChatGPT/Notion/Gemini의 새 문서 작성·편집 기능이 실제 matchedFeatures에 들어온다. 원 기능의 조건부 여부와 로그인·기기·설정 제한, HTTPS 출처를 보존했다.
- `기존 보고서를 읽고 핵심 내용을 요약하고 싶어요`에서는 Jira의 대시보드/보고서 보기 기능을 작성·요약 근거로 쓰지 않고 Notebook의 자료 변환 근거가 연결된다.
- `프로젝트 진행 보고서와 대시보드`에서는 Jira 등 업무 진행 보고 도구가 계속 검색된다. 보고서라는 단어가 있는 모든 기능을 일괄 제거한 수정이 아니다.
- 문서 작성과 요약을 한 질의에 결합하면 더 제한된 결과가 나온다. 이 한정 검토에서 모든 복합 요구의 일반적인 검색 완전성을 주장하지 않았다. 상위 결과의 공식 문서를 새로 웹 조사하거나 전체 추천 정밀도를 재평가한 것은 아니다.

새 공식 기능 3개는 현재 JSON에 기능명·설명·조건·sourceUrl을 가진다. 정적 데이터와 실제 검색 연결만 확인했으며 해당 공식 사이트의 최신 내용은 root 조사 근거와 구분한다. 기능 추가로 서비스 전체 품질 점수나 모든 플랜 지원을 자동 부여하지 않는다.

## 실행 결과와 증거

- 현재 `tool-similarity`, `catalog-search`, `catalog-purpose`, `service-insights`, `service-linking`, `ongoing-promotions` **43/43 PASS**. [실제 출력](/private/tmp/ais-v23-final-targeted-tests.txt).
- ServiceInsights 회귀는 메모리 SQLite에서 `unknown/ineligible/eligible` 설정 저장→workspace 재조회→실제 컴포넌트 정적 렌더를 연결한다. 따라서 단순 배지 문자열 테스트만으로 판단하지 않았다.
- [동일 재현 최종 스크립트](/private/tmp/ais-v23-goal-repro-final.mjs) · [최종 결과](/private/tmp/ais-v23-goal-repro-final.json).
- [추가 한정 부정 대조/작성 근거 검사](/private/tmp/ais-v23-final-boundaries.mjs) · [결과](/private/tmp/ais-v23-final-boundaries.json).
- root가 보고한 전체293개 테스트/타입 검사 PASS와 진행 중 빌드는 별도 실행 보고다. 이 검토자는 전체293개를 다시 실행했다고 주장하지 않는다.

정적 렌더링은 실제 ServiceInsights 본문을 사용하고 로고·아이콘만 빈 컴포넌트로 대체했다. 새로운 시각 배치·모바일·브라우저 저장 검증이 아니며 외부 fetch는 하네스에서 차단했다. 기존 보조 Supabase→Notion0매치는 초기 감사에서 확정 결함으로 채택하지 않았으므로 이번에 추가 요구로 부활시키지 않았다.

사용자가 보류한 실제 외부 OAuth 계정 연결은 이번 완료 판정에서 제외한다. 예전 점수·메일 게이트를 현재 사용자 목표의 새 선행 조건으로 추가하지 않았다. Site·원본 감사 문서·배포·운영 데이터는 수정하지 않았다.
