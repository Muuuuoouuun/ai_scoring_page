# V19 선택 구독 전체 이름 보완 — 한정 독립 검토

2026-09-14. Site/Git/브라우저/운영 변경 없이 제공 patch와 실제 `site/components/RecordForm.tsx`, 관련 기존 `.field`/`.form-grid` CSS만 읽었다. 점수 후보와 원본 문서는 변경하지 않았다. 기존 V19 장부 후보는79afc174/Sites20 시점 스냅샷이며 새 수정의 최종 소스·배포가 정해지기 전 채택을 보류한다.

**발견한 차단 결함 없음.** 다음 실제200% 시각 재확인을 진행해도 되는 소규모 표시 변경이다. 이 검토는 빌드/타입 검사나 실제 화면/VoiceOver 결과를 대신하지 않는다.

- RecordForm.tsx:2에서 `useId`를 추가했고, :10의 Hook은 조건부 return/분기 밖에서 매 렌더 동일하게 호출된다. 인스턴스별 고유 ID를 선택기와 설명에 연결하므로 여러 폼의 ID 충돌을 새로 만들지 않는다.
- :10의 `selectedSubscription`은 현재 `v.subscriptionId`와 `kind==='subscription'`을 함께 확인해 records에서 찾는다. 선택을 바꾸면 현재 상태로 다시 계산되며 별도 캐시/복사 상태가 없다. 결제(환불 포함)/해지 폼에서만 설명을 노출한다.
- 기존 wrapping label 대신 `label htmlFor`와 같은 값의 `select id`를 사용하므로 짧고 명확한 “연결할 구독 *” 이름은 유지된다. 선택한 구독이 실제 존재할 때만 `aria-describedby`와 대상 small을 함께 렌더한다. 비선택/누락 ID에서 dangling description을 만들지 않는다.
- 기존 이름·요금제·다음 결제일을 같은 payload에서 출력한다. 요금제/날짜 빈값은 “미입력”으로 보이며 원래 option의 문구나 실제 ID를 바꾸지 않는다. `whiteSpace:normal; overflowWrap:anywhere`와 기존 field min-width0/grid minmax(0,1fr)가 긴 문자열 줄바꿈을 지원한다. 이 source 조건만으로 실제200% 표시의 성공은 확정하지 않는다.
- 새 설명은 텍스트/React children만 추가하며 payload, 기록 소유권, 실제 결제·예상 계산이나 저장 요청을 바꾸지 않는다. 기록 수정 시 disabled도 그대로다.

## 기계 대조 결과

제공 `/private/tmp/ais-v19-subscription-identity.patch`의 파일 헤더는 `components/RecordForm.tsx` 한 파일이다. 실제 현재 파일에 patch의 모든 추가 라인이 정확히 존재한다. 전체 checkout의 변경 파일 목록을 Git로 별도 읽지는 않았으므로 저장소 전체가 단 한 파일 변경이라는 것은 root 제공 범위다.

| 대조 | 결과 |
|---|---|
| `async function submit(...)`부터 form 반환 전까지 전체 텍스트 | 변경 전/후 정확히 동일 |
| 연결 구독 `value/onChange` 본문 | 정확히 동일 |
| patch에 포함된 모든11개 `<option>` 노드의 props·text | 정확히 동일 |
| required/disabled/value·기존 옵션 목록 | 유지 |
| 기타 변경 | useId/파생 선택 조회/명시 label 연결/선택 항목 설명만 추가 |

- 실제 RecordForm.tsx SHA256: `403cd78fc3e9cc2ebd2907c3f305bba927f413249042a8b395efa885e0d5ecb7`
- patch SHA256: `2c5b3ce02e570de37d4e901ed7745b3b8b07d59df44b54c8832fd05d04b96e6d`

Root가 실제200%에서 긴 이름 전체·요금제/날짜·새로 늘어난 폼의 하단 저장/취소 접근을 재확인하는 단계와 연결한다. 단순 aria-describedby 존재를 실제 reader 발화 성공으로 평가하지 않는다. 코드/점수 편집은 하지 않았다.
