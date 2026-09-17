# V15 race · legacy · privacy 사전 기대 명세

2026-09-12. Parent가 제시한 immutable `notifications` 버전, 사용자별 stable `notification_cards`, 공개 사실의 전역 `notice_source_heads` 설계를 대상으로 한다. 기존 [RED](/private/tmp/ais-v15-notice-red.md)의 의미 기대를 유지한다. 이번 산출물은 구현 전 시험 명세이며 새 코드를 실행하거나 Site·실제 제공자를 변경/호출하지 않았다.

## fixture와 불변량

- 공개 source S의 명시 수동 revision은 R1=1, R2=2, R3=3, 의미 사실 hash는 H1/H2/H3로 둔다. 날짜·계정·provider clock은 독립적으로 고정한다. `checkedAt`만 바뀌면 같은 hash다. 가격/자격/종료/기능처럼 해당 고객의 판단에 영향을 주는 사실을 바꾸는 정상 수정 fixture는 **revision도 증가**시킨다.
- 기존 ‘같은 확인일 가격 정정’ RED는 checkedAt을 그대로 두고 R1/H1→R2/H2로 이동한다. 정정 카드와 허용된 채널의 새 정정 후보라는 기대는 그대로다. 별도로 **R1/H1과 R1/H2 충돌**은 새 소식으로 보내지 않고 review hold를 기대한다. 이것은 실패 결과에 맞춘 기대 완화가 아니라 parent가 정한 검수 revision 계약을 분리한 입력이다.
- 전역 head는 공개 source의 revision/hash·검수/충돌 상태만 나타낸다. 사용자 관심 이유·가격 상한·자격·읽음·채널·동의가 hash/head에 들어가서는 안 된다. 사용자 카드의 최신 버전 포인터와 스냅샷, 개인 읽음 상태는 별도로 유지한다.
- 과거 notification 버전과 시도한 email payload는 불변이다. 현재 카드만 최신 상태를 가리킨다. provider 요청을 시작하려면 **모든 항목**의 사용자·현재 카드 최신 ID·source head의 정확한 revision/hash·전송 가능 검수 상태·현재 조건·settings revision·claim이 일치해야 한다.
- 읽음 규칙은 새 UI 계약으로 명시한다: checkedAt-only/동일 사실 재수집은 기존 읽음을 유지하고, 새 중요 수정은 새 내용의 읽음 확인이 필요하다. 이전 버전에 대한 늦은 읽음 요청으로 최신 수정이 읽혔다고 처리하면 안 된다. 세부 필드명과 응답 문구는 구현 선택이다.

## race 기대표

| ID | 통제 순서 | 반드시 확인할 결과 |
|---|---|---|
| R1 동일 사실 동시 수집 | 같은 계정에 R1/H1을 두 실행자가 동시에 반영 | stable card 1개, 동일 의미 버전 중복 활성 큐 0, 해당 버전 provider 최대 1회. notification history의 unique identity가 중복 관계로 갈라지지 않음. |
| R2 checkedAt-only + manual revision-only | accepted/read 상태에서 checkedAt 변경, 별도로 R1/H1→R2/H1(사실 동일) | 새 이메일 0, 읽음 초기화 0. head의 revision 전진이 필요하면 허용하되 그것만 새 의미 버전으로 보내지 않음. 동일 hash를 조용히 채택하는 메타데이터와 실제 전달 사실을 분리. |
| R3 오래된 실행자가 새 head 뒤에 커밋 | 실행 A가 R1/H1을 읽고 write 직전 정지. B가 R2/H2와 최신 카드를 반영. A 재개 | head/card는 R2/H2 유지. R1 활성 큐·신규 batch·attempt/provider 0. 낡은 내용이 카드·조회 결과·읽음·소비 슬롯을 되돌리지 않음. 과거 감사 행을 남기더라도 최신/전송 가능으로 표시하지 않음. |
| R4 처음부터 구버전 배포가 재실행 | 공유 DB head=R2/H2, source 파일이 R1/H1인 별도 module graph가 처리 | 구버전 자료를 최신이라고 채택하거나 발송하지 않음. 새 카드 내용을 구버전 코드가 모르면 최신 확인 필요/보류로 다룰 수 있으나 낮은 revision으로 회귀하지 않음. |
| R5 같은 revision·다른 사실 | head R2/H2 후 다른 실행자가 R2/Hx를 제시 | conflict/review 상태가 명시되고 **둘 중 임의의 hash를 새 정답으로 승격하지 않음**. 해당 source의 새 plan/attempt 0. 이미 accepted된 이력은 변경하지 않음. R2/H2를 다시 읽거나 checkedAt을 갱신하는 것만으로 충돌이 자동 해소되지 않음. |
| R6 충돌 해소 | R5 이후 검수한 R3/H3 입력 | 더 높은 명시 revision으로 해소한 현재 사실만 card/dispatch에 사용. 예전 R2 입력의 늦은 후속 처리가 다시 덮지 않음. 별도 수동 해제 절차를 도입하지 않는 현재 설계에서는 같은 revision 재수집을 해소 근거로 삼지 않음. |
| R7 plan→attempt 사이 한 항목 변경 | S/T 두 항목의 prepared batch를 만든 뒤 S head/card만 R2로 변경하고 attempt | 옛 S 포함 payload의 provider 요청 0. 미시도 묶음은 취소/재계획 가능하되 옛 body/key를 변형하지 않음. 유효 T를 새로 묶을 때 중복·잘못된 빈 digest 소비가 없어야 함. 이미 시도했던 묶음이면 자동 축소/새 key 재발송 대신 불확실 보류. |
| R8 currentNotices 검사 뒤, DB 선점 전 변경 | 모든 항목이 맞는 것을 읽은 직후 정지→head/card 또는 settings 변경→attempt CAS 재개 | 실제 쓰기 시점의 guard가 막아 attempts 증가·outbox sending·digest 소비·provider 진입이 없음. SELECT 시점 검사만으로 통과하지 않음. D1 batch에서 첫 문장 0 rows가 자동 rollback이 아니므로 종속 write도 guard 확인. |
| R9 head/card 누락과 잘못된 pointer | 다중 항목에서 한 source head를 없애거나, 카드 포인터를 다른 버전/다른 사용자 ID로 바꿈 | plan/attempt 실패·보류, provider 0. INNER JOIN으로 누락 행이 사라진 뒤 `NOT EXISTS(bad)`가 공허하게 참이 되면 안 됨. 모든 item이 정확히 한 owned 최신 카드와 유효 head에 연결됐다는 존재/개수 조건도 확인. |
| R10 이미 in-flight인 구버전의 늦은 접수 | R1 요청이 provider mock 안에서 대기→R2/H2 반영→옛 R1 응답 200+id | R1의 실제 접수 ID·당시 불변 payload를 역사적 사실로 보존. 현재 card/head는 R2/H2 유지. R1 새 발송·retry를 다시 만들지 않음. ‘최신 head guard’는 새 plan/attempt를 제한하며 이미 외부로 나간 응답을 없던 일로 만드는 조건이 아님. |
| R11 in-flight 실패와 새 source | R10 순서에서 응답이 실패/불확실 | 옛 payload를 최신 내용으로 바꿔 retry하지 않음. 오래된 의미 버전의 재시도 중단/검토 사유와 원 기록 유지. 이후 진짜 새 중요 revision은 별도 정정 후보로 평가하며, 이전 실패를 sent로 꾸미지 않음. |
| R12 늦은 읽음·숨김 경합 | 읽기 요청이 N1을 대상으로 정지→N2 중요 수정 반영→옛 요청 재개. 별도로 숨김→stale generator 재개 | N1에 대한 읽음이 N2를 읽음 처리하지 않음. 숨긴 source는 revision이 증가해도 사용자 허용 없이 새 큐가 살아나지 않음. 서버 settings revision과 사용자 소유권 보호를 유지. |
| R13 head/card/queue 트랜잭션 실패 | 반영 batch의 중간에 로컬 SQLite abort trigger | 새 head만 있고 최신 card/queue가 반쯤 연결된 상태를 정상 완료로 반환하지 않음. 설계상 분리 transaction을 쓴다면 그 중간 상태도 dispatch 불가이며 다음 처리로 복구 가능해야 함. 이미 받은 접수 이력을 rollback/삭제하지 않음. |

R2의 핵심은 revision 숫자 증가가 곧 고객에게 중요한 사실 변경이라는 뜻은 아니라는 점이다. revision/hash 메타데이터의 구체 저장 방식은 자유지만, checkedAt 또는 검수 번호만 바뀐 내용이 또 이메일로 나가면 최초 RED를 다른 형태로 되살린다.

## legacy 채택 기대표

| ID | 입력 | 반드시 확인할 결과 |
|---|---|---|
| L1 date-key sent + 첫 hash 채택 | 과거 sent row와 sent_at은 있으나 의미 hash/신뢰할 payload 매핑 없음. 현재 R1/H1을 처음 채택 | 현재 hash 채택 자체의 provider 0. 옛 sent 사실은 그대로, 새 H1에 가짜 provider ID/accepted_at/attempt를 생성하지 않음. 신규 hash 중복 방지를 위한 **adoption hold의 별도 사유**를 기록하고 실제 발송 완료와 구분. |
| L2 date-key attempted/failed/uncertain | attempts>0인데 불변 payload/명확한 source-version 연결 없음 | 자동 재전송 0, 새로운 key로 갈아 끼우기 0. 원 attempts/error/알고 있는 receipt를 유지하고 별도 legacy ambiguity/adoption 사유로 hold. created_at을 첫 실제 시도/발송 시각으로 꾸미지 않음. |
| L3 date-key never-attempted | queued, attempts=0, 아직 외부 요청 없음 | 실제 현재 유효성·조건·동의·시간과 새 source/card 연결을 다시 평가. 유효하면 현재 버전의 첫 발송 1회 가능; 자동으로 sent 취급하거나 sent/attempted와 같은 무기한 hold로 뭉개지 않음. 만료·철회·미확인 조건이면 외부 발송 0. |
| L4 여러 과거 날짜 키 | 같은 source/계정의 legacy sent·failed·queued가 여러 날짜에 존재 | stable card는 source당 1개, 기존 이력은 보존. 첫 hash 채택으로 날짜 수만큼 큐·이메일을 만들지 않음. ambiguous attempted 버전을 일반 unattempted 신규 후보처럼 재사용하지 않음. |
| L5 채택 후 genuine correction | L1/L2 채택 뒤 같은 확인일에도 검수된 R2/H2로 가격/자격/종료 등 중요 사실 변경 | 현재 조건/동의가 허용하는 정정 후보를 **최대 한 번** 생성·평가. H1 adoption hold를 영구 source 숨김처럼 적용해 향후 모든 정정을 막지 않음. 옛 H1 hold와 실제 H2 접수 기록은 별개이며, H1을 sent로 고치지 않음. |
| L6 채택 후 날짜/번호만 변경 | L1/L2 뒤 checkedAt 변경 또는 R2/H1(동일 사실) | 새 이메일 0, 가짜 접수 0. 채택 사유는 실제 발송 이력으로 변환되지 않음. |
| L7 재실행·동시 migration/adoption | migration/adoption을 두 번 실행하거나 두 worker가 같은 legacy topic 채택 | 개수·연결·hold 사유가 안정적이고 중복 candidate/receipt가 없음. 한 계정의 migration이 다른 계정의 delivered/read/hidden 상태를 복사하지 않음. |

초기 card의 읽음 기본값, 여러 legacy row의 표시 정렬 등 원문이 고정하지 않은 UI 선택은 명시해야 한다. 다만 옛 읽음/접수 시각을 조작하거나 ‘hash 채택=이미 이 hash를 보냈음’으로 오인시키는 것은 허용되지 않는다. 합성 adoption hold는 현재 sent 통계/실제 provider 접수 집계에 포함되지 않아야 한다.

## privacy · 소유권 기대표

| ID | 입력·행동 | 반드시 확인할 결과 |
|---|---|---|
| P1 공개 head의 사용자 비의존성 | A는 직접 관심, B는 대안 관심·다른 예산/자격으로 같은 공개 source를 평가 | 동일 R/H head가 사용자 이유 때문에 conflict가 되지 않음. global head에 계정 ID·이메일·관심/예산/필수 기능·read/동의·개인 href를 넣지 않음. 개인화된 매칭 결과는 사용자 카드/판단에만 귀속. |
| P2 카드·버전 포인터 소유권 | A/B가 같은 source 구독. A로 B의 card/latest notification ID에 read/hide/update 요청 | 거절하고 B의 read/pointer/snapshot/outbox가 변하지 않음. B의 source-version ID를 알아도 A의 email batch에 연결할 수 없음. 공유 head는 개인 소유권의 대체 검사가 아님. |
| P3 서로 다른 사용자 읽음/숨김 | A가 읽음/숨김/복원, B는 그대로 | A의 최신 카드/채널 상태만 변경. head revision/hash·B card/read/hidden/queue 유지. A의 숨김은 사용자 개인 요구라 공개 source status를 withdrawn으로 바꾸지 않음. |
| P4 신뢰되지 않은 source metadata 입력 | 일반 settings/notice API body에 임의 sourceRevision/hash/status/head ID를 덧붙임 | 일반 요청이 운영 검수 head를 올리거나 conflict 해제하거나 전송 가능 상태를 만들 수 없음. source 사실은 신뢰된 수집/검수 입력에서만 채택. |
| P5 GET·export의 범위 | A/B에 다른 이유·조건·과거 버전·receipt를 심고 A로 조회/내보내기 | A의 stable card/current snapshot 및 요청한 과거 기록만 노출. B의 매칭 이유/조건/이메일/receipt가 없음. claim/attempt token, provider 비밀키는 export하지 않음. 글로벌 공개 head는 공개 데이터로 다룰 수 있어도 그 조회가 다른 사용자의 참여·전달 상태를 암시하면 안 됨. |
| P6 계정 삭제와 in-flight 후속 | A 삭제 후 옛 generator/finalizer 재개, B는 같은 source 사용 중 | A notification versions/cards/outbox/deliveries/dispatch 및 관련 개인 매칭 상태 제거, 늦은 작업이 이를 재생성하지 않음. 공개 source head와 B 기록은 유지. 글로벌 head를 A의 개인 테이블처럼 cascade 삭제하지 않음. |

## 실행과 판독 방법

고정 시각은 기존 V14 harness의 `options.now`로 주입하고 실제 sleep/네트워크는 사용하지 않는다. race는 읽기 또는 조건부 쓰기 바로 앞의 barrier로 순서를 고정한다. 구버전/신버전 worker를 비교할 때는 source fixture를 각각 복제한 module graph가 **같은 메모리 D1**을 바라보게 하거나, 이미 계산된 R1/H1 후보가 정지 상태임을 확인한다. 한 mutable JSON 객체를 바꾼 뒤 옛 실행자가 실제로도 새 값을 읽어 버리면 구버전 race를 재현한 것이 아니다.

각 시험은 네 종류를 함께 확인한다: ① head/card의 revision/hash/pointer/read, ② notification 역사 snapshot 불변, ③ queue/batch/attempt/slot의 쓰기 결과, ④ source별 provider mock 진입 횟수와 exact body/key. provider 0만으로는 timing hold나 빈 fixture의 거짓 양성을 구분할 수 없으므로, race 전 유효 candidate·명시 수신 설정·열린 시각을 입증한다. 여러 항목 batch에서는 한 항목만의 검사 성공으로 전체 성공을 판단하지 않는다.

필수 경계는 원문92/94/96의 ‘중요 버전 한 번·발송 직전 재확인·정정 반영’과 parent의 head/card 설계에서 도출했다. R2 동일 hash 번호 증가, R5 충돌 해소 절차, 초기 읽음 표현 등 새 내부 정책은 명시한 가정이며 원문이 정한 데이터 구조라고 주장하지 않는다. 이 명세를 통과해도 실제 제공자 수신·무방문 운영 증거가 생기지는 않는다.
