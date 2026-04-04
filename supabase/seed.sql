-- ============================================================
-- seed.sql — test data for development
-- Run AFTER creating users in Supabase Auth dashboard:
--   manager@test.com  (password: Test1234!)
--   agent1@test.com   (password: Test1234!)
--   agent2@test.com   (password: Test1234!)
-- Then replace the UUIDs below with the actual auth.users IDs.
-- ============================================================

-- Replace these with real auth.users UUIDs after creating accounts
DO $$
DECLARE
  manager_id UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  agent1_id  UUID := 'aaaaaaaa-0000-0000-0000-000000000002';
  agent2_id  UUID := 'aaaaaaaa-0000-0000-0000-000000000003';

  prod1_id UUID := gen_random_uuid();
  prod2_id UUID := gen_random_uuid();
  prod3_id UUID := gen_random_uuid();

  route1_id UUID := gen_random_uuid();
  rp1_id    UUID := gen_random_uuid();
  rp2_id    UUID := gen_random_uuid();
BEGIN

-- Profiles
INSERT INTO profiles (id, full_name, role) VALUES
  (manager_id, 'Иван Руководитель', 'manager'),
  (agent1_id,  'Алексей Агент',     'agent'),
  (agent2_id,  'Мария Агент',       'agent');

-- Products
INSERT INTO products (id, name, sku, unit) VALUES
  (prod1_id, 'Вода 0.5л',     'WAT-05',  'pcs'),
  (prod2_id, 'Сок апельсин',  'JUI-ORA', 'pcs'),
  (prod3_id, 'Кофе растворимый 100г', 'COF-100', 'box');

-- Route for agent1 today
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status) VALUES
  (route1_id, agent1_id, manager_id, CURRENT_DATE, 'Маршрут на сегодня', 'active');

-- Route points
INSERT INTO route_points (id, route_id, name, address, contact_name, sort_order) VALUES
  (rp1_id, route1_id, 'Магазин "Рассвет"', 'ул. Ленина 12',   'Анна',  1),
  (rp2_id, route1_id, 'ТЦ "Меркурий"',     'пр. Мира 45, оф. 3', 'Борис', 2);

-- Products to sell at each point
INSERT INTO point_products (route_point_id, product_id, target_qty) VALUES
  (rp1_id, prod1_id, 10),
  (rp1_id, prod2_id, 5),
  (rp2_id, prod1_id, 20),
  (rp2_id, prod3_id, 3);

-- Tasks
INSERT INTO tasks (route_point_id, description, requires_photo) VALUES
  (rp1_id, 'Предложить воду и сок',          FALSE),
  (rp1_id, 'Сфотографировать полку',          TRUE),
  (rp2_id, 'Договориться о расширении полки', FALSE),
  (rp2_id, 'Фото выкладки после изменений',  TRUE);

END $$;
