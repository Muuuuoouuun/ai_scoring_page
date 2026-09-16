# V11 조건 미리보기 재현 검토

검토 시각: 2026-09-12 11:26 UTC. Site 소스 읽기 및 `/private/tmp` 재현만 수행했다. 브라우저·배포·Site·Git·영구 DB를 변경하지 않았다.

## 결론

보완 전 현상은 **P2: 충돌로 계산에서 제외한 계약을 정상적인 빈 예상 결과처럼 표시한 오류**다. 동일 날짜 후보가 검토 대기 상태여서 발생한 현상이 아니다. 기존 저장 이력을 읽은 미리보기 후보만 충돌하며, 저장 API는 같은 날짜 추가를 400으로 거절한다. 이번 메모리 API 재현에서 거절 전후 모든 `private_records` 행이 바이트 단위로 같았다. 데이터 손실·잘못된 저장은 확인되지 않았다.

현재 읽은 `TermsEditor.tsx:35`에는 root의 `preview.conflictingHistory > 0` 안내 분기가 이미 있다. 충돌일 때 `role="alert"`로 원인과 “기존 이력 정정 또는 적용일 변경”을 표시하고 기존 빈 금액·0회·0건 요약을 숨긴다. **이 재현에 대한 가장 작은 적절한 수정**이다. 엔진/API 변경이나 동일 날짜 후보의 자동 교체는 필요하지 않다. 수정된 안내의 실제 렌더링·반응형 확인은 root의 후속 브라우저 관찰 범위이며, 이 보고서가 대신 검증하지 않는다.

## 정확한 경로

1. `site/components/TermsEditor.tsx:15`의 `check()`는 `selected === null`인 “변경 조건 추가”에서 기존 이력 배열 끝에 `confirmed` 후보를 붙인다. 같은 적용일 `2026-10-01`의 활성 이력이 있더라도 후보에 `supersedes`가 없으므로 두 이력이 모두 활성이다.
2. `site/lib/billing.ts:168`의 `summarizeContracts()`는 활성 이력의 적용일 중복을 발견하면 `conflictingHistory++` 후 해당 계약 전체를 `continue`로 건너뛴다. 따라서 `currencies={}`, `schedule=[]`, `conflictingHistory=1`이 된다. `pendingTerms`와 `unknownFutureAmounts`를 계산하는 단계까지 도달하지 않아 두 값은 0으로 남는다. 이 0은 정상 계산이 완료되었다는 의미가 아니다.
3. 보완 전 미리보기 패널은 `currencies`, `unknownFutureAmounts`, `pendingTerms`, `schedule`만 사용하고 충돌 필드를 표시하지 않아 전달된 브라우저 재현의 “확인된 예상 금액 없음 / 미확인 금액 0회 · 검토 대기 0건”을 설명한다.
4. 저장은 `site/app/api/billing-terms/route.ts:23`에서 `versionHistory()`를 먼저 호출한다. `site/lib/contract-history.ts:79`는 같은 활성 적용일을 발견하면 `ApiError(400, '같은 적용일의 조건이 있습니다. 해당 이력을 정정해주세요.')`를 던진다. 이후 `mirrorWrites`/`commitHistory`는 실행되지 않는다.
5. 기존 미래 이력의 “정정”을 선택하면 후보가 그 이력의 ID를 `supersedes`로 갖는다. 기존 버전이 활성 집합에서 제외되므로 같은 적용일 정정은 정상이다. 금액이 동일하더라도 별개의 활성 조건을 같은 날 추가하는 것은 기존 API 규칙상 허용하지 않는다.

## 독립 재현 결과

재현 파일: `/private/tmp/ais-v11-terms-preview-repro.test.mjs`.
실행: `node /private/tmp/ais-v11-terms-preview-repro.test.mjs` → exit 0.
원시 결과: `/private/tmp/ais-v11-terms-preview-repro.json`.

실제 `TermsEditor.check()` 함수의 현재 소스를 추출해 TypeScript로 변환한 뒤, 고정 날짜·폼 값·state setter로 실행했다. 실제 React/DOM은 실행하지 않았으며 폼 조건 추출 `proposal()`은 통제된 조건 객체로 제공했다. API는 프로젝트의 기존 harness를 통해 실제 route/이력 모듈을 메모리 SQLite에서 실행했다. UI 문구 문자열을 따라 만든 테스트는 추가하지 않았다.

fixture: observed 기준 이력 `2026-09-12`, 월 20,000 KRW, 청구 기준일·다음 청구일 `2026-10-01`; confirmed 미래 이력 `2026-10-01`, 월 20,000 KRW, 세금 포함·개인 부담 10,000 KRW. 조회는 `2026-09-12`부터 `2027-09-11`까지다.

| 입력 | 실제 결과 |
|---|---|
| 추가 / `2026-10-01` 미리보기 | `conflictingHistory=1`, 통화 집계 없음, 일정 0개, `unknownFutureAmounts=0`, `pendingTerms=0`; `check()`의 오류 setter는 빈 문자열 |
| 추가 / `2026-10-01` 저장 | HTTP 400, 기존 이력 정정 안내; 모든 개인 기록 변경 없음 |
| 추가 / `2026-11-01` 미리보기 | 충돌 0, 예상 240,000 KRW, 일정 12개 (`2026-10-01`–`2027-09-01`) |
| 기존 미래 이력 정정 / `2026-10-01` 미리보기 | 충돌 0, 예상 240,000 KRW, 일정 12개 |
| 기존 미래 이력 정정 / `2026-10-01` 저장 | HTTP 200 |

Root가 별도로 전달한 정상 11월 1일 브라우저 관측 109(D)/110(M)의 240,000원·12행과 이 재현은 일치한다. 보완 전 오류 캡처 111(M), 수정 후 실제 화면, 배포 상태는 본 하위 작업에서 직접 열거나 검증하지 않았다. 본 결론을 V10 전체 완료나 고정 게이트 점수 상승의 근거로 확대하지 않는다.
