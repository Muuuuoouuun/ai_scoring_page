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
