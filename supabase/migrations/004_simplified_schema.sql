-- ============================================================
-- 004_simplified_schema.sql
-- MVP: agents visit clients by day, mark products, take photos
-- ============================================================

-- ── DROP OLD TABLES ─────────────────────────────────────────
DROP TABLE IF EXISTS visit_photos CASCADE;
DROP TABLE IF EXISTS visit_products CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS point_products CASCADE;
DROP TABLE IF EXISTS route_points CASCADE;
DROP TABLE IF EXISTS routes CASCADE;

DROP TYPE IF EXISTS route_status;
DROP TYPE IF EXISTS visit_result;
DROP TYPE IF EXISTS refusal_reason;
DROP FUNCTION IF EXISTS submit_visit;

-- ── CLIENTS ─────────────────────────────────────────────────
CREATE TABLE clients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  agent_id   UUID NOT NULL REFERENCES profiles(id),
  visit_day  INT NOT NULL CHECK (visit_day BETWEEN 1 AND 5),
  address    TEXT,
  phone      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CLIENT_PRODUCTS ─────────────────────────────────────────
CREATE TABLE client_products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, product_id)
);

-- ── WORK_DAYS ───────────────────────────────────────────────
-- Agent starts/finishes their work day
CREATE TABLE work_days (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES profiles(id),
  work_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  UNIQUE (agent_id, work_date)
);

-- ── CLIENT_VISITS ───────────────────────────────────────────
-- One visit per client per work day. Photo required to complete.
CREATE TABLE client_visits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_day_id  UUID NOT NULL REFERENCES work_days(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES clients(id),
  photo_path   TEXT,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (work_day_id, client_id)
);

-- ── VISIT_ITEMS ─────────────────────────────────────────────
-- Result per product: sold or not sold (with optional reason)
CREATE TABLE visit_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_visit_id   UUID NOT NULL REFERENCES client_visits(id) ON DELETE CASCADE,
  client_product_id UUID NOT NULL REFERENCES client_products(id),
  is_sold           BOOLEAN NOT NULL,
  refusal_reason    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_visit_id, client_product_id)
);

-- ── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_clients_agent_day ON clients (agent_id, visit_day);
CREATE INDEX idx_client_products_client ON client_products (client_id);
CREATE INDEX idx_work_days_agent_date ON work_days (agent_id, work_date);
CREATE INDEX idx_client_visits_work_day ON client_visits (work_day_id);
CREATE INDEX idx_visit_items_visit ON visit_items (client_visit_id);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_days       ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_visits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_items     ENABLE ROW LEVEL SECURITY;

-- Clients
CREATE POLICY "clients_select" ON clients
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR auth_role() = 'manager');

CREATE POLICY "clients_manager_insert" ON clients
  FOR INSERT TO authenticated WITH CHECK (auth_role() = 'manager');

CREATE POLICY "clients_manager_update" ON clients
  FOR UPDATE TO authenticated USING (auth_role() = 'manager');

-- Client products
CREATE POLICY "client_products_select" ON client_products
  FOR SELECT TO authenticated
  USING (
    auth_role() = 'manager'
    OR EXISTS (SELECT 1 FROM clients WHERE clients.id = client_products.client_id AND clients.agent_id = auth.uid())
  );

CREATE POLICY "client_products_manager_write" ON client_products
  FOR ALL TO authenticated USING (auth_role() = 'manager') WITH CHECK (auth_role() = 'manager');

-- Work days
CREATE POLICY "work_days_select" ON work_days
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR auth_role() = 'manager');

CREATE POLICY "work_days_agent_insert" ON work_days
  FOR INSERT TO authenticated WITH CHECK (agent_id = auth.uid());

CREATE POLICY "work_days_agent_update" ON work_days
  FOR UPDATE TO authenticated USING (agent_id = auth.uid());

-- Client visits
CREATE POLICY "client_visits_select" ON client_visits
  FOR SELECT TO authenticated
  USING (
    auth_role() = 'manager'
    OR EXISTS (SELECT 1 FROM work_days WHERE work_days.id = client_visits.work_day_id AND work_days.agent_id = auth.uid())
  );

CREATE POLICY "client_visits_agent_insert" ON client_visits
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM work_days WHERE work_days.id = client_visits.work_day_id AND work_days.agent_id = auth.uid()));

CREATE POLICY "client_visits_agent_update" ON client_visits
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM work_days WHERE work_days.id = client_visits.work_day_id AND work_days.agent_id = auth.uid()));

-- Visit items
CREATE POLICY "visit_items_select" ON visit_items
  FOR SELECT TO authenticated
  USING (
    auth_role() = 'manager'
    OR EXISTS (
      SELECT 1 FROM client_visits cv
      JOIN work_days wd ON wd.id = cv.work_day_id
      WHERE cv.id = visit_items.client_visit_id AND wd.agent_id = auth.uid()
    )
  );

CREATE POLICY "visit_items_agent_insert" ON visit_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_visits cv
      JOIN work_days wd ON wd.id = cv.work_day_id
      WHERE cv.id = visit_items.client_visit_id AND wd.agent_id = auth.uid()
    )
  );

-- ── STORAGE: visit photos ───────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-photos', 'visit-photos', FALSE)
ON CONFLICT (id) DO NOTHING;
