# g2 MVP 진행사항 정리 및 일지

## 목표
사용자 입장에서 **문제 해결**, **도움**, **압도적 사용 편의성**을 높이기 위해 리뷰 화면과 비교 정보를 강화했습니다.

## 이번 작업 요약

### 1) 리뷰 정보 확장
- 리뷰 총점(100점)과 세부 항목(기능, UI/UX, 에러/안정성, 쾌적도, 가격 합리성) 표시 추가
- 한줄 총평 섹션 추가

### 2) 툴 비교 정보 강화
- 비슷한 도구 대비 "여기서는 되고 저기선 안되는" 핵심 비교표 추가
- 대안 도구 기준으로 강점/약점 문장 제공

### 3) 패치/에러 변경사항 기록
- 굵직한 패치 변경과 에러 리스크를 기록할 수 있는 섹션 추가
- 회사 담당자가 직접 입력 가능한 로컬 저장 방식의 기록 폼 제공

### 4) 실무 사용 추천
- 실제 업무에서 어떻게 사용하는지, 어떤 방식이 효과적인지 가이드(플레이북) 섹션 추가

### 5) 사용자 입력 리뷰
- 한줄 평 + 상세 리뷰를 저장할 수 있는 입력 UI 추가
- 개인 브라우저 기준으로 즉시 저장되는 방식(localStorage)

## 변경된 주요 파일
- `app/tools/[id]/page.tsx`
- `lib/insights.ts`
- `components/ScoreBreakdownCard.tsx`
- `components/CapabilityComparisonTable.tsx`
- `components/PatchNotesSection.tsx`
- `components/WorkUsageGuide.tsx`
- `components/OneLineReviewForm.tsx`
- `app/globals.css`

## 확인/테스트 현황
- 코드 구조 및 연결 관계 점검 완료
- 외부 패키지 설치가 막혀 있어 실행/자동테스트는 환경 이슈로 미완료

## 이어서 개발한 내용 (Phase 1 시작)

### 1) 서버 저장형 리뷰 API
- `GET /api/tool/:id/reviews`
- `POST /api/tool/:id/reviews`
- 기존 localStorage 리뷰 저장을 서버 API 기반 저장/조회 흐름으로 전환

### 2) 서버 저장형 패치/장애 기록 API
- `GET /api/tool/:id/patches`
- `POST /api/tool/:id/patches`
- 관리자 ID 기반 최소 권한 체크 추가
- 영향도(High/Medium/Low)와 장애 여부를 기록 가능하게 확장

### 3) 감사 로그 최소 단위
- 리뷰/패치 생성 시 audit log 기록
- `GET /api/audit?toolId=`로 관리자 조회 가능

### 4) DB 스키마 확장
- review_scores, user_reviews, patch_updates, capability_matrix, audit_logs 테이블 초안 추가
- `DATABASE_URL`이 있으면 PostgreSQL 저장소를 사용하고, 없으면 로컬 개발/테스트용 in-memory store로 동작
- API 첫 쓰기 시 정적 툴 데이터를 `tools` 테이블에 자동 seed

## 다음 단계 제안
1. 회사별 계정 권한 기반의 실제 서버 저장(DB)으로 전환
2. 패치 변경사항에 버전 태그 및 영향도(High/Med/Low) 추가
3. 비교표를 기능 체크리스트(체크/미지원) 형태로 고도화
4. 리뷰 신뢰도(작성자 역할/팀 규모/사용 기간) 메타데이터 추가
5. 모바일 화면에서 비교표 가독성 최적화
