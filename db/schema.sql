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

-- [Phase 1] User Reviews
CREATE TABLE user_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id TEXT NOT NULL,
  nickname TEXT NOT NULL DEFAULT 'Anonymous',
  line TEXT NOT NULL,
  detail TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX user_reviews_tool_id_idx ON user_reviews (tool_id);
CREATE INDEX user_reviews_created_at_idx ON user_reviews (created_at DESC);

-- [Phase 1] Patch Updates (admin only)
CREATE TABLE patch_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id TEXT NOT NULL,
  title TEXT NOT NULL,
  change TEXT NOT NULL,
  error_risk TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  patch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX patch_updates_tool_id_idx ON patch_updates (tool_id);

-- [Phase 1] Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,   -- 'CREATE_REVIEW' | 'CREATE_PATCH_NOTE'
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX audit_logs_actor_id_idx ON audit_logs (actor_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at DESC);
