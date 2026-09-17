# V17 삭제 확인 모달 긴 이름 줄바꿈 검토

2026-09-13. 읽기 전용 소스·이미지 검토. Site·CSS·UI·DB·Git·배포를 변경하지 않았다. 아래 화면의 이름·금액은 기존 로컬 QA 데이터이며 실제 사용자나 운영 기록이 아니다.

## 실제 관찰

다음 두 파일을 `view_image(detail=original)`로 각각 열었다.

- [v01-delete-D.jpg](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/v01-delete-D.jpg): ‘요금 비교 삭제’ 모달의 긴 연속 A/B 이름이 모달 오른쪽에서 잘리고, 아래에 내부 가로 스크롤바가 실제 보인다. 제목·닫기·삭제하기·취소는 보이므로 모달 전체가 화면 밖으로 밀린 경우와 다르다.
- [v01-delete-M.jpg](/Users/bigmac_moon/dev/ai_score/docs/audits/v17-expanded-ui/v01-delete-M.jpg): 같은 긴 이름이 본문에서 줄바꿈되지 않아 오른쪽이 가려지고, 모달 하단 내부 가로 스크롤바가 보인다. 현재 스크롤 위치에서는 삭제 대상의 전체 이름을 한 번에 확인하기 어렵다.

두 JPG에서 확인한 것은 내부 가로 넘침이다. 이 하위 검토는 DOM의 clientWidth/scrollWidth를 측정하거나 가로 스크롤을 직접 조작하지 않았다. 문서 전체 폭 수치로 이 모달 내부 문제를 대신 판정할 수 없다.

## 원인과 영향 범위

[Modal.tsx:4](/Users/bigmac_moon/dev/ai_score/site/components/Modal.tsx:4)는 `dialog.modal-dialog > div.modal` 아래에 제목 행과 children을 그대로 렌더한다. [globals.css:13](/Users/bigmac_moon/dev/ai_score/site/app/globals.css:13)에서 dialog 폭을 `min(620px,calc(100% - 24px))`, 내부 modal 폭을 100%로 제한한다. 내부 `.modal`의 기존 `overflow:auto`는 세로 폼 스크롤에도 필요하지만, 줄바꿈되지 않는 긴 토큰은 가로 스크롤 영역으로 남긴다.

[ Savings.tsx:49 ](/Users/bigmac_moon/dev/ai_score/site/components/Savings.tsx:49)의 삭제 본문은 무클래스 직계 `<p>‘{deleting.payload.title}’ 비교 기록을 삭제할까요?</p>`다. 이 p 또는 modal 조상에는 긴 연속 문자에 대한 overflow-wrap 규칙이 없다. 일반 공백과 QA 이름의 하이픈에서는 줄이 나뉘지만 긴 A/B 토큰 내부에는 줄바꿈 지점이 없어 현재 이미지와 일치한다.

목록·저장 비교·조건 이력에는 이미 `overflow-wrap:anywhere`가 있다([globals.css:20](/Users/bigmac_moon/dev/ai_score/site/app/globals.css:20), 35–37행). 삭제 모달 본문은 `.record-row`, `.saved-comparison`, `.terms-editor`의 자손이 아니어서 그 규칙을 받지 못한다. 같은 값을 목록에서 정상적으로 보여도 삭제 확인에서 재발하는 이유다. 공통 h1/h2/h3에도 38행에서 anywhere가 지정돼 있으며 이번 캡처의 모달 제목은 정상이다.

| 현재 Modal 소비자 | 본문 구조와 이번 원인의 관련성 |
|---|---|
| Savings ‘요금 비교 삭제’ | 사용자 제목을 넣는 직계 p. 두 실제 이미지에서 확인된 결함. |
| MyWorkspace ‘기록 삭제’ | 사용자 name/title을 넣는 동일한 직계 p. fontSize/marginBottom만 인라인으로 지정돼 있어 동일 원인에 노출됨. 소스로 확인한 재현 가능성이고 이번 작업에서 해당 모달 이미지를 별도로 관찰한 것은 아님. |
| Community ‘글 삭제’ | 같은 직계 p이나 고정된 한국어 문장. 긴 사용자 이름을 넣지 않아 현재 결함은 확인되지 않음. |
| MyWorkspace RecordForm/TermsEditor, Feedback | form 또는 별도 wrapper를 자식으로 렌더. 이번 삭제 p 문제를 해결하기 위해 입력·표·폼 레이아웃을 변경할 필요는 없음. |

## 가장 작은 권장 변경

`globals.css`의 공통 모달 규칙에 다음 한 규칙을 추가하는 범위가 충분하다.

```css
.modal-dialog .modal > p { overflow-wrap: anywhere; }
```

이는 현재 세 삭제 확인 본문에만 공통 적용된다. 보이는 전체 이름을 유지하면서 한 단어가 컨테이너 폭보다 길 때 줄바꿈할 수 있고, 기존 버튼·폼·표의 자체 너비/스크롤 정책을 바꾸지 않는다. 각 소비자에 별도 인라인 스타일을 반복하거나 Modal.tsx/Savings.tsx의 동작을 바꿀 필요는 없다.

`overflow-x:hidden`만 추가하면 대상 이름을 가리므로 원인 해결이 아니다. 모달 폭 확대·글자 축소·이름 축약도 현재 200자 입력을 읽을 수 있게 하는 직접 해법이 아니며, `word-break:break-all`을 전역 적용할 이유도 없다. `.modal {overflow-wrap:anywhere}`도 더 넓은 공통 대안이지만 이번 확인된 직계 삭제 문구에 비해 폼 하위 문구 전체로 범위를 넓힌다.

## 기존 결함에 맞춘 확인

Root가 같은 저장 결과와 같은 200자 제목을 그대로 두고 D/M 삭제 확인을 다시 열어, 긴 A/B 구간과 끝의 ‘비교 기록을 삭제할까요?’가 폭 안에서 줄바꿈되는지 확인하면 된다. 모달 본문 자체의 scrollWidth/clientWidth와 실제 이미지에서 내부 가로 스크롤 제거를 함께 보면 정확하다. 닫기·삭제하기·취소가 읽히고, 높이가 늘어난 모바일에서 필요한 세로 스크롤로 하단 버튼에 접근 가능한지 확인한다. 실제 삭제는 필요 없다.

가능하면 현재 100자 QA 구독의 ‘기록 삭제’도 열고 취소하여 동일 소비자 보완을 확인한다. 이는 같은 원인의 회귀 확인이며 새 데이터나 평가 게이트를 요구하지 않는다. 본 보고서는 수정 후 렌더링 성공이나 3.4.4 PASS를 주장하지 않는다.
