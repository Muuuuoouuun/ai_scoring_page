# V16 커뮤니티 초안 복귀·연결 복구 검증

2026-09-13 Asia/Seoul. 이전 V15는 실제 수정·배포가 이루어진 progress였으며, 이번에도 아래 네 소스 파일의 결함을 수정하고 기존 owner-only Site에 배포했다. 전체 9영역 88점 목표는 아직 완료하지 않았다.

## 배포·소스

- URL: https://ais-discovery-hub.aaahaaah19.chatgpt.site
- 소스: `2d54809d51bc2cacd096bd403e187afadcda078a` (`b8d35c036f0541446fafa746652406a81b19f0a6`에서 개선), source push 성공 후 literal `git rev-parse --verify HEAD`로 확인. 최종 checkout clean.
- Sites18: `appgprj_6aa42f3ab3ec81919d0048d508baa661~appgver_a3c7020717d88191a899fa1585f3b93b`.
- 배포: `appgdep_6aa5749d07588191a2c041d32502b9ab`, terminal succeeded `2026-09-12T15:50:21.869820+00:00`, environment revision2. 성공 후 다시 polling하지 않았다.
- 현재 owner/custom/allowed account1/external0/workspace groups0/tenant groups0을 배포 직전 확인했다. 접근 범위와 이메일 설정을 변경하지 않았다.
- [배포 영수증](v16-ui-recovery/deployment-receipt.json), [배포 파일 검증](v16-ui-recovery/ais-v16-archive-validation.json). 852121 bytes, SHA256 `a9f2f0564f56dabaf28d35c46e598defe9b099f555c588484f11bc5a3692aa1f`, dist root/Worker/manifest/migrations 포함, env files 없음. source credential은 파일·설정에 저장하지 않고 사용 후 임시 저장값을 지웠다.

## 실제 실패와 수정

| 경로 | 수정 전 실제 관찰 | 최종 동작과 증거 |
|---|---|---|
| 일반 비회원 작성 | `/community` → Claude 필터 → 글 작성 → 질문·닉네임·제목·본문·동의 → 로그인 후 게시. 복귀 URL `/community`, form0, 도구 필터 빈값. 직접 `write` URL만 검사하면 놓치는 경로였다. | 내부 복귀 URL에 작성 종류와 원래 초안 맥락을 포함한다. 같은 폼·필드·Claude 필터로 복귀, 동의 false. `draft-before-login-red.png`, `draft-after-login-red.png`, `draft-after-login-green.json/.png`. 로그인만으로 게시하지 않는다. |
| 열린 폼의 도구 필터 변경 | 같은 React key로 다른 draft key가 바뀌어 이전 값이 다른 도구 초안에 섞일 수 있는 소스 경로를 확인했다. | 맥락별 React key로 새 폼을 생성한다. Claude→Figma에서 빈 새 제목/본문, Figma 입력→Claude에서 기존 질문 그대로, 다시 Figma에서 별도 값만 복원. `context-isolation-green.json`. 이 행의 수정 전은 소스 진단이며 실제 과거 UI 실패를 찍었다고 주장하지 않는다. |
| 답글 로그인 복귀 | 상세 페이지가 `write` query를 받지 않던 소스 경로. 초기 보완 뒤 fresh `?write=reply`는 원문 로딩 전에 빈 toolId로 생성되었고, 실제 로컬 게시 결과 tool_id null인 RED를 확인했다. | 원문을 불러온 뒤 폼을 생성하고, 기존 빈 도구 초안도 원문 도구에 연결한다. 비회원 원문→답글→로그인→같은 parent와 본문/닉네임·동의 false, 로컬 최종 저장 parent 동일/tool_id claude. `reply-login-green.json/.png`, `ais-v16-reply-context-red.json`, `ais-v16-reply-context-green.json`. |
| 후기 추가 필드와 날짜 | 첫 복귀에서 사용일이13일로 남았다. 다시 date input을11일로 바꾼 직후 DOM value11/attribute13, checkbox 조작 뒤 value13으로 돌아오는 현상을 CUA에서 재현했다. | 날짜 input 이벤트도 즉시 state에 반영한다.11일 입력→checkbox 후 value/attribute11, 로그인 뒤 업무·요금제·날짜11·선택 평가4/3·나머지 미평가·본문 그대로, 동의 false. `review-before-login-final.json`, `review-after-login-final.json/.png`. **이전 `review-login-green.json/.png`라는 파일명은 최종 성공이 아니다. 그 최초 시도의 날짜 실패 흔적을 보존했다.** |
| 실제 연결 중단 | 확인된 localhost5173 dev session을 종료한 뒤 게시 버튼을 눌렀다. `Failed to fetch`, 입력 내용은 그대로, 버튼은 다시 사용 가능. | fetch 실패에 한국어 연결·목록 확인 안내를 표시한다. 다시 실제 dev 종료→동일 오류 상황에서 안내와 초안 보존을 관찰한 뒤, 종료 확인 후 서버 재시작→동의 재확인→같은 초안으로 로컬 글1건 생성. `network-failure-red.png`, `network-failure-green.json/.png`, `network-retry-green.png`. |
| 저장소 실패 | 제한된 저장소 접근, quota·잘못된 JSON은 독립 단위시험에서 다뤘다. | getter/read/write 예외를 처리하고 잘못된 필드·동의·알 수 없는 키를 복원하지 않는다. 로그인 직전 저장 실패면 페이지를 떠나지 않고 복사 보관 안내. 게시 성공 뒤 초안 제거 실패가 성공을 실패로 바꾸지 않게 한다. 실제 브라우저 저장소 차단 UI는 관찰하지 않았다. |

변경 소스는 `components/Community.tsx`, `components/Provider.tsx`, `lib/community-draft.ts`, `app/community/[id]/page.tsx`다. 기존 tab draft key를 유지해 V15에서 작성한 로컬 초안도 읽었다. 글 내용·닉네임을 복귀 URL에 넣지 않는다. 수정 폼의 안내는 실제 동작에 맞게 ‘수정 내용은 저장해야 반영됩니다.’로 바꿨다.

## 부모 없는 답글 읽기 — 고정7.2.4

`ais-v16-thread-fixture.py`로 충돌 없는 두 UUID와 서로 다른 user_id를 가진 합성 로컬 QA 부모A/답글B를 준비했다. 실제 사용자 두 명·두 로그인 계정·운영 데이터가 아니다. direct local fixture는 API 생성·관리자 권한 검증과 구분한다.

실제 React 화면의 같은 원문 URL에서 published → hidden → deleted를 순서대로 읽었다. 숨김·삭제 안내 아래 ‘답글’ 표식, B의 전체 문장, 닉네임, 날짜가 계속 보였으며 `V16-REPLY-B-REMAINS-READABLE` 문구도 읽었다. 원문 본문은 노출되지 않았고 ‘목록으로’를 눌러 `/community`로 돌아왔다. default1280×720/문서1265/scale1 환경이며 가로 넘침은 없었다. `parent-published.png`, `parent-hidden.png`, `parent-deleted.png/.json`에 보존했다.

실제 화면 비평: 원문 부재 안내는 독립된 옅은 배경 영역이고 남은 답글은 아래 행으로 이어져 문맥을 구분할 수 있다. 전체 답글 제목은 부모 부재 시 사라지지만 행의 ‘답글’ 배지와 작성자·날짜는 남아 읽기가 가능했다. 소스와 DB 보존만으로 이 읽기 과업을 대신하지 않았다.

## 검증 범위·정리

- 전체 `node --test tests/*.test.mjs`:259 PASS/0 fail/0 skip. 기존233 + 신규26(기본 draft5, 독립 draft18, API3). 별도 실제 Home RSC 시험4 PASS. 타입 검사, diff check, Sites build exit0. `ais-v16-regression.log`, `ais-v16-home.log`.
- API 시험은 실제 Provider를 TS 변환해 실행했으며 최초 network assertion1 FAIL/2 PASS→수정 뒤3 PASS를 보존했다. draft helper 최초 로그는 모듈 미구현 오류로, 동작 RED로 계산하지 않는다. 일반 작성·답글·날짜의 RED는 위 실제 UI/DB 관찰이다. 독립 helper 시험은 최초 GREEN이며 과거 실패를 본 것으로 부르지 않는다.
- 독립 최종 코드 검토는 이번 변경 범위를 승인했다. `ais-v16-final-code-review.md`. 개발 중 HMR/optimizer 경고는 로컬 환경 출력으로 남아 있으며 배포 오류0으로 대체해 숨기지 않는다.
- 로컬 후기 폼390×844/문서375/scale1에서 가로 넘침 없고 날짜·평가·본문·동의·게시 버튼이 단일 열로 배치됨을 확인했다. `review-mobile.png`. 이 관찰은200% 확대나 확장 화면 전체 비교를 증명하지 않는다.
- 운영에서 일반 글 작성→후기→날짜11일→다른 입력 조작→닫기/다시 열기 후11일·동의 false, 오류 없음. **운영 새 글은 게시하지 않았다.** `production-form-smoke.json`.
- 기존 결과 탭의 운영 홈 reload,410×783/문서395/scale1/overflow false, 해당 탭 콘솔 error[]; 최근10분 Worker errors_only events[]. 실제 화면 읽기 검사는 local과 production을 구별한다. 결과 탭을 deliverable로 지정했고 UI 열기 요청은 queued였으므로 foreground가 되었다고 주장하지 않는다.
- 개발 DB는 SQLite backup API로 일관된 사본을 만든 후 변경했다. fixture2개와 이번 CUA 글3개만 정리했고 기존 posts2/private_records7 전체 행이 이전 backup과 정확히 일치한다. `ais-v16-local-cleanup.json`. 임시 QA 탭을 닫고 viewport override를 reset했다.

## 고정 점수·남은 조건

고정152게이트/38그룹/9영역의 문구와 weight를 유지한다. 이번 실제 관찰은4.3.3과7.2.4에만 새 증거를 연결한다. 사용성95→100, 커뮤니티93.75→100; PASS140/GAP4/UNVERIFIED8,88 이상은 여전히5/9다. 그 밖의 상태를 이번 테스트 수나 단위시험 성공으로 올리지 않는다.

- 3.4.4: 기존28 principal 및 S01–S12 인벤토리를 재정리했지만 저장 비교의 작은 조건·긴 모달 전체를 포함한 완전한 교차 비교는 미완료. `ais-v16-ui-gate-inventory.md`에 순서와 필요한 판독 범위를 보존했다.
- 5.1.4/5.2.4: CUA Native apps가 Mac 잠금 오류를 반환했다. `super+plus`1회는 폭/배율 변화를 일으키지 않았다. 사용자에게 직접 잠금 해제를 요청했지만 응답 전 실제 확대·VoiceOver를 수행한 것으로 간주하지 않았다.
- 예약 운영: Sites의 실제 cron 등록/조회·scheduled export 보존 계약은 확인하지 못했다. 이는 영구 지원 불가를 뜻하지 않는다. Cloudflare 일반 기능만으로 현재 Site에서 동작한다고 주장하지 않는다. `ais-v16-scheduler-capability.md`.
- 실제 메일 수신·무방문 실행·운영 주기, 대표 실제 사용자의 비교 선택/가이드 재현, 독립 실제 운영 계정·기기 격리, 운영 전체 export/download·전체 기록 삭제는 여전히 별도 증거가 필요하다.
- 기존 세션 만료401의 재인증 전환, 서버 수락 후 응답 유실·게시 idempotency는 이번 일반 연결 중단 시험으로 해결했다고 주장하지 않는다. 개발 인증 전환은 실제 외부 ChatGPT 인증이나 사용자 연구의 대체물이 아니다.

전체 목표는 진행 중이다. 이번은 실제 수정·배포가 있는 progress이며 blocked/complete로 표시하지 않는다.
