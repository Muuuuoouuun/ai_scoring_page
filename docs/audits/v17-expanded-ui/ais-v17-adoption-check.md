# V17 채택 최종 검산 — 이상 없음

2026-09-13. 채택된 `docs/audits/2026-09-13-score-worksheet-v17.json/.md`를 V16 원본과 `/private/tmp/ais-v17-score-worksheet-proposed.json`, 임시 제안 MD 및 보존된 제안 JSON에 읽기 전용으로 대조했다. 기계 비교26항목은 모두 참이었고 불일치는 없었다. 이 보고서만 작성했으며 Site·Git·UI·원본 문서·배포·운영 데이터는 변경하지 않았다.

## 기준과 수치

- **9영역 / 38그룹 / 152개 고유 ID**이며 영역·그룹 이름, 모든 기준 문구·ID·가중치는 V16 및 임시 제안과 동일하다.
- V16 대비 객체가 달라진 게이트는 **3.4.4 하나**다. UNVERIFIED→PASS, 획득0→6.25, 원문과 가중치6.25는 보존됐다. `changes`도 이 한 항목뿐이다.
- **다른151개 게이트 객체는 기존 evidence까지 완전히 동일하다.** 채택된 전체152개 게이트 객체는 임시 제안의152개와도 모두 같다.
- 그룹별4개 동일 가중치 이진 채점, 각 영역 최대100, 기존 method/caps는 불변이다. 게이트 획득값으로 점수와 카운트를 다시 계산해 JSON·제안·V17 MD와 일치함을 확인했다.

| 영역 | V16 | 채택 V17 |
|---|---:|---:|
| 정체성·기획 일치 | 86.25 | 86.25 |
| 내용·최신성 | 100 | 100 |
| 디자인 | 93.75 | **100** |
| 사용성 | 100 | 100 |
| 쾌적성·접근성 | 87.5 | 87.5 |
| 유용성 | 86.25 | 86.25 |
| 커뮤니티 | 100 | 100 |
| 개인 기능 | 81.25 | 81.25 |
| 배포·운영 | 93.75 | 93.75 |

최종 **PASS141 / GAP4 / UNVERIFIED7**, 88 이상은 **5/9영역**이다. 디자인만+6.25이며 반올림이나 가중치 조정은 없다. V17 MD의 남은11개 게이트 표는 JSON의 ID·상태·원문과 정확히 일치하고, 5.1.4 확대/reflow 및5.2.4 실제 스크린리더는 그대로UNVERIFIED다. 전체 목표 미완료와 ‘디자인100≠시각적 완벽함·모든 조합·실사용 과업 완료’의 범위 제한도 보존됐다.

## 제안과 채택 메타데이터

임시 제안과 채택 JSON의 최상위 차이는 다음3개뿐이다. 게이트 객체나 수치 변경은 없다.

1. `v17Adoption` 추가: root의 ACCEPTED 상태, 검산 수치와 현재 소스가 기록됐다. 원본·제안 해시는 실제 파일과 일치한다.
2. `overall`: 제안 상태를 root 채택 상태로 고친 설명이며 전체 미완료와 다른 미완료 범위를 유지한다.
3. `evidenceRegister.E17V`: 임시 비평 경로를 보존된 `docs/audits/v17-expanded-ui/ais-v17-cross-screen-review.md` 경로로 바꿨다. 다른 evidenceRegister 값과 모든 게이트의 evidence는 임시 제안과 동일하다.

`v17Proposal`은 이전 제안 기록으로 남아 있으며 MD도 현재 채택 상태가 `v17Adoption`임을 명시한다. 보존된 제안 JSON은 임시 원본과 **바이트 단위로 동일**하다.

현재 `source`, `sourceContext.deployedSource`, `v17Adoption.source`, 이전 제안의 publication.source 및 V17 MD는 모두 **`97022e07918cc0254a252b6e7a219e35fb00e9bb`**와 일치한다. 보존된 `publication.json`에서도 source와 version.source.commit_sha, 버전19, deployment `appgdep_6aa57fa607b8819195b104c892a52351`, succeeded, updated `2026-09-12T16:37:26.448721+00:00`, environment revision2를 확인했다. owner/custom/허용 계정1/외부0/그룹0과 사이트 URL도 일치한다. 이는 저장된 root 도구 영수증 읽기이며 검토자가 Sites를 다시 호출한 것은 아니다.

## 검산 시점 파일 SHA256

| 파일 | SHA256 |
|---|---|
| V16 JSON | `a86ce424dd361d18e470635573f3c9b04215fb7f854bada740f6a60da5421f1c` |
| 채택 V17 JSON | `895aad1891a618b309f0ed1ee600ede5b45cfd93aa21062e5b4033796eac3859` |
| 임시·보존 제안 JSON | `93e8174aba4259ee43a651a9322506c4b7ebb1179b92dbc559c94a1a391ea445` |
| 채택 V17 MD | `c4cadc69a7534bf2f774a04237ced1411c0d4f909090ca0584faa9d94d6ce5f4` |
| publication.json | `3846cdbe5ea47c433773106c5a839da6ea8a2b2a1311fcbd4b6c7dde569b22ed` |

검산 시작과 끝에 읽은 원본 바이트가 동일했다. 추가 스크린·게이트·코드·운영 검증으로 범위를 확장하지 않았다.
