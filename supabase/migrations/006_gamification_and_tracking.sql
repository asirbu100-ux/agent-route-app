-- ============================================================
-- 006: GPS tracking, visit timer, gamification
-- ============================================================

-- Visit tracking: GPS + timer
ALTER TABLE client_visits ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE client_visits ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE client_visits ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE client_visits ADD COLUMN IF NOT EXISTS duration_min INT;

-- Agent stats for gamification
CREATE TABLE IF NOT EXISTS agent_stats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES profiles(id) UNIQUE,
  total_visits INT NOT NULL DEFAULT 0,
  total_sold   INT NOT NULL DEFAULT 0,
  total_refused INT NOT NULL DEFAULT 0,
  streak_days  INT NOT NULL DEFAULT 0,
  best_streak  INT NOT NULL DEFAULT 0,
  points       INT NOT NULL DEFAULT 0,
  last_work_date DATE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE agent_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_stats_select" ON agent_stats FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "agent_stats_update" ON agent_stats FOR UPDATE TO authenticated USING (agent_id = auth.uid());
CREATE POLICY "agent_stats_insert" ON agent_stats FOR INSERT TO authenticated WITH CHECK (agent_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_agent_stats_points ON agent_stats (points DESC);
