export type Role = 'agent' | 'manager'

export const DAY_NAMES: Record<number, string> = {
  1: 'Понедельник',
  2: 'Вторник',
  3: 'Среда',
  4: 'Четверг',
  5: 'Пятница',
}

export const REFUSAL_REASONS = [
  'Нет на складе',
  'Дорого',
  'Не нужен',
  'Конкурент',
  'Нет места',
  'Другое',
] as const

// Coaching tips — auto-responses for each refusal
export const OBJECTION_TIPS: Record<string, string> = {
  'Нет на складе': 'Предложите оформить предзаказ. Спросите когда ожидается поставка.',
  'Дорого': 'Покажите маржу: "На этом товаре вы зарабатываете X% — это выше среднего".',
  'Не нужен': 'Спросите: "А ваши покупатели его спрашивают?" Покажите данные по соседним точкам.',
  'Конкурент': 'Предложите поставить рядом. "Покупатель сравнит и выберет — вы заработаете на обоих".',
  'Нет места': 'Предложите убрать самый неходовой товар. "Этот продаётся в 3 раза быстрее".',
  'Другое': 'Уточните причину и запишите в комментарий для менеджера.',
}

export interface Profile {
  id: string
  full_name: string
  role: Role
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  sku: string | null
  unit: string
  is_active: boolean
  created_at: string
}

export interface Client {
  id: string
  name: string
  agent_id: string
  visit_day: number
  address: string | null
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface ClientProduct {
  id: string
  client_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface WorkDay {
  id: string
  agent_id: string
  work_date: string
  started_at: string
  finished_at: string | null
}

export interface ClientVisit {
  id: string
  work_day_id: string
  client_id: string
  photo_path: string | null
  completed_at: string | null
  created_at: string
}

export interface VisitItem {
  id: string
  client_visit_id: string
  client_product_id: string
  is_sold: boolean
  refusal_reason: string | null
  created_at: string
}
