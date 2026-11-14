# Agent Route — приложение для торговых агентов

Мобильное веб-приложение (SFA) для торговых агентов и их менеджера.
Агент видит клиентов на сегодня, проводит визиты (фото, отметки по товарам, мерчендайзинг),
менеджер в реальном времени контролирует работу команды.

**Стек:** Next.js 16 (App Router, Server Actions) · React 19 · Supabase (Postgres, Auth, Storage, RLS) · Tailwind CSS 4 · деплой на Vercel.

> ⚠️ Next.js 16 отличается от привычных версий. Перед изменениями кода смотрите документацию в
> `node_modules/next/dist/docs/` (см. `AGENTS.md`).

---

## Возможности

### Агент (телефон) — `/tasks`
- **Маршрут по дням недели** — каждый клиент закреплён за днём (Пн–Пт), вкладки по дням.
- **Рабочий день** — «Начать день» / «Завершить день».
- **Визит к клиенту** (`/tasks/[clientId]`):
  - GPS-отметка и таймер визита;
  - фото «до» и «после» (фото обязательно для завершения визита);
  - по каждому товару из ассортимента клиента: *продано* / *не продано* + причина отказа;
  - приоритетные товары (`must`) и целевые количества;
  - чек-лист мерчендайзинга (выкладка, POSM, цены, доля полки).
- **Отчёт за день** (`/tasks/report`) — итоги, причины отказов, разбивка по клиентам.
- **Рейтинг** (`/tasks/leaderboard`) — очки, серии рабочих дней, бейджи.

### Менеджер (десктоп)
- `/dashboard` — обзор на сегодня по всем агентам.
- `/clients` — клиенты, закрепление за агентом и днём визита.
- `/products` — справочник товаров.

Роли разграничены и в `middleware.ts` (редиректы), и на уровне базы через RLS.

---

## Быстрый старт

### 1. Установка
```bash
npm install
```

### 2. Переменные окружения
Создайте `.env.local` в корне:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # только для сервера и скриптов, не публиковать
```
Ключи: Supabase Dashboard → Project Settings → API.

### 3. База данных
Выполните миграции из `supabase/migrations/` **строго по порядку** (SQL Editor или `supabase db push`):

| Файл | Что делает |
|---|---|
| `001_initial_schema.sql` | `profiles`, `products`, хук `custom_access_token_hook` (роль в JWT) |
| `002_rls_policies.sql` | функция `auth_role()` и базовые RLS-политики |
| `003_storage_policies.sql` | доступ к хранилищу фото |
| `004_simplified_schema.sql` | **удаляет старую схему маршрутов** и создаёт текущую: `clients`, `client_products`, `work_days`, `client_visits`, `visit_items`, бакет `visit-photos` |
| `005_merchandising_and_targets.sql` | `merch_items`, фото «до», приоритеты и цели по товарам |
| `006_gamification_and_tracking.sql` | GPS/таймер визита, `agent_stats` |

Чтобы роль попадала в JWT, включите хук: Authentication → Hooks → *Custom Access Token* → `public.custom_access_token_hook`.
Без него приложение тоже работает — роль читается из `profiles`.

### 4. Пользователи и данные
Вариант А — **импорт из Excel** (агенты, менеджер, товары, клиенты, ассортимент):
```bash
node scripts/setup-all.js
```
Скрипт читает `.env.local` и файл `Мои файла/Задачи ТА ло скю.xlsx`
(листы `Ассортимент ЛР` и по листу на агента: `Ciumacenco`, `Lomaca`, `Molceanov`, `Sasnitan`).
Колонки на листе агента: `A` — клиент, `B` — товар, `C/D` — категория/подкатегория, `E` — SKU, `G` — день визита (1–5).

> Скрипт создаёт учётки `*@agent.local` с паролями по умолчанию (`Agent123!`, `Manager123!`).
> **Смените пароли после первого запуска.**

Вариант Б — сгенерировать SQL без обращения к API:
```bash
node scripts/generate-seed.js > scripts/full-setup.sql
```

Вариант В — тестовые данные из `supabase/seed.sql` (UUID пользователей нужно подставить вручную, инструкция в начале файла).

### 5. Запуск
```bash
npm run dev     # http://localhost:3000
npm run build && npm start
```

---

## Структура проекта

```
app/
  (agent)/tasks/          экран агента: список дня, визит, отчёт, рейтинг
  (manager)/              dashboard, clients, products + общий layout с меню
  auth/                   вход и OAuth-callback
  page.tsx                редирект по роли
lib/
  actions/                Server Actions: workday.ts (день, визиты, фото, очки), clients.ts, products.ts
  supabase/               клиенты Supabase для сервера и браузера
  types/database.ts       типы таблиц
  utils/date.ts           «сегодня» и день недели в часовом поясе Europe/Chisinau
middleware.ts             проверка сессии и доступ по ролям
supabase/migrations/      SQL-схема
scripts/                  импорт данных из Excel
public/manifest.json      PWA-манифест
```

## Модель данных (текущая)

```
profiles (role: agent | manager)
  └─ clients (agent_id, visit_day 1–5)
       └─ client_products (product_id, priority, target_qty)
work_days (agent_id, work_date)
  └─ client_visits (client_id, фото, GPS, длительность, merch_score)
       ├─ visit_items  (client_product_id, is_sold, refusal_reason)
       └─ merch_items  (чек-лист мерчендайзинга)
agent_stats (очки, серии, счётчики визитов/продаж)
```

## Полезно знать

- **Часовой пояс.** Все «сегодня» считаются в `Europe/Chisinau`; в выходные приложение показывает ближайший рабочий день.
- **Очки.** 10 за завершённый день + бонус `5 × длина серии` при работе несколько дней подряд.
- **Фото** хранятся в приватном бакете `visit-photos`.
- **PWA.** В `manifest.json` указаны `icon-192.png` / `icon-512.png` — их нужно положить в `public/`, иначе установка на главный экран будет без иконки.
- **Деплой.** Vercel: импортируйте репозиторий и задайте те же три переменные окружения.
