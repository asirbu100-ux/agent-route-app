-- ============================================================
-- 001_initial_schema.sql
-- Sales Agent Route Control System — initial schema
-- ============================================================

-- ── ENUMS ────────────────────────────────────────────────────
CREATE TYPE route_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE visit_result AS ENUM ('sold', 'not_sold');
CREATE TYPE refusal_reason AS ENUM (
  'expensive',
  'not_needed',
  'no_space',
  'competitor',
  'no_decision_maker',
  'no_stock',
  'other'
);

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('agent', 'manager')),
  phone      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PRODUCTS ─────────────────────────────────────────────────
CREATE TABLE products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  sku        TEXT UNIQUE,
  unit       TEXT NOT NULL DEFAULT 'pcs',
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ROUTES ───────────────────────────────────────────────────
CREATE TABLE routes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id   UUID NOT NULL REFERENCES profiles(id),
  manager_id UUID NOT NULL REFERENCES profiles(id),
  route_date DATE NOT NULL,
  title      TEXT,
  status     route_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, route_date)
);

-- ── ROUTE_POINTS ─────────────────────────────────────────────
CREATE TABLE route_points (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id      UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  address       TEXT NOT NULL,
  contact_name  TEXT,
  contact_phone TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── POINT_PRODUCTS ────────────────────────────────────────────
CREATE TABLE point_products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_point_id UUID NOT NULL REFERENCES route_points(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES products(id),
  target_qty     INT,
  UNIQUE (route_point_id, product_id)
);

-- ── TASKS ────────────────────────────────────────────────────
CREATE TABLE tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_point_id UUID NOT NULL REFERENCES route_points(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  requires_photo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── VISITS ───────────────────────────────────────────────────
CREATE TABLE visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_point_id  UUID NOT NULL REFERENCES route_points(id) UNIQUE,
  agent_id        UUID NOT NULL REFERENCES profiles(id),
  result          visit_result,
  refusal_reason  refusal_reason,
  refusal_comment TEXT,
  agent_comment   TEXT,
  arrived_at      TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── VISIT_PRODUCTS ────────────────────────────────────────────
CREATE TABLE visit_products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id   UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL CHECK (quantity > 0),
  UNIQUE (visit_id, product_id)
);

-- ── VISIT_PHOTOS ─────────────────────────────────────────────
CREATE TABLE visit_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id     UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  task_id      UUID REFERENCES tasks(id),
  storage_path TEXT NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_routes_agent_date ON routes (agent_id, route_date);
CREATE INDEX idx_route_points_route ON route_points (route_id);
CREATE INDEX idx_visits_route_point ON visits (route_point_id);
CREATE INDEX idx_visits_agent ON visits (agent_id);
CREATE INDEX idx_visit_photos_visit ON visit_photos (visit_id);

-- ── ATOMIC SUBMIT FUNCTION ───────────────────────────────────
CREATE OR REPLACE FUNCTION submit_visit(
  p_visit_id        UUID,
  p_result          visit_result,
  p_refusal_reason  refusal_reason,
  p_refusal_comment TEXT,
  p_agent_comment   TEXT,
  p_products        JSONB  -- [{product_id, quantity}]
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the visit record (only if it belongs to current user and is open)
  UPDATE visits SET
    result          = p_result,
    refusal_reason  = p_refusal_reason,
    refusal_comment = p_refusal_comment,
    agent_comment   = p_agent_comment,
    submitted_at    = NOW(),
    updated_at      = NOW()
  WHERE id = p_visit_id
    AND agent_id = auth.uid()
    AND submitted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Visit not found, already submitted, or access denied';
  END IF;

  -- Remove existing visit_products (idempotent)
  DELETE FROM visit_products WHERE visit_id = p_visit_id;

  -- Insert sold products (only when result = 'sold')
  IF p_result = 'sold' AND p_products IS NOT NULL THEN
    INSERT INTO visit_products (visit_id, product_id, quantity)
    SELECT
      p_visit_id,
      (elem->>'product_id')::UUID,
      (elem->>'quantity')::INT
    FROM jsonb_array_elements(p_products) AS elem;
  END IF;
END;
$$;

-- ── JWT CUSTOM CLAIMS HOOK ───────────────────────────────────
-- Attach this function in Supabase Dashboard:
-- Authentication → Hooks → Custom Access Token Hook → select this function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims     JSONB;
  user_role  TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = (event->>'user_id')::UUID;
  claims := event->'claims';
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  END IF;
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
