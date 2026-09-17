# V15 알림 버전·혜택 조건 검증

이번 개선을 소유자 전용 사이트에 배포했다. 전체 9영역 88점 목표는 아직 달성하지 않았다. 고정 점수는 PASS138/GAP4/UNVERIFIED10, 88점 이상5/9로 유지한다.

## 배포 영수증

- URL: https://ais-discovery-hub.aaahaaah19.chatgpt.site
- 소스: `b8d35c036f0541446fafa746652406a81b19f0a6` · Site checkout clean, 원격 main push 성공 후 full HEAD 확인.
- Sites 버전17: `appgprj_6aa42f3ab3ec81919d0048d508baa661~appgver_d7b74159f1088191a33c92a7ca9a9fc3`.
- 배포: `appgdep_6aa56adee62c8191a51ba4fc41eec25c`, terminal succeeded `2026-09-12T15:08:51.958405+00:00` (한국9/13), 환경revision2.
- 접근 재확인: owner/custom/허용계정1/외부0/워크스페이스·테넌트그룹0. 범위 변경 없음.
- 로컬 압축 아카이브 SHA256 `b247e5e4956d1a44da72a117a17d84e65b7aed623a0d719ef2576f035e0a87b2`, 850448B. dist 루트,476 tar entries(AppleDouble 포함),218 실제파일/2854196B. Worker/manifest/신규0004 migration 포함, env 파일 없음.
- 서버 정규화 tar:218파일/3031040B, SHA256 `4355d90751e492aeb10e1390f32fe4e6eab46fa338443c297a052e6cbaf73e50`.

## 동작과 실제 수정

기존 notifications/outbox/delivery는 버전별·시도별 불변 기록으로 보존하고, notification_cards가 같은 행사 원 카드의 최신 버전을 가리킨다. 확인일과 단순 문구 수정은 중요 버전을 만들지 않는다. 가격·자격·기간·마감·공식 상태·행사 기능은 검수 revision과 사실 hash로 판단한다. A→B→A는 중간 B를 안내한 사용자에게 새 정정이고, revision 숫자만 증가한 같은 내용은 다시 보내지 않는다. 서로 다른 공식 발표는 명시 announcement ID로 구분한다.

출처 충돌과 이전 자료 실행은 새 발송뿐 아니라 최신 큐 취소·빈 요약 슬롯 소비도 막는다. 계획/각 시도는 모든 항목의 실제 소유 최신 카드·출처·설정·기한을 SQL에서 재확인한다. 이미 나간 요청의 늦은 접수 영수증은 보존한다. legacy 첫 사실 기준선은 별도 보류이며 sent로 위장하지 않는다. 이전 버전 읽음 요청은 새 정정을 읽음 처리하지 못한다. 개인 결제 id/날짜는 공개 source head에 저장하지 않는다.

혜택 설정은 월 상한(갱신 후 포함), 통화, 최소 개월, 필수 기능을 보존하고 조건 미확인을 충족으로 간주하지 않는다. 현재 자격 fingerprint에 묶인 명시 확인만 사용한다. 정상 혜택 권유와 기존 안내의 정정을 구분하며, 현재 관심·숨김·수신 설정과 한도를 지킨다. 관심 해제 후에도 이미 보유한 철회/정정은 읽을 수 있다. 마감 전 작성된 정정 payload도 원래 기한 뒤에는 재시도하지 않는다.

마감의 정확한 시각이 있으면 그 instant를 쓴다. 날짜만 있으면 UTC+14에서 해당 날짜가 시작하는 순간부터 이메일 보류, UTC−12에서 그 날짜가 지난 뒤 날짜 경과 표시를 한다. 이는 내부 보수 정책이며 공식 마감 시각이 아니다. 공개 미국 학생 페이지·약관·도움말을 재확인해 미국 전용 URL,12개월무료,표시 갱신가$19.99/월을 반영했다. USD는 미국 문맥 해석이고 세금·미래 갱신금액·정확한 마감·일반 소개 기능의 해당 무료 혜택 포함 여부는 미확인으로 둔다.

## 검증

- 실제 API/SQLite/고정시간/provider mock 회귀 **233 PASS**, 이전184+신규49. 신규에는 root25, 독립 audit8, race행위15+소스안정성1이 포함된다. 반복 실행의48/8 등을 더하지 않는다.
- 실제 Home RSC 의존성/스트림 검사 별도4 PASS. TypeScript, 최종 Sites build, diffcheck exit0.
- 추가 기본설정 결제 독립4 PASS: 설정off 경합, 실제 구독payload 수정 경합, 다른 소유자/중복/이메일0, 카드쓰기 실패 rollback. 기존 관련2는233과 겹친다.
- 원래8개 행위 RED와 정책 관찰, 최초16개 missing-module RED, 관련성·기본결제 RED, 독립5결함과 최신큐 취소 경합3개를 원문으로 보존했다. 발견된 결함은 같은 기대를 지킨 재실행에서 해결 확인.
- 로컬1280/문서1265에서 폼 입력·저장·전체 재조회: 상한30/USD/최소12개월/오프라인 필수 기능 유지, email=false. 390/문서375에서 입력·fieldset의 가로 넘침 없음. 기존 로컬 설정1개는 QA 직전 정확한 payload/updatedAt으로 복원했다. 로컬 migration은 백업 후 적용했다.
- 운영1280/문서1265 혜택 페이지: 무료·USD19.99·마감시각미확인 표시 확인. 설정 화면 새 필드 및 미연결 이메일 상태 확인. 앱의 알림 화면 실제 새로 확인 경로 정상, 대기0/빈 상태. 운영 설정 변경이나 가짜 의견/발송 기록을 만들지 않았다.
- 운영 UI 콘솔error0. 조회 시점 최근10분 Worker errors_only events[]. 브라우저는 직접 API JSON URL 열기를 ERR_BLOCKED_BY_CLIENT로 거절했으므로 일반 앱 UI 경로에서 확인했다. 실패를 API 성공으로 기록하지 않았다.

## 남은 범위와 점수

실제 사업자/발신자 연결·받은편지함 도착·무방문 예약 실행은 확인되지 않았다. 대표 사용자 과업/후기 성과, 외부 비회원·독립 실제 계정/기기, 전체 확대·스크린리더 등도 새 증거가 없다. Mac은 잠겨 있어 OS 수준 검증을 추가 수행하지 못했다. source race의 구 worker는 같은 V15 코드에서 이전 source fixture를 가진 독립 module graph이며 V14와 V15 바이너리 혼합 운영을 실제 시험한 것은 아니다.

고정152개 기준의 문구·순서·가중치·상태는 유지했다. [V15 점수표](2026-09-13-score-worksheet-v15.md)와 [독립 검산](v15-notice-versions/ais-v15-score-review.md)을 함께 읽는다. 모든26개 사전race/legacy/privacy 사례 또는 실제수신을 전부 통과했다고 확대하지 않는다.

원시 근거: [증거 목록](v15-notice-versions/manifest.json), [독립 코드 검토](v15-notice-versions/ais-v15-code-review.md), [경합 검증](v15-notice-versions/ais-v15-race-run.md), [기본 결제 추가 검토](v15-notice-versions/ais-v15-default-billing-review.md), [공식 출처 재확인](v15-notice-versions/ais-v15-promotion-source-review.md).
