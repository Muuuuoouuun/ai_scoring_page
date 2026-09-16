# V22 최종 변경 독립 리뷰 — 보고된 결함 수정 재확인

**최신 결론: 아래 초기 보고 3개 결함의 수정이 모두 재현 검사에서 확인됐다. 한정된 이번 코드 변경 범위에서 추가 중대 지적은 없으며 승인 가능하다. 초기 RED 기록은 이력으로 보존하고 최종 GREEN 결과는 문서 끝에 구분했다.**

2026-09-15 초기 검토. 기존 저장 경쟁·잘못된 프로젝트 추천·개발 도구 추천 누락은 같은 독립 재현으로 모두 해결됐음을 확인했다. 기존 Google material hash도 보존됐다. 다만 새 ongoing 처리에서 아래 세 경계는 수정이 필요하다. 모든 실행은 실제 모듈 + 메모리 SQLite + 모의 제공사이며 실제 이메일·DB·Site·브라우저는 변경하지 않았다.

## 1. P1 — 정정 알림이 ongoing의 출처 유효성·30일 재확인 제한을 우회한다

위치: [notice-candidates.ts](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts:43)의 `correction ? reviewStatus==='verified' : holds.length===0` 및 다음 emailNotAfter 분기.

새 혜택 최초 알림은 offerHolds가 최근 출처 조건을 검사한다. 하지만 이미 안내한 혜택의 가격과 revision을 바꾸면 correction이 true가 되고, 보류 사유에 ‘최근 공식 안내 재확인 필요’가 있어도 emailAllowed가 true가 된다. 또한 deadlineState가 open이 아니어서 emailNotAfter가 **null**로 바뀌어 SQL의 마감 검사도 통과한다.

독립 시나리오는 첫 정상 안내 후 다음 3가지 중 하나로 바꿨다. 각각 현재 코드에서 실제 모의 제공사 호출까지 2회(정상 원본 1회 + 보류되어야 할 정정 1회)가 발생했다.

| 현재 출처 상태 | 실제 emailAllowed | 실제 emailNotAfter | 기대 |
|---|---:|---|---|
| 확인 후 30일 경과 | true | null | 보류 |
| 확인 시각이 현재보다 미래 | true | null | 보류 |
| ongoing인데 고정 expiresAt도 존재 | true | null | 보류 |

최소 수정은 correction 여부와 무관하게 **ongoing의 출처 유효성/최근 확인/마감 일관성**을 검사하는 것이다. fixed의 정상 종료·철회 정정을 없애는 식으로 기존 정책 전체를 바꾸지 않아도 된다. ‘정정 안내’가 공식 조건 검토를 대신하지 않는다. 중요한 정정은 최근 확인된 정확한 자료로 보낼 수 있게 남기되 위 3가지 source hold를 우회하지 않아야 한다.

## 2. P2 — checkedAtInstant의 잘못된 달력 날짜를 정상 확인일로 받아들인다

위치: [promotion-facts.ts](/Users/bigmac_moon/dev/ai_score/site/lib/promotion-facts.ts:13), `reviewStart`의 instant 분기.

날짜-only 분기는 달력 유효성을 검증하지만 instant는 정규식과 Date.parse만 사용한다. `checkedAtInstant='2026-02-30T00:00:00Z'`는 3월 2일로 정규화되고 `at='2026-03-03T00:00:00Z'`에서 **open**을 반환한다. 잘못된 확인 시각으로 30일 동안 최근 자료가 된다. 현재 등록된 실제 3건 시각이 잘못됐다는 뜻은 아니며, 요청된 입력/시간 경계의 실제 모듈 RED다.

최소 수정: instant의 원문 날짜·시각 구성요소가 유효한지 확인한 뒤 오프셋을 해석한다. UTC로 변환한 일자가 원문의 로컬 일자와 같아야 한다고 비교하면 정상 오프셋 날짜를 거절할 수 있으므로 달력 유효성 검사와 타임존 변환을 구분한다. 불가능한 날짜는 uncertain/발송 보류다.

## 3. P2 — 새 유지·갱신 정책 필드가 실제 알림 본문에 쓰이지만 material에서 빠져 있다

위치: [promotionMaterial](/Users/bigmac_moon/dev/ai_score/site/lib/promotion-facts.ts:10), [알림 본문](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts:61).

`renewalNote`는 갱신가 대신 알림 본문에 사용되고 공개 화면에도 표시된다. 그런데 renewalNote만 다른 중요 정책으로 바꾸면 material이 완전히 동일하다. 따라서 지문·버전 검증이 그 차이를 검출하지 못한다. 현재 데이터는 대부분 같은 의미를 conditions에도 복사해 두어 지금 읽은 조건 자체가 전부 누락된 것은 아니다. 다만 독립적인 정식 필드가 두 군데의 텍스트를 반드시 동시에 편집해야만 정정되는 구조다. 재현에서는 실제 ongoing 객체의 renewalNote를 의미가 다른 합성 정책 문구로 바꿔도 canonical material이 같았다.

최소 수정: 새 `renewalNote`처럼 중요한 정식 조건 필드를 값이 존재할 때만 material에 포함하거나, canonical conditions에서 표시 문구를 도출해 어긋날 수 없게 한다. `applicationNote`·`eligibilityNote`도 실제 적용 조건을 담으므로 같은 원칙을 적용한다. 기존 Google에 없는 신규 필드만 조건부 포함하면 Google hash를 유지할 수 있다. 기존 priceNote를 무조건 새 material key로 넣어 기존 사건 지문을 깨지 않는다. 단순 checkedAt 변경은 계속 비중요로 유지한다.

## 확인된 해결 및 정상 경계

- 기존 Site 연결/유사추천/ongoing 테스트와 독립 개인 테스트를 합쳐 **26/26 통과**. 일부 독립 사례가 root 테스트로 편입되어 중복 실행되므로 26개를 모두 서로 다른 검증으로 세지 않는다.
- 신규 일반 library 저장의 경쟁 삽입은 409이며 선행 name/status/purpose/note/plan 보존. 두 계정 격리, unlink, ifAbsent 메모 보존, 구독 toolId 연결 후 과거 조건 versions·결제 row 보존도 통과.
- Supabase 프로젝트 자원 확장→Notion/Linear 업무 관리 오분류가 제거됐고 Cursor↔Copilot 개발 기능 연결이 생겼다.
- Google `google-ai-pro-us-students-2026`의 material hash는 `94da3afa2d79a0e08c049846dc15e383c70af3bccead62ae3eb8726a49ac762e`로 이전과 일치.
- 순수 deadline 함수에서 정상 instant 직전/정확 시작/30일 직전/정확 30일 경계는 기대대로 동작. 명시 ongoing+날짜 모순도 일반 경로에서는 보류된다. 결함 1은 정정 경로가 이를 우회하는 것이다.
- 신규 자료의 등록 마감은 null이고 요금·갱신 미확인을 임의 통화/월요금으로 바꾸지 않았다. Miro는 `reviewStatus:'hold'`, 기타 자격/기능/최소기간·상한 보류가 유지된다. 기존 세금 미확인도 상한을 자동 통과하지 않는다.
- 공개 화면의 미국 전용·등록 마감 null 하드코딩은 제거되고 기능 sourceUrl·지원/조건부/미포함 표시가 있다. 알림 대안도 similarTools를 공유한다. 화면의 실제 렌더 및 현재 공식 출처 재검수는 이 코드 리뷰의 범위 밖이다.
- workspace-settings는 타입 수용이 추가됐고 기존 설정 CAS, stale 자격 지문 거절, 동의 해제 및 이메일 연결 전제 검사를 유지한다.

증거:

- [기존/개인 경계 26개 결과](/private/tmp/ais-v22-final-baseline-tests.txt)
- [신규 시간·material 경계 독립 7개](/private/tmp/ais-v22-final-boundaries.test.mjs)
- [신규 7개 결과: 2 PASS / 5 RED](/private/tmp/ais-v22-final-boundaries-results.txt)

5 RED는 세 결함의 다섯 사례다. 합성 source 변경은 실제 운영 조건이나 제공사 사건으로 평가하지 않았다. 수정 전 결과는 보존하며, 후속 수정 검증은 이 문서에 구분해 덧붙인다.


## 후속 수정 재확인 — 최종 GREEN

root 수정 후 동일 독립 7개와 Site의 ongoing-promotions, ongoing-notice-boundaries, notice-versions를 재실행했다. **42/42 PASS**다. 이 중 독립 7개와 Site에 편입된 7개는 같은 사례이므로 42개의 서로 다른 시나리오로 과장하지 않는다. 기존 RED 결과 파일은 덮어쓰지 않았다.

- `ongoingSourceValid`가 correction을 포함한 모든 emailAllowed 계산에 선행한다. 30일 경과·미래 확인·모순 마감 3가지가 모두 emailAllowed false이며 모의 제공사 호출은 원래 정상 안내 1회만 남았다. 잘못된 정정 2번째 발송이 사라졌다.
- `reviewStart`가 날짜 구성요소와 시간 범위를 검증한다. 기존에 정규화되어 open이던 2026-02-30T00:00:00Z는 uncertain으로 바뀌었고 정상 시작/30일 경계는 유지됐다.
- 값이 있는 신규 renewalNote/eligibilityNote가 programTerms에 포함된다. 갱신 정책의 실제 문구 변경이 material을 바꾸며, 해당 신규 필드가 없는 Google의 기존 material hash는 동일하다. checkedAt 변경만으로 동일 자료 재발송이 생기지 않는 기존 테스트도 통과했다.
- 기존 fixed 날짜 경계, 가격·기능·자격 보류, 출처 충돌·revision-only·A→B→A·원래 카드 보존 등 실행한 notice-versions 범위가 통과했다. 전체 운영 발송 또는 전체 브라우저 QA를 이번 결과로 주장하지 않는다.

[최종 재실행 결과 42 PASS](/private/tmp/ais-v22-final-boundaries-green.txt)

요청에 따라 신규 기능이나 별도 범위 탐색 없이 보고된 수정만 재확인했다. Site 파일·운영 DB·실제 제공사·브라우저 변경은 하지 않았다.
