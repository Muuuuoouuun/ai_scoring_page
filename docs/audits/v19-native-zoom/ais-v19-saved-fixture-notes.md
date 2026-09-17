# V19 S05 저장 콘텐츠 폼 준비

2026-09-14. V17 확장 UI 기록에는 일반 saved 기록이 없다고 명시돼 있고, 재사용할 saved fixture는 찾지 못했다. 현재 로컬 private_records 7개는 V17 백업의 모든 행·열과 동일하며 saved는 0개다. 이 작업은 SQLite/소스/UI를 변경하지 않았다.

정상 진입은 `/guides/notion-task-board`의 저장 → `/my?tab=saved` → **기록 수정** → **콘텐츠 기록 수정**이다. 다만 이 정상 저장은 실제 가이드 제목을 쓰며, 200자 QA 제목을 입력하는 UI는 없다. 따라서 요청한 긴 합성 제목 관찰에는 `/private/tmp/ais-v19-saved-fixture.py`를 준비했다. **실행/import하지 않았고 AST 구문 분석만 했다.** 런타임 성공을 주장하지 않는다.

합성 행 ID는 `af6abe79-2a4c-4f1e-9c31-1c847ca01684`, user_id=`local_seedy`, kind=`saved`, DB target=`guide:notion-task-board`, payload target=`notion-task-board`다. 제목은 `V19-LOCAL-QA-저장 콘텐츠 시각 검증용-`로 시작하는 정확히200자이며 reason/outcome/note는 짧은 합성 QA 안내다. 날짜는 실제 저장 시각을 주장하지 않는 고정 fixture 값이다. 저장 폼 몸체는 **선택 이유 / 사용 결과 / 메모 / 저장하기**이며 제목 편집은 없다.

현재 DB 제약은 id 기본키, user_id/kind/target unique, 필수 text 열과 nullable target이다. private_records trigger/FK는 없고 script가 실행 직전 재검사한다. Site savedSchema의 title200, reason1000, outcome/note2000 길이와 type/target 형태에 맞췄다. reason UI input 자체는 현재 maxLength500이나 짧은 QA 값은 그 범위에도 맞는다.

root 사용 모드는 `preview`, `apply`, `restore`다. 전후 정확한 행 snapshot과 전체/원7행 해시가 stdout JSON으로 나온다. 스크립트는 기존 백업 파일 SHA256과 원7행 모든 열의 SHA256을 고정 검증하고, BEGIN IMMEDIATE 안에서 전체7/8행 분류→INSERT 또는 DELETE1건→전후 일치→commit한다. UI나 다른 작업으로 원7행이 달라졌거나 다른 추가 행이 있으면 중단한다. `UPDATE`, 전체 DB 복원, 충돌 덮어쓰기는 없다.

root의 후속 요청에 따라 **합성 saved 행의 updated_at만** 정상 ISO 시각으로 바뀐 것은 허용한다. 실제 폼 값 변경 없이 ‘저장하기’를 눌러 toast를 본 뒤 cleanup할 수 있다. 현재 RecordForm/저장 API는 이 payload에 새 default를 추가하지 않는다. 따라서 payload 원문과 나머지6열은 여전히 정확히 같아야 한다. payload 변화는 허용하지 않는다. 삭제는 트랜잭션 안에서 확인한 그 합성 행의 id/owner/kind/target/payload/created_at/updated_at 전부를 WHERE로 묶으며 정확히1행이어야 한다. 원래7개는 모든 열 해시가 전후 같아야 한다. 원본 상태의 restore와 이미 추가된 상태의 apply는 안전한 no-op이다.

권장 관찰 순서는 root가 script 검토→preview/apply→로컬 저장 탭 재조회→기록 수정→값을 바꾸지 않은 상태로 전체 몸체·저장 성공 안내 확인→restore→원7개 복원 영수증과 목록 재조회다. UI 삭제 확정은 필요 없다. 이 기록은 실제 사용자 선택/성과/저장 성공의 운영 증거로 사용하지 않는다.
