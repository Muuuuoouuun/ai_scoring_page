CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_contexts TEXT[] NOT NULL,
  why_exist TEXT NOT NULL,
  impact JSONB NOT NULL,
  best_case TEXT NOT NULL,
  worst_case TEXT NOT NULL,
  verdict_badges JSONB NOT NULL,
  alternatives TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX tools_problem_contexts_idx ON tools USING GIN (problem_contexts);
CREATE INDEX tools_name_idx ON tools (name);

-- [NEW] Phase 1 Database Expansion
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic Mock Data for MVP
INSERT INTO users (id, email, nickname, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@aisite.com', 'Admin User', 'admin'),
('00000000-0000-0000-0000-000000000002', 'test@user.com', 'Test User', 'user');

-- ============================================================================
-- 커뮤니티 (P1)
--
-- lib/community/store.ts 의 CommunityStore 인터페이스에 대응하는 스키마입니다.
-- 현재 앱은 메모리 어댑터로 동작하며, 이 스키마로 Postgres 어댑터를 구현하면
-- 화면·API 코드는 그대로 두고 저장소만 교체할 수 있습니다.
-- ============================================================================

-- 로그인 없는 익명 저자. 토큰 원본은 저장하지 않고 해시만 둡니다.
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_hash TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  -- 나중에 이메일/OAuth를 붙일 때 기존 익명 기여를 잃지 않고 계정에 연결하기 위한 자리.
  claimed_user_id UUID REFERENCES users(id),
  work_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기여자의 "위치". 신원이 아니라 어떤 처지에서 쓴 글인지를 받습니다.
-- 전부 선택지형이라 필터·분해·집계가 가능합니다. 자유 입력이면 셋 다 불가능합니다.
CREATE TYPE contributor_role AS ENUM ('practitioner','team-lead','decision-maker','admin','solo');
-- 리뷰의 teamFit 구간과 동일하게 둡니다. 두 벌이면 기여자 응답과 적합도 판정을 대조할 수 없습니다.
CREATE TYPE team_size_bucket AS ENUM ('1-5','6-30','30+');
CREATE TYPE usage_duration AS ENUM ('evaluated-only','under-1m','1-6m','6m-2y','2y+');

CREATE TYPE dissent_direction AS ENUM ('agree','too-low','too-high');
CREATE TYPE score_facet AS ENUM ('functionality','uiux','reliability','comfort','pricing');

-- 항목별 반박. 에디터가 매긴 점수에 사용자가 이의를 답니다.
CREATE TABLE facet_dissent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  facet score_facet NOT NULL,
  direction dissent_direction NOT NULL,
  -- 동의가 아닌 경우 근거를 요구합니다. 에디터에게 강제한 규칙을 사용자에게도 적용합니다.
  reason TEXT NOT NULL DEFAULT '',
  is_editor BOOLEAN NOT NULL DEFAULT FALSE,
  role contributor_role,
  team_size team_size_bucket,
  duration usage_duration,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT dissent_needs_reason CHECK (direction = 'agree' OR char_length(reason) >= 20),
  -- 한 사람이 같은 항목에 여러 번 표를 던지지 못하게 합니다.
  UNIQUE (tool_id, author_id, facet)
);

CREATE INDEX facet_dissent_tool_idx ON facet_dissent (tool_id, facet);

CREATE TYPE decision_outcome AS ENUM ('still-using','reduced','stopped');

-- 도입 결정 기록. 별점보다 정보량이 많은 이 제품의 핵심 커뮤니티 자산입니다.
CREATE TABLE decision_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  considered_alternatives TEXT[] NOT NULL DEFAULT '{}',
  why_chosen TEXT NOT NULL,
  adopted_at TEXT NOT NULL,          -- 'YYYY-MM'
  outcome decision_outcome NOT NULL,
  is_editor BOOLEAN NOT NULL DEFAULT FALSE,
  role contributor_role,
  team_size team_size_bucket,
  duration usage_duration,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 마지막으로 "지금도 쓰나요"에 답한 시점. 6개월 넘게 미확인이면 집계에서 제외합니다.
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX decision_records_tool_idx ON decision_records (tool_id);
CREATE INDEX decision_records_stale_idx ON decision_records (checked_at);

CREATE TYPE breakage_status AS ENUM ('pending','published','rejected');

-- 고장 제보. 검수를 거쳐 patch_updates 로 승격되며 제보자 크레딧이 붙습니다.
CREATE TABLE breakage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  occurred_at TEXT NOT NULL,         -- 'YYYY-MM'
  what_broke TEXT NOT NULL,
  workaround TEXT NOT NULL DEFAULT '',
  status breakage_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX breakage_reports_tool_idx ON breakage_reports (tool_id, status);

-- 표본이 3 미만이면 집계를 만들지 않습니다.
-- "4.5점(2명)"은 거짓말에 가깝습니다. 이 규칙을 UI 관례가 아니라 뷰에 박아둡니다.
CREATE VIEW facet_consensus AS
SELECT
  tool_id,
  facet,
  COUNT(*) FILTER (WHERE NOT is_editor AND role IS NOT NULL) AS sample_size,
  CASE
    WHEN COUNT(*) FILTER (WHERE NOT is_editor AND role IS NOT NULL) >= 3
    THEN COUNT(*) FILTER (WHERE direction = 'agree' AND NOT is_editor AND role IS NOT NULL)
    ELSE NULL
  END AS agree_count,
  CASE
    WHEN COUNT(*) FILTER (WHERE NOT is_editor AND role IS NOT NULL) >= 3
    THEN COUNT(*) FILTER (WHERE direction = 'too-low' AND NOT is_editor AND role IS NOT NULL)
    ELSE NULL
  END AS too_low_count,
  CASE
    WHEN COUNT(*) FILTER (WHERE NOT is_editor AND role IS NOT NULL) >= 3
    THEN COUNT(*) FILTER (WHERE direction = 'too-high' AND NOT is_editor AND role IS NOT NULL)
    ELSE NULL
  END AS too_high_count
FROM facet_dissent
GROUP BY tool_id, facet;
