# V9 비교 저장·재계산 흐름 독립 검토

2026-09-12. 검토 대상: `app/api/cost-comparisons/route.ts`, `components/Savings.tsx`, `CostComparisonResult.tsx`, `ComparisonConditions.tsx`, 관련 API/계산 테스트 및 원본 개정 저장 경로. 사이트·Git·배포·브라우저 조작 없음. 아래 정적 React 렌더링은 브라우저 상호작용이나 시각 QA가 아니다.

**결과:** 금융 원장 변경, 다른 계정 기록 노출, stale revision의 저장 허용은 이번 범위에서 재현하지 못했다. API/계산 26개 테스트를 직접 실행해 모두 통과했다. 실사용 UI 문제 2건을 좁혔고, 검토 중 root가 두 건 모두 수정했다. 준비금 통화는 정적 React 렌더링으로, 미리보기 무효화는 현재 소스 effect 실행으로 재검증했다. 이 제한된 검토에 남은 확인된 P1/P2 결함은 없다. 실제 브라우저 종단 검증은 별도다.

## P2 — 원본 갱신 뒤 이전 개정 미리보기 유지: 수정 및 소스 effect 재검증 완료

위치: [Savings 계산/저장](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:22), [새로 불러오기 버튼](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:42), [결과 렌더링](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:44). 부모 [MyWorkspace](/Users/bigmac_moon/dev/ai_score/site/components/MyWorkspace.tsx)의 refresh는 version을 올려 비동기 GET을 시작하며, 이후 갱신에서 loading을 true로 만들지 않는다.

재현 순서(소스 제어 흐름 재현; 실제 브라우저로 수행했다고 주장하지 않음):

1. 창 A에 원본 revision 1, 월 20,000원, 9/15·10/15·11/15·12/15 예정인 구독이 로드돼 있다. 다른 창에서 10/1부터 40,000원인 revision 2를 저장한다.
2. A에서 `계약·결제 새로 불러오기`를 누른다. clear가 실행되지만 비동기 GET 동안 비교 버튼은 활성이다.
3. GET 응답 전에 `날짜별 비용 비교`를 누르면 이전 records/revision 1로 preview가 생성된다. 유지안은 80,000원이다.
4. GET 완료로 records가 revision 2가 되어도 수정 전 Savings에는 preview의 historyId/revision과 새 source를 대조하는 로직이 없었다. 원본 정보는 갱신돼도 이전 80,000원 결과/저장폼은 남는다. 현재 원본으로 다시 계산한 값은 `20,000 + 40,000×3 = 140,000원`이어야 한다.
5. 서버는 preview에 캡처된 revision 1을 검사하여 저장을 409로 거부한다. 따라서 실제 원장이나 잘못된 새 스냅샷 저장 문제는 아니다. 사용자에게 최신 결과처럼 보일 수 있는 미리보기 문제다.

당시 최소 수정 제안: 렌더링과 저장에 사용할 preview가 현재 선택 source의 subscriptionId/historyId/revision과 일치하는지 검사하여 불일치 시 무효화한다. 또는 source guard가 바뀌면 preview를 clear한다. 요청 동안 계산을 잠그는 보조 조치도 가능하지만, 새 records로 바뀔 때 무효화하는 검사는 계속 유용하다. 저장된 과거 비교 결과는 스냅샷이므로 이 무효화 대상이 아니다.

브라우저에서 추가 확인할 작은 회귀: revision 1 preview → 같은 컴포넌트에 revision 2 records 전달 → 이전 미리보기와 저장 가능 상태 제거 → 재계산 140,000원 → revision 2로 저장. 저장된 과거 비교 카드의 result는 그대로 유지.

수정 후 현재 [Savings effect](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:20)는 records/preview가 바뀔 때 같은 subscription의 historyId/revision을 비교하며, source 삭제·개정 불일치 시 preview를 제거하고 최신 조건으로 다시 비교하라는 오류를 표시한다. source effect를 AST에서 직접 추출해 동일 개정 유지, revision 변경, authority 변경, parent 삭제, preview 없음의 5조건을 실행해 모두 기대대로 동작함을 확인했다. [재검증 스크립트](/private/tmp/ais-v9-preview-guard-check.mjs). 이는 실제 브라우저 렌더 타이밍 검증이 아니라 현재 effect 분기의 직접 실행 검증이다. 저장된 과거 비교 카드는 대상이 아니며 그대로 남는다.

## P2 — 미래 조건의 통화 준비금 입력 누락: 수정 및 정적 재검증 완료

원 위치: [Savings 준비금 입력](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:41), [FormData 읽기](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:21), [저장 조건 다시 불러오기](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:24).

원 증상: 통화 입력 필터가 후보 통화, 현재 계약 payload.currency, 추가 항목 통화만 보았다. 현재 KRW이고 10/1부터 USD로 변경되는 기존 조건 이력 + KRW 후보이면 USD 준비금 입력이 없었다. 계산은 미래 USD 청구를 정확히 만들지만 고객은 USD 한도를 입력할 수 없었다. 저장된 conditions.criteria.budgets.USD가 있어도 재계산용 화면에서 필드가 렌더링되지 않으면 FormData 읽기가 null로 만들 수 있었다.

독립 입력: 9/15 기존 20,000 KRW, 10/1 이후 기존 2,000 USD 최소 단위($20)로 변경; 신규 후보 KRW; 비교 9/12–12/31. 기존안 peak는 `KRW 20,000@9/15`, `USD 2,000@10/15`다.

- 수정 전 정적 React 출력: `budgetKRW=true`, `budgetUSD=false`.
- USD 준비금 없음: `cashUnknown=true`, `feasible=null`.
- USD 준비금 3,000($30)과 KRW 준비금 100,000 입력: `cashUnknown=false`, `feasible=true`.
- root가 준비금 입력을 네 원통화 모두 노출하도록 수정했다. 동일 정적 렌더링을 재실행하여 `budgetKRW=true`, `budgetUSD=true`를 확인했다. 현재 이 발견은 열린 결함으로 남기지 않는다.

재현 스크립트: [ais-v9-budget-repro.mjs](/private/tmp/ais-v9-budget-repro.mjs). 원본 컴포넌트를 TypeScript 변환 후 ReactDOMServer로 렌더링하며 데이터/계산은 기존 read-only test harness를 사용한다. API/network/browser 호출 없음.

## 직접 통과한 검증과 범위

실행: `node --test tests/cost-comparison-api.test.mjs tests/dated-comparison.test.mjs` — 26/26, 실패 0. 검토 도중 root가 추가한 insert 직전 개정 변경 및 인증/origin 테스트도 포함했다.

- API는 사용자 소유 subscription/history/member/payment만 읽고 서버에서 결과를 재계산한다. 클라이언트가 보낸 forged result는 저장되지 않는다. 다른 계정의 subscription·saved comparison·refund 링크는 차단된다.
- 최종 INSERT는 같은 owner/historyId/identity/revision과 parent 존재를 한 SQL 조건으로 검사한다. 계산 직후 삽입 직전에 revision이 변한 주입 사례는 409이며 costComparison 행 0개다. ABA history ID 오류도 차단된다.
- 비교 저장/삭제 전후 기존 금융 레코드 전체 직렬화가 byte-identical이다. annotation은 보관된 source/result를 변경하지 않는다. 실제 계약 수정 뒤 새 비교는 새 값으로 계산하고 기존 비교는 이전 값으로 보존한다.
- 실제 환불 연결은 공통 actual로 한 번만 반영하고 별도 차감을 반복하지 않는다. 다른 계약·계정 환불과 중복 링크를 거부한다. 같은 날짜/금액의 수동 환불과 원장 환불이 겹치면 최종 추천을 억제한다.
- source 이후 stale 저장, foreign owner, export/erasure 포함, scenario-only 삭제가 테스트로 확인됐다. 실제 배포 D1의 다중 isolate/실제 여러 계정 실행을 이 메모리 SQL 결과로 대체하지 않는다.
- 현재 입력 변경은 form onChange로 preview를 clear하고, 추가 금액 추가/삭제 버튼에도 명시적 clear가 있다. 이 두 버튼의 stale preview 문제는 현재 소스에서 재현 대상이 아니다.
- CostComparisonResult는 저장된 calculatedAt/asOf의 결과를 보여주고, 준비금은 같은 날 양수 청구·수수료의 합계이며 환불을 차감하지 않는다고 설명한다. 기간 전 준비 비용이 있으면 최종 비용순위/추천을 억제한다. 이번 제한된 검토에서 이 설명과 현재 계산 간 새로운 물질적 불일치는 발견하지 못했다.

미실행: 실제 DOM의 입력 순서/포커스, 전체 화면 시각·모바일 동작, 저장→브라우저 전체 새로고침→조건 복원·재저장의 종단 작업. root의 브라우저 QA 증거로 별도 확인해야 한다. 본 문서는 전체 게이트 완료나 점수 상승을 판정하지 않는다.


## 최종 수정 반영과 root의 추가 로컬 QA

최종 회신 시 두 UI 수정은 모두 현재 소스에서 확인되었고 위의 독립 재검증도 통과했다. 제한된 범위에서 새로 열린 결함은 없다. 이 결과를 전체 범위 재감사나 배포 승인으로 확대하지 않는다.

root가 추가로 보고한 실제 로컬 브라우저 증거: 유지 60,000/변경 30,000 저장→재열기→현재 조건 불러오기 확인; 신규 120,000+수수료 10,000−후일 환불 100,000=30,000이지만 준비금 peak 130,000이 한도 125,000을 넘어 유지안 추천 확인; 390px 넘침 없음, 320px에서 발견한 3px 넘침은 min-width 수정 후 문서 client/scroll 305/305이고 표 영역 269/내부 scroll 290으로 확인; 표 키보드 Tab 이동·콘솔 오류 0. root의 전체 109개 테스트와 TSC는 통과, build는 진행 중이라고 보고받았다. 이는 root 관찰/실행 증거이며, 이 검토자가 독립적으로 브라우저나 109개 전체 테스트를 실행한 것으로 쓰지 않는다.
