# V19 VoiceOver 정상 UI 확인 경로

2026-09-14. Apple 공식 문서 2개를 실제 열어 확인했다. 본 검토자는 UI·권한·프로세스를 조작하지 않았다. 아래는 root가 이미 승인받은 브라우저·컴퓨터 사용 및 접근성 검증 안에서 수행할 정상 UI 제안이다.

1. **정상 시작 경로는 시스템 설정 → 손쉬운 사용 → VoiceOver 스위치가 맞다.** Command-F5도 켜기/끄기 토글이다. 스위치 on을 이미 봤으므로 이 키를 무작정 반복하지 않는다. 환영 창이 실제 보이면 Return으로 VoiceOver를 시작한다. Space는 튜토리얼 시작, Escape는 끄기이므로 단순 창 닫기라고 생각해 Escape를 누르면 안 된다. 환영 창 표시 여부는 VoiceOver Utility의 General에서 설정한다. [Apple: VoiceOver 켜기/끄기](https://support.apple.com/guide/voiceover/vo2682/mac)
2. **자막 패널은 Utility → Visuals → Panels and Menus → Show caption panel**에서 켠다. 이미 체크된 상태라면 먼저 실제 패널과 출력 유무를 관찰한다. VO-Fn-Command-F10은 표시/숨기기 토글이므로 on 보장 명령이 아니다. VO는 기본 Control+Option 또는 Caps Lock이다. 패널은 실제 VoiceOver가 읽는 내용을 보여준다. [Apple: VoiceOver 자막 패널](https://support.apple.com/guide/voiceover/unac078/mac)
3. 환영 창을 처리했다면 대상 Chrome 화면으로 돌아가 기존 검증 경로의 항목을 탐색하고, 자막/실제 음성이 바뀌는지 확인한다. 시스템 VoiceOver 앱 자체를 CUA 앱 대상으로 선택해야만 브라우저 읽기가 된다는 요구는 이 문서에 없다. 화면에서 확인되지 않은 창에 추정 Return을 보내거나, 접근 거절된 앱에 대체 경로로 입력하는 뜻이 아니다.
4. 스위치 on인데 소리가 없으면 Utility → Speech → Voices의 Mute speech 상태를 일반 UI로 확인할 수 있다. Control은 읽기를 일시정지/재개하며, 일시정지 뒤 VoiceOver 커서를 이동하면 읽기가 다시 시작된다고 Apple은 설명한다. 이 항목을 원인으로 확정하지 않는다. [Apple: 읽기 일시정지와 음소거](https://support.apple.com/guide/voiceover/vo2682/mac)

**판정 경계:** root가 전달한 `isRunning:false`, `getApp` 15초 timeout은 현재 도구 관측이며, 위 Apple 문서는 이 반환값의 의미나 원인을 설명하지 않는다. 이를 근거로 엔진 실행 실패/성공, 앱의 접근성 오류를 단정하지 않는다. 스위치 on과 Utility 정상 실행·Show caption panel 체크만으로는 읽기 순서·설명·상태 알림 관측을 완료한 것이 아니다. 실제 대상 화면의 자막/음성 출력이 확보되지 않으면 5.2.4의 미관측 상태를 유지한다.

추가 권한 부여, 프로세스 종료/실행, 설정 파일 직접 변경, 재시작, 접근 제한 우회는 이 제안에 포함하지 않는다. 정상 UI에서 결과가 확인되지 않으면 해당 관측 한계를 남기고 다른 승인된 검증을 계속한다.
