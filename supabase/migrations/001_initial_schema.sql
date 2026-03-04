-- Streak & XP Tracker – initial schema
-- Run this in the Supabase SQL editor (or use the Supabase CLI with `supabase db push`).

-- ─── Skills ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skills (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  total_xp      NUMERIC(10, 1) NOT NULL DEFAULT 0,
  longest_streak INTEGER    NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Skill History ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skill_history (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id   UUID        NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  date       DATE        NOT NULL,
  xp         NUMERIC(10, 1) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (skill_id, date)
);

-- ─── Row Level Security ────────────────────────────────────────────────────

ALTER TABLE skills        ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_history ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own skills
CREATE POLICY "skills: owner access"
  ON skills
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only read/write history that belongs to their own skills
CREATE POLICY "skill_history: owner access"
  ON skill_history
  FOR ALL
  USING  (skill_id IN (SELECT id FROM skills WHERE user_id = auth.uid()))
  WITH CHECK (skill_id IN (SELECT id FROM skills WHERE user_id = auth.uid()));
