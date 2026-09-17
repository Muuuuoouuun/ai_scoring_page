# V16 고정 게이트 4.3.3 / 7.2.4 독립 평가 제안

2026-09-13 Asia/Seoul. **두 게이트를 PASS로 바꾸는 제안이 고정 문구와 제공된 실제 UI 증거에 부합한다.** 원본 점수표·Site·Git·브라우저·운영 데이터는 변경하지 않았다. 이 문서와 동명의 JSON은 root가 검토 후 채택할 제안본이다.

기준은 [V15 JSON](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-13-score-worksheet-v15.json)이다. 9영역·38그룹·152게이트의 ID/문구/가중치를 유지했다. [제안 JSON](/private/tmp/ais-v16-gate-assessment.json)은 전체 점수표 복제본이며 **4.3.3·7.2.4의 state/earned/evidence만 변경**했다. 다른 150개 게이트는 기존 evidence를 포함해 완전히 동일하다. 채점 방식과 기존 60점 상한 규칙도 그대로이며 새 상한 발동을 주장하지 않는다.

## 4.3.3 — PASS 제안, 0 → 5

고정 원문: **“Guest draft→authentication→restore and network interruption are observed end-to-end in the current UI.”** [기준 MD:102](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-13-score-worksheet-v15.md:102)

| 문구에 필요한 관찰 | 이번 증거와 판정 |
|---|---|
| 실제 현재 UI의 일반 게스트 작성 진입과 인증 복귀 | root가 `/community`에서 Claude 필터→질문 초안→로그인을 실행했다. RED는 복귀 후 폼 닫힘/모든 도구로 초기화였다. 최종 `draft-after-login-green.json/png`은 동일 질문 폼이 열리고 Claude·닉네임·제목·본문이 복원되며 공개 동의는 false임을 남긴다. 독립 검토자는 최종 JSON을 읽었다. |
| 맥락과 전체 필드의 복원 | `context-isolation-green.json`은 Figma 별도 초안을 남긴다. 답글은 `reply-login-green.json`의 같은 parent 경로/본문·false 동의와 `ais-v16-reply-context-green.json`의 새 답글 parent_id/tool_id=claude가 연결된다. null-tool RED 답글을 수정된 행이라고 바꾸어 읽지 않았다. 후기 최종 before/after JSON을 직접 비교해 **동의를 제외한 14개 필드가 모두 동일**, 업무·플랜·5개 평점·사용일 **2026-09-11** 유지, 동의만 **true→false**임을 검산했다. |
| 실제 연결 중단과 복구 | root가 해당 로컬 dev-server handle을 실제 종료한 뒤 전송해 오류를 관찰하고, 재시작 후 동일 글을 한 번 저장했다. `network-failure-green.json/png`에서 입력 보존·복구 안내·재시도 가능 상태, `network-retry-green.png`에서 같은 제목/본문의 저장 결과를 독립 이미지 판독했다. 한 새 질문이라는 행 수는 root의 DB 확인과 제공된 기록에 의존한다. |

**판정 근거:** 원문은 현재 UI에서 이어진 인증 전후 복원과 실제 네트워크 중단 과업을 요구한다. 여기서는 개발 인증을 사용하는 현재 로컬 React UI의 실제 전환과 오류/복구가 관찰됐다. 이를 소스 단위 시험만으로 대체한 것이 아니다. 원문에 없는 외부 ChatGPT 계정 또는 독립 실사용자를 새 필수조건으로 추가하지 않는다. 그런 조건을 명시적으로 요구하는 1.3.4·8.1.4는 그대로 UNVERIFIED다.

**제외한 증거와 한계:** `review-login-green.json`/동명 PNG는 날짜가 9월 13일로 돌아간 중간 관찰이라 최종 날짜 복원 근거로 쓰지 않는다. onInput 보완 뒤의 `review-before-login-final.json`→`review-after-login-final.json`을 사용한다. 이번 PASS는 실제 외부 ChatGPT 인증, 로그인 만료 중 기존 글 편집 복구, 서버가 수락한 뒤 응답만 유실되는 상황, 그 재시도의 idempotency/중복 방지, 모든 저장소 오류 또는 모든 작성 상태의 완전성을 뜻하지 않는다. 네트워크 전송 전에 서버가 중단된 실제 사례가 확인된 범위다.

## 7.2.4 — PASS 제안, 0 → 6.25

고정 원문: **“A deleted/hidden parent with other authors' replies has an observed readable UI task.”** [기준 MD:162](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-13-score-worksheet-v15.md:162)

root는 명시적 합성 로컬 fixture의 부모 A `user_id=ais-v16-fixture-parent`, 답글 B `user_id=ais-v16-fixture-reply`를 실제 React 화면에 표시하고 published→hidden→deleted 상태를 관찰했다. 원본 이미지 `parent-published.png`, `parent-hidden.png`, `parent-deleted.png` 세 장을 독립 검토자가 **직접 original로 열어 읽었다.** 파일 확장자는 PNG지만 원시 바이트가 JPEG인 사실은 내용 증거를 바꾸지 않는다.

- baseline에는 A의 합성 QA 부모 글과 B의 답글이 보인다.
- hidden와 deleted 모두 부모 원문 대신 “삭제되었거나 공개되지 않은 글입니다.” 및 “목록으로”가 보인다. 그 아래 B의 전체 문단, `V16-REPLY-B-REMAINS-READABLE` 표식, `합성 로컬 QA 작성자 B`, `2026. 09. 12`가 읽힌다. 본문은 부모 없이도 검증 맥락을 설명한다.
- root는 목록 복귀를 수행했다고 보고했다. `parent-deleted.json`은 같은 실제 경로와 읽기 텍스트를 보존한다. `ais-v16-local-cleanup.json`은 fixture 제거와 기존 posts/private_records 스냅샷 복원 일치를 기록한다.

**판정 근거:** 다른 작성자 소유의 답글이 데이터베이스에만 남는 상태를 넘어 숨김/삭제 부모의 실제 읽기 화면을 관찰했다. 두 개의 서로 다른 저장 user_id가 “other authors” 관계를 구성한다. 실제 두 사람 또는 실제 두 로그인 세션이라고 속이지 않는 한, 이 게이트에 별도의 실제 사용자 연구/인증 조건을 추가할 이유는 없다.

**한계:** 이는 로컬 합성 데이터 UI 과업이다. 실제 두 사람·두 계정의 운영 세션, 관리자 숨김 권한, 작성자의 실제 삭제 API 실행, 전체 계정 삭제, 운영 환경 계정 격리를 추가로 증명하지 않는다. 부모 상태 변경은 준비된 fixture로 수행됐으며 화면 읽기와 복귀가 실제 관찰 범위다.

## 고정 합계와 남은 조건

| 영역 | V15 | V16 제안 | 변화 |
|---|---:|---:|---:|
| 정체성·기획 일치 | 86.25 | 86.25 | 0 |
| 내용·최신성 | 100 | 100 | 0 |
| 디자인 | 93.75 | 93.75 | 0 |
| 사용성 | 95 | **100** | +5 |
| 쾌적성·접근성 | 87.5 | 87.5 | 0 |
| 유용성 | 86.25 | 86.25 | 0 |
| 커뮤니티 | 93.75 | **100** | +6.25 |
| 개인 기능 | 81.25 | 81.25 | 0 |
| 배포·운영 | 93.75 | 93.75 | 0 |

**PASS 138→140 / GAP 4 유지 / UNVERIFIED 10→8.** 반올림이나 가중치 조정이 없다. 88점 이상은 여전히 **5/9영역**이므로 전체 목표는 미완료다. 점수와 별도로 명시적 미완료 범위도 전체 완료를 막는다.

- 유지 UNVERIFIED: `1.3.4, 3.4.4, 5.1.4, 5.2.4, 6.1.4, 6.3.4, 8.1.4, 8.5.4`.
- 유지 GAP: `1.2.4, 8.4.3, 8.4.4, 9.4.4`.
- 특히 **3.4.4는 인벤토리 정리만** 있으므로 U 유지. 전체 확장 화면/zoom/스크린리더, 실제 외부 사용자·독립 실제 운영 계정, 대표 비교 선택·가이드 재현, 배포 환경 실제 export/download와 전체 계정 삭제, 실제 이메일과 무인 처리를 이번 두 과업으로 가산하지 않는다.

## 증거 출처와 검산 경계

[배포 영수증](/Users/bigmac_moon/dev/ai_score/docs/audits/v16-ui-recovery/deployment-receipt.json)은 소스 `2d54809d51bc2cacd096bd403e187afadcda078a`, Sites 버전 **18**, `succeeded`, `2026-09-12T15:50:21.869820+00:00`, 환경 revision 2를 기록한다. 현재 사용자 owner·허용 계정 1·external visitor 0이다. access 객체의 latest_version_number=17은 version18 생성 전 조회 필드로, 최종 version 객체 및 연결된 성공 deployment와 구별한다. 배포 성공 사실이 위 로컬 과업을 운영 인증/운영 합성 데이터 관찰로 바꾸지는 않는다.

독립 검토는 제공된 JSON·코드 검토 보고서·원본 이미지 판독 및 점수 산술이다. 이번 평가에서 브라우저를 직접 조작하거나 새 기능 테스트를 실행했다고 주장하지 않는다. [최종 코드 검토](/Users/bigmac_moon/dev/ai_score/docs/audits/v16-ui-recovery/ais-v16-final-code-review.md)의 과거 실행 결과는 해당 검토자의 기록으로 구분했다.

재현 검산 스크립트는 [ais-v16-build-gate-proposal.py](/private/tmp/ais-v16-build-gate-proposal.py)다. 실행 확인: 9영역/38그룹/고유 152ID, 그룹별 가중치 합, 이진 획득 규칙, 정확히 두 ID만 변경, 다른 150개 gate object/evidence 완전 동일, 9개 합계, 140/4/8, 최종 후기 14필드 일치가 모두 assertion을 통과했다. 원본 점수표 hash는 제안 JSON에 기록했다. JSON의 이전 `sourceContext`는 역사 정보 그대로 두고 현재 배포는 `v16Proposal.publication`에 분리했다.
