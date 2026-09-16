# AI 카탈로그 6개 출처·주장 검토

검토일: 2026-09-15 (Asia/Seoul). 기존 `site/data/catalog.json` 및 `lib/catalog.ts`를 읽고 기존 20개에 없는 6개를 작성했다. Site 파일·DB는 수정하지 않았다. 사용자 점수·후기·평가 수치를 생성하지 않았다. 제품 사실은 공식 제품/지원/요금/릴리스 문서만 사용했다. 공식 앱스토어의 개발자 배포 정보는 제품 아이콘 및 iOS 언어 목록 확인에만 활용했다.

산출물: `/private/tmp/ais-v22-ai-catalog.json` (AI 앱 5개, AI 모델 1개, 항목별 기능 4개), `/private/tmp/ais-v22-ai-logo-map.json`, `/private/tmp/ais-v22-ai-assets/` (원본 제품 아이콘 6개).

## Microsoft Copilot

- 개인용 앱을 기록했다. Microsoft 365 조직용 라이선스나 GitHub Copilot과 동일 제품으로 취급하지 않았다.
- 웹 검색 후 출처 표시: [공식 투명성 안내](https://support.microsoft.com/en-us/microsoft-copilot/transparency-note-for-microsoft-copilot). 모델명을 특정하지 않았다. 낡은 Copilot Pro 과금 설명은 이 문서에서 채택하지 않았다.
- 파일 분석과 대화당 20개·파일당 50MB: [공식 파일 업로드](https://support.microsoft.com/en-us/microsoft-copilot/file-upload-in-microsoft-copilot).
- 이미지 생성·수정: [공식 이미지 도움말](https://support.microsoft.com/en-us/microsoft-copilot/using-image-generation-in-microsoft-copilot). 로그인·구독별 생성량은 [설치/시작 안내](https://support.microsoft.com/en-us/topic/getting-started-with-microsoft-copilot-8fde147f-726e-4790-9503-70790ddcac73)와 [현행 개인 플랜](https://www.microsoft.com/en-us/microsoft-365-copilot/personal)에서 확인했다.
- 음성 대화, 마이크 권한, 혼잡 시 구독자 우선: [공식 Voice 안내](https://support.microsoft.com/en-us/microsoft-copilot/using-copilot-voice-with-microsoft-copilot).
- 한국어 텍스트·음성 지원: [언어 목록](https://support.microsoft.com/en-us/microsoft-copilot/supported-regions-and-languages-in-microsoft-copilot). 일부 신규 기능은 지역·언어별 적용이 다르다.
- 업데이트: [2026-02-26 Tasks 발표](https://www.microsoft.com/en-us/microsoft-copilot/blog/2026/02/26/copilot-tasks-from-answers-to-actions/)의 연구 미리보기만 기록했다. 이후 일반 출시 여부는 확인하지 못했으므로 일반 제공으로 표시하지 않았다. Microsoft 365나 Copilot Studio의 9월 업데이트를 개인용 앱 업데이트로 옮기지 않았다.
- 로고: 개인용 제품 홈페이지가 직접 연결한 `static/cmc/favicon.svg`. Microsoft 회사 마크로 대체하지 않았다.

## Adobe Firefly

- 이미지·생성형 채우기, 영상, 음성·음악, 무료 일일 한도와 유료 플랜의 크레딧 차이: [현행 요금표](https://www.adobe.com/products/firefly/plans.html). 표준 생성/파트너 모델/프리미엄 생성을 모두 무제한이라고 쓰지 않았다.
- 보드에서 시안 정리: [Firefly Boards 공식 소개](https://helpx.adobe.com/firefly/web/create-mood-boards/firefly-boards/about-firefly-boards.html).
- 한국어 UI와 웹/iOS/Android 제공: [공식 기술 요구사항](https://helpx.adobe.com/firefly/web/get-started/learn-the-basics/technical-requirements.html). 음성·영상 번역의 모든 한국어 기능을 일괄 지원한다고 확장하지 않았다.
- 업데이트: [공식 새로운 기능](https://helpx.adobe.com/firefly/web/whats-new/new-features/whats-new.html)은 문서 수정일 2026-09-11이지만, 해당 기능 묶음은 **August 2026**이다. 타임라인 보이스오버, 자동 리프레임, 통합 생성·편집 베타를 기록하되 실제 출시 일자가 없어 `publishedAt:null`이다. 제목/요약/rollout에 2026년 8월 및 일자 미공개를 썼다. 9/11을 기능 출시일로 만들지 않았다.
- 로고: Firefly 앱 홈페이지의 Android 192×192 제품 아이콘. 실제 파일을 확인했으며 붉은 바탕의 Fi 아이콘이다.

## Runway

- 이미지·영상 생성, 일회성 무료 125 크레딧, Standard 4K 업스케일링: [공식 요금표](https://runway.com/pricing). 무료 125 크레딧은 매월 재지급되지 않는다.
- 영상 변환/HDR, Adobe 편집 앱 패널과 결과 가져오기: [공식 플러그인 페이지](https://runway.com/plugins).
- 최신 업데이트: [2026-09-08 변경 이력](https://runway.com/changelog)의 Premiere Pro/After Effects 플러그인. macOS/Windows 다운로드 무료와 유료 플랜·크레딧 생성 조건을 함께 기록했다.
- [공식 언어 도움말](https://help.runwayml.com/hc/en-us/articles/24342920074131-What-languages-can-I-prompt-in)은 다국어 프롬프트를 받으나 언어별 결과가 같지 않으며 현지화 UI는 없다고 안내한다. 한국어 전면 지원으로 표시하지 않고 `확인 필요`와 제한 설명을 유지했다.
- 모바일 플랫폼은 공식 플러그인 페이지 하단의 Android/iOS 앱 링크로 확인했다.
- 로고: `runway.com` 홈페이지의 320×320 원본 제품 아이콘. 실제 파일을 확인했으며 R 형태의 검은 마크다.

## ElevenLabs

- 제품은 ElevenLabs/ElevenCreative의 오디오 제작 범위로 기록했다. 없는 오디오 카테고리를 만들지 않고 기존 `productivity`를 사용했다.
- 한국어 음성 생성: [공식 Korean TTS](https://elevenlabs.io/text-to-speech/korean). 언어별 품질 홍보나 외부 평점을 가져오지 않았다.
- 녹음·영상 전사: [공식 Speech to Text](https://elevenlabs.io/speech-to-text). 한국어는 지원 언어이지만 언어별 정확도가 다르며 실제 결과 검토를 명시했다.
- 다국어 더빙: [공식 Dubbing](https://elevenlabs.io/dubbing-studio). 모델/워터마크/편집 방식별 조건을 구분했다.
- 효과음·음악과 무료/유료 플랜·크레딧: [공식 요금표](https://elevenlabs.io/pricing), [효과음 제품](https://elevenlabs.io/sound-effects).
- 업데이트: [2026-09-11 Music v2.5 발표](https://elevenlabs.io/blog/music-v2-5-model). ElevenMusic 기본 모델이며 ElevenCreative/API에도 제공되는 점을 기록했다. **ElevenMusic Free의 상업적 이용 조건을 ElevenLabs 무료 TTS 라이선스로 일반화하지 않았다.**
- 로고: ElevenLabs 홈페이지가 직접 연결한 `icon.svg`. 흰 바탕의 검은 세로 막대 2개인 원본 제품 아이콘이다.

## DeepSeek-V4.1-Flash

- 앱과 API 모델을 분리했다. [현행 모델·요금표](https://api-docs.deepseek.com/quick_start/pricing/)에 모델 버전 **DeepSeek-V4.1-Flash**, 권장 API 식별자 **deepseek-flash**, 시각 입력, JSON 출력, 도구 호출, 1M 문맥이 명시되어 있다.
- 추론 모드 기본값과 변경 가능: [공식 Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/).
- 출시일 2026-09-10: [공식 발표](https://www.deepseek.com/en/news/deepseek-v4-1-flash/). 속도·벤치마크 우월성 주장은 채택하지 않았다.
- **출처 간 변경 확인:** 9/10 발표에는 9/14에 Pro를 Flash로 돌릴 예정이라고 적혀 있지만, 현행 모델·요금표 각주 2는 9/14 이후에도 Pro API를 기존 요금으로 유지한다고 명시한다. 따라서 Pro 자동전환을 현재 사실로 기록하지 않았다.
- 한국어 성능/지원 수준은 조사한 공식 자료에 특정되지 않아 `확인 필요`다.
- 로고: DeepSeek 공식 홈페이지 favicon 원본 ICO. 특정 모델 전용 로고라고 주장하지 않으며 `DeepSeek 공식 브랜드 마크`로 표시한다.

## Mistral Vibe

- [제품](https://mistral.ai/products/vibe/), [개요 문서](https://docs.mistral.ai/vibe), [구 Le Chat 이름 변경 안내](https://help.mistral.ai/en/articles/682992-le-chat-is-now-vibe)를 대조했다. 현재 이름은 Mistral Vibe, `Le Chat`은 검색 별칭이다.
- Work 다단계 업무·자료/파일·웹 조사·인증된 커넥터: [Work 공식 설명](https://docs.mistral.ai/vibe/work/get-started). 조직 정책과 외부 도구 권한을 조건으로 기록했다.
- Code의 CLI/VS Code/원격 저장소: [Code 공식 설명](https://docs.mistral.ai/vibe/code/overview).
- [현행 요금표](https://mistral.ai/pricing/)의 무료 메시지/검색/코딩 세션 한도를 반영했다. 모든 Work 기능을 Pro 전용이라고 추정하지 않았다.
- 업데이트는 [공식 변경 이력](https://docs.mistral.ai/resources/changelogs)의 **2026-05-28 Vibe 통합 출시**다. 이름 변경 도움말의 8/12 수정일을 출시일로 사용하지 않았다. API OCR의 더 최근 업데이트를 Vibe 앱 업데이트로 옮기지 않았다.
- 한국어는 `확인 필요`. [Mistral 배포 iOS 앱 정보](https://apps.apple.com/us/app/vibe-by-mistral-ex-le-chat/id6740410176)의 UI 언어 목록에 한국어가 없지만, 이를 한국어 응답 불가로 해석하지 않았다.
- 로고: 공식 문서가 연결한 Mistral AI 배포 앱의 앱스토어 아이콘 원본. 어두운 바탕의 주황색 M 아이콘을 직접 확인했다.

## 별도 프로모션 근거 (카탈로그에 적용 가능 광고로 넣지 않음)

[Firefly 요금표](https://www.adobe.com/products/firefly/plans.html)의 할인 표시에 이어 [공식 행사 약관](https://www.adobe.com/offer-terms/ff-full-special-offer.html)을 직접 확인했다. 미국의 적격 최초 구독자, 2026-05-21~10-21, 12개월 약정, 첫해 Pro Plus $34.97/월 또는 Premium $139.91/월이다. 이후 당시 정상가로 자동 갱신되며 교육/OEM/볼륨 라이선스는 대상에서 제외된다. 한국 이용자에게 적용 가능한 행사라고 표시할 수 없다. root의 프로모션 조건 필터 개발 참고용으로 전달했다.

## 검증 범위

스키마/기존 중복/필수 필드/카테고리/기능 상태/날짜 검사를 수행했다. 사용자 점수 관련 필드는 없다. 공식 로고 6개는 출처 URL, 발견 페이지, 로컬 경로, MIME, 바이트 수, SHA-256을 로고 맵에 보존했다. HTTP 검사는 단순 접근성 점검이며 내용 검증을 대체하지 않는다. 자료는 공개 정보만 읽었고 가입·구매·메일 발송·외부 글 작성은 하지 않았다. Site 적용·렌더링·기존 검색/알림 적합성 검증은 root 통합 단계에 남아 있다.

최종 보완: Firefly Boards는 프리미엄 접근이 없는 플랜에서 보드 3개 한도가 있어 기능을 `conditional`로 표시했다. Microsoft의 두 지원 문서는 실제 리다이렉트 목적 URL로 정리했다. HTTP 검사 중 일부 Adobe/Microsoft/Runway 도움말은 403 또는 시간초과였지만 웹 도구에서 공식 본문을 열어 검증했다. HTTP 파일의 이전 Boards URL은 최종 데이터에 포함되지 않는다.
