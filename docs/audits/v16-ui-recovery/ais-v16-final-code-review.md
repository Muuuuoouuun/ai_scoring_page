# V16 최종 코드 검토

2026-09-13 Asia/Seoul. **검토한 네 파일의 이번 변경 범위는 승인 가능하다. 앞서 지적한 답글의 빈 toolId 경로가 보완됐고, 추가로 수정을 막아야 할 결함은 발견하지 못했다.** 이는 코드 검토의 제한된 승인으로, 실제 인증·배포·전체 4.3.3 게이트의 독립 PASS 판정은 아니다.

검토 파일은 [community-draft.ts](/Users/bigmac_moon/dev/ai_score/site/lib/community-draft.ts), [Community.tsx](/Users/bigmac_moon/dev/ai_score/site/components/Community.tsx), [Provider.tsx](/Users/bigmac_moon/dev/ai_score/site/components/Provider.tsx), [글 상세 page](/Users/bigmac_moon/dev/ai_score/site/app/community/[id]/page.tsx)다. Site·브라우저·로그인·실제 게시·운영 데이터는 변경하지 않았다.

## 최종 수정 확인

| 경계 | 현재 소스에서 확인한 결과 |
|---|---|
| 원문 비동기 로딩 | `showForm && (!threadId || parent)`로 새 답글 폼은 원문을 얻은 뒤 마운트한다. 원문 GET 오류는 기존 다시 시도 경로에 남고, 삭제/비공개 원문에는 작성 폼을 열지 않는다. 따라서 새 `?write=reply` 진입의 빈 초기 toolId가 state에 고정되던 경로를 막는다. |
| 기존 답글 초안 복구 | 저장 값을 initial에 합친 뒤 `parentId ? toolId : saved.toolId ?? initial.toolId`로 원문의 현재 관련 도구를 우선한다. 이전 버전이 저장한 빈 toolId가 원문 도구를 덮지 않는다. kind도 답글로 고정하고 parentId는 저장 JSON에서 읽지 않으므로 임의 저장 데이터가 답글 대상을 바꾸지 않는다. |
| hydration·문맥 변경 | ready 이전에는 저장 effect가 실행되지 않아 초기 기본값으로 기존 초안을 먼저 덮지 않는다. `edit:`, `reply:`, `new:` React key가 폼 인스턴스를 분리하여 도구 필터가 바뀔 때 이전 v/ready/consent가 새 문맥으로 그대로 옮겨가지 않는다. 같은 legacy 저장 key를 유지하는 정책은 helper 계약과 일치한다. |
| 인증 복귀·공개 동의 | 게스트 submit은 최신 값/날짜를 동기 저장한 뒤 보존한 tool/kind 또는 parent 경로로 이동한다. 저장 실패는 이동을 막고 복사 안내를 표시한다. 복원 payload는 publicConsent/consent를 제외하고, 새 폼 consent는 false이므로 자동 게시·자동 동의가 없다. |
| 저장소 장애와 성공 처리 | getter/getItem/setItem/직렬화 예외는 null/false로 처리된다. 게시 성공 후 removeItem은 별도 try/catch라 정리 실패를 게시 실패로 잘못 바꾸지 않고 onDone을 실행한다. |
| 연결 오류 안내 | Provider는 fetch rejection에 한국어 연결 안내와 저장 결과를 목록에서 먼저 확인하라는 문구를 낸다. 자동 재전송하지 않는다. 서버 JSON의 구체 검증 오류는 유지하고, 성공 JSON과 기존 사용자 지정 헤더도 유지한다. |
| 안전한 복귀 주소 | 새 글은 URLSearchParams, 답글은 고정 `/community/` 아래 encodeURIComponent(parentId)로 만든다. 검사한 도구/부모 문자열은 외부 origin·추가 query 동작·fragment를 주입하지 못했다. 실제 문맥은 현재 페이지의 도구/원문 prop에서 전달된다. |

## 직접 실행한 검증

명령: `node --test --test-reporter=tap site/tests/client-api.test.mjs /private/tmp/ais-v16-draft-review-tests.mjs`

**22개 통과, 실패/skip 0, exit 0.** 구성은 Provider 동작 3개, 독립 helper 동작 18개와 export 계약 확인 1개다. helper 저장소는 메모리 fixture이며 실제 helper를 직접 import한다. Provider 시험은 현재 실제 Provider 소스를 TypeScript로 변환해 api 함수를 호출한다. 네트워크·실제 사용자·브라우저를 사용하지 않는다. 이 숫자는 22개 독립 제품 요구나 실제 UI 과제 완료 수가 아니다.

독립 helper 시험의 최초 실행은 구현이 도착한 뒤 GREEN이었다. root가 전달한 Provider 최초 1 FAIL→수정 후 3 PASS 및 실제 UI/DB RED→GREEN은 root의 관찰로 구분하며, 이 하위 작업이 직접 그 초기 실패를 재실행했다고 주장하지 않는다.

## root가 전달한 UI/DB 보완 증거와 잔여 경계

root는 fresh `?write=reply` 제출에서 로컬 DB tool_id null을 실제 관찰했고, 수정 후 게스트 답글→개발 로그인 복귀에서 본문 유지·동의 미체크, 로컬 게시 후 같은 parentId와 tool_id=claude를 확인했다고 전달했다. 일반 작성 로그인 복귀와 Claude↔Figma 문맥 분리도 root 관찰이다. 개발 서버 중단의 영어 오류→한국어 안내/초안 유지, 재시작 후 단 한 건 등록 역시 root가 보고한 실제 로컬 QA다. 본 검토는 그 결과와 현재 수정 경로의 일치를 확인했으며 캡처/DB를 독립적으로 재조작하지 않았다.

이번 변경에서 새로 생긴 차단 결함은 없지만, 다음 기존 한계는 해결됐다고 확대하면 안 된다.

- **편집 중 인증 만료:** API 401을 받은 뒤 Provider user prop은 자동 갱신되지 않는다. 값은 남지만 다시 로그인하는 전용 recovery 동작은 이번 변경에 없다. 게스트에서 시작한 정상 인증 복귀와 별개다.
- **서버 반영 후 응답 유실:** 새 연결 안내는 결과 확인을 권하지만 서버 idempotency를 추가한 것은 아니다. fetch가 성공하고 JSON body만 손상/중단되면 기존 파싱 오류 문구는 여전히 “다시 시도”다. 따라서 모든 불확실한 재시도에서 중복을 방지한다고 주장할 수 없다. 이번 root의 서버 중단/단 한 건 시험은 커밋 후 응답 유실 시나리오가 아니다.
- **정리 실패와 수정 초안:** removeItem 실패 때 기존 임시 내용이 남아 나중에 다시 보일 수 있다. 자동 재게시하지는 않는다. 또한 기존 글 수정은 `!post` 조건으로 session draft를 저장하지 않는데 공통 임시 보관 문구는 여전히 나타난다. 수정분의 reload 복구까지 이번 새 글·답글 복구 성공으로 포함하지 않는다.

이 잔여 사항들은 앞선 소스에도 있던 경계이며 이번 네 파일의 수정 승인을 새 기능 요구로 확장하지 않는다. 4.3.3 증거를 정리할 때는 실제 관찰한 흐름과 개발 고정 identity를 명시하고, 실제 ChatGPT 계정 인증 또는 응답 유실 전 범위의 증거로 바꾸지 않아야 한다.

## 후속 사용일·수정 안내 보완 확인

2026-09-13 추가 읽기 검토. 현재 Community의 사용일 input은 기존 onChange를 유지하면서 `onInput={e=>field('usedAt',e.currentTarget.value)}`를 추가했다. native date 입력 직후 state를 갱신하므로 다른 제어 요소의 재렌더가 이전 날짜를 되돌려 쓰던 경로를 보완한다. 입력 state는 기존 초안 저장과 인증 복원 경로로 이어지며, 관련 필드·최대 날짜 검증·공개 동의 정책을 바꾸지 않는다. 두 이벤트가 모두 발생해도 같은 날짜 값을 기록하는 동작이다.

root가 전달한 실제 UI 경위는 `date.fill('2026-09-11')` 뒤 체크박스 조작 시 날짜가 13일로 복귀한 RED이며, `review-login-green.json`이라는 이전 파일명에도 불구하고 그 자료는 실패 흔적이다. 최종 성공 근거로 재분류하면 안 된다. root는 수정 후 같은 날짜 입력→체크박스 조작의 value/attribute 11일 유지와 게스트 로그인 복귀 후 11일 유지의 FINAL JSON/캡처를 확보했다고 전달했다. 이 하위 검토는 현재 소스를 확인했으며 해당 UI를 다시 조작하거나 캡처를 독립 판독하지 않았다.

수정 글의 small 문구는 현재 `post ? '수정 내용은 저장해야 반영됩니다.' : ...`로 나뉜다. 따라서 위 잔여 사항에 기록한 **수정 폼의 임시 보관 문구 과장 문제는 해결**됐다. 수정 글에 session draft 저장을 추가한 것은 아니며 그 기존 동작과 안내가 일치한다. 두 추가 변경을 포함해 코드 변경 범위의 승인 의견을 유지한다. 작은 이벤트/안내 보완에 helper 시험을 반복한 것은 아니며, 앞의 22개 실행 결과는 당시 실행 범위로 보존한다.

root가 독립 helper 시험을 `tests/community-draft-audit.test.mjs`로 옮길 때는 동작 18개를 유지하고 모듈 존재 여부 확인 1개를 제외할 예정이라고 전달했다. 이는 실제 기대를 줄이는 것이 아니라 초기 로더 확인을 제거하는 조정이다. 편입 파일 자체의 최종 실행은 이 추가 읽기 검토에서 확인하지 않았다.
