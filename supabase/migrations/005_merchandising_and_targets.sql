-- ============================================================
-- 005: Merchandising checklist + targets + scoring
-- ============================================================

-- ── MERCHANDISING TASKS per visit ───────────────────────────
-- Checklist: facing, display, POSM, photo before/after
ALTER TABLE client_visits ADD COLUMN IF NOT EXISTS photo_before TEXT;
ALTER TABLE client_visits ADD COLUMN IF NOT EXISTS merch_score INT DEFAULT 0;
ALTER TABLE client_visits ADD COLUMN IF NOT EXISTS merch_notes TEXT;

-- Merchandising checklist items per visit
CREATE TABLE IF NOT EXISTS merch_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_visit_id UUID NOT NULL REFERENCES client_visits(id) ON DELETE CASCADE,
  task_type       TEXT NOT NULL, -- 'facing', 'display', 'posm', 'price', 'shelf_share'
  task_label      TEXT NOT NULL,
  is_done         BOOLEAN NOT NULL DEFAULT FALSE,
  score           INT NOT NULL DEFAULT 0,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merch_items_visit ON merch_items (client_visit_id);

ALTER TABLE merch_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merch_items_select" ON merch_items FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM client_visits cv JOIN work_days wd ON wd.id = cv.work_day_id
            WHERE cv.id = merch_items.client_visit_id AND (wd.agent_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'))
  );

CREATE POLICY "merch_items_agent_insert" ON merch_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM client_visits cv JOIN work_days wd ON wd.id = cv.work_day_id
            WHERE cv.id = merch_items.client_visit_id AND wd.agent_id = auth.uid())
  );

CREATE POLICY "merch_items_agent_update" ON merch_items FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM client_visits cv JOIN work_days wd ON wd.id = cv.work_day_id
            WHERE cv.id = merch_items.client_visit_id AND wd.agent_id = auth.uid())
  );

-- ── PRODUCT PRIORITY (manager sets mandatory/optional) ──────
ALTER TABLE client_products ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
  CHECK (priority IN ('must', 'normal'));
ALTER TABLE client_products ADD COLUMN IF NOT EXISTS target_qty INT DEFAULT 0;
