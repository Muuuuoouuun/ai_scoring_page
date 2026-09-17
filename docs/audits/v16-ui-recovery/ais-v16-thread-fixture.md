# V16 7.2.4 로컬 합성 부모/답글 fixture

준비일 2026-09-13 Asia/Seoul. Parent가 지정한 소스 `b8d35c0` 맥락에서 현재 로컬 posts 스키마와 community/admin 조회·변경 코드를 읽었다. Git 상태/commit 동일성은 별도로 조회하지 않았다. 실제 DB는 URI `mode=ro`로만 열어 스키마·관련 trigger·제안 UUID 충돌을 확인했으며 **행을 추가하거나 변경하지 않았다.** 브라우저/API/운영/배포도 조작하지 않았다.

스크립트: [ais-v16-thread-fixture.py](/private/tmp/ais-v16-thread-fixture.py). 변경 대상 DB 경로는 요청된 로컬 Miniflare SQLite 한 파일로 고정되어 있다. `status`만 읽기 전용이고 나머지 명령은 root가 backup 후 직접 실행할 로컬 fixture 작업이다.

| 구분 | UUID | 실제 저장 user_id |
|---|---|---|
| 부모 A | `b436a927-add7-4ea7-91a8-60f0100e8e36` | `ais-v16-fixture-parent` |
| 답글 B | `749611c4-a910-43d2-85f1-14acd84be9d2` | `ais-v16-fixture-reply` |

두 UUID는 이번에 새로 생성했으며 읽기 확인 시 충돌은 0건이었다. 적용 시 트랜잭션 안에서 다시 충돌을 검사한다. 부모/답글의 title·body·author에는 합성 로컬 QA임을 명시했다. 별개 user_id 두 개는 실제 두 로그인 세션이나 실제 사용자 연구를 뜻하지 않는다. 답글 표식은 `V16-REPLY-B-REMAINS-READABLE`이다.

## 스키마와 안전 경계

실제 posts는 16컬럼(`id` TEXT PK, `user_id`, `author`, `kind`, `tool_id`, `parent_id`, `title`, `body`, `task`, `plan`, `used_at`, `affiliation`, `ratings`, `status`, `created_at`, `updated_at`)이며 posts의 FK와 trigger는 없었다. replies는 별도 테이블이 아니라 `posts.parent_id`로 연결된다. reactions는 `post_id`, reports는 `target_id`로 연결되어 있다.

- `apply`는 두 UUID가 모두 비어 있을 때 plain INSERT만 한다. REPLACE/UPSERT/IGNORE는 없으며 한 행이라도 충돌하면 전체 rollback한다.
- 각 변경은 `BEGIN IMMEDIATE` 후 스키마와 **전체 16컬럼의 고정 seed 내용/허용 상태**를 검사한다. 기존 비QA 행이나 예상 밖으로 편집된 행을 덮어쓰지 않는다.
- 숨김·삭제·복원은 부모 A 한 행에만 적용한다. 답글 B의 전체 내용이 전후 동일하고 published인지 확인한 뒤 commit한다.
- cleanup은 알려진 두 UUID/작성자/내용만 검사해 답글→부모 순서로 제거한다. 다른 답글·reaction·report가 생겼다면 자동으로 삭제하지 않고 거절한다. 타 사용자 데이터를 일괄 정리하지 않는다.
- DB가 없거나 symlink이거나 스키마/trigger가 바뀌면 진행하지 않는다. 쓰기 연결도 `mode=rw`라 DB를 새로 만들지 않는다.
- 생성/숨김 timestamp는 고정된 QA 시각이다. 실제 사용자 작성·수정 시각이 아니다. root가 적용 전에 일관된 SQLite backup을 보존해야 하며, 실행 중인 WAL DB는 `.sqlite` 파일 단독 복사만으로 backup을 간주하지 않는다.

## Root 적용·관찰 순서

모든 명령은 같은 고정 로컬 DB에만 작동한다. 첫 명령 전 root가 일관된 backup을 완료한다. 명령은 현재 위치와 무관하게 실행할 수 있다.

```sh
python3 /private/tmp/ais-v16-thread-fixture.py status
python3 /private/tmp/ais-v16-thread-fixture.py apply
```

실제 사용 중인 localhost preview의 **`/community/b436a927-add7-4ea7-91a8-60f0100e8e36`**를 root가 연다. 포트는 추정하거나 새 서버를 시작하지 않는다. 초기 화면에서 부모 A와 답글 B의 합성 QA 표시·본문을 관찰하고 기록한다.

```sh
python3 /private/tmp/ais-v16-thread-fixture.py hide-parent
python3 /private/tmp/ais-v16-thread-fixture.py status
```

같은 thread 화면을 실제 새로고침한다. 부모 원문은 숨겨지고 삭제/비공개 안내가 보여야 하며, **답글 B 본문·작성자 표시는 계속 읽혀야 한다.** 답글 상단 heading/간격/맥락이 이해되는지도 함께 비평한다. DB에서 B가 남는 것만으로 실제 읽기 UI가 통과했다고 기록하지 않는다.

```sh
python3 /private/tmp/ais-v16-thread-fixture.py restore-parent
python3 /private/tmp/ais-v16-thread-fixture.py delete-parent
python3 /private/tmp/ais-v16-thread-fixture.py status
```

다시 같은 화면을 실제 새로고침하고 삭제 상태에서도 B의 읽기 여부를 확인한다. `delete-parent`는 실제 [community DELETE](/Users/bigmac_moon/dev/ai_score/site/app/api/community/route.ts:28)와 같이 A를 물리 제거하지 않고 `status='deleted', body='', title='삭제된 글', ratings=NULL`로 만든다. 삭제 후 title/body에 QA 문구가 없는 것은 이 tombstone 동작을 재현하기 때문이며, author에는 QA 표시가 남는다.

```sh
python3 /private/tmp/ais-v16-thread-fixture.py restore-parent
python3 /private/tmp/ais-v16-thread-fixture.py cleanup
python3 /private/tmp/ais-v16-thread-fixture.py status
```

`restore-parent`는 스크립트가 보유한 **합성 원문만** 복원한다. 제품에서 삭제된 실제 글을 복구할 수 있다는 증거가 아니다. cleanup은 숨김/삭제 상태에서도 가능하고, 완료 후 status의 `presentSeedIds`는 빈 배열이어야 한다. UUID 충돌로 apply가 거절된 경우 cleanup으로 기존 행을 지우려 하지 않는다. cleanup도 예상 밖 행이면 거절한다.

## API와 관찰의 구분

[admin API](/Users/bigmac_moon/dev/ai_score/site/app/api/admin/route.ts:7)의 숨김/복원은 `requireAdmin()`을 요구하고 deleted 글은 복원하지 않는다. 이번 스크립트는 이 API를 실행하지 않는다. [community GET](/Users/bigmac_moon/dev/ai_score/site/app/api/community/route.ts:10)은 published 부모 조회와 published 답글 조회를 별도로 처리하며, [Community UI](/Users/bigmac_moon/dev/ai_score/site/components/Community.tsx:17)는 부모가 없으면 안내를 렌더링하면서 답글 목록을 별도로 표시한다. 이것은 관찰 전에 읽은 예상 경로이며 실제 UI 성공으로 채점하지 않는다.

보고할 수 있는 결과는 root가 실제 화면을 확인한 뒤의 **“서로 다른 user_id로 구성한 합성 로컬 QA에서 부모 숨김/삭제 후 다른 작성자 답글의 읽기 화면 관찰”**이다. 관리자 숨김 권한, 실제 작성/삭제 API 성공, 두 실제 계정 격리, 운영 배포, 실사용자 과업까지 검증했다고 넓히지 않는다. 고정 7.2.4의 문구와 최종 게이트 판정은 root가 실제 관찰 증거에 연결한다.

이 준비 단계의 검증은 Python 구문·고정 ID/seed 구조·읽기 전용 status까지다. **쓰기 명령은 실제 로컬 DB나 메모리 DB에서 실행하지 않았다.** root의 적용/관찰/cleanup이 별도 수행되어야 한다.
