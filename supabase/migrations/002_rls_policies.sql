-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_points   ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_photos   ENABLE ROW LEVEL SECURITY;

-- ── HELPER: role check ────────────────────────────────────────
-- Reads user_role from JWT claim (set by custom_access_token_hook)
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$ SELECT (auth.jwt() ->> 'user_role') $$;

-- ── PROFILES ─────────────────────────────────────────────────
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE POLICY "products_select_all" ON products
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "products_manager_insert" ON products
  FOR INSERT TO authenticated WITH CHECK (auth_role() = 'manager');

CREATE POLICY "products_manager_update" ON products
  FOR UPDATE TO authenticated USING (auth_role() = 'manager');

-- ── ROUTES ───────────────────────────────────────────────────
CREATE POLICY "routes_agent_select_own" ON routes
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR auth_role() = 'manager');

CREATE POLICY "routes_manager_insert" ON routes
  FOR INSERT TO authenticated WITH CHECK (auth_role() = 'manager');

CREATE POLICY "routes_manager_update" ON routes
  FOR UPDATE TO authenticated USING (auth_role() = 'manager');

-- ── ROUTE_POINTS ─────────────────────────────────────────────
CREATE POLICY "route_points_agent_select" ON route_points
  FOR SELECT TO authenticated
  USING (
    auth_role() = 'manager'
    OR EXISTS (
      SELECT 1 FROM routes
      WHERE routes.id = route_points.route_id
        AND routes.agent_id = auth.uid()
    )
  );

CREATE POLICY "route_points_manager_insert" ON route_points
  FOR INSERT TO authenticated WITH CHECK (auth_role() = 'manager');

CREATE POLICY "route_points_manager_update" ON route_points
  FOR UPDATE TO authenticated USING (auth_role() = 'manager');

CREATE POLICY "route_points_manager_delete" ON route_points
  FOR DELETE TO authenticated USING (auth_role() = 'manager');

-- ── POINT_PRODUCTS ───────────────────────────────────────────
CREATE POLICY "point_products_select" ON point_products
  FOR SELECT TO authenticated
  USING (
    auth_role() = 'manager'
    OR EXISTS (
      SELECT 1 FROM route_points rp
      JOIN routes r ON r.id = rp.route_id
      WHERE rp.id = point_products.route_point_id
        AND r.agent_id = auth.uid()
    )
  );

CREATE POLICY "point_products_manager_write" ON point_products
  FOR ALL TO authenticated USING (auth_role() = 'manager')
  WITH CHECK (auth_role() = 'manager');

-- ── TASKS ────────────────────────────────────────────────────
CREATE POLICY "tasks_select" ON tasks
  FOR SELECT TO authenticated
  USING (
    auth_role() = 'manager'
    OR EXISTS (
      SELECT 1 FROM route_points rp
      JOIN routes r ON r.id = rp.route_id
      WHERE rp.id = tasks.route_point_id
        AND r.agent_id = auth.uid()
    )
  );

CREATE POLICY "tasks_manager_write" ON tasks
  FOR ALL TO authenticated USING (auth_role() = 'manager')
  WITH CHECK (auth_role() = 'manager');

-- ── VISITS ───────────────────────────────────────────────────
CREATE POLICY "visits_agent_select_own" ON visits
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid() OR auth_role() = 'manager');

CREATE POLICY "visits_agent_insert_own" ON visits
  FOR INSERT TO authenticated WITH CHECK (agent_id = auth.uid());

CREATE POLICY "visits_agent_update_own" ON visits
  FOR UPDATE TO authenticated USING (agent_id = auth.uid());

-- ── VISIT_PRODUCTS ────────────────────────────────────────────
CREATE POLICY "visit_products_select" ON visit_products
  FOR SELECT TO authenticated
  USING (
    auth_role() = 'manager'
    OR EXISTS (
      SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id
        AND visits.agent_id = auth.uid()
    )
  );

CREATE POLICY "visit_products_agent_write" ON visit_products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id
        AND visits.agent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id
        AND visits.agent_id = auth.uid()
    )
  );

-- ── VISIT_PHOTOS ─────────────────────────────────────────────
CREATE POLICY "visit_photos_select" ON visit_photos
  FOR SELECT TO authenticated
  USING (
    auth_role() = 'manager'
    OR EXISTS (
      SELECT 1 FROM visits WHERE visits.id = visit_photos.visit_id
        AND visits.agent_id = auth.uid()
    )
  );

CREATE POLICY "visit_photos_agent_insert" ON visit_photos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visits WHERE visits.id = visit_photos.visit_id
        AND visits.agent_id = auth.uid()
    )
  );

CREATE POLICY "visit_photos_agent_delete" ON visit_photos
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits WHERE visits.id = visit_photos.visit_id
        AND visits.agent_id = auth.uid()
    )
  );
