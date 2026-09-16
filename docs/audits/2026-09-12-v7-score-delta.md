# V7 고정 게이트 점수 변화 검토

2026-09-12. 읽기 전용 문서 대조 결과다. 사이트·소스·Git·배포·브라우저를 조작하지 않았고 실제 성능/접근성 테스트를 독립 재실행하지 않았다. 아래 PASS는 부모가 기록한 관측 증거에 대한 **기존 게이트 충족 판정**이다. 실제 사용자 조사 점수나 성능 인증이 아니다.

**추가 후속 증거까지 반영하면 새로 PASS 가능한 게이트는 2.2.4와 5.3.1–5.3.4의 5개다.** 내용·최신성은 96.25→100.00, 쾌적성·접근성은 62.50→87.50이다. 나머지 영역 점수는 변하지 않는다. 초기 로드 예산 실패, 불완전 리소스 크기, 미통제 캐시, 이전 수동 작업 측정의 한계 및 전체 화면/줌/실제 스크린리더 미완료는 계속 남긴다. 87.50을 88로 반올림해 통과시키지 않는다.

## 고정 기준과 증거

- 기준: `/private/tmp/ais-score-worksheet-v6.json` 및 `docs/audits/2026-09-12-score-worksheet-v6.md`. V6 소스 `c7124c3fa9f64caa817a10e879b15b72b00a7739`.
- **9영역/38세부항목/152게이트의 ID, 문구, 배점, 이진 채점 방식을 그대로 유지한다.** 목표 88점은 배점이나 해석을 바꾸는 근거가 아니다.
- E7: `/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v7-browser-evidence.md`.
- M7: `/Users/bigmac_moon/dev/ai_score/docs/audits/2026-09-12-v7-performance-method.md`.
- E7:8–13의 실제 배포: 소스 `123de1697a5a6c40a8d7666fd08df80ffbb6c9dc`, 성공 `2026-09-12T08:45:51.734799Z`, 환경 revision2. 소유자 전용 범위 유지.
- 판정 범위: E7:74의 Strict timed exploration follow-up까지 반영했다. 이후 추가되는 관측은 별도 재판정 대상이다.
- E7의 로컬 개발 서버 관측은 키보드/리플로우 기능 증거로만 사용하며 실제 배포 속도 점수로 사용하지 않는다.

## 새로 획득 가능한 게이트

### 2.2.4 · UNVERIFIED → PASS · +3.75

기존 문구: **“All current deployed logo assets have individually verified provenance/render outcomes.”**

V6에 이미 개별 로고 출처/수령 파일 감사가 있었지만 실제 배포의 20개 decode는 확인되지 않아 0점이었다. E7:58은 데스크톱 `/explore` 관측에서 현재 20개 ID를 각각 열거하고 모든 이미지의 `complete && naturalWidth>0` 결과를 기록한다. 이로써 기존 출처 근거와 이번 개별 배포 decode가 결합되어 문구의 두 부분을 충족한다.

한계: decode 자체는 픽셀별 디자인·크기·배치 적합성을 보증하지 않는다. E7:72의 추가 전체 페이지 스크린샷은 데스크톱의 20개 로고/라벨 대응, 7개 행의 간격과 잘리지 않은 액션을 보강한다. 좁은 초기 화면에서는 lazy loading으로 11/20만 로드됐고 이를 전체 모바일 확인으로 바꾸지 않는다. 전체 화면 디자인 비교는 여전히 별도다. 2.2.1–2.2.3은 이미 PASS이므로 중복 가산하지 않는다.

### 5.3.1 · UNVERIFIED → PASS · +6.25

기존 문구: **“Representative load/render timing is measured with method and environment.”**

E7:26, :32–50, :68, :72는 실제 배포의 홈/탐색/개인 페이지에 대해 앱 문서 범위, IAB Chromium, 실제 viewport/client width, 전경 상태, 미통제 캐시·비스로틀 조건, 관측 시각과 약 10초의 실제 cutoff, TTFB/FCP/LCP 및 관련 탐색 시간을 기록한다. 빈 Performance API 결과나 계측 코드의 존재만 있는 V6와 달리 대표 경로의 실제 수치가 있다. 늦은 observer 시작도 첫 두 표본에서 공개했다.

이 게이트의 동사는 **measured**이며 “모든 로드가 예산을 통과했다”가 아니다. 사전에 정한 M7:99의 TTFB≤800ms, FCP≤1800ms, LCP≤2500ms는 그대로 두고 **로드 8개 중 7개 예산 실패**를 기록한다. 빠른 데스크톱 홈 1개만 세 기준을 모두 충족했다. 측정 크레딧은 느린 초기 로드의 해결 판정이 아니다.

한계: 호스팅 래퍼 전체/물리 모바일/콜드 캐시/필드 p75의 증거가 아니다. 서로 다른 탭·페이지의 결과를 섞어 중앙값이나 p75를 만들지 않는다. 관측 실패 원인을 서버/네트워크/캐시 중 하나로 단정하지 않는다.

### 5.3.3 · UNVERIFIED → PASS · +6.25

기존 문구: **“Layout stability is measured during initial/async rendering.”**

E7:36–50에는 실제 초기 문서 CLS와 raw shift 관측이 있으며, E7:52–54에는 개인 페이지의 비동기 로드/모달과 비교·검색 작업 후 raw layout 값이 초기값과 같았다는 후속 관측이 있다. 초기 0만 읽거나 정적 스크린샷/CSS만 검토한 상태를 넘어 실제 초기 및 후속 상태의 이동 측정이 공급됐다. 이 초기 표본의 CLS는 0–0.0012545이며 raw session 값은 초기 CLS와 일치한다고 명시돼 있다. 아래 추가 좁은 개인 화면까지 포함한 관측 최대 CLS는0.0347160이다.

**PASS 범위는 문서의 초기/비동기 레이아웃 안정성을 측정했다는 데 한정한다.** E7:68의 추가 좁은 개인 화면 CLS/raw는0.0347160이며, E7:74의 추가 탐색 과제는2476ms 창에서 초기/후속 CLS/raw0.0001419 유지까지 기록했다. 이전 수동 후속 관측은15초 캡을 지키지 못했고 이 사실을 지우지 않는다. 새 한 과제의 적합한 측정창을 모든 작업의 예산 통과나 lifetime CLS로 확대하지 않는다. 입력 직후 이동 제외, 문서 범위, 관측 종료 이후 변화도 별도 한계다. 전체 화면 시각 검토·줌·스크린리더 증거를 이 게이트로 대체하지 않는다.

### 5.3.4 · UNVERIFIED → PASS · +6.25

기존 문구: **“Resource/long-task costs are measured under a stated budget.”**

M7:95–108에 창/단위/리소스·스크립트·요청·긴 작업 예산이 미리 정의돼 있다. E7:34–50은 실제 약 10초 창의 navigation bytes, resource count/transfer/unknown-size count, 알려진 script encoded bytes와 긴 작업 관측을 기록하고 E7:62가 고정 예산과 불완전성을 비교한다. E7:68 및 :72에도 느린 추가 로드와27/24개 미확인 리소스 크기를 보존한다. 따라서 명시한 예산에 대한 실제 비용 **관측**은 생겼다. 소스 번들 크기만 보거나 미확인 0을 무료라고 처리한 증거가 아니다.

예를 들어 데스크톱 홈은 알려진 navigation transfer 14,252B + resource transfer 7,800B, script encoded body 145,753B, resource count32, unknown-size count0, 관측된 long task0이다. 전송량과 encoded body는 다른 양이며 서로 합치지 않는다. 다른 표본의 unknown-size count16/23도 그대로 남긴다.

**전체 byte-cost 예산 인증은 여전히 불가하다.** 알려진 전송량/요청 수와 관측된 긴 작업이 한도 아래였어도, 캐시가 통제되지 않았고 다수 표본의 리소스 크기가 미확인이다. 반복 표본의 script bytes0은 무료/최적화 성공을 뜻하지 않는다. 문서 INP나 전체 CPU/TBT도 이 관측으로 대체하지 않는다. 추가 탐색 과제에서는2476ms의 정해진 창에 문서 긴 작업 count/max/excess0을 확인했다(E7:74). 이전 작업창 위반은 유지하며, 모든 주요 과제의 창별 리소스/긴 작업 예산 검증을 완료했다고 확대하지 않는다.

## 추가 후속 관측으로 획득 가능한 반응성 게이트

### 5.3.2 · UNVERIFIED → PASS · +6.25

기존 문구: **“Interaction responsiveness is measured on a principal task.”**

최초 E7:54만으로는 문서 세션 후보와 수동 지연 캡처만 있어 판정을 보류했다. 추가 E7:72–74는 같은 배포 코드/1440×900 탐색 화면에서 주요 과제의 실행, 결과, 측정 구간을 구체적으로 기록한다. 한 연속 CUA 호출에서 진단을 닫은 후 단조 증가 벽시계로 시작 시각을 잡고, `문서` 순차 입력→`writing` 분류→`1개 결과` 확인까지 **93ms**를 관측했다. 이후 Event Timing 전달을 위해2100ms 대기하고 전체 **2476ms**에 캡처하여 사전15초 캡을 지켰다. 초기 스냅샷에는 INP가 없었으며, 후속 문서 INP 후보는56ms였다.

93ms는 **자동화 통신을 포함한 작업 수행·결과 확인 벽시계 시간**이다. 개별 브라우저 이벤트 처리 시간, 물리 화면의 정확한 페인트 시간 또는 INP라고 하지 않는다. 56ms도 해당 문서의 진단 버튼을 포함한 상호작용 INP 후보이며 특정 검색/필터 액션 고유 지연이라고 하지 않는다. 두 수치의 범위가 명시돼 있고 실제 주요 과제와 성공 결과 및 유효한 관측창이 함께 있으므로 원래 문구가 요구하는 대표 과제 반응성 측정 증거는 충족한다.

**개별 액션에 귀속된 INP 수치를 별도 필수조건으로 추가하지 않는다.** 문서 INP가 세션 지표라는 정상적 성격만으로 배제하지 않으며, 반대로 값56ms 하나만으로 특정 액션 속도를 주장하지도 않는다. M7의 귀속 주의는 이 범위 표시를 위한 것으로 해석한다. 최초 문서의15초 캡 미준수 관측은 부적합한 기존 표본으로 보존한다. 이번에 해결된 것은 추가 탐색 과제 한 건의 측정창과 대표 측정 근거다. 모든 과제/기기, 필드 p75, 비동기 네트워크 완료 성능이 검증됐다는 뜻은 아니다.

## 접근성·시각 및 다른 게이트의 무가산 해석

| 고정 ID | 기존 기준 문구 | V7 해석 / 점수 변화 |
|---|---|---|
| 3.1.4 | The complete rendered V4 theme has a documented visual critique. | 일부 새 스크린샷/동작 검증은 complete theme critique가 아님. 원래 문구를 그대로 유지하며 UNVERIFIED, +0 |
| 3.2.4 | Current desktop/mobile information hierarchy is visually checked across every principal screen. | 일부 비교·커뮤니티·홈·탐색·개인 화면 관측은 every principal screen이 아님. UNVERIFIED, +0 |
| 3.4.4 | New guide/search/admin/expanded-billing screens have a complete cross-screen visual comparison. | 전체 지정 화면 간 시각 비교 증거 없음. UNVERIFIED, +0 |
| 5.1.4 | Zoom/reflow and the complete screen matrix are measured. | 실제 client305/375/395/1425/1440 관측과 좁은 비교 테이블 스크롤은 유용하지만 실제 줌과 complete matrix가 없음. UNVERIFIED, +0 |
| 5.2.4 | Screen-reader reading order, descriptions and status announcements have an observed run. | DOM row header·포커스·키보드 결과는 실제 화면 읽기 실행이 아님. UNVERIFIED, +0 |
| 1.3.4 | An external anonymous visitor completes a deployed public-information task. | 배포는 소유자 전용, 외부 관측 없음. 앱 비로그인 HTTP 확인으로 대체하지 않음. UNVERIFIED, +0 |
| 4.3.3 | Guest draft→authentication→restore and network interruption are observed end-to-end in the current UI. | 모바일 메뉴/모달 복귀는 이 전체 복구 과제가 아님. UNVERIFIED, +0 |
| 6.1.4 | A representative person/task demonstrates choosing between candidates from the comparison evidence. | 두 도구 선택/비교 화면 열기만 확인됐고 근거를 사용한 선택 과제는 없음. UNVERIFIED, +0 |
| 6.2.4 | A varied set of realistic purpose/condition queries has evaluated relevance. | 문서+writing 단일 필터 결과는 varied relevance 검증이 아님. UNVERIFIED, +0 |
| 6.3.4 | A complete representative guide is reproduced and its result checked. | 가이드 재현·결과 검증 없음. UNVERIFIED, +0 |
| 7.2.4 | A deleted/hidden parent with other authors' replies has an observed readable UI task. | 일반 테스트 글의 답글/수정 포커스는 삭제/숨김 부모의 타인 답글 읽기 과제가 아님. UNVERIFIED, +0 |
| 8.1.4 | Cross-device/account isolation is observed with independent real production sessions. | 동일 소유자 계정의 두 탭은 독립 실제 계정/기기 격리 증거가 아님. UNVERIFIED, +0 |
| 8.5.4 | Complete deployed export/download verification and full-account destructive flow are observed. | 임시 레코드 정리는 전체 계정 내보내기/삭제 검증이 아님. UNVERIFIED, +0 |

V7의 로컬 모바일 메뉴 Enter/Escape, 정확한 답글/수정 트리거 복귀, 포커스 링, 실제 비교 표 ArrowRight 이동, 긴 제목 wrapping은 이미 PASS인 키보드/반응형/공통 컴포넌트 근거를 보강한다. 해당 PASS를 새 게이트로 중복 계산하지 않는다. 배포 성공/타입·빌드·HTTP smoke/최근 Worker 오류0 역시 기존 안정성·배포 게이트의 보강이며 신규 배점은 없다.

## 영역별 변화

| 영역 | V6 | 이번 변화 | V7 잠정 |
|---|---:|---:|---:|
| 정체성·기획 일치 | 86.25 | 0.00 | 86.25 |
| 내용·최신성 | 96.25 | +3.75 | 100.00 |
| 디자인 | 81.25 | 0.00 | 81.25 |
| 사용성 | 95.00 | 0.00 | 95.00 |
| 쾌적성·접근성 | 62.50 | +25.00 | 87.50 |
| 유용성 | 80.00 | 0.00 | 80.00 |
| 커뮤니티 | 93.75 | 0.00 | 93.75 |
| 개인 기능 | 75.00 | 0.00 | 75.00 |
| 배포·운영 | 93.75 | 0.00 | 93.75 |

검산: PASS129→134, GAP5 유지, UNVERIFIED18→13, 합계152. 각 게이트의 기존 획득점만 합산했다. 렌더 성능 세부항목은 **측정 근거 25/25**이며 “속도/반응성 품질이 완벽하다”는 뜻이 아니다. 88 이상 영역은 여전히4개다. 5개 영역은 수치 미달이고 명시 범위도 미완료다.

## 반드시 유지할 실패·미완료와 보고서 수정 시 주의

- 초기 로드 8개 중 7개가 고정 TTFB/FCP/LCP 예산을 넘었다. 가장 느린 TTFB는4724.2ms, FCP/LCP는5376ms였다. 가장 빠른 표본만 골라 해결했다고 하지 않는다.
- 캐시/네트워크/탭 차이는 통제되지 않았다. 다수 표본의 미확인 리소스 크기, 스크립트 비용의 부분 관측, 물리 모바일 및 호스팅 전체 범위 부재를 유지한다.
- 문서 INP 후보는 진단 버튼 포함이며 특정 액션의 고유 지연이 아니다. 이전 수동 캡처의15초 미준수는 유지한다. 추가 탐색 과제1건의2476ms 창과93ms 벽시계 결과 확인은 새 유효 증거지만 다른 과제의 엄격한 창/비동기 네트워크 완료 시간을 대신하지 않는다.
- 전체 화면 시각 비교, 실제 줌, 실제 스크린리더 실행이 미완료다. 대표 폭과 키보드 확인만으로 세 항목을 닫지 않는다.
- 계약 조건 이력/날짜별 전환 비용, 실제 이메일 전달·정기 처리, 운영 책임/주기와 피드백 등 기존 GAP **1.2.4, 8.3.4, 8.4.3, 8.4.4, 9.4.4**는 이번 증거와 무관하며 그대로 남는다.
- 기존 최대60점 규칙은 중대 보안/개인정보 결함, 깨진 핵심 흐름, 배포 실패의 해당 영역에 적용한다. 현재 기록된 로드 지연만으로 새로운 일괄60점 캡을 만들지 않는다. 그렇다고 로드 예산 실패를 숨기지도 않는다.
- 현 `docs/2026-09-12-site-quality-review.md:46`의 “렌더링 성능0/25는 측정 부재이며 느린 사이트라는 판정이 아니다”는 V6 당시 서술이다. V7로 갱신할 때는 **25/25 대표 측정 근거, 실제 초기 속도 예산 실패 확인, 작업/문서 지표의 범위와 이전 캡 미준수 보존**으로 바꿔야 한다. `:53`의 Performance API/전체 로고 미확인 설명도 새 앱 문서 계측·20개 decode 사실과 남은 범위를 구분해야 한다.

**전체 목표는 미완료다.** 이번 결과는 기존 문구에 대한 증거 변화만 기록하며 게이트 확장·목표 역산·완료 승인을 하지 않는다.
