**CI·보안 브랜치 검토 — 2026-09-11**

대상 저장소: [Muuuuoouuun/ai_scoring_page](https://github.com/Muuuuoouuun/ai_scoring_page). 두 PR은 검토 시점에 모두 열려 있으며 미병합 상태다. 로컬 작업 폴더에는 Git의 HEAD·config 등이 없어 `/private/tmp/ai-score-branch-review-20260911`에 별도로 복제해 확인했다.

| 대상 | 확인한 커밋 | 변경 범위 | 검증 결과 |
|---|---|---|---|
| [claude/add-ci-workflow — PR #3](https://github.com/Muuuuoouuun/ai_scoring_page/pull/3) | `0254a8b4c082025805cec02b32c86545474da7ba` | `.github/workflows/ci.yml` 한 파일 | 실제 GitHub Actions에서 설치·타입체크·API 테스트 5개·빌드 통과 |
| [claude/security-next-14-2-35 — PR #4](https://github.com/Muuuuoouuun/ai_scoring_page/pull/4) | `b41ce15536a5a0c81d835f1702b85953fade9b1e` | Next 14.1.0→14.2.35, Vitest 1.2.0→1.6.1, lock 갱신, next-env 주석 변경 | 별도 복제본에서 설치·타입체크·API 테스트 5개·빌드 통과 |

공통 기준 main은 `9c9fbbcdbc7b8dc80d9c9b435d503bfe46ad3e2c`다. 두 브랜치 사이의 merge-tree 검사는 충돌 없이 완료됐다. 변경한 애플리케이션 로직은 없고, 검토·실행한 범위에서는 새 기능 회귀를 발견하지 못했다. 브라우저 시각 검증이나 실제 배포 환경 보안 검증을 수행한 결과는 아니다.

**보안 업데이트는 유효한 부분 패치지만 보안 정비 완료로 판단할 수 없다.** 이번 검토에서 `npm audit`가 보고한 취약 패키지는 총 6개다. 패키지 하나에 여러 advisory가 연결될 수 있으므로 아래 숫자는 개별 취약점 총수가 아니다.

| 심각도 | 패키지 |
|---|---|
| Critical 2 | next, vitest |
| High 2 | postcss, vite |
| Moderate 2 | esbuild, vite-node |

PR 본문에는 critical 1·high 3·moderate 2로 적혀 있어 현재 결과로 갱신해야 한다. 원본 감사 결과는 이 작업 폴더의 `docs/evidence/2026-09-11-security-audit.json`에 보관했다. 감사 명령의 종료 코드 1은 취약점 발견에 따른 결과다.

Next 14는 공식 지원 대상에서 제외되어 있다. PR #4를 작은 호환성 패치로 반영하는 것은 가능하지만, 지원되는 버전으로의 마이그레이션과 배포 조건별 노출 판단을 별도로 진행해야 한다. `npm audit fix --force`의 추천 버전은 이번에 시험한 업그레이드 결과가 아니다. [Next.js 지원 정책](https://nextjs.org/support-policy).

이번 감사에서 Next에 연결된 critical 항목에는 Windows 파일시스템의 서버 조건과 AVIF 이미지 최적화 조건이 있다. 실제 서버 OS와 배포 구성을 확인하지 않았으므로 현재 서비스가 곧바로 악용 가능하다고 단정하지 않는다. Vitest의 남은 critical은 UI 서버 조건이며, 검토한 스크립트는 `vitest run`, 설정에는 API/UI 서버 활성화가 없다. [Next Windows 관련 공식 공지](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36), [Next AVIF 관련 공식 공지](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), [Vitest 공식 공지](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp).

**CI 자동 실행은 확인했지만 병합 차단은 설정되어 있지 않다.** 현재 main의 `protected`는 false, required status checks는 비어 있고 저장소 rulesets 조회도 빈 배열이다. 따라서 PR #3을 병합하는 것만으로 실패한 변경의 병합이나 main 직접 push를 막지는 못한다. 검사를 필수로 만들려면 main 보호 규칙 또는 ruleset에 PR 경유·필수 CI 검사를 설정해야 한다.

워크플로 자체는 main 대상 pull_request와 main push에서 Node 22로 `npm ci → npx tsc --noEmit → npm test → npm run build`를 실행한다. contents 읽기 권한과 이전 실행 취소 설정이 있다. ESLint 설정·의존성이 없는 현재 코드에서 별도 lint 단계를 생략한 것은 확인한 범위에 맞는다. [실제 CI 실행](https://github.com/Muuuuoouuun/ai_scoring_page/actions/runs/33485361194).

**PR 설명과 코드 주석의 일부는 실제 대상 코드보다 앞서 있다.** PR #3의 워크플로 40~46행은 문장 재사용·표본 3 미만 평균·리뷰 없는 도구 거부를 검사한다고 설명한다. 하지만 이 브랜치에는 `tests/api.test.ts`의 API 테스트 5개만 있고, `tests/review-integrity.test.ts`나 `lib/community/consensus.ts`는 없다. `data/tools.ts`도 정적 목록이며 해당 빌드 거부 검사가 없다. 관련 파일은 별도 PR #2에 있다. 현재 검증 범위와 #2 반영 후의 범위를 구분해 설명해야 한다.

PR #4의 ‘App Router이므로 Middleware 인가 우회에 직접 해당’이라는 설명도 수정이 필요하다. 해당 advisory는 middleware에서 인가 검사를 하는 조건이며, 이번 대상 트리에는 middleware 파일이 없다. 패치 버전으로 올리는 가치는 있지만, 취약 버전 의존성과 실제 노출 조건은 구분해야 한다. [인가 우회 공식 공지](https://github.com/advisories/GHSA-f82v-jwr5-mffw).

**병합 순서는 CI → 보안 업데이트 → 리팩터 검증을 권장한다.** 두 요청 브랜치 사이에는 충돌이 없다. 다만 [리팩터 PR #2](https://github.com/Muuuuoouuun/ai_scoring_page/pull/2)의 현재 커밋 `1c86ebbf204502510232f933b8decedb451b2256`과 보안 브랜치의 merge-tree 검사에서는 `package.json`과 `package-lock.json` 모두 충돌한다. PR 설명에 적힌 lock 충돌만으로 범위를 한정하면 안 된다.

PR #2를 통합할 때는 보안 버전과 #2의 pg 의존성·DB 스크립트를 함께 보존한 뒤 lock을 갱신하고 전체 검증을 다시 실행해야 한다. DB 테스트는 Postgres 서비스와 DATABASE_URL 설정을 갖춘 별도 CI 단계로 검증해야 한다. PR #2 전체의 기능 정확성은 이번 두 브랜치 검토의 범위가 아니다.

**검증 근거와 한계:** PR #3은 2026-09-01 실행된 GitHub Actions의 해당 커밋에서 모든 단계가 성공했고 5개 테스트·10개 라우트 빌드를 로그로 확인했다. PR #4는 검토 시점에 GitHub Actions 실행 기록이 0개이며, 이번에 macOS·Node 24.18.0·npm 11.16.0에서 `npm ci`, `npx --no-install tsc --noEmit`, `npm test`, `NEXT_TELEMETRY_DISABLED=1 npm run build`를 실행해 모두 종료 코드 0을 확인했다. 로컬 런타임은 CI의 Node 22와 다르므로, #3 반영 후 #4의 실제 CI 결과도 확인해야 한다.

양쪽 diff의 공백 오류 검사와 보안 브랜치의 추적 파일 무변경 상태를 확인했다. 검토 과정에서 생성된 tsconfig.tsbuildinfo는 임시 복제본에만 있다. main 보호 설정 변경, 원격 파일 수정, PR 병합은 수행하지 않았다.
