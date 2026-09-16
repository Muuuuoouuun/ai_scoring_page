# AIS 개인 Notion 연결: 공식 OAuth 조사

진행 상태: 사용자의 “지금 연결은 하지 않기” 지시에 따라 실제 연동은 보류. 이 문서는 향후 검토를 위한 참고 조사다.

확인일: 2026-09-15. 근거는 Notion 공식 개발 문서만 사용했다. 개인 계정·워크스페이스·페이지·토큰에 접근하거나 앱 등록, OAuth 승인, 실제 API 호출, Site 변경은 하지 않았다.

AIS의 기존 SIWC 로그인 상태에 개인 Notion 서비스를 연결하는 설계다. Notion OAuth로 AIS 계정을 만들거나 로그인 주체를 교체하는 기능이 아니다. 아래에서 **공식 확인**과 **AIS 구현 제안**을 구분한다.

## 1. 앱 등록에 필요한 것

**공식 확인:** Developer portal → Build → Public connections → Create new connection에서 다음을 설정한다.

| 항목 | 필요한 설정 |
| --- | --- |
| Connection name | 사용자가 동의 화면에서 알아볼 AIS 연결 이름 |
| Development workspace | 개발용 Notion 워크스페이스 선택 |
| Redirect URI(s) | OAuth 콜백 주소 등록 |
| Installation scope | 일반 사용자 서비스는 Any workspace. 제한 시험이면 Selected workspaces only |
| Capabilities | 아래의 읽기 전용 설정 |
| Client credentials | 생성 후 Configuration에서 OAuth client ID와 client secret 확인 |

설치 범위는 생성 이후 변경할 수 없다. Selected workspaces only로 만든 연결을 나중에 Any workspace로 바꾸려면 새 연결이 필요하다. 공개 연결은 각 Notion 사용자가 개별 동의하고 사용자별 토큰을 받는다. 같은 워크스페이스에서도 동료의 토큰을 공유하는 구조가 아니다. [Public connections](https://developers.notion.com/guides/get-started/public-connections)

Marketplace 등록은 별도이며 OAuth 사용의 필수 조건이 아니다. Marketplace에 노출하려는 경우에만 listing과 보안 심사를 별도로 거친다. Authorization 문서의 오래된 이미지 캡션에 review가 언급되지만 최신 명시적 설명은 미등록 공개 연결의 사용을 허용한다. 외부 자료의 “공개 OAuth 자체에 Marketplace 승인 필수” 주장을 따르지 않는다. [Marketplace FAQ](https://developers.notion.com/guides/get-started/marketplace-listing), [연결 유형 개요](https://developers.notion.com/guides/get-started/overview)

**AIS 구현 제안:** 콜백은 운영 HTTPS 주소 하나를 정해 등록하고 인가 요청·토큰 교환에 같은 값을 사용한다. 경로 예시는 `/api/connections/notion/callback`이며 실제 Site 라우팅 지원에 맞춰 확정해야 한다. 고정 운영 콜백이 정해지기 전 임시 주소를 운영 자격 증명에 섞지 않는다. 등록 화면이 요구하는 추가 정보를 입력하되 이번 조사로 조직·약관·로고 필드의 현재 필수 여부까지 확정하지는 않았다.

## 2. 읽기 전용 최소 권한

| Capability | 첫 연결 버전 |
| --- | --- |
| Read content | 활성화 |
| Update content / Insert content | 비활성화 |
| Read comments / Insert comments | 비활성화 |
| User information | No user information |

문서 목록 확인에 필요한 것은 Read content다. 댓글·본문 수정·페이지 생성·사용자 이메일 권한은 요청하지 않는다. 표시 이름·프로필 사진이 제품에 꼭 필요해질 때만 User information without email addresses를 검토한다. 권한을 변경한 공개 연결은 기존 사용자의 재인증이 필요하다. capability는 실제 사용자의 권한을 넘을 수 없으며 선택한 상위 페이지의 자식도 접근 범위에 포함된다. [Connection capabilities](https://developers.notion.com/reference/capabilities)

**공식 확인:** 인가 화면에서 사용자가 페이지를 고른다. 본인이 full access를 가진 페이지/데이터베이스만 선택할 수 있고 상위 페이지 선택은 하위 페이지 접근도 제공한다. [Authorization: page picker](https://developers.notion.com/guides/get-started/authorization#prompt-for-a-standard-connection-with-no-template-option-default)

**AIS 구현 제안:** 화면 문구는 “선택한 Notion 페이지를 읽습니다”로 한다. 첫 버전은 페이지 제목·링크·수정일 목록까지 가져오며 본문·댓글은 자동 수집하지 않는다. 별도의 AIS 내부 선택 목록을 둔다면 이는 API 토큰 자체의 Notion 권한을 줄이는 것은 아니므로 두 범위를 혼동하지 않는다.

## 3. 인가와 코드 교환

인가 주소는 다음 파라미터를 갖는다. `state`는 공식 선택 사항이지만 AIS에서는 필수로 검증한다.

```text
https://api.notion.com/v1/oauth/authorize
  ?client_id=<CLIENT_ID>
  &redirect_uri=<URL_ENCODED_REGISTERED_CALLBACK>
  &response_type=code
  &owner=user
  &state=<OPAQUE_ONE_TIME_NONCE>
```

콜백은 성공 시 `code`, 요청한 `state`를 받는다. 취소는 `error=access_denied` 등으로 돌아올 수 있다. [Authorization](https://developers.notion.com/guides/get-started/authorization)

서버에서만 코드를 교환한다. 아래는 실행하지 않은 요청 형태다.

```http
POST https://api.notion.com/v1/oauth/token
Authorization: Basic <base64(CLIENT_ID:CLIENT_SECRET)>
Content-Type: application/json
Notion-Version: 2026-03-11

{"grant_type":"authorization_code","code":"<CALLBACK_CODE>","redirect_uri":"<REGISTERED_CALLBACK>"}
```

인가 URL에 redirect_uri를 보냈거나 등록 URI가 여러 개이면 교환 본문에도 필수다. 등록 URI가 하나이고 인가 URL에서 URI를 생략했다면 본문에 넣으면 안 되는 예외가 있다. AIS는 항상 인가 URL에 등록 URI를 명시해 동일 URI를 교환에 넣는 방식을 권장한다. 응답의 `refresh_token`은 현행 schema상 nullable이며 `workspace_name`·`workspace_icon`도 null일 수 있다. [Create a token](https://developers.notion.com/reference/create-a-token)

**AIS 구현 제안:** 로그인된 SIWC 사용자 ID에 서버가 만든 짧은 수명의 1회용 nonce를 묶는다. 콜백에서는 해당 사용자·목적·만료·사용 여부를 확인하고 소비한 뒤 연결한다. URL의 임의 userId 또는 Notion 이메일로 연결 소유자를 정하지 않는다. 콜백 때 SIWC 세션을 확인할 수 없는 환경은 기존 로그인 복원 및 nonce 결합을 검증할 경로가 필요하다. 응답의 owner 이메일을 AIS 인증 수단으로 사용하지 않는다.

## 4. 연결 확인과 워크스페이스 표시

토큰 교환 응답의 `workspace_id`, `workspace_name`, `workspace_icon`, `bot_id`, `owner`로 승인된 연결을 식별할 수 있다. OAuth 응답에는 page picker에서 선택한 페이지 ID 배열이 없다. `duplicated_template_id`는 옵션 템플릿을 복제한 경우의 단일 페이지이며 일반 선택 페이지 목록이 아니다. [Create a token response](https://developers.notion.com/reference/create-a-token)

최소 유효성 확인은 다음 한 번의 읽기다.

```http
GET https://api.notion.com/v1/users/me
Authorization: Bearer <ACCESS_TOKEN>
Notion-Version: 2026-03-11
```

이 endpoint는 모든 capability 수준에서 호출 가능하며 응답 정보는 권한 수준에 따라 제한된다. 공개 OAuth의 경우 token에 연결된 bot을 확인하는 용도다. 이것을 AIS에 로그인한 실제 사용자 본인 정보로 간주하지 않는다. [Retrieve your token's bot user](https://developers.notion.com/reference/get-self)

bot 객체에는 owner 및 workspace_id가 있을 수 있다. User 문서는 owner.type=user인 bot의 workspace_name을 null로 설명하므로 화면의 워크스페이스 이름은 OAuth 교환 응답을 우선 사용하고 없으면 “연결된 워크스페이스”로 표시한다. [User object](https://developers.notion.com/reference/user)

**AIS 구현 제안:** 연결 소유 키는 SIWC user ID이며 Notion workspace_id·bot_id·owner.user.id는 외부 연결 식별자다. DB에서 SIWC 사용자 기준 접근 제어를 적용한다. Notion 사용자 이름·이메일 일치만으로 다른 AIS 계정 연결을 합치지 않는다. `/users/me` 성공을 연결 상태 확인으로 사용하고 페이지 검색 결과가 0건이어도 연결 실패로 바꾸지 않는다.

## 5. 접근 가능한 페이지 목록의 최소 조회

```http
POST https://api.notion.com/v1/search
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
Notion-Version: 2026-03-11

{"filter":{"property":"object","value":"page"},"sort":{"direction":"descending","timestamp":"last_edited_time"},"page_size":20}
```

처음에는 query를 생략해 접근 가능한 페이지를 조회하고 검색어 입력 시 query를 추가한다. 현행 Search는 page 또는 data_source를 반환한다. 데이터 소스까지 필요할 때는 value=data_source로 별도 요청하거나 filter를 생략한다. 예전 database filter나 deprecated Get databases를 새 구현에 사용하지 않는다. [Search by title](https://developers.notion.com/reference/post-search)

`has_more`와 `next_cursor`를 확인하고 다음 요청의 `start_cursor`에 전달한다. 첫 20개만 읽었다면 “전체 페이지”로 표현하지 않는다. [Pagination](https://developers.notion.com/reference/intro#pagination)

검색은 정확히 “OAuth에서 체크한 루트 페이지들”의 목록을 반환하는 API가 아니다. 선택한 페이지에서 접근 가능한 하위 페이지도 포함될 수 있고 검색 인덱싱이 지연될 수 있다. 공식 문서는 검색을 전체 문서의 완전한 열거 도구로 보장하지 않는다. 직접 공유된 항목에 관한 최적화 설명과 별개로 인가 직후 완전한 결과를 가정하지 않고 새로고침 버튼을 둔다. [Search limitations](https://developers.notion.com/reference/search-optimizations-and-limitations)

**AIS 구현 제안:** 화면 이름은 “연결된 페이지” 또는 “접근 가능한 페이지”로 한다. 반환 페이지에서 `id`, `url`, `last_edited_time` 및 properties 중 type=title인 값의 plain_text만 추려 표시한다. title 속성 이름을 항상 "title"로 하드코딩하면 데이터베이스 항목을 놓칠 수 있다. 본문 블록이나 markdown endpoint 호출은 첫 연결 확인에 필요 없다. [Page object](https://developers.notion.com/reference/page)

## 6. 토큰 갱신

현재 공식 문서는 access/refresh token 발급과 갱신을 지원한다. “Notion은 refresh token 없음”이라는 예전 가정은 사용하지 않는다.

```http
POST https://api.notion.com/v1/oauth/token
Authorization: Basic <base64(CLIENT_ID:CLIENT_SECRET)>
Content-Type: application/json
Notion-Version: 2026-03-11

{"grant_type":"refresh_token","refresh_token":"<CURRENT_REFRESH_TOKEN>"}
```

갱신하면 새 access token과 새 refresh token을 받는다. 위 body는 Authorization 가이드의 Step 6을 따른다. Refresh API 페이지의 자동 생성 예시는 기본 authorization_code 분기가 먼저 표시되어 있으므로 그것을 갱신 본문으로 복사하지 않는다. [Authorization: refresh](https://developers.notion.com/guides/get-started/authorization#step-6-refreshing-an-access-token), [Refresh a token](https://developers.notion.com/reference/refresh-a-token)

**확인 한계:** 조사한 OAuth 응답 schema에는 expires_in/exp가 없고 고정 access/refresh 만료 시간을 확정할 근거도 없다. 1시간·30일·영구 등의 수명을 임의로 기록하지 않는다. Notion이 외부 서비스에 접근하는 Link Preview 문서의 expires_in 규칙은 역방향 OAuth이므로 여기에 적용하지 않는다.

**AIS 구현 제안:** 연결별 갱신은 하나씩 수행하고 새 토큰 쌍을 원자적으로 교체한다. 동일 refresh token을 여러 요청이 동시에 재사용하지 않게 한다. 첫 401에서 refresh token이 있는 경우에 한해 갱신 1회·원 요청 재시도를 허용하되, 갱신 실패나 null token이면 재연결 상태로 바꾼다. 갱신이 성공했다는 이유로 사용자가 해제한 연결을 자동 복구하지 않는다. API의 오류 의미는 실제 code도 검사한다. [Status codes](https://developers.notion.com/reference/status-codes)

## 7. 연결 해제·토큰 취소

공식 취소 endpoint는 access token 취소를 명시한다.

```http
POST https://api.notion.com/v1/oauth/revoke
Authorization: Basic <base64(CLIENT_ID:CLIENT_SECRET)>
Content-Type: application/json
Notion-Version: 2026-03-11

{"token":"<CURRENT_ACCESS_TOKEN>"}
```

성공 응답은 HTTP 200이다. 조사 문서는 refresh token을 이 endpoint에 넣을 수 있는지, access token 취소 시 관련 refresh token 전체 또는 Notion의 설치 항목까지 함께 제거되는지를 명시하지 않는다. 이를 전부 제거했다고 주장하지 않는다. [Revoke a token](https://developers.notion.com/reference/revoke-token)

선택적으로 `POST /v1/oauth/introspect`에 같은 Basic 인증과 `{token:<ACCESS_TOKEN>}`을 보내 `active` 상태를 확인할 수 있다. scope·iat가 반환될 수 있지만 워크스페이스의 선택 페이지 목록은 아니다. [Introspect a token](https://developers.notion.com/reference/introspect-token)

**AIS 구현 제안:** 사용자의 해제 요청은 먼저 해당 개인 연결을 비활성화하고 동기화·갱신을 중단한 뒤 revoke를 수행한다. 성공 또는 이미 비활성임을 확인하면 저장한 access/refresh token과 개인 캐시를 삭제한다. 네트워크 오류로 취소가 미확인이라면 UI는 “AIS 연결 해제됨 · Notion 권한 취소 확인 중”처럼 상태를 나누며, 취소 재시도를 위해 필요한 제한된 비밀 저장 외에는 읽기에 사용하지 않는다. “Notion에서 앱 삭제 완료”와 혼동하지 않는다. 모든 작업은 해당 SIWC 사용자 연결에 한정한다.

## 8. 서버 보관과 완료 기준

공식 지침은 토큰을 소스·공개 메시지·버전 관리에 두지 않고 운영 secret manager 등으로 보관하며 필요한 capability만 부여하도록 한다. [Secure API tokens](https://developers.notion.com/guides/get-started/handling-api-keys)

**AIS 구현 제안:** 공용 client secret은 서버 비밀 설정, 개인 access/refresh token은 사용자별 암호화 저장으로 분리한다. 브라우저 localStorage, 공개 프런트엔드 환경 변수, 응답 JSON, 로그에 토큰을 넣지 않는다. 프런트엔드는 마스킹된 상태·워크스페이스 이름·페이지 목록만 받는다. 콜백 code/state와 token endpoint 응답 원문도 일반 로그에서 제외한다.

첫 실제 연결의 검증 완료 기준은 다음과 같다.

1. 공개 연결 등록과 고정 callback/client credentials가 준비되어 있다.
2. 기존 SIWC 사용자로 시작한 연결만 그 사용자에게 귀속된다. 취소·잘못된 state·재사용된 state는 연결을 만들지 않는다.
3. 읽기 권한 동의 후 `/users/me` 성공과 workspace 표시를 확인한다.
4. 선택한 테스트 페이지 제목·링크가 목록에 보이고 페이지 결과가 비어 있을 때의 안내·새로고침이 동작한다.
5. 다른 AIS 사용자가 이 연결이나 페이지 캐시를 읽지 못한다.
6. 갱신 실패는 재연결로, 해제는 읽기 중단·취소·비밀 삭제로 이어진다.

이번 산출물은 공식 문서 조사다. 자격 증명 생성 및 실제 계정 연결 테스트는 수행하지 않았다.
