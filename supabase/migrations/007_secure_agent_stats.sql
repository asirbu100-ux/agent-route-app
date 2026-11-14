-- ============================================================
-- 007: Points & stats are computed by the database
--
-- Before: the app incremented agent_stats from Server Actions and
-- RLS let an agent INSERT/UPDATE their own row → points could be
-- forged with a direct API call. Re-marking a product as "sold"
-- also double-counted total_sold.
--
-- Now: agent_stats is derived from work_days / client_visits /
-- visit_items by triggers (SECURITY DEFINER). Agents can only read.
-- Also: agents can no longer change their own profile role, and
-- work days cannot be back-dated.
-- ============================================================

-- ── 1. agent_stats: read-only for users ─────────────────────
DROP POLICY IF EXISTS "agent_stats_update" ON agent_stats;
DROP POLICY IF EXISTS "agent_stats_insert" ON agent_stats;
REVOKE INSERT, UPDATE, DELETE ON agent_stats FROM anon, authenticated;

-- ── 2. Business-day index (Mon–Fri consecutive, weekend = Friday) ──
-- Friday → Monday counts as consecutive; Sat/Sun map onto Friday.
CREATE OR REPLACE FUNCTION business_day_index(d DATE)
RETURNS INT
LANGUAGE sql IMMUTABLE
AS $$
  -- 2000-01-03 is a Monday
  SELECT ((d - DATE '2000-01-03') / 7) * 5 + LEAST((d - DATE '2000-01-03') % 7, 4)
$$;

-- ── 3. Recalculate stats for one agent from source data ─────
-- Points: 10 per finished day + 5 × streak when the streak is > 1
-- (same formula the app used before).
CREATE OR REPLACE FUNCTION recalc_agent_stats(p_agent UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visits  INT;
  v_sold    INT;
  v_refused INT;
  v_streak  INT := 0;
  v_best    INT := 0;
  v_points  INT := 0;
  v_last    DATE;
BEGIN
  IF p_agent IS NULL THEN RETURN; END IF;

  SELECT COUNT(*) INTO v_visits
  FROM client_visits cv JOIN work_days wd ON wd.id = cv.work_day_id
  WHERE wd.agent_id = p_agent AND cv.completed_at IS NOT NULL;

  SELECT COUNT(*) FILTER (WHERE vi.is_sold), COUNT(*) FILTER (WHERE NOT vi.is_sold)
  INTO v_sold, v_refused
  FROM visit_items vi
  JOIN client_visits cv ON cv.id = vi.client_visit_id
  JOIN work_days wd ON wd.id = cv.work_day_id
  WHERE wd.agent_id = p_agent;

  WITH days AS (
    SELECT work_date, business_day_index(work_date) AS idx
    FROM work_days
    WHERE agent_id = p_agent AND finished_at IS NOT NULL
  ),
  grouped AS (
    SELECT work_date, idx, idx - DENSE_RANK() OVER (ORDER BY idx) AS grp
    FROM days
  ),
  streaks AS (
    -- streak = position of the day inside its run of consecutive business days
    SELECT work_date, idx - MIN(idx) OVER (PARTITION BY grp) + 1 AS streak
    FROM grouped
  )
  SELECT
    COALESCE(SUM(10 + CASE WHEN streak > 1 THEN streak * 5 ELSE 0 END), 0),
    COALESCE(MAX(streak), 0),
    COALESCE((ARRAY_AGG(streak ORDER BY work_date DESC))[1], 0),
    MAX(work_date)
  INTO v_points, v_best, v_streak, v_last
  FROM streaks;

  INSERT INTO agent_stats AS s
    (agent_id, total_visits, total_sold, total_refused, streak_days, best_streak, points, last_work_date, updated_at)
  VALUES
    (p_agent, v_visits, v_sold, v_refused, v_streak, v_best, v_points, v_last, NOW())
  ON CONFLICT (agent_id) DO UPDATE SET
    total_visits   = EXCLUDED.total_visits,
    total_sold     = EXCLUDED.total_sold,
    total_refused  = EXCLUDED.total_refused,
    streak_days    = EXCLUDED.streak_days,
    best_streak    = EXCLUDED.best_streak,
    points         = EXCLUDED.points,
    last_work_date = EXCLUDED.last_work_date,
    updated_at     = NOW();
END;
$$;

REVOKE EXECUTE ON FUNCTION recalc_agent_stats(UUID) FROM PUBLIC, anon, authenticated;

-- ── 4. Triggers that keep stats in sync ─────────────────────
CREATE OR REPLACE FUNCTION trg_stats_from_work_days()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN PERFORM recalc_agent_stats(OLD.agent_id); END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') AND (TG_OP = 'INSERT' OR NEW.agent_id IS DISTINCT FROM OLD.agent_id) THEN
    PERFORM recalc_agent_stats(NEW.agent_id);
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION trg_stats_from_client_visits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM recalc_agent_stats(wd.agent_id)
  FROM work_days wd
  WHERE wd.id IN (
    CASE WHEN TG_OP <> 'INSERT' THEN OLD.work_day_id END,
    CASE WHEN TG_OP <> 'DELETE' THEN NEW.work_day_id END
  );
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION trg_stats_from_visit_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM recalc_agent_stats(wd.agent_id)
  FROM client_visits cv JOIN work_days wd ON wd.id = cv.work_day_id
  WHERE cv.id IN (
    CASE WHEN TG_OP <> 'INSERT' THEN OLD.client_visit_id END,
    CASE WHEN TG_OP <> 'DELETE' THEN NEW.client_visit_id END
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS stats_work_days ON work_days;
CREATE TRIGGER stats_work_days
  AFTER INSERT OR DELETE OR UPDATE OF finished_at, work_date, agent_id ON work_days
  FOR EACH ROW EXECUTE FUNCTION trg_stats_from_work_days();

DROP TRIGGER IF EXISTS stats_client_visits ON client_visits;
CREATE TRIGGER stats_client_visits
  AFTER INSERT OR DELETE OR UPDATE OF completed_at, work_day_id ON client_visits
  FOR EACH ROW EXECUTE FUNCTION trg_stats_from_client_visits();

DROP TRIGGER IF EXISTS stats_visit_items ON visit_items;
CREATE TRIGGER stats_visit_items
  AFTER INSERT OR DELETE OR UPDATE OF is_sold, client_visit_id ON visit_items
  FOR EACH ROW EXECUTE FUNCTION trg_stats_from_visit_items();

-- ── 5. Work days: no back-dating, no editing date/owner ─────
-- Applies only to regular users (JWT role "authenticated");
-- service role / SQL editor can still fix data.
CREATE OR REPLACE FUNCTION trg_guard_work_days()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Europe/Chisinau')::DATE;
BEGIN
  IF COALESCE(auth.role(), '') <> 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.work_date <> v_today THEN
      RAISE EXCEPTION 'Рабочий день можно открыть только на сегодня';
    END IF;
    NEW.started_at := NOW();
    NEW.finished_at := NULL;
  ELSE
    IF NEW.work_date IS DISTINCT FROM OLD.work_date OR NEW.agent_id IS DISTINCT FROM OLD.agent_id
       OR NEW.started_at IS DISTINCT FROM OLD.started_at THEN
      RAISE EXCEPTION 'Нельзя менять дату или владельца рабочего дня';
    END IF;
    IF OLD.finished_at IS NOT NULL AND NEW.finished_at IS DISTINCT FROM OLD.finished_at THEN
      RAISE EXCEPTION 'Рабочий день уже завершён';
    END IF;
    IF NEW.finished_at IS NOT NULL AND OLD.finished_at IS NULL THEN
      NEW.finished_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_work_days ON work_days;
CREATE TRIGGER guard_work_days
  BEFORE INSERT OR UPDATE ON work_days
  FOR EACH ROW EXECUTE FUNCTION trg_guard_work_days();

-- ── 6. Profiles: users cannot change their own role ─────────
-- profiles_update_own allowed an agent to set role = 'manager'.
CREATE OR REPLACE FUNCTION trg_guard_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') = 'authenticated'
     AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
    RAISE EXCEPTION 'Роль и статус пользователя меняет только администратор';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_role ON profiles;
CREATE TRIGGER guard_profile_role
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trg_guard_profile_role();

-- ── 7. Backfill: recompute stats for every agent ────────────
SELECT recalc_agent_stats(id) FROM profiles WHERE role = 'agent';
