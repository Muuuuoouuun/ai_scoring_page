# V12 선택적 운영 피드백 — 독립 읽기 전용 검토

상태: 설계·계획, 실제 API/집계/마이그레이션과 export/delete/admin 연결, 새 Feedback/FeedbackReport 및 Shell/Privacy 연결을 검토했다. **현재 확인된 미해결 P1/P2 코드 결함은 없다.** 기존 피드백 API 테스트14개와 독립 추가6개가 모두 통과했고, 아래의 늦은 응답 방어 보완도 현재 소스 추출 검사로 확인했다. Site·Git·브라우저·배포·운영 데이터는 변경하지 않았다.

## 기준과 범위

- 설계: `/Users/bigmac_moon/dev/ai_score/docs/superpowers/specs/2026-09-12-operations-feedback-design.md` 7–17행.
- 계획: `/Users/bigmac_moon/dev/ai_score/docs/superpowers/plans/2026-09-12-operations-feedback.md` 11–18행.
- 유지할 원래 경계: `docs/2026-09-12-product-plan-v0.6.md` 233행의 정보 이해·개인 관리 사용/재사용 분모, 관찰 기간·미시도·미응답 구분, 짧은 자기보고를 실제 성과로 확대하지 않는 원칙.
- 계획의 피드백 창 시작/응답 코호트는 실제 개인 기능 사용/재사용 분모와 다르다. 이번 기능을 유용한 자기보고 수집으로 구현하는 것과, 원래 운영 측정·정기 처리·이메일 범위 전체를 완료했다고 주장하는 것을 구분해야 한다.

## 구현 전 확인할 구체 경계

**소유권·수정·삭제.** 같은 원시 탭 토큰을 비회원→계정 A→계정 B로 재사용해도 각 actor/영역/질문 버전의 기록은 별도여야 한다. 계획 12행의 unique session/scope/version은 session 해시에 서버 actor를 섞거나 DB unique 키에 actor를 포함해야 하며, 클라이언트 `userId`·기록 ID를 단독 소유권으로 인정하면 안 된다. guest 토큰은 추측하기 어려운 난수이고 길이가 제한되어야 하며, raw token·복구 hash를 API 응답/관리자/내보내기에 보내지 않는다. 로그인 정보 의견·개인 의견 모두 전체 계정 삭제/내보내기에 포함하되 같은 탭의 guest 및 다른 계정 의견은 보존한다.

**중복·수정·삭제와 분모.** 중복 start는 원래 시작 시각·페이지 종류·현재 응답을 유지하고 응답 수정은 같은 행을 대체해야 한다. 30일 시작 코호트의 기준은 `started_at`이므로 오래된 답변을 오늘 수정해도 신규 시작으로 들어오면 안 되며, 현재 기간에 시작하고 미응답인 기록은 분모에서 사라지면 안 된다. 명시적 삭제는 해당 시작/응답을 함께 제거하는 현재 보관 코호트로 해석하고, 닫기만 한 경우는 미응답 시작을 보존한다.

**판단 가능한 응답.** 도움 됨·일부 도움·도움 안 됨은 판단 가능한 분모에 포함하고, 아직 이용하지 않음·판단 어려움은 응답 수에는 포함하되 판단 가능 분모에서는 제외한다. ‘도움 됨 비율’의 분자는 도움 됨만이어야 하며 일부 도움을 합치려면 다른 이름/정의가 필요하다. 시작0뿐 아니라 ‘응답3, 전부 아직 미사용/판단 어려움’인 경우도 비율은 미집계(null)여야 한다.

**남용 경계.** 탭 토큰별 멱등성은 한 사람이 토큰을 바꾸어 여러 의견/미응답을 만드는 것을 방지하지 않는다. 새 외부 추적이나 CAPTCHA를 필수 범위로 제안하는 것은 아니지만, 이를 고유 인원·방문자 만족도·남용 방지 보증으로 설명하면 안 된다. 입력 크기/댓글 길이·허용 enum·최근 답변 조회 제한·집계 대상 범위를 서버에서 제한해 대량 입력의 비용과 관리자 노출 범위를 다뤄야 한다.

**민감정보·노출.** page kind는 제한된 enum으로 저장하여 검색어·전체 URL·개인 기록 내용을 자동 유입시키지 않는다. 자유 의견은 선택 입력이며 운영자 열람/공개되지 않음/연락처·계약금액 등을 쓰지 말라는 안내가 제출 전에 보여야 한다. 실제 의견을 HTML로 주입하지 않고 문자열로 렌더링해야 하며, 관리자 API는 인증과 관리자 검증 뒤에만 응답하고 API 오류 로그에 원시 token·의견 본문을 출력하지 않는다. 이 설계는 자동 민감정보 탐지/비식별화나 익명성 보증을 약속한 것이 아니다.

**화면 수명과 버전.** start/answer 응답이 늦게 도착한 뒤 닫기·재열기·계정 변경이 일어나도 다른 컨텍스트의 폼을 덮어쓰면 안 된다. 오류는 입력을 보존해야 하며 guest 탭 저장소를 잃은 경우 복구할 수 없다는 안내가 필요하다. 질문 버전을 변경하는 후속 배포에서는 오래 열린 질문 문구와 새 서버 버전이 섞이지 않도록 버전/현재 요청 컨텍스트를 확인할 경계가 필요하다.

## 테스트 초안 대조

`site/tests/feedback.test.mjs` 14–68행은 게스트 시작·개인 인증·중복/병렬 start·응답 대체·같은 토큰의 guest/A/B·두 scope 격리·다른 토큰·삭제·strict 입력·Origin·30일 분모·0분모·관리자·내보내기·전체삭제를 실제 SQLite/API 경로로 계획한다. 테스트 harness는 `DatabaseSync(':memory:')`에 실제 drizzle SQL을 적용하며 외부 호출을 기본 거부한다(`tests/api-harness.mjs` 9–17행); 실행해도 생산 데이터와 연결되지 않는 구조를 확인했다.

추가로 구현에서 확인할 최소 예시는 다음과 같다.

- 시작 시각을31일 전으로 둔 뒤 오늘 start/answer를 반복해도 코호트 시작 수가 늘지 않는다.
- 응답3개가 not_tried/not_tried/undecided이면 starts3·answers3·unanswered0·evaluable0·helpedShare null이다.
- 동일 토큰의 A 의견을 삭제해도 guest/B/다른 scope 의견을 지우지 않는다.
- 조회 당시 UTC 시작 경계 안/밖, 서버가 만든 현재 이후 기록 처리, 질문 버전별 집계가 정의와 일치한다.
- 폐기된 폼/이전 계정의 늦은 요청 결과는 새 화면의 선택 응답·의견에 나타나지 않는다(실제 UI 또는 적절한 컴포넌트 검사 필요).

위 항목은 구현 전 정한 검토 기준이다. 실제 구현과 실행 결과는 아래에 구분한다. 이 보고서는 점수 변경 근거가 아니며 root만 점수표·구현을 변경한다.

## 실제 API·DB 검토 및 실행 결과

- `site/lib/feedback.ts:5–13`: SHA-256 입력이 `JSON.stringify([session,userId])`라 같은 원시 토큰의 guest/A/B가 다른 키가 된다. start는 충돌 시 DO NOTHING으로 원래 context·started_at·answer를 보존하며 answer/delete는 그 해시·scope·서버 질문 버전으로만 대상을 제한한다. SQL은 바인딩하며 API/관리자 응답 필드에는 복구 해시·user_id가 없다.
- `site/app/api/feedback/route.ts:6–12`: UUID·scope·context·응답 enum·의견1,000자 제한과 strict 객체 검증을 적용한다. 기존 `input`의 실제 body64KiB/Origin 검증을 거친 뒤 서버 사용자로 actor를 정하고 개인 scope의 guest를401로 차단한다. 클라이언트 계정/질문 버전 필드를 추가하면400이며 질문 버전은 서버 상수다.
- `site/lib/feedback.ts:16–28`: 최근30일 UTC의 **시작 시각**과 현재 질문 버전으로 집계하고, 영역·회원/비회원·각 응답을 나눈다. 판단 가능=helped+partly+not_helped, 비율=helped/판단 가능이며0분모는null이다. 최근 답변은 같은 코호트에 한해30건으로 제한된다.
- `site/drizzle/0002_sloppy_carmella_unuscione.sql:1–17`: 실제 테이블과 session/scope/version unique, owner/cohort 인덱스가 있다. 현재 SQLite 마이그레이션을 적용한 메모리 DB에서14개 회귀가 통과했다.
- `site/app/api/export/route.ts:4`, `workspace/route.ts:55`, `admin/route.ts:6`: 내보내기와 전체 삭제에 소유 계정의 피드백을 포함하고, 관리자 검증 뒤에만 집계·최근 의견을 불러온다. guest/다른 계정 보존과 관리자 비인증/비권한 차단을 API로 검증했다.

실행 명령 `node --experimental-strip-types --test tests/feedback.test.mjs` 결과: **14/14 통과**. 테스트 harness가 생산 연결 없이 실제 마이그레이션을 적용한 SQLite `:memory:`를 사용함을 먼저 확인했다.

독립적으로 실제 API 모듈을 호출한 추가6개도 모두 통과했다.

| 사례 | 확인된 결과 |
|---|---|
| 31일 전 시작을 오늘 재열기·응답 수정 | started_at 유지, 현재30일 starts에 미포함 |
| not_tried 2 + undecided 1 | starts3/answers3/unanswered0/evaluable0/helpedShare null |
| 같은 token의 alpha 정보 의견 삭제 | guest/beta/alpha 개인 의견3건 보존 |
| UTC30일 경계와 현재 경계 | cutoff 직전·현재 직후 제외, 정확한 cutoff·현재 포함 |
| 이전 질문 버전 | 현재 지표에서 제외, 소유 계정 내보내기에 보존 |
| HTML/SQL 형태 의견·관리자 응답 | 의견은 바인딩된 문자열로 유지, DB1건 보존, raw token/hash/user_id 비노출 |

보존된 재실행 파일: `/private/tmp/ais-v12-feedback-boundary-check.mjs`.
실제 재실행 출력: `/private/tmp/ais-v12-feedback-boundary-check.txt`.
명령: `node --experimental-strip-types /private/tmp/ais-v12-feedback-boundary-check.mjs` (exit0,6개 통과). 코드/DB 변경은 메모리 프로세스 안에 한정되며 생산 운영 데이터를 생성하지 않는다.

## UI 정적 검토와 늦은 요청 방어

- `Feedback.tsx:8–12`: 로그인한 /my에서 personal, 다른 경로에서 information을 선택하며 사용자가 footer 버튼을 눌러야 열린다. 열 때의 user 객체·scope·path가 현재와 일치해야 폼을 렌더링하고 user/path 변화에는 닫으므로 새 계정/경로에 기존 폼을 그대로 표시하는 구조는 아니다. 이름 문자열을 사용자 ID 대신 비교한 것이 아니라 현재 Provider의 객체 참조 경계를 사용한다(`Provider.tsx:3–6`). 실제 두 계정 로그인 전환을 제가 브라우저에서 관찰한 것은 아니다.
- `Feedback.tsx:20–24`: 최초 공유 alive ref만 사용하던 형태는 effect cleanup→재실행 후 과거 AbortError/finally가 새 요청에 반영될 여지가 있었다. root가 요청 당시 controller를 캡처하고 alive·현재controller동일·signal미취소를 함께 검사하도록 보완했다. **현재 소스의 requestContext/start/effect를 AST로 직접 추출해 메모리에서 실행**한 결과, 과거 취소 요청이 새 error/busy를 바꾸지 않고 최신 응답은 정상 적용되며 unmount된 취소 요청은 데이터에 반영되지 않는3개 확인이 통과했다. 이는 강제로 구성한 수명주기 검사이며 실제 React StrictMode 활성화나 브라우저 계정 전환 증거로 부르지 않는다.
- `Feedback.tsx:17–19,28–34`: root가 실제 로컬 저장 뒤 초점이 body에 남는 문제를 발견했다고 보고한 후, 성공 status·오류 영역·삭제 확인 전환에 ref/tabIndex/focus 처리를 추가했다. 현재 코드에 이 처리와 Modal 재사용이 존재하는 것을 확인했으며, 보완 뒤 실제 키보드 초점 결과는 root 브라우저 검증에 속한다.
- `Feedback.tsx:26,30–34`: 제출 전 운영자 열람·시작 기록 수집·선택 의견1,000자·민감정보 금지·guest 탭 분실 한계·로그인 export/delete 안내가 있다. 오류 경로는 answer/comment를 초기화하지 않고, 수정/삭제는 busy 동안 비활성화하며 삭제는 시작 기록도 함께 지운다고 설명한다. 실제 의견은 JSX 문자열로 렌더링되며 위험 HTML 삽입 경로를 보지 못했다.
- `FeedbackReport.tsx:2–4`: null은0% 대신—로 표시하며 판단 가능 분모의 세 선택지를 정확히 명명한다. 미사용·판단 어려움은 분리 집계하고 guest/member·두 영역을 별도로 보여주며, 시작/응답은 고유 인원·실제 업무 성과가 아니고 다른 탭을 이용자 단위로 합치지 않는다고 명시한다. 출력은 최대 최근30개와 UTC 시작 코호트를 노출한다.
- `Shell.tsx:11`, `Admin.tsx:5`, `app/privacy/page.tsx:1`: optional footer entry, 관리자 내부 집계, 공개되지 않는 의견의 보관 내용/해시/로그인 전후 미병합/삭제 설명 연결을 확인했다.

## 남기는 제한

실제 화면 가독성·모바일·초점·스크린리더·zoom은 이 코드 검토에서 새로 관찰하지 않았다. root는 로컬 저장/재열기/수정과390px 문서 넘침 없음, 후속 초점 보완을 보고했지만 이 보고서는 해당 브라우저 조작을 제가 직접 수행했다고 표현하지 않는다. 무작위 토큰을 계속 발급하는 남용을 막거나 고유 사람 수를 식별하는 기능은 아니고 UI도 그렇게 주장하지 않는다. 개인 기능 실제 사용/재사용 측정·자기보고 밖의 성과·정기 운영·실제 이메일 및 질문 버전 변경 후 오래 열린 클라이언트의 배포 경계는 이 범위만으로 완료되지 않는다. 점수·게이트 상태를 변경하지 않았다.

## 최종 소규모 수정 재검토 — 2026-09-12

root가 페이지 진입 직후 의견 클릭이 닫히는 현상을 실제 관찰한 뒤 수정한 현재 `Feedback.tsx:11`은 `setOpen(current=>current&&(current.user!==user||current.path!==path)?null:current)`이다. 이전 무조건 닫기와 달리 현재 user/path가 같은 열린 상태는 그대로 두며 실제 계정·경로 변경만 닫는다. **현재 소스에서 effect를 직접 추출해 동일컨텍스트 보존·다른계정 닫기·다른경로 닫기3개를 실행해 모두 확인했다.** 이 변경은 기존 render 조건의 user/scope/path 일치 검사도 유지한다.

`Feedback.tsx:21,23,24`의 start/save/remove는 TypeError를 ‘연결하지 못했습니다. 입력을 유지한 채 다시 시도해주세요.’로 변환하고 다른 오류는 기존 메시지를 유지한다. 세 실제 함수를 현재 소스에서 추출해 각각 fetch 형태의 TypeError를 주입한 결과 **한국어 안내·answer/comment 보존·busy 해제·창 유지3개 경로가 모두 확인**됐다. 취소된 과거 요청은 먼저 current guard에서 걸러지므로 새 화면에 이 오류를 띄우는 경계도 유지한다.

요청한 독립 검사 재실행 결과:

- 늦은 요청 수명주기3개: 이전 취소 응답의 새 error/busy 변경 차단, 현재 응답 정상 적용, unmount 응답 반영 차단 — **3/3 통과**.
- `/private/tmp/ais-v12-feedback-boundary-check.mjs`의 실제 API/메모리 SQLite6개 — **6/6 통과**, exit0; 앞서 보존한 출력과 같은 결과.
- 이번 두 변경의 효과를 확인하기 위한 위 추가 컨텍스트3개·TypeError3개도 현재 소스를 직접 실행했다. 애플리케이션 정규 테스트 suite 수에 합치거나 실제 브라우저/스크린리더 관찰로 표시하지 않는다.

최종 읽기/추출 실행 대상의 SHA-256:

| Site 상대 경로 | SHA-256 |
|---|---|
| components/Feedback.tsx | c98d2afbcc9d1981f51318bc4503b0d4c4cadf962c396b4955372f7e070a5c55 |
| components/FeedbackReport.tsx | 675ec95ab78afc952d533371883e4424a92eddace7785e1b11c77d5ea9fc59b3 |
| lib/feedback.ts | 0a52bf2ad33134dbc7b62c615321261da3b15d514bc3b5d48678602ba7c72ff7 |
| lib/feedback-config.ts | dfde20c2519502e4a5e63eb447f2746c6fa9405e49f5ac1deb31f51b809fa3f6 |
| app/api/feedback/route.ts | f214afc92219f17ed19526a6f695a179e971e3d917b608248286bfae53f9fe5f |
| tests/feedback.test.mjs | e7f2836b49a76ecaf7e231687a436d2ba5a1a319c45bec205d58ad4a52b3433c |

Feedback.tsx는 해시를 계산한 파일과 실제 소스 추출 검사에서 출력한 해시가 동일하다. 이번 최종 수정에서 새 미해결 P1/P2를 발견하지 못했으며, 배포 성공이나 UI 확대·스크린리더 완료를 새로 주장하지 않는다.
