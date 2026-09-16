# V17 채택 점수표 — 2026-09-13

고정 9영역·38그룹·152게이트를 유지했다. 독립 검토와 root의 별도 검산을 거쳐 **3.4.4만 UNVERIFIED→PASS(+6.25)**로 채택했다. 다른 151개 게이트는 기존 근거까지 동일하며, 기준 문구·가중치·채점 방식·상한 규칙도 바꾸지 않았다.

**PASS141 / GAP4 / UNVERIFIED7. 88점 이상은 5/9영역이며 전체 목표는 미완료다.**

| 영역 | 점수 |
|---|---:|
| 정체성·기획 일치 | 86.25 |
| 내용·최신성 | 100 |
| 디자인 | 100 |
| 사용성 | 100 |
| 쾌적성·접근성 | 87.5 |
| 유용성 | 86.25 |
| 커뮤니티 | 100 |
| 개인 기능 | 81.25 |
| 배포·운영 | 93.75 |

점수는 고정 기준의 충족 합계다. 디자인100은 시각적으로 완벽하거나 모든 입력 조합·실제 사용자 과업을 검증했다는 뜻이 아니다.

## 이번에 채택한 근거

3.4.4 원문: “New guide/search/admin/expanded-billing screens have a complete cross-screen visual comparison.”

기존 28개 주 화면의 데스크톱·모바일 비평에 V01–V09 확장 상태와 V10 교차 비평을 연결했다. 실제 판독은 검토자 합계185장(거절1·제한3 포함), 최초 manifest189장의 바이트·해시 검산은 불일치0이다. 잘못된 캡처4장과 제한3장, 대체 캡처 및 범위를 보존했다. 로컬 합성 상태와 운영 검색·가이드·관리 화면을 구분한다.

실제 확대·스크린리더, 실제 사용자 결과, 실제 이메일 및 무방문 실행을 대신하는 근거로 사용하지 않았다. Chrome 작업 시간 조율 질문은 응답 대기이며, 확대·VoiceOver를 변경하지 않았다.

## 남은 고정 게이트

| ID | 상태 | 기존 기준 |
|---|---|---|
| 1.2.4 | GAP | The retained private/operational minimum, including email, is implemented. |
| 1.3.4 | UNVERIFIED | An external anonymous visitor completes a deployed public-information task. |
| 5.1.4 | UNVERIFIED | Zoom/reflow and the complete screen matrix are measured. |
| 5.2.4 | UNVERIFIED | Screen-reader reading order, descriptions and status announcements have an observed run. |
| 6.1.4 | UNVERIFIED | A representative person/task demonstrates choosing between candidates from the comparison evidence. |
| 6.3.4 | UNVERIFIED | A complete representative guide is reproduced and its result checked. |
| 8.1.4 | UNVERIFIED | Cross-device/account isolation is observed with independent real production sessions. |
| 8.4.3 | GAP | Customer-facing topic hide/not-interested and offered notification timing are complete. |
| 8.4.4 | GAP | Consented actual email delivery and unattended processing operate. |
| 8.5.4 | UNVERIFIED | Complete deployed export/download verification and full-account destructive flow are observed. |
| 9.4.4 | GAP | Required unattended/email operations and operating feedback/cadence are complete. |

## 소스와 기록

- 소스: `97022e07918cc0254a252b6e7a219e35fb00e9bb`. Sites 버전19, 배포 `appgdep_6aa57fa607b8819195b104c892a52351`, succeeded `2026-09-12T16:37:26.448721+00:00`.
- [비공개 사이트](https://ais-discovery-hub.aaahaaah19.chatgpt.site), owner/custom/허용 계정1/외부0/그룹0 유지.
- [전체 채택 JSON](2026-09-13-score-worksheet-v17.json) · [수정·화면·배포 검증](2026-09-13-v17-expanded-visual-verification.md).
- [독립 전체 비평](v17-expanded-ui/ais-v17-cross-screen-review.md) · [독립 제안과 검산](v17-expanded-ui/ais-v17-score-proposal.md) · [기계 검산 결과](v17-expanded-ui/ais-v17-score-proposal-check.json).

이전 V16 점수표와 독립 제안 원본은 변경하지 않았다. 현재 채택 상태는 JSON의 `v17Adoption`이며, `v17Proposal`은 이전 제안 기록이다.

[채택 후 독립 검산](v17-expanded-ui/ais-v17-adoption-check.md): 26개 비교를 통과했으며, 임시 제안 대비 152개 게이트 전체가 동일함을 재확인했다.
