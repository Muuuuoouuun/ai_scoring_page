# V16 4.3.3 초안·인증·네트워크 복구 흐름 검토

2026-09-13 Asia/Seoul. Site와 기존 감사 자료를 읽었으며 브라우저·로그인·게시·환경·Site 파일을 변경하지 않았다. 아래 RED는 **현재 소스에서 도출한 실제 UI 재현 후보**이며 이번 하위 작업에서 직접 관찰한 브라우저 실패라고 부르지 않는다.

## 고정 기준과 현재 증거

고정 4.3.3: “Guest draft→authentication→restore and network interruption are observed end-to-end in the current UI.” [현재 V15 worksheet](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-13-score-worksheet-v15.md:102)는 UNVERIFIED, 0/5다. 기존 4.3.1 저장 상태/실패 처리 및 4.3.2 읽기 재시도 통과는 이 전체 흐름을 대신하지 않는다.

V12의 [네트워크 관찰](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v12-feedback-verification.md:34)은 **Feedback**에서 로컬 서버 중단→연결 오류와 입력 유지다. 보고서 스스로 HMR/재시작을 넘어 미저장 초안 보존은 입증하지 않았다고 제한한다. V14 [개발 로그인·설정 복원](/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v14-email-verification.md:41)은 이메일 시간 설정의 저장·재조회이며 Community 게스트 초안은 아니다. 과거 공개 글/관리자 화면 관찰도 인증 전후 임시 입력과 네트워크 복구를 연결한 기록은 아니다.

## 실제 구현의 경계

| 위치 | 확인한 동작 | 복구에 대한 의미 |
|---|---|---|
| [Provider.tsx:12](/Users/bigmac_moon/dev/ai_score/site/components/Provider.tsx:12) | signIn은 기본 `pathname+search`를 `return_to`로 같은 창에 이동한다. hash, 열린 작성창, 현재 메모리 필터는 넣지 않는다. | 현재 URL에 담긴 맥락만 복귀한다. 인증 방식 자체는 Sites가 처리한다. |
| [Community.tsx:14](/Users/bigmac_moon/dev/ai_score/site/components/Community.tsx:14) PostForm | 새 글/답글의 key는 `ais-draft-` + `post.id || parentId || toolId || 'new'`. 마운트에서 저장 JSON을 initial에 덮고, ready 이후 v 변경마다 sessionStorage에 저장한다. 수정 글에는 임시 저장·복원하지 않는다. | 탭·origin 범위의 새 글/답글 값만 보존한다. 계정 ID, 글 종류, 현재 작성 intent, schema version은 key/envelope에 없다. |
| 동일 PostForm submit | HTML required를 통과한 게스트는 signIn만 실행하고 POST하지 않는다. 로그인 상태는 v/usedAt/parentId/ratings/publicConsent를 POST한다. 성공시에만 draft 제거 후 onDone, 실패는 error를 표시하고 v 유지, finally로 busy 해제. | 인증 복귀 후 자동 게시하지 않는 것은 적절하다. 공개 동의는 별도 state이며 복원하지 않아 다시 체크해야 한다. 네트워크가 실제 reject/응답 실패로 끝나면 재입력 없이 재시도할 기본 형태는 있다. |
| [Community.tsx:16](/Users/bigmac_moon/dev/ai_score/site/components/Community.tsx:16) | showForm 초기값은 `!!write`; selectedTool은 URL prop의 초기값. 필터 변경은 URL에 반영하지 않는다. PostForm key는 항상 `'new'` 또는 수정 id라 필터 변경으로 마운트를 새로 만들지 않는다. | 일반 버튼으로 연 작성창은 reload/auth 복귀 뒤 닫힌다. 필터로 고른 도구도 사라질 수 있다. |
| [community/page.tsx:2](/Users/bigmac_moon/dev/ai_score/site/app/community/page.tsx:2), [상세 page:2](/Users/bigmac_moon/dev/ai_score/site/app/community/[id]/page.tsx:2) | 목록은 `tool`, `write` query를 전달한다. 글 상세는 threadId만 전달하고 write query는 받지 않는다. | 도구 상세의 `/community?tool=...&write=review`는 자동으로 폼을 열지만 일반 작성·답글 경로는 그렇지 않다. |
| [Provider.tsx:16](/Users/bigmac_moon/dev/ai_score/site/components/Provider.tsx:16) api | fetch 후 JSON 파싱/HTTP 오류를 throw한다. 네트워크 TypeError의 한국어 변환·timeout·취소·응답 불확실 분류는 없다. | 즉시 연결 거절은 보여도 무응답 시 busy가 끝나는 시간을 보장하지 않는다. 요청이 서버에 적용됐는지 모르는 경우를 안전한 실패와 구분하지 않는다. |
| [api/community/route.ts:21](/Users/bigmac_moon/dev/ai_score/site/app/api/community/route.ts:21) | 인증·공개 동의·필수항목·부모/소유권 검사 후 신규 POST마다 서버 UUID를 만든다. p.id는 기존 글 수정용이고 신규 요청 idempotency key는 없다. | 성공 응답만 잃은 뒤 같은 새 글 재시도는 다른 게시물을 만들 수 있다. 1분 5회 상한은 중복 방지와 다르다. |

`sessionStorage.getItem/JSON.parse`는 catch하지만 저장 effect의 setItem과 성공 후 removeItem은 catch하지 않는다. 저장소 제한은 네트워크 장애와 별도이며, 차단 환경에서 “초안은 임시 보관됩니다” 문구의 보장을 입증하지 못한다. Provider user는 `{name}`만 내려오므로 다른 계정의 초안인지 구분할 정보도 현재 클라이언트에 없다.

## CUA에서 우선 재현할 순서

아래는 기존 UI의 주소·레이블로 가능한 수동 경로다. 이 하위 작업은 CUA를 호출하지 않았으므로 특정 browser의 offline/route-interception API가 지원된다고 가정하지 않는다. 캡처마다 origin·현재 URL·로그인 표시·동일 탭 여부·고유 합성 문구·보이는 필드·오류·게시 여부를 기록한다. 로컬 QA 문구는 공식 사용자 후기나 실제 고객 증거가 아니다.

1. **일반 진입(필수 기준 경로).** 게스트 `/community`에서 `글 작성` 클릭. 공개 닉네임 `V16 local draft`, 제목 `V16-DRAFT-A`, 내용 `인증 전 보관 확인용 로컬 초안입니다. 게시하지 않습니다.` 입력하고 공개 동의 체크 후 `로그인 후 게시`를 누른다. 정상 인증 복귀 직후 같은 입력 폼과 값·글 종류가 이어지는지, 공개 동의는 재확인 상태인지, 자동 POST가 없는지 관찰한다. 현재 소스상 폼이 닫힐 것으로 예상된다. `글 작성`을 다시 눌러 값이 돌아오더라도 **수동 복구와 자동 이어가기**를 구분해서 기록한다.
2. **필터에서 고른 도구 맥락.** 새 합성 초안으로 `/community`의 `커뮤니티 관련 도구`를 ChatGPT로 변경한 후 `글 작성`→입력→로그인한다. 복귀 URL에는 tool이 없고 selectedTool은 모든 도구로 초기화된다. 처음 열면 `ais-draft-new`를 읽는다. ChatGPT 필터를 다시 선택하고 재열어야만 원래 `ais-draft-chatgpt`에 접근하는지 확인한다. 단순 첫 필드 복원만 보지 말고 종류/관련 도구/업무/플랜/사용일/평가까지 원본과 비교한다.
3. **URL 맥락 보존 양성 대조.** `/community?tool=chatgpt&write=review`에서 관련 도구와 후기 필수 필드를 채우고 같은 인증 과정을 밟는다. URL의 tool/write가 유지되므로 폼 자동 복원 가능성이 높다. 이 경로의 성공만으로 1·2를 대신하지 않는다. 제목·본문·선택 평점은 복원하고 동의는 다시 체크해야 한다.
4. **초안 키 전환(로그인/게시 없이 가능).** `/community?tool=chatgpt&write=review`에서 A 초안을 작성한 채, 폼 밖의 `커뮤니티 관련 도구`를 Claude로 바꾼다. PostForm은 같은 React 인스턴스이고 새 key에 저장값이 없으면 setV를 초기화하지 않는다. 폼의 관련 도구/본문이 A로 남는지, 닫기→다시 열기에도 Claude 맥락에서 A가 나타나는지 확인한다. A·B 두 초안을 준비한 경우 원본 B가 보호되는지도 구분한다. 기존 저장 JSON을 직접 편집해서 UI 재현을 대신하지 않는다.
5. **확정 전 연결 실패와 재시도.** 인증된 로컬 폼에 고유 합성 내용을 채우고, root가 이미 허가받아 관리하는 개발 서버를 멈추는 등 **실제 요청이 실패하는 통제 방법**을 사용한 뒤 게시 버튼을 누른다. 이번 하위 작업은 서버를 제어하지 않는다. 오류 role=alert, 모든 입력/동의 보존, busy 해제·버튼 재사용 가능 여부를 확인한다. 서버 복구/HMR 이후에도 같은 탭 초안이 유지되는지 별도 기록한다. 실패 중 입력 유지와 reload 이후 복원은 다른 관찰이다. 성공까지 확인하려면 root의 로컬 QA 게시 범위 안에서만 한 번 제출하고 해당 합성 글 한 건/초안 제거를 확인한다. 실제 배포 게시 권한을 이 제안으로 추가하지 않는다.
6. **답글 맥락(기존 승인된 로컬 글이 있을 때).** `/community/{existing-local-id}`→`답글 작성`→고유 본문→인증 복귀. parentId가 보존되는지, 답글 작성창을 다시 찾아 열어야 하는지 확인한다. 이번 보고서를 위해 새 공개 원문을 만들 필요는 없다. parentId 없는 독립 reply로 바뀌거나 다른 원문에 붙는 것은 실패다.

## 의미적 RED 후보와 최소 판정

| 우선순위 | 후보·소스 근거 | 실패로 볼 결과 / 적절한 경계 |
|---|---|---|
| 높음 | 작성 intent와 필터가 URL/저장 envelope에 없음 | 인증 복귀 직후 작성창/대상이 사라지고 사용자가 초안 위치를 다시 찾아야 함. sessionStorage 바이트가 남았다는 사실만으로 게이트 충족 처리하지 않음. |
| 높음 | 같은 PostForm에서 draftKey 변화 시 ready/v가 재초기화되지 않고 저장 effect가 실행 | Claude 맥락의 새 초안에 ChatGPT 내용/도구가 복제되거나 복원 대상을 혼동함. 현재 저장 키는 글 종류도 포함하지 않아 같은 도구의 후기 초안이 `write=feature` 초기값까지 덮을 수 있음. 다중 초안 기능을 새로 요구하는 것이 아니라 기존 폼의 표시 대상과 저장 대상이 맞는지 보는 시험. |
| 높음 | API의 신규 UUID·재시도 식별자 부재 | 서버 커밋 후 성공 응답만 잃고 다시 게시하면 중복 글 생성 가능. 소스상 경로는 명확하지만 **단순 서버 중단/연결 거절로는 이 경합을 재현할 수 없다**. 통제된 모듈/API 시험으로 커밋 후 응답 손실을 재현하는 것이 먼저이며, CUA 지원을 확인하지 않고 fetch 가로채기·응답 조작을 할 수 있다고 주장하지 않음. |
| 중간 | 인증 만료 401에서도 user prop이 그대로라 signIn 안내 동작이 없음 | “로그인 후 이용” 오류가 나도 버튼은 계속 게시하기이고 누르면 반복 401. reload/재로그인 후 초안 복구가 필요한지 관찰. 최초 게스트 경로와 별도 보조 경계다. |
| 중간 | edit는 `post`가 있으면 session draft 미저장 | 네트워크 오류 직후 값은 남지만 reload하면 기존 서버 글로 돌아가 수정분이 사라짐. UI의 공통 “초안 임시 보관” 문구는 수정 폼에서도 표시되므로 과장 여부를 확인. 새 글 게이트와 수정 복구 범위를 구분한다. |
| 보조 | 저장소 set/remove 오류 미처리, submit은 busy 중 입력/닫기 허용 | 저장 실패에도 보관 문구가 남는지, 게시 요청 중 새로 입력한 값이 성공 처리에서 사라지는지. 이번 게이트를 넓히기보다 root가 현재 관찰 중 쉽게 만나는 경계로만 남긴다. |

최소 개선의 방향은 현재 작성 대상과 재개 의도를 보존하고, 복원했다고 명시적으로 알려주며, 요청 실패/불확실 상태를 구분하는 것이다. 자동 게시나 공개 동의의 자동 복원을 추가하면 안 된다. 새로운 장기 클라우드 초안/다중 기기 편집을 이 게이트의 전제 조건으로 추가하지 않는다.

고정 문구가 복원을 반드시 **자동**이라고 규정한 것은 아니다. 버튼을 다시 열어 동일 입력과 대상을 회복한 연속 UI 관찰은 수동 복구 증거로 정직하게 기록할 수 있다. 위의 작성창 닫힘 후보는 마찰·재발견 문제이지, 자동성이 없다는 이유만으로 기준을 새로 강화하자는 뜻이 아니다. 반면 다른 대상 초안을 읽거나 원래 입력을 되찾지 못하는 것은 의미적 복원 실패다.

## 테스트·인증 증거의 한계

현재 `site/tests`에는 PostForm/sessionStorage/auth-return/네트워크 중단을 렌더한 직접 시험이 없다. [api.test.mjs:12](/Users/bigmac_moon/dev/ai_score/site/tests/api.test.mjs:12)의 소유 글 수정/계정 격리, 13행의 평점 집계/미래일 거절, 16행의 삭제는 서버 경계다. [smoke-local.mjs:8](/Users/bigmac_moon/dev/ai_score/site/scripts/smoke-local.mjs:8)은 HTTP 개발 로그인 return과 개인 레코드 CRUD를 확인하며 React 입력 복원을 읽지 않는다. Feedback의 guest isolation 시험도 Community 초안 시험은 아니다. 이 보고서에서는 해당 시험을 새로 실행하지 않았다.

현재 [개발 Sites plugin](/Users/bigmac_moon/dev/ai_score/site/build/sites-vite-plugin.ts:8)은 localhost에서 고정 개발 identity를 주입하고, [sign-in 처리](/Users/bigmac_moon/dev/ai_score/site/build/sites-vite-plugin.ts:160)는 개발 쿠키 설정 후 safeReturn으로 302 이동한다. 그러므로 정상 로컬 UI 경로에서 게스트→개발 로그인→같은 탭 복원을 실제 조작할 수 있지만 **ChatGPT의 실제 계정 인증/동의 화면을 완료한 증거는 아니다**. raw header 주입이나 harness.user(null→alpha)를 실사용자 로그인으로 표현하지 않는다. 실제 인증 경로를 관찰하지 못하면 그 부분은 미확인으로 남긴다. 고정 기준은 실사용자 모집이나 새 공개 게시를 요구하지 않으므로 그런 요구를 덧붙이지도 않는다.

현 증거만으로 4.3.3을 PASS로 바꿀 수 없다. 다음 보고서는 위의 양성 대조와 일반 진입/필터 복귀, 실제 연결 실패→입력 보존→재시도/복구를 **현재 UI에서 이어 관찰한 범위**와 실제 인증인지 개발 모의인지 분리해야 한다.
