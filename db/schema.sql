CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  genres TEXT[] NOT NULL DEFAULT '{}',
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
CREATE INDEX tools_genres_idx ON tools USING GIN (genres);
CREATE INDEX tools_name_idx ON tools (name);

-- [NEW] Phase 1 Database Expansion
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic Mock Data for MVP
INSERT INTO users (id, email, nickname, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@aisite.com', 'Admin User', 'admin'),
('00000000-0000-0000-0000-000000000002', 'test@user.com', 'Test User', 'user');

CREATE TABLE review_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 100),
  score_breakdown JSONB NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (tool_id)
);

CREATE TABLE user_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  line TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  reviewer_role TEXT,
  team_size TEXT,
  usage_period TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX user_reviews_tool_id_idx ON user_reviews (tool_id, created_at DESC);

CREATE TABLE patch_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  change TEXT NOT NULL,
  error_risk TEXT NOT NULL,
  impact TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high')),
  has_incident BOOLEAN NOT NULL DEFAULT FALSE,
  patch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX patch_updates_tool_id_idx ON patch_updates (tool_id, patch_date DESC);

CREATE TABLE capability_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  competitor TEXT NOT NULL,
  capability TEXT NOT NULL,
  support_level TEXT NOT NULL CHECK (support_level IN ('supported', 'partial', 'unsupported')),
  evidence TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX capability_matrix_tool_id_idx ON capability_matrix (tool_id, competitor);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('user', 'admin')),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  changes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX audit_logs_tool_id_idx ON audit_logs (tool_id, created_at DESC);
CREATE INDEX audit_logs_resource_idx ON audit_logs (resource_type, resource_id);
