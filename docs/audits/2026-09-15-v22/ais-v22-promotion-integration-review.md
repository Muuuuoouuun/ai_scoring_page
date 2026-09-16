# V22 상시 교육 혜택 최소 통합 검토

2026-09-15 읽기 전용 검토. 요청에 적힌 `lib/promotions.ts`는 현재 없으며 실제 공통 구현은 [promotion-facts.ts](/Users/bigmac_moon/dev/ai_score/site/lib/promotion-facts.ts)다. [notice-candidates](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts), 공개 페이지, ServiceInsights, PromotionPreferences, workspace-settings, notifications 및 source guards를 함께 읽었다. Source·DB·UI·운영은 수정하지 않았다.

## 최소 변경 경계

1. **등록 마감과 승인 후 혜택 기간을 분리한다.** `expiresAt`을 nullable로 하고 `deadlineType: 'fixed' | 'ongoing' | 'unknown'` 같은 명시적 구분을 둔다. 기존 날짜가 있는 항목은 필드를 생략해도 기존 fixed 의미로 유지한다. null만으로 ‘상시’를 추정하지 않는다. 신규 ongoing에는 공식적으로 현재 신청 안내가 존재한다는 근거가 필요하며, 미래에도 영구 신청 가능하다는 보증으로 표시하지 않는다. `status:ended/withdrawn`은 ongoing보다 우선한다. 공통 마감 날짜와 학생별 자격 만료일을 혼합하지 않는다.
2. **순수 날짜 함수에만 좁은 분기를 추가한다.** 명시 ongoing이며 모순된 마감 값이 없으면 `deadlineState`는 open으로 취급 가능하고 `emailDeadline`은 null을 반환할 수 있다. fixed의 절대 시각 및 날짜만 있는 기존 보수 경계는 그대로 유지한다. unknown/잘못된 날짜/ongoing과 날짜가 함께 있는 모순 자료는 uncertain 및 발송 보류다. null emailNotAfter는 현재 SQL의 `COALESCE(...,'9999')`에서 날짜 제한 없음으로 처리되므로 최신 카드·source head·settings guard를 빼면 안 된다. 신규 ongoing을 이유로 이메일 승인 조건이나 동의를 변경하지 않는다.
3. **무료 기본 혜택과 유료 갱신을 구분한다.** 표시용으로 `price.amount:0`, `currency:null`, `period:'eligible-period'`, 세금 미확인 같은 표현을 허용하고 `renewalPrice:null`을 보존한다. 갱신 정책은 예를 들어 ‘자격 유지/Free 전환/유료 전환/미확인’으로 표시하거나 검수된 짧은 설명 필드를 추가한다. `priceNote`만으로 중요한 자격·유료 전환 조건을 감추지 않는다. Notion의 명시 Free 전환은 유료 갱신으로 쓰지 않고, GitHub/Miro 미확인 전환은 무료 자동 갱신으로 쓰지 않는다. 이번 최소 통합에서 `maxPrice`의 기존 보수 검사를 우회할 필요는 없다. 미확인 갱신가·통화·기간 때문에 조건 일치를 보류하면 그 이유를 표시한다. ‘무료’가 추가 사용·모든 플랜까지 무제한 무료라는 뜻은 아니다.
4. **단일 고정 benefitMonths를 만들어 넣지 않는다.** 매년/매월 자격 재확인은 혜택을 12개월/1개월 보장한다는 뜻이 아니다. 학생·교직원 변형을 합친 Miro는 단일 숫자 null을 유지하고 세부 기간을 설명한다. `minBenefitMonths` 입력이 있으면 미확인/혼합 기간은 기존처럼 보류한다. 기능은 해당 교육 플랜의 sourceUrl·condition·status를 갖춰야 하고 일반 상품 기능을 자동 상속하지 않는다.
5. **출처 검토와 개인 자격을 분리한다.** Miro의 공개 자격 모순은 기존 `reviewStatus` 미검토 상태 및 conditions로 보류할 수 있다. 사용자가 eligible을 선택해도 이 보류가 풀려서는 안 된다. `eligibilityFingerprint`와 서버의 stale 조건 409를 유지한다. 새 국가 제한/학교/기존 구독 조건은 자격 지문에 반영되는 eligibility/conditions에도 포함한다. 국가 코드가 []인 기관 기준 혜택을 한국 확정 또는 미국 제외로 해석하지 않는다. `promotionEligibilityConfirmedAt`만으로 실제 학교 인증을 받았다고 주장하지 않는다.

## 기존 변경 감지와 충돌을 피하는 호환성

현재 Google 항목을 실제 모듈로 계산한 기준은 아래와 같다. 이는 로컬 소스의 기준값이며 운영 DB head 조회 결과는 아니다.

- id: `google-ai-pro-us-students-2026`, revision: `1`
- material hash: `94da3afa2d79a0e08c049846dc15e383c70af3bccead62ae3eb8726a49ac762e`
- deadline material: `{date:'2026-12-31', instant:null, timeZone:null}`

`promotionMaterial`에 모든 항목 대상으로 새로운 null/default key를 추가하면 실제 조건 변화 없이 기존 hash가 달라진다. 같은 revision이면 `registerSource`가 충돌 보류하고, revision만 억지로 올리면 기존 수신자에게 불필요한 정정으로 보일 수 있다. **기존 fixed 자료의 material 모양을 보존하고, 신규 ongoing/새로운 실제 조건에만 추가 구분을 직렬화**하는 것이 가장 작은 호환안이다. 기존 자격 지문도 단순 타입 정리로 변경하지 않는다.

반면 실제 등록 방식·갱신 정책·혜택 기간·참여 조건이 바뀌면 material 변화에 포함하고 수동 source revision을 올려야 한다. `checkedAt`, 표시용 설명 정리, 링크 버튼 제목은 새 혜택 사건이 아니다. 중요 조건을 새 표시용 필드에만 저장해 hash 밖에 두지 않는다. 정정 후보는 현재 reviewStatus, 관심 해제, source authority, 기존 시도 이력과 만료 스냅샷 보호를 그대로 따른다. 상시 혜택 추가는 이미 존재하는 신청 기회의 수집이며 과거 가격 비교 없이 ‘지금 할인 발생’을 선언할 근거가 아니다.

## 함께 고칠 소비자

- [공개 프로모션 페이지](/Users/bigmac_moon/dev/ai_score/site/app/promotions/page.tsx:4): 모든 카드에 붙은 미국 전용/등록 마감/정확 시각 미확인/미국 출처명 하드코딩을 항목별 안내로 바꾼다. fixed·ongoing·unknown, 무료 기본 혜택·갱신 미확인·Free 전환이 서로 다른 문구로 보여야 한다. 배열이 선택 항목이면 `offerFeatures ?? []`로 안전하게 렌더하거나 데이터 계약에서 필수 배열로 정한다. 기능 출처 링크를 실제 항목에 연결한다.
- [notice-candidates](/Users/bigmac_moon/dev/ai_score/site/lib/notice-candidates.ts:59): `등록 마감 null`, `갱신 가격 미확인`만 있는 모호한 본문을 공통 deadline/renewal 표시 함수로 바꾼다. 여기의 대안 판정은 여전히 useCases 정확 일치이고 ServiceInsights는 similarTools를 사용한다. 같은 사용자 옵션 아래 두 화면의 ‘공통 기능 대안’ 의미를 맞출 경우, 수정된 similarTools를 공통으로 사용한다. library 등록 자체를 이메일 관심·동의로 자동 승격하지 않는다.
- [PromotionPreferences](/Users/bigmac_moon/dev/ai_score/site/components/PromotionPreferences.tsx): 새 프로그램도 자격 미확인이 기본이며 기존 선택을 다른 program id에 재사용하지 않는다. 조건부 기능·미확인 갱신가 때문에 보류되는 이유와 ‘최소 개월 미확인’을 그대로 보인다. 현재 월상한 설명은 혜택과 갱신 후 모두 적용이므로 구현도 그 기준을 유지한다.
- [ServiceInsights](/Users/bigmac_moon/dev/ai_score/site/components/ServiceInsights.tsx): active ongoing을 표시하되 offerHolds의 보류를 숨기지 않는다. ‘입력 조건 일치’는 외부 신청 승인으로 바꾸지 않는다. 신규 `miro`처럼 아직 없는 toolId는 카탈로그 추가 후 연결하고, 깨진 도구 URL을 만들지 않는다.

새 파일을 꼭 만들 필요는 없다. 공통 `Promotion` 타입/표시 함수를 기존 facts 모듈에 두고 모든 소비자가 쓰면 된다. 선택적으로 `lib/promotions.ts`를 추가한다면 JSON을 한 번 정규화해 내보내는 얇은 진입점이면 충분하다. 모듈 import 중 네트워크 조회·개인 기록 변경을 넣지 않는다.

## 회귀 기대값

| 범위 | 최소 기대값 |
|---|---|
| Ongoing/unknown | 명시 ongoing/null은 표시 가능, 누락/unknown/null은 확인 보류. 모순된 ongoing+고정 마감은 자동 활성 판정 금지. |
| 기존 fixed 경계 | `notice-versions`의 UTC 절대 마감과 날짜-only -14h/+36h 기대값 유지. |
| 무료/미확인 | 0은 무료 표시, 통화 null·갱신 null이 숫자 0 또는 KRW/USD로 변조되지 않음. maxPrice/minBenefit/필수 기능 미확인 보류 유지. |
| 검토/자격 | Miro review 미확인 + 사용자 eligible이어도 emailAllowed false. 새 자격 조건에 구 지문 저장은 409. |
| 기존 hash | 공식 사실이 같은 Google fixed 항목은 위 hash와 기존 자격 지문을 유지. checkedAt 또는 revision-only로 카드 증가·읽음 초기화·재발송 없음. |
| 진짜 전환 | ongoing→fixed/withdrawn은 명시 revision 증가 후 기존 카드에 반영. 오래된 worker와 같은 revision 다른 사실은 current card·dispatch를 되돌리지 못함. |
| 발송 스냅샷 | fixed 마감 이후 기존 queued/retry는 발송 금지. ongoing의 null deadline만으로 동의·시간·최신 source/카드·lease·idempotency를 생략하지 않음. 모의 provider만 사용. |
| 후보 범위 | 관련 기능 없는 대안은 제외. 직접 관심과 대안 옵션을 구분하고 ‘관심 없음’/숨김·해제는 유지. |
| 렌더/링크 | 공개·내 서비스·설정·앱 알림 모두 등록 마감 null/미국 전용 오표시 없이 동작. 모든 toolId가 카탈로그에 있고 source/anchor 링크 유효. |

현재 기존 테스트의 기준 구조는 `notice-versions.test.mjs`, `notice-audit.test.mjs`, `notice-races.test.mjs`에서 재사용 가능하다. 테스트의 날짜 고정 fixture는 기존 방식대로 유지하고 신규 상시 fixture를 분리한다. 실제 메일/무방문 수집 연결이나 운영 성과 검증은 이번 변경으로 완료되지 않는다.
