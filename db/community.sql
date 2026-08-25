-- ============================================================================
-- 커뮤니티 스키마
--
-- lib/community/store.ts 의 CommunityStore 인터페이스에 대응합니다.
-- lib/community/postgres-store.ts 가 이 스키마를 사용하고,
-- tests/community-store.test.ts 가 메모리 구현과 같은 테스트를 여기에도 돌립니다.
--
-- 적용:
--   psql "$DATABASE_URL" -f db/community.sql
-- 여러 번 실행해도 안전합니다.
--
-- ── tool_id 에 외래키를 걸지 않는 이유 ──────────────────────────────────────
-- 도구와 리뷰 본문은 코드(data/tools.ts, data/reviews.ts)가 진실의 출처입니다.
-- 에디터가 git으로 관리하고 빌드 시점에 검증됩니다.
-- DB가 소유하는 건 사용자 기여뿐이므로, tools 테이블을 만들어 이중 관리하는 대신
-- tool_id 를 검증 없는 UUID로 둡니다. 존재 여부는 API 계층에서 확인합니다
-- (app/api/tools/[id]/*/route.ts 의 getToolById 검사).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 로그인 없는 익명 저자. 토큰 원본은 저장하지 않고 해시만 둡니다.
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_hash TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  -- 나중에 이메일/OAuth를 붙일 때 기존 익명 기여를 잃지 않고 계정에 연결하기 위한 자리.
  claimed_user_id UUID,
  work_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 기여자의 "위치". 신원이 아니라 어떤 처지에서 쓴 글인지를 받습니다.
-- 전부 선택지형이라 필터·분해·집계가 가능합니다. 자유 입력이면 셋 다 불가능합니다.
DO $$ BEGIN
  CREATE TYPE contributor_role AS ENUM ('practitioner','team-lead','decision-maker','admin','solo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 리뷰의 teamFit 구간과 동일하게 둡니다.
-- 두 벌이면 기여자 응답과 적합도 판정을 대조할 수 없습니다.
DO $$ BEGIN
  CREATE TYPE team_size_bucket AS ENUM ('1-5','6-30','30+');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE usage_duration AS ENUM ('evaluated-only','under-1m','1-6m','6m-2y','2y+');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE dissent_direction AS ENUM ('agree','too-low','too-high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE score_facet AS ENUM ('functionality','uiux','reliability','comfort','pricing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE decision_outcome AS ENUM ('still-using','reduced','stopped');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE breakage_status AS ENUM ('pending','published','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 항목별 반박. 에디터가 매긴 점수에 사용자가 이의를 답니다.
CREATE TABLE IF NOT EXISTS facet_dissent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  facet score_facet NOT NULL,
  direction dissent_direction NOT NULL,
  -- 동의가 아닌 경우 근거를 요구합니다. 에디터에게 강제한 규칙을 사용자에게도 적용합니다.
  reason TEXT NOT NULL DEFAULT '',
  is_editor BOOLEAN NOT NULL DEFAULT FALSE,
  role contributor_role,
  team_size team_size_bucket,
  duration usage_duration,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT dissent_needs_reason CHECK (direction = 'agree' OR char_length(reason) >= 20),
  -- 한 사람이 같은 항목에 여러 번 표를 던지지 못하게 합니다.
  CONSTRAINT facet_dissent_one_per_author UNIQUE (tool_id, author_id, facet)
);

CREATE INDEX IF NOT EXISTS facet_dissent_tool_idx ON facet_dissent (tool_id, facet);

-- 도입 결정 기록. 별점보다 정보량이 많은 이 제품의 핵심 커뮤니티 자산입니다.
CREATE TABLE IF NOT EXISTS decision_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  considered_alternatives TEXT[] NOT NULL DEFAULT '{}',
  why_chosen TEXT NOT NULL,
  adopted_at TEXT NOT NULL,          -- 'YYYY-MM'
  outcome decision_outcome NOT NULL,
  is_editor BOOLEAN NOT NULL DEFAULT FALSE,
  role contributor_role,
  team_size team_size_bucket,
  duration usage_duration,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 마지막으로 "지금도 쓰나요"에 답한 시점. 6개월 넘게 미확인이면 집계에서 제외합니다.
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS decision_records_tool_idx ON decision_records (tool_id);
CREATE INDEX IF NOT EXISTS decision_records_stale_idx ON decision_records (checked_at);

-- 고장 제보. 검수를 거쳐 도구의 변경 이력으로 승격되며 제보자 크레딧이 붙습니다.
CREATE TABLE IF NOT EXISTS breakage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  occurred_at TEXT NOT NULL,         -- 'YYYY-MM'
  what_broke TEXT NOT NULL,
  workaround TEXT NOT NULL DEFAULT '',
  status breakage_status NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS breakage_reports_tool_idx ON breakage_reports (tool_id, status);

-- 표본이 3 미만이면 집계를 만들지 않습니다.
-- "4.5점(2명)"은 거짓말에 가깝습니다. 이 규칙을 UI 관례가 아니라 뷰에 박아둡니다.
-- lib/community/consensus.ts 의 MIN_SAMPLE 과 같은 값이어야 합니다.
CREATE OR REPLACE VIEW facet_consensus AS
SELECT
  tool_id,
  facet,
  COUNT(*) FILTER (WHERE NOT is_editor AND role IS NOT NULL) AS sample_size,
  CASE WHEN COUNT(*) FILTER (WHERE NOT is_editor AND role IS NOT NULL) >= 3
       THEN COUNT(*) FILTER (WHERE direction = 'agree' AND NOT is_editor AND role IS NOT NULL)
  END AS agree_count,
  CASE WHEN COUNT(*) FILTER (WHERE NOT is_editor AND role IS NOT NULL) >= 3
       THEN COUNT(*) FILTER (WHERE direction = 'too-low' AND NOT is_editor AND role IS NOT NULL)
  END AS too_low_count,
  CASE WHEN COUNT(*) FILTER (WHERE NOT is_editor AND role IS NOT NULL) >= 3
       THEN COUNT(*) FILTER (WHERE direction = 'too-high' AND NOT is_editor AND role IS NOT NULL)
  END AS too_high_count
FROM facet_dissent
GROUP BY tool_id, facet;
