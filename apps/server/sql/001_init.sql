CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE SCHEMA IF NOT EXISTS mongbori;

CREATE TABLE IF NOT EXISTS mongbori.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mongbori.runs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES mongbori.users(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  height INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  obstacles_avoided INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS runs_leaderboard_idx
  ON mongbori.runs (difficulty, score DESC, height DESC, created_at DESC);
