# V17 CSS·금액 안내 최종 독립 코드 리뷰

2026-09-13. 현재 Site의 아래 세 파일을 HEAD와 읽기 전용 diff로 대조하고 정확한 변경 span을 확인했다. 소스/UI/DB/Git를 변경하거나 새 테스트를 만들지 않았다. **확인한 변경 범위에 승인 차단할 새 결함은 발견하지 못했다.** 아래 승인은 작은 CSS/copy 수정의 코드 범위에 한정되며 root가 예정한 TSC/build·배포 완료를 선행 주장하지 않는다.

## 검토한 정확한 소스

| 파일 | 읽은 현재 SHA256 | 변경 범위 |
|---|---|---|
| [globals.css](/Users/bigmac_moon/dev/ai_score/site/app/globals.css:27) | `369957db71635d4ae417eed8f6c78615bb875e1186ff51509231f1d721270347` | 비교 일정 첫 열 날짜 nowrap, 모달 직계 p anywhere, billing-schedule 이름/날짜/헤더/배지의 국소 줄바꿈 |
| [BillingReport.tsx](/Users/bigmac_moon/dev/ai_score/site/components/BillingReport.tsx:20) | `8af8e7e01f747a6b61bae4922f0318768d38c4246f803145c8e8d545700ac0c4` | 예정 청구 table에 billing-schedule class만 추가 |
| [RecordForm.tsx](/Users/bigmac_moon/dev/ai_score/site/components/RecordForm.tsx:10) | `92477ec1fbdd31e95c416ea0aa2b05ea24bf49ec14ce8e7cc45f378cba2d95c8` | 금액 helper/placeholder의 payment·refund 분기, 기존 빈칸 거절 오류의 환불 표현 분기 |

## 범위·잠재 회귀 확인

1. **비교 날짜 nowrap**: `.comparison-table`의 현재 소비자는 `CostComparisonResult.tsx`의 Events 표이고 첫 열은 날짜, 마지막 열은 금액이다. 추가한 first-child는 현재 다른 의미의 설명 열을 강제로 한 줄로 만들지 않는다. 가운데 긴 항목명은 기존 wrap을 유지하고, 외부 comparison-table의 내부 가로 스크롤과 min-width290은 유지된다. 숫자·날짜를 한 줄로 보존하면 좁은 폭에서 표가 커질 수 있지만 기존 named/focusable scroller 안에서 접근하도록 설계돼 있으며 문서를 숨기거나 잘라내는 규칙은 없다.
2. **삭제 본문**: `.modal-dialog .modal > p {overflow-wrap:anywhere}`는 현재 Savings/MyWorkspace/Community의 직계 삭제 설명에 적용되고, RecordForm의 form/TermsEditor의 wrapper/Feedback 본문 안의 표·입력으로 전파하지 않는다. 긴 이름의 값을 절단하지 않고 줄바꿈한다. dialog의 폭·세로 overflow·초점/닫기/삭제 동작은 바꾸지 않았다.
3. **예정 청구 표**: billing-schedule class는 예정 청구 표 한 곳에만 있다. th·첫 날짜 td nowrap, 둘째 이름 td anywhere, 배지 nowrap/max-width:none이 모바일 전역 `.badge {white-space:normal;max-width:100%}`을 해당 표 안에서만 덮는다. 이름의 긴 연속 토큰이 다른 열을 압박하는 원인을 줄이며 현재 짧은 세 상태 배지(예정·미연결/결제 여부 미확인/결제 연결됨)는 보존한다. 월별표·공개 카드 배지·다른 관리자 표에 전역 nowrap을 추가하지 않았다. confirmed 행의 실제 날짜/차이 설명 p는 별도로 줄바꿈할 수 있어 열 전체를 한 줄로 묶지 않는다.
4. **금액 copy**: 환불 종류일 때 설명은 ‘실제 환불받은 금액을 입력하세요. 실제 지출에서 차감합니다.’, 일반 결제는 실제 결제 금액 안내이며 payment placeholder는 확인된 금액 입력으로 바뀐다. 신규 구독은 원래 0=무료/빈칸=미입력 설명을 유지한다. 기존 required·toMinor·0 이상 검증·refundOfId·금액/개인액/정산액 변환·요청 payload·CAS는 변경되지 않았다. 빈 payment를 거절하던 기존 오류의 문자열만 entryType에 맞추므로 새로운 저장 조건이나 계산 변화가 아니다.

동일 텍스트를 구현 그대로 복사해 확인하는 새 문자열 테스트나 금융 엔진 fixture를 추가할 이유는 없다. 이번 변경은 기존 구현의 상태·계산을 바꾸지 않으며 이미 수집한 실제 가독성 RED–GREEN과 타입/빌드 확인이 알맞은 검증이다.

## 독립적으로 직접 확인한 GREEN 이미지

아래 **5장 모두** `view_image(detail=original)`로 이번 리뷰에서 실제 열었다. 로컬 QA 데이터이며 reader/zoom·입력 저장 성공의 증거는 아니다.

| 이미지 | 실제 판독 |
|---|---|
| [v01-green-M-table.jpg](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/v01-green-M-table.jpg) | 날짜가 `2026-10-01` 한 줄로 읽히고 긴 후보 이름은 가운데 열에서 여러 줄로 감긴다. 금액 열과 마지막 2027-09-01 행까지 모달이 아닌 비교 영역 내부에 보인다. |
| [v01-delete-green-M-01.jpg](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/v01-delete-green-M-01.jpg) | 긴 QA 비교명이 p 안에서 줄바꿈되고 마지막 ‘삭제할까요?’와 닫기·삭제하기·취소가 모두 보인다. 이전 캡처의 내부 가로 스크롤은 보이지 않는다. |
| [v05-green-M-left.jpg](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/v05-green-M-left.jpg) | 청구 예정일 헤더와 세 날짜가 한 줄로 읽히고, 긴 이름은 이름 열에서 줄바꿈된다. 표 내부 스크롤바는 의도된 양끝 접근 영역으로 남는다. |
| [v05-green-M-right.jpg](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/v05-green-M-right.jpg) | 예상 금액/결제 확인 헤더와 ‘예정 · 미연결’ 배지가 수평으로 읽힌다. 보조 ‘날짜별 조건 적용’은 짧은 줄들로 읽히고 이전 한 글자씩 세로 배지 현상은 보이지 않는다. |
| [v04-refund-green-M-01.jpg](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/v04-refund-green-M-01.jpg) | 실제 환불1000 아래에 환불 설명이 보이며 ‘0은 무료’가 제거됐다. 라벨/도움말/통화·내역 종류가 겹치지 않는다. |

이전 RED 삭제 D/M와 V05 왼쪽 날짜/오른쪽 세로 배지, 환불 기존 helper는 앞선 독립 작업에서 실제 판독했다. 여기서는 전체 V01–V09 이미지 또는 모든 상태 배지를 새로 검증했다고 확대하지 않는다. 특히 현재 QA에 실제 청구 연결 행이 없어 green 배지/긴 차이 설명의 rendered 데이터 상태를 이 사진으로 주장할 수는 없지만, 이번 좁은 CSS가 그 분기를 새로 변경하는 회귀는 소스상 보이지 않는다.

## 필요한 마무리 확인과 불필요한 재시험

- root가 예정한 **현재 세 파일의 TSC/build** 결과를 최종 증거에 연결하면 된다. 이 하위 검토는 중복 실행하지 않았다. `git diff --check`는 독립 실행해 exit0이었다.
- 동일 CSS/copy가 반영된 최종 빌드 화면에서 이미 고친 날짜/배지/긴 삭제명/환불 도움말을 연결한다. 이미지와 해당 소스가 바뀌지 않았다면 같은 전 구간을 반복 촬영할 필요는 없다. 새 실패나 새 소스 수정이 생기면 해당 영역만 다시 확인한다.
- payment의 결제↔환불 선택에 따라 helper/필수 라벨이 바뀌는지, 빈칸 입력을 저장 가능한 값이라고 잘못 안내하지 않는지는 현재 소스 분기와 root의 기존 폼 관찰에 연결한다. 새 실제 결제/환불 저장이나 신규 금융 엔진 테스트는 이 copy 수정의 필수 검증이 아니다. 브라우저 기본 required 검증이 먼저 뜨면 그 실제 메시지를 기록하며 JS 한국어 오류가 항상 발화한다고 주장하지 않는다.
- 200%/VoiceOver 검증은 별도 5.1.4/5.2.4 범위다. 이번 CSS 코드 승인과 정지 이미지로 두 게이트를 자동 채우지 않는다.

## 합성 fixture 복원 경계

`v06-tax-fixture-apply.json`과 `v06-tax-fixture-restore.json`을 읽었다. apply original→fixture, restore fixture→original, 양쪽 committed=true 및 private_record_count7이며 두 영수증의 original/fixture payload 원문 맵은 같고 각 SHA256도 독립 검산해 일치했다. 이는 root가 실행한 복원 영수증 확인이고, 이번 리뷰에서 live DB를 다시 쿼리하거나 직접 복원한 것은 아니다. 세 소스 diff에 합성 세금 included 값은 들어있지 않다. 실제 금융/실사용자 증거로 전환하지 않는다.

**결론: 현재 세 파일의 한정 변경은 승인 가능하다.** 새 코드 결함을 이유로 범위를 늘릴 사항은 없으며 최종 TSC/build·렌더 소스 연결 결과는 root의 마무리 증거로 남긴다.
