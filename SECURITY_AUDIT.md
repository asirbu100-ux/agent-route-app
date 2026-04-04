# Аудит безопасности — Sales Agent Route Control System

**Дата:** 04.04.2026  
**Проект:** `agent-route-app` (Next.js + Supabase + Vercel)  
**Проверено:** 12 категорий

---

## Итоговая таблица

| # | Категория | Риск | Статус |
|---|-----------|------|--------|
| 1 | Секреты и ключи | КРИТИЧНО | ⚠️ Требует внимания |
| 2 | RLS политики (Row Level Security) | ОК | ✓ |
| 3 | Server Actions — аутентификация | ВЫСОКИЙ | ✅ Исправлено 04.04.2026 |
| 4 | Middleware — защита роутов | ОК | ✓ |
| 5 | Валидация входных данных (Zod) | СРЕДНИЙ | ⚠️ Улучшить |
| 6 | Storage политики | ОК | ✓ |
| 7 | SQL инъекции | ОК | ✓ |
| 8 | XSS уязвимости | ОК | ✓ |
| 9 | HTTP заголовки безопасности | НИЗКИЙ | ⚠️ Добавить |
| 10 | Публичные роуты | ОК | ✓ |
| 11 | Изоляция данных между агентами | ОК | ✓ |
| 12 | Photo upload — проверка владельца | СРЕДНИЙ | ⚠️ Улучшить |

---

## 1. Секреты и ключи — КРИТИЧНО ⚠️

**Файл:** `.env.local`

Содержит `SUPABASE_SERVICE_ROLE_KEY` — ключ с полным доступом к БД в обход RLS.

**Текущее состояние:**
- `.gitignore` содержит строку `.env*` — файл не попадёт в git ✓
- Git репозиторий ещё не создан — риск минимальный ✓

**Действия при создании репозитория:**
```bash
# Перед git init — убедиться:
cat .gitignore | grep env   # должна быть строка .env*

# После git init:
git status  # .env.local НЕ должен быть в списке
```

**Рекомендация:** Никогда не делать `git add .env.local`. При компрометации ключа — немедленно ротировать в Supabase Dashboard → Settings → API.

---

## 2. RLS политики — ОК ✓

**Файл:** `supabase/migrations/002_rls_policies.sql`

Все 9 таблиц защищены RLS. Проверка:

| Таблица | Агент | Менеджер | Статус |
|---------|-------|----------|--------|
| profiles | Чтение всех | Полный доступ | ✓ |
| products | Чтение всех | CRUD | ✓ |
| routes | Только свои | Все | ✓ |
| route_points | Только своего маршрута | Все | ✓ |
| tasks | Только своей точки | Все | ✓ |
| visits | Только свои | Все | ✓ |
| visit_products | Только свои | Все | ✓ |
| visit_photos | Только свои | Все | ✓ |

Агент A **не может** получить данные агента B — RLS проверяет `agent_id = auth.uid()`.

---

## 3. Server Actions — ВЫСОКИЙ ⚠️

**Файл:** `lib/actions/products.ts`

Функция `createProduct` не проверяет аутентификацию и роль:

```typescript
// ❌ Текущий код — нет проверки user и role
export async function createProduct(data: { name: string; sku?: string; unit: string }) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').insert({ ... })
}
```

RLS в БД это заблокирует, но Server Action должен проверять явно.

**Исправление для `lib/actions/products.ts`:**
```typescript
export async function createProduct(data: { name: string; sku?: string; unit: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') throw new Error('Только для менеджеров')

  const { error } = await supabase.from('products').insert({ ... })
}
```

**Файл:** `lib/actions/routes.ts` — `createRoute` проверяет user, но не проверяет роль.  
Добавить аналогичную проверку `role === 'manager'`.

---

## 4. Middleware — ОК ✓

**Файл:** `middleware.ts`

- Неавторизованные пользователи → `/auth/login` ✓
- Агенты заблокированы от `/dashboard`, `/agents`, `/routes`, `/products` ✓
- Менеджеры заблокированы от `/route` ✓
- Публичные пути: `/auth`, `/_next`, `/favicon.ico` ✓

---

## 5. Валидация входных данных — СРЕДНИЙ ⚠️

**Хорошо:**
- `lib/validations/visit.ts` — полная Zod валидация для `submitVisit` ✓

**Проблемы:**

`lib/actions/routes.ts` — `createRoute` не валидирует через Zod:
```typescript
// ❌ Нет проверки UUID формата, длины строк, формата даты
export interface CreateRouteInput {
  agent_id: string
  route_date: string
  title?: string
  points: RoutePointInput[]
}
```

`lib/actions/products.ts` — нет Zod валидации для входных данных.

**Рекомендация:** Добавить Zod схемы для всех server actions.

---

## 6. Storage политики — ОК ✓

**Файл:** `supabase/migrations/003_storage_policies.sql`

- Агенты загружают только в папку `{uid}/...`:
  ```sql
  (storage.foldername(name))[1] = auth.uid()::TEXT
  ```
- Менеджеры читают все фото ✓
- Агенты читают только свои фото ✓

---

## 7. SQL инъекции — ОК ✓

- Все запросы через Supabase JS client (параметризированные) ✓
- Raw SQL запросы отсутствуют ✓
- RPC функция `submit_visit` получает типизированные параметры ✓

---

## 8. XSS уязвимости — ОК ✓

- `dangerouslySetInnerHTML` не используется ✓
- Все пользовательские данные отображаются через React (автоэкранирование) ✓

---

## 9. HTTP заголовки безопасности — НИЗКИЙ ⚠️

**Файл:** `next.config.ts` — пуст, защитные заголовки не настроены.

**Рекомендация:**
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }]
  },
}
```

---

## 10. Публичные роуты — ОК ✓

Только `/auth/login` и `/auth/callback` доступны без авторизации.  
Все остальные страницы требуют активную сессию.

---

## 11. Изоляция данных — ОК ✓

- Агент A не видит маршруты агента B (RLS: `agent_id = auth.uid()`) ✓
- Агент не может создать маршрут (только менеджер) ✓
- Агент не может изменить чужой визит ✓
- Менеджер видит данные всех агентов (по назначению) ✓

---

## 12. Photo Upload — СРЕДНИЙ ⚠️

**Файл:** `lib/actions/photos.ts`

`getPhotoUploadUrl` — корректно проверяет принадлежность визита ✓

`confirmPhotoUpload` — не проверяет принадлежность визита перед insert:
```typescript
// ⚠️ Нет явной проверки ownership
const { error } = await supabase.from('visit_photos').insert({
  visit_id: visitId,  // не проверяется что это визит текущего агента
  ...
})
```
RLS компенсирует это, но рекомендуется добавить явную проверку.

`deletePhoto` — аналогичная ситуация, RLS защищает.

---

## План исправлений

### Приоритет 1 — Высокий (исправить в ближайшем спринте)
- [ ] Добавить проверку `user` и `role` в `lib/actions/products.ts`
- [ ] Добавить проверку `role === 'manager'` в `lib/actions/routes.ts`

### Приоритет 2 — Средний
- [ ] Добавить Zod схемы для `createRoute` и `createProduct`
- [ ] Добавить проверку ownership в `confirmPhotoUpload` и `deletePhoto`

### Приоритет 3 — Низкий (опционально)
- [ ] Добавить HTTP заголовки безопасности в `next.config.ts`

### При создании git репозитория
- [ ] Убедиться что `.env.local` не попал в git (`git status` перед первым коммитом)
