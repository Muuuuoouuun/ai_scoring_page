# V15 고정 점수 독립 검토

검토일: **2026-09-13 Asia/Seoul**, 검산 시각 **2026-09-12T15:05:20Z**. V14 점수표의 문서 날짜는 원래의 2026-09-12로 유지한다. 이 검토는 현재 파일을 읽고 산식을 독립 실행한 결과다. Site·Git·브라우저·배포·운영 데이터·점수표를 변경하지 않았다.

**판정: V15의 새 게이트 획득 근거는 없으며, 이전 점수와 138/4/10 상태를 유지하는 것이 타당하다. 점수 변화는 0이다.** 실제 이메일 수신·무인 스케줄러·실사용자 과업·OS 화면 읽기/확대 검증은 여전히 미확인이다. 이는 기존 증거의 산술 및 이번 변경 범위에 대한 검토이며, 138개 PASS를 현재 배포에서 모두 다시 수행한 종합 인증은 아니다.

## 실제 파일과 고정 산식의 독립 대조

- [V14 JSON](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-score-worksheet-v14.json)과 [V14 MD](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-score-worksheet-v14.md)를 직접 읽었다. 기존 검산 보고서의 숫자를 복사하는 대신 Python 표준 라이브러리로 각 게이트를 순회했다.
- [고정 원본 V4](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-score-worksheet-v4.json), [V13](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-score-worksheet-v13.json)과 영역/그룹 순서·이름·그룹 가중치·152개 기준 문구를 대조했다. **V4에는 개별 `id`와 `weight` 필드가 없다.** 최초 검사 스크립트가 이를 직접 읽다 `KeyError: id`로 중단했으므로, V4의 원래 위치에서 `영역.그룹.게이트`와 `W/4`를 도출해 재실행했다. 기대 문구나 가중치를 바꾸지 않았고 최종 검사 종료 코드는 0이었다.
- 최종 대조에서 9영역, 38그룹, 고유 ID 152개, 모든 그룹 4게이트, 각 영역 그룹 가중치 합 100을 확인했다. V4의 정규화된 기준은 V13/V14와 일치했다. V14의 ID는 실제 배열 위치와도 모두 일치했다.
- [명시 채점 규칙](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-scope-matrix.md:195)의 38개 고정 그룹 가중치와 일치한다. 각 게이트 `weight=W/4`, `earned=W/4`는 PASS에만 적용하고 GAP/UNVERIFIED는 0이다. 모든 저장 획득점과 영역 합계를 재계산해 일치 확인했다.
- V13→V14의 152개 ID/state/earned는 전부 동일하다. V14 MD의 **152개 ID/문구/state/earned 행**, 9개 요약 점수 및 88 이상 표기도 JSON과 모두 일치한다.

| 영역 | 그룹/게이트 | 유지 점수 | 88 이상 |
|---|---:|---:|---|
| 정체성·기획 일치 | 4 / 16 | 86.25 | 미달 |
| 내용·최신성 | 5 / 20 | 100.00 | 충족 |
| 디자인 | 4 / 16 | 93.75 | 충족 |
| 사용성 | 4 / 16 | 95.00 | 충족 |
| 쾌적성·접근성 | 4 / 16 | 87.50 | 미달 |
| 유용성 | 4 / 16 | 86.25 | 미달 |
| 커뮤니티 | 4 / 16 | 93.75 | 충족 |
| 개인 기능 | 5 / 20 | 81.25 | 미달 |
| 배포·운영 | 4 / 16 | 93.75 | 충족 |

집계: **PASS 138 + GAP 4 + UNVERIFIED 10 = 152**. 88 이상은 **5/9영역**이다. 산술 대조용 획득 합은 **817.50/900**, 미획득은 GAP **25.00**과 UNVERIFIED **57.50**이며 `900−25−57.50=817.50`으로 일치한다. 합계·평균·PASS 비율을 새 종합 완료 기준으로 사용하지 않는다. 87.50을 88로 반올림하지 않는다.

## V15 근거가 추가하는 범위

[V15 설계](/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-12-notice-versions-design.md:5)는 중요 버전/source head, 오래된 실행 차단, 자격 fingerprint, 가격·기간·필요 기능의 보수적 판정, 원 카드 정정, legacy 이관을 다룬다. [공식 혜택 재검증](/private/tmp/ais-v15-promotion-source-review.md)은 공개 미국 혜택의 출처와 미확인 가격/시간 정보를 구분한 문서 검증이다. 두 자료는 실제 개인 신청 승인·서비스 이용·메일 수신 증거가 아니다.

[독립 코드 검토](/private/tmp/ais-v15-code-review.md)는 최초 발견 5개 결함의 수정 확인, 마지막 독립 8사례와 관련 기존 48사례 PASS를 기록한다. 해당 원시 출력과 `/private/tmp/ais-v15-final-tests.tap`의 **231 PASS / 0 FAIL** 집계도 읽었다. 이는 기존 실행 영수증 확인이지 이번 점수 검토자가 제품 테스트를 새로 실행한 결과가 아니다. 8·48·231은 실행 범위가 겹치므로 합산해 고유 검증 개수나 사용자 성공률로 표시하지 않는다. mock provider 요청/접수 번호는 실메일 전달이 아니다.

현재 [README 운영 설명](/Users/bigmac_moon/dev/ai_score/site/README.md:26)은 방문 없는 정기 실행을 보장하는 스케줄러가 없다고 밝힌다. [email-status.ts](/Users/bigmac_moon/dev/ai_score/site/lib/email-status.ts:17)는 실제로 `processing:'on_refresh'`를 반환하며 [수신 설정 안내](/Users/bigmac_moon/dev/ai_score/site/components/EmailPreferences.tsx:15)도 화면 방문/새로 확인 시 처리라고 설명한다. [접수 내역 안내](/Users/bigmac_moon/dev/ai_score/site/components/EmailDeliveryStatus.tsx:15)는 제공사 접수와 받은편지함 도착을 구분한다. 테스트 harness에는 `TEST_ONLY` 자격과 `.invalid` 시험 주소가 있다.

Root의 제한된 로컬/UI 확인은 해당 설정·정정 경로의 구현 근거를 보강한다. 이 점수 검토에서는 브라우저를 조작하거나 화면을 독립 재판독하지 않았다. 두 설정 화면 또는 일부 정정 경로 확인을 전 화면·OS VoiceOver·200% zoom·실사용자 과업의 완료로 넓히지 않는다. Root가 진행 중인 최종 build/deploy의 완료도 이 보고서에서 선행 확인하지 않는다.

## 운영 관련 4개 GAP 유지

| ID / 고정 기준 | V15 이후에도 남는 증거 경계 | 유지 획득점 |
|---|---|---:|
| 1.2.4 — The retained private/operational minimum, including email, is implemented. | 버전·자격·정정 구현만으로 실제 이메일·무방문 운영·운영 주기를 포함하는 전체 최소 요건이 완료되지 않는다. | GAP, 0 / 8.75 |
| 8.4.3 — Customer-facing topic hide/not-interested and offered notification timing are complete. | 숨김·동의·처리시각의 코드 연결은 보강됐지만 기존 게이트가 남겨 둔 무인 timing은 여전히 on-refresh이다. 결합 기준을 분리해 부분 점수를 새로 배정하지 않는다. | GAP, 0 / 5 |
| 8.4.4 — Consented actual email delivery and unattended processing operate. | 실제 발송 연결·동의한 수신자의 실수신·방문 없는 실행 증거가 없다. 메모리 mock과 한정 UI로 대체할 수 없다. | GAP, 0 / 5 |
| 9.4.4 — Required unattended/email operations and operating feedback/cadence are complete. | 원 카드·이관·처리 이력은 조사 수단을 보강하지만 등록된 실행 주체와 실제 운영 주기·feedback 전체 요건을 입증하지 않는다. | GAP, 0 / 6.25 |

이 경계는 [V14 독립 검토](/Users/bigmac_moon/dev/ai_score/docs/audits/v14-email-timing/ais-v14-score-boundary.md:29)와 동일하다. 이미 PASS인 2.1/2.4의 출처·불확실성, 6.4의 조건 설명, 8.4.2의 후보·중복·동의 검사, 5.4의 회귀 근거가 강화돼도 같은 게이트에서 가중치를 다시 획득하지 않는다.

## 10개 UNVERIFIED 유지

| ID | 여전히 필요한 관찰 | 유지 획득점 |
|---|---|---:|
| 1.3.4 | 외부 비회원의 실제 배포 공개정보 과업 | 0 / 5 |
| 3.4.4 | 지정된 신규 화면과 펼친 상태 전체의 화면 간 시각 비교 | 0 / 6.25 |
| 4.3.3 | 비회원 초안→인증→복원 및 네트워크 중단 회복의 전체 UI 흐름 | 0 / 5 |
| 5.1.4 | 확대/reflow 및 전체 화면 행렬 측정 | 0 / 6.25 |
| 5.2.4 | 실제 화면 읽기 도구의 읽기 순서·설명·상태 알림 실행 | 0 / 6.25 |
| 6.1.4 | 대표 인물/과업에서 비교 근거를 이해하고 후보를 선택한 관찰 | 0 / 7.5 |
| 6.3.4 | 대표 가이드 전체 직접 재현 및 결과 확인 | 0 / 6.25 |
| 7.2.4 | 다른 작성자의 답글이 있는 삭제/숨김 부모를 읽는 UI 과업 | 0 / 6.25 |
| 8.1.4 | 독립된 실제 운영 계정·기기 세션 간 격리 관찰 | 0 / 6.25 |
| 8.5.4 | 배포된 전체 내보내기/다운로드 및 전체 계정 삭제 흐름 | 0 / 2.5 |

새 자동 검사, 출처 재검증, 설정 화면 확인은 위 조건을 직접 충족한 관찰이 아니다. 특히 에이전트의 fixture/벤치마크 결과와 선택적 의견 창 응답을 실제 이용자 연구나 업무 성과로 바꾸지 않는다.

## 점수 유지와 전체 완료의 구분

이번 검토 범위에서 새로운 60점 상한 사유가 입증되지는 않았다. 독립 코드 검토에 기록된 최초 결함은 해당 보고서의 최종 재현에서 수정 확인됐으므로, 최초 RED만으로 현재 결함이라고 단정하지 않는다. 반대로 이 좁은 검토가 전체 보안/개인정보 무결함을 보장하는 것도 아니다. 실제 새 중대 결함·깨진 핵심 흐름·최종 배포 실패가 확인되면 고정 규칙에 따라 영향 영역을 다시 판단해야 한다.

현재 4개 영역이 88 미만이고 명시 운영 요구도 남는다. 따라서 **점수 유지가 전체 목표 완료라는 뜻은 아니다.** 최종 배포 근거는 따로 갱신할 수 있지만, 배포 성공 자체로 운영 GAP나 미검증 과업을 PASS로 바꿀 수 없다.

## 재현 가능한 산식

아래는 실제 독립 검사에서 사용한 핵심 연산이다. 파일 읽기만 하며 저장된 totals를 계산 입력으로 사용하지 않는다.

```python
import json, re
from pathlib import Path
from collections import Counter
p = Path('/Users/bigmac_moon/dev/ai_score/docs/audits')
d = json.loads((p/'2026-09-12-score-worksheet-v14.json').read_text())
b = json.loads((p/'2026-09-12-score-worksheet-v4.json').read_text())
v13 = json.loads((p/'2026-09-12-score-worksheet-v13.json').read_text())
def shape(x):
    return [(a['name'], [(n, w, [
        (g.get('id', f'{ai}.{gi}.{ki}'), g['name'], g.get('weight', w/4))
        for ki, g in enumerate(gs, 1)])
        for gi, (n,w,gs) in enumerate(a['groups'], 1)])
        for ai, a in enumerate(x['areas'], 1)]
assert shape(d) == shape(b) == shape(v13)
gates = [g for a in d['areas'] for _,_,gs in a['groups'] for g in gs]
assert len(d['areas']) == 9
assert sum(len(a['groups']) for a in d['areas']) == 38
assert len(gates) == len({g['id'] for g in gates}) == 152
assert Counter(g['state'] for g in gates) == d['counts']
totals = []
for ai, a in enumerate(d['areas'], 1):
    assert sum(w for _,w,_ in a['groups']) == 100
    earned = 0
    for gi, (_,w,gs) in enumerate(a['groups'], 1):
        assert len(gs) == 4
        for ki, g in enumerate(gs, 1):
            assert g['id'] == f'{ai}.{gi}.{ki}'
            expected = w/4 if g['state'] == 'PASS' else 0
            assert g['weight'] == w/4 and g['earned'] == expected
            earned += expected
    totals.append({'area': a['name'], 'score': earned})
assert totals == d['totals']
md = (p/'2026-09-12-score-worksheet-v14.md').read_text()
rows = re.findall(r'^\| (\d+\.\d+\.\d+) \| (.*?) \| '
                  r'(PASS|GAP|UNVERIFIED) \| ([0-9.]+) \|$', md, re.M)
assert len(rows) == 152
assert [(i,n,s,float(e)) for i,n,s,e in rows] == [
    (g['id'],g['name'],g['state'],g['earned']) for g in gates]
print(totals, Counter(g['state'] for g in gates))
```

## 검토 스냅샷 SHA-256

```text
c5f34195e6dbbeace978c18b44c7928509609a6390f88134c72df06ccb1c028e  V14 worksheet JSON
605466a87313fe5b55bfa8b8f73ba0c652043c516299d7d199bb49b3a6f332bf  V14 worksheet MD
4281d8627227cceb4710744574256f54460e3f0d614ccaf536c380f118d01868  V4 worksheet JSON
4ea8067ca40b1fe7289b52262f68a90b28eeb419c9041984be477e932de4722a  V13 worksheet JSON
26701eecb05da8e317aed6421ca61be4bdb68f37660536c688dc39be19066869  scope-matrix.md
6d4f89ea80a1c952ea3e46b8276c7c22940b56d2fa1680a88bd4a4bc04fcf7ac  notice-versions-design.md
7156b630a77d3a02a9e6fe34d9d587447cc591784f60b6de5e280b314be6b947  site/README.md
f2be656298e7216f4379a47afeaf900946337276089ceb14a46b4da383d96f91  site/lib/email-status.ts
```
